'use client';

import { useEffect, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue
} from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

/** Number of rays around the core. 24 divides 360 evenly into 15° steps. */
const RAY_COUNT = 24;
/** Cursor distance in px at which the sun is fully dormant. */
const FALLOFF = 460;
/** Ray geometry, in px, measured from the core's edge outward. */
const RAY_MIN = 14;
const RAY_MAX = 52;
/** Half the core square's width, and the clear gap between core and rays. */
const CORE_HALF = 60;
const RAY_GAP = 12;

/**
 * Distance from the centre to the core square's edge along a given ray.
 *
 * A square's boundary is not a constant radius: it is `half / max(|sin|, |cos|)`,
 * which gives `half` on the cardinals and `half * √2` at the corners. Using one
 * fixed radius instead — as a circle would — buries the cardinal rays behind the
 * block while leaving the diagonals floating off in space.
 *
 * Rounded to two decimals, and deliberately so: React's server renderer and the
 * browser serialise a raw float differently ("-81.282px" against
 * "-81.28203230275511px"), which trips a hydration mismatch on every diagonal
 * ray. A fixed precision makes both sides emit the same string.
 */
function rayOffset(angleDeg: number): string {
  const r = (angleDeg * Math.PI) / 180;
  const edge = CORE_HALF / Math.max(Math.abs(Math.sin(r)), Math.abs(Math.cos(r)));
  return (edge + RAY_GAP).toFixed(2);
}

const RAYS = Array.from({ length: RAY_COUNT }, (_, i) => (i * 360) / RAY_COUNT);

/**
 * The "ПХ" sun.
 *
 * A pointer anywhere on the page drives two independent signals:
 *
 *   proximity   1 at the core, 0 at FALLOFF px away. Eased with a square so
 *               the sun stays calm across the room and wakes up sharply as the
 *               cursor closes in, rather than drifting the whole time.
 *
 *   direction   `Math.atan2` gives the exact bearing to the cursor. Each ray
 *               compares its own fixed angle against that bearing; alignment
 *               is `cos(Δ)`, which is 1 for the ray pointing straight at the
 *               cursor, 0 at a right angle and negative behind. Raised to a
 *               power, that becomes a tight lobe, so the sun visibly reaches
 *               toward the pointer instead of swelling uniformly.
 *
 * Both signals live in motion values, so the whole animation runs off React's
 * render path — 24 rays updating on every mouse move would otherwise mean 24
 * component re-renders per frame. A spring on the pointer position supplies the
 * weight; the rays themselves are derived synchronously from it.
 *
 * `prefers-reduced-motion` parks the sun at its resting state and detaches the
 * listener entirely.
 */
export function PHButton() {
  const t = useTranslations('home');
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Pointer offset from the core's centre, in px. Seeded one full falloff
  // away, so the sun loads dormant instead of blazing before the mouse has
  // moved — (0, 0) would read as a cursor sitting exactly on the core.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(-FALLOFF);
  // Springs give the sun mass, so it settles rather than snapping.
  const spring = { stiffness: 140, damping: 20, mass: 0.4 };
  const dx = useSpring(rawX, spring);
  const dy = useSpring(rawY, spring);

  useEffect(() => {
    if (reduceMotion) return;

    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      rawX.set(e.clientX - (r.left + r.width / 2));
      rawY.set(e.clientY - (r.top + r.height / 2));
    };

    // Pointer leaving the window returns the sun to rest.
    const onLeave = () => {
      rawX.set(0);
      rawY.set(-FALLOFF);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [rawX, rawY, reduceMotion]);

  // 0 at FALLOFF, 1 at the core. Squared for a late, sharp wake-up.
  const proximity = useTransform<number, number>([dx, dy], ([x, y]) => {
    const d = Math.hypot(x, y);
    const linear = Math.max(0, Math.min(1, 1 - d / FALLOFF));
    return linear * linear;
  });

  // Bearing to the cursor, in radians.
  const bearing = useTransform<number, number>([dx, dy], ([x, y]) => Math.atan2(y, x));

  // Intensity feeds the core's fill and the halo ring.
  const haloScale = useTransform(proximity, [0, 1], [0.94, 1.12]);
  const haloOpacity = useTransform(proximity, [0, 1], [0.18, 0.85]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        ref={ref}
        className="relative grid h-80 w-80 place-items-center"
      >
        {/* Halo — a flat outlined ring, scaled by proximity. No blur. */}
        <motion.span
          aria-hidden="true"
          style={{ scale: haloScale, opacity: haloOpacity }}
          className="absolute h-52 w-52 rounded-full border border-clay"
        />

        {/* Rays */}
        {RAYS.map((angle, i) => (
          <Ray
            key={angle}
            angle={angle}
            index={i}
            proximity={proximity}
            bearing={bearing}
          />
        ))}

        {/* Core — a hard square block, because the whole system is blocks. */}
        <Link
          href="/hub"
          aria-label={t('enterCaption')}
          className="group relative grid h-[7.5rem] w-[7.5rem] place-items-center border border-ink bg-canvas transition-colors duration-drape ease-drape hover:bg-ink"
        >
          <span className="text-3xl font-medium tracking-[0.08em] text-ink transition-colors duration-drape ease-drape group-hover:text-canvas">
            {t('enter')}
          </span>
        </Link>
      </div>

      <span className="ps-label">{t('enterCaption')}</span>
    </div>
  );
}

/**
 * One ray. Its angle is fixed; only length and opacity respond.
 *
 * The wrapper is a zero-height strip pinned to the container's centre with its
 * transform origin at the bottom, so `rotate` swings it about the core and the
 * following `translateY` pushes it out to the core's edge along its own axis.
 * The bar then grows outward from there.
 */
function Ray({
  angle,
  index,
  proximity,
  bearing
}: {
  angle: number;
  index: number;
  proximity: MotionValue<number>;
  bearing: MotionValue<number>;
}) {
  const rad = (angle * Math.PI) / 180;

  // `cos(Δ)` is 1 for the ray aimed at the cursor and negative behind it. The
  // 4th power narrows that into a lobe so the reach is directional, not a
  // uniform swell. Rays are drawn pointing up, hence the -90° offset.
  const alignment = useTransform(bearing, (b) => {
    const delta = rad - Math.PI / 2 - b;
    const lobe = Math.max(0, Math.cos(delta));
    return lobe * lobe * lobe * lobe;
  });

  // Every fourth ray is a long cardinal spoke, as on a compass rose.
  const isSpoke = index % 4 === 0;

  const height = useTransform<number, number>([proximity, alignment], ([p, a]) => {
    const base = RAY_MIN * (isSpoke ? 1.7 : 1);
    return base + (RAY_MAX - base) * p * (0.28 + 0.72 * a);
  });

  const opacity = useTransform<number, number>(
    [proximity, alignment],
    ([p, a]) => 0.26 + 0.68 * p * (0.35 + 0.65 * a)
  );

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute bottom-1/2 left-1/2 origin-bottom"
      style={{ transform: `rotate(${angle}deg) translateY(-${rayOffset(angle)}px)` }}
    >
      <motion.span
        style={{ height, opacity }}
        className={`absolute bottom-0 left-0 block -translate-x-1/2 bg-ink ${
          isSpoke ? 'w-[2px]' : 'w-px'
        }`}
      />
    </span>
  );
}
