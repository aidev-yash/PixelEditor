'use client';

import { useEffect, useRef } from 'react';

type ParticleKind =
  | 'crop'
  | 'crosshair'
  | 'sparkle'
  | 'anchor'
  | 'diamond'
  | 'focus'
  | 'pixel'
  | 'curve'
  | 'label';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotSpeed: number;
  size: number;
  baseAlpha: number;
  currentAlpha: number;
  kind: ParticleKind;
  label?: string;
  floatOffset: number;
}

export function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Respect reduced motion preferences
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    const mouse = {
      x: -2000,
      y: -2000,
      radius: 110,
    };

    // Light mode palette: Slate, Indigo, Navy, Cyan
    const lightColors = [
      '30, 41, 59',    // Slate ink
      '71, 85, 105',   // Muted slate
      '44, 60, 209',   // Signal blue
      '79, 70, 229',   // Indigo
      '14, 116, 144',  // Cyan/teal
    ];

    // Dark mode palette: Luminous slate, Ice blue, Electric indigo, Sky cyan
    const darkColors = [
      '148, 163, 184', // Luminous slate-400
      '100, 116, 139', // Slate-500
      '129, 140, 248', // Soft indigo
      '99, 102, 241',  // Electric indigo
      '56, 189, 248',  // Sky cyan
    ];

    const kinds: ParticleKind[] = [
      'crop',
      'crosshair',
      'sparkle',
      'anchor',
      'diamond',
      'focus',
      'pixel',
      'curve',
      'label',
    ];

    const labels = ['px', '1:1', 'RAW', '90°', '4K', 'SVG', '100%'];

    function resize() {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx?.scale(dpr, dpr);
      initParticles();
    }

    function initParticles() {
      // Reduced quantity per user request: ~20 on desktop, ~10 on mobile
      const count = width < 768 ? 10 : 20;
      particles = [];

      for (let i = 0; i < count; i++) {
        // Slightly visible alpha: 0.18 to 0.32
        const baseAlpha = 0.18 + Math.random() * 0.14;
        const kind = kinds[i % kinds.length];

        // Slightly reduced size per user request: 5.5px to 9px (down from 8-14px)
        const size = kind === 'label' ? 7.5 : 5.5 + Math.random() * 3.5;

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.006,
          size,
          baseAlpha,
          currentAlpha: baseAlpha,
          kind,
          label: labels[i % labels.length],
          floatOffset: Math.random() * 100,
        });
      }
    }

    let time = 0;
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      time += 0.012;

      // Check active theme
      const isDark =
        document.documentElement.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark';

      const currentColors = isDark ? darkColors : lightColors;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const colorBase = currentColors[i % currentColors.length];

        // Ambient drift + gentle floating sine wave
        p.x += p.vx;
        p.y += p.vy + Math.sin(time + p.floatOffset) * 0.1;
        p.rotation += p.rotSpeed;

        // Wrap around boundaries smoothly with margin
        const pad = 30;
        if (p.x < -pad) p.x = width + pad;
        else if (p.x > width + pad) p.x = -pad;

        if (p.y < -pad) p.y = height + pad;
        else if (p.y > height + pad) p.y = -pad;

        // Interactive mouse response: slight repel + visibility boost
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x += (dx / dist) * force * 1.2;
          p.y += (dy / dist) * force * 1.2;
          p.currentAlpha = Math.min(isDark ? 0.6 : 0.55, p.baseAlpha + force * 0.3);
        } else {
          p.currentAlpha += (p.baseAlpha - p.currentAlpha) * 0.05;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        const s = p.size;
        ctx.strokeStyle = `rgba(${colorBase}, ${p.currentAlpha})`;
        ctx.fillStyle = `rgba(${colorBase}, ${p.currentAlpha})`;
        ctx.lineWidth = 1.1;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw image-editing and decoration glyphs
        switch (p.kind) {
          case 'crop': {
            // Corner crop bracket (⌜)
            ctx.beginPath();
            ctx.moveTo(-s, s * 0.6);
            ctx.lineTo(-s, -s);
            ctx.lineTo(s * 0.6, -s);
            ctx.stroke();
            break;
          }

          case 'crosshair': {
            // Precision alignment reticle / plus mark (+)
            ctx.beginPath();
            ctx.moveTo(-s, 0);
            ctx.lineTo(s, 0);
            ctx.moveTo(0, -s);
            ctx.lineTo(0, s);
            ctx.stroke();

            // Center micro dot
            ctx.beginPath();
            ctx.arc(0, 0, 1, 0, Math.PI * 2);
            ctx.fill();
            break;
          }

          case 'sparkle': {
            // 4-point magic wand / enhancement sparkle (✦)
            ctx.beginPath();
            ctx.moveTo(0, -s);
            ctx.quadraticCurveTo(0, 0, s, 0);
            ctx.quadraticCurveTo(0, 0, 0, s);
            ctx.quadraticCurveTo(0, 0, -s, 0);
            ctx.quadraticCurveTo(0, 0, 0, -s);
            ctx.closePath();
            ctx.stroke();
            break;
          }

          case 'anchor': {
            // Vector pen tool anchor point with bezier handle whiskers
            const halfBox = s * 0.35;
            ctx.strokeRect(-halfBox, -halfBox, halfBox * 2, halfBox * 2);

            // Handle line
            ctx.beginPath();
            ctx.moveTo(-s * 1.2, 0);
            ctx.lineTo(-halfBox, 0);
            ctx.moveTo(halfBox, 0);
            ctx.lineTo(s * 1.2, 0);
            ctx.stroke();

            // Handle terminal circle markers
            ctx.beginPath();
            ctx.arc(-s * 1.2, 0, 1.2, 0, Math.PI * 2);
            ctx.arc(s * 1.2, 0, 1.2, 0, Math.PI * 2);
            ctx.fill();
            break;
          }

          case 'diamond': {
            // Keyframe / transformation diamond (◇)
            ctx.beginPath();
            ctx.moveTo(0, -s);
            ctx.lineTo(s * 0.85, 0);
            ctx.lineTo(0, s);
            ctx.lineTo(-s * 0.85, 0);
            ctx.closePath();
            ctx.stroke();
            break;
          }

          case 'focus': {
            // Camera focus ring / aperture circle with tick marks
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.65, 0, Math.PI * 2);
            ctx.stroke();

            // 4 outer precision ticks
            ctx.beginPath();
            ctx.moveTo(0, -s);
            ctx.lineTo(0, -s * 0.65);
            ctx.moveTo(0, s * 0.65);
            ctx.lineTo(0, s);
            ctx.moveTo(-s, 0);
            ctx.lineTo(-s * 0.65, 0);
            ctx.moveTo(s * 0.65, 0);
            ctx.lineTo(s, 0);
            ctx.stroke();
            break;
          }

          case 'pixel': {
            // Selection frame / pixel bounding box with dashed pattern
            ctx.setLineDash([1.5, 2]);
            ctx.strokeRect(-s * 0.65, -s * 0.65, s * 1.3, s * 1.3);
            ctx.setLineDash([]);
            break;
          }

          case 'curve': {
            // Smooth bezier wave / pen curve (as seen in user reference)
            ctx.beginPath();
            ctx.moveTo(-s, s * 0.4);
            ctx.bezierCurveTo(-s * 0.3, -s * 0.9, s * 0.3, s * 0.9, s, -s * 0.4);
            ctx.stroke();
            break;
          }

          case 'label': {
            // Technical dimension/format pill tag (e.g. 'px', '1:1')
            ctx.font = `600 8.5px ui-monospace, monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.label || 'px', 0, 0);
            break;
          }
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(draw);
    }

    function onMouseMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }

    function onMouseLeave() {
      mouse.x = -2000;
      mouse.y = -2000;
    }

    let isVisible = true;
    function onVisibilityChange() {
      if (document.hidden) {
        isVisible = false;
        cancelAnimationFrame(animationFrameId);
      } else if (!isVisible) {
        isVisible = true;
        animationFrameId = requestAnimationFrame(draw);
      }
    }

    let resizeTimer: NodeJS.Timeout;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    }

    resize();
    animationFrameId = requestAnimationFrame(draw);

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-100"
    />
  );
}
