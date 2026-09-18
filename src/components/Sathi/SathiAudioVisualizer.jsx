import React, { useEffect, useRef } from 'react';

const STATE_COLORS = {
  listening: '#8B9A7A',
  thinking: '#B99445',
  speaking: '#C1653A',
};

// Adapted from react-ai-avatar's state-aware AudioVisualizer. The Web Speech
// API does not expose speechSynthesis audio, so speaking uses a gentle synthetic
// activity pattern while an analyser can still be supplied by another voice path.
export default function SathiAudioVisualizer({ state, analyser = null, height = 42 }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const bounds = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(bounds.width * ratio));
      canvas.height = Math.max(1, Math.floor(bounds.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);
    const color = STATE_COLORS[state] || STATE_COLORS.thinking;
    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    let phase = 0;

    const draw = () => {
      const bounds = canvas.getBoundingClientRect();
      const width = bounds.width;
      const center = height / 2;
      phase += 0.055;
      context.clearRect(0, 0, width, height);
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.strokeStyle = color;
      context.shadowBlur = 9;
      context.shadowColor = `${color}99`;
      context.beginPath();

      let volume = 0.35;
      if (analyser && data) {
        analyser.getByteFrequencyData(data);
        volume = data.reduce((sum, value) => sum + value, 0) / data.length / 255;
      }

      for (let x = 0; x <= width; x += 2) {
        const envelope = Math.sin((x / Math.max(width, 1)) * Math.PI);
        const frequency = state === 'thinking' ? 0.03 : 0.045;
        const amplitude = state === 'speaking' ? 9 + volume * 14 : 4 + volume * 8;
        const y = center + Math.sin(x * frequency + phase) * envelope * amplitude;
        if (x === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
      context.shadowBlur = 0;
      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', resize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [analyser, height, state]);

  return (
    <canvas
      ref={canvasRef}
      aria-label={state === 'listening' ? 'Sathi is listening' : 'Sathi voice activity'}
      className="w-full max-w-[280px]"
      style={{ height }}
    />
  );
}