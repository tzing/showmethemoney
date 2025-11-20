import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface CoinRainHandle {
  spawnCoins: (x: number, y: number) => void;
}

interface CoinRainProps {
  obstacleRef: React.RefObject<HTMLElement | null>;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  rotation: number;
  vRotation: number;
  life: number;
  onGround: boolean;
}

const CoinRain = forwardRef<CoinRainHandle, CoinRainProps>(({ obstacleRef }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number>(0);
  const isActive = useRef(false);

  const colors = ['#FFD700', '#FFA500', '#FFC125', '#DAA520', '#FDB931'];

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const createParticle = (x: number, y: number): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 2; // Burst speed
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 5, // Initial upward pop
      radius: Math.random() * 2 + 2, // 2-4px radius (halved from 4-8px)
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      vRotation: (Math.random() - 0.5) * 0.2,
      life: 300 + Math.random() * 100, // Frames to live
      onGround: false,
    };
  };

  const update = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gravity = 0.4;
    const frictionAir = 0.99;
    const frictionGround = 0.9;
    const bounce = 0.5;

    // Get obstacle rect
    let obsRect: DOMRect | null = null;
    if (obstacleRef.current) {
      obsRect = obstacleRef.current.getBoundingClientRect();
    }

    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];

      // Physics
      p.vy += gravity;
      p.vx *= p.onGround ? frictionGround : frictionAir;

      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRotation;
      p.life--;

      // Collision with Obstacle (Platform)
      // We only check top collision for the "platform" effect
      if (obsRect) {
        // Check if within horizontal bounds of the card
        if (p.x > obsRect.left && p.x < obsRect.right) {
          // Check if falling through the top edge
          // We check if previous y was above or near top, and current y is below
          // Or just simple check: if inside the top part of the box
          const platformTop = obsRect.top;

          // Only collide if moving down and hitting the top surface
          if (p.vy > 0 && p.y + p.radius > platformTop && p.y - p.radius < platformTop + 20) {
            p.y = platformTop - p.radius;
            p.vy = -p.vy * bounce;
            p.onGround = true;

            // Stop micro-bouncing
            if (Math.abs(p.vy) < gravity * 2) {
              p.vy = 0;
            }
          } else {
            p.onGround = false;
          }
        } else {
          p.onGround = false;
        }
      }

      // Floor (Screen bottom) - Let them fall off or bounce?
      // User said "roll out edge and again fall down", so maybe no screen floor?
      // "falling down... blocked by card... roll out edge and fall again"
      // So screen bottom should kill them? Or just let them fall indefinitely until life ends.
      // If they go way below screen, remove them.
      if (p.y > canvas.height + 100) {
        p.life = 0; // Kill
      }

      // Draw
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      // Draw a rough circle/coin
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Shine/Detail
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(-p.radius * 0.3, -p.radius * 0.3, p.radius * 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Remove dead particles
      if (p.life <= 0) {
        particles.current.splice(i, 1);
      }
    }

    if (particles.current.length > 0) {
      animationFrameId.current = requestAnimationFrame(update);
    } else {
      isActive.current = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  useImperativeHandle(ref, () => ({
    spawnCoins: (x, y) => {
      // Spawn 20-30 coins
      const count = 20 + Math.random() * 10;
      for (let i = 0; i < count; i++) {
        particles.current.push(createParticle(x, y));
      }

      if (!isActive.current) {
        isActive.current = true;
        animationFrameId.current = requestAnimationFrame(update);
      }
    }
  }));

  // Cleanup on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(animationFrameId.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
});

export default CoinRain;
