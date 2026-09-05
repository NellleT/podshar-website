'use client';

import { useEffect, useRef, useState } from 'react';
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
/** How many presses have their own retort before the counter takes over. */
const PRESS_LINES = 6;

/**
 * Ray bearings, in degrees, and the half-width of each wedge.
 *
 * Twelve rays at spacings that are close to even but never actually even — 26°,
 * 28°, 30°, 34° — so the ring reads as hand-drawn rather than machined. None of
 * them come within `HALF` of 0° or 360°, which keeps the conic gradient's wrap
 * point inside a gap where nothing is being drawn.
 */
const RAY_ANGLES = [10, 36, 62, 90, 120, 148, 174, 205, 232, 260, 292, 326];
const RAY_HALF = 6;

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
 * The conic gradient for the rays, built from RAY_ANGLES.
 *
 * Each ray is three stops — transparent, alpha, transparent — so it is a spoke
 * that fades in and out along the sweep instead of a wedge with sides. Written
 * out by hand this was a 40-stop string nobody could read or safely edit; as a
 * function the geometry is the array at the top of the file.
 */
function buildRays(alpha: number): string {
  const red = (a: number) => `rgb(var(--reactor) / ${fixed(a)})`;
  const stops = [`${red(0)} 0deg`];
  for (const angle of RAY_ANGLES) {
    stops.push(`${red(0)} ${angle - RAY_HALF}deg`);
    stops.push(`${red(alpha)} ${angle}deg`);
    stops.push(`${red(0)} ${angle + RAY_HALF}deg`);
  }
  stops.push(`${red(0)} 360deg`);
  return `conic-gradient(from 0deg, ${stops.join(', ')})`;
}

/**
 * The "ПХ" reactor.
 *
 * A warning light: a small solid red core, a tight halo, and twelve rays
 * reaching in toward it. The joke is that it looks consequential and does
 * nothing at all — press it and it just gets ruder.
 *
 * A pointer anywhere on the page drives two signals:
 *
 *   proximity   1 at the core, 0 at FALLOFF px away. Squared, so the reactor
 *               stays dim across the room and lights up late as the cursor
 *               closes in, instead of glowing faintly the entire time.
 *
 *   bearing     `Math.atan2` gives the exact angle to the cursor. It moves the
 *               halo's centre a clamped distance that way and slides the whole
 *               ray ring after it, so the light leans toward the pointer.
 *
 * The glow used to be a wide flood of red — two offset petals under a big soft
 * gradient — which filled the block and was simply loud. It is now mostly rays:
 * the fill is small and quiet, and the mask makes each ray brightest where it
 * meets the core and dissolves outward, so they read as reaching *in* to the
 * button rather than spraying out of it. Same trick as a real sun: what you
 * notice is the direction, not the area.
 *
 * The core and the label never move. Only the light does.
 *
 * Everything runs through motion values, so the gradients are rewritten on the
 * elements directly and React never re-renders during a mouse move. The press
 * counter is the one piece of real state, and it only changes on click.
 *
 * `prefers-reduced-motion` parks the aura at a fixed intensity, drops the idle
 * breath and the turn, and never attaches the listener.
 */
export function PHButton() {
  const t = useTranslations('home');
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [presses, setPresses] = useState(0);

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

  // Halo centre, in percent of the aura box. Clamped by MAX_LEAN, and damped at
  // distance so a far-off cursor does not drag a dim halo around.
  const bearing = useTransform<number, number>([dx, dy], ([x, y]) => Math.atan2(y, x));
  const lean = useTransform(intensity, (i) => MAX_LEAN * (0.4 + 0.6 * i));

  const gx = useTransform<number, string>([bearing, lean], ([b, l]) =>
    fixed(50 + Math.cos(b) * l)
  );
  const gy = useTransform<number, string>([bearing, lean], ([b, l]) =>
    fixed(50 + Math.sin(b) * l)
  );

  // The ray ring slides bodily toward the cursor — a small offset, in px, on top
  // of its own slow rotation. Shifting the layer is what makes the rays lean;
  // the conic gradient itself has no notion of a direction to favour.
  const rayShiftX = useTransform<number, number>([bearing, intensity], ([b, i]) =>
    Math.cos(b) * 14 * (0.3 + 0.7 * i)
  );
  const rayShiftY = useTransform<number, number>([bearing, intensity], ([b, i]) =>
    Math.sin(b) * 14 * (0.3 + 0.7 * i)
  );

  // Quiet numbers. The old fill peaked at 0.80 alpha across a 20rem circle,
  // which is a lot of red on a near-white page; the rays carry the effect now,
  // so the fill only has to bridge the gap between the core and them.
  const hot = useTransform(intensity, (i) => fixed(0.16 + 0.26 * i));
  const mid = useTransform(intensity, (i) => fixed(0.06 + 0.14 * i));
  const rayAlpha = useTransform(intensity, (i) => 0.13 + 0.3 * i);

  const aura = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgb(var(--reactor) / ${hot}) 0%, rgb(var(--reactor) / ${hot}) 18%, rgb(var(--reactor) / ${mid}) 34%, rgb(var(--reactor) / 0) 58%)`;
  const rays = useTransform(rayAlpha, buildRays);
  const auraScale = useTransform(intensity, [0, 1], [0.9, 1.08]);

  // The mask is what aims the rays. Opaque right where the core ends, already
  // halved by mid-radius, gone before the edge — so every ray is brightest at
  // the button and thins as it goes out, which the eye reads as pointing in.
  const rayMask =
    'radial-gradient(circle, transparent 17%, rgb(0 0 0 / 0.95) 25%, rgb(0 0 0 / 0.45) 48%, transparent 76%)';

  // Presses past the last written line fall back to a counted one.
  const caption =
    presses === 0
      ? t('enterCaption')
      : presses <= PRESS_LINES
        ? t(`press.${presses}`)
        : t('pressCount', { count: presses });

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 26rem of box around a 20rem aura. The headroom is the point: the glow
          has to reach zero well before anything can clip it.
          Both track the viewport on narrow screens, and they have to track it
          together: at 390px a fixed 20rem aura is already wider than the block
          it sits in, and the proximity scale then pushes it past that. */}
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

        {/* Rays. The outer span carries the slow turn, the inner one the lean
            toward the cursor — two transforms that would overwrite each other
            on a single element. */}
        <motion.span
          aria-hidden="true"
          style={{ x: rayShiftX, y: rayShiftY }}
          className="pointer-events-none absolute h-[min(20rem,70vw)] w-[min(20rem,70vw)]"
        >
          <span
            className={`block h-full w-full ${reduceMotion ? '' : 'animate-sun-turn'}`}
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
        </motion.span>

        {/* The core. Fixed dead centre, and the only red in the palette.
            Deliberately borderless: an outline here was drawing a hard ring at
            exactly the seam the gradient is trying to hide, and cutting the
            object back into two. */}
        <button
          type="button"
          onPointerEnter={() => hover.set(1)}
          onPointerLeave={() => hover.set(0)}
          onClick={() => setPresses((n) => n + 1)}
          aria-label={t('enterCaption')}
          className="relative grid h-28 w-28 cursor-pointer place-items-center rounded-full bg-reactor text-white transition-transform duration-150 active:scale-95"
        >
          <span className="text-2xl font-bold tracking-[0.08em]">{t('enter')}</span>
        </button>
      </div>

      {/* The caption is the whole payoff of pressing, so it announces itself. */}
      <span key={caption} className="ps-label animate-rise-in text-center">
        {caption}
      </span>
    </div>
  );
}
