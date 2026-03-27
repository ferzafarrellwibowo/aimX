export type GameMode = 'grid' | 'speed' | 'precision' | 'tracking' | 'switch-tracking' | 'flick';

export interface GameSettings {
  mode: GameMode;
  duration: number; // in milliseconds
}

export interface Target {
  id: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  targetVx?: number;
  targetVy?: number;
  radius: number;
  spawnTime: number;
  lifetime: number; // how long it stays, use Infinity for click-only kill
  active: boolean;
  opacity: number;
  isHovered?: boolean;
  hoverTime?: number;
}

export interface GameState {
  score: number;
  hits: number;
  misses: number;
  startTime: number;
  timeLeft: number;
  isRunning: boolean;
  totalReactionTime: number;
  targets: Target[];
  missMarkers: MissMarker[];
}

export interface MissMarker {
  id: string;
  x: number;
  y: number;
  spawnTime: number;
}

export type HUDUpdateCallback = (state: GameState) => void;

interface GameConfig {
  maxTargets: number;
  targetRadius: number;
  spawnRate: number; // ms between spawns
  lifetime: number;
}

const MODES: Record<GameMode, GameConfig> = {
  grid: {
    maxTargets: 3,
    targetRadius: 40,
    spawnRate: 0,
    lifetime: 99999999,
  },
  speed: {
    maxTargets: 5,
    targetRadius: 30,
    spawnRate: 200,
    lifetime: 1500,
  },
  precision: {
    maxTargets: 2,
    targetRadius: 15,
    spawnRate: 800,
    lifetime: 2000,
  },
  tracking: {
    maxTargets: 1,
    targetRadius: 35,
    spawnRate: 99999999, // practically infinity
    lifetime: 99999999,
  },
  'switch-tracking': {
    maxTargets: 1,
    targetRadius: 35,
    spawnRate: 99999999,
    lifetime: 99999999,
  },
  flick: {
    maxTargets: 1,
    targetRadius: 15, // Ukuran target tengah (kecil)
    spawnRate: 0,
    lifetime: 99999999,
  }
};

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private settings: GameSettings;
  private state: GameState;
  private config: GameConfig;
  
  private animationFrameId: number | null = null;
  private lastSpawnTime: number = 0;
  private lastHitPos: { x: number, y: number } | null = null;
  
  private mouseX: number = -1000;
  private mouseY: number = -1000;
  private lastTrackTime: number = 0;

  private onHUDUpdate: HUDUpdateCallback;
  private onGameOver: (state: GameState) => void;
  
  private bindedPointerDown: (e: PointerEvent) => void;
  private bindedPointerMove: (e: PointerEvent) => void;

  constructor(
    canvas: HTMLCanvasElement, 
    settings: GameSettings, 
    onHUDUpdate: HUDUpdateCallback,
    onGameOver: (state: GameState) => void
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error("Could not get 2D context");
    this.ctx = context;
    this.settings = settings;
    this.config = MODES[settings.mode];
    this.onHUDUpdate = onHUDUpdate;
    this.onGameOver = onGameOver;
    
    this.state = {
      score: 0,
      hits: 0,
      misses: 0,
      startTime: 0,
      timeLeft: settings.duration,
      isRunning: false,
      totalReactionTime: 0,
      targets: [],
      missMarkers: [],
    };

    this.bindedPointerDown = this.handlePointerDown.bind(this);
    this.bindedPointerMove = this.handlePointerMove.bind(this);
  }

  public start() {
    this.canvas.addEventListener('pointerdown', this.bindedPointerDown);
    this.canvas.addEventListener('pointermove', this.bindedPointerMove);
    this.state.isRunning = true;
    this.state.startTime = performance.now();
    this.lastSpawnTime = this.state.startTime;
    this.lastTrackTime = this.state.startTime;
    
    this.loop(performance.now());
  }

  public cleanup() {
    this.state.isRunning = false;
    this.canvas.removeEventListener('pointerdown', this.bindedPointerDown);
    this.canvas.removeEventListener('pointermove', this.bindedPointerMove);
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private loop(now: number) {
    if (!this.state.isRunning) return;

    // Update time
    const elapsed = now - this.state.startTime;
    this.state.timeLeft = Math.max(0, this.settings.duration - elapsed);

    if (this.state.timeLeft <= 0) {
      this.endGame();
      return;
    }

    this.updateLogic(now);
    this.render();

    // Call HUD update, but throttle it maybe, or just let React handle it 
    // Usually requestAnimationFrame runs 60fps, we might want to throttle HUD updates to 10-20fps to save React renders
    // For simplicity, we trigger it every frame. If it's slow, we throttle.
    if (Math.floor(elapsed) % 4 === 0) {
      this.onHUDUpdate({ ...this.state });
    }

    this.animationFrameId = requestAnimationFrame((n) => this.loop(n));
  }

  private updateLogic(now: number) {
    if (this.settings.mode === 'tracking' || this.settings.mode === 'switch-tracking') {
      // Tracking spawn
      if (this.state.targets.length === 0) {
        this.spawnTarget(now);
      }
      
      const t = this.state.targets[0];
      if (t) {
        // Initialize target velocities if needed
        if (t.targetVx === undefined) t.targetVx = 0;
        if (t.targetVy === undefined) t.targetVy = 0;
        if (t.vx === undefined) t.vx = 0;
        if (t.vy === undefined) t.vy = 0;

        // "Strafe" logic: smoothly change target velocity occasionally (e.g. every ~1-1.5s on avg)
        if (Math.random() < 0.015) {
           const speedOptions = [-3.5, 3.5, -4, 4]; 
           // Primarily move left/right (strafe)
           t.targetVx = speedOptions[Math.floor(Math.random() * speedOptions.length)];
           // Add slight vertical drift
           t.targetVy = (Math.random() - 0.5) * 2;
        }

        // Smoothly interpolate current velocity towards target velocity
        t.vx += (t.targetVx - t.vx) * 0.02; // lower number = slower acceleration/turn
        t.vy += (t.targetVy - t.vy) * 0.02;

        t.x += t.vx;
        t.y += t.vy;

        // Bounce off walls smoothly (reverse target velocity and cap position)
        if (t.x - t.radius < 0) {
          t.targetVx = Math.abs(t.targetVx);
          t.x = t.radius;
        } else if (t.x + t.radius > this.canvas.width) {
          t.targetVx = -Math.abs(t.targetVx);
          t.x = this.canvas.width - t.radius;
        }

        if (t.y - t.radius < 0) {
          t.targetVy = Math.abs(t.targetVy);
          t.y = t.radius;
        } else if (t.y + t.radius > this.canvas.height) {
          t.targetVy = -Math.abs(t.targetVy);
          t.y = this.canvas.height - t.radius;
        }

    // Cek hover hitboxnya dengan ketat sesuai `t.radius` + jangan berikan bonus range.
        const dx = t.x - this.mouseX;
        const dy = t.y - this.mouseY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        t.isHovered = dist <= t.radius; // Hitbox harus PAS di dalam atau border lingkaran radius.
        t.opacity = 1; // Always fully visible

        // Score ticks every 100ms
        if (now - this.lastTrackTime > 100) {
           if (t.isHovered) {
             this.state.score += 25;
             this.state.hits++; // We log hits as "Track Ticks"
             
             if (this.settings.mode === 'switch-tracking') {
               t.hoverTime = (t.hoverTime || 0) + (now - this.lastTrackTime);
               if (t.hoverTime >= 3000) {
                 this.lastHitPos = { x: t.x, y: t.y };
                 this.state.targets.splice(0, 1);
               }
             }
           }
           // if not hovered, no points ("tidak mendapatkan poin ketika mouse diluar target")

           this.lastTrackTime = now;
        }
      }
      return; 
    }

    // Spawn targets
    if (this.settings.mode === 'grid' || this.settings.mode === 'flick') {
      while (this.state.targets.length < this.config.maxTargets) {
        this.spawnTarget(now);
      }
    } else if (now - this.lastSpawnTime > this.config.spawnRate && this.state.targets.length < this.config.maxTargets) {
      this.spawnTarget(now);
      this.lastSpawnTime = now;
    }

    // Update targets (fade, remove old)
    for (let i = this.state.targets.length - 1; i >= 0; i--) {
      const t = this.state.targets[i];
      const age = now - t.spawnTime;
      
      if (age > t.lifetime) {
        // Despawned automatically (count as miss or ignore? Aim trainers usually just ignore or penalize slightly)
        this.state.targets.splice(i, 1);
      } else {
        // Simple fade in/out calc, mostly for visual flair
        if (this.settings.mode === 'grid' || this.settings.mode === 'flick') {
          t.opacity = 1; // Appears instantly
        } else {
          let p = age / t.lifetime;
          t.opacity = p > 0.8 ? 1 - ((p - 0.8) * 5) : Math.min(1, p * 5); // fade in fast, fade out fast at end
        }
      }
    }

    // Update miss markers (fade or remove after short time)
    for (let i = this.state.missMarkers.length - 1; i >= 0; i--) {
      if (now - this.state.missMarkers[i].spawnTime > 500) { // stay for 500ms
        this.state.missMarkers.splice(i, 1);
      }
    }
  }

  private spawnTarget(now: number) {
    const padding = this.config.targetRadius * 2;
    let x = 0, y = 0;
    let isValid = false;
    let attempts = 0;

    while (!isValid && attempts < 20) {
      isValid = true;
      attempts++;

      if (this.settings.mode === 'grid') {
        const cols = 3;
        const rows = 3;
        
        // Batasi ukuran grid agar jangkauan target tidak terlalu jauh
        const maxGridSize = 450; // Jangkauan maksimal dalam pixel
        const gridW = Math.min(this.canvas.width * 0.6, maxGridSize);
        const gridH = Math.min(this.canvas.height * 0.6, maxGridSize);
        
        const cellW = gridW / cols;
        const cellH = gridH / rows;
        
        // Hitung offset agar grid tetap berada di tengah layar
        const offsetX = (this.canvas.width - gridW) / 2;
        const offsetY = (this.canvas.height - gridH) / 2;
        
        const c = Math.floor(Math.random() * cols);
        const r = Math.floor(Math.random() * rows);
        
        x = offsetX + c * cellW + cellW / 2;
        y = offsetY + r * cellH + cellH / 2;
      } else if (this.settings.mode === 'flick') {
        const isCenterTarget = this.state.hits % 2 === 0;
        
        if (isCenterTarget) {
          x = this.canvas.width / 2;
          y = this.canvas.height / 2;
        } else {
          // Spawn target random yang lebih besar
          const flickTargetRadius = 35; // Ukuran target random
          const padding = flickTargetRadius * 2;
          
          let validRandomPos = false;
          let rAttempts = 0;
          
          while (!validRandomPos && rAttempts < 10) {
              x = padding + Math.random() * (this.canvas.width - padding * 2);
              y = padding + Math.random() * (this.canvas.height - padding * 2);
              
              // Jauhi sedikit dari area tengah (jangan terlalu dekat dengan spot klik sebelumnya)
              const dxCenter = x - (this.canvas.width / 2);
              const dyCenter = y - (this.canvas.height / 2);
              const distToCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
              
              if (distToCenter > 100) {
                  validRandomPos = true;
              }
              rAttempts++;
          }
        }
      } else {
        x = padding + Math.random() * (this.canvas.width - padding * 2);
        y = padding + Math.random() * (this.canvas.height - padding * 2);
      }
      
      // Prevent overlap with existing active targets
      const isOverlapping = this.state.targets.some(t => {
        const dx = t.x - x;
        const dy = t.y - y;
        // Strict overlap detection: Check if it's the exact same spot OR too close
        return Math.sqrt(dx*dx + dy*dy) < this.config.targetRadius * 2.5;
      });

      if (isOverlapping) {
        isValid = false;
        continue;
      }

        // Menghindari random generator memilih kotak Grid yang benar-benar sama seperti klik sebelumnya.
        if (this.settings.mode === 'grid') {
            if (this.lastHitPos && Math.abs(this.lastHitPos.x - x) < 5 && Math.abs(this.lastHitPos.y - y) < 5) {
                isValid = false;
                continue;
            }
        } else {
            // Prevent spawning exactly where the last target was just hit (to prevent instant double-clicks on same spot)
            if (this.lastHitPos) {
              const dx = this.lastHitPos.x - x;
              const dy = this.lastHitPos.y - y;
              const distFromLast = Math.sqrt(dx*dx + dy*dy);
              if (distFromLast < this.config.targetRadius * 3) { // Distance ditingkatkan ke 3x radius target agar lebih aman
                isValid = false;
                continue;
              }
            }
        }
    }

    if (!isValid) return; // Skip spawn this frame if we couldn't find a valid spot after 20 attempts

    let overrideRadius = this.config.targetRadius;
    if (this.settings.mode === 'flick') {
      const isCenterTarget = this.state.hits % 2 === 0;
      overrideRadius = isCenterTarget ? 15 : 35; // Center = small (15), Random = big (35)
    }

    this.state.targets.push({
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      radius: overrideRadius,
      spawnTime: now,
      lifetime: this.config.lifetime,
      active: true,
      opacity: 0,
    });
  }

  private handlePointerMove(e: PointerEvent) {
    if (!this.state.isRunning) return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    this.mouseX = (e.clientX - rect.left) * scaleX;
    this.mouseY = (e.clientY - rect.top) * scaleY;
  }

  private handlePointerDown(e: PointerEvent) {
    if (!this.state.isRunning || this.settings.mode === 'tracking' || this.settings.mode === 'switch-tracking') return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const now = performance.now();
    let hit = false;

    // Check hit reversed array to hit top-most targets
    for (let i = this.state.targets.length - 1; i >= 0; i--) {
      const t = this.state.targets[i];
      const dx = t.x - x;
      const dy = t.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Hitbox yang persis sama dengan ukuran radius target tanpa bonus ukuran.
      if (distance <= t.radius) {
        hit = true;
        this.state.score += 100;
        this.state.hits++;
        this.state.totalReactionTime += (now - t.spawnTime);
        
        // Save the hit position to prevent immediate respawns on this spot
        this.lastHitPos = { x: t.x, y: t.y };
        
        // Remove target
        this.state.targets.splice(i, 1);
        break; // Only hit one target
      }
    }

    if (!hit) {
      this.state.misses++;
      this.state.score = Math.max(0, this.state.score - 50); // Mencegah score negatif (opsional, jika ingin bisa negatif hilangkan Math.max)
      
      // Tambahkan efek miss (tanda X merah)
      this.state.missMarkers.push({
        id: Math.random().toString(36).substring(2, 9),
        x: x,
        y: y,
        spawnTime: now
      });
    }
  }

  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Background grid (optional)
    
    // Draw Targets
    for (const t of this.state.targets) {
      this.ctx.globalAlpha = Math.max(0, t.opacity);
      this.ctx.beginPath();
      this.ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = t.isHovered ? '#6366f1' : '#ededed'; // Bright white/gray, turns Indigo when tracked!
      this.ctx.fill();
      
      // Outline with subtle glow look by using shadow or stroke
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = '#ffffff'; 
      this.ctx.stroke();
    }
    
    // Draw Miss Markers
    const now = performance.now();
    for (const m of this.state.missMarkers) {
      const age = now - m.spawnTime;
      const opacity = Math.max(0, 1 - (age / 500)); // Fade out over 500ms
      
      this.ctx.globalAlpha = opacity;
      this.ctx.strokeStyle = '#ef4444'; // Red-500
      this.ctx.lineWidth = 3;
      
      const size = 10;
      this.ctx.beginPath();
      this.ctx.moveTo(m.x - size, m.y - size);
      this.ctx.lineTo(m.x + size, m.y + size);
      this.ctx.moveTo(m.x + size, m.y - size);
      this.ctx.lineTo(m.x - size, m.y + size);
      this.ctx.stroke();
    }

    this.ctx.globalAlpha = 1.0;
  }

  private endGame() {
    this.cleanup();
    this.onHUDUpdate({ ...this.state });
    this.onGameOver({ ...this.state });
  }
}
