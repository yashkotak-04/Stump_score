/**
 * StumpScore — Real-Time Live Cricket Match Engine
 * Connects to /api/live-matches and /api/match/[id] Vercel Serverless Function endpoints.
 * Features:
 * - 20s auto-polling with tab visibility detection (pauses when hidden)
 * - Tabs: LIVE, UPCOMING, COMPLETED with dynamic badge counters
 * - Test match multi-innings support, lead/trail calculations, session status
 * - Fallback and error resilience (never crashes the page)
 * - Visitor local timezone formatting for upcoming fixtures
 * - Dynamic live marquee ticker synchronization
 * - Full detailed scorecard modal with batting, bowling, fall of wickets & commentary
 */

class RealLiveScoreEngine {
  constructor() {
    this.matches = [];
    this.currentTab = 'live';
    this.pollingInterval = null;
    this.pollingFrequencyMs = 20000; // 20 seconds standard
    this.lastUpdated = null;
    this.isFetching = false;
    this.activeScorecardMatch = null;
    this.activeInningsIndex = 0;
    this.cachedScorecards = new Map();

    // Score delta tracking & flash highlight
    this.previousScores = new Map();
    this.changedScoreKeys = new Set();
    this.wicketTimer = null;
    this.isSectionVisible = true;

    this.init();
  }

  init() {
    this.bindTabButtons();
    this.bindRefreshButton();
    this.bindVisibilityHandler();
    this.bindIntersectionObserver();
    this.bindScorecardCategoryNav();
    this.bindModalClose();

    // Initial fetch on page load with skeleton loaders
    this.fetchMatches(true);

    // Start auto-refresh
    this.startPolling();
  }

  bindTabButtons() {
    const tabBtns = document.querySelectorAll('.real-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = btn.getAttribute('data-tab');
        if (!tab || tab === this.currentTab) return;

        tabBtns.forEach(b => {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');

        this.currentTab = tab;
        this.renderCurrentTab();
      });
    });
  }

  bindRefreshButton() {
    const refreshBtn = document.getElementById('real-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.fetchMatches(false, true);
      });
    }
  }

  bindVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopPolling();
      } else {
        // Tab is visible again: immediate refresh and resume polling
        this.startPolling();
        this.fetchMatches(false);
      }
    });
  }

  bindIntersectionObserver() {
    const section = document.getElementById('live-scores');
    if (!section || !('IntersectionObserver' in window)) return;

    this.isSectionVisible = true;
    this.sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isSectionVisible = entry.isIntersecting;
        if (this.isSectionVisible) {
          // Came back into view: if interval elapsed, fetch immediately
          const now = Date.now();
          const last = this.lastUpdated ? this.lastUpdated.getTime() : 0;
          if (now - last >= this.pollingFrequencyMs) {
            this.fetchMatches(false);
          }
          this.startPolling();
        } else {
          // Out of view: pause auto-polling to save network & mobile battery
          this.stopPolling();
        }
      });
    }, { threshold: 0.05 });

    this.sectionObserver.observe(section);
  }

  bindScorecardCategoryNav() {
    const catBtns = document.querySelectorAll('.sc-cat-btn');
    catBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = btn.getAttribute('data-cat') || 'all';

        catBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const secBatting = document.getElementById('sc-sec-batting');
        const secBowling = document.getElementById('sc-sec-bowling');
        const secFow = document.getElementById('sc-sec-fow');
        const secComm = document.getElementById('sc-commentary-section');

        const showAll = (cat === 'all');
        if (secBatting) secBatting.style.display = (showAll || cat === 'batting') ? 'block' : 'none';
        if (secBowling) secBowling.style.display = (showAll || cat === 'bowling') ? 'block' : 'none';
        if (secFow) secFow.style.display = (showAll || cat === 'fow') ? 'block' : 'none';
        if (secComm) {
          const hasComm = secComm.dataset.hasContent === 'true';
          secComm.style.display = ((showAll || cat === 'commentary') && hasComm) ? 'block' : 'none';
        }
      });
    });
  }

  resetScorecardCategoryNav() {
    const catBtns = document.querySelectorAll('.sc-cat-btn');
    catBtns.forEach((b, idx) => {
      if (idx === 0) {
        b.classList.add('active');
        b.setAttribute('aria-selected', 'true');
      } else {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      }
    });

    const secBatting = document.getElementById('sc-sec-batting');
    const secBowling = document.getElementById('sc-sec-bowling');
    const secFow = document.getElementById('sc-sec-fow');
    if (secBatting) secBatting.style.display = 'block';
    if (secBowling) secBowling.style.display = 'block';
    if (secFow) secFow.style.display = 'block';
  }

  bindModalClose() {
    // Keyboard ESC key closes scorecard modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('modal-match-scorecard');
        if (modal && modal.classList.contains('is-active')) {
          this.closeScorecardModal();
        }
      }
    });
  }

  startPolling() {
    this.stopPolling();
    this.pollingInterval = setInterval(() => {
      if (!document.hidden && this.isSectionVisible !== false) {
        this.fetchMatches(false);
      }
    }, this.pollingFrequencyMs);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  async fetchMatches(showSkeletons = false, manualTrigger = false) {
    if (this.isFetching) return;
    this.isFetching = true;

    const refreshBtn = document.getElementById('real-refresh-btn');
    if (refreshBtn) refreshBtn.classList.add('is-spinning');

    const grid = document.getElementById('real-matches-grid');
    if (showSkeletons && grid && (!this.matches || !this.matches.length)) {
      grid.innerHTML = this.getSkeletonMarkup();
    }

    try {
      const response = await fetch('/api/live-matches', {
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const incomingMatches = Array.isArray(data.matches) ? data.matches : [];
      this.detectScoreDeltasAndWickets(incomingMatches);
      this.matches = incomingMatches;
      this.lastUpdated = new Date();
      this.pollingFrequencyMs = 20000; // Reset backoff on success

      // Show/hide delay warning banner if API failed or in fallback
      const delayNotice = document.getElementById('real-delay-notice');
      const delayMsg = document.getElementById('real-delay-notice-msg');
      if (delayNotice && delayMsg) {
        if (data.isRealTime === false || data.error) {
          delayNotice.style.display = 'flex';
          delayMsg.textContent = data.error || (data.apiKeyConfigured === false
            ? 'Running in High-Fidelity Simulator mode. Add CRICKET_API_KEY to Vercel environment variables to stream 100% live official cricket matches.'
            : 'Live provider feed may be delayed due to API rate limits. Showing latest cached update.');
        } else {
          delayNotice.style.display = 'none';
        }
      }

      this.updateTimestamp();
      this.updateTabCounters();
      this.renderCurrentTab();
      this.updateTopTicker();

      if (manualTrigger && window.showStumpToast) {
        window.showStumpToast('⚡ Live scores updated!');
      }

    } catch (err) {
      console.warn('Live matches fetch error:', err.message);

      // Exponential backoff up to 60s
      this.pollingFrequencyMs = Math.min(this.pollingFrequencyMs * 1.5, 60000);
      this.startPolling();

      // Handle downtime gracefully: if cached matches exist, keep them
      if (this.matches && this.matches.length > 0) {
        const delayNotice = document.getElementById('real-delay-notice');
        const delayMsg = document.getElementById('real-delay-notice-msg');
        if (delayNotice && delayMsg) {
          delayNotice.style.display = 'flex';
          delayMsg.textContent = `Live match feed temporarily unreachable (${err.message}). Displaying cached matches.`;
        }
        this.updateTimestamp(true);
      } else {
        // No matches at all: show error card with retry button
        if (grid) {
          grid.innerHTML = this.getErrorMarkup(err.message);
        }
      }
    } finally {
      this.isFetching = false;
      if (refreshBtn) refreshBtn.classList.remove('is-spinning');
    }
  }

  detectScoreDeltasAndWickets(newMatches) {
    this.changedScoreKeys.clear();

    newMatches.forEach(m => {
      if (!this.isLiveStatus(m.status)) return;
      const t1 = (m.teams && m.teams[0]) ? (m.teams[0].short || m.teams[0].name) : 'TM1';
      const t2 = (m.teams && m.teams[1]) ? (m.teams[1].short || m.teams[1].name) : 'TM2';

      (m.innings || []).forEach((inn, innIdx) => {
        const teamKey = `${m.id}_inn_${innIdx}`;
        const prev = this.previousScores.get(teamKey);
        const runs = Number(inn.runs) || 0;
        const wickets = Number(inn.wickets) || 0;

        if (prev) {
          if (runs !== prev.runs || wickets !== prev.wickets) {
            this.changedScoreKeys.add(teamKey);
            this.changedScoreKeys.add(`${m.id}_${inn.team}`);
            this.changedScoreKeys.add(`${m.id}_${t1}`);
            this.changedScoreKeys.add(`${m.id}_${t2}`);
          }
          if (wickets > prev.wickets) {
            // Wicket fell!
            const teamDisplay = inn.team || (innIdx === 0 ? t1 : t2);
            this.showWicketBanner(`WICKET! ${teamDisplay} ${runs}/${wickets} (${inn.overs || '0'} ov)`);
          }
        }

        this.previousScores.set(teamKey, { runs, wickets, overs: inn.overs });
      });
    });
  }

  showWicketBanner(message) {
    const banner = document.getElementById('stump-wicket-banner');
    const textEl = document.getElementById('stump-wicket-banner-text');
    if (!banner) return;
    if (textEl) textEl.textContent = message;
    banner.classList.add('is-active');

    if (navigator.vibrate) {
      try { navigator.vibrate(80); } catch (_) {}
    }

    if (this.wicketTimer) clearTimeout(this.wicketTimer);
    this.wicketTimer = setTimeout(() => {
      banner.classList.remove('is-active');
    }, 3500);
  }

  updateTimestamp(isDelayed = false) {
    const textEl = document.getElementById('real-last-updated-text');
    if (!textEl) return;
    const now = this.lastUpdated || new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    textEl.textContent = `Last updated: ${timeStr}${isDelayed ? ' (cached)' : ''}`;
  }

  updateTabCounters() {
    const liveCount = this.matches.filter(m => this.isLiveStatus(m.status)).length;
    const upcomingCount = this.matches.filter(m => m.status === 'upcoming').length;
    const completedCount = this.matches.filter(m => m.status === 'completed').length;

    const bLive = document.getElementById('badge-live-count');
    const bUpcoming = document.getElementById('badge-upcoming-count');
    const bCompleted = document.getElementById('badge-completed-count');

    if (bLive) bLive.textContent = liveCount;
    if (bUpcoming) bUpcoming.textContent = upcomingCount;
    if (bCompleted) bCompleted.textContent = completedCount;
  }

  isLiveStatus(status) {
    return status === 'live' || status === 'break' || status === 'rain' || status === 'stumps';
  }

  renderCurrentTab() {
    const grid = document.getElementById('real-matches-grid');
    if (!grid) return;

    let filtered = [];
    if (this.currentTab === 'live') {
      filtered = this.matches.filter(m => this.isLiveStatus(m.status));
    } else if (this.currentTab === 'upcoming') {
      filtered = this.matches.filter(m => m.status === 'upcoming');
    } else if (this.currentTab === 'completed') {
      filtered = this.matches.filter(m => m.status === 'completed');
    }

    if (filtered.length === 0) {
      grid.innerHTML = this.getEmptyStateMarkup();
      return;
    }

    grid.innerHTML = filtered.map(m => this.renderMatchCard(m)).join('');

    // Clear flash highlights after 700ms
    if (this.changedScoreKeys.size > 0) {
      setTimeout(() => {
        this.changedScoreKeys.clear();
      }, 700);
    }
  }

  renderMatchCard(m) {
    const isLive = this.isLiveStatus(m.status);
    const isTest = (m.format === 'Test');
    const cardClass = `real-match-card ${isLive ? 'is-live' : ''}`;

    // Header badges
    let statusBadgeHtml = '';
    if (m.status === 'live') {
      statusBadgeHtml = `<span class="status-badge-live"><span class="real-live-dot-mini"></span> LIVE</span>`;
    } else if (m.status === 'break' || m.status === 'stumps' || m.status === 'rain') {
      statusBadgeHtml = `<span class="status-badge-break">${this.escapeHtml(m.status.toUpperCase())}</span>`;
    } else if (m.status === 'completed') {
      statusBadgeHtml = `<span class="status-badge-completed">RESULT</span>`;
    } else {
      statusBadgeHtml = `<span class="status-badge-completed">UPCOMING</span>`;
    }

    // Teams and Scores representation
    const teamsHtml = this.renderTeamsAndScores(m);

    // Crease & Bowler (only show if data is available)
    const creaseHtml = this.renderCreaseSection(m);

    // Recent balls strip (only show if data exists)
    const recentBallsHtml = this.renderRecentBalls(m);

    // Status text note
    const statusNote = m.statusText ? `<div class="card-status-text">${this.escapeHtml(m.statusText)}</div>` : '';

    // Action button
    const actionBtnText = m.status === 'upcoming' ? 'View Fixture Details 📅' : 'Full Scorecard & Commentary 📊';

    return `
      <div class="${cardClass}" data-match-id="${this.escapeHtml(m.id)}">
        <div class="card-header-row">
          <div class="card-series-info">
            <div class="card-series-name" title="${this.escapeHtml(m.series)}">${this.escapeHtml(m.series)}</div>
            <div class="card-venue-text">📍 ${this.escapeHtml(m.venue || 'International Stadium')}${m.city ? ', ' + this.escapeHtml(m.city) : ''}</div>
          </div>
          <div class="card-badges-wrap">
            <span class="format-pill">${this.escapeHtml(m.format || 'T20')}</span>
            ${statusBadgeHtml}
          </div>
        </div>

        ${teamsHtml}
        ${creaseHtml}
        ${recentBallsHtml}
        ${statusNote}

        <button type="button" class="card-open-btn" onclick="window.stumpLiveEngine && window.stumpLiveEngine.openScorecardModal('${this.escapeHtml(m.id)}')">
          <span>${actionBtnText}</span>
          <span>→</span>
        </button>
      </div>
    `;
  }

  renderTeamsAndScores(m) {
    const isTest = (m.format === 'Test');
    const t1 = (m.teams && m.teams[0]) ? m.teams[0] : { name: 'Team 1', short: 'TM1' };
    const t2 = (m.teams && m.teams[1]) ? m.teams[1] : { name: 'Team 2', short: 'TM2' };

    const isT1Changed = this.changedScoreKeys.has(`${m.id}_${t1.short}`) || this.changedScoreKeys.has(`${m.id}_inn_0`);
    const isT2Changed = this.changedScoreKeys.has(`${m.id}_${t2.short}`) || this.changedScoreKeys.has(`${m.id}_inn_1`);

    // UPCOMING MATCH: Show fixture and local start time
    if (m.status === 'upcoming') {
      const localTimeStr = this.formatLocalTime(m.startTime);
      const countdownStr = this.formatCountdown(m.startTime);

      return `
        <div class="card-teams-box">
          <div class="card-team-row">
            <span class="card-team-name">${this.escapeHtml(t1.name)}</span>
            <span style="font-weight: 700; color: var(--text-muted);">vs</span>
            <span class="card-team-name">${this.escapeHtml(t2.name)}</span>
          </div>
        </div>
        <div class="upcoming-time-box">
          <div class="upcoming-local-time">${localTimeStr}</div>
          <div class="upcoming-countdown-sub">${countdownStr} • Visitor Local Time</div>
        </div>
      `;
    }

    // TEST MATCH HANDLING (Section 4)
    if (isTest) {
      // Group innings by team
      const t1Innings = (m.innings || []).filter(inn => inn.team === t1.short || inn.team === t1.name);
      const t2Innings = (m.innings || []).filter(inn => inn.team === t2.short || inn.team === t2.name);

      const t1ScoreStr = this.formatTestInningsSummary(t1Innings);
      const t2ScoreStr = this.formatTestInningsSummary(t2Innings);

      let testMetaPills = '';
      if (m.day) {
        testMetaPills += `<div class="test-session-pill">Day ${m.day}${m.statusText ? ' • ' + this.escapeHtml(m.statusText) : ''}</div>`;
      }
      if (m.leadTrail) {
        testMetaPills += `<div class="test-lead-pill">⚖️ ${this.escapeHtml(m.leadTrail)}</div>`;
      }

      return `
        ${testMetaPills}
        <div class="card-teams-box">
          <div class="card-team-row">
            <span class="card-team-name">${this.escapeHtml(t1.name)}</span>
            <div class="card-team-score-group">
              <span class="card-team-score-num ${isT1Changed ? 'score-flash' : ''}">${t1ScoreStr.score}</span>
              ${t1ScoreStr.overs ? `<div class="card-team-overs-sub">${t1ScoreStr.overs}</div>` : ''}
            </div>
          </div>
          <div class="card-team-row">
            <span class="card-team-name">${this.escapeHtml(t2.name)}</span>
            <div class="card-team-score-group">
              <span class="card-team-score-num ${isT2Changed ? 'score-flash' : ''}">${t2ScoreStr.score}</span>
              ${t2ScoreStr.overs ? `<div class="card-team-overs-sub">${t2ScoreStr.overs}</div>` : ''}
            </div>
          </div>
        </div>
      `;
    }

    // LIMITED OVERS (ODI / T20 / T10)
    const inn1 = (m.innings && m.innings[0]) ? m.innings[0] : null;
    const inn2 = (m.innings && m.innings[1]) ? m.innings[1] : null;

    const t1Inn = (m.innings || []).find(i => i.team === t1.short) || inn1;
    const t2Inn = (m.innings || []).find(i => i.team === t2.short) || (inn2 && inn2 !== t1Inn ? inn2 : null);

    const formatInn = (inn) => {
      if (!inn || inn.runs === undefined) return { score: 'Yet to bat', overs: '' };
      return {
        score: `${inn.runs}/${inn.wickets}${inn.allOut ? ' ao' : ''}${inn.declared ? ' d' : ''}`,
        overs: `(${inn.overs} ov)${inn.runRate ? ' • CRR ' + inn.runRate : ''}`
      };
    };

    const t1Formatted = formatInn(t1Inn);
    const t2Formatted = formatInn(t2Inn);

    return `
      <div class="card-teams-box">
        <div class="card-team-row">
          <span class="card-team-name">${this.escapeHtml(t1.name)}</span>
          <div class="card-team-score-group">
            <span class="card-team-score-num ${isT1Changed ? 'score-flash' : ''}">${t1Formatted.score}</span>
            <div class="card-team-overs-sub">${t1Formatted.overs}</div>
          </div>
        </div>
        <div class="card-team-row">
          <span class="card-team-name">${this.escapeHtml(t2.name)}</span>
          <div class="card-team-score-group">
            <span class="card-team-score-num ${isT2Changed ? 'score-flash' : ''}">${t2Formatted.score}</span>
            <div class="card-team-overs-sub">${t2Formatted.overs}</div>
          </div>
        </div>
      </div>
    `;
  }

  formatTestInningsSummary(inningsList) {
    if (!inningsList || inningsList.length === 0) {
      return { score: 'Yet to bat', overs: '' };
    }

    // Build multi-innings string: e.g. "324 & 84/4"
    const scoreParts = inningsList.map(inn => {
      let s = `${inn.runs}`;
      if (inn.wickets < 10 && !inn.declared && !inn.allOut) {
        s += `/${inn.wickets}`;
      }
      if (inn.declared) s += ' d';
      if (inn.allOut) s += ' ao';
      return s;
    });

    const latestInn = inningsList[inningsList.length - 1];
    const oversText = latestInn ? `(${latestInn.overs} ov)` : '';

    return {
      score: scoreParts.join(' & '),
      overs: oversText
    };
  }

  renderCreaseSection(m) {
    const hasBatters = Array.isArray(m.batters) && m.batters.length > 0;
    const hasBowler = m.bowler && m.bowler.name;

    if (!hasBatters && !hasBowler) return '';

    let battersHtml = '';
    if (hasBatters) {
      battersHtml = `
        <div class="crease-batters-row">
          ${m.batters.slice(0, 2).map(b => `
            <div class="crease-batter-chip">
              <span>${b.onStrike ? '<span class="batter-strike-star">*</span>' : ''} ${this.escapeHtml(b.name)}</span>
              <span class="batter-runs-bold">${b.runs} (${b.balls}b)</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    let bowlerHtml = '';
    if (hasBowler) {
      bowlerHtml = `
        <div class="crease-bowler-row">
          <span>⚾ ${this.escapeHtml(m.bowler.name)}</span>
          <span style="font-weight: 700;">${m.bowler.overs} ov • ${m.bowler.runs}/${m.bowler.wickets} (M: ${m.bowler.maidens || 0})</span>
        </div>
      `;
    }

    return `
      <div class="card-crease-box">
        ${battersHtml}
        ${bowlerHtml}
      </div>
    `;
  }

  renderRecentBalls(m) {
    if (!Array.isArray(m.recentBalls) || m.recentBalls.length === 0) return '';

    const ballsHtml = m.recentBalls.slice(-6).map(b => {
      let extraClass = '';
      const str = String(b).trim().toUpperCase();
      if (str === '4') extraClass = 'is-four';
      else if (str === '6') extraClass = 'is-six';
      else if (str === 'W') extraClass = 'is-wicket';
      else if (str === '0' || str === '.') extraClass = 'is-dot';

      return `<span class="ball-chip ${extraClass}">${this.escapeHtml(str)}</span>`;
    }).join('');

    return `
      <div class="card-balls-strip">
        <span class="balls-strip-label">Recent:</span>
        ${ballsHtml}
      </div>
    `;
  }

  formatLocalTime(isoStr) {
    if (!isoStr) return 'TBD';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }) + ' at ' + d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  }

  formatCountdown(isoStr) {
    if (!isoStr) return 'Scheduled';
    try {
      const target = new Date(isoStr).getTime();
      const diff = target - Date.now();
      if (diff <= 0) return 'Starting soon';

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `Starts in ${days}d ${hours % 24}h`;
      }
      return `Starts in ${hours}h ${mins}m`;
    } catch {
      return 'Upcoming';
    }
  }

  updateTopTicker() {
    const track = document.getElementById('real-ticker-track');
    if (!track) return;

    const liveMatches = this.matches.filter(m => this.isLiveStatus(m.status));

    if (liveMatches.length > 0) {
      // Show real live matches only (Requirement 2 & 5)
      const items = liveMatches.map(m => {
        const t1 = (m.teams && m.teams[0]?.short) || m.teams[0]?.name || 'TM1';
        const t2 = (m.teams && m.teams[1]?.short) || m.teams[1]?.name || 'TM2';
        
        let scoreStr = '';
        if (m.innings && m.innings.length > 0) {
          const latestInn = m.innings[m.innings.length - 1];
          scoreStr = `— ${latestInn.team} ${latestInn.runs}/${latestInn.wickets} (${latestInn.overs} ov)`;
        }

        const batterStr = (m.batters && m.batters[0]) ? ` • ${m.batters[0].name} ${m.batters[0].runs}*(${m.batters[0].balls})` : '';

        return `
          <div class="ticker-item">
            <span class="ticker-pill">LIVE NOW</span>
            <strong>${this.escapeHtml(t1)} vs ${this.escapeHtml(t2)}</strong> ${scoreStr}${batterStr}
          </div>
        `;
      });

      // Duplicate to ensure continuous marquee scroll
      const allItems = [...items, ...items].join('');
      track.innerHTML = allItems;
    } else {
      // No live matches right now: show next upcoming match in visitor's local timezone (Requirement 2)
      const upcoming = this.matches
        .filter(m => m.status === 'upcoming')
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

      let msg = 'No live matches right now';
      if (upcoming) {
        const t1 = (upcoming.teams && upcoming.teams[0]?.short) || upcoming.teams[0]?.name || 'TM1';
        const t2 = (upcoming.teams && upcoming.teams[1]?.short) || upcoming.teams[1]?.name || 'TM2';
        const localTime = this.formatLocalTime(upcoming.startTime);
        const countdown = this.formatCountdown(upcoming.startTime);
        msg = `No live matches right now • Next fixture: ${t1} vs ${t2} — ${localTime} (${countdown})`;
      }

      const tickerItem = `
        <div class="ticker-item">
          <span class="ticker-pill" style="background: rgba(148, 163, 184, 0.2); color: #cbd5e1;">NO LIVE MATCHES</span>
          <strong>${this.escapeHtml(msg)}</strong>
        </div>
      `;
      track.innerHTML = tickerItem + tickerItem;
    }
  }

  getEmptyStateMarkup() {
    let nextMatchHtml = '';
    if (this.currentTab === 'live') {
      const nextUpcoming = this.matches
        .filter(m => m.status === 'upcoming')
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

      if (nextUpcoming) {
        const t1 = nextUpcoming.teams[0]?.name || 'Team 1';
        const t2 = nextUpcoming.teams[1]?.name || 'Team 2';
        const localTime = this.formatLocalTime(nextUpcoming.startTime);
        const countdown = this.formatCountdown(nextUpcoming.startTime);

        nextMatchHtml = `
          <div class="next-match-box">
            <div style="font-size: 0.76rem; color: var(--pitch-green); font-weight: 800; text-transform: uppercase;">Next Fixture:</div>
            <div style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary); margin: 2px 0;">${this.escapeHtml(t1)} vs ${this.escapeHtml(t2)}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">🕒 Starts ${localTime} (${countdown})</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">📍 ${this.escapeHtml(nextUpcoming.venue || 'Stadium')}</div>
          </div>
        `;
      }
    }

    return `
      <div class="empty-matches-card">
        <div class="empty-state-icon">🏏</div>
        <h3 class="empty-state-title">No ${this.escapeHtml(this.currentTab.toUpperCase())} Matches Right Now</h3>
        <p class="empty-state-sub">
          There are currently no official cricket fixtures matching the <strong>${this.escapeHtml(this.currentTab.toUpperCase())}</strong> filter.
        </p>
        ${nextMatchHtml}
        <div style="margin-top: 18px;">
          <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('tab-btn-upcoming').click();">Browse Upcoming Matches →</button>
        </div>
      </div>
    `;
  }

  getSkeletonMarkup() {
    return `
      <div class="real-match-card is-skeleton">
        <div class="skel-bar skel-shimmer" style="width: 45%; height: 14px; margin-bottom: 14px;"></div>
        <div class="skel-bar skel-shimmer" style="width: 80%; height: 26px; margin-bottom: 10px;"></div>
        <div class="skel-bar skel-shimmer" style="width: 60%; height: 22px; margin-bottom: 18px;"></div>
        <div class="skel-box skel-shimmer" style="height: 52px; margin-bottom: 12px;"></div>
        <div class="skel-bar skel-shimmer" style="width: 100%; height: 38px;"></div>
      </div>
      <div class="real-match-card is-skeleton">
        <div class="skel-bar skel-shimmer" style="width: 45%; height: 14px; margin-bottom: 14px;"></div>
        <div class="skel-bar skel-shimmer" style="width: 80%; height: 26px; margin-bottom: 10px;"></div>
        <div class="skel-bar skel-shimmer" style="width: 60%; height: 22px; margin-bottom: 18px;"></div>
        <div class="skel-box skel-shimmer" style="height: 52px; margin-bottom: 12px;"></div>
        <div class="skel-bar skel-shimmer" style="width: 100%; height: 38px;"></div>
      </div>
    `;
  }

  getErrorMarkup(errMsg) {
    return `
      <div class="empty-matches-card">
        <div class="empty-state-icon">⚠️</div>
        <h3 class="empty-state-title">Live Score Stream Temporarily Unavailable</h3>
        <p class="empty-state-sub">
          Could not establish connection to the cricket data stream (${this.escapeHtml(errMsg)}). Please verify your internet connection or retry.
        </p>
        <button type="button" class="btn btn-primary-android btn-sm" onclick="window.stumpLiveEngine && window.stumpLiveEngine.fetchMatches(true, true)">
          ↻ Retry Connection Now
        </button>
      </div>
    `;
  }

  // ==========================================================================
  // Full Scorecard Modal Controller
  // ==========================================================================
  async openScorecardModal(matchId) {
    const modal = document.getElementById('modal-match-scorecard');
    if (!modal) return;

    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden';
    this.resetScorecardCategoryNav();

    const loadingEl = document.getElementById('sc-loading-state');
    const detailsEl = document.getElementById('sc-details-wrap');
    if (loadingEl) loadingEl.style.display = 'block';
    if (detailsEl) detailsEl.style.display = 'none';

    // Find overview match from current state
    const overviewMatch = this.matches.find(m => m.id === matchId);
    if (overviewMatch) {
      this.populateScorecardHeader(overviewMatch);
    }

    try {
      let detailed = this.cachedScorecards.get(matchId);
      if (!detailed) {
        const resp = await fetch(`/api/match/${encodeURIComponent(matchId)}`);
        const json = await resp.json();
        detailed = json.match || overviewMatch;
        if (detailed) {
          this.cachedScorecards.set(matchId, detailed);
        }
      }

      this.activeScorecardMatch = detailed;
      this.activeInningsIndex = 0;
      this.populateScorecardHeader(detailed);
      this.renderScorecardInnings(detailed);

      if (loadingEl) loadingEl.style.display = 'none';
      if (detailsEl) detailsEl.style.display = 'block';

    } catch (err) {
      console.warn('Scorecard fetch failed:', err.message);
      if (overviewMatch) {
        this.renderFallbackScorecard(overviewMatch);
        if (loadingEl) loadingEl.style.display = 'none';
        if (detailsEl) detailsEl.style.display = 'block';
      }
    }
  }

  closeScorecardModal() {
    const modal = document.getElementById('modal-match-scorecard');
    if (modal) {
      modal.classList.remove('is-active');
      document.body.style.overflow = '';
    }
  }

  populateScorecardHeader(m) {
    const titleEl = document.getElementById('sc-modal-title');
    const metaEl = document.getElementById('sc-meta-sub');
    const statusEl = document.getElementById('sc-status-note');
    const leadEl = document.getElementById('sc-lead-note');
    const fmtEl = document.getElementById('sc-badge-format');
    const statBadge = document.getElementById('sc-badge-status');
    const timeEl = document.getElementById('sc-header-time');

    const t1 = (m.teams && m.teams[0]?.name) || 'Team 1';
    const t2 = (m.teams && m.teams[1]?.name) || 'Team 2';

    if (titleEl) titleEl.textContent = `${t1} vs ${t2}`;
    if (metaEl) metaEl.textContent = `${m.series || 'Series'} • 📍 ${m.venue || 'Stadium'}${m.city ? ', ' + m.city : ''}`;
    if (statusEl) statusEl.textContent = m.statusText || m.result || 'Match in progress';
    if (fmtEl) fmtEl.textContent = m.format || 'T20';
    if (statBadge) statBadge.textContent = (m.status || 'LIVE').toUpperCase();
    if (timeEl && m.startTime) timeEl.textContent = this.formatLocalTime(m.startTime);

    if (leadEl) {
      if (m.leadTrail) {
        leadEl.style.display = 'block';
        leadEl.textContent = `⚖️ ${m.leadTrail}`;
      } else {
        leadEl.style.display = 'none';
      }
    }
  }

  renderScorecardInnings(match) {
    const inningsList = match.innings || [];
    const navEl = document.getElementById('sc-innings-nav');
    if (!navEl) return;

    if (inningsList.length === 0) {
      navEl.innerHTML = '<span style="font-size: 0.8rem; color: var(--text-muted);">No innings data available yet</span>';
      return;
    }

    // Render Innings Tab buttons
    navEl.innerHTML = inningsList.map((inn, idx) => `
      <button type="button" class="sc-inn-btn ${idx === this.activeInningsIndex ? 'active' : ''}" onclick="window.stumpLiveEngine && window.stumpLiveEngine.switchScorecardInnings(${idx})">
        ${this.escapeHtml(inn.team || `Inn ${idx + 1}`)} (${inn.runs}/${inn.wickets})
      </button>
    `).join('');

    this.renderInningsDetails(inningsList[this.activeInningsIndex]);
  }

  switchScorecardInnings(idx) {
    this.activeInningsIndex = idx;
    if (!this.activeScorecardMatch) return;
    this.renderScorecardInnings(this.activeScorecardMatch);
  }

  renderInningsDetails(inn) {
    if (!inn) return;

    // 1. Batting Table
    const batTbody = document.getElementById('sc-batting-tbody');
    if (batTbody) {
      const batting = Array.isArray(inn.batting) ? inn.batting : [];
      if (batting.length > 0) {
        batTbody.innerHTML = batting.map(b => {
          const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0';
          return `
            <tr>
              <td><strong>${this.escapeHtml(b.name || 'Batter')}</strong> ${b.notOut ? '*' : ''}</td>
              <td class="text-muted">${this.escapeHtml(b.dismissal || (b.notOut ? 'not out' : 'batting'))}</td>
              <td class="text-end" style="font-weight: 800; color: var(--pitch-green);">${b.runs || 0}</td>
              <td class="text-end text-muted">${b.balls || 0}</td>
              <td class="text-end">${b.fours || 0}</td>
              <td class="text-end">${b.sixes || 0}</td>
              <td class="text-end">${sr}</td>
            </tr>
          `;
        }).join('');
      } else {
        batTbody.innerHTML = `<tr><td colspan="7" class="text-muted text-center py-2">Batting breakdown not provided by provider for this innings</td></tr>`;
      }
    }

    // 2. Bowling Table
    const bowlTbody = document.getElementById('sc-bowling-tbody');
    if (bowlTbody) {
      const bowling = Array.isArray(inn.bowling) ? inn.bowling : [];
      if (bowling.length > 0) {
        bowlTbody.innerHTML = bowling.map(b => `
          <tr>
            <td><strong>${this.escapeHtml(b.name || 'Bowler')}</strong></td>
            <td class="text-end">${b.overs || '0.0'}</td>
            <td class="text-end">${b.maidens || 0}</td>
            <td class="text-end">${b.runs || 0}</td>
            <td class="text-end" style="font-weight: 800; color: var(--pitch-green);">${b.wickets || 0}</td>
            <td class="text-end">${b.econ || ((parseFloat(b.overs) > 0) ? (b.runs / parseFloat(b.overs)).toFixed(2) : '0.0')}</td>
          </tr>
        `).join('');
      } else {
        bowlTbody.innerHTML = `<tr><td colspan="6" class="text-muted text-center py-2">Bowling figures not available</td></tr>`;
      }
    }

    // 3. Fall of Wickets
    const fowStrip = document.getElementById('sc-fow-strip');
    const fowList = inn.fallOfWickets || this.activeScorecardMatch?.fallOfWickets || [];
    if (fowStrip) {
      if (fowList.length > 0) {
        fowStrip.innerHTML = fowList.map(f => `
          <div class="sc-fow-chip">
            <strong>${f.score}/${f.no || ''}</strong> (${this.escapeHtml(f.batter || 'Batter')}, ${f.over || ''} ov)
          </div>
        `).join('');
      } else {
        fowStrip.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-muted);">Fall of wickets not recorded</span>`;
      }
    }

    // 4. Commentary
    const commSection = document.getElementById('sc-commentary-section');
    const commFeed = document.getElementById('sc-commentary-feed');
    const commentary = inn.commentary || this.activeScorecardMatch?.commentary || [];
    if (commSection && commFeed) {
      if (commentary.length > 0) {
        commSection.dataset.hasContent = 'true';
        commSection.style.display = 'block';
        commFeed.innerHTML = commentary.map(c => `
          <div class="sc-comm-item">
            ${c.over ? `<span style="font-weight: 800; color: var(--pitch-green); margin-right: 6px;">${this.escapeHtml(c.over)}:</span>` : ''}
            <span>${this.escapeHtml(c.text || c.desc || c)}</span>
          </div>
        `).join('');
      } else {
        commSection.dataset.hasContent = 'false';
        commSection.style.display = 'none';
      }
    }
  }

  renderFallbackScorecard(m) {
    const navEl = document.getElementById('sc-innings-nav');
    if (navEl) {
      navEl.innerHTML = (m.innings || []).map((inn, idx) => `
        <button type="button" class="sc-inn-btn ${idx === 0 ? 'active' : ''}">
          ${inn.team} (${inn.runs}/${inn.wickets})
        </button>
      `).join('');
    }

    const batTbody = document.getElementById('sc-batting-tbody');
    if (batTbody) {
      if (m.batters && m.batters.length > 0) {
        batTbody.innerHTML = m.batters.map(b => `
          <tr>
            <td><strong>${this.escapeHtml(b.name)}</strong></td>
            <td class="text-muted">${b.onStrike ? 'On Strike' : 'Not Out'}</td>
            <td class="text-end" style="font-weight: 800; color: var(--pitch-green);">${b.runs}</td>
            <td class="text-end text-muted">${b.balls}</td>
            <td class="text-end">${b.fours || 0}</td>
            <td class="text-end">${b.sixes || 0}</td>
            <td class="text-end">${b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0'}</td>
          </tr>
        `).join('');
      } else {
        batTbody.innerHTML = `<tr><td colspan="7" class="text-muted text-center py-2">Scorecard details pending stream update</td></tr>`;
      }
    }

    const bowlTbody = document.getElementById('sc-bowling-tbody');
    if (bowlTbody && m.bowler) {
      bowlTbody.innerHTML = `
        <tr>
          <td><strong>${this.escapeHtml(m.bowler.name)}</strong></td>
          <td class="text-end">${m.bowler.overs}</td>
          <td class="text-end">${m.bowler.maidens || 0}</td>
          <td class="text-end">${m.bowler.runs || 0}</td>
          <td class="text-end" style="font-weight: 800; color: var(--pitch-green);">${m.bowler.wickets || 0}</td>
          <td class="text-end">${m.bowler.overs > 0 ? (m.bowler.runs / parseFloat(m.bowler.overs)).toFixed(2) : '0.0'}</td>
        </tr>
      `;
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Global bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.stumpLiveEngine = new RealLiveScoreEngine();
});
