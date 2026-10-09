/**
 * StumpScore — Main Web App Logic
 * 3D Tilt Physics, Screen Switcher, Poster Studio (1080p Canvas Export),
 * iOS PWA Guide, Animated Counters, Modals & Mobile Touch Optimization
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  init3DTilt();
  initRippleEffect();
  initPhoneScreenSwitcher();
  initAnimatedCounters();
  initScrollReveal();
  initPosterStudio();
  initDownloadActions();
  initModals();
  initContactForm();
  initTickerObserver();
});

/* ==========================================================================
   Theme Management — 60fps GPU Accelerated Toggle
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('stumpscore_theme') || 'dark';

  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      // Instantly toggle data-theme; pure CSS hardware transforms smoothly animate the icons & cards
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('stumpscore_theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  const isDark = theme === 'dark';
  const nextModeText = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';

  themeToggleBtn.setAttribute('title', nextModeText);
  themeToggleBtn.setAttribute('aria-label', nextModeText);
}

/* ==========================================================================
   Navigation & High-Performance Active Links
   ========================================================================== */
function initNavigation() {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const siteHeader = document.querySelector('.site-header');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      menuToggle.textContent = isOpen ? '✕' : '☰';
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.textContent = '☰';
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('is-open')) {
        if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
          navMenu.classList.remove('is-open');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.textContent = '☰';
        }
      }
    });
  }

  // Silky-Smooth hardware-accelerated scrolling for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#' && targetId.length > 1) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          if (navMenu) {
            navMenu.classList.remove('is-open');
            if (menuToggle) {
              menuToggle.setAttribute('aria-expanded', 'false');
              menuToggle.textContent = '☰';
            }
          }
          
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // IntersectionObserver for Active Section
  const sections = document.querySelectorAll('section[id]');
  if ('IntersectionObserver' in window && sections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${id}`) {
              link.classList.add('active');
            } else if (href && href.startsWith('#') && href !== '#') {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(sec => navObserver.observe(sec));
  }
}

/* ==========================================================================
   3D Card Tilt Physics (rAF Throttled, Only on Desktop with Pointer)
   ========================================================================== */
function init3DTilt() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const cards = document.querySelectorAll('.feature-card, .review-card, .stat-counter-card, .step-card, .philosophy-card');
  cards.forEach(card => {
    card.classList.add('tilt-card');
    let ticking = false;

    card.addEventListener('mousemove', (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -3.5;
          const rotateY = ((x - centerX) / centerX) * 3.5;

          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ==========================================================================
   Material Ripple Effect on Buttons & Interactive Elements
   ========================================================================== */
function initRippleEffect() {
  const interactiveElements = document.querySelectorAll('.btn, .sim-btn, .phone-tab-btn, .theme-toggle-btn');
  interactiveElements.forEach(el => {
    el.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple-fx';

      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      ripple.style.width = ripple.style.height = `${diameter}px`;
      ripple.style.left = `${(e.clientX || (rect.left + radius)) - rect.left - radius}px`;
      ripple.style.top = `${(e.clientY || (rect.top + radius)) - rect.top - radius}px`;

      const existingRipple = this.querySelector('.ripple-fx');
      if (existingRipple) {
        existingRipple.remove();
      }

      this.appendChild(ripple);

      setTimeout(() => {
        if (ripple && ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 650);
    });
  });
}

/* ==========================================================================
   3D Phone Mockup Screen Switcher (Touch & Pointer Optimized)
   ========================================================================== */
window.switchPhonePreview = function(targetViewId, clickedBtn) {
  if (!targetViewId) return;

  const tabBtns = document.querySelectorAll('.phone-tab-btn');
  const views = document.querySelectorAll('.phone-view');

  // 1. Update active states on all tab buttons
  tabBtns.forEach(btn => {
    const viewAttr = btn.getAttribute('data-phone-view');
    const isMatch = (btn === clickedBtn || viewAttr === targetViewId);
    if (isMatch) {
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
    } else {
      btn.classList.remove('is-active');
      btn.setAttribute('aria-selected', 'false');
    }
  });

  // 2. Update view visibility
  views.forEach(view => {
    const isMatch = (view.id === targetViewId);
    if (isMatch) {
      view.style.display = 'flex';
      view.classList.add('is-visible');
      view.scrollTop = 0;
    } else {
      view.style.display = 'none';
      view.classList.remove('is-visible');
    }
  });
};

function initPhoneScreenSwitcher() {
  const tabBtns = document.querySelectorAll('.phone-tab-btn');

  tabBtns.forEach(btn => {
    ['click', 'touchend'].forEach(evtType => {
      btn.addEventListener(evtType, (e) => {
        e.preventDefault();
        const targetViewId = btn.getAttribute('data-phone-view');
        window.switchPhonePreview(targetViewId, btn);
      }, { passive: false });
    });
  });

  // Global document-level event delegation fallback for dynamic taps
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.phone-tab-btn');
    if (btn) {
      const targetViewId = btn.getAttribute('data-phone-view');
      if (targetViewId) {
        e.preventDefault();
        window.switchPhonePreview(targetViewId, btn);
      }
    }
  });
}

/* ==========================================================================
   Animated Stat Counters on Scroll (Staggered Rolling Physics + Replay)
   ========================================================================== */
function initAnimatedCounters() {
  const counterCards = document.querySelectorAll('.stat-counter-card');
  const counters = document.querySelectorAll('.counter-num[data-target]');
  if (!counters.length) return;

  function animateCounter(counter, delay = 0) {
    if (counter.dataset.animated === 'true') return;
    counter.dataset.animated = 'true';

    const targetStr = counter.getAttribute('data-target') || '0';
    const suffix = counter.getAttribute('data-suffix') || '';
    const isDecimal = targetStr.includes('.');
    const target = parseFloat(targetStr);
    const duration = 1800;

    setTimeout(() => {
      counter.classList.add('is-counting');
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Smooth ease-out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = target * easeOut;

        if (isDecimal) {
          counter.textContent = `${currentVal.toFixed(1)}${suffix}`;
        } else {
          counter.textContent = `${Math.round(currentVal).toLocaleString()}${suffix}`;
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          if (isDecimal) {
            counter.textContent = `${target.toFixed(1)}${suffix}`;
          } else {
            counter.textContent = `${target.toLocaleString()}${suffix}`;
          }
          counter.classList.remove('is-counting');
          counter.classList.add('is-completed');
        }
      }

      requestAnimationFrame(step);
    }, delay);
  }

  // Trigger animation when scrolled into view
  if ('IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          counters.forEach((counter, idx) => {
            animateCounter(counter, idx * 120);
          });
          obs.disconnect();
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

    const statsSection = document.getElementById('stats') || document.querySelector('.stat-counters-section');
    if (statsSection) {
      statsObserver.observe(statsSection);
    } else {
      counterCards.forEach(card => statsObserver.observe(card));
    }
  } else {
    counters.forEach((counter, idx) => animateCounter(counter, idx * 100));
  }

  // Re-animate on card hover/tap for interactive delight
  counterCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      const counter = card.querySelector('.counter-num[data-target]');
      if (counter && counter.dataset.animated === 'true') {
        counter.dataset.animated = 'false';
        counter.classList.remove('is-completed');
        animateCounter(counter, 0);
      }
    });
  });
}

/* ==========================================================================
   Scroll-Triggered Reveals
   ========================================================================== */
function initScrollReveal() {
  const targets = document.querySelectorAll('.feature-card, .step-card, .review-card, .simulator-wrapper, .poster-studio-wrapper, .cta-banner');
  targets.forEach((el, idx) => {
    el.classList.add('reveal-on-scroll');
    el.style.transitionDelay = `${(idx % 4) * 0.08}s`;
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, { threshold: 0.1 });

    targets.forEach(el => observer.observe(el));
  } else {
    targets.forEach(el => el.classList.add('is-revealed'));
  }
}

/* ==========================================================================
   Live Match Poster Customization Studio & 1080x1080 Canvas Generator
   ========================================================================== */
function initPosterStudio() {
  const team1Input = document.getElementById('poster-input-team1');
  const score1Input = document.getElementById('poster-input-score1');
  const team2Input = document.getElementById('poster-input-team2');
  const score2Input = document.getElementById('poster-input-score2');
  const resultInput = document.getElementById('poster-input-result');
  const mvpInput = document.getElementById('poster-input-mvp');
  const downloadBtn = document.getElementById('poster-download-btn');

  const previewTeam1 = document.getElementById('poster-pv-team1');
  const previewScore1 = document.getElementById('poster-pv-score1');
  const previewTeam2 = document.getElementById('poster-pv-team2');
  const previewScore2 = document.getElementById('poster-pv-score2');
  const previewResult = document.getElementById('poster-pv-result');
  const previewMvp = document.getElementById('poster-pv-mvp');

  function updatePoster() {
    const t1 = team1Input ? team1Input.value.trim() : 'India';
    const s1 = score1Input ? score1Input.value.trim() : '184/4 (20.0 ov)';
    const t2 = team2Input ? team2Input.value.trim() : 'Australia';
    const s2 = score2Input ? score2Input.value.trim() : '168/8 (20.0 ov)';
    const res = resultInput ? resultInput.value.trim() : 'India won by 16 runs';
    const mvp = mvpInput ? mvpInput.value.trim() : 'V. Kohli (82 runs & 1/14)';

    if (previewTeam1) previewTeam1.textContent = t1 || 'India';
    if (previewScore1) previewScore1.textContent = s1 || '184/4 (20.0 ov)';
    if (previewTeam2) previewTeam2.textContent = t2 || 'Australia';
    if (previewScore2) previewScore2.textContent = s2 || '168/8 (20.0 ov)';
    if (previewResult) previewResult.textContent = `🏆 ${res || 'India won by 16 runs'}`;
    if (previewMvp) previewMvp.textContent = `🌟 Player of the Match: ${mvp || 'V. Kohli (82 runs & 1/14)'}`;
  }

  [team1Input, score1Input, team2Input, score2Input, resultInput, mvpInput].forEach(input => {
    if (input) input.addEventListener('input', updatePoster);
  });

  if (downloadBtn) {
    downloadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      generateAndDownloadPoster();
    });
  }

  const whatsappBtn = document.getElementById('poster-whatsapp-btn');
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const t1 = (team1Input ? team1Input.value.trim() : '') || 'India';
      const s1 = (score1Input ? score1Input.value.trim() : '') || '184/4 (20.0 ov)';
      const t2 = (team2Input ? team2Input.value.trim() : '') || 'Australia';
      const s2 = (score2Input ? score2Input.value.trim() : '') || '168/8 (20.0 ov)';
      const res = (resultInput ? resultInput.value.trim() : '') || 'India won by 16 runs';
      const mvp = (mvpInput ? mvpInput.value.trim() : '') || 'V. Kohli (82 runs & 1/14)';

      const text = `🏏 *STUMPSCORE MATCH RESULT*\n━━━━━━━━━━━━━━━━━━━━\n🏆 *${res}*\n\n📊 *${t1}:* ${s1}\n📊 *${t2}:* ${s2}\n🌟 *Player of the Match:* ${mvp}\n━━━━━━━━━━━━━━━━━━━━\n📲 *Scored with StumpScore:* https://cricket-scoring-webapp.vercel.app`;
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    });
  }

  function generateAndDownloadPoster() {
    if (!downloadBtn) return;

    const originalHTML = downloadBtn.innerHTML;
    downloadBtn.disabled = true;
    downloadBtn.style.opacity = '0.85';
    downloadBtn.innerHTML = '<span>⏳ Generating 1080x1080 HD Poster...</span>';

    try {
      const t1 = (team1Input ? team1Input.value.trim() : '') || 'India';
      const s1 = (score1Input ? score1Input.value.trim() : '') || '184/4 (20.0 ov)';
      const t2 = (team2Input ? team2Input.value.trim() : '') || 'Australia';
      const s2 = (score2Input ? score2Input.value.trim() : '') || '168/8 (20.0 ov)';
      const res = (resultInput ? resultInput.value.trim() : '') || 'India won by 16 runs';
      const mvp = (mvpInput ? mvpInput.value.trim() : '') || 'V. Kohli (82 runs & 1/14)';

      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context not supported');

      // Background: High-End Stadium Dark Mesh
      const bgGrad = ctx.createRadialGradient(540, 540, 80, 540, 540, 720);
      bgGrad.addColorStop(0, '#152033');
      bgGrad.addColorStop(0.65, '#090f1c');
      bgGrad.addColorStop(1, '#04070e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1080);

      // Stadium Ambient Lights
      ctx.fillStyle = 'rgba(0, 230, 118, 0.08)';
      ctx.beginPath();
      ctx.arc(180, 180, 320, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(0, 176, 255, 0.07)';
      ctx.beginPath();
      ctx.arc(900, 900, 360, 0, Math.PI * 2);
      ctx.fill();

      // Outer Stadium Border
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 6;
      ctx.strokeRect(36, 36, 1008, 1008);

      // Inner Neon Accent Border
      ctx.strokeStyle = 'rgba(0, 230, 118, 0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(48, 48, 984, 984);

      // Top Brand Bar
      ctx.fillStyle = '#00e676';
      ctx.font = '900 42px "Outfit", "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🏏 STUMPSCORE', 80, 130);

      // Match Status Tag
      ctx.fillStyle = '#f59e0b';
      ctx.font = '800 30px "Outfit", "Segoe UI", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('MATCH SUMMARY • FINAL', 1000, 130);

      // Horizontal Divider
      const lineGrad = ctx.createLinearGradient(80, 160, 1000, 160);
      lineGrad.addColorStop(0, '#00e676');
      lineGrad.addColorStop(0.5, '#00b0ff');
      lineGrad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = lineGrad;
      ctx.fillRect(80, 160, 920, 4);

      // Match Card Container
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      roundRect(ctx, 80, 200, 920, 460, 28, true, true);

      // Team 1 Row
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 60px "Outfit", "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(t1, 120, 310);

      ctx.fillStyle = '#00e676';
      ctx.font = '900 64px "JetBrains Mono", "Courier New", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(s1, 960, 310);

      // Subtle Mid Divider
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(120, 370, 840, 2);

      // Team 2 Row
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '800 54px "Outfit", "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(t2, 120, 480);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '800 54px "JetBrains Mono", "Courier New", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(s2, 960, 480);

      // Match Winner Gold Banner
      const winnerGrad = ctx.createLinearGradient(80, 560, 1000, 640);
      winnerGrad.addColorStop(0, 'rgba(245, 158, 11, 0.28)');
      winnerGrad.addColorStop(1, 'rgba(217, 119, 6, 0.22)');
      ctx.fillStyle = winnerGrad;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      roundRect(ctx, 120, 540, 840, 90, 18, true, true);

      ctx.fillStyle = '#fbbf24';
      ctx.font = '900 40px "Outfit", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🏆 ${res}`, 540, 600);

      // Player of the Match Card
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.strokeStyle = 'rgba(0, 176, 255, 0.4)';
      ctx.lineWidth = 2;
      roundRect(ctx, 80, 700, 920, 120, 20, true, true);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '800 36px "Outfit", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🌟 Player of the Match: ${mvp}`, 540, 772);

      // App Download & Feature Pitch Footer
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      roundRect(ctx, 80, 860, 920, 140, 20, true, false);

      ctx.fillStyle = '#00e676';
      ctx.font = '800 28px "Outfit", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Scored live on StumpScore Engine • Ball-by-Ball & ICC Net Run Rate', 540, 915);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 24px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('Download for Android & Apple iOS at cricket-scoring-webapp.vercel.app', 540, 960);


      const filename = `stumpscore-${t1.toLowerCase().replace(/[^a-z0-9]/g, '-')}-vs-${t2.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;

      const triggerDownload = (url) => {
        const downloadAnchor = document.createElement('a');
        downloadAnchor.download = filename;
        downloadAnchor.href = url;
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        setTimeout(() => {
          if (downloadAnchor.parentNode) {
            downloadAnchor.parentNode.removeChild(downloadAnchor);
          }
        }, 400);

        downloadBtn.disabled = false;
        downloadBtn.style.opacity = '1';
        downloadBtn.innerHTML = '<span>✅ Poster Downloaded (PNG)</span>';
        downloadBtn.style.borderColor = '#00e676';
        downloadBtn.style.color = '#00e676';

        showToast('🎉 1080x1080 Match Poster downloaded successfully!');

        setTimeout(() => {
          downloadBtn.innerHTML = originalHTML;
          downloadBtn.style.borderColor = '';
          downloadBtn.style.color = '';
        }, 3500);
      };

      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            triggerDownload(blobUrl);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
          } else {
            const dataUrl = canvas.toDataURL('image/png');
            triggerDownload(dataUrl);
          }
        }, 'image/png');
      } else {
        const dataUrl = canvas.toDataURL('image/png');
        triggerDownload(dataUrl);
      }
    } catch (err) {
      console.error('Poster generation error:', err);
      downloadBtn.disabled = false;
      downloadBtn.style.opacity = '1';
      downloadBtn.innerHTML = '<span>⚠️ Error Generating — Retry</span>';
      showToast('⚠️ Could not generate poster. Please try again.');
      setTimeout(() => {
        downloadBtn.innerHTML = originalHTML;
      }, 3000);
    }
  }

  function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }
}

/* ==========================================================================
   Download Actions & Broadcast Dynamic Top Banner (Mobile-Optimized)
   ========================================================================== */
function showDownloadToast(filename = 'stumpscore-release.apk', size = '74.6 MB') {
  let banner = document.getElementById('stump-download-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'stump-download-banner';
    banner.className = 'stump-download-banner';
    document.body.appendChild(banner);
  }

  // Clear existing dismiss timer
  if (banner.dismissTimeout) {
    clearTimeout(banner.dismissTimeout);
  }

  // Populate rich broadcast structure
  banner.innerHTML = `
    <div class="download-banner-main">
      <div class="download-banner-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      </div>
      <div class="download-banner-text">
        <div class="download-banner-title">
          <span>StumpScore APK</span>
          <span class="download-banner-badge">v1.0.1</span>
        </div>
        <div class="download-banner-sub">Downloading ${filename} (${size})...</div>
      </div>
      <button type="button" class="download-banner-help-btn" onclick="window.openStumpModal && window.openStumpModal('modal-apk-download', event)">
        Guide 📖
      </button>
      <button type="button" class="download-banner-close" aria-label="Dismiss banner" onclick="this.closest('.stump-download-banner').classList.remove('is-active')">
        ✕
      </button>
    </div>
    <div class="download-banner-progress-track">
      <div class="download-banner-progress-bar"></div>
    </div>
  `;

  // Force reflow and activate slide-down
  requestAnimationFrame(() => {
    banner.classList.add('is-active');
  });

  // Auto-dismiss smoothly after 4.5 seconds
  banner.dismissTimeout = setTimeout(() => {
    banner.classList.remove('is-active');
  }, 4500);
}

window.showDownloadToast = showDownloadToast;

window.triggerApkDownload = function(event, anchorEl) {
  if (event && event.stumpHandled) return;
  if (event) event.stumpHandled = true;

  showDownloadToast('stumpscore-release.apk', '74.6 MB');
};

function initDownloadActions() {
  const downloadBtns = document.querySelectorAll('.js-download-apk');
  downloadBtns.forEach(btn => {
    if (!btn.getAttribute('onclick')) {
      btn.addEventListener('click', (e) => {
        window.triggerApkDownload(e, btn);
      });
    }
  });
}


/* ==========================================================================
   Modals & Global Dialog Controller
   ========================================================================== */
window.openStumpModal = function(modalId, event) {
  if (event) {
    if (typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
  }
  const modal = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
  if (!modal) return;
  modal.classList.add('is-active');
  document.body.style.overflow = 'hidden';
};

window.closeStumpModal = function(modalId, event) {
  if (event) {
    if (typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
  }
  const modal = modalId ? (typeof modalId === 'string' ? document.getElementById(modalId) : modalId) : document.querySelector('.modal-overlay.is-active');
  if (!modal) return;
  modal.classList.remove('is-active');
  document.body.style.overflow = '';
};

function openModal(modal) {
  window.openStumpModal(modal);
}

function closeModal(modal) {
  window.closeStumpModal(modal);
}

function initModals() {
  // 1. Global event delegation for all modal openers (click & touch)
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-modal-target], .js-open-modal');
    if (trigger) {
      e.preventDefault();
      const targetId = trigger.getAttribute('data-modal-target');
      if (targetId) window.openStumpModal(targetId, e);
      return;
    }

    const closeBtn = e.target.closest('.modal-close-btn, .js-modal-close');
    if (closeBtn) {
      e.preventDefault();
      const modal = closeBtn.closest('.modal-overlay');
      if (modal) window.closeStumpModal(modal, e);
      return;
    }

    if (e.target.classList.contains('modal-overlay')) {
      window.closeStumpModal(e.target, e);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModalEl = document.querySelector('.modal-overlay.is-active');
      if (openModalEl) window.closeStumpModal(openModalEl);
    }
  });
}

/* ==========================================================================
   Contact Form
   ========================================================================== */
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  const formSuccessMessage = document.getElementById('form-success-msg');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending... 🚀</span>';
      }

      setTimeout(() => {
        contactForm.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Message Sent! ✓</span>';
          setTimeout(() => {
            submitBtn.innerHTML = '<span>Send Message 🚀</span>';
          }, 2000);
        }
        if (formSuccessMessage) {
          formSuccessMessage.style.display = 'block';
          setTimeout(() => {
            formSuccessMessage.style.display = 'none';
          }, 3000);
        }
        setTimeout(() => {
          const contactModal = document.getElementById('modal-contact');
          if (contactModal) closeModal(contactModal);
        }, 1200);
      }, 700);
    });
  }
}

/* ==========================================================================
   Global Toast Notification
   ========================================================================== */
function showToast(message, duration = 3500) {
  let toast = document.getElementById('stump-toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'stump-toast-notification';
    toast.className = 'stump-toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = message;
  toast.classList.add('is-active');

  if (toast.dismissTimeout) {
    clearTimeout(toast.dismissTimeout);
  }

  toast.dismissTimeout = setTimeout(() => {
    toast.classList.remove('is-active');
  }, duration);
}

/* ==========================================================================
   Ticker Marquee Viewport Optimization (Pauses GPU marquee animation when off-screen)
   ========================================================================== */
function initTickerObserver() {
  const tickerEl = document.querySelector('.live-status-ticker');
  const trackEl = document.querySelector('.ticker-track');
  if (!tickerEl || !trackEl || !('IntersectionObserver' in window)) return;

  const tickerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        trackEl.classList.remove('is-paused');
      } else {
        trackEl.classList.add('is-paused');
      }
    });
  }, { threshold: 0.05 });

  tickerObserver.observe(tickerEl);
}

