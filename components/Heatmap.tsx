'use client';

import React, { useEffect, useRef } from 'react';
import { ClickPoint } from '@/lib/gameEngine';

interface HeatmapProps {
  clickHistory: ClickPoint[];
  canvasWidth: number;
  canvasHeight: number;
  width?: number;
  height?: number;
}

export default function Heatmap({ 
  clickHistory, 
  canvasWidth, 
  canvasHeight, 
  width = 400, 
  height = 250 
}: HeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    if (clickHistory.length === 0) {
      // Friendly empty state
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, width, height);

      // Subtle grid for visual context
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gs = 30;
      for (let x = 0; x <= width; x += gs) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += gs) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw target ring icon
      const cx = width / 2;
      const cy = height / 2 - 6;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No clicks recorded', cx, cy + 32);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.font = '10px sans-serif';
      ctx.fillText('Try clicking targets next round', cx, cy + 50);
      return;
    }

    // Scale factors
    const scaleX = width / canvasWidth;
    const scaleY = height / canvasHeight;

    // Draw smooth heatmap using radial gradients for each click
    const radius = 35; // Radius of influence for each click

    // Create offscreen canvas for heatmap
    const heatCanvas = document.createElement('canvas');
    heatCanvas.width = width;
    heatCanvas.height = height;
    const heatCtx = heatCanvas.getContext('2d');
    if (!heatCtx) return;

    // Draw heat points with additive blending
    heatCtx.globalCompositeOperation = 'lighter';

    for (const click of clickHistory) {
      const scaledX = click.x * scaleX;
      const scaledY = click.y * scaleY;

      // Create radial gradient for smooth falloff
      const gradient = heatCtx.createRadialGradient(
        scaledX, scaledY, 0,
        scaledX, scaledY, radius
      );

      if (click.isHit) {
        // Green/cyan for hits
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)');
        gradient.addColorStop(0.4, 'rgba(34, 197, 94, 0.2)');
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
      } else {
        // Red/orange for misses
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.5)');
        gradient.addColorStop(0.4, 'rgba(239, 68, 68, 0.25)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      }

      heatCtx.fillStyle = gradient;
      heatCtx.beginPath();
      heatCtx.arc(scaledX, scaledY, radius, 0, Math.PI * 2);
      heatCtx.fill();
    }

    // Draw the heatmap to main canvas
    ctx.drawImage(heatCanvas, 0, 0);

    // Draw subtle grid overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const gridSize = 30;
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw click points on top
    for (const click of clickHistory) {
      const scaledX = click.x * scaleX;
      const scaledY = click.y * scaleY;

      // Outer glow
      ctx.beginPath();
      ctx.arc(scaledX, scaledY, 6, 0, Math.PI * 2);
      ctx.fillStyle = click.isHit 
        ? 'rgba(99, 102, 241, 0.3)' 
        : 'rgba(239, 68, 68, 0.3)';
      ctx.fill();

      // Inner dot
      ctx.beginPath();
      ctx.arc(scaledX, scaledY, 3, 0, Math.PI * 2);
      ctx.fillStyle = click.isHit 
        ? 'rgba(129, 140, 248, 1)' 
        : 'rgba(248, 113, 113, 1)';
      ctx.fill();

      // Center highlight
      ctx.beginPath();
      ctx.arc(scaledX - 0.5, scaledY - 0.5, 1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fill();
    }

    // Draw legend
    const legendY = height - 18;
    
    // Hit legend
    ctx.beginPath();
    ctx.arc(12, legendY, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(12, legendY, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(129, 140, 248, 1)';
    ctx.fill();
    
    ctx.fillStyle = '#777';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Hit', 22, legendY + 3);

    // Miss legend
    ctx.beginPath();
    ctx.arc(55, legendY, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(55, legendY, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(248, 113, 113, 1)';
    ctx.fill();
    
    ctx.fillText('Miss', 65, legendY + 3);

  }, [clickHistory, canvasWidth, canvasHeight, width, height]);

  const hitCount = clickHistory.filter(c => c.isHit).length;
  const missCount = clickHistory.length - hitCount;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-[#a1a1aa] uppercase tracking-widest">
          Click Heatmap
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-indigo-400">{hitCount} hits</span>
          <span className="text-zinc-600">•</span>
          <span className="text-red-400">{missCount} misses</span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-xl border border-white/10"
      />
      <div className="flex justify-between items-center">
        <div className="text-[10px] text-[#555]">
          {clickHistory.length} total clicks
        </div>
        <div className="text-xs font-bold">
          <span className={`${
            clickHistory.length > 0 && (hitCount / clickHistory.length) >= 0.7 
              ? 'text-green-400' 
              : clickHistory.length > 0 && (hitCount / clickHistory.length) >= 0.5 
                ? 'text-amber-400' 
                : 'text-red-400'
          }`}>
            {clickHistory.length > 0 
              ? ((hitCount / clickHistory.length) * 100).toFixed(1)
              : 0}% accuracy
          </span>
        </div>
      </div>
    </div>
  );
}
