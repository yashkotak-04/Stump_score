/**
 * StumpScore — International Live Match Center Engine
 * Features: Auto-streaming live match ticker, realistic ball commentary,
 * Win Probability calculation, multi-match switcher, and synthesized audio.
 */

class LiveScoreHub {
  constructor() {
    this.matches = {
      ind_pak: {
        id: 'ind_pak',
        title: 'India vs Pakistan',
        tournament: "ICC Men's T20 World Cup Final",
        venue: 'Melbourne Cricket Ground (MCG), Melbourne',
        teamA: { name: 'India', short: 'IND', flag: '🇮🇳' },
        teamB: { name: 'Pakistan', short: 'PAK', flag: '🇵🇰' },
        firstInnings: { score: '172/7', overs: '20.0 ov', runs: 172, wickets: 7 },
        target: 173,
        initialState: {
          runs: 162,
          wickets: 4,
          balls: 109, // 18.1 ov
          striker: { name: 'V. Kohli', runs: 76, balls: 48, fours: 6, sixes: 3 },
          nonStriker: { name: 'H. Pandya', runs: 34, balls: 18, fours: 3, sixes: 2 },
          bowler: { name: 'Shaheen Afridi', overs: 3.1, runs: 28, wickets: 2, economy: 8.84 },
          recentBalls: ['1', '4', '0', '6', '1', '1'],
          commentary: [
            { over: '18.1', event: '1 RUN', type: 'run', text: 'Shaheen Afridi to Kohli, 1 run, pushed firmly down towards long-on to keep the strike.' },
            { over: '17.6', event: '1 RUN', type: 'run', text: 'Haris Rauf to Pandya, 1 run, drilled straight down the ground to long-off.' },
            { over: '17.5', event: 'SIX', type: 'six', text: 'Haris Rauf to Pandya, SIX! Incredible pickup shot over deep square leg! Massive roar in Melbourne!' },
            { over: '17.4', event: 'DOT', type: 'dot', text: 'Haris Rauf to Pandya, no run, fierce 146kph yorker dug out back to the bowler.' }
          ],
          scriptedBalls: [
            { runs: 2, event: '2 RUNS', type: 'run', desc: 'Shaheen Afridi to Kohli, 2 runs, clipped off the pads into the deep midwicket pocket. Brilliant running!' },
            { runs: 4, event: 'FOUR', type: 'four', desc: 'Shaheen Afridi to Kohli, FOUR! Exquisite cover drive piercing extra cover! Pure elegance!' },
            { runs: 0, event: 'DOT', type: 'dot', desc: 'Shaheen Afridi to Kohli, no run, unplayable off-cutter beating the outside edge!' },
            { runs: 1, event: '1 RUN', type: 'run', desc: 'Shaheen Afridi to Kohli, 1 run, tapped softly towards mid-on for a sharp single.' },
            { runs: 1, event: '1 RUN', type: 'run', desc: 'Shaheen Afridi to Pandya, 1 run, pulled through square leg, rotating strike as over finishes.' },
            { runs: 1, event: '1 RUN', type: 'run', bowlerName: 'Haris Rauf', desc: 'Haris Rauf to Pandya, 1 run, fired into the ribs, tucked to fine leg.' },
            { runs: 0, wicket: true, dismissed: 'Kohli', event: 'WICKET', type: 'wicket', desc: 'Haris Rauf to Kohli, OUT! Caught at deep midwicket! Kohli departs for a heroic 84! What high drama at the MCG!' },
            { runs: 0, newBatsman: 'R. Jadeja', event: 'DOT', type: 'dot', desc: 'Haris Rauf to Jadeja, no run, beaten for pace outside off stump on his first delivery!' },
            { runs: 1, event: '1 RUN', type: 'run', desc: 'Haris Rauf to Jadeja, 1 run, steered past backward point, scores are LEVEL!' },
            { runs: 4, event: 'FOUR', type: 'four', desc: 'Haris Rauf to Pandya, FOUR! Smashed over extra cover for the winning boundary! INDIA WINS THE WORLD CUP! Unbelievable scenes in Melbourne!' }
          ]
        }
      },
      eng_aus: {
        id: 'eng_aus',
        title: 'England vs Australia',
        tournament: 'The Ashes T20 Championship',
        venue: "Lord's Cricket Ground, London",
        teamA: { name: 'England', short: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
        teamB: { name: 'Australia', short: 'AUS', flag: '🇦🇺' },
        firstInnings: { score: '186/6', overs: '20.0 ov', runs: 186, wickets: 6 },
        target: 187,
        initialState: {
          runs: 176,
          wickets: 3,
          balls: 112, // 18.4 ov
          striker: { name: 'J. Buttler', runs: 88, balls: 51, fours: 8, sixes: 4 },
          nonStriker: { name: 'L. Livingstone', runs: 28, balls: 14, fours: 2, sixes: 2 },
          bowler: { name: 'Pat Cummins', overs: 3.4, runs: 32, wickets: 1, economy: 8.72 },
          recentBalls: ['4', '1', '6', '1', '2'],
          commentary: [
            { over: '18.4', event: '2 RUNS', type: 'run', text: 'Pat Cummins to Buttler, 2 runs, punched through extra cover.' },
            { over: '18.3', event: '1 RUN', type: 'run', text: 'Pat Cummins to Livingstone, 1 run, pushed to long-on.' }
          ],
          scriptedBalls: [
            { runs: 4, event: 'FOUR', type: 'four', desc: 'Pat Cummins to Buttler, FOUR! Reverse ramp over short third man!' },
            { runs: 1, event: '1 RUN', type: 'run', desc: 'Pat Cummins to Buttler, 1 run, driven to mid-off.' },
            { runs: 6, event: 'SIX', type: 'six', bowlerName: 'Mitchell Starc', desc: 'Mitchell Starc to Livingstone, SIX! Cleared the Lord’s pavilion! England wins!' }
          ]
        }
      },
      csk_mi: {
        id: 'csk_mi',
        title: 'Chennai Super Kings vs Mumbai Indians',
        tournament: 'IPL Final 2026',
        venue: 'Wankhede Stadium, Mumbai',
        teamA: { name: 'Chennai Super Kings', short: 'CSK', flag: '🦁' },
        teamB: { name: 'Mumbai Indians', short: 'MI', flag: '🔵' },
        firstInnings: { score: '194/5', overs: '20.0 ov', runs: 194, wickets: 5 },
        target: 195,
        initialState: {
          runs: 184,
          wickets: 4,
          balls: 114, // 19.0 ov
          striker: { name: 'MS Dhoni', runs: 26, balls: 10, fours: 2, sixes: 2 },
          nonStriker: { name: 'R. Jadeja', runs: 22, balls: 11, fours: 2, sixes: 1 },
          bowler: { name: 'Jasprit Bumrah', overs: 3.0, runs: 18, wickets: 2, economy: 6.00 },
          recentBalls: ['6', '4', '1', '1', '2', '6'],
          commentary: [
            { over: '19.0', event: '6 RUNS', type: 'six', text: 'Hardik to Dhoni, SIX! Helicopter shot over wide long-on!' }
          ],
          scriptedBalls: [
            { runs: 2, event: '2 RUNS', type: 'run', bowlerName: 'J. Bumrah', desc: 'Bumrah to Dhoni, 2 runs, yorker squirted to deep point.' },
            { runs: 1, event: '1 RUN', type: 'run', desc: 'Bumrah to Dhoni, 1 run, driven to long-on.' },
            { runs: 4, event: 'FOUR', type: 'four', desc: 'Bumrah to Jadeja, FOUR! Slashed over backward point!' },
            { runs: 4, event: 'FOUR', type: 'four', desc: 'Bumrah to Dhoni, FOUR! Dhoni finishes off in style! CSK wins IPL!' }
          ]
        }
      }
    };

    this.activeMatchId = 'ind_pak';
    this.currentMatch = null;
    this.state = null;
    this.autoStreamTimer = null;
    this.isPlaying = false;
    this.audioCtx = null;

    this.initElements();
    this.loadMatch(this.activeMatchId);
    this.bindEvents();
  }

  initElements() {
    this.matchSelector = document.getElementById('live-match-select');
    this.tournamentEl = document.getElementById('live-tournament-name');
    this.venueEl = document.getElementById('live-venue');
    this.teamAFlag = document.getElementById('live-team-a-flag');
    this.teamAName = document.getElementById('live-team-a-name');
    this.teamAScore = document.getElementById('live-team-a-score');
    this.teamAOvers = document.getElementById('live-team-a-overs');
    this.targetBox = document.getElementById('live-target-box');
    this.crrEl = document.getElementById('live-crr');
    this.rrrEl = document.getElementById('live-rrr');
    this.strikerName = document.getElementById('live-striker-name');
    this.strikerScore = document.getElementById('live-striker-score');
    this.nonStrikerName = document.getElementById('live-nonstriker-name');
    this.nonStrikerScore = document.getElementById('live-nonstriker-score');
    this.bowlerName = document.getElementById('live-bowler-name');
    this.bowlerFig = document.getElementById('live-bowler-fig');
    this.recentBallsStrip = document.getElementById('live-recent-balls');
    this.winProbTeamA = document.getElementById('live-prob-a');
    this.winProbTeamB = document.getElementById('live-prob-b');
    this.winProbFillA = document.getElementById('live-prob-fill-a');
    this.winProbFillB = document.getElementById('live-prob-fill-b');
    this.commentaryBox = document.getElementById('live-commentary-box');
    this.autoStreamBtn = document.getElementById('live-auto-stream-btn');
    this.stepBtn = document.getElementById('live-step-btn');
    this.resetBtn = document.getElementById('live-reset-btn');
  }

  loadMatch(matchId) {
    this.activeMatchId = matchId;
    this.currentMatch = this.matches[matchId];
    this.state = JSON.parse(JSON.stringify(this.currentMatch.initialState));
    this.state.scriptIndex = 0;
    this.pauseAutoStream();
    this.render();
  }

  bindEvents() {
    if (this.matchSelector) {
      this.matchSelector.addEventListener('change', (e) => {
        this.loadMatch(e.target.value);
      });
    }

    if (this.autoStreamBtn) {
      this.autoStreamBtn.addEventListener('click', () => {
        this.toggleAutoStream();
      });
    }

    if (this.stepBtn) {
      this.stepBtn.addEventListener('click', () => {
        this.stepNextBall();
      });
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        this.loadMatch(this.activeMatchId);
      });
    }
  }

  /* --------------------------------------------------------------------------
     Audio Synthesizer (Realistic Ball, Boundary & Wicket Sounds)
     -------------------------------------------------------------------------- */
  playAudioFX(type) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const now = this.audioCtx.currentTime;

      if (type === 'four' || type === 'six') {
        // Double brass celebration ping
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(type === 'six' ? 659.25 : 523.25, now);
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.25);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'wicket') {
        // Dramatic low boom
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.42);
      } else {
        // Crisp bat contact
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch (_) {}
  }

  /* --------------------------------------------------------------------------
     Streaming & Progression Logic
     -------------------------------------------------------------------------- */
  toggleAutoStream() {
    if (this.isPlaying) {
      this.pauseAutoStream();
    } else {
      this.startAutoStream();
    }
  }

  startAutoStream() {
    this.isPlaying = true;
    if (this.autoStreamBtn) {
      this.autoStreamBtn.classList.add('is-playing');
      this.autoStreamBtn.innerHTML = '<span>⏸ Pause Stream</span>';
    }
    this.stepNextBall();
    this.autoStreamTimer = setInterval(() => {
      this.stepNextBall();
    }, 3500);
  }

  pauseAutoStream() {
    this.isPlaying = false;
    if (this.autoStreamTimer) {
      clearInterval(this.autoStreamTimer);
      this.autoStreamTimer = null;
    }
    if (this.autoStreamBtn) {
      this.autoStreamBtn.classList.remove('is-playing');
      this.autoStreamBtn.innerHTML = '<span>▶ Auto Stream</span>';
    }
  }

  stepNextBall() {
    const scripts = this.state.scriptedBalls;
    if (!scripts || this.state.scriptIndex >= scripts.length) {
      this.pauseAutoStream();
      if (window.showStumpToast) window.showStumpToast('🏆 Chase Complete! India Wins!');
      return;
    }

    const ball = scripts[this.state.scriptIndex];
    this.state.scriptIndex++;

    // 1. Advance score & balls
    this.state.balls++;
    const runsToAdd = ball.runs || 0;
    this.state.runs += runsToAdd;

    // 2. Advance bowler figures
    if (ball.bowlerName) {
      this.state.bowler.name = ball.bowlerName;
      this.state.bowler.overs = 3.1;
      this.state.bowler.runs += runsToAdd;
    } else {
      this.state.bowler.runs += runsToAdd;
    }

    if (ball.wicket) {
      this.state.wickets++;
      this.state.bowler.wickets++;
    }

    // 3. Update batsman stats
    if (ball.wicket && ball.newBatsman) {
      this.state.striker = { name: ball.newBatsman, runs: 0, balls: 0, fours: 0, sixes: 0 };
    } else {
      this.state.striker.runs += runsToAdd;
      this.state.striker.balls += 1;
      if (ball.runs === 4) this.state.striker.fours += 1;
      if (ball.runs === 6) this.state.striker.sixes += 1;

      // Strike rotation on odd runs (1, 3)
      if (runsToAdd % 2 !== 0) {
        const temp = this.state.striker;
        this.state.striker = this.state.nonStriker;
        this.state.nonStriker = temp;
      }
    }

    // 4. Over completion check (rotate strike)
    if (this.state.balls % 6 === 0) {
      const temp = this.state.striker;
      this.state.striker = this.state.nonStriker;
      this.state.nonStriker = temp;
    }

    // 5. Update recent balls
    let ballBadge = runsToAdd.toString();
    if (ball.wicket) ballBadge = 'W';
    else if (runsToAdd === 0) ballBadge = '0';
    this.state.recentBalls.push(ballBadge);
    if (this.state.recentBalls.length > 8) this.state.recentBalls.shift();

    // 6. Calculate over format
    const completedOvers = Math.floor(this.state.balls / 6);
    const ballsInOver = this.state.balls % 6;
    const overString = `${completedOvers}.${ballsInOver}`;

    // 7. Add commentary
    this.state.commentary.unshift({
      over: overString,
      event: ball.event,
      type: ball.type,
      text: ball.desc
    });

    // 8. Play sound
    this.playAudioFX(ball.type);

    this.render();
  }

  /* --------------------------------------------------------------------------
     Rendering
     -------------------------------------------------------------------------- */
  render() {
    if (!this.currentMatch || !this.state) return;

    // Header Meta
    if (this.tournamentEl) this.tournamentEl.textContent = this.currentMatch.tournament;
    if (this.venueEl) this.venueEl.textContent = this.currentMatch.venue;
    if (this.teamAFlag) this.teamAFlag.textContent = this.currentMatch.teamA.flag;
    if (this.teamAName) this.teamAName.textContent = this.currentMatch.teamA.name;

    // LCD Score & Overs
    if (this.teamAScore) {
      this.teamAScore.textContent = `${this.state.runs}/${this.state.wickets}`;
    }

    const completedOvers = Math.floor(this.state.balls / 6);
    const ballsInOver = this.state.balls % 6;
    const oversText = `${completedOvers}.${ballsInOver} / 20.0 ov`;
    if (this.teamAOvers) this.teamAOvers.textContent = oversText;

    // CRR & RRR
    const totalOversFaced = (this.state.balls / 6);
    const crr = totalOversFaced > 0 ? (this.state.runs / totalOversFaced).toFixed(2) : '0.00';
    const runsNeeded = Math.max(0, this.currentMatch.target - this.state.runs);
    const ballsRemaining = Math.max(0, 120 - this.state.balls);
    const rrr = ballsRemaining > 0 ? ((runsNeeded / ballsRemaining) * 6).toFixed(2) : '0.00';

    if (this.crrEl) this.crrEl.textContent = `CRR: ${crr}`;
    if (this.rrrEl) this.rrrEl.textContent = `RRR: ${rrr}`;

    // Target Box
    if (this.targetBox) {
      if (runsNeeded <= 0) {
        this.targetBox.innerHTML = `
          <div class="target-equation-text" style="color: var(--pitch-green);">🏆 ${this.currentMatch.teamA.name} WON!</div>
          <div class="target-equation-sub">Victory by ${10 - this.state.wickets} wickets</div>
        `;
      } else {
        this.targetBox.innerHTML = `
          <div class="target-equation-text">🎯 Target: ${this.currentMatch.target}</div>
          <div class="target-equation-sub">Need ${runsNeeded} runs in ${ballsRemaining} balls</div>
        `;
      }
    }

    // Batsmen
    if (this.strikerName) this.strikerName.textContent = `${this.state.striker.name}* 🏏`;
    if (this.strikerScore) {
      this.strikerScore.textContent = `${this.state.striker.runs} (${this.state.striker.balls})`;
    }
    if (this.nonStrikerName) this.nonStrikerName.textContent = this.state.nonStriker.name;
    if (this.nonStrikerScore) {
      this.nonStrikerScore.textContent = `${this.state.nonStriker.runs} (${this.state.nonStriker.balls})`;
    }

    // Bowler
    if (this.bowlerName) this.bowlerName.textContent = `⚾ ${this.state.bowler.name}`;
    if (this.bowlerFig) {
      const econ = totalOversFaced > 0 ? (this.state.bowler.runs / (totalOversFaced || 1)).toFixed(2) : '8.50';
      this.bowlerFig.textContent = `${this.state.bowler.overs} ov • ${this.state.bowler.runs}/${this.state.bowler.wickets} (Econ: ${econ})`;
    }

    // Recent Deliveries Strip
    if (this.recentBallsStrip) {
      this.recentBallsStrip.innerHTML = '';
      this.state.recentBalls.forEach(ball => {
        const span = document.createElement('span');
        let cls = 'b-run';
        if (ball === '4') cls = 'b-four';
        else if (ball === '6') cls = 'b-six';
        else if (ball === 'W') cls = 'b-wicket';
        else if (ball === '0') cls = 'b-dot';
        else if (ball.includes('Wd') || ball.includes('Nb')) cls = 'b-extra';

        span.className = `ball-pill ${cls}`;
        span.textContent = ball;
        this.recentBallsStrip.appendChild(span);
      });
    }

    // Win Probability Math
    let probA = 75;
    if (runsNeeded <= 0) {
      probA = 100;
    } else {
      const rrrVal = parseFloat(rrr);
      if (rrrVal <= 6) probA = 88;
      else if (rrrVal <= 9) probA = 74;
      else if (rrrVal <= 12) probA = 55;
      else probA = 32;

      // Adjust for wickets in hand
      const wicketsLost = this.state.wickets;
      probA = Math.max(5, Math.min(95, probA - (wicketsLost * 3)));
    }
    const probB = 100 - probA;

    if (this.winProbTeamA) this.winProbTeamA.textContent = `${this.currentMatch.teamA.short}: ${probA}%`;
    if (this.winProbTeamB) this.winProbTeamB.textContent = `${this.currentMatch.teamB.short}: ${probB}%`;
    if (this.winProbFillA) this.winProbFillA.style.width = `${probA}%`;
    if (this.winProbFillB) this.winProbFillB.style.width = `${probB}%`;

    // Commentary List
    if (this.commentaryBox) {
      this.commentaryBox.innerHTML = '';
      this.state.commentary.slice(0, 15).forEach(c => {
        const row = document.createElement('div');
        row.className = 'comm-item';

        let tagClass = 'tag-run';
        if (c.type === 'four') tagClass = 'tag-four';
        else if (c.type === 'six') tagClass = 'tag-six';
        else if (c.type === 'wicket') tagClass = 'tag-wicket';
        else if (c.type === 'dot') tagClass = 'tag-dot';

        row.innerHTML = `
          <span class="comm-over-pill">${c.over}</span>
          <div class="comm-text">
            <span class="comm-event-tag ${tagClass}">${c.event}</span>
            <span>${c.text}</span>
          </div>
        `;
        this.commentaryBox.appendChild(row);
      });
    }
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  if (!window.liveScoreHub) {
    window.liveScoreHub = new LiveScoreHub();
  }
});
