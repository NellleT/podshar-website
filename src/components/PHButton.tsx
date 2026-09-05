'use client';

import { useEffect, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  useReducedMotion
} from 'framer-motion';
import { useTranslations } from 'next-intl';

/** Cursor distance in px at which the reactor is fully at rest. */
const FALLOFF = 460;
/**
 * How far the glow may lean toward the cursor, in percentage points of the
 * aura box. The aura's radius is 50% of that box, so 9pt is 18% of the radius —
 * the top of the range the brief allows. Past that the halo visibly detaches
 * from the core and the object stops reading as one thing.
 */
const MAX_LEAN = 9;
/** Where the aura sits when the pointer is absent (touch, or reduced motion). */
const RESTING = 0.16;

/**
 * Two decimals, always.
 *
 * These numbers are interpolated into a gradient string that is rendered on the
 * server and again in the browser. A raw float serialises differently on each
 * side ("46.400000000000006" against "46.4"), which is a hydration mismatch on
 * every paint. Fixed precision makes both sides emit the same characters.
 */
const fixed = (n: number) => n.toFixed(2);

/**
 * The "ПХ" reactor.
 *
 * A warning light: a small solid red core with a soft halo around it, breathing
 * slowly so it reads as armed rather than decorative. The joke is that it looks
 * consequential and does nothing at all.
 *
 * A pointer anywhere on the page drives two signals:
 *
 *   proximity   1 at the core, 0 at FALLOFF px away. Squared, so the reactor
 *               stays dim across the room and lights up late as the cursor
 *               closes in, instead of glowing faintly the entire time.
 *
 *   bearing     `Math.atan2` gives the exact angle to the cursor. It moves the
 *               radial gradient's centre a clamped distance that way, so the
 *               glow leans toward the pointer rather than swelling evenly.
 *
 * The glow is three layers, because one clean radial gradient read as a printed
 * circle — you could see exactly where it stopped:
 *
 *   petals   two offset elliptical gradients behind the main one, each leaning
 *            its own way. Their union is lopsided, so the halo has no single
 *            silhouette to trace.
 *   rays     a conic gradient with uneven sectors, masked into a ring and
 *            turning very slowly. A sun has rays; this has the memory of them,
 *            which is what keeps it off a compass rose.
 *   edge     every stop reaches zero alpha inside a box with room to spare, so
 *            nothing ever meets a boundary while it is still visible.
 *
 * The core and the label never move. Only the light does — that asymmetry is
 * what sells it as something reacting to you rather than an animation on loop.
 *
 * Everything runs through motion values and `useMotionTemplate`, so the
 * gradients are rewritten on the elements directly and React never re-renders
 * during a mouse move.
 *
 * `prefers-reduced-motion` parks the aura at a fixed intensity, drops the idle
 * breath and the turn, and never attaches the listener.
 */
export function PHButton() {
  const t = useTranslations('home');
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Pointer offset from the core's centre, in px. Seeded a full falloff away so
  // the reactor loads dormant — (0, 0) would read as a cursor sitting on it.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(-FALLOFF);
  // A spring gives the light some lag, so it swells and leans rather than
  // snapping frame to frame.
  const dx = useSpring(rawX, { stiffness: 120, damping: 22, mass: 0.5 });
  const dy = useSpring(rawY, { stiffness: 120, damping: 22, mass: 0.5 });
  // Hover lives in a motion value, not state: the core must not re-render.
  const hover = useSpring(0, { stiffness: 200, damping: 26 });

  useEffect(() => {
    if (reduceMotion) return;

    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      rawX.set(e.clientX - (r.left + r.width / 2));
      rawY.set(e.clientY - (r.top + r.height / 2));
    };

    // Pointer off the window returns the reactor to rest.
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

  // 0 at FALLOFF, 1 at the core, squared for a late wake-up. Hover pins it near
  // the top of the range, so being on the button always looks like the most
  // dangerous place to be.
  const intensity = useTransform<number, number>([dx, dy, hover], ([x, y, h]) => {
    if (reduceMotion) return RESTING;
    const linear = Math.max(0, Math.min(1, 1 - Math.hypot(x, y) / FALLOFF));
    return Math.max(linear * linear, h * 0.92);
  });

  // Gradient centre, in percent of the aura box. Clamped by MAX_LEAN, and
  // damped at distance so a far-off cursor does not drag a dim halo around.
  const bearing = useTransform<number, number>([dx, dy], ([x, y]) => Math.atan2(y, x));
  const lean = useTransform(intensity, (i) => MAX_LEAN * (0.4 + 0.6 * i));

  const gx = useTransform<number, string>([bearing, lean], ([b, l]) =>
    fixed(50 + Math.cos(b) * l)
  );
  const gy = useTransform<number, string>([bearing, lean], ([b, l]) =>
    fixed(50 + Math.sin(b) * l)
  );

  // The petals lean off the main bearing by a fixed angle each and travel less
  // far, so the halo reshapes as the cursor moves instead of sliding around
  // rigidly. Their offsets from centre (46/47 and 55/54) are what make the
  // resting shape lopsided before anything has moved at all.
  const p1x = useTransform<number, string>([bearing, lean], ([b, l]) =>
    fixed(46 + Math.cos(b + 0.9) * l * 0.7)
  );
  const p1y = useTransform<number, string>([bearing, lean], ([b, l]) =>
    fixed(47 + Math.sin(b + 0.9) * l * 0.7)
  );
  const p2x = useTransform<number, string>([bearing, lean], ([b, l]) =>
    fixed(55 + Math.cos(b - 1.3) * l * 0.5)
  );
  const p2y = useTransform<number, string>([bearing, lean], ([b, l]) =>
    fixed(54 + Math.sin(b - 1.3) * l * 0.5)
  );

  // The numbers are not arbitrary. The core is 112px across inside a 320px
  // aura, so its edge lands at 17.5% of that box: `hot` is held flat out to
  // 18%, which puts the densest red exactly where the solid circle ends. The
  // glow therefore leaves the core at full strength and decays from there, and
  // the two read as one object rather than a disc inside a separate halo.
  //
  // Below ~457px of viewport the aura shrinks with the screen while the core
  // stays 112px, so that seam creeps outward — by then the whole object is
  // small enough that the join is not what anyone is looking at.
  //
  // Alpha carries the whole effect — no blur filter, which would cost a repaint
  // of the layer on every frame.
  const hot = useTransform(intensity, (i) => fixed(0.34 + 0.46 * i));
  const mid = useTransform(intensity, (i) => fixed(0.13 + 0.32 * i));
  const petal = useTransform(intensity, (i) => fixed(0.07 + 0.2 * i));
  const rayAlpha = useTransform(intensity, (i) => fixed(0.05 + 0.17 * i));

  // Three gradients in one background, painted front to back: the dense centre
  // is listed first so it stays on top of the two petals.
  const aura = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgb(var(--reactor) / ${hot}) 0%, rgb(var(--reactor) / ${hot}) 18%, rgb(var(--reactor) / ${mid}) 38%, rgb(var(--reactor) / 0) 74%), radial-gradient(ellipse 58% 66% at ${p1x}% ${p1y}%, rgb(var(--reactor) / ${petal}) 0%, rgb(var(--reactor) / 0) 100%), radial-gradient(ellipse 70% 52% at ${p2x}% ${p2y}%, rgb(var(--reactor) / ${petal}) 0%, rgb(var(--reactor) / 0) 100%)`;

  // Five wedges at widths that do not divide 360 evenly, so no two neighbours
  // match and the ring never resolves into a pattern. Every wedge fades through
  // transparent rather than ending on a hard stop, so there are no spokes with
  // sides — only an unevenness in the light.
  //
  // Both ends of the sweep are pinned to zero alpha. A conic gradient wraps 360°
  // straight back onto 0°, so anything else leaves a seam there: a dead-straight
  // radial line, which is precisely the edge this layer exists to avoid.
  const rays = useMotionTemplate`conic-gradient(from 0deg, rgb(var(--reactor) / 0) 0deg, rgb(var(--reactor) / ${rayAlpha}) 34deg, rgb(var(--reactor) / 0) 74deg, rgb(var(--reactor) / ${rayAlpha}) 106deg, rgb(var(--reactor) / 0) 152deg, rgb(var(--reactor) / ${rayAlpha}) 187deg, rgb(var(--reactor) / 0) 219deg, rgb(var(--reactor) / ${rayAlpha}) 251deg, rgb(var(--reactor) / 0) 292deg, rgb(var(--reactor) / ${rayAlpha}) 322deg, rgb(var(--reactor) / 0) 360deg)`;

  const auraScale = useTransform(intensity, [0, 1], [0.88, 1.14]);

  // One mask for the ray ring: transparent over the core, opaque through the
  // middle, transparent again well before the element's edge.
  const rayMask = 'radial-gradient(circle, transparent 16%, black 44%, transparent 82%)';

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 26rem of box around a 20rem aura. The headroom is the point: the glow
          has to reach zero well before anything can clip it.
          Both track the viewport on narrow screens, and they have to track it
          together: at 390px a fixed 20rem aura is already wider than the block
          it sits in, and the proximity scale then pushes it 14% past that. */}
      <div
        ref={ref}
        className="relative grid h-[min(26rem,92vw)] w-[min(26rem,92vw)] place-items-center"
      >
        {/* Idle breath. A separate element from the proximity scale below, so
            the two transforms compose instead of overwriting each other. */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute grid h-[min(20rem,70vw)] w-[min(20rem,70vw)] place-items-center ${
            reduceMotion ? '' : 'animate-breathe'
          }`}
        >
          <motion.span
            style={{ backgroundImage: aura, scale: auraScale }}
            className="block h-full w-full rounded-full"
          />
        </span>

        {/* Rays. Masked into a ring, so they dissolve at both ends: they never
            touch the core, and they never reach an edge to be cut off at. */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute h-[min(20rem,70vw)] w-[min(20rem,70vw)] ${
            reduceMotion ? '' : 'animate-sun-turn'
          }`}
        >
          <motion.span
            style={{
              backgroundImage: rays,
              maskImage: rayMask,
              WebkitMaskImage: rayMask
            }}
            className="block h-full w-full rounded-full"
          />
        </span>

        {/* The core. Fixed dead centre, and the only red in the palette.
            Deliberately borderless: an outline here was drawing a hard ring at
            exactly the seam the gradient is trying to hide, and cutting the
            object back into two. */}
        <button
          type="button"
          onPointerEnter={() => hover.set(1)}
          onPointerLeave={() => hover.set(0)}
          onClick={() => console.log('hub coming soon')}
          aria-label={t('enterCaption')}
          className="relative grid h-28 w-28 cursor-pointer place-items-center rounded-full bg-reactor text-white"
        >
          <span className="text-2xl font-bold tracking-[0.08em]">{t('enter')}</span>
        </button>
      </div>

      <span className="ps-label">{t('enterCaption')}</span>
    </div>
  );
}
