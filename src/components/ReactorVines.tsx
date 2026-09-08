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
 *            sitting still. Without it the vines are a diagram. Kept low and
 *            slow on purpose: two fast sines at full amplitude read as the
 *            whole field rippling, which is busier than a light should be.
 *
 *   burst    the shove itself: a press pushes every vine outward, once.
 *
 *   sway     the vine's own momentum, and the reason the throw looks alive.
 *            It carries the random angular kick, and it is a *separate* value
 *            from the shove — slower to decay, and it swings a little past
 *            centre before settling. Driving the angle from `burst` meant a
 *            vine retraced its exact path back on the way in, in lockstep with
 *            all sixteen others, which is the one thing momentum never does.
 *            Now the wave passes through and leaves them swinging.
 *
 *            For the length of the throw the cursor stops existing: the grip
 *            releases, the curl flattens, and `facing` slides every vine to 1
 *            so the field expands evenly wherever the pointer is. The chase is
 *            the resting behaviour; the blast is not aimed at anything.
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
const LEN_MAX = 40;
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
/** How far a press pushes every vine out, in viewBox units. */
const BLAST = 11;
/**
 * The furthest a vine's *radial* growth may reach.
 *
 * The shockwave ring's bright front lands at ~83 units at full expansion, so
 * this keeps the blast inside its own pulse. It caps the free tip only — the
 * grip may still pull a tip past it toward the cursor, because that is the
 * chase, and the chase has no pulse to outrun.
 */
const TIP_MAX = 84;
/**
 * How far a vine may swing at full burst, in radians.
 *
 * Roughly 22 degrees, applied per vine against its own random kick rather than
 * measured off the cursor. Scattering on the index gave every press the same
 * shape; a fresh roll each time is what makes a throw look like momentum
 * instead of an animation replaying.
 */
const FLING = 0.38;

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
  t: number,
  burst: number,
  /** 1 while the throw ignores the pointer completely. Outlives `burst`. */
  release: number,
  /** Lagging angular momentum. Outlives `burst` and overshoots on the return. */
  sway: number,
  /** This vine's random swing for the current press, -1 to 1. */
  kick: number
): Shape {
  const base = (angleDeg * Math.PI) / 180;

  // Alignment is measured on the vine's resting bearing, so a vine that was
  // holding the cursor keeps its share of the length and brightness while it is
  // being thrown aside. Measuring it after the splay would make the outermost
  // vines dim exactly as they fly, which reads as them giving up rather than
  // being pushed.
  const align = Math.max(0, Math.cos(base - bearing));
  const lobe = align * align;

  // How much this vine behaves as though it were facing the cursor.
  //
  // At rest that is `lobe`, so the field has a front, vines behind stay stubs,
  // and the whole thing chases the pointer. `release` slides every vine to 1
  // regardless of where it points, which is what turns the throw into an even
  // circle. Length, weight and brightness all read this, so one value swings
  // the field between chasing and exploding.
  //
  // `release`, not `burst`. The shove is a spike and is over in 150ms, but the
  // throw is watched for a second — driving this off `burst` made the field
  // even for one frame at the peak and lopsided for the rest, which is exactly
  // what kept a press looking aimed at the mouse.
  const facing = lobe + (1 - lobe) * release;

  // Irrational-ish multiplier, so neighbouring vines never scatter in step.
  // The kick is a fresh random number per vine per press, so the swing has no
  // pattern to it. It rides `sway` rather than `burst`: the shove is over well
  // before the swinging is, which is what separates being hit from recovering.
  const a = base + sway * FLING * kick;
  const cos = Math.cos(a);
  const sin = Math.sin(a);

  // Two independent wobbles per vine, at rates that do not divide evenly, so
  // the field never falls into step with itself.
  // Slower rates and an uneven split, so the two sines never sum into a strong
  // beat. This is meant to read as breathing, not as a wave passing through.
  const drift = Math.sin(t * 0.26 + index * 1.7) * 0.62 + Math.sin(t * 0.15 + index * 0.9) * 0.38;

  const len =
    (LEN_MIN + (LEN_MAX - LEN_MIN) * (0.14 + 0.86 * facing)) * (0.7 + 0.3 * intensity) +
    drift * 1.5 +
    // The blast. Flat across every vine — no `facing` weighting here — so the
    // wave leaves the core as a circle rather than a bulge.
    // A vine thrown sideways does not travel as far out. Energy that went into
    // the swing is energy that did not go into the reach, so the ones fanning
    // hardest come up shortest — which is also what stops the throw reading as
    // the ring simply being scaled up.
    burst * BLAST * (1 - 0.34 * Math.abs(kick));

  // Where the vine would end if it just grew straight out, capped so the blast
  // never outruns the ring it travels with.
  const tipR = Math.min(ROOT + len, TIP_MAX);
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

  // The press opens the hand completely, and keeps it open for the whole
  // flight: while the wave is going out the vines must not still be reaching
  // for the pointer, or the explosion stays aimed at it however even the push
  // is. The hand closes again only once the swinging has settled.
  const grip = GRIP * lobe * (0.3 + 0.7 * intensity) * (1 - release);
  const tipX = freeX + (ringX - freeX) * grip;
  const tipY = freeY + (ringY - freeY) * grip;

  // `sin(bearing - a)` is the cursor's tangential direction from this vine: it
  // flips sign across the cursor, so vines on either side bend inward.
  const tangential = Math.sin(bearing - a);
  const side = tangential >= 0 ? 1 : -1;
  // Faded out by the burst for the same reason as the grip: a vine still
  // curving toward the cursor mid-throw reads as reluctance, not scatter.
  const bend = CURL * len * tangential * (0.3 + 0.7 * align) * (1 - release) + drift * 1.9;

  // First control point: out along the vine's own bearing, swung sideways. This
  // is the stem, and it keeps its own direction as it leaves the core.
  const c1R = ROOT + len * 0.42;
  const c1X = 100 + cos * c1R + -sin * bend * 0.7;
  const c1Y = 100 + sin * c1R + cos * bend * 0.7;

  // Second control point: off the tip, along the tangent of the ring. That
  // tangent is what makes the last stretch of the curve wrap the cursor instead
  // of arriving head-on at it.
  // `grip` already falls to zero at full burst, so the hook goes with it.
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
    // `facing` rather than `lobe`, so a press lights the whole ring instead of
    // leaving the vines behind the core dim while their neighbours go off.
    width: 1.5 + 3.4 * facing * (0.45 + 0.55 * intensity),
    alpha: 0.2 + 0.62 * facing * (0.4 + 0.6 * intensity) + 0.05 * intensity
  };
}

export function ReactorVines({
  bearing,
  intensity,
  distance,
  halfSize,
  burst,
  release,
  sway,
  seed,
  still
}: {
  bearing: MotionValue<number>;
  intensity: MotionValue<number>;
  /** Pointer distance from the centre, in px. */
  distance: MotionValue<number>;
  /** Half the container's width in px, for converting px to viewBox units. */
  halfSize: MotionValue<number>;
  /** 1 at the instant of a press, decaying to 0. This is the shove itself. */
  burst: MotionValue<number>;
  /** 1 while the throw ignores the pointer. Held flat for the whole flight. */
  release: MotionValue<number>;
  /** Angular momentum: outlives `burst`, and overshoots before settling. */
  sway: MotionValue<number>;
  /** Press counter. A change is the cue to roll fresh kicks for the throw. */
  seed: MotionValue<number>;
  still: boolean;
}) {
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const halos = useRef<(SVGPathElement | null)[]>([]);
  const start = useRef<number | null>(null);
  // One random swing per vine, re-rolled on each press.
  //
  // Zeroed to begin with, which is what keeps `Math.random()` out of the first
  // paint: the kick is always multiplied by `burst`, and `burst` is 0 until
  // something is pressed, so the server's resting shape and the client's first
  // frame are identical numbers whatever these hold.
  const kicks = useRef<number[]>(VINE_ANGLES.map(() => 0));
  const lastSeed = useRef(0);

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

    // A new press: roll every vine a fresh direction to be thrown in.
    const sd = seed.get();
    if (sd !== lastSeed.current) {
      lastSeed.current = sd;
      for (let k = 0; k < kicks.current.length; k++) kicks.current[k] = Math.random() * 2 - 1;
    }

    const b = bearing.get();
    const i = intensity.get();
    const half = halfSize.get() || 1;
    // px -> viewBox units, where 100 is half the container.
    const cursorR = (distance.get() / half) * 100;

    const bu = burst.get();
    const rl = release.get();
    const sw = sway.get();
    for (let k = 0; k < VINE_ANGLES.length; k++) {
      apply(k, vine(VINE_ANGLES[k], k, b, i, cursorR, t, bu, rl, sw, kicks.current[k]));
    }
  });

  // Reduced motion: draw the resting field once and never touch it again.
  useEffect(() => {
    if (!still) return;
    for (let k = 0; k < VINE_ANGLES.length; k++) {
      apply(k, vine(VINE_ANGLES[k], k, -Math.PI / 2, 0.16, REACH_CLAMP, 0, 0, 0, 0, 0));
    }
  }, [still]);

  // Server-rendered resting shapes. Same function, same rounding, so the
  // client's first frame overwrites them with identical numbers rather than
  // tripping hydration.
  const rest = VINE_ANGLES.map((angle, k) =>
    vine(angle, k, -Math.PI / 2, 0.16, REACH_CLAMP, 0, 0, 0, 0, 0)
  );

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 200"
      className="pointer-events-none absolute h-full w-full overflow-visible"
    >
      <g fill="none" stroke="rgb(var(--reactor))" strokeLinecap="round" style={{ filter: 'blur(4px)' }}>
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
      {/* Nearly sharp. At 1.3px the beams had no edge at all, and a shape with
          no edge cannot look like it is moving — the eye needs a boundary to
          track. Softened just enough to sit in the glow rather than cut it. */}
      <g fill="none" stroke="rgb(var(--reactor))" strokeLinecap="round" style={{ filter: 'blur(0.45px)' }}>
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
