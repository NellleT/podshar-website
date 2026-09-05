'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue
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
 * The rays, in three tiers.
 *
 * One tier of twelve evenly-lit rays under one mask gives every ray the same
 * length, and twelve equal spikes around a circle is a cog, not a sun. Splitting
 * them into long, medium and short — each with its own mask reach, its own blur
 * and its own rotation speed — means no two rays end at the same radius and the
 * three tiers drift out of phase forever. That drift is what stops the shape
 * from ever settling into a polygon.
 *
 * Bearings inside a tier are spaced unevenly on purpose, and none comes within
 * `RAY_HALF` of 0°/360°, which keeps the conic gradient's wrap point inside a
 * gap where nothing is being drawn.
 */
const RAY_TIERS = [
  {
    angles: [14, 121, 208, 297],
    half: 5,
    // Reach: opaque as it leaves the fill, gone by the outer edge.
    mask:
      'radial-gradient(circle, transparent 13%, rgb(0 0 0 / 0.5) 19%, rgb(0 0 0 / 0.95) 33%, rgb(0 0 0 / 0.5) 62%, rgb(0 0 0 / 0.16) 80%, transparent 96%)',
    blur: 6,
    // Long rays carry more of the alpha: they are the ones read as rays at all,
    // while the short tier is really just texture on the fill.
    gain: 1.3,
    spin: '71s',
    reverse: false
  },
  {
    angles: [47, 152, 239, 331],
    half: 6.5,
    mask:
      'radial-gradient(circle, transparent 13%, rgb(0 0 0 / 0.6) 20%, rgb(0 0 0 / 0.9) 31%, rgb(0 0 0 / 0.4) 52%, transparent 74%)',
    blur: 7,
    gain: 1,
    spin: '52s',
    reverse: true
  },
  {
    angles: [31, 78, 96, 178, 265, 312],
    half: 8,
    mask:
      'radial-gradient(circle, transparent 12%, rgb(0 0 0 / 0.7) 18%, rgb(0 0 0 / 0.8) 26%, rgb(0 0 0 / 0.3) 41%, transparent 58%)',
    blur: 9,
    gain: 0.75,
    spin: '96s',
    reverse: false
  }
] as const;

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
 * The angular profile of one ray, as fractions of RAY_HALF and of full alpha.
 *
 * Three stops a side, not one. A ray built from `0 -> a -> 0` is a triangle:
 * the alpha ramps linearly, so the eye reads two straight edges meeting at a
 * point and the whole ring looks cut from paper. These weights approximate a
 * raised cosine, which has no straight segment anywhere and no corner at the
 * tip — the shape a light actually makes.
 */
const RAY_PROFILE = [
  [1, 0],
  [0.72, 0.12],
  [0.42, 0.46],
  [0, 1]
] as const;

/**
 * The conic gradient for one tier of rays.
 *
 * Written out by hand this was a 40-stop string nobody could read or safely
 * edit; as a function the geometry is the tables at the top of the file.
 */
function buildRays(
  angles: readonly number[],
  half: number,
  alpha: number
): string {
  const red = (a: number) => `rgb(var(--reactor) / ${fixed(a)})`;
  const stops = [`${red(0)} 0deg`];
  for (const angle of angles) {
    // Leading flank, peak, trailing flank — the profile mirrored about `angle`.
    for (let i = RAY_PROFILE.length - 1; i >= 0; i--) {
      const [offset, weight] = RAY_PROFILE[i];
      stops.push(`${red(alpha * weight)} ${fixed(angle - offset * half)}deg`);
    }
    for (let i = 1; i < RAY_PROFILE.length; i++) {
      const [offset, weight] = RAY_PROFILE[i];
      stops.push(`${red(alpha * weight)} ${fixed(angle + offset * half)}deg`);
    }
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
  const mid = useTransform(intensity, (i) => fixed(0.07 + 0.16 * i));
  const far = useTransform(intensity, (i) => fixed(0.03 + 0.07 * i));
  const rayAlpha = useTransform(intensity, (i) => 0.13 + 0.3 * i);

  // Four stops so the fill has a long tail. The tail is the point: it has to
  // still be carrying colour out at 60-70% of the radius, because that is where
  // the rays live. When the fill died at 58% the rays began in bare space and
  // read as a separate ring hovering around the button.
  const aura = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgb(var(--reactor) / ${hot}) 0%, rgb(var(--reactor) / ${hot}) 18%, rgb(var(--reactor) / ${mid}) 36%, rgb(var(--reactor) / ${far}) 58%, rgb(var(--reactor) / 0) 84%)`;
  const auraScale = useTransform(intensity, [0, 1], [0.9, 1.08]);

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

        {/* Rays, in three tiers of different reach and speed. */}
        {RAY_TIERS.map((tier) => (
          <RayTier
            key={tier.spin}
            tier={tier}
            alpha={rayAlpha}
            shiftX={rayShiftX}
            shiftY={rayShiftY}
            still={Boolean(reduceMotion)}
          />
        ))}

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
          style={{
            // Lit from above rather than filled flat: the top is a touch
            // lighter, the bottom a touch deeper. Two percent of lightness, and
            // the difference between a sticker and a lamp.
            backgroundImage:
              'radial-gradient(circle at 50% 34%, rgb(232 96 90) 0%, rgb(var(--reactor)) 52%, rgb(196 44 39) 100%)',
            // The rim is where "jagged" lived: a solid circle against a soft
            // glow ends on one hard pixel. This spreads the last few pixels of
            // the core outward into the aura so the edge has nowhere to land.
            boxShadow: '0 0 22px 6px rgb(var(--reactor) / 0.34)'
          }}
          className="relative grid h-28 w-28 cursor-pointer place-items-center rounded-full text-white transition-transform duration-150 active:scale-95"
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

/**
 * One tier of rays: a conic gradient, masked to a reach and blurred.
 *
 * Three nested elements because three transforms have to compose and CSS only
 * gives an element one `transform`: the outer one leans toward the cursor, the
 * middle one turns, the inner one carries the paint.
 */
function RayTier({
  tier,
  alpha,
  shiftX,
  shiftY,
  still
}: {
  tier: (typeof RAY_TIERS)[number];
  alpha: MotionValue<number>;
  shiftX: MotionValue<number>;
  shiftY: MotionValue<number>;
  still: boolean;
}) {
  const image = useTransform(alpha, (a) =>
    buildRays(tier.angles, tier.half, a * tier.gain)
  );

  return (
    <motion.span
      aria-hidden="true"
      style={{ x: shiftX, y: shiftY }}
      className="pointer-events-none absolute h-[min(20rem,70vw)] w-[min(20rem,70vw)]"
    >
      <span
        className={`block h-full w-full ${still ? '' : 'animate-sun-turn'}`}
        style={
          still
            ? undefined
            : {
                animationDuration: tier.spin,
                animationDirection: tier.reverse ? 'reverse' : 'normal'
              }
        }
      >
        <motion.span
          style={{
            backgroundImage: image,
            maskImage: tier.mask,
            WebkitMaskImage: tier.mask,
            // A conic gradient is drawn by sampling angles, so at low alpha it
            // bands into visible facets that no number of extra stops fixes. A
            // small blur dissolves the facets and rounds the tips at the same
            // time. Each tier is one composited layer that only ever rotates,
            // so the browser blurs it once and reuses the raster.
            filter: `blur(${tier.blur}px)`,
            willChange: 'transform'
          }}
          className="block h-full w-full rounded-full"
        />
      </span>
    </motion.span>
  );
}
