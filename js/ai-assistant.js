/**
 * StumpAI — Intelligent In-App AI Cricket Assistant & Rulebook Umpire
 * Dual-Engine: Google Gemini 1.5/2.0 API + Instant Smart Offline Knowledge Base
 */

class StumpAIAssistant {
  constructor() {
    this.storageKey = 'stump_ai_history_v1';
    this.apiKeyStorageKey = 'stump_gemini_api_key';
    this.soundEnabledKey = 'stump_ai_sound_enabled';

    this.isOpen = false;
    this.isGenerating = false;
    this.soundEnabled = localStorage.getItem(this.soundEnabledKey) !== 'false';
    this.audioCtx = null;

    // Preloaded comprehensive Knowledge Base (0ms instant answers)
    this.knowledgeBase = this.initKnowledgeBase();

    this.initElements();
    this.bindEvents();
    this.loadHistory();
  }

  /* --------------------------------------------------------------------------
     1. Knowledge Base Initialization (Comprehensive App & Cricket Guide)
     -------------------------------------------------------------------------- */
  initKnowledgeBase() {
    return [
      {
        id: 'start_match',
        keywords: ['start match', 'new match', 'how to score', 'create match', 'begin match', 'setup match', 'toss', 'overs'],
        title: 'How to Start & Score a Match in StumpScore',
        response: `🏏 **Starting a New Match in StumpScore:**\n\n1. **Tap "New Match"** from the home screen.\n2. **Enter Match Details**: Team names, total overs (e.g. 10, 20), ball type (Tennis/Leather), and pitch condition.\n3. **Add Squads**: Select or type opening batsmen and opening bowler.\n4. **Conduct Toss**: Pick toss winner and their decision (Bat / Bowl).\n5. **Tap "Start Match"**: The live scoring keypad will open immediately!\n\n⚡ *Tip: Scores sync to the cloud in real-time for spectators!*`,
        chips: ['How does strike rotation work?', 'How to score a Wide or No Ball?', 'Undo a wrong ball']
      },
      {
        id: 'strike_rotation',
        keywords: ['strike rotation', 'swap batsman', 'strike change', 'who is batting', 'odd runs', 'over complete'],
        title: 'Strike Rotation & Batsman Switching',
        response: `🔄 **How Strike Rotation Works:**\n\n- **Automatic Rotation on Odd Runs**: Taking **1, 3, or 5 runs** automatically switches the striker and non-striker.\n- **End of Over**: When 6 legal balls are bowled, strike automatically switches for the next bowler.\n- **Manual Swap**: You can tap the **"Swap Strike"** button anytime if batsmen crossed during a run out or boundary check!`,
        chips: ['How to score a Wicket?', 'Undo a wrong ball', 'How to calculate NRR?']
      },
      {
        id: 'extras_scoring',
        keywords: ['wide', 'no ball', 'bye', 'leg bye', 'extras', 'penalty', 'wd', 'nb', 'lb'],
        title: 'Recording Extras (Wide, No-Ball, Byes)',
        response: `⚾ **How Extras Work in StumpScore:**\n\n- **Wide (Wd)**: Adds +1 extra run to team score. Does NOT count as a legal ball (must be re-bowled). If batsmen run extra runs, tap \`Wd + Runs\`.\n- **No Ball (Nb)**: Adds +1 extra run and awards a **Free Hit** on the next delivery. Not counted as a legal delivery.\n- **Bye (B) & Leg Bye (Lb)**: Runs added to team total, but **NOT** credited to batsman's individual runs or bowler's runs conceded.\n- **Penalty Runs**: Can be awarded directly via the match options drawer.`,
        chips: ['What happens on a Free Hit?', 'Explain LBW rules', 'How to score a Wicket?']
      },
      {
        id: 'undo_ball',
        keywords: ['undo', 'mistake', 'wrong ball', 'correct score', 'edit ball', 'redo', 'delete ball'],
        title: 'Correcting Mistakes with Undo',
        response: `⏪ **How to Fix a Wrong Entry (Undo):**\n\n1. Tap the **"Undo" button** (top bar or next to keypad).\n2. StumpScore will instantly:\n   - Subtract the runs and reset team total.\n   - Restore bowler's previous figures and over count.\n   - Restore batsman's runs, balls faced, and strike status.\n   - Bring back a dismissed batsman if a wicket was undone!\n\n✨ *You can undo multiple deliveries back safely without database corruption.*`,
        chips: ['How to score a Wicket?', 'Start a New Match', 'How to export scorecard?']
      },
      {
        id: 'nrr_formula',
        keywords: ['nrr', 'net run rate', 'nrr calculation', 'points table', 'tournament formula', 'how nrr works'],
        title: 'ICC Net Run Rate (NRR) Formula',
        response: `📊 **ICC Net Run Rate (NRR) Formula:**\n\n$$\\text{NRR} = \\left(\\frac{\\text{Total Runs Scored}}{\\text{Total Overs Faced}}\\right) - \\left(\\frac{\\text{Total Runs Conceded}}{\\text{Total Overs Bowled}}\\right)$$\n\n📌 **Key Rules:**\n- If a team is **all out**, their overs faced are counted as the **full allocated overs** (e.g. 20.0 overs), not the premature over.\n- Super Overs do not count toward NRR calculations.\n- In StumpScore tournaments, NRR updates automatically after every match! 🏆`,
        chips: ['How to create a Tournament?', 'Explain DLS method', 'Start a New Match']
      },
      {
        id: 'lbw_rules',
        keywords: ['lbw', 'leg before wicket', 'lbw rule', 'lbw 4 conditions', 'umpire lbw', 'impact', 'pitching'],
        title: 'The 4 Golden Conditions for an LBW Dismissal',
        response: `⚖️ **The 4 Rules for an LBW Dismissal (MCC Law 36):**\n\n1. **No Bat First**: Ball must hit the batsman's pad/body without touching bat or glove.\n2. **Pitching**: Ball must pitch **In-Line** or **Outside Off-Stump** (*Pitching outside leg-stump is NEVER out*).\n3. **Impact**: Point of impact on pad must be **In-Line with stumps** (unless no shot was offered outside off).\n4. **Wickets**: The trajectory must show the ball was going on to **hit the stumps** (bails/stumps).`,
        chips: ['What happens on a Free Hit?', 'Can batsman be run out on Mankad?', 'What is Dead Ball?']
      },
      {
        id: 'free_hit_rules',
        keywords: ['free hit', 'no ball free hit', 'free hit dismissal', 'free hit wicket', 'can get out on free hit'],
        title: 'Rules & Dismissals on a Free Hit',
        response: `⚡ **Free Hit Regulations (T20 & ODI):**\n\n- Awarded immediately after any front-foot or illegal No-Ball.\n- **Fielding Restriction**: Fielders cannot be changed unless the batsmen crossed ends.\n- **How can a batsman be dismissed?** Only in 3 rare ways:\n  1. **Run Out** ✅\n  2. **Hit Ball Twice** ✅\n  3. **Obstructing the Field** ✅\n- *Cannot be out Bowled, Caught, LBW, or Stumped!*`,
        chips: ['Explain LBW rules', 'Recording Extras', 'How does strike rotation work?']
      },
      {
        id: 'mankad_rule',
        keywords: ['mankad', 'mankading', 'non striker run out', 'run out at non striker', 'law 41', 'backing up'],
        title: 'Non-Striker Run Out (Mankading Law 41.16)',
        response: `🏃‍♂️ **Non-Striker Run Out (Mankad / Law 41.16):**\n\n- It is a **100% legitimate Run Out** under official MCC Laws of Cricket (no warning is legally required).\n- **Timing Rule**: The bowler can run out the non-striker only **before** the bowler enters their normal delivery stride release point.\n- In StumpScore, select **Dismissal -> Run Out -> Non-Striker** to log this cleanly.`,
        chips: ['Explain LBW rules', 'What happens on a Free Hit?', 'Undo a wrong ball']
      },
      {
        id: 'dls_method',
        keywords: ['dls', 'duckworth lewis', 'rain rule', 'rain stopped', 'interrupted match', 'target revised'],
        title: 'DLS (Duckworth-Lewis-Stern) Rain Method',
        response: `🌧️ **DLS Method in Interrupted Matches:**\n\n- Cricket uses two resources: **Overs remaining** and **Wickets in hand**.\n- When rain cuts overs in the 2nd innings, the target is revised using the standard ICC Resource Percentage Table.\n- If Team 1 scores 180 in 20 ov, and Team 2 gets only 10 overs with 10 wickets left, their revised target might be ~105 runs.\n- StumpScore has built-in DLS calculator support for tournament matches.`,
        chips: ['How is NRR calculated?', 'How to create a Tournament?', 'Start a New Match']
      },
      {
        id: 'live_scores_ind_pak',
        keywords: ['india pakistan', 'ind vs pak', 'live score', 'international match', 'cricapi', 'world cup live', 'ipl live'],
        title: 'Live International Scores (India vs Pakistan & World Cup)',
        response: `🇮🇳🇵🇰 **Live International Match Tracking:**\n\n- StumpScore supports tracking high-octane international clashes (like **India vs Pakistan**, T20 World Cup, IPL)!\n- Real-time live scores, ball commentary, and win probability meters are fetched via Cricket APIs (CricAPI / RapidAPI).\n- For offline demos and college vivas, a **Live Simulation Engine** is built-in to stream a thrilling IND vs PAK chase anytime without internet! 🏆`,
        chips: ['How to start scoring a match?', 'How is NRR calculated?', 'Download APK for Android']
      },
      {
        id: 'poster_studio',
        keywords: ['poster', 'poster studio', 'social graphics', 'instagram poster', 'share poster', 'download poster', '1080p'],
        title: 'Creating 1080p Social Match Posters',
        response: `🎨 **StumpScore Poster Studio:**\n\n1. Scroll to the **"Poster Studio"** section on this web page.\n2. Pick a template: **Match Result**, **Player of the Match**, or **Top Scorer**.\n3. Customize team names, scores, player photos, and match highlights.\n4. Tap **"Download High-Res (1080x1080 PNG)"** to post directly to Instagram, WhatsApp, and Twitter! 📸`,
        chips: ['Download APK for Android', 'Start a New Match', 'How to calculate NRR?']
      },
      {
        id: 'apk_install',
        keywords: ['apk', 'download', 'install', 'android', 'ios', 'how to install', 'apk download', 'unknown sources'],
        title: 'How to Download & Install StumpScore APK',
        response: `📱 **Installing StumpScore on Android & iOS:**\n\n- **Android APK (v1.0.1)**:\n  1. Tap the green **"Download APK"** button at the top of this page.\n  2. When prompted, tap **"Download Anyway"**.\n  3. Open the downloaded file and tap **"Install"** (Enable *"Allow from this source"* if prompted in Settings).\n- **Apple iOS / Web App**:\n  - Open this website in Safari -> Tap **Share icon** -> Tap **"Add to Home Screen"** for a full app experience!`,
        chips: ['Start a New Match', 'Poster Studio', 'India vs Pakistan live scores']
      },
      {
        id: 'tournaments',
        keywords: ['tournament', 'create tournament', 'points table', 'fixtures', 'knockout', 'league', 'semifinal'],
        title: 'Tournament Mode & Fixtures Management',
        response: `🏆 **Managing Tournaments in StumpScore:**\n\n1. Go to **"Tournaments"** in the app menu.\n2. Tap **"Create Tournament"** (League, Round Robin, or Knockout).\n3. Add all participating teams.\n4. StumpScore automatically generates **match schedules**, calculates **Win/Loss points (2 pts for win)**, and live **Net Run Rate (NRR)**!`,
        chips: ['How is NRR calculated?', 'Start a New Match', 'How to export scorecard?']
      }
    ];
  }

  /* --------------------------------------------------------------------------
     2. DOM Element Binding
     -------------------------------------------------------------------------- */
  initElements() {
    this.fabBtn = document.getElementById('stump-ai-fab');
    this.windowEl = document.getElementById('stump-ai-window');
    this.closeBtn = document.getElementById('stump-ai-close-btn');
    this.clearBtn = document.getElementById('stump-ai-clear-btn');
    this.settingsBtn = document.getElementById('stump-ai-settings-btn');
    this.soundBtn = document.getElementById('stump-ai-sound-btn');
    this.settingsPanel = document.getElementById('stump-ai-settings-panel');
    this.apiKeyInput = document.getElementById('stump-ai-api-key');
    this.saveKeyBtn = document.getElementById('stump-ai-save-key-btn');
    this.messagesContainer = document.getElementById('stump-ai-messages');
    this.typingIndicator = document.getElementById('stump-ai-typing');
    this.chipsContainer = document.getElementById('stump-ai-chips');
    this.form = document.getElementById('stump-ai-form');
    this.input = document.getElementById('stump-ai-input');
    this.sendBtn = document.getElementById('stump-ai-send-btn');

    // Load saved API key if present
    const savedKey = localStorage.getItem(this.apiKeyStorageKey);
    if (savedKey && this.apiKeyInput) {
      this.apiKeyInput.value = savedKey;
    }
  }

  /* --------------------------------------------------------------------------
     3. Event Listeners
     -------------------------------------------------------------------------- */
  bindEvents() {
    if (this.fabBtn) {
      this.fabBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleWindow();
      });
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeWindow();
      });
    }

    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.clearHistory();
      });
    }

    if (this.settingsBtn) {
      this.settingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.settingsPanel) {
          this.settingsPanel.classList.toggle('is-active');
        }
      });
    }

    if (this.soundBtn) {
      this.soundBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem(this.soundEnabledKey, this.soundEnabled.toString());
        this.soundBtn.style.opacity = this.soundEnabled ? '1' : '0.4';
        this.soundBtn.title = this.soundEnabled ? 'Sound On' : 'Sound Muted';
      });
    }

    if (this.saveKeyBtn) {
      this.saveKeyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const key = this.apiKeyInput.value.trim();
        if (key) {
          localStorage.setItem(this.apiKeyStorageKey, key);
          alert('✅ Google Gemini API key saved! StumpAI will use live Gemini intelligence.');
        } else {
          localStorage.removeItem(this.apiKeyStorageKey);
          alert('ℹ️ API key removed. StumpAI will use its instant built-in knowledge base.');
        }
        if (this.settingsPanel) this.settingsPanel.classList.remove('is-active');
      });
    }

    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleUserSubmit();
      });
    }

    if (this.input) {
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleUserSubmit();
        }
      });

      // Auto-resize textarea
      this.input.addEventListener('input', () => {
        this.input.style.height = 'auto';
        this.input.style.height = Math.min(this.input.scrollHeight, 80) + 'px';
      });
    }

    // Delegate quick prompt chip clicks
    if (this.chipsContainer) {
      this.chipsContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.stump-prompt-chip');
        if (chip) {
          const query = chip.getAttribute('data-prompt') || chip.textContent.trim();
          this.sendMessage(query);
        }
      });
    }

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeWindow();
      }
    });
  }

  /* --------------------------------------------------------------------------
     4. Audio Synthesizer (Zero-latency Web Audio Pop)
     -------------------------------------------------------------------------- */
  playPingSound() {
    if (!this.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880.00, this.audioCtx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.15);
    } catch (_) {}
  }

  /* --------------------------------------------------------------------------
     5. Window Toggle & Visibility
     -------------------------------------------------------------------------- */
  toggleWindow() {
    if (this.isOpen) {
      this.closeWindow();
    } else {
      this.openWindow();
    }
  }

  openWindow() {
    this.isOpen = true;
    if (this.windowEl) this.windowEl.classList.add('is-open');
    if (this.fabBtn) this.fabBtn.style.display = 'none';
    if (this.input) {
      setTimeout(() => this.input.focus(), 200);
    }
    this.scrollToBottom();
  }

  closeWindow() {
    this.isOpen = false;
    if (this.windowEl) this.windowEl.classList.remove('is-open');
    if (this.fabBtn) this.fabBtn.style.display = 'inline-flex';
  }

  /* --------------------------------------------------------------------------
     6. Message Dispatching & Routing (Dual Engine)
     -------------------------------------------------------------------------- */
  handleUserSubmit() {
    if (!this.input) return;
    const text = this.input.value.trim();
    if (!text || this.isGenerating) return;

    this.input.value = '';
    this.input.style.height = 'auto';
    this.sendMessage(text);
  }

  async sendMessage(queryText) {
    if (!queryText || this.isGenerating) return;

    // 1. Render User Message
    this.appendMessage({
      sender: 'user',
      text: queryText,
      time: this.getFormattedTime()
    });

    this.setGenerating(true);
    this.playPingSound();

    // 2. Decide between Gemini Live API vs Smart Local Engine
    const geminiKey = localStorage.getItem(this.apiKeyStorageKey);

    if (geminiKey && geminiKey.trim().length > 10 && navigator.onLine) {
      try {
        const answer = await this.queryGeminiAPI(queryText, geminiKey.trim());
        this.renderAssistantResponse(answer, ['How to score a match?', 'NRR formula', 'Explain LBW rules']);
        return;
      } catch (err) {
        console.warn('Gemini API call failed, falling back to instant knowledge base:', err);
      }
    }

    // 3. Fallback to Instant Smart Offline Knowledge Base (0ms lag, viva guarantee)
    setTimeout(() => {
      const match = this.findBestLocalMatch(queryText);
      this.renderAssistantResponse(match.response, match.chips);
    }, 450); // slight natural typing cadence
  }

  renderAssistantResponse(text, chips = []) {
    this.setGenerating(false);
    this.appendMessage({
      sender: 'assistant',
      text: text,
      time: this.getFormattedTime()
    });
    this.renderChips(chips);
    this.playPingSound();
    this.saveHistory();
  }

  /* --------------------------------------------------------------------------
     7. Intelligent Local Knowledge Matcher (Fuzzy Keyword Scoring)
     -------------------------------------------------------------------------- */
  findBestLocalMatch(query) {
    const cleanQuery = query.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
    const queryTokens = cleanQuery.split(/\s+/).filter(t => t.length > 1);

    let bestItem = null;
    let highestScore = 0;

    for (const item of this.knowledgeBase) {
      let score = 0;
      for (const kw of item.keywords) {
        const cleanKw = kw.toLowerCase();
        if (cleanQuery.includes(cleanKw)) {
          score += 10;
        }
        for (const token of queryTokens) {
          if (cleanKw.includes(token)) {
            score += 2;
          }
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestItem = item;
      }
    }

    if (highestScore > 0 && bestItem) {
      return bestItem;
    }

    // Smart default response if no exact rule match
    return {
      response: `🏏 **StumpScore Cricket Assistant**\n\nI can help you with anything regarding:\n- 🎯 **Scoring Matches**: Keypad, Wide, No-Ball, Wickets, Strike Swap, and Undo.\n- 📊 **Tournaments & NRR**: Formulas, Points table, and Fixtures.\n- ⚖️ **Cricket Laws & Rules**: LBW conditions, Free Hit, DLS, and Mankading.\n- 📱 **App Features**: Poster Studio, APK download, and India vs Pakistan live scores!\n\n*Try picking a quick topic below or asking a specific cricket doubt!*`,
      chips: ['How to start scoring a match?', 'How is Net Run Rate calculated?', 'What are the 4 LBW conditions?', 'Download APK for Android']
    };
  }

  /* --------------------------------------------------------------------------
     8. Live Google Gemini 1.5/2.0 API Connector
     -------------------------------------------------------------------------- */
  async queryGeminiAPI(userQuery, apiKey) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemInstruction = `You are StumpAI, the official intelligent cricket assistant and rules umpire for the "StumpScore" cricket scoring application.
You help users understand how to use StumpScore (match setup, scoring keypad, strike rotation, undo last ball, tournament NRR calculation, poster studio, live match tracking, and APK download).
You also act as an expert cricket umpire answering LBW laws, Free Hit rules, DLS calculations, and cricket tactics.
Keep answers concise, clear, and format with bullet points and cricket emojis.`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nUser Question: ${userQuery}` }]
        }
      ]
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Gemini HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) throw new Error('Empty Gemini response');
    return candidate;
  }

  /* --------------------------------------------------------------------------
     9. UI Rendering & Markdown Parsing
     -------------------------------------------------------------------------- */
  appendMessage({ sender, text, time }) {
    if (!this.messagesContainer) return;

    const row = document.createElement('div');
    row.className = `stump-msg-row ${sender}`;

    const parsedHtml = this.formatMarkdown(text);

    if (sender === 'assistant') {
      row.innerHTML = `
        <div class="stump-msg-avatar-small">✨</div>
        <div class="stump-msg-bubble">
          <div class="stump-bubble-content">${parsedHtml}</div>
          <div class="stump-msg-actions">
            <button type="button" class="stump-msg-copy-btn" title="Copy answer">
              <span>📋 Copy</span>
            </button>
            <span class="stump-msg-time">${time}</span>
          </div>
        </div>
      `;

      // Safe clipboard copy binding
      const copyBtn = row.querySelector('.stump-msg-copy-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(text).then(() => {
            if (window.showStumpToast) window.showStumpToast('📋 Answer copied!');
            copyBtn.innerHTML = '<span>✓ Copied</span>';
            setTimeout(() => { copyBtn.innerHTML = '<span>📋 Copy</span>'; }, 2000);
          }).catch(() => {});
        });
      }
    } else {
      row.innerHTML = `
        <div class="stump-msg-bubble">
          <div class="stump-bubble-content">${parsedHtml}</div>
          <span class="stump-msg-time">${time}</span>
        </div>
      `;
    }

    this.messagesContainer.appendChild(row);
    this.scrollToBottom();
  }

  renderChips(chipsList) {
    if (!this.chipsContainer) return;
    this.chipsContainer.innerHTML = '';
    if (!chipsList || chipsList.length === 0) return;

    chipsList.forEach(chipText => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'stump-prompt-chip';
      btn.setAttribute('data-prompt', chipText);
      btn.textContent = chipText;
      this.chipsContainer.appendChild(btn);
    });
  }

  setGenerating(isGen) {
    this.isGenerating = isGen;
    if (this.typingIndicator) {
      if (isGen) {
        this.typingIndicator.classList.add('is-active');
        this.messagesContainer.appendChild(this.typingIndicator);
        this.scrollToBottom();
      } else {
        this.typingIndicator.classList.remove('is-active');
      }
    }
    if (this.sendBtn) {
      this.sendBtn.disabled = isGen;
    }
  }

  formatMarkdown(raw) {
    if (!raw) return '';

    // 1. Escape HTML entities
    let text = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 2. Math / LaTeX formulas $$\text{...}$$
    text = text.replace(/\$\$(.*?)\$\$/gs, (match, formula) => {
      const cleanFormula = formula
        .replace(/\\text\{(.*?)\}/g, '$1')
        .replace(/\\left\(|\\right\)/g, '')
        .replace(/\\frac\{(.*?)\}\{(.*?)\}/g, '($1 / $2)')
        .trim();
      return `<div class="stump-formula-badge">${cleanFormula}</div>`;
    });

    // 3. Code blocks ```code```
    text = text.replace(/```([\s\S]*?)```/g, '<pre class="stump-code-block"><code>$1</code></pre>');

    // 4. Inline code `code`
    text = text.replace(/`([^`]+)`/g, '<code class="stump-inline-code">$1</code>');

    // 5. Bold & Italic
    text = text.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

    // 6. Split by lines to parse lists and paragraphs
    const lines = text.split('\n');
    let html = '';
    let inUl = false;
    let inOl = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        if (inUl) { html += '</ul>'; inUl = false; }
        if (inOl) { html += '</ol>'; inOl = false; }
        continue;
      }

      // Check unordered list item (- item, * item, • item)
      const ulMatch = line.match(/^[-*•]\s+(.*)$/);
      if (ulMatch) {
        if (inOl) { html += '</ol>'; inOl = false; }
        if (!inUl) { html += '<ul class="stump-msg-list">'; inUl = true; }
        html += `<li>${ulMatch[1]}</li>`;
        continue;
      }

      // Check ordered list item (1. item, 2. item)
      const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
      if (olMatch) {
        if (inUl) { html += '</ul>'; inUl = false; }
        if (!inOl) { html += '<ol class="stump-msg-list">'; inOl = true; }
        html += `<li>${olMatch[2]}</li>`;
        continue;
      }

      // Regular line: Close any open lists
      if (inUl) { html += '</ul>'; inUl = false; }
      if (inOl) { html += '</ol>'; inOl = false; }

      // Check headings (### or ## or #)
      if (line.startsWith('### ')) {
        html += `<h5 class="stump-msg-h3">${line.substring(4)}</h5>`;
      } else if (line.startsWith('## ')) {
        html += `<h4 class="stump-msg-h2">${line.substring(3)}</h4>`;
      } else if (line.startsWith('<div class="stump-formula-badge">')) {
        html += line;
      } else {
        html += `<p class="stump-msg-p">${line}</p>`;
      }
    }

    if (inUl) html += '</ul>';
    if (inOl) html += '</ol>';

    return html;
  }

  getFormattedTime() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  /* --------------------------------------------------------------------------
     10. LocalStorage Persistence
     -------------------------------------------------------------------------- */
  saveHistory() {
    try {
      const messages = [];
      const rows = this.messagesContainer.querySelectorAll('.stump-msg-row');
      rows.forEach(r => {
        const isUser = r.classList.contains('user');
        const textEl = r.querySelector('.stump-msg-bubble div');
        const timeEl = r.querySelector('.stump-msg-time');
        if (textEl) {
          messages.push({
            sender: isUser ? 'user' : 'assistant',
            html: textEl.innerHTML,
            time: timeEl ? timeEl.textContent : ''
          });
        }
      });
      // Keep last 25 messages
      const slice = messages.slice(-25);
      localStorage.setItem(this.storageKey, JSON.stringify(slice));
    } catch (_) {}
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list) && list.length > 0) {
          this.messagesContainer.innerHTML = '';
          list.forEach(item => {
            const row = document.createElement('div');
            row.className = `stump-msg-row ${item.sender}`;
            if (item.sender === 'assistant') {
              row.innerHTML = `
                <div class="stump-msg-avatar-small">✨</div>
                <div class="stump-msg-bubble">
                  <div>${item.html}</div>
                  <span class="stump-msg-time">${item.time || ''}</span>
                </div>
              `;
            } else {
              row.innerHTML = `
                <div class="stump-msg-bubble">
                  <div>${item.html}</div>
                  <span class="stump-msg-time">${item.time || ''}</span>
                </div>
              `;
            }
            this.messagesContainer.appendChild(row);
          });
          return;
        }
      }
    } catch (_) {}

    // Default welcome prompt chips
    this.renderChips([
      '🏏 How to start a match?',
      '📊 ICC NRR Formula',
      '⚖️ 4 LBW Conditions',
      '⚡ Free Hit Rules',
      '🎨 Poster Studio',
      '📱 Download APK'
    ]);
  }

  clearHistory() {
    localStorage.removeItem(this.storageKey);
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = `
        <div class="stump-msg-row assistant">
          <div class="stump-msg-avatar-small">✨</div>
          <div class="stump-msg-bubble">
            <div>
              <p>🏏 <strong>Hello! I am StumpAI</strong>, your smart cricket scoring assistant & rules umpire.</p>
              <p>Ask me any doubt about using <strong>StumpScore</strong>, scoring rules, Net Run Rate (NRR), or official cricket laws!</p>
            </div>
            <span class="stump-msg-time">${this.getFormattedTime()}</span>
          </div>
        </div>
      `;
    }
    this.renderChips([
      '🏏 How to start a match?',
      '📊 ICC NRR Formula',
      '⚖️ 4 LBW Conditions',
      '⚡ Free Hit Rules',
      '🎨 Poster Studio',
      '📱 Download APK'
    ]);
  }
}

// Global initialization when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (!window.stumpAIAssistant) {
    window.stumpAIAssistant = new StumpAIAssistant();
  }
});
