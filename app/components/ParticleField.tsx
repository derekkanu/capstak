"use client";

import { useEffect, useRef } from "react";

/* A soft, slowly drifting field of points. Two clusters stand in for "your
   business" and the "sector benchmark" it's compared against, joined by a
   diagonal stream. Seeded, so it renders the same every time. */

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

type P = { x: number; y: number; r: number; a: number; c: string; ph: number };

export default function ParticleField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rand = rng(7);
    const gauss = () => (rand() + rand() + rand() - 1.5) / 1.5;
    const colors = ["#1f7a3a", "#2a9d4f", "#5cbf72", "#0f3b22", "#9ccf6a"];
    const pts: P[] = [];
    const add = (cx: number, cy: number, sx: number, sy: number, n: number) => {
      for (let i = 0; i < n; i++) {
        pts.push({
          x: cx + gauss() * sx,
          y: cy + gauss() * sy,
          r: 0.6 + rand() * 1.5,
          a: 0.25 + rand() * 0.7,
          c: colors[Math.floor(rand() * colors.length)],
          ph: rand() * Math.PI * 2,
        });
      }
    };
    // Benchmark cloud (top right), business cluster (lower middle), stream between.
    add(0.78, 0.22, 0.24, 0.16, 1500);
    add(0.32, 0.62, 0.1, 0.07, 260);
    for (let i = 0; i < 420; i++) {
      const t = rand();
      pts.push({
        x: 0.3 + t * 0.48 + gauss() * 0.05,
        y: 0.64 - t * 0.42 + gauss() * 0.05,
        r: 0.6 + rand() * 1.2,
        a: 0.2 + rand() * 0.5,
        c: colors[Math.floor(rand() * colors.length)],
        ph: rand() * Math.PI * 2,
      });
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        const dx = reduced ? 0 : Math.sin(t / 2600 + p.ph) * 2.2;
        const dy = reduced ? 0 : Math.cos(t / 3100 + p.ph) * 2.2;
        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x * w + dx, p.y * h + dy, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      if (visible) draw(t);
      raf = requestAnimationFrame(loop);
    };

    resize();
    draw(0);
    if (!reduced) raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}
