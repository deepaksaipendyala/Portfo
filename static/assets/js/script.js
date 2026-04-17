/**
 * Neural JS — Enhanced Interactive Neural Network Portfolio Script
 * Vanilla JS, no dependencies. Wrapped in IIFE.
 *
 * Features:
 *   Section 1:  Utilities (lerp, rand, dist, clamp, easeOutCubic)
 *   Section 2:  Reduced Motion check
 *   Section 3:  Neural Network Canvas (enhanced)
 *               • Layer 1: Deep background stars (200+)
 *               • Layer 2: Main neural network (100–120 particles, hub nodes)
 *               • Layer 3: Synaptic fire bursts
 *               • Layer 4: Dendrite branching (bezier curves)
 *               • Layer 5: Electric pulses with chain effect + trails
 *               • Floating gradient orbs
 *               • Scroll parallax
 *               • Section proximity effects
 *               • Mouse ripples
 *   Section 4:  Cursor Glow
 *   Section 5:  Theme Toggle
 *   Section 6:  Track Toggle
 *   Section 7:  Mobile Nav
 *   Section 8:  Scrolled Nav & Active Nav Link
 *   Section 9:  Hero Entrance
 *   Section 10: Intersection Observers + Text Shimmer + Typing Cursor
 *   Section 11: Number Counter
 *   Section 12: Smooth Scroll
 *   Section 13: Scroll Progress Indicator
 *   Section 14: Magnetic Buttons
 *   Section 15: Project Card 3D Tilt
 *   Section 16: Init All
 */
(function () {
  'use strict';

  /* =========================================================
   * SECTION 1: UTILITIES
   * ========================================================= */

  /** Linear interpolation */
  const lerp = (a, b, t) => a + (b - a) * t;

  /** Random number in range [min, max) */
  const rand = (min, max) => Math.random() * (max - min) + min;

  /** Ease-out cubic */
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  /** Distance between two points */
  const dist = (ax, ay, bx, by) => Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);

  /** Clamp value between min and max */
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  /* =========================================================
   * SECTION 2: REDUCED MOTION CHECK
   * ========================================================= */
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /* =========================================================
   * SECTION 3: NEURAL NETWORK CANVAS (ENHANCED)
   * ========================================================= */
  const initNeuralCanvas = () => {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // --- Constants ---
    const CONNECTION_DIST    = 200;   // px — max distance to draw a connection
    const MOUSE_ATTRACT_DIST = 300;   // px — mouse attraction radius (increased)
    const PULSE_INTERVAL_MIN = 2000;  // ms
    const PULSE_INTERVAL_MAX = 4000;  // ms
    const PULSE_SPEED        = 0.012; // progress units per frame
    const MAX_RIPPLES        = 5;     // concurrent mouse ripples
    const MAX_CHAIN_DEPTH    = 3;     // chain pulse max depth

    let W, H;
    let particles    = [];   // Layer 2: main neural network nodes
    let stars        = [];   // Layer 1: deep background stars
    let orbs         = [];   // Floating gradient orbs
    let pulses       = [];   // Layer 5: electric pulses
    let burstParts   = [];   // Layer 3: synaptic burst particles
    let ripples      = [];   // Mouse ripple rings
    let animFrame;
    let isDarkTheme  = true;
    let scrollY      = 0;    // current scroll offset for parallax

    // Mouse state
    const mouse = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 };

    // Frame counter for oscillations
    let frame = 0;

    /* ─────────────────────────────────────────────
     * Layer 1: Background Star
     * ───────────────────────────────────────────── */
    class Star {
      constructor() { this.reset(true); }

      reset(randomY = false) {
        this.x  = rand(0, W);
        this.y  = randomY ? rand(0, H) : rand(-5, 0);
        this.r  = rand(0.3, 0.8);
        this.o  = rand(0.03, 0.1);
        this.vx = rand(-0.05, 0.05);
        this.vy = rand(0.02, 0.05);
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0) this.x = W;
        if (this.x > W) this.x = 0;
        if (this.y > H + 5) { this.x = rand(0, W); this.y = -5; }
      }

      draw(parallaxOffset) {
        ctx.beginPath();
        ctx.arc(this.x, this.y + parallaxOffset, this.r, 0, Math.PI * 2);
        ctx.fillStyle = isDarkTheme
          ? `rgba(200,220,255,${this.o})`
          : `rgba(49,61,79,${Math.min(0.22, this.o * 1.7)})`;
        ctx.fill();
      }
    }

    /* ─────────────────────────────────────────────
     * Floating Gradient Orb
     * ───────────────────────────────────────────── */
    class GradientOrb {
      constructor() { this.reset(true); }

      reset(randomY = false) {
        this.x      = rand(0, W);
        this.y      = randomY ? rand(0, H) : rand(-300, 0);
        this.r      = rand(100, 200);
        this.vx     = rand(-0.2, 0.2);
        this.vy     = rand(0.1, 0.3);
        const type  = Math.random();
        if (type < 0.4) {
          // Cyan
          this.color = isDarkTheme ? [0, 240, 255, 0.030] : [32, 72, 91, 0.050];
        } else if (type < 0.75) {
          // Violet
          this.color = isDarkTheme ? [139, 92, 246, 0.025] : [75, 62, 103, 0.040];
        } else {
          // Green
          this.color = isDarkTheme ? [0, 255, 160, 0.015] : [46, 84, 68, 0.032];
        }
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y > H + this.r) this.reset(false);
        if (this.x < -this.r) this.x = W + this.r;
        if (this.x > W + this.r) this.x = -this.r;
      }

      draw() {
        const [r, g, b, a] = this.color;
        const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
        grd.addColorStop(0,   `rgba(${r},${g},${b},${a})`);
        grd.addColorStop(0.5, `rgba(${r},${g},${b},${a * 0.4})`);
        grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }
    }

    /* ─────────────────────────────────────────────
     * Layer 2: Main Neural Network Particle (enhanced)
     * ───────────────────────────────────────────── */
    class Particle {
      constructor(isHub = false) {
        this.isHub = isHub;
        this.reset(true);
      }

      reset(randomY = false) {
        this.x           = rand(0, W);
        this.y           = randomY ? rand(0, H) : rand(-10, 0);
        this.isHub       = this.isHub || false;
        this.radius      = this.isHub ? rand(4, 6) : rand(1, 4);
        this.baseOpacity = this.isHub ? rand(0.4, 0.7) : rand(0.1, 0.5);
        this.opacity     = this.baseOpacity;
        // Drift velocity
        this.vx = rand(-0.3, 0.3);
        this.vy = rand(-0.3, 0.3);
        if (Math.abs(this.vx) < 0.05) this.vx = this.vx < 0 ? -0.1 : 0.1;
        if (Math.abs(this.vy) < 0.05) this.vy = this.vy < 0 ? -0.1 : 0.1;
        // Color type: 0 = cyan, 1 = violet, 2 = white
        this.colorType   = Math.random() < 0.5 ? 0 : Math.random() < 0.5 ? 1 : 2;
        // Hub pulse phase
        this.pulsePhase  = rand(0, Math.PI * 2);
        // Proximity boost (for section proximity effect)
        this.proxBoost   = 0;
        // Dendrite data (for hub nodes)
        this.dendrites   = [];
        if (this.isHub) {
          const count = Math.floor(rand(2, 5)); // 2–4 dendrites
          for (let i = 0; i < count; i++) {
            this.dendrites.push({
              angle:     rand(0, Math.PI * 2),
              length:    rand(80, 150),
              cpOffset:  rand(-40, 40),
              cpPhase:   rand(0, Math.PI * 2),
              cpSpeed:   rand(0.005, 0.015),
            });
          }
        }
      }

      getColor(opacityOverride, forceLight = false) {
        const o = clamp(opacityOverride !== undefined ? opacityOverride : this.opacity, 0, 1);
        if (forceLight || !isDarkTheme) {
          if (this.colorType === 0) return `rgba(32,72,91,${Math.min(0.95, o * 1.35)})`;
          if (this.colorType === 1) return `rgba(75,62,103,${Math.min(0.9, o * 1.25)})`;
          return `rgba(55,63,79,${Math.min(0.85, o * 1.2)})`;
        }
        if (this.colorType === 0) return `rgba(0,240,255,${o * 0.35})`;
        if (this.colorType === 1) return `rgba(139,92,246,${o * 0.25})`;
        return `rgba(255,255,255,${o * 0.15})`;
      }

      update() {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const d  = Math.sqrt(dx * dx + dy * dy);

        if (d < MOUSE_ATTRACT_DIST && d > 0) {
          const force = (1 - d / MOUSE_ATTRACT_DIST) * 0.015;
          this.x += dx * force;
          this.y += dy * force;
          this.opacity = lerp(this.opacity, clamp(this.baseOpacity * 2.5, 0, 1), 0.08);
        } else {
          this.opacity = lerp(this.opacity, this.baseOpacity + this.proxBoost, 0.04);
        }

        this.x += this.vx;
        this.y += this.vy;

        // Wrap edges
        if (this.x < -10) this.x = W + 10;
        if (this.x > W + 10) this.x = -10;
        if (this.y < -10) this.y = H + 10;
        if (this.y > H + 10) this.y = -10;

        // Decay proximity boost
        this.proxBoost = lerp(this.proxBoost, 0, 0.02);

        // Hub pulse
        if (this.isHub) {
          this.pulsePhase += 0.02;
        }

        // Update dendrite control point phases
        for (const d of this.dendrites) {
          d.cpPhase += d.cpSpeed;
        }
      }

      draw(parallaxOffset) {
        const py = this.y + parallaxOffset;

        // Hub: draw glow halo
        if (this.isHub) {
          const pulseOpacity = this.opacity * (0.7 + 0.3 * Math.sin(this.pulsePhase));
          const haloR = this.radius * 3.5;
          const grd = ctx.createRadialGradient(this.x, py, 0, this.x, py, haloR);
          const baseAlpha = isDarkTheme ? 0.18 : 0.25;
          grd.addColorStop(0, `rgba(0,240,255,${pulseOpacity * baseAlpha})`);
          grd.addColorStop(1, 'rgba(0,240,255,0)');
          ctx.beginPath();
          ctx.arc(this.x, py, haloR, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();

          // Core
          ctx.beginPath();
          ctx.arc(this.x, py, this.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,240,255,${pulseOpacity * (isDarkTheme ? 0.8 : 1.0)})`;
          ctx.fill();

          // Draw dendrites
          this.drawDendrites(py);
        } else {
          ctx.beginPath();
          ctx.arc(this.x, py, this.radius, 0, Math.PI * 2);
          ctx.fillStyle = this.getColor();
          ctx.fill();
        }
      }

      drawDendrites(py) {
        for (const d of this.dendrites) {
          const endX = this.x + Math.cos(d.angle) * d.length;
          const endY = py  + Math.sin(d.angle) * d.length;
          // Control point oscillates perpendicular to the dendrite
          const perpAngle = d.angle + Math.PI / 2;
          const cpWave    = Math.sin(d.cpPhase) * d.cpOffset;
          const cpX = (this.x + endX) / 2 + Math.cos(perpAngle) * cpWave;
          const cpY = (py   + endY) / 2 + Math.sin(perpAngle) * cpWave;

          const alpha = isDarkTheme ? 0.12 : 0.2;
          ctx.beginPath();
          ctx.moveTo(this.x, py);
          ctx.quadraticCurveTo(cpX, cpY, endX, endY);
          ctx.strokeStyle = `rgba(0,240,255,${alpha})`;
          ctx.lineWidth   = rand(0.3, 0.5);
          ctx.stroke();
        }
      }
    }

    /* ─────────────────────────────────────────────
     * Layer 3: Synaptic Burst Particle
     * ───────────────────────────────────────────── */
    class BurstParticle {
      constructor(x, y) {
        this.x      = x;
        this.y      = y;
        const angle = rand(0, Math.PI * 2);
        const speed = rand(1.5, 4.0);
        this.vx     = Math.cos(angle) * speed;
        this.vy     = Math.sin(angle) * speed;
        this.life   = Math.floor(rand(40, 61)); // frames
        this.maxLife= this.life;
        this.r      = rand(1.0, 2.5);
      }

      update() {
        this.x  += this.vx;
        this.y  += this.vy;
        this.vx *= 0.92;
        this.vy *= 0.92;
        this.life--;
      }

      draw() {
        const t  = this.life / this.maxLife;
        const alpha = t * (isDarkTheme ? 0.8 : 1.0);
        // Core: bright cyan
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * t, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,240,255,${alpha})`;
        ctx.fill();
        // Outer violet glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * t * 2.5, 0, Math.PI * 2);
        const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * t * 2.5);
        grd.addColorStop(0, `rgba(139,92,246,${alpha * 0.5})`);
        grd.addColorStop(1, 'rgba(139,92,246,0)');
        ctx.fillStyle = grd;
        ctx.fill();
      }
    }

    /* ─────────────────────────────────────────────
     * Layer 5: Electric Pulse (enhanced with chains + trails)
     * ───────────────────────────────────────────── */
    class Pulse {
      constructor(fromIdx, toIdx, dimFactor = 1.0, chainDepth = 0) {
        this.fromIdx    = fromIdx;
        this.toIdx      = toIdx;
        this.progress   = 0;
        this.speed      = PULSE_SPEED + rand(0, 0.008);
        this.done       = false;
        this.dimFactor  = dimFactor;   // brightness (chains get dimmer)
        this.chainDepth = chainDepth;  // current chain depth
        this.trail      = [];          // stores recent positions for trail
      }

      update() {
        const p1 = particles[this.fromIdx];
        const p2 = particles[this.toIdx];
        if (!p1 || !p2) { this.done = true; return; }

        this.progress += this.speed;

        // Record position for trail (last 4 frames)
        const x = lerp(p1.x, p2.x, this.progress);
        const y = lerp(p1.y, p2.y, this.progress);
        this.trail.push({ x, y });
        if (this.trail.length > 4) this.trail.shift();

        if (this.progress >= 1) {
          this.done = true;
          // Chain: 30% chance, up to MAX_CHAIN_DEPTH
          if (this.chainDepth < MAX_CHAIN_DEPTH && Math.random() < 0.30) {
            const dest = particles[this.toIdx];
            if (!dest) return;
            // Find nearest connected neighbour that isn't the origin
            let bestIdx  = -1;
            let bestDist = Infinity;
            for (let i = 0; i < particles.length; i++) {
              if (i === this.toIdx || i === this.fromIdx) continue;
              const d = dist(dest.x, dest.y, particles[i].x, particles[i].y);
              if (d <= CONNECTION_DIST && d < bestDist) {
                bestDist = d;
                bestIdx  = i;
              }
            }
            if (bestIdx !== -1) {
              pulses.push(new Pulse(this.toIdx, bestIdx, this.dimFactor * 0.6, this.chainDepth + 1));
            }
          }
        }
      }

      draw() {
        const p1 = particles[this.fromIdx];
        const p2 = particles[this.toIdx];
        if (!p1 || !p2) return;

        const x = lerp(p1.x, p2.x, this.progress);
        const y = lerp(p1.y, p2.y, this.progress);
        const pulseRadius = 2.5 * this.dimFactor;
        const alpha = 0.7 * this.dimFactor;

        // Trail dots (fading behind the pulse)
        for (let i = 0; i < this.trail.length; i++) {
          const t = (i + 1) / (this.trail.length + 1);
          const tr = this.trail[i];
          ctx.beginPath();
          ctx.arc(tr.x, tr.y, pulseRadius * t * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,240,255,${alpha * t * 0.4})`;
          ctx.fill();
        }

        // Outer glow
        const grd = ctx.createRadialGradient(x, y, 0, x, y, pulseRadius * 4);
        grd.addColorStop(0, `rgba(0,240,255,${alpha})`);
        grd.addColorStop(1, 'rgba(0,240,255,0)');
        ctx.beginPath();
        ctx.arc(x, y, pulseRadius * 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,240,255,${Math.min(0.95, 0.95 * this.dimFactor)})`;
        ctx.fill();
      }
    }

    /* ─────────────────────────────────────────────
     * Mouse Ripple Ring
     * ───────────────────────────────────────────── */
    class Ripple {
      constructor(x, y) {
        this.x      = x;
        this.y      = y;
        this.r      = 5;
        this.maxR   = 40;
        this.life   = 30; // frames
        this.maxLife= 30;
      }

      update() {
        this.r    = lerp(this.r, this.maxR, 0.12);
        this.life--;
      }

      draw() {
        const t     = this.life / this.maxLife;
        const alpha = t * 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,240,255,${alpha})`;
        ctx.lineWidth   = 1.5;
        ctx.stroke();
      }

      get done() { return this.life <= 0; }
    }

    /* ─────────────────────────────────────────────
     * Build particle & star lists
     * ───────────────────────────────────────────── */
    const buildParticles = () => {
      const isMobile  = W < 768;
      const baseCount = isMobile ? 40 : Math.floor(rand(100, 121));
      const hubCount  = isMobile ? 4  : Math.floor(rand(8, 13));

      particles = [];
      // Hub nodes first
      for (let i = 0; i < hubCount; i++) {
        particles.push(new Particle(true));
      }
      // Regular nodes
      for (let i = 0; i < baseCount - hubCount; i++) {
        particles.push(new Particle(false));
      }
    };

    const buildStars = () => {
      const count = W < 768 ? 100 : 220;
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push(new Star());
      }
    };

    const buildOrbs = () => {
      const count = W < 768 ? 3 : 6;
      orbs = [];
      for (let i = 0; i < count; i++) {
        orbs.push(new GradientOrb());
      }
    };

    /* ─────────────────────────────────────────────
     * Resize handler
     * ───────────────────────────────────────────── */
    const onResize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      buildParticles();
      buildStars();
      buildOrbs();
    };

    /* ─────────────────────────────────────────────
     * Draw connections (enhanced)
     * ───────────────────────────────────────────── */
    const drawConnections = (parallaxOffset) => {
      const len = particles.length;
      for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const d  = dist(p1.x, p1.y, p2.x, p2.y);
          if (d > CONNECTION_DIST) continue;

          let opacity = (1 - d / CONNECTION_DIST) * 0.12;

          const dToMouse1     = dist(p1.x, p1.y, mouse.x, mouse.y);
          const dToMouse2     = dist(p2.x, p2.y, mouse.x, mouse.y);
          const closestToMouse= Math.min(dToMouse1, dToMouse2);
          let nearMouse = false;

          if (closestToMouse < MOUSE_ATTRACT_DIST) {
            const boost = (1 - closestToMouse / MOUSE_ATTRACT_DIST) * 0.28;
            opacity     = clamp(opacity + boost, 0, 0.4);
            nearMouse   = true;
          }

          const py1 = p1.y + parallaxOffset;
          const py2 = p2.y + parallaxOffset;

          ctx.beginPath();
          ctx.moveTo(p1.x, py1);
          ctx.lineTo(p2.x, py2);

          if (nearMouse && isDarkTheme) {
            ctx.strokeStyle = `rgba(0,240,255,${opacity})`;
            ctx.lineWidth   = 1.0;
          } else {
            ctx.strokeStyle = isDarkTheme
              ? `rgba(0,240,255,${opacity})`
              : `rgba(32,72,91,${Math.min(0.8, opacity * 1.9)})`;
            ctx.lineWidth = 0.6;
          }
          ctx.stroke();
        }
      }
    };

    /* ─────────────────────────────────────────────
     * Synaptic fire burst: pick a hub node & emit particles
     * ───────────────────────────────────────────── */
    let burstTimeout;
    const scheduleBurst = () => {
      const delay = rand(2000, 4000);
      burstTimeout = setTimeout(() => {
        const hubs = particles.filter((p) => p.isHub);
        if (hubs.length) {
          const hub     = hubs[Math.floor(rand(0, hubs.length))];
          const count   = Math.floor(rand(12, 21));
          for (let i = 0; i < count; i++) {
            burstParts.push(new BurstParticle(hub.x, hub.y));
          }
        }
        scheduleBurst();
      }, delay);
    };

    /* ─────────────────────────────────────────────
     * Schedule electric pulses (prefer hub nodes as start)
     * ───────────────────────────────────────────── */
    const schedulePulse = () => {
      const delay = rand(PULSE_INTERVAL_MIN, PULSE_INTERVAL_MAX);
      setTimeout(() => {
        if (particles.length < 2) { schedulePulse(); return; }

        // Prefer a hub as origin, fall back to random
        const hubs = particles.map((p, i) => p.isHub ? i : -1).filter((i) => i !== -1);
        const fromIdx = hubs.length > 0 && Math.random() < 0.7
          ? hubs[Math.floor(rand(0, hubs.length))]
          : Math.floor(rand(0, particles.length));

        const p1 = particles[fromIdx];
        const neighbours = [];
        for (let i = 0; i < particles.length; i++) {
          if (i === fromIdx) continue;
          if (dist(p1.x, p1.y, particles[i].x, particles[i].y) <= CONNECTION_DIST) {
            neighbours.push(i);
          }
        }

        if (neighbours.length > 0) {
          const toIdx = neighbours[Math.floor(rand(0, neighbours.length))];
          pulses.push(new Pulse(fromIdx, toIdx, 1.0, 0));
        }

        schedulePulse();
      }, delay);
    };

    /* ─────────────────────────────────────────────
     * Section proximity effect
     * Updates particle opacity boost for nodes near active section headings
     * ───────────────────────────────────────────── */
    const sectionHeadings = [];
    const initSectionProximity = () => {
      document.querySelectorAll('section h2').forEach((h2) => {
        sectionHeadings.push(h2);
      });
    };

    const applySectionProximity = () => {
      if (!sectionHeadings.length) return;
      const BAND = 200; // px

      for (const h2 of sectionHeadings) {
        const rect = h2.getBoundingClientRect();
        const headingY = rect.top + rect.height / 2;

        if (headingY < -BAND || headingY > H + BAND) continue;

        for (const p of particles) {
          const pScreenY = p.y; // particles are already in screen space during render
          const dy = Math.abs(pScreenY - headingY);
          if (dy < BAND) {
            const boost = (1 - dy / BAND) * 0.35;
            p.proxBoost = Math.max(p.proxBoost, boost);
          }
        }
      }
    };

    /* ─────────────────────────────────────────────
     * Mouse ripple on fast movement
     * ───────────────────────────────────────────── */
    const handleMouseRipple = () => {
      if (mouse.speed > 5 && ripples.length < MAX_RIPPLES) {
        ripples.push(new Ripple(mouse.x, mouse.y));
      }
    };

    /* ─────────────────────────────────────────────
     * Main animation loop
     * ───────────────────────────────────────────── */
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, W, H);

      // Parallax offsets
      const starOffset = scrollY * -0.1;
      const mainOffset = scrollY * -0.3;

      // --- Draw gradient orbs (deepest layer) ---
      for (const orb of orbs) {
        orb.update();
        orb.draw();
      }

      // --- Layer 1: Background stars ---
      for (const s of stars) {
        s.update();
        s.draw(starOffset);
      }

      // --- Layer 4: Dendrites drawn before connections (part of particle.draw()) ---
      // --- Layer 2: Connections ---
      drawConnections(mainOffset);

      // --- Section proximity ---
      applySectionProximity();

      // --- Layer 2: Update & draw particles ---
      for (const p of particles) {
        p.update();
        p.draw(mainOffset);
      }

      // --- Layer 3: Synaptic burst particles ---
      for (const bp of burstParts) {
        bp.update();
        bp.draw();
      }
      burstParts = burstParts.filter((bp) => bp.life > 0);

      // --- Layer 5: Electric pulses ---
      for (const pulse of pulses) {
        pulse.update();
        pulse.draw();
      }
      pulses = pulses.filter((p) => !p.done);

      // --- Mouse ripples ---
      handleMouseRipple();
      for (const rip of ripples) {
        rip.update();
        rip.draw();
      }
      ripples = ripples.filter((r) => !r.done);

      animFrame = requestAnimationFrame(animate);
    };

    /* ─────────────────────────────────────────────
     * Init
     * ───────────────────────────────────────────── */
    onResize();
    window.addEventListener('resize', onResize, { passive: true });

    window.addEventListener('mousemove', (e) => {
      mouse.speed = dist(mouse.x, mouse.y, e.clientX, e.clientY);
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
      mouse.x     = e.clientX;
      mouse.y     = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.speed = 0;
    });

    // Scroll parallax
    window.addEventListener('scroll', () => {
      scrollY = window.scrollY;
    }, { passive: true });

    if (!prefersReducedMotion) {
      initSectionProximity();
      animate();
      schedulePulse();
      scheduleBurst();
    }

    /* ─────────────────────────────────────────────
     * Expose theme update
     * ───────────────────────────────────────────── */
    window._neuralSetTheme = (dark) => {
      isDarkTheme = dark;
    };
  };

  /* =========================================================
   * SECTION 4: CURSOR GLOW
   * ========================================================= */
  const initCursorGlow = () => {
    const glow = document.querySelector('.cursor-glow');
    if (!glow || prefersReducedMotion) return;

    let curX = -200, curY = -200;
    let glowX = -200, glowY = -200;

    document.addEventListener('mousemove', (e) => {
      curX = e.clientX;
      curY = e.clientY;
      glow.classList.add('active');
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      glow.classList.remove('active');
    });

    const updateGlow = () => {
      glowX = lerp(glowX, curX, 0.08);
      glowY = lerp(glowY, curY, 0.08);
      glow.style.transform = `translate(${glowX - 200}px, ${glowY - 200}px)`;
      requestAnimationFrame(updateGlow);
    };
    updateGlow();
  };

  /* =========================================================
   * SECTION 5: THEME TOGGLE
   * ========================================================= */
  const initThemeToggle = () => {
    const html = document.documentElement;
    const btn  = document.querySelector('[data-theme-toggle]');
    if (!btn) return;
    const storageKey = 'portfolio-theme';

    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>`;

    const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>`;

    const applyTheme = (isDark) => {
      if (isDark) {
        html.setAttribute('data-theme', 'dark');
        btn.innerHTML = sunIcon;
        btn.setAttribute('aria-label', 'Switch to light theme');
      } else {
        html.setAttribute('data-theme', 'light');
        btn.innerHTML = moonIcon;
        btn.setAttribute('aria-label', 'Switch to dark theme');
      }
      try {
        localStorage.setItem(storageKey, isDark ? 'dark' : 'light');
      } catch (error) {
        // Ignore storage errors in privacy-restricted environments.
      }
      if (window._neuralSetTheme) window._neuralSetTheme(isDark);
    };

    let storedTheme = null;
    try {
      storedTheme = localStorage.getItem(storageKey);
    } catch (error) {
      storedTheme = null;
    }

    const initialTheme = storedTheme || html.getAttribute('data-theme') || 'light';
    applyTheme(initialTheme === 'dark');

    btn.addEventListener('click', () => {
      const currentlyDark = html.getAttribute('data-theme') === 'dark';
      applyTheme(!currentlyDark);
    });
  };

  /* =========================================================
   * SECTION 6: TRACK TOGGLE
   * ========================================================= */
  const initTrackToggle = () => {
    const trackBtns = document.querySelectorAll('.track-btn');
    if (!trackBtns.length) return;
    const storageKey = 'portfolio-track';

    const setTrack = (track) => {
      trackBtns.forEach((btn) => {
        const isActive = (btn.dataset.track || btn.dataset.trackValue || btn.textContent.trim()) === track;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
      });

      document.body.dataset.activeTrack = track;
      document.body.classList.add('track-transitioning');
      setTimeout(() => {
        document.body.classList.remove('track-transitioning');
      }, 500);

      try {
        localStorage.setItem(storageKey, track);
      } catch (error) {
        // Ignore storage errors in privacy-restricted environments.
      }
    };

    trackBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const track = btn.dataset.track || btn.dataset.trackValue || btn.textContent.trim();
        setTrack(track);
      });
    });

    let storedTrack = null;
    try {
      storedTrack = localStorage.getItem(storageKey);
    } catch (error) {
      storedTrack = null;
    }

    setTrack(storedTrack || document.body.dataset.activeTrack || 'ai');
  };

  /* =========================================================
   * SECTION 7: MOBILE NAV
   * ========================================================= */
  const initMobileNav = () => {
    const toggle  = document.querySelector('.nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (!toggle || !navMenu) return;

    const openNav = () => {
      navMenu.classList.add('open');
      toggle.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };

    const closeNav = () => {
      navMenu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
      navMenu.classList.contains('open') ? closeNav() : openNav();
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        closeNav();
        toggle.focus();
      }
    });
  };

  /* =========================================================
   * SECTION 8: SCROLLED NAV & ACTIVE NAV LINK
   * ========================================================= */
  const initNav = () => {
    const nav      = document.querySelector('.site-nav');
    const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
    const sections = [];

    navLinks.forEach((link) => {
      const id      = link.getAttribute('href').slice(1);
      const section = document.getElementById(id);
      if (section) sections.push({ link, section });
    });

    const onScroll = () => {
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);

      if (!sections.length) return;
      let activeIdx = 0;
      const scrollMid = window.scrollY + window.innerHeight / 3;

      sections.forEach(({ section }, i) => {
        if (section.offsetTop <= scrollMid) activeIdx = i;
      });

      navLinks.forEach((l) => l.classList.remove('active'));
      sections[activeIdx].link.classList.add('active');
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  };

  /* =========================================================
   * SECTION 9: HERO ENTRANCE
   * ========================================================= */
  const initHeroEntrance = () => {
    const heroText  = document.querySelector('.hero-text');
    const heroMedia = document.querySelector('.hero-media');
    const revealHero = () => {
      if (heroText) heroText.classList.add('loaded');
      if (heroMedia) heroMedia.classList.add('loaded');
    };

    if (document.readyState === 'complete') {
      setTimeout(revealHero, 100);
      return;
    }

    window.addEventListener('load', () => {
      setTimeout(revealHero, 100);
    });
  };

  /* =========================================================
   * SECTION 10: INTERSECTION OBSERVERS + SHIMMER + TYPING CURSOR
   * ========================================================= */
  const initIntersectionObservers = () => {
    // --- .stagger-in → .active ---
    const staggerEls = document.querySelectorAll('.stagger-in');
    if (staggerEls.length) {
      const staggerObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('active');
              staggerObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      staggerEls.forEach((el) => staggerObserver.observe(el));
    }

    // --- .reveal → .visible ---
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      revealEls.forEach((el) => revealObserver.observe(el));
    }

    // --- Section h2 shimmer ---
    const h2Els = document.querySelectorAll('section h2');
    if (h2Els.length) {
      const shimmerObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('shimmer-active');
              shimmerObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      h2Els.forEach((el) => shimmerObserver.observe(el));
    }
  };

  /** Typing cursor on the hero eyebrow element */
  const initTypingCursor = () => {
    const eyebrow = document.querySelector('.eyebrow');
    if (!eyebrow || prefersReducedMotion) return;

    // Only add once
    if (eyebrow.querySelector('.typing-cursor')) return;

    const cursor = document.createElement('span');
    cursor.className   = 'typing-cursor';
    cursor.textContent = '|';
    cursor.setAttribute('aria-hidden', 'true');
    eyebrow.appendChild(cursor);
  };

  /* =========================================================
   * SECTION 11: NUMBER COUNTER
   * ========================================================= */
  const initCounters = () => {
    const counters = document.querySelectorAll('.counter-value');
    if (!counters.length) return;

    const DURATION = 1200;

    const animateCounter = (el) => {
      const target   = parseFloat(el.dataset.count || 0);
      const suffix   = el.dataset.suffix || '';
      const prefix   = el.dataset.prefix || '';
      const isFloat  = String(target).includes('.');
      const decimals = isFloat ? (String(target).split('.')[1] || '').length : 0;
      const start    = performance.now();

      const step = (now) => {
        const elapsed  = now - start;
        const progress = clamp(elapsed / DURATION, 0, 1);
        const eased    = easeOutCubic(progress);
        const current  = eased * target;
        el.textContent = prefix + current.toFixed(decimals) + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = prefix + target.toFixed(decimals) + suffix;
        }
      };

      requestAnimationFrame(step);
    };

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    counters.forEach((el) => {
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      el.textContent = prefix + '0' + suffix;
      counterObserver.observe(el);
    });
  };

  /* =========================================================
   * SECTION 12: SMOOTH SCROLL
   * ========================================================= */
  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();

        if (!prefersReducedMotion && 'scrollBehavior' in document.documentElement.style) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          target.scrollIntoView({ block: 'start' });
        }
      });
    });
  };

  /* =========================================================
   * SECTION 13: SCROLL PROGRESS INDICATOR
   * ========================================================= */
  const initScrollProgress = () => {
    if (prefersReducedMotion) return;

    // Build the DOM elements
    const bar = document.createElement('div');
    bar.id = 'scroll-progress-bar';
    Object.assign(bar.style, {
      position:   'fixed',
      top:        '0',
      right:      '0',
      width:      '3px',
      height:     '100vh',
      zIndex:     '9999',
      pointerEvents: 'none',
    });

    const fill = document.createElement('div');
    fill.id = 'scroll-progress-fill';
    Object.assign(fill.style, {
      width:      '100%',
      height:     '0%',
      background: 'linear-gradient(to bottom, rgba(0,240,255,0.9), rgba(139,92,246,0.7))',
      transition: 'height 0.05s linear',
      borderRadius: '0 0 2px 2px',
    });

    const dot = document.createElement('div');
    dot.id = 'scroll-progress-dot';
    Object.assign(dot.style, {
      position:     'absolute',
      right:        '-2px',
      width:        '7px',
      height:       '7px',
      borderRadius: '50%',
      background:   'rgba(0,240,255,1)',
      boxShadow:    '0 0 8px 2px rgba(0,240,255,0.7)',
      transform:    'translateX(-50%)',
      top:          '0%',
    });

    bar.appendChild(fill);
    bar.appendChild(dot);
    document.body.appendChild(bar);

    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = clamp(window.scrollY / scrollable, 0, 1);
      const pct      = (progress * 100).toFixed(2);
      fill.style.height  = pct + '%';
      dot.style.top      = pct + '%';
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
  };

  /* =========================================================
   * SECTION 14: MAGNETIC BUTTONS
   * ========================================================= */
  const initMagneticButtons = () => {
    if (prefersReducedMotion) return;

    const MAGNETIC_DIST = 80;  // px — activation radius
    const MAX_OFFSET    = 6;   // px — maximum translate

    const buttons = document.querySelectorAll('.btn');
    if (!buttons.length) return;

    buttons.forEach((btn) => {
      let targetX = 0, targetY = 0;
      let currentX = 0, currentY = 0;
      let rafId;
      let isNear = false;

      const lerping = () => {
        currentX = lerp(currentX, targetX, 0.12);
        currentY = lerp(currentY, targetY, 0.12);
        btn.style.transform = `translate(${currentX}px, ${currentY}px)`;

        if (isNear || Math.abs(currentX) > 0.1 || Math.abs(currentY) > 0.1) {
          rafId = requestAnimationFrame(lerping);
        } else {
          btn.style.transform = '';
          cancelAnimationFrame(rafId);
        }
      };

      document.addEventListener('mousemove', (e) => {
        const rect    = btn.getBoundingClientRect();
        const cx      = rect.left + rect.width  / 2;
        const cy      = rect.top  + rect.height / 2;
        const dx      = e.clientX - cx;
        const dy      = e.clientY - cy;
        const d       = Math.sqrt(dx * dx + dy * dy);

        if (d < MAGNETIC_DIST) {
          const power  = (1 - d / MAGNETIC_DIST);
          targetX = dx * power * (MAX_OFFSET / (MAGNETIC_DIST * 0.5));
          targetY = dy * power * (MAX_OFFSET / (MAGNETIC_DIST * 0.5));
          targetX = clamp(targetX, -MAX_OFFSET, MAX_OFFSET);
          targetY = clamp(targetY, -MAX_OFFSET, MAX_OFFSET);

          if (!isNear) {
            isNear = true;
            cancelAnimationFrame(rafId);
            rafId  = requestAnimationFrame(lerping);
          }
        } else if (isNear) {
          isNear  = false;
          targetX = 0;
          targetY = 0;
          if (!rafId) rafId = requestAnimationFrame(lerping);
        }
      }, { passive: true });

      btn.addEventListener('mouseleave', () => {
        isNear  = false;
        targetX = 0;
        targetY = 0;
        if (!rafId) rafId = requestAnimationFrame(lerping);
      });
    });
  };

  /* =========================================================
   * SECTION 15: PROJECT CARD 3D TILT
   * ========================================================= */
  const initCardTilt = () => {
    if (prefersReducedMotion) return;

    const cards = document.querySelectorAll('.project-card');
    if (!cards.length) return;

    const MAX_ROTATE = 4; // degrees

    cards.forEach((card) => {
      let tiltX = 0, tiltY = 0;
      let currentTiltX = 0, currentTiltY = 0;
      let rafId;
      let isHovered = false;

      // Reflection overlay element
      const reflection = document.createElement('div');
      reflection.className = 'card-reflection';
      Object.assign(reflection.style, {
        position:       'absolute',
        inset:          '0',
        borderRadius:   'inherit',
        pointerEvents:  'none',
        opacity:        '0',
        transition:     'opacity 0.3s ease',
        background:     'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 70%)',
        zIndex:         '1',
      });
      // Ensure card has position context
      if (getComputedStyle(card).position === 'static') {
        card.style.position = 'relative';
      }
      card.appendChild(reflection);

      const lerpTilt = () => {
        currentTiltX = lerp(currentTiltX, tiltX, 0.1);
        currentTiltY = lerp(currentTiltY, tiltY, 0.1);

        card.style.transform =
          `perspective(800px) rotateX(${currentTiltX}deg) rotateY(${currentTiltY}deg)`;

        if (
          isHovered ||
          Math.abs(currentTiltX - tiltX) > 0.01 ||
          Math.abs(currentTiltY - tiltY) > 0.01
        ) {
          rafId = requestAnimationFrame(lerpTilt);
        } else {
          card.style.transform = '';
          cancelAnimationFrame(rafId);
        }
      };

      card.addEventListener('mousemove', (e) => {
        const rect  = card.getBoundingClientRect();
        const relX  = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 to 0.5
        const relY  = (e.clientY - rect.top)  / rect.height - 0.5;

        tiltY =  relX * MAX_ROTATE;
        tiltX = -relY * MAX_ROTATE;

        // Move the reflection highlight toward mouse
        const pctX = ((relX + 0.5) * 100).toFixed(1);
        const pctY = ((relY + 0.5) * 100).toFixed(1);
        reflection.style.background =
          `radial-gradient(circle at ${pctX}% ${pctY}%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 65%)`;
      }, { passive: true });

      card.addEventListener('mouseenter', () => {
        isHovered = true;
        reflection.style.opacity = '1';
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(lerpTilt);
      });

      card.addEventListener('mouseleave', () => {
        isHovered = false;
        tiltX = 0;
        tiltY = 0;
        reflection.style.opacity = '0';
        if (!rafId) rafId = requestAnimationFrame(lerpTilt);
      });
    });
  };

  /* =========================================================
   * SECTION 16: INIT ALL
   * ========================================================= */
  const init = () => {
    initNeuralCanvas();
    initCursorGlow();
    initThemeToggle();
    initTrackToggle();
    initMobileNav();
    initNav();
    initHeroEntrance();
    initIntersectionObservers();
    initTypingCursor();
    initCounters();
    initSmoothScroll();
    initScrollProgress();
    initMagneticButtons();
    initCardTilt();
  };

  // Boot after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
