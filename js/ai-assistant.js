/**
 * StumpAI — Ultra-Premium In-App AI Assistant & Cricket Rules Umpire
 * Dual-Engine: Google Gemini 1.5/2.0 API + Comprehensive Expert Offline Knowledge Base
 */

class StumpAIAssistant {
  constructor() {
    this.storageKey = 'stump_ai_history_v2';
    this.apiKeyStorageKey = 'stump_gemini_api_key';
    this.soundEnabledKey = 'stump_ai_sound_enabled';
    this.themeStorageKey = 'stump_ai_theme';

    this.isOpen = false;
    this.isGenerating = false;
    this.soundEnabled = localStorage.getItem(this.soundEnabledKey) !== 'false';
    this.audioCtx = null;

    // Professional SVG AI icon template
    this.aiSvgIcon = `
      <svg class="stump-ai-svg-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z" fill="url(#aiGrad1)" stroke="url(#aiStroke1)" stroke-width="0.8"/>
        <circle cx="19" cy="5" r="2" fill="url(#aiGrad2)"/>
        <circle cx="5" cy="19" r="1.6" fill="url(#aiGrad2)"/>
        <defs>
          <linearGradient id="aiGrad1" x1="3" y1="2" x2="21" y2="20" gradientUnits="userSpaceOnUse">
            <stop stop-color="#00E676"/>
            <stop offset="0.5" stop-color="#00B0FF"/>
            <stop offset="1" stop-color="#A855F7"/>
          </linearGradient>
          <linearGradient id="aiStroke1" x1="3" y1="2" x2="21" y2="20" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFFFFF"/>
            <stop offset="1" stop-color="#00E676"/>
          </linearGradient>
          <linearGradient id="aiGrad2" x1="0" y1="0" x2="1" y2="1">
            <stop stop-color="#00B0FF"/>
            <stop offset="1" stop-color="#00E676"/>
          </linearGradient>
        </defs>
      </svg>
    `;

    // Preloaded comprehensive Knowledge Base (0ms instant answers)
    this.knowledgeBase = this.initKnowledgeBase();

    this.initElements();
    this.initTheme();
    this.bindEvents();
    this.loadHistory();
  }

  /* --------------------------------------------------------------------------
     1. Comprehensive Knowledge Base (Expert Professional Level)
     -------------------------------------------------------------------------- */
  initKnowledgeBase() {
    return [
      // Section A: General & Conversational
      {
        id: 'q1_hello',
        keywords: ['hi', 'hello', 'hey', 'namaste'],
        response: 'Hello! Welcome to StumpScore. How may I assist you today?',
        chips: ['What is StumpScore?', 'How do I install on Android?', 'Who created StumpScore?']
      },
      {
        id: 'q2_good_morning',
        keywords: ['good morning', 'morning'],
        response: 'Good morning! Welcome to StumpScore. How may I be of assistance today?',
        chips: ['What is StumpScore?', 'How does scoring work?', 'Contact Creator']
      },
      {
        id: 'q3_good_afternoon_evening',
        keywords: ['good afternoon', 'good evening'],
        response: "Good afternoon/evening! It's a pleasure to hear from you. How may I help?",
        chips: ['What is StumpScore?', 'How do I install on Android?', 'Tournaments & NRR']
      },
      {
        id: 'q4_how_are_you',
        keywords: ['how are you', 'how are u', 'how do you do'],
        response: "I'm doing well, thank you for asking. How can I assist you today?",
        chips: ['What is StumpScore?', 'Which platforms are supported?', 'Start a New Match']
      },
      {
        id: 'q5_who_are_you',
        keywords: ['who are you', 'what is your name', 'tell me about yourself', 'who r u'],
        response: 'I am StumpAI Guru, the virtual assistant of StumpScore, created by Yash Kotak. I can help you with the app, scoring rules, and tournaments.',
        chips: ['What can you do?', 'Who created StumpScore?', 'Is StumpScore free?']
      },
      {
        id: 'q6_what_can_you_do',
        keywords: ['what can you do', 'what do you do', 'features', 'help me with', 'how can you help'],
        response: 'I can guide you on downloading and installing StumpScore, using its features, cricket scoring rules, Net Run Rate, and contacting the creator.',
        chips: ['How do I install on Android?', 'How does ball-by-ball scoring work?', 'Net Run Rate formula']
      },
      {
        id: 'q7_bot_or_human',
        keywords: ['are you a bot', 'are you human', 'are you real', 'ai or human', 'robot'],
        response: 'I am an AI assistant, here to help you with StumpScore and cricket scoring questions.',
        chips: ['What is StumpScore?', 'Who created StumpScore?', 'Scoring Features']
      },
      {
        id: 'q8_thank_you',
        keywords: ['thank you', 'thanks', 'thanks a lot', 'thank u', 'thx'],
        response: "You're most welcome! Is there anything else I can help you with?",
        chips: ['Download APK', 'Net Run Rate formula', 'Contact Creator']
      },
      {
        id: 'q9_bye',
        keywords: ['bye', 'good night', 'goodbye', 'see you', 'cya'],
        response: 'Thank you for visiting. Have a wonderful day, and please feel free to return anytime.',
        chips: ['What is StumpScore?', 'Download APK', 'Website Link']
      },
      {
        id: 'q10_are_you_there',
        keywords: ['are you there', 'can you help me', 'anybody there', 'help me'],
        response: 'Yes, I am here. Please tell me your question, and I will gladly assist you.',
        chips: ['What is StumpScore?', 'How do I install on Android?', 'Scoring Features']
      },

      // Section B: About StumpScore
      {
        id: 'q11_what_is_stumpscore',
        keywords: ['what is stumpscore', 'about stumpscore', 'stump score app', 'overview', 'stumpscore features'],
        response: 'StumpScore is a smart cricket scoring and tournament app with live ball-by-ball scoring, batting partnerships, Net Run Rate tables, career leaderboards, and 1080p match posters.',
        chips: ['Is StumpScore free?', 'Where can I download it?', 'How does scoring work?']
      },
      {
        id: 'q12_who_created',
        keywords: ['who created', 'creator', 'founder', 'developer', 'who made', 'author', 'yash kotak'],
        response: 'StumpScore was created by Yash Kotak. You may contact him at Stump_score@gmail.com.',
        chips: ['Do you have social media?', 'How can I send feedback?', 'What is StumpScore?']
      },
      {
        id: 'q13_is_free',
        keywords: ['is stumpscore free', 'cost', 'pricing', 'price', 'paid', 'subscription', 'free to use'],
        response: 'Yes, StumpScore is free for all clubs and tournaments.',
        chips: ['Where can I download it?', 'Which platforms does it support?', 'Tournament Mode']
      },
      {
        id: 'q14_platforms_supported',
        keywords: ['platforms', 'devices', 'android or ios', 'iphone', 'windows', 'operating system', 'support'],
        response: 'StumpScore supports Android (APK), Apple iOS (as a web app and TestFlight beta), and the web.',
        chips: ['How do I install on Android?', 'How do I install on iPhone?', 'Latest version']
      },
      {
        id: 'q15_latest_version',
        keywords: ['latest version', 'current version', 'build number', 'update', 'version'],
        response: 'The latest stable build is v1.0.1.',
        chips: ['Where can I download it?', 'How do I install on Android?', 'Is StumpScore free?']
      },
      {
        id: 'q16_where_to_download',
        keywords: ['where can i download', 'download link', 'download website', 'get app', 'get stumpscore', 'download apk link'],
        response: 'You can download it from the official website, https://stumpscore.vercel.app/, using the "Download APK" button for Android.',
        chips: ['How do I install on Android?', 'How do I install on iPhone?', 'QR Code']
      },

      // Section C: Installation
      {
        id: 'q17_install_android',
        keywords: ['how do i install it on android', 'install android', 'install apk', 'setup android', 'android installation', 'download apk'],
        response: 'Tap "Download APK" on the website, open the downloaded file, allow installation from your browser if prompted, then tap Install.',
        chips: ['Why allow unknown apps?', 'How large is the APK?', 'Supported Android versions']
      },
      {
        id: 'q18_unknown_sources',
        keywords: ['unknown apps', 'unknown sources', 'harmful file', 'security prompt', 'permission prompt', 'why unknown'],
        response: 'The app is installed directly as an APK, not through the Play Store, so Android asks for this permission. Please download only from the official website.',
        chips: ['How do I install on Android?', 'How large is the APK?', 'Does it work offline?']
      },
      {
        id: 'q19_apk_size',
        keywords: ['apk size', 'how large is the apk', 'file size', 'how many mb', 'storage size', 'app size'],
        response: 'The APK is approximately 70-75 MB.',
        chips: ['Which Android versions are supported?', 'How do I install on Android?', 'Where can I download it?']
      },
      {
        id: 'q20_android_versions',
        keywords: ['android versions', 'which android version', 'minimum android', 'marshmallow', 'android requirement'],
        response: 'StumpScore supports Android 6.0 (Marshmallow) and higher.',
        chips: ['How do I install on Android?', 'How large is the APK?', 'Does it work offline?']
      },
      {
        id: 'q21_install_ios',
        keywords: ['install on iphone', 'install on ipad', 'apple ios', 'ios installation', 'safari home screen', 'add to home screen'],
        response: 'Open the website in Safari, tap the Share icon, choose "Add to Home Screen", then tap "Add". It then works like a native app. iOS 14.0 or higher is required.',
        chips: ['What is iOS TestFlight beta?', 'Is it on App Store?', 'Which platforms does it support?']
      },
      {
        id: 'q22_testflight',
        keywords: ['testflight', 'ios testflight', 'beta test', 'early access', 'apple beta'],
        response: 'It is an early-access program where you install TestFlight from the App Store and accept the StumpScore invitation to test the native iOS build.',
        chips: ['How do I install on iPhone?', 'Which platforms does it support?', 'Where can I download it?']
      },
      {
        id: 'q23_play_store_app_store',
        keywords: ['play store', 'app store', 'google play', 'apple app store', 'is it on play store', 'is stumpscore on play store'],
        response: 'Currently it is available through the website (APK, iOS web app, and TestFlight beta). Please check the website for future updates.',
        chips: ['Where can I download it?', 'How do I install on Android?', 'QR Code']
      },
      {
        id: 'q24_qr_code',
        keywords: ['qr code', 'scan qr', 'barcode', 'camera scan', 'open via qr'],
        response: 'Yes. The website has a QR code. Scan it with your phone camera to open the app instantly.',
        chips: ['Where can I download it?', 'How do I install on Android?', 'Does it work offline?']
      },
      {
        id: 'q25_works_offline',
        keywords: ['offline', 'no internet', 'work offline', 'without wifi', 'offline scoring', 'without internet'],
        response: 'Yes, StumpScore works offline and syncs when you are connected again.',
        chips: ['How does scoring work?', 'Ball-by-ball scoring', 'Start a New Match']
      },

      // Section D: Scoring Features
      {
        id: 'q26_ball_by_ball',
        keywords: ['ball by ball scoring', 'how does ball-by-ball scoring work', 'how does scoring work', 'enter score', 'scoring keypad'],
        response: 'You tap runs, boundaries, wickets, or extras for each delivery. The app counts legal balls and completes overs automatically.',
        chips: ['Does strike change automatically?', 'Support wides and no-balls?', 'Can I undo a mistake?']
      },
      {
        id: 'q27_wides_noballs_freehits',
        keywords: ['wides', 'no balls', 'no-balls', 'free hits', 'free hit', 'support wides', 'support no-balls'],
        response: 'Yes. It fully supports wides, no-balls, and free hits.',
        chips: ['Does it support penalty runs?', 'Which dismissals can I record?', 'Can I undo a mistake?']
      },
      {
        id: 'q28_penalty_runs',
        keywords: ['penalty runs', 'penalty run', '+5 runs', '5 penalty', 'penalty'],
        response: 'Yes, it supports penalty runs (+5).',
        chips: ['Does it handle byes?', 'Support wides and no-balls?', 'Which dismissals can I record?']
      },
      {
        id: 'q29_strike_change',
        keywords: ['strike change', 'strike rotation', 'swap strike', 'odd runs', 'strike automatically', 'over end strike'],
        response: 'Yes, strike rotation happens automatically on odd runs and at the end of an over.',
        chips: ['Which dismissals can I record?', 'Can I undo a mistake?', 'Live batting partnerships']
      },
      {
        id: 'q30_dismissals_supported',
        keywords: ['dismissals', 'which dismissals', 'wickets', 'caught', 'bowled', 'lbw', 'run-out', 'run out', 'stumped', 'hit-wicket'],
        response: 'Caught, Bowled, LBW, Run-Out, Stumped, and Hit-Wicket, shown in standard ESPN Cricinfo notation.',
        chips: ['Can I record who made run-out?', 'Can I undo a mistake?', 'Live batting partnerships']
      },
      {
        id: 'q31_run_out_fielder',
        keywords: ['who made run out', 'run out fielder', 'fielder attribution', 'thrower', 'fielder name run out'],
        response: 'Yes, run-outs include fielder attribution.',
        chips: ['Can I undo a mistake?', 'Does it handle byes?', 'Live batting partnerships']
      },
      {
        id: 'q32_undo_mistake',
        keywords: ['undo', 'mistake', 'undo button', 'correct entry', 'fix wrong ball', 'wrong ball', 'scoring mistake'],
        response: 'Yes, there is an Undo button to correct the last entry.',
        chips: ['How does scoring work?', 'Live batting partnerships', 'Does it handle byes?']
      },
      {
        id: 'q33_byes',
        keywords: ['byes', 'leg byes', 'handle byes', 'bye button', 'leg bye', 'byes support'],
        response: 'Yes, byes can be recorded using the dedicated button.',
        chips: ['What are live batting partnerships?', 'Does it support penalty runs?', 'Can I undo a mistake?']
      },
      {
        id: 'q34_partnerships',
        keywords: ['batting partnerships', 'live partnerships', 'partnership', 'current stand', 'live batting partnerships'],
        response: "It shows the current stand's runs, balls, run rate, and each batter's share, and saves completed partnerships when a wicket falls.",
        chips: ['What is Tournament Mode?', 'Net Run Rate formula', 'Career stats & leaderboards']
      },

      // Section E: Tournaments & Stats
      {
        id: 'q35_tournament_mode',
        keywords: ['tournament mode', 'what is tournament mode', 'create tournament', 'fixtures', 'leagues'],
        response: 'It creates automatic points tables with fixtures and Net Run Rate for your club or league.',
        chips: ['Does it calculate Net Run Rate?', 'ICC all-out rule', 'What does points table show?']
      },
      {
        id: 'q36_nrr_calculation',
        keywords: ['net run rate', 'nrr', 'calculate nrr', 'how nrr works', 'nrr method', 'calculate net run rate'],
        response: 'Yes, it calculates NRR using the official ICC method.',
        chips: ['ICC all-out rule', 'Does it support DLS?', 'What does points table show?']
      },
      {
        id: 'q37_all_out_rule',
        keywords: ['all-out rule', 'all out rule', 'team all out', 'icc all out', 'allotted overs', 'follow all-out'],
        response: 'Yes, when a team is all out, NRR uses the full allotted overs, as per ICC rules.',
        chips: ['Does it support DLS?', 'What does points table show?', 'Career stats & leaderboards']
      },
      {
        id: 'q38_dls_support',
        keywords: ['dls', 'duckworth lewis', 'rain rule', 'rain stopped', 'revised target', 'support dls'],
        response: 'The website lists ICC DLS and NRR support in version 1.0.1.',
        chips: ['What does points table show?', 'Career stats & leaderboards', 'Tournament Mode']
      },
      {
        id: 'q39_points_table_display',
        keywords: ['points table show', 'points table', 'standings', 'rankings', 'nrr table', 'what does the points table show'],
        response: 'It shows teams, matches played, wins, points, and Net Run Rate, ranked automatically.',
        chips: ['Career stats & leaderboards', 'What is Tournament Mode?', 'Poster Generator']
      },
      {
        id: 'q40_career_stats',
        keywords: ['career stats', 'leaderboards', 'orange cap', 'purple cap', 'power hitters', 'economy bowler', 'awards'],
        response: 'StumpScore aggregates stats across matches, with the Orange Cap (runs), Purple Cap (wickets), Power Hitters (strike rate), and Economy Bowler awards.',
        chips: ['What is Poster Generator?', 'Can I share posters?', 'Sound effects']
      },

      // Section F: Posters, Sound & Squads
      {
        id: 'q41_poster_generator',
        keywords: ['poster generator', 'match poster', 'graphics', '1080x1080', 'match graphic', 'what is the poster generator'],
        response: 'It creates a 1080x1080 match result graphic with team scores, the result banner, and the Player of the Match.',
        chips: ['Can I share posters on social media?', 'Does it have sound effects?', 'Is there a coin toss feature?']
      },
      {
        id: 'q42_share_posters',
        keywords: ['share posters', 'social media', 'whatsapp', 'instagram share', 'download poster', 'can i share posters'],
        response: 'Yes, you can download the poster and share it on WhatsApp or Instagram.',
        chips: ['What is Poster Generator?', 'Does it have sound effects?', 'Coin toss feature']
      },
      {
        id: 'q43_sound_effects',
        keywords: ['sound effects', 'sounds', 'audio', 'stadium sounds', 'crowd cheering', 'does it have sound effects'],
        response: 'Yes, it has stadium sounds for fours, sixes, wickets, and the coin toss.',
        chips: ['Is there a coin toss feature?', 'How many players can a team have?', 'Try app before installing']
      },
      {
        id: 'q44_coin_toss',
        keywords: ['coin toss', 'toss feature', '3d coin toss', 'flip coin', 'is there a coin toss'],
        response: 'Yes, there is a 3D coin toss with sound.',
        chips: ['How many players can a team have?', 'Can I add player photos?', 'Sound effects']
      },
      {
        id: 'q45_squad_size',
        keywords: ['how many players', 'squad size', 'team players', 'player count', 'squad limit', 'how many players can a team have'],
        response: 'Squads can have 5 to 11 players.',
        chips: ['Can I add player photos and roles?', 'Try app before installing', 'Coin toss feature']
      },
      {
        id: 'q46_player_photos_roles',
        keywords: ['player photos', 'player roles', 'upload photos', 'batsman role', 'all-rounder', 'wicketkeeper', 'can i add player photos'],
        response: 'Yes, you can upload player photos and assign roles: Batsman, All-rounder, Wicketkeeper, or Bowler.',
        chips: ['How many players can a team have?', 'Try app before installing', 'Poster Generator']
      },
      {
        id: 'q47_try_before_installing',
        keywords: ['try the app', 'before installing', 'live demo', 'interactive demo', 'demo in browser', 'try app before installing'],
        response: 'Yes, the website has an interactive live demo where you can tap runs and wickets in your browser.',
        chips: ['Where can I download it?', 'What is StumpScore?', 'Who created StumpScore?']
      },

      // Section G: Support & Contact
      {
        id: 'q48_who_can_use',
        keywords: ['who can use', 'target audience', 'coaches', 'umpires', 'scorers', 'academies', 'who can use stumpscore'],
        response: 'Club umpires, scorers, academy coaches, tournament organizers, and cricket fans.',
        chips: ['Is StumpScore free?', 'How can I contact creator?', 'Do you have social media?']
      },
      {
        id: 'q49_contact_creator',
        keywords: ['contact creator', 'send feedback', 'email creator', 'support email', 'feature request', 'get in touch', 'how can i contact'],
        response: 'Please email Yash Kotak at Stump_score@gmail.com, or use the "Get in Touch" form on the website for feedback or feature requests.',
        chips: ['Do you have social media?', 'Who created StumpScore?', 'Is StumpScore free?']
      },
      {
        id: 'q50_social_media',
        keywords: ['social media', 'instagram', 'insta', 'follow on instagram', '@stump_score', 'do you have social media', 'instagram link', 'insta link', 'ig link', 'ig', 'handle', 'page', 'instagram account', 'follow', 'socials', 'connect on instagram', 'insta id', 'instagram id', 'insta account'],
        response: `We would be delighted to have you join our cricket community! 🏏✨\n\nYou can connect with us directly on Instagram at [@stump_score](https://instagram.com/stump_score) for:\n• 🚀 Instant announcements & new feature updates\n• 📊 Interactive cricket scoring tips & umpire rule guides\n• 🏆 Grassroots tournaments and match highlights\n• 💬 Direct feedback, feature requests & community discussions\n\n[instagram-card:https://instagram.com/stump_score]\n\nFeel free to send us a direct message anytime. How else may I assist you today?`,
        chips: ['How can I contact creator?', 'Try Live Demo', 'What is StumpScore?']
      }
    ];
  }

  /* --------------------------------------------------------------------------
     2. DOM Element Binding
     -------------------------------------------------------------------------- */
  initElements() {
    this.fabContainer = document.getElementById('stump-ai-fab-container');
    this.fabBtn = document.getElementById('stump-ai-fab');
    this.fabPill = document.getElementById('stump-ai-fab-pill');
    this.windowEl = document.getElementById('stump-ai-window');
    this.closeBtn = document.getElementById('stump-ai-close-btn');
    this.clearBtn = document.getElementById('stump-ai-clear-btn');
    this.settingsBtn = document.getElementById('stump-ai-settings-btn');
    this.soundBtn = document.getElementById('stump-ai-sound-btn');
    this.settingsPanel = document.getElementById('stump-ai-settings-panel');
    this.settingsCloseBtn = document.getElementById('stump-ai-settings-close-btn');
    this.themeButtons = document.querySelectorAll('.stump-ai-theme-pill');
    this.soundToggle = document.getElementById('stump-ai-sound-toggle');
    this.advancedToggle = document.getElementById('stump-ai-advanced-toggle');
    this.advancedPanel = document.getElementById('stump-ai-advanced-panel');
    this.apiKeyInput = document.getElementById('stump-ai-api-key');
    this.saveKeyBtn = document.getElementById('stump-ai-save-key-btn');
    this.keyStatus = document.getElementById('stump-ai-key-status');
    this.messagesContainer = document.getElementById('stump-ai-messages');
    this.typingIndicator = document.getElementById('stump-ai-typing');
    this.chipsContainer = document.getElementById('stump-ai-chips');
    this.form = document.getElementById('stump-ai-form');
    this.input = document.getElementById('stump-ai-input');
    this.sendBtn = document.getElementById('stump-ai-send-btn');
    this.micBtn = document.getElementById('stump-ai-mic-btn');
    this.isListening = false;
    this.recognition = null;
    this.previousPlaceholder = '';

    // Initialize sound button opacity & switch state
    if (this.soundBtn) {
      this.soundBtn.style.opacity = this.soundEnabled ? '1' : '0.4';
      this.soundBtn.title = this.soundEnabled ? 'Sound On' : 'Sound Muted';
    }
    if (this.soundToggle) {
      this.soundToggle.checked = this.soundEnabled;
    }

    // Load saved API key if present
    const savedKey = localStorage.getItem(this.apiKeyStorageKey);
    if (savedKey && this.apiKeyInput) {
      this.apiKeyInput.value = savedKey;
      if (this.keyStatus) {
        this.keyStatus.textContent = 'Custom Gemini Key connected';
        this.keyStatus.style.color = 'var(--pitch-green, #00e676)';
      }
    }
  }

  /* --------------------------------------------------------------------------
     Theme Management (Dedicated StumpAI Appearance Selector)
     -------------------------------------------------------------------------- */
  initTheme() {
    const savedTheme = localStorage.getItem(this.themeStorageKey) || 'auto';
    this.applyAiTheme(savedTheme, false);
  }

  setAiTheme(themeChoice) {
    if (!['dark', 'light', 'auto'].includes(themeChoice)) return;
    localStorage.setItem(this.themeStorageKey, themeChoice);
    this.applyAiTheme(themeChoice, true);
  }

  applyAiTheme(themeChoice, notifyUser = false) {
    if (!this.windowEl) return;

    if (themeChoice === 'dark') {
      this.windowEl.classList.remove('stump-ai-theme-light');
      this.windowEl.classList.add('stump-ai-theme-dark');
    } else if (themeChoice === 'light') {
      this.windowEl.classList.remove('stump-ai-theme-dark');
      this.windowEl.classList.add('stump-ai-theme-light');
    } else {
      // Auto: Match website theme
      this.windowEl.classList.remove('stump-ai-theme-dark', 'stump-ai-theme-light');
    }

    // Update segmented theme pills active state
    if (this.themeButtons) {
      this.themeButtons.forEach(btn => {
        const choice = btn.getAttribute('data-theme-choice');
        btn.classList.toggle('is-active', choice === themeChoice);
      });
    }

    if (notifyUser && window.showStumpToast) {
      const label = themeChoice === 'dark' ? 'Dark Mode 🌙' : themeChoice === 'light' ? 'Light Mode ☀️' : 'Auto (App Matching) 📱';
      window.showStumpToast(`🎨 StumpAI appearance updated to ${label}`);
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

    if (this.fabPill) {
      this.fabPill.addEventListener('click', (e) => {
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

    if (this.settingsCloseBtn) {
      this.settingsCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.settingsPanel) {
          this.settingsPanel.classList.remove('is-active');
        }
      });
    }

    // Theme selector buttons
    if (this.themeButtons) {
      this.themeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const choice = btn.getAttribute('data-theme-choice');
          if (choice) this.setAiTheme(choice);
        });
      });
    }

    // Sound toggle in settings drawer
    if (this.soundToggle) {
      this.soundToggle.addEventListener('change', () => {
        this.soundEnabled = this.soundToggle.checked;
        localStorage.setItem(this.soundEnabledKey, this.soundEnabled.toString());
        if (this.soundBtn) {
          this.soundBtn.style.opacity = this.soundEnabled ? '1' : '0.4';
          this.soundBtn.title = this.soundEnabled ? 'Sound On' : 'Sound Muted';
        }
      });
    }

    // Header sound button
    if (this.soundBtn) {
      this.soundBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem(this.soundEnabledKey, this.soundEnabled.toString());
        this.soundBtn.style.opacity = this.soundEnabled ? '1' : '0.4';
        this.soundBtn.title = this.soundEnabled ? 'Sound On' : 'Sound Muted';
        if (this.soundToggle) this.soundToggle.checked = this.soundEnabled;
      });
    }

    // Advanced developer drawer toggle
    if (this.advancedToggle && this.advancedPanel) {
      this.advancedToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const isHidden = this.advancedPanel.style.display === 'none';
        this.advancedPanel.style.display = isHidden ? 'block' : 'none';
        this.advancedToggle.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      });
    }

    if (this.saveKeyBtn) {
      this.saveKeyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const key = this.apiKeyInput ? this.apiKeyInput.value.trim() : '';
        if (key) {
          localStorage.setItem(this.apiKeyStorageKey, key);
          if (this.keyStatus) {
            this.keyStatus.textContent = '✅ Key saved! Gemini LLM active.';
            this.keyStatus.style.color = 'var(--pitch-green, #00e676)';
          }
          if (window.showStumpToast) window.showStumpToast('✅ Custom Google Gemini key saved!');
        } else {
          localStorage.removeItem(this.apiKeyStorageKey);
          if (this.keyStatus) {
            this.keyStatus.textContent = 'ℹ️ Standard instant offline engine active.';
            this.keyStatus.style.color = 'var(--text-muted, #94a3b8)';
          }
          if (window.showStumpToast) window.showStumpToast('ℹ️ Using instant built-in AI engine.');
        }
      });
    }

    if (this.micBtn) {
      this.micBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleSpeechRecognition();
      });
    }

    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleUserSubmit();
      });
    }

    if (this.input) {
      // Enter to send (Shift+Enter for newline)
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleUserSubmit();
        }
      });

      // Auto-resize textarea & dynamically update send button disabled state
      this.input.addEventListener('input', () => {
        this.input.style.height = 'auto';
        this.input.style.height = Math.min(this.input.scrollHeight, 80) + 'px';
        if (this.sendBtn) {
          this.sendBtn.disabled = (this.input.value.trim() === '' || this.isGenerating);
        }
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

    // Initialize send button state
    if (this.sendBtn && this.input) {
      this.sendBtn.disabled = (this.input.value.trim() === '');
    }
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
     5. Window Toggle & Visibility (Visual Viewport & Body Scroll Lock)
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
    if (this.fabContainer) {
      this.fabContainer.classList.add('is-hidden');
    } else if (this.fabBtn) {
      this.fabBtn.style.display = 'none';
    }

    // Lock page background scrolling while chat is active
    document.body.classList.add('stump-ai-body-locked');

    // Visual Viewport API: Keeps chat bottom and input bar above mobile keyboard
    if (window.visualViewport) {
      this.viewportHandler = () => {
        if (!this.isOpen || window.innerWidth >= 640 || !this.windowEl) return;
        const vh = window.visualViewport.height;
        const offsetTop = window.visualViewport.offsetTop;
        this.windowEl.style.height = `${vh}px`;
        this.windowEl.style.top = `${offsetTop}px`;
        this.scrollToBottom();
      };
      window.visualViewport.addEventListener('resize', this.viewportHandler, { passive: true });
      window.visualViewport.addEventListener('scroll', this.viewportHandler, { passive: true });
      this.viewportHandler();
    }

    if (this.input) {
      setTimeout(() => this.input.focus(), 220);
    }
    this.scrollToBottom();
  }

  closeWindow() {
    this.isOpen = false;
    if (this.windowEl) {
      this.windowEl.classList.remove('is-open');
      this.windowEl.style.height = '';
      this.windowEl.style.top = '';
    }
    if (this.fabContainer) {
      this.fabContainer.classList.remove('is-hidden');
    } else if (this.fabBtn) {
      this.fabBtn.style.display = 'inline-flex';
    }

    // Restore background page scroll
    document.body.classList.remove('stump-ai-body-locked');

    // Remove Visual Viewport listeners
    if (window.visualViewport && this.viewportHandler) {
      window.visualViewport.removeEventListener('resize', this.viewportHandler);
      window.visualViewport.removeEventListener('scroll', this.viewportHandler);
      this.viewportHandler = null;
    }
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
    if (this.sendBtn) this.sendBtn.disabled = true;
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
        this.renderAssistantResponse(answer, ['How to score a match?', 'ICC NRR Formula', '4 LBW Conditions']);
        return;
      } catch (err) {
        console.warn('Gemini API call failed, falling back to instant knowledge base:', err);
      }
    }

    // 3. Fallback to Instant Smart Offline Knowledge Base (0ms lag, viva guarantee)
    setTimeout(() => {
      try {
        const match = this.findBestLocalMatch(queryText);
        this.renderAssistantResponse(match.response, match.chips);
      } catch (err) {
        this.renderAssistantError(queryText);
      }
    }, 380); // slight natural typing cadence
  }

  renderAssistantError(originalQuery) {
    this.setGenerating(false);
    this.appendMessage({
      sender: 'assistant',
      text: `I encountered an unexpected issue processing your request. Please try again.`,
      time: this.getFormattedTime(),
      retryQuery: originalQuery
    });
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
    const rawQuery = (query || '').trim();
    const cleanQuery = rawQuery.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
    const queryTokens = cleanQuery.split(/\s+/).filter(t => t.length > 1);

    // 1. Guard personal info about Yash Kotak
    const privateKeywords = ['phone number', 'phone', 'address', 'where does he live', 'salary', 'education', 'college', 'private', 'girlfriend', 'personal life', 'age', 'qualification', 'degree'];
    if (privateKeywords.some(pk => cleanQuery.includes(pk)) && (cleanQuery.includes('yash') || cleanQuery.includes('kotak') || cleanQuery.includes('creator') || cleanQuery.includes('developer') || cleanQuery.includes('founder') || cleanQuery.includes('his') || cleanQuery.includes('he'))) {
      return {
        response: "I cannot share personal details about Yash Kotak. You may reach out to him via email at Stump_score@gmail.com. How may I be of further assistance?",
        chips: ['How can I contact creator?', 'Do you have social media?', 'What is StumpScore?']
      };
    }

    // 2. Exact conversational greetings
    if (/^(hi|hello|hey|namaste)\b/i.test(rawQuery)) {
      return this.knowledgeBase.find(k => k.id === 'q1_hello');
    }
    if (/^good morning/i.test(rawQuery)) {
      return this.knowledgeBase.find(k => k.id === 'q2_good_morning');
    }
    if (/^good (afternoon|evening)/i.test(rawQuery)) {
      return this.knowledgeBase.find(k => k.id === 'q3_good_afternoon_evening');
    }
    if (/^how are (you|u)/i.test(rawQuery)) {
      return this.knowledgeBase.find(k => k.id === 'q4_how_are_you');
    }
    if (/(who are you|who r u|your name)/i.test(rawQuery)) {
      return this.knowledgeBase.find(k => k.id === 'q5_who_are_you');
    }
    if (/(what can you do|what do you do|help me with)/i.test(rawQuery)) {
      return this.knowledgeBase.find(k => k.id === 'q6_what_can_you_do');
    }
    if (/(bot|human|ai or human|real person)/i.test(rawQuery)) {
      return this.knowledgeBase.find(k => k.id === 'q7_bot_or_human');
    }
    if (/(thank you|thanks|thanks a lot|thank u)/i.test(rawQuery)) {
      return this.knowledgeBase.find(k => k.id === 'q8_thank_you');
    }
    if (/(bye|good night|goodbye|see you)/i.test(rawQuery)) {
      return this.knowledgeBase.find(k => k.id === 'q9_bye');
    }
    if (/(are you there|can you help me|anybody there)/i.test(rawQuery)) {
      return this.knowledgeBase.find(k => k.id === 'q10_are_you_there');
    }
    if (/(instagram|insta\b|ig link|@stump_score|social media|follow you|follow us|socials|instagram page|instagram link|insta id|instagram id|insta account|instagram account)/i.test(rawQuery)) {
      return this.knowledgeBase.find(k => k.id === 'q50_social_media');
    }
    if (/(live scoring demo|try live demo|try demo|scoring keypad)/i.test(rawQuery)) {
      return this.knowledgeBase.find(k => k.id === 'q47_try_before_installing');
    }

    // 3. Keyword Scoring across the 50 knowledge items
    let bestItem = null;
    let highestScore = 0;

    for (const item of this.knowledgeBase) {
      let score = 0;
      for (const kw of item.keywords) {
        const cleanKw = kw.toLowerCase();
        if (cleanQuery === cleanKw) {
          score += 40;
        } else if (cleanQuery.includes(cleanKw)) {
          score += 15;
        } else {
          const kwTokens = cleanKw.split(/\s+/).filter(t => t.length > 2);
          for (const kt of kwTokens) {
            if (queryTokens.includes(kt)) {
              score += 4;
            }
          }
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestItem = item;
      }
    }

    if (highestScore >= 8 && bestItem) {
      return bestItem;
    }

    // 4. Fallback Rule if unsure:
    return {
      response: "I'm sorry, I don't have information on that. You may contact Yash Kotak at Stump_score@gmail.com. How may I be of assistance with StumpScore?",
      chips: ['What is StumpScore?', 'How do I install on Android?', 'How does scoring work?', 'Contact Creator']
    };
  }

  /* --------------------------------------------------------------------------
     8. Live Google Gemini 1.5/2.0 API Connector
     -------------------------------------------------------------------------- */
  async queryGeminiAPI(userQuery, apiKey) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemInstruction = `You are StumpAI Guru, the official AI Virtual Assistant of StumpScore, a cricket scoring and tournament app created by Yash Kotak. Website: https://stumpscore.vercel.app/
Your purpose is to help users with questions about the StumpScore app, cricket scoring, and general conversation, politely and professionally.

CONTACT DETAILS (the only personal details you may share):
- Creator: Yash Kotak
- Email: Stump_score@gmail.com
- Instagram: https://instagram.com/stump_score (Handle: @stump_score). When asked for Instagram or social media, always respond warmly and politely, provide the direct link https://instagram.com/stump_score, explain what they can find on our page (scoring updates, community highlights, cricket tips), and invite them to connect!
Never share any other personal information about Yash Kotak. If asked about his education, phone number, address, or other private details, politely say you cannot share that and offer the email instead.

LANGUAGE RULE:
- Always reply in the same language the user writes in.
- If the user mixes languages, reply in the language of their main message.
- Keep the language simple, clear, and grammatically correct.

TONE & STYLE:
- Polite, warm, respectful, and formal-professional.
- Prefer phrasing such as "How may I be of assistance?"
- Keep replies short: 1-3 sentences unless the user needs step-by-step help.
- Avoid slang and excessive emojis. Stay patient even if the user is frustrated.
- Always end by offering further help.

GENERAL RULES:
- Always answer greetings and casual messages politely before moving to business.
- Match the greeting to the user's message ("Good morning" gets "Good morning").
- Answer only from the official StumpScore knowledge base (50 questions). Never invent features, prices, dates, or policies.
- If unsure or the information is not listed, say: "I'm sorry, I don't have information on that. You may contact Yash Kotak at Stump_score@gmail.com."
- If a question is general and harmless, answer briefly, then offer help with StumpScore.`;

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
  appendMessage({ sender, text, time, retryQuery = null }) {
    if (!this.messagesContainer) return;

    const row = document.createElement('div');
    row.className = `stump-msg-row ${sender}`;

    const parsedHtml = this.formatMarkdown(text);

    if (sender === 'assistant') {
      const retryBtnHtml = retryQuery
        ? `<button type="button" class="stump-msg-thumb-btn js-retry-btn" style="color: var(--pitch-green); border-color: var(--pitch-green); font-weight: 700;"><span>↻ Retry</span></button>`
        : '';

      row.innerHTML = `
        <div class="stump-msg-avatar-small">
          ${this.aiSvgIcon}
        </div>
        <div class="stump-msg-bubble">
          <div class="stump-bubble-content">${parsedHtml}</div>
          <div class="stump-msg-actions">
            <button type="button" class="stump-msg-copy-btn" title="Copy answer" aria-label="Copy answer">
              <span>📋 Copy</span>
            </button>
            <button type="button" class="stump-msg-tts-btn js-tts-btn" title="Listen to answer" aria-label="Listen">
              <span>🔊 Listen</span>
            </button>
            <button type="button" class="stump-msg-thumb-btn js-thumb-up" title="Helpful answer" aria-label="Thumbs up">
              <span>👍</span>
            </button>
            <button type="button" class="stump-msg-thumb-btn js-thumb-down" title="Not helpful" aria-label="Thumbs down">
              <span>👎</span>
            </button>
            ${retryBtnHtml}
            <span class="stump-msg-time">${time}</span>
          </div>
        </div>
      `;

      // Text-to-speech listen binding
      const ttsBtn = row.querySelector('.js-tts-btn');
      if (ttsBtn) {
        ttsBtn.addEventListener('click', () => {
          this.toggleTextToSpeech(text, ttsBtn);
        });
      }

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

      // Thumbs feedback bindings
      const upBtn = row.querySelector('.js-thumb-up');
      const downBtn = row.querySelector('.js-thumb-down');
      if (upBtn) {
        upBtn.addEventListener('click', () => {
          upBtn.classList.toggle('is-voted');
          if (downBtn) downBtn.classList.remove('is-voted');
          if (window.showStumpToast) window.showStumpToast('👍 Thanks for your feedback!');
        });
      }
      if (downBtn) {
        downBtn.addEventListener('click', () => {
          downBtn.classList.toggle('is-voted');
          if (upBtn) upBtn.classList.remove('is-voted');
          if (window.showStumpToast) window.showStumpToast('👎 Feedback noted, improving answers.');
        });
      }

      // Retry button binding
      const retryBtn = row.querySelector('.js-retry-btn');
      if (retryBtn && retryQuery) {
        retryBtn.addEventListener('click', () => {
          row.remove();
          this.sendMessage(retryQuery);
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

    // 6. Interactive Instagram Social Card Token (Prevent multiline HTML split)
    text = text.replace(/\[instagram-card:[^\]]+\]/g, '%%STUMP_INSTA_CARD%%');

    // 7. Markdown Links [text](url)
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="stump-chat-link">$1</a>');

    // 8. Split by lines to parse lists and paragraphs
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
      } else if (line === '%%STUMP_INSTA_CARD%%') {
        html += '%%STUMP_INSTA_CARD%%';
      } else {
        html += `<p class="stump-msg-p">${line}</p>`;
      }
    }

    if (inUl) html += '</ul>';
    if (inOl) html += '</ol>';

    // Post-process Instagram Card: Single clean component without fragmented p tags
    const instaCardClean = `<div class="stump-social-card"><div class="stump-social-card-header"><div class="stump-social-card-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><circle cx="12" cy="12" r="4"></circle><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></div><div class="stump-social-card-info"><span class="stump-social-handle">@stump_score</span><span class="stump-social-badge">Official Community • Instagram</span></div></div><p class="stump-social-desc">Follow StumpScore for app release notes, cricket umpire guidelines, live scoring tips &amp; tournament highlights!</p><a href="https://instagram.com/stump_score" target="_blank" rel="noopener noreferrer" class="stump-social-btn"><span>Follow @stump_score on Instagram ↗</span></a></div>`;

    html = html.replace(/<p class="stump-msg-p">\s*%%STUMP_INSTA_CARD%%\s*<\/p>/g, instaCardClean);
    html = html.replace(/%%STUMP_INSTA_CARD%%/g, instaCardClean);

    return html;
  }

  getFormattedTime() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      requestAnimationFrame(() => {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      });
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
        const textEl = r.querySelector('.stump-bubble-content');
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
                <div class="stump-msg-avatar-small">
                  ${this.aiSvgIcon}
                </div>
                <div class="stump-msg-bubble">
                  <div class="stump-bubble-content">${item.html}</div>
                  <div class="stump-msg-actions">
                    <button type="button" class="stump-msg-copy-btn" title="Copy answer">
                      <span>📋 Copy</span>
                    </button>
                    <span class="stump-msg-time">${item.time || ''}</span>
                  </div>
                </div>
              `;
              const copyBtn = row.querySelector('.stump-msg-copy-btn');
              if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                  const plainText = row.querySelector('.stump-bubble-content')?.innerText || '';
                  navigator.clipboard.writeText(plainText).then(() => {
                    if (window.showStumpToast) window.showStumpToast('📋 Answer copied!');
                    copyBtn.innerHTML = '<span>✓ Copied</span>';
                    setTimeout(() => { copyBtn.innerHTML = '<span>📋 Copy</span>'; }, 2000);
                  }).catch(() => {});
                });
              }
            } else {
              row.innerHTML = `
                <div class="stump-msg-bubble">
                  <div class="stump-bubble-content">${item.html}</div>
                  <span class="stump-msg-time">${item.time || ''}</span>
                </div>
              `;
            }
            this.messagesContainer.appendChild(row);
          });
        }
      }
    } catch (_) {}

    // Default welcome prompt chips
    this.renderChips([
      '📸 Instagram Page',
      'Try Live Demo',
      'How to install?',
      'Scoring rules',
      'NRR help',
      'Contact'
    ]);
  }

  clearHistory() {
    localStorage.removeItem(this.storageKey);
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = `
        <div class="stump-msg-row assistant">
          <div class="stump-msg-avatar-small">
            ${this.aiSvgIcon}
          </div>
          <div class="stump-msg-bubble">
            <div class="stump-bubble-content">
              <p class="stump-msg-p">Hello! Welcome to StumpScore.</p>
              <p class="stump-msg-p">I am <strong>StumpAI Guru</strong>, the official virtual assistant of StumpScore, created by Yash Kotak. How may I be of assistance today?</p>
            </div>
            <div class="stump-msg-actions">
              <button type="button" class="stump-msg-copy-btn" title="Copy answer" aria-label="Copy answer">
                <span>📋 Copy</span>
              </button>
              <span class="stump-msg-time">${this.getFormattedTime()}</span>
            </div>
          </div>
        </div>
      `;
    }
    this.renderChips([
      '📸 Instagram Page',
      'Try Live Demo',
      'How to install?',
      'Scoring rules',
      'NRR help',
      'Contact'
    ]);
  }

  /* --------------------------------------------------------------------------
     9. Trending Feature: Voice Dictation (Speech-to-Text)
     -------------------------------------------------------------------------- */
  toggleSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (window.showStumpToast) {
        window.showStumpToast('🎙️ Voice dictation not supported in this browser. Try Chrome or Safari.');
      } else {
        alert('Voice dictation is not supported in this browser. Please use Chrome or Safari.');
      }
      return;
    }

    if (this.isListening && this.recognition) {
      this.stopSpeechRecognition();
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.micBtn) {
          this.micBtn.classList.add('is-listening');
          this.micBtn.title = 'Listening... Speak your cricket doubt';
        }
        if (this.input) {
          this.previousPlaceholder = this.input.placeholder;
          this.input.placeholder = '🎙️ Listening to your voice... Speak now!';
        }
        if (window.showStumpToast) window.showStumpToast('🎙️ Listening... Ask your cricket question!');
      };

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (this.input && transcript) {
          this.input.value = transcript;
          this.input.dispatchEvent(new Event('input'));
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition notice:', event.error);
        this.stopSpeechRecognition();
        if (event.error === 'not-allowed') {
          if (window.showStumpToast) window.showStumpToast('⚠️ Microphone permission was denied.');
        }
      };

      this.recognition.onend = () => {
        this.stopSpeechRecognition();
      };

      this.recognition.start();
    } catch (err) {
      console.warn('Speech recognition initiation error:', err);
      this.stopSpeechRecognition();
    }
  }

  stopSpeechRecognition() {
    this.isListening = false;
    if (this.micBtn) {
      this.micBtn.classList.remove('is-listening');
      this.micBtn.title = 'Voice Dictation (Speak Question)';
    }
    if (this.input && this.previousPlaceholder) {
      this.input.placeholder = this.previousPlaceholder;
    }
    if (this.recognition) {
      try { this.recognition.abort(); } catch (_) {}
      this.recognition = null;
    }
  }

  /* --------------------------------------------------------------------------
     10. Trending Feature: Voice Audio Playback (Text-to-Speech)
     -------------------------------------------------------------------------- */
  toggleTextToSpeech(rawText, btnEl) {
    if (!('speechSynthesis' in window)) {
      if (window.showStumpToast) window.showStumpToast('⚠️ Voice read-aloud not supported in this browser.');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      document.querySelectorAll('.js-tts-btn').forEach(b => {
        b.classList.remove('is-speaking');
        b.innerHTML = '<span>🔊 Listen</span>';
      });
      if (btnEl.classList.contains('is-speaking')) return;
    }

    // Clean text: strip markdown symbols, URLs, and social card tags
    const cleanSpeech = rawText
      .replace(/\[instagram-card:[^\]]+\]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_#`~>]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    if (!cleanSpeech) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 0.98;
    utterance.pitch = 1.0;

    btnEl.classList.add('is-speaking');
    btnEl.innerHTML = '<span>⏹️ Stop</span>';

    utterance.onend = () => {
      btnEl.classList.remove('is-speaking');
      btnEl.innerHTML = '<span>🔊 Listen</span>';
    };

    utterance.onerror = () => {
      btnEl.classList.remove('is-speaking');
      btnEl.innerHTML = '<span>🔊 Listen</span>';
    };

    window.speechSynthesis.speak(utterance);
  }
}

// Global initialization when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (!window.stumpAIAssistant) {
    window.stumpAIAssistant = new StumpAIAssistant();
  }
});
