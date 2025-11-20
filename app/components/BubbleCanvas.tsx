"use client";

import { useEffect, useRef } from "react";

export default function BubbleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const parent = canvas.parentElement!;

    // Canvas always = parent size
    const resize = () => {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    resize();

    const colors = ["rgba(183,255,111,0.7)"];

    const bubbles = Array.from({ length: 50 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 30 + Math.random() * 50,
      dx: (Math.random() - 0.5) * 2.8 * 5, // 5 গুণ দ্রুত
      dy: (Math.random() - 0.5) * 2.8 * 5, // 5 গুণ দ্রুত
      color: colors[0],
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";

      bubbles.forEach((b) => {
        b.x += b.dx;
        b.y += b.dy;

        // wrap inside only parent
        if (b.x - b.r > canvas.width) b.x = -b.r;
        if (b.x + b.r < 0) b.x = canvas.width + b.r;
        if (b.y - b.r > canvas.height) b.y = -b.r;
        if (b.y + b.r < 0) b.y = canvas.height + b.r;

        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, b.color);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    draw();

    const obs = new ResizeObserver(resize);
    obs.observe(parent);

    return () => obs.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
    />
  );
}
