/**
 * Pattern Perfect — particle system + floating popups.
 *
 * Gives every action tactile feedback: a burst of gold sparks when a radio
 * call is answered correctly, a floating "+score" popup at each checkpoint,
 * wind streaks drifting across the screen, and engine exhaust behind the
 * aircraft. All pooled and frame-rate independent.
 *
 * Particles come in two coordinate spaces:
 *   - sparks / exhaust / popups: WORLD space (ft) — rendered through the camera transform
 *   - streaks: SCREEN space (px) — rendered directly
 */

interface TransformLike {
  toCanvas: (p: { x: number; y: number }) => [number, number];
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // seconds remaining
  maxLife: number;
  size: number;
  color: string;
  gravity: number;
  type: "spark" | "streak" | "exhaust";
}

export interface Popup {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
}

export class ParticleSystem {
  particles: Particle[] = [];
  popups: Popup[] = [];

  burst(x: number, y: number, color = "#f2b134", count = 18) {
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 40 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1,
        size: 1.5 + Math.random() * 2.5,
        color,
        gravity: 30,
        type: "spark",
      });
    }
  }

  popup(x: number, y: number, text: string, color = "#f2b134") {
    this.popups.push({
      x,
      y,
      text,
      color,
      life: 1.4,
      maxLife: 1.4,
      vy: -40,
    });
  }

  exhaust(x: number, y: number, headingRad: number) {
    if (this.particles.length > 200) return;
    const spread = 0.4;
    const a = headingRad + Math.PI + (Math.random() - 0.5) * spread;
    const speed = 20 + Math.random() * 30;
    this.particles.push({
      x,
      y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      life: 0.3 + Math.random() * 0.2,
      maxLife: 0.5,
      size: 1 + Math.random() * 1.5,
      color: "rgba(180,200,230,0.6)",
      gravity: 0,
      type: "exhaust",
    });
  }

  windStreak(windVx: number, windVy: number, width: number, height: number) {
    if (this.particles.length > 120) return;
    // Spawn off the upwind edge, drifting with wind.
    const fromLeft = windVx > 0;
    const fromTop = windVy < 0;
    let x: number, y: number;
    if (Math.abs(windVx) > Math.abs(windVy)) {
      x = fromLeft ? -20 : width + 20;
      y = Math.random() * height;
    } else {
      x = Math.random() * width;
      y = fromTop ? -20 : height + 20;
    }
    this.particles.push({
      x,
      y,
      vx: windVx * 0.8,
      vy: windVy * 0.8,
      life: 1.5 + Math.random(),
      maxLife: 2,
      size: 1 + Math.random() * 1.5,
      color: "rgba(234,242,251,0.25)",
      gravity: 0,
      type: "streak",
    });
  }

  update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // Friction for sparks.
      if (p.type === "spark") {
        p.vx *= 0.94;
        p.vy *= 0.94;
      }
    }
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pp = this.popups[i];
      pp.life -= dt;
      if (pp.life <= 0) {
        this.popups.splice(i, 1);
        continue;
      }
      pp.y += pp.vy * dt;
      pp.vy *= 0.96;
    }
  }

  /** Render only particles of a given type (screen-space, e.g. streaks). */
  renderType(ctx: CanvasRenderingContext2D, type: Particle["type"]) {
    for (const p of this.particles) {
      if (p.type !== type) continue;
      const alpha = p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      if (p.type === "streak") {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.08, p.y - p.vy * 0.08);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  /**
   * Render world-space particles (sparks, exhaust) + popups through a camera
   * transform that converts world (ft) → screen (px).
   */
  renderWorld(ctx: CanvasRenderingContext2D, tf: TransformLike) {
    for (const p of this.particles) {
      if (p.type === "streak") continue; // streaks are screen-space
      const alpha = p.life / p.maxLife;
      const [sx, sy] = tf.toCanvas({ x: p.x, y: p.y });
      ctx.save();
      ctx.globalAlpha = alpha;
      if (p.type === "spark") {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // exhaust
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    // Popups (world-space, converted through transform).
    for (const pp of this.popups) {
      const alpha = pp.life / pp.maxLife;
      const [sx, sy] = tf.toCanvas({ x: pp.x, y: pp.y });
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = pp.color;
      ctx.font = "700 16px Sora, Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = pp.color;
      ctx.shadowBlur = 10;
      ctx.fillText(pp.text, sx, sy);
      ctx.restore();
    }
  }

  /** Legacy full render (screen-space) — kept for the share card. */
  render(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      if (p.type === "spark") {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "streak") {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.08, p.y - p.vy * 0.08);
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    for (const pp of this.popups) {
      const alpha = pp.life / pp.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = pp.color;
      ctx.font = "700 18px Sora, Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = pp.color;
      ctx.shadowBlur = 10;
      ctx.fillText(pp.text, pp.x, pp.y);
      ctx.restore();
    }
  }

  clear() {
    this.particles = [];
    this.popups = [];
  }
}
