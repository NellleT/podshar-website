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
import { ReactorVines } from './ReactorVines';

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
 * The light is two parts that barely talk to each other. The fill is a small
 * quiet halo that only has to bridge core and vines. The vines are the show:
 * SVG curves that grow toward the pointer and curl around it, drawn by
 * `ReactorVines`. They are deliberately not derived from the fill — a gradient
 * cannot bend, and bending is the entire idea.
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

  // Pointer distance in px, and half the container's width, which is what turns
  // px into the vines' viewBox units. The size is measured rather than assumed
  // because the container is `min(26rem, 92vw)` and so is not a constant.
  const distance = useTransform<number, number>([dx, dy], ([x, y]) => Math.hypot(x, y));
  const halfSize = useMotionValue(208);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => halfSize.set(el.getBoundingClientRect().width / 2 || 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [halfSize]);

  // Quiet numbers. The old fill peaked at 0.80 alpha across a 20rem circle,
  // which is a lot of red on a near-white page; the rays carry the effect now,
  // so the fill only has to bridge the gap between the core and them.
  const hot = useTransform(intensity, (i) => fixed(0.14 + 0.2 * i));
  const mid = useTransform(intensity, (i) => fixed(0.06 + 0.12 * i));
  const far = useTransform(intensity, (i) => fixed(0.025 + 0.05 * i));

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

        {/* The vines. Sized to the whole box, not the aura: they need room to
            reach past the glow toward wherever the pointer is. */}
        <ReactorVines
          bearing={bearing}
          intensity={intensity}
          distance={distance}
          halfSize={halfSize}
          still={Boolean(reduceMotion)}
        />

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
