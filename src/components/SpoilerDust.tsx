'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * The dust over a sealed block.
 *
 * A scatter of specks rather than the even dot grid this replaced. A grid is
 * legible as a grid — the eye finds the rows immediately and the block reads as
 * a texture swatch. Scattered sizes and three shapes read as something covering
 * the text, which is the job.
 *
 * On a canvas, not as elements. Two hundred divs with a transform written every
 * frame is two hundred style recalculations a frame; one canvas is one draw.
 * The reactor's vines take the same view of the same problem.
 *
 * The specks drift on their own and shy away from the pointer, then drift back.
 * Each one keeps a home and never travels far from it: a field that scatters to
 * the edges empties the middle and stops covering anything, which is the one
 * thing it is here to do.
 */

/** How far the pointer's influence reaches, in CSS pixels. */
const REACH = 84;
/** The furthest a speck is pushed from home, in CSS pixels. */
const SHOVE = 18;
/** How quickly a speck catches up to where it is being pushed, per frame. */
const EASE = 0.12;

type Speck = {
  homeX: number;
  homeY: number;
  size: number;
  alpha: number;
  /** 0 circle, 1 square, 2 diamond. Circles dominate; the rest break the rhythm. */
  shape: 0 | 1 | 2;
  phase: number;
  driftX: number;
  driftY: number;
  amp: number;
  /** Current offset from the drifting position, eased toward the shove. */
  offX: number;
  offY: number;
};

function makeField(width: number, height: number): Speck[] {
  // Density, not a fixed count: the block is one width on a phone and another
  // on a desktop, and a fixed count leaves one of them bald.
  // Fewer than before, because each one is bigger. Held at the old density
  // the field closed into a solid grey mass and stopped reading as specks.
  const count = Math.min(420, Math.max(70, Math.round((width * height) / 540)));
  const specks: Speck[] = [];

  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    specks.push({
      homeX: Math.random() * width,
      homeY: Math.random() * height,
      // Big enough to be recognised as shapes. The first pass was under two
      // pixels across, at which size a square, a diamond and a circle are the
      // same thing — a dot — and the whole point of having three was lost.
      size: roll > 0.93 ? 3.4 + Math.random() * 2.2 : 1.3 + Math.random() * 1.9,
      alpha: 0.2 + Math.random() * 0.58,
      shape: roll > 0.9 ? 1 : roll > 0.82 ? 2 : 0,
      phase: Math.random() * Math.PI * 2,
      // Roughly four times the old rate, over twice the distance. The first
      // pass drifted so slowly that a still screenshot and the live block were
      // indistinguishable — motion nobody can see is motion that is not there.
      driftX: 0.55 + Math.random() * 1.15,
      driftY: 0.48 + Math.random() * 1.0,
      amp: 3 + Math.random() * 5.5,
      offX: 0,
      offY: 0
    });
  }

  return specks;
}

export function SpoilerDust({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host || !active) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let specks: Speck[] = [];
    let width = 0;
    let height = 0;
    let ink = '31 31 31';
    let frame = 0;
    // Null means "no pointer near this block", which is different from the
    // pointer being at 0,0 — the corner would otherwise repel permanently.
    let pointer: { x: number; y: number } | null = null;

    const measure = () => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Read once per resize rather than per frame: `getComputedStyle` forces
      // style resolution, and sixty of those a second for a colour that changes
      // only with the theme is a poor trade.
      ink =
        getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() ||
        '31 31 31';
      specks = makeField(width, height);
      return true;
    };

    const draw = (time: number) => {
      const t = time / 1000;
      ctx.clearRect(0, 0, width, height);

      for (const s of specks) {
        const baseX = s.homeX + Math.sin(t * s.driftX + s.phase) * s.amp;
        const baseY = s.homeY + Math.cos(t * s.driftY + s.phase * 1.3) * s.amp;

        let wantX = 0;
        let wantY = 0;
        if (pointer) {
          const dx = baseX - pointer.x;
          const dy = baseY - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < REACH) {
            // Squared falloff: the specks right under the cursor move, the ones
            // at the edge of its reach barely stir. Linear made the whole field
            // slide about like a sheet.
            const force = (1 - dist / REACH) ** 2 * SHOVE;
            const safe = dist || 0.001;
            wantX = (dx / safe) * force;
            wantY = (dy / safe) * force;
          }
        }

        // Easing both ways: toward the shove while the pointer is near, and
        // back to zero when it leaves. The return is the same motion played
        // slowly, which is what makes them look like they are settling rather
        // than snapping home.
        s.offX += (wantX - s.offX) * EASE;
        s.offY += (wantY - s.offY) * EASE;

        const x = baseX + s.offX;
        const y = baseY + s.offY;

        ctx.fillStyle = `rgb(${ink} / ${s.alpha})`;
        if (s.shape === 0) {
          ctx.beginPath();
          ctx.arc(x, y, s.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (s.shape === 1) {
          ctx.fillRect(x - s.size, y - s.size, s.size * 2, s.size * 2);
        } else {
          ctx.beginPath();
          ctx.moveTo(x, y - s.size * 1.3);
          ctx.lineTo(x + s.size * 1.3, y);
          ctx.lineTo(x, y + s.size * 1.3);
          ctx.lineTo(x - s.size * 1.3, y);
          ctx.closePath();
          ctx.fill();
        }
      }
    };

    if (!measure()) return;

    if (reduceMotion) {
      // One still frame. The block is still covered, which is the part that
      // matters; the drifting is decoration and decoration is what this setting
      // asks us to drop.
      draw(0);
      return;
    }

    const loop = (time: number) => {
      draw(time);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => {
      pointer = null;
    };

    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    host.addEventListener('pointercancel', onLeave);

    const observer = new ResizeObserver(() => measure());
    observer.observe(host);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      host.removeEventListener('pointercancel', onLeave);
    };
  }, [active, reduceMotion]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
