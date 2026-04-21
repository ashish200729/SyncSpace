"use client";

import { useEffect, useRef } from "react";

export function HeroBgAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resizeCanvas = () => {
      const ratio = window.devicePixelRatio || 1;
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth * ratio;
        canvas.height = parent.offsetHeight * ratio;
        ctx.scale(ratio, ratio);
        canvas.style.width = `${parent.offsetWidth}px`;
        canvas.style.height = `${parent.offsetHeight}px`;
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const chars = "01".split("");
    const fontSize = 14;

    const draw = () => {
      time += 0.015; // Slow, breathing pace
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, w, h);

      ctx.font = `600 ${fontSize}px var(--font-mono, monospace)`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const cols = Math.ceil(w / fontSize) + 1;
      const rows = Math.ceil(h / fontSize) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          // Complex sine wave interference for a topographic feel
          const x = i * 0.05;
          const y = j * 0.05;

          let wave = Math.sin(x + time) + Math.cos(y + time * 0.8) + Math.sin(x * y * 0.1 - time);
          wave = (wave + 3) / 6; // Normalize to approx 0 - 1

          // Only draw "peaks" of the wave for a minimalist grid look
          if (wave > 0.4) {
            const alpha = (wave - 0.4) * 0.4; // Cap alpha tightly for subtlety
            
            ctx.fillStyle = `rgba(15, 15, 20, ${alpha})`;
            
            // Stable pseudo-random character based on grid position
            const charIdx = (i * 13 + j * 7) % chars.length;
            const cx = i * fontSize + fontSize / 2;
            const cy = j * fontSize + fontSize / 2;
            
            ctx.fillText(chars[charIdx], cx, cy);
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      className="absolute inset-0 z-0 pointer-events-none" 
      aria-hidden="true" 
      style={{ 
        WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 0%, transparent 80%)", 
        maskImage: "radial-gradient(ellipse at 50% 30%, black 0%, transparent 80%)" 
      }}
    >
      <canvas ref={canvasRef} className="block w-full h-full opacity-80" />
    </div>
  );
}
