import { useEffect, useRef } from 'react';

export default function GridField() {
  const canvasRef = useRef(null);
  const pointer = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    tx: window.innerWidth / 2,
    ty: window.innerHeight / 2
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let frame = 0;
    let running = true;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function move(event) {
      const point = event.touches ? event.touches[0] : event;
      pointer.current.tx = point.clientX;
      pointer.current.ty = point.clientY;
    }

    function draw() {
      if (!running) return;
      frame += 1;
      const { width, height } = canvas;
      const gap = 18;
      const current = pointer.current;
      current.x += (current.tx - current.x) * 0.28;
      current.y += (current.ty - current.y) * 0.28;

      context.clearRect(0, 0, width, height);
      const cols = Math.ceil(width / gap) + 1;
      const rows = Math.ceil(height / gap) + 1;
      const nodes = [];

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = col * gap;
          const y = row * gap;
          const distance = Math.hypot(x - current.x, y - current.y);
          const wave = Math.sin(distance * 0.06 - frame * 0.12);
          const follow = Math.max(0, 1 - distance / 140);
          nodes.push({ x, y, light: Math.max(0, wave) * 0.3 + follow });
        }
      }

      context.lineWidth = 1;
      nodes.forEach((node, index) => {
        const right = nodes[index + 1];
        const below = nodes[index + cols];
        if (right && node.x < right.x) {
          context.strokeStyle = `rgba(0, 240, 255, ${(node.light + right.light) * 0.16})`;
          context.beginPath();
          context.moveTo(node.x, node.y);
          context.lineTo(right.x, right.y);
          context.stroke();
        }
        if (below) {
          context.strokeStyle = `rgba(195, 0, 255, ${(node.light + below.light) * 0.1})`;
          context.beginPath();
          context.moveTo(node.x, node.y);
          context.lineTo(below.x, below.y);
          context.stroke();
        }
      });

      nodes.forEach((node) => {
        context.fillStyle = `rgba(0, 240, 255, ${0.12 + node.light * 0.88})`;
        context.beginPath();
        context.arc(node.x, node.y, 0.7 + node.light * 1.4, 0, Math.PI * 2);
        context.fill();
      });

      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: true });
    draw();

    return () => {
      running = false;
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('touchmove', move);
    };
  }, []);

  return <canvas ref={canvasRef} className="grid-field" aria-hidden="true" />;
}
