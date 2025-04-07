
import React, { useEffect, useRef } from 'react';

const SpaceBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Resize canvas to fill window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Star properties
    const stars: Star[] = [];
    const numberOfStars = Math.min(window.innerWidth, window.innerHeight) / 2;
    
    // Create stars
    for (let i = 0; i < numberOfStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        opacity: Math.random(),
        speed: Math.random() * 0.05,
        hue: Math.random() > 0.95 ? Math.floor(Math.random() * 360) : 0, // Occasional colored stars
      });
    }
    
    // Create nebula clouds
    const nebulae: Nebula[] = [];
    for (let i = 0; i < 3; i++) {
      nebulae.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 150 + 100,
        opacity: Math.random() * 0.1 + 0.05,
        hue: Math.random() * 60 + 220, // Blue to purple range
        pulse: 0,
        pulseSpeed: Math.random() * 0.01 + 0.005,
      });
    }
    
    // Animation loop
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw nebulae
      nebulae.forEach(nebula => {
        // Update pulse
        nebula.pulse += nebula.pulseSpeed;
        const pulseOpacity = nebula.opacity * (0.8 + Math.sin(nebula.pulse) * 0.2);
        const pulseSize = nebula.radius * (0.9 + Math.sin(nebula.pulse) * 0.1);
        
        // Create gradient
        const gradient = ctx.createRadialGradient(
          nebula.x, nebula.y, 0,
          nebula.x, nebula.y, pulseSize
        );
        gradient.addColorStop(0, `hsla(${nebula.hue}, 80%, 60%, ${pulseOpacity})`);
        gradient.addColorStop(1, `hsla(${nebula.hue}, 80%, 60%, 0)`);
        
        // Draw nebula
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(nebula.x, nebula.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw and update stars
      stars.forEach(star => {
        // Move star
        star.y += star.speed;
        
        // Reset stars that go off screen
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        
        // Twinkle effect
        const twinkle = 0.7 + Math.sin(Date.now() * star.speed * 0.5) * 0.3;
        
        // Draw star
        ctx.beginPath();
        
        if (star.hue) {
          // Colored star
          ctx.fillStyle = `hsla(${star.hue}, 80%, 70%, ${star.opacity * twinkle})`;
          
          // Draw a more complex star for colored ones
          ctx.arc(star.x, star.y, star.radius * 1.2 * twinkle, 0, Math.PI * 2);
          ctx.fill();
          
          // Add glow
          ctx.beginPath();
          const glow = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.radius * 6
          );
          glow.addColorStop(0, `hsla(${star.hue}, 80%, 70%, ${star.opacity * 0.3 * twinkle})`);
          glow.addColorStop(1, `hsla(${star.hue}, 80%, 70%, 0)`);
          ctx.fillStyle = glow;
          ctx.arc(star.x, star.y, star.radius * 6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Regular white star
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
          ctx.arc(star.x, star.y, star.radius * twinkle, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      
      requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]"
    />
  );
};

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speed: number;
  hue: number;
}

interface Nebula {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  hue: number;
  pulse: number;
  pulseSpeed: number;
}

export default SpaceBackground;
