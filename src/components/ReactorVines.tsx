'use client';

import { useEffect, useRef } from 'react';
import { useAnimationFrame, type MotionValue } from 'framer-motion';

/**
 * The vines around the reactor.
 *
 * Conic gradients got us rays, but a conic gradient cannot bend and cannot give
 * one ray a different length from its neighbour: it paints the same profile at
 * every radius. Vines that reach for the cursor and close around it need real
 * curves, so this is SVG — one cubic Bézier per vine, rewritten every frame.
 *
 * Geometry, in a 200x200 viewBox centred on (100, 100):
 *
 *   reach    a vine aimed at the cursor grows; one aimed away stays a stub.
 *            `align` is cos of the angle between the vine and the cursor, so it
 *            is 1 dead ahead and 0 at ninety degrees.
 *
 *   grip     the tip is then pulled a fraction of the way to the cursor itself.
 *            Partially, never all the way — vines that all land on one point
 *            look like a collapsing umbrella, not a hand closing.
 *
 *   curl     the control point swings sideways by `sin(bearing - angle)`, which
 *            is positive on one side of the cursor and negative on the other.
 *            That single sign flip is the whole trick: every vine bends toward
 *            the cursor, so the ones flanking it curve inward and the shape
 *            reads as closing around the pointer rather than pointing at it.
 *
 *   drift    a slow per-vine wobble, so the field is alive with the mouse
 *            sitting still. Without it the vines are a diagram.
 *
 * Nothing here touches React state. One `useAnimationFrame` reads the motion
 * values, computes 17 paths and writes them straight onto the DOM nodes; a
 * re-render per frame with 17 children would be an order of magnitude dearer.
 *
 * The `d` rendered on the server is the same resting shape the client computes
 * on its first frame — same inputs, same `toFixed(2)` — so hydration is quiet.
 */

/** Bearings, deliberately uneven, so the ring is never a wheel. */
const VINE_ANGLES = [
  4, 27, 48, 66, 89, 108, 131, 152, 168, 191, 214, 232, 255, 273, 296, 318, 341
];

/** Where a vine starts: just outside the core, in viewBox units. */
const ROOT = 29;
/** Stub length, and the most a vine can grow beyond the root. */
const LEN_MIN = 11;
const LEN_MAX = 78;
/** How far the tip may be dragged onto the ring around the cursor, 0-1. */
const GRIP = 0.88;
/** Radius of that ring, in viewBox units. The vines close at this distance. */
const RING = 12;
/** Sideways swing of the first control point, as a fraction of vine length. */
const CURL = 0.5;
/** How hard the tip hooks around the cursor, as a fraction of vine length. */
const HOOK = 0.42;
/** Cursor distance, in viewBox units, past which reaching stops helping. */
const REACH_CLAMP = 96;

const fixed = (n: number) => n.toFixed(2);

type Shape = { d: string; width: number; alpha: number };

/**
 * One vine, as a path plus the stroke settings that go with it.
 *
 * `t` is seconds since mount and only feeds the drift; everything else comes
 * from the pointer.
 */
function vine(
  angleDeg: number,
  index: number,
  bearing: number,
  intensity: number,
  cursorR: number,
  t: number
): Shape {
  const a = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);

  // 1 when this vine points at the cursor, 0 at a right angle, 0 behind.
  const align = Math.max(0, Math.cos(a - bearing));
  const lobe = align * align;

  // Two independent wobbles per vine, at rates that do not divide evenly, so
  // the field never falls into step with itself.
  const drift = Math.sin(t * 0.7 + index * 1.7) * 0.5 + Math.sin(t * 0.31 + index * 0.9) * 0.5;

  const len =
    (LEN_MIN + (LEN_MAX - LEN_MIN) * (0.14 + 0.86 * lobe)) * (0.7 + 0.3 * intensity) +
    drift * 2.6;

  // Where the vine would end if it just grew straight out.
  const tipR = ROOT + len;
  const freeX = 100 + cos * tipR;
  const freeY = 100 + sin * tipR;

  // The cursor, clamped: a pointer across the page would otherwise stretch
  // every vine into a straight line aimed off-screen.
  const target = Math.min(cursorR, REACH_CLAMP);
  const targetX = 100 + Math.cos(bearing) * target;
  const targetY = 100 + Math.sin(bearing) * target;

  // Land on a ring around the cursor rather than on the cursor. Vines that all
  // meet at one point are a closing umbrella; vines that stop short, spread
  // around a circle, are fingers closing — which is the thing being asked for.
  // Each vine takes the point on that ring nearest its own free tip.
  const ux = freeX - targetX;
  const uy = freeY - targetY;
  const un = Math.hypot(ux, uy) || 1;
  const ringX = targetX + (ux / un) * RING;
  const ringY = targetY + (uy / un) * RING;

  const grip = GRIP * lobe * (0.3 + 0.7 * intensity);
  const tipX = freeX + (ringX - freeX) * grip;
  const tipY = freeY + (ringY - freeY) * grip;

  // `sin(bearing - a)` is the cursor's tangential direction from this vine: it
  // flips sign across the cursor, so vines on either side bend inward.
  const tangential = Math.sin(bearing - a);
  const side = tangential >= 0 ? 1 : -1;
  const bend = CURL * len * tangential * (0.3 + 0.7 * align) + drift * 3.4;

  // First control point: out along the vine's own bearing, swung sideways. This
  // is the stem, and it keeps its own direction as it leaves the core.
  const c1R = ROOT + len * 0.42;
  const c1X = 100 + cos * c1R + -sin * bend * 0.7;
  const c1Y = 100 + sin * c1R + cos * bend * 0.7;

  // Second control point: off the tip, along the tangent of the ring. That
  // tangent is what makes the last stretch of the curve wrap the cursor instead
  // of arriving head-on at it.
  const hook = HOOK * len * lobe * grip * side;
  const c2X = tipX + (uy / un) * hook + (ux / un) * len * 0.12;
  const c2Y = tipY - (ux / un) * hook + (uy / un) * len * 0.12;

  const rootX = 100 + cos * ROOT;
  const rootY = 100 + sin * ROOT;

  return {
    d: `M${fixed(rootX)} ${fixed(rootY)}C${fixed(c1X)} ${fixed(c1Y)} ${fixed(c2X)} ${fixed(c2Y)} ${fixed(tipX)} ${fixed(tipY)}`,
    // Thicker and brighter the more it faces the cursor: the field has a front.
    // The floor is deliberately high — the vines are supposed to be legible on
    // their own, not a texture that only shows up when the fill is bright.
    width: 1.5 + 3.4 * lobe * (0.45 + 0.55 * intensity),
    alpha: 0.2 + 0.62 * lobe * (0.4 + 0.6 * intensity) + 0.05 * intensity
  };
}

export function ReactorVines({
  bearing,
  intensity,
  distance,
  halfSize,
  still
}: {
  bearing: MotionValue<number>;
  intensity: MotionValue<number>;
  /** Pointer distance from the centre, in px. */
  distance: MotionValue<number>;
  /** Half the container's width in px, for converting px to viewBox units. */
  halfSize: MotionValue<number>;
  still: boolean;
}) {
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const halos = useRef<(SVGPathElement | null)[]>([]);
  const start = useRef<number | null>(null);

  // Each vine is drawn twice: a wide, faint, heavily blurred copy underneath,
  // and the crisp line on top. The under-copy is what gives the vines body and
  // ties their roots into the fill — a single constant-width stroke reads as
  // wire, and wire is not what a vine looks like.
  const apply = (i: number, s: Shape) => {
    const el = paths.current[i];
    if (el) {
      el.setAttribute('d', s.d);
      el.setAttribute('stroke-width', fixed(s.width));
      el.setAttribute('stroke-opacity', fixed(s.alpha));
    }
    const halo = halos.current[i];
    if (halo) {
      halo.setAttribute('d', s.d);
      halo.setAttribute('stroke-width', fixed(s.width * 2.8));
      halo.setAttribute('stroke-opacity', fixed(s.alpha * 0.3));
    }
  };

  useAnimationFrame((now) => {
    if (still) return;
    if (start.current === null) start.current = now;
    const t = (now - start.current) / 1000;

    const b = bearing.get();
    const i = intensity.get();
    const half = halfSize.get() || 1;
    // px -> viewBox units, where 100 is half the container.
    const cursorR = (distance.get() / half) * 100;

    for (let k = 0; k < VINE_ANGLES.length; k++) {
      apply(k, vine(VINE_ANGLES[k], k, b, i, cursorR, t));
    }
  });

  // Reduced motion: draw the resting field once and never touch it again.
  useEffect(() => {
    if (!still) return;
    for (let k = 0; k < VINE_ANGLES.length; k++) {
      apply(k, vine(VINE_ANGLES[k], k, -Math.PI / 2, 0.16, REACH_CLAMP, 0));
    }
  }, [still]);

  // Server-rendered resting shapes. Same function, same rounding, so the
  // client's first frame overwrites them with identical numbers rather than
  // tripping hydration.
  const rest = VINE_ANGLES.map((angle, k) => vine(angle, k, -Math.PI / 2, 0.16, REACH_CLAMP, 0));

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 200"
      className="pointer-events-none absolute h-full w-full overflow-visible"
    >
      <g fill="none" stroke="rgb(var(--reactor))" strokeLinecap="round" style={{ filter: 'blur(5px)' }}>
        {VINE_ANGLES.map((angle, k) => (
          <path
            key={angle}
            ref={(el) => {
              halos.current[k] = el;
            }}
            d={rest[k].d}
            strokeOpacity={fixed(rest[k].alpha * 0.3)}
            strokeWidth={fixed(rest[k].width * 2.8)}
          />
        ))}
      </g>
      <g fill="none" stroke="rgb(var(--reactor))" strokeLinecap="round" style={{ filter: 'blur(1.3px)' }}>
        {VINE_ANGLES.map((angle, k) => (
          <path
            key={angle}
            ref={(el) => {
              paths.current[k] = el;
            }}
            d={rest[k].d}
            strokeOpacity={fixed(rest[k].alpha)}
            strokeWidth={fixed(rest[k].width)}
          />
        ))}
      </g>
    </svg>
  );
}
