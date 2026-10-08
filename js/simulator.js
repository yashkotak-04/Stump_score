/**
 * StumpScore — Live In-Browser Cricket Simulator with Equalizer Visualizer & Celebrations
 * Fully Optimized for Touchscreen Phones (Android & iOS WebKit) and Desktops
 */

window.handleSimAction = function(action, val, event) {
  if (event) {
    if (typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
  }
  if (!window.cricketSimulator) {
    window.cricketSimulator = new CricketSimulator();
  }
  if (window.cricketSimulator) {
    window.cricketSimulator.handleAction(action, val);
  }
};

class CricketSimulator {
  constructor() {
    this.initialState = {
      teamA: 'India',
      teamB: 'Australia',
      totalRuns: 184,
      wickets: 4,
      ballsBowled: 110, // 18.2 overs
      oversLimit: 20,
      striker: { name: 'V. Kohli', runs: 82, balls: 53, isStriker: true },
      nonStriker: { name: 'R. Sharma', runs: 54, balls: 32, isStriker: false },
      partnership: { runs: 68, balls: 39 },
      currentOver: ['1', '4', '0', '6', '1', 'W'],
      ballHistory: []
    };

    this.state = JSON.parse(JSON.stringify(this.initialState));
    this.audioCtx = null;
    this.initElements();
    this.bindEvents();
    this.render();
  }

  initAudio() {
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    } catch (e) {
      // Audio context error recovery
      this.audioCtx = null;
    }
  }

  animateSoundwaves(durationMs = 400) {
    const visualizer = document.getElementById('sim-soundwaves');
    if (visualizer) {
      visualizer.classList.add('is-active');
      clearTimeout(this.soundwaveTimer);
      this.soundwaveTimer = setTimeout(() => {
        visualizer.classList.remove('is-active');
      }, durationMs);
    }
  }

  spawnParticles(count = 12, emojis = ['✨', '🔥', '⚡', '⭐']) {
    const container = document.querySelector('.simulator-wrapper');
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      particle.className = 'sim-particle';
      particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const distance = 70 + Math.random() * 90;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 25;

      particle.style.left = '50%';
      particle.style.top = '45%';
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);

      container.appendChild(particle);

      setTimeout(() => {
        if (particle && particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 850);
    }
  }

  triggerCelebration(text, type = 'four') {
    let popup = document.getElementById('sim-celebration-popup');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'sim-celebration-popup';
      popup.className = 'sim-celebration-popup';
      const container = document.querySelector('.simulator-wrapper');
      if (container) container.appendChild(popup);
    }

    if (popup) {
      popup.textContent = text;
      popup.style.borderColor = type === 'six' ? 'var(--pitch-green)' : type === 'wicket' ? 'var(--wicket-red)' : 'var(--electric-blue)';
      popup.classList.add('is-active');

      clearTimeout(this.celebrationTimer);
      this.celebrationTimer = setTimeout(() => {
        popup.classList.remove('is-active');
      }, 1000);
    }

    // Spawn particle burst
    if (type === 'six') {
      this.spawnParticles(14, ['🚀', '💥', '🔥', '⚡', '6️⃣', '✨']);
    } else if (type === 'four') {
      this.spawnParticles(10, ['🔥', '🏏', '⚡', '4️⃣', '🌟']);
    } else if (type === 'wicket') {
      this.spawnParticles(12, ['🎯', '💥', '⚡', '🔴', '🧤']);
    } else {
      this.spawnParticles(6, ['✨', '⭐', '🏏']);
    }

    // Score bounce FX
    if (this.scoreEl) {
      this.scoreEl.style.transform = 'scale(1.12)';
      setTimeout(() => {
        if (this.scoreEl) this.scoreEl.style.transform = 'scale(1)';
      }, 200);
    }
  }

  playSound(type) {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      this.animateSoundwaves(type === 'six' ? 550 : type === 'four' ? 380 : 220);

      if (type === 'four') {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.14); // A5
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'six') {
        [440, 554.37, 659.25, 880].forEach((freq, idx) => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + 0.28);
          gain.gain.setValueAtTime(0.16 / (idx + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.55);
        });
      } else if (type === 'wicket') {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.22);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'dot') {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
      }
    } catch (e) {
      // Audio playback safely ignored if browser permissions policy prevents it
    }
  }

  initElements() {
    this.scoreEl = document.getElementById('sim-score');
    this.oversEl = document.getElementById('sim-overs');
    this.crrEl = document.getElementById('sim-crr');
    this.partnershipEl = document.getElementById('sim-partnership');
    this.strikerNameEl = document.getElementById('sim-striker-name');
    this.strikerScoreEl = document.getElementById('sim-striker-score');
    this.nonStrikerNameEl = document.getElementById('sim-nonstriker-name');
    this.nonStrikerScoreEl = document.getElementById('sim-nonstriker-score');
    this.overStripEl = document.getElementById('sim-over-strip');
  }

  bindEvents() {
    const actionBtns = document.querySelectorAll('[data-sim-action]');
    actionBtns.forEach(btn => {
      ['click', 'touchend'].forEach(evtType => {
        btn.addEventListener(evtType, (e) => {
          e.preventDefault();
          const action = btn.getAttribute('data-sim-action');
          const val = btn.getAttribute('data-sim-val');
          this.handleAction(action, val);
        }, { passive: false });
      });
    });

    // Document-level event delegation fallback for clicks and mobile taps
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-sim-action], .sim-btn');
      if (btn) {
        const action = btn.getAttribute('data-sim-action');
        const val = btn.getAttribute('data-sim-val');
        if (action) {
          e.preventDefault();
          this.handleAction(action, val);
        }
      }
    });
  }

  handleAction(action, val) {
    // Only save snapshot for regular scoring actions (not for undo or reset)
    if (action !== 'undo' && action !== 'reset') {
      this.state.ballHistory.push(JSON.stringify({
        teamA: this.state.teamA,
        teamB: this.state.teamB,
        totalRuns: this.state.totalRuns,
        wickets: this.state.wickets,
        ballsBowled: this.state.ballsBowled,
        oversLimit: this.state.oversLimit,
        striker: { ...this.state.striker },
        nonStriker: { ...this.state.nonStriker },
        partnership: { ...this.state.partnership },
        currentOver: [...this.state.currentOver]
      }));
    }

    if (action === 'run') {
      const runs = parseInt(val, 10);
      this.state.totalRuns += runs;
      this.state.ballsBowled += 1;
      this.state.striker.runs += runs;
      this.state.striker.balls += 1;
      this.state.partnership.runs += runs;
      this.state.partnership.balls += 1;

      this.addBallToOver(runs.toString(), runs === 4 ? 'four' : runs === 6 ? 'six' : runs === 0 ? 'dot' : 'run');

      if (runs === 4) {
        this.playSound('four');
        this.triggerCelebration('🔥 BOUNDARY FOUR!', 'four');
      } else if (runs === 6) {
        this.playSound('six');
        this.triggerCelebration('🚀 HUGE MAXIMUM 6!', 'six');
      } else if (runs === 0) {
        this.playSound('dot');
      } else {
        this.playSound('run');
      }

      if (runs % 2 === 1) {
        this.swapStrike();
      }

      if (this.state.ballsBowled % 6 === 0) {
        this.swapStrike();
        this.state.currentOver = [];
      }
    } else if (action === 'wicket') {
      this.state.wickets += 1;
      this.state.ballsBowled += 1;
      this.state.striker.balls += 1;
      this.state.partnership.balls += 1;

      this.addBallToOver('W', 'wicket');
      this.playSound('wicket');
      this.triggerCelebration('🎯 WICKET FALLEN!', 'wicket');

      this.state.striker = {
        name: `Batter ${this.state.wickets + 2}`,
        runs: 0,
        balls: 0,
        isStriker: true
      };

      this.state.partnership = { runs: 0, balls: 0 };

      if (this.state.ballsBowled % 6 === 0) {
        this.swapStrike();
        this.state.currentOver = [];
      }
    } else if (action === 'wide') {
      this.state.totalRuns += 1;
      this.state.partnership.runs += 1;
      this.addBallToOver('Wd', 'extra');
      this.playSound('dot');
      this.triggerCelebration('⚡ WIDE BALL (+1 Extra)', 'four');
    } else if (action === 'noball') {
      this.state.totalRuns += 1;
      this.state.partnership.runs += 1;
      this.addBallToOver('Nb', 'noball');
      this.playSound('four');
      this.triggerCelebration('⚡ NO BALL (+1 Extra & Free Hit!)', 'six');
    } else if (action === 'byes') {
      const runs = parseInt(val, 10) || 1;
      this.state.totalRuns += runs;
      this.state.ballsBowled += 1;
      this.state.striker.balls += 1;
      this.state.partnership.runs += runs;
      this.state.partnership.balls += 1;

      this.addBallToOver(`${runs}B`, 'byes');
      this.playSound('run');
      this.triggerCelebration(`🏃 BYES (+${runs} Run)`, 'four');

      if (runs % 2 === 1) {
        this.swapStrike();
      }

      if (this.state.ballsBowled % 6 === 0) {
        this.swapStrike();
        this.state.currentOver = [];
      }
    } else if (action === 'undo') {
      if (this.state.ballHistory && this.state.ballHistory.length > 0) {
        const lastSaved = this.state.ballHistory.pop();
        const historyCopy = this.state.ballHistory;
        const restored = JSON.parse(lastSaved);
        this.state = {
          ...restored,
          ballHistory: historyCopy
        };
        this.playSound('dot');
        this.triggerCelebration('↩️ BALL UNDONE', 'four');
      }
    } else if (action === 'reset') {
      this.state = JSON.parse(JSON.stringify(this.initialState));
      this.state.ballHistory = [];
      this.playSound('dot');
      this.triggerCelebration('🔄 MATCH RESTARTED', 'four');
    }

    this.render();
  }

  addBallToOver(text, type) {
    if (this.state.currentOver.length >= 6) {
      this.state.currentOver = [];
    }
    this.state.currentOver.push(text);
  }

  swapStrike() {
    const temp = this.state.striker;
    this.state.striker = this.state.nonStriker;
    this.state.nonStriker = temp;
    this.state.striker.isStriker = true;
    this.state.nonStriker.isStriker = false;
  }

  formatOvers(balls) {
    const completedOvers = Math.floor(balls / 6);
    const remBalls = balls % 6;
    return `${completedOvers}.${remBalls}`;
  }

  render() {
    if (!this.scoreEl) {
      this.initElements();
    }
    if (!this.scoreEl) return;

    this.scoreEl.textContent = `${this.state.totalRuns}/${this.state.wickets}`;

    const oversStr = this.formatOvers(this.state.ballsBowled);
    this.oversEl.textContent = `${oversStr} / ${this.state.oversLimit} ov`;

    const decimalOvers = (Math.floor(this.state.ballsBowled / 6)) + (this.state.ballsBowled % 6) / 6.0;
    const crr = decimalOvers > 0 ? (this.state.totalRuns / decimalOvers).toFixed(2) : '0.00';
    this.crrEl.textContent = `CRR: ${crr}`;

    this.partnershipEl.textContent = `Stand: ${this.state.partnership.runs} (${this.state.partnership.balls}b)`;

    this.strikerNameEl.textContent = `${this.state.striker.name} 🏏`;
    this.strikerScoreEl.textContent = `${this.state.striker.runs} (${this.state.striker.balls})`;

    this.nonStrikerNameEl.textContent = this.state.nonStriker.name;
    this.nonStrikerScoreEl.textContent = `${this.state.nonStriker.runs} (${this.state.nonStriker.balls})`;

    if (this.overStripEl) {
      this.overStripEl.innerHTML = '';
      this.state.currentOver.forEach(ball => {
        const span = document.createElement('span');
        span.className = 'mockup-ball';
        if (ball === '4') span.classList.add('four');
        else if (ball === '6') span.classList.add('six');
        else if (ball === 'W') span.classList.add('wicket');
        else if (ball === 'Wd') span.classList.add('extra');
        else if (ball === 'Nb') span.classList.add('noball');
        else if (ball.endsWith('B') || ball === 'B') span.classList.add('byes');
        span.textContent = ball;
        this.overStripEl.appendChild(span);
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.cricketSimulator = new CricketSimulator();
});
