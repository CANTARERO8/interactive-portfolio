import gsap from 'gsap';
import { staticTranslations, projectsDataEN, projectsDataES } from '../data/translations.js';
import { SoundManager } from './SoundManager.js';

export class PortfolioOrchestrator {
  constructor() {
    this.soundManager = new SoundManager();
    window.soundManager = this.soundManager;

    this.drawer = document.getElementById('project-details-drawer');
    this.closeBtn = document.getElementById('drawer-close-btn');
    this.closeBackdrop = document.getElementById('drawer-close-backdrop');
    
    // State of language: load from localStorage if exists, default to 'es'
    this.currentLang = localStorage.getItem('portfolio-lang') || 'es';
    
    // Simulators state and intervals storage
    this.intervals = {};
    
    // Boot orchestrations
    this.initShowcaseSimulators();
    this.initProjectsDrawer();
    this.initDrawerTabs();
    this.initCyberTooltip();
    this.initMobileMenu();
    this.initLanguageSelector();
    this.initCommandRegistry();
    this.initCommandPalette();
    
    // Initialize active language (natively Spanish by default in index.html)
    if (this.currentLang !== 'es') {
      this.setLanguage(this.currentLang);
    } else {
      const enCode = document.getElementById('lang-code-en');
      const esCode = document.getElementById('lang-code-es');
      if (enCode && esCode) {
        esCode.classList.add('active');
        enCode.classList.remove('active');
      }
      this.projectsData = projectsDataES;
    }
    
    this.initCliTerminals();
    this.initOverclockConsole();
  }

  // ─── 1. SIMULATORS BOOT & TOGGLING ─────────────────────────────────────
  initShowcaseSimulators() {
    const panels = ['vue', 'laravel', 'postgres', 'wordpress'];
    
    panels.forEach(p => {
      const el = document.getElementById(`panel-${p}`);
      if (!el) return;
      
      const codeBtn = el.querySelector('[data-action="code"]');
      const simBtn = el.querySelector('[data-action="sim"]');
      const codeView = el.querySelector('.panel-code-view');
      const simView = el.querySelector('.panel-sim-view');
      
      if (!codeBtn || !simBtn || !codeView || !simView) return;
      
      // Code view trigger
      codeBtn.addEventListener('click', () => {
        codeBtn.classList.add('active');
        simBtn.classList.remove('active');
        codeView.style.display = 'block';
        simView.style.display = 'none';
        this.stopSimulator(p);
      });
      
      // Simulator view trigger
      simBtn.addEventListener('click', () => {
        simBtn.classList.add('active');
        codeBtn.classList.remove('active');
        codeView.style.display = 'none';
        simView.style.display = 'block';
        this.startSimulator(p);
      });
    });
  }

  // Dispatch specific simulator loops
  startSimulator(type) {
    this.stopSimulator(type); // Ensure absolute cleanup first
    
    if (type === 'vue') {
      this.runVueTelemetry();
    } else if (type === 'laravel') {
      this.runLaravelRouter();
    } else if (type === 'postgres') {
      this.runPostgresQueryCompiler();
    } else if (type === 'wordpress') {
      this.runWordPressSimulator();
    }
  }

  stopSimulator(type) {
    if (this.intervals[type]) {
      clearInterval(this.intervals[type]);
      delete this.intervals[type];
    }
  }

  // ─── 1.1 VUE TELEMETRY SIMULATION LOOP ──────────────────────────────────
  runVueTelemetry() {
    const loadText = document.getElementById('sim-vue-load');
    const loadBar = document.getElementById('sim-vue-bar');
    const logsContainer = document.getElementById('sim-vue-logs');
    const statusText = document.getElementById('sim-vue-status');
    
    if (!loadText || !loadBar || !logsContainer || !statusText) return;
    
    // Clear initial logs
    logsContainer.innerHTML = '<span class="log-info">[SYSTEM] Client-side state virtualized. Telemetry live.</span>';
    
    const messages = [
      "[PINIA] State changed: useSystemStore -> instantiated",
      "[STORE] Fetching live client diagnostics metrics...",
      "[VUE] Reactive DOM wrapper updated successfully // 60 FPS",
      "[STORE] Mutation processed: scaleTelemetry -> Factor computed: 1.25",
      "[PINIA] coreLoad value mutated in reactive chain",
      "[VUE] Virtual DOM tree reconciliation finished // Diff checked",
      "[STORE] Computed state: isHealthy -> resolved: true",
      "[SYSTEM] Triggering reactive telemetry render update..."
    ];
    
    let counter = 0;
    this.intervals['vue'] = setInterval(() => {
      // 1. Tick loads
      const coreLoad = 35 + Math.floor(Math.random() * 42);
      loadText.innerText = `${coreLoad}%`;
      loadBar.style.width = `${coreLoad}%`;
      
      // Change color based on stress
      if (coreLoad > 70) {
        statusText.innerText = 'HIGH LOAD // OPTIMIZING';
        statusText.className = 'sim-accent-amber';
      } else {
        statusText.innerText = 'OK // DECOUPLED';
        statusText.className = 'sim-accent-cyan';
      }
      
      // 2. Output logs
      const msg = messages[counter % messages.length];
      const logLine = document.createElement('span');
      logLine.className = 'log-success';
      logLine.innerText = msg;
      
      logsContainer.appendChild(logLine);
      logsContainer.scrollTop = logsContainer.scrollHeight;
      
      counter++;
    }, 1800);
  }

  // ─── 1.2 LARAVEL DISPATCH ROUTING SIMULATION LOOP ────────────────────────
  runLaravelRouter() {
    const latencyText = document.getElementById('sim-laravel-latency');
    const dumpPre = document.getElementById('sim-laravel-dump');
    const logsContainer = document.getElementById('sim-laravel-logs');
    
    if (!latencyText || !dumpPre || !logsContainer) return;
    
    logsContainer.innerHTML = '<span class="log-info">[API] Routing orchestrator initialized. Dispatch pipeline open.</span>';
    
    const logs = [
      "[ROUTER] Request intercepted: POST /api/v1/telemetry/dispatch",
      "[MIDDLEWARE] Token validated // CSRF checked // Route allowed",
      "[CONTROLLER] EventRepository -> pushToQueue initialized",
      "[QUEUE] Payload pushing into isolated Redis queue worker...",
      "[QUEUE] Job dispatched to queue: App\\Jobs\\ProcessSystemEvent",
      "[DATABASE] Event saved -> ID: 41829, latency_average: 12ms",
      "[CONTROLLER] TelemetryOrchestrator logged success metrics",
      "[ROUTER] Dispatch completed. Serializing JSON object payload..."
    ];
    
    let counter = 0;
    this.intervals['laravel'] = setInterval(() => {
      // 1. Latency fluctuations
      const latency = 10 + Math.floor(Math.random() * 6);
      latencyText.innerText = `${latency}ms // VERIFIED`;
      
      // 2. Dump responses
      const responseObj = {
        success: true,
        transaction_id: `txn_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        latency_ms: latency,
        timestamp: new Date().toISOString(),
        payload: {
          queue_status: "active",
          dispatched_jobs: 1,
          db_commit: "OK"
        }
      };
      dumpPre.innerText = JSON.stringify(responseObj, null, 2);
      
      // 3. Output logs
      const logLine = document.createElement('span');
      logLine.className = counter % 2 === 0 ? 'log-info' : 'log-warn';
      logLine.innerText = logs[counter % logs.length];
      
      logsContainer.appendChild(logLine);
      logsContainer.scrollTop = logsContainer.scrollHeight;
      
      counter++;
    }, 2000);
  }

  // ─── 1.3 POSTGRESQL QUERY SCAN COMPILER SIMULATION LOOP ──────────────────
  runPostgresQueryCompiler() {
    const scanText = document.getElementById('sim-sql-scan');
    const speedText = document.getElementById('sim-sql-speed');
    const tablePre = document.getElementById('sim-sql-table');
    const logsContainer = document.getElementById('sim-sql-logs');
    
    if (!scanText || !speedText || !tablePre || !logsContainer) return;
    
    logsContainer.innerHTML = '<span class="log-info">[DB] SQL core agent attached. Index scanning loops active.</span>';
    
    const dbLogs = [
      "[PLANNER] Explaining scan hierarchy logic query CTE",
      "[PLANNER] Primary Key index matched on parent_id",
      "[PLANNER] Custom Index Scan: parent_id_idx on system_nodes",
      "[EXECUTOR] Scanning relational branches recursing down node hierarchy",
      "[EXECUTOR] Level 1 scanned (1 main node matched)",
      "[EXECUTOR] Level 2 scanned (4 child nodes extracted in 0.02ms)",
      "[EXECUTOR] Grouping metrics depth and aggregating average load metrics",
      "[COMPILER] ACID validation check: transaction commited successfully"
    ];
    
    let counter = 0;
    this.intervals['postgres'] = setInterval(() => {
      // 1. Speeds
      const speed = (0.05 + Math.random() * 0.06).toFixed(2);
      speedText.innerText = `${speed}ms`;
      
      // 2. Table values updates
      const depth1Load = (30 + Math.random() * 10).toFixed(1);
      const depth2Load = (55 + Math.random() * 20).toFixed(1);
      
      const newTable = `+-------+------------+------------+
| depth | node_count | avg_load % |
+-------+------------+------------+
|     1 |          1 |       ${depth1Load} |
|     2 |          4 |       ${depth2Load} |
+-------+------------+------------+`;
      tablePre.innerText = newTable;
      
      // 3. Output logs
      const logLine = document.createElement('span');
      logLine.className = 'log-success';
      logLine.innerText = dbLogs[counter % dbLogs.length];
      
      logsContainer.appendChild(logLine);
      logsContainer.scrollTop = logsContainer.scrollHeight;
      
      counter++;
    }, 2200);
  }

  // ─── 1.4 WORDPRESS ELEMENTOR TELEMETRY SIMULATION LOOP ──────────────────
  runWordPressSimulator() {
    const statusText = document.getElementById('sim-wp-status');
    const logsContainer = document.getElementById('sim-wp-logs');
    if (!statusText || !logsContainer) return;
    
    logsContainer.innerHTML = '<span class="log-info">[CMS] WordPress & Elementor builder system online.</span>';
    
    const logs = [
      "[ELEMENTOR] Initializing layout drag-and-drop container...",
      "[CMS] Custom CSS overrides compiled and loaded successfully",
      "[THEME] Initializing active theme child custom customizer...",
      "[LOOP] Builder loop compiler scanning custom query loops...",
      "[API] Syncing dynamic WooCommerce custom API data...",
      "[SEO] Yoast/RankMath meta tags structured and injected...",
      "[SYSTEM] Output compiled: Elementor sections rendered in 14ms"
    ];
    
    let counter = 0;
    this.intervals['wordpress'] = setInterval(() => {
      statusText.innerText = 'BUILDER RUNNING // ACTIVE';
      statusText.className = 'sim-accent-cyan';
      
      const logLine = document.createElement('span');
      logLine.className = 'log-success';
      logLine.innerText = logs[counter % logs.length];
      
      logsContainer.appendChild(logLine);
      logsContainer.scrollTop = logsContainer.scrollHeight;
      
      counter++;
    }, 1900);
  }

  // ─── 2. PROJECTS DETAIL DRAWER MANAGEMENT ──────────────────────────────
  initProjectsDrawer() {
    if (!this.drawer) return;
    
    // Select all project row elements
    const rows = document.querySelectorAll('.project-row');
    rows.forEach(row => {
      // Attach cursor hover triggers
      row.addEventListener('mouseenter', () => {
        document.body.classList.add('hovering-link');
        this.soundManager.playClick();
      });
      row.addEventListener('mouseleave', () => {
        document.body.classList.remove('hovering-link');
      });
      
      // Trigger drawer open on click
      row.addEventListener('click', () => {
        this.soundManager.playChirp();
        const projIdx = parseInt(row.getAttribute('data-project'), 10);
        this.openDrawer(projIdx);
      });
    });
    
    // Close hooks
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeDrawer());
    }
    if (this.closeBackdrop) {
      this.closeBackdrop.addEventListener('click', () => this.closeDrawer());
    }
    
    // ESC key closes drawer
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.drawer.classList.contains('active')) {
        this.closeDrawer();
      }
    });
  }

  // Open the drawer sliding from the right, mapping target project index details
  openDrawer(index) {
    const data = this.projectsData[index];
    if (!data) return;

    this.soundManager.playDrawerSweep(true);
    
    // Inject values dynamically
    document.getElementById('drawer-num').innerText = data.id;
    document.getElementById('drawer-category').innerText = data.category;
    document.getElementById('drawer-title').innerText = data.title;
    document.getElementById('drawer-challenge').innerText = data.challenge;
    document.getElementById('drawer-solution').innerText = data.solution;
    document.getElementById('drawer-architecture').innerText = data.architecture;
    
    // Inject custom glowing SVG diagram
    const svgContainer = document.getElementById('drawer-architecture-svg');
    if (svgContainer) {
      svgContainer.innerHTML = data.svg || '';
    }
    
    // Inject custom sequential SVG flow
    const seqContainer = document.getElementById('drawer-seq-svg');
    if (seqContainer) {
      seqContainer.innerHTML = data.seqSvg || '';
    }
    
    const statsContainer = document.getElementById('drawer-stats-svg');
    if (statsContainer) {
      statsContainer.innerHTML = data.statsSvg || '';
    }
    
    const statsDesc = document.getElementById('drawer-stats-desc');
    if (statsDesc) {
      statsDesc.innerText = data.statsDesc || '';
    }
    
    // Inject resource utilization SVG
    const resourceContainer = document.getElementById('drawer-resource-svg');
    if (resourceContainer) {
      resourceContainer.innerHTML = data.resourceSvg || '';
    }
    
    // Inject resource utilization description
    const resourceDesc = document.getElementById('drawer-resource-desc');
    if (resourceDesc) {
      resourceDesc.innerText = data.resourceDesc || '';
    }
    
    // Metrics list mapping
    const metricsContainer = document.getElementById('drawer-metrics');
    metricsContainer.innerHTML = '';
    data.metrics.forEach(m => {
      const metricItem = document.createElement('div');
      metricItem.className = 'drawer-metric-item';
      metricItem.innerHTML = `
        <div class="drawer-metric-num mono">${m.num}</div>
        <div class="drawer-metric-label mono">${m.label}</div>
      `;
      metricsContainer.appendChild(metricItem);
    });
    
    // Tech pills mapping
    const techsContainer = document.getElementById('drawer-techs');
    techsContainer.innerHTML = '';
    data.techs.forEach(t => {
      const pill = document.createElement('span');
      pill.className = 'drawer-tech-pill mono';
      pill.innerText = t;
      techsContainer.appendChild(pill);
    });
    
    // Inject dynamic ROI section
    const roiContainer = document.getElementById('drawer-roi');
    if (roiContainer) {
      roiContainer.innerHTML = '';
      if (data.roi && data.roi.length > 0) {
        data.roi.forEach(r => {
          const roiItem = document.createElement('div');
          roiItem.className = 'drawer-roi-item';
          roiItem.innerHTML = `
            <div class="drawer-roi-icon">✓</div>
            <div class="drawer-roi-text">${r}</div>
          `;
          roiContainer.appendChild(roiItem);
        });
      }
    }
    
    // Reset tabs to default active states
    this.resetDrawerTabs();
    
    // Repository link mapping (Completely hidden to ensure absolute confidentiality!)
    const gitLink = document.getElementById('drawer-github-link');
    if (gitLink) {
      gitLink.style.display = 'none';
    }
    
    // Activate DOM elements (adds CSS transitions)
    this.drawer.classList.add('active');
    
    // Stop background scrolling
    if (window.APP_INSTANCE && window.APP_INSTANCE.scrollManager && window.APP_INSTANCE.scrollManager.lenis) {
      window.APP_INSTANCE.scrollManager.lenis.stop();
    }
    
    // Dynamic overlay animations
    gsap.fromTo(this.drawer.querySelector('.drawer-panel'), 
      { x: '100%' }, 
      { x: '0%', duration: 0.6, ease: 'power3.out' }
    );
  }

  // Close the drawer with dynamic overlays transitions
  closeDrawer() {
    if (!this.drawer.classList.contains('active')) return;

    this.soundManager.playDrawerSweep(false);
    
    // Hide active tooltip
    const tooltip = document.getElementById('cyber-tooltip');
    if (tooltip) {
      tooltip.classList.remove('visible');
      tooltip.style.display = 'none';
    }
    
    document.body.classList.remove('hovering-link');
    
    gsap.to(this.drawer.querySelector('.drawer-panel'), {
      x: '100%',
      duration: 0.5,
      ease: 'power3.inOut',
      onComplete: () => {
        this.drawer.classList.remove('active');
        // Resume background scrolling
        if (window.APP_INSTANCE && window.APP_INSTANCE.scrollManager && window.APP_INSTANCE.scrollManager.lenis) {
          window.APP_INSTANCE.scrollManager.lenis.start();
        }
      }
    });
  }

  // ─── 2.1 TAB TOGGLE SYSTEM ───────────────────────────────────────────
  initDrawerTabs() {
    const tabBtns = this.drawer.querySelectorAll('.drawer-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        this.soundManager.playClick();
      });
      
      btn.addEventListener('click', () => {
        this.soundManager.playChirp();
        const group = btn.getAttribute('data-tab-group');
        const tabId = btn.getAttribute('data-tab-id');
        
        // Deactivate other buttons in the same group
        this.drawer.querySelectorAll(`.drawer-tab-btn[data-tab-group="${group}"]`).forEach(b => {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        
        // Toggle contents with a beautiful GSAP fade
        const contents = this.drawer.querySelectorAll(`.drawer-tab-content[data-tab-group="${group}"]`);
        contents.forEach(content => {
          if (content.getAttribute('data-tab-content') === tabId) {
            content.style.display = 'block';
            gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
          } else {
            content.style.display = 'none';
          }
        });
      });
    });
  }

  resetDrawerTabs() {
    const groups = ['arch', 'stats'];
    groups.forEach(group => {
      const activeBtn = this.drawer.querySelector(`.drawer-tab-btn[data-tab-group="${group}"]:first-child`);
      if (activeBtn) {
        this.drawer.querySelectorAll(`.drawer-tab-btn[data-tab-group="${group}"]`).forEach(b => {
          b.classList.remove('active');
        });
        activeBtn.classList.add('active');
        
        const tabId = activeBtn.getAttribute('data-tab-id');
        const contents = this.drawer.querySelectorAll(`.drawer-tab-content[data-tab-group="${group}"]`);
        contents.forEach(content => {
          if (content.getAttribute('data-tab-content') === tabId) {
            content.style.display = 'block';
            content.style.opacity = 1;
          } else {
            content.style.display = 'none';
          }
        });
      }
    });
  }

  // ─── 2.2 INTERACTIVE CYBER HUD TOOLTIP SYSTEM ────────────────────────
  initCyberTooltip() {
    const tooltip = document.getElementById('cyber-tooltip');
    const tooltipText = document.getElementById('cyber-tooltip-text');
    if (!tooltip || !tooltipText) return;
    
    // Global mouse listener inside drawer
    this.drawer.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-tooltip]');
      if (target) {
        const text = target.getAttribute('data-tooltip');
        tooltipText.innerHTML = text;
        tooltip.style.display = 'block';
        tooltip.offsetHeight; // force reflow
        tooltip.classList.add('visible');
      }
    });
    
    this.drawer.addEventListener('mousemove', (e) => {
      if (tooltip.classList.contains('visible')) {
        // Place tooltip next to mouse
        tooltip.style.left = `${e.clientX}px`;
        tooltip.style.top = `${e.clientY}px`;
      }
    });
    
    this.drawer.addEventListener('mouseout', (e) => {
      const target = e.target.closest('[data-tooltip]');
      if (target) {
        const related = e.relatedTarget;
        if (!related || !related.closest('[data-tooltip]') || related.closest('[data-tooltip]') !== target) {
          tooltip.classList.remove('visible');
          setTimeout(() => {
            if (!tooltip.classList.contains('visible')) {
              tooltip.style.display = 'none';
            }
          }, 200);
        }
      }
    });
  }

  // ─── 3. MOBILE MENU INTERACTIVE OVERLAY ───────────────────────────────
  initMobileMenu() {
    const trigger = document.getElementById('mobile-menu-trigger');
    const overlay = document.getElementById('mobile-menu-overlay');
    
    if (!trigger || !overlay) return;
    
    trigger.addEventListener('mouseenter', () => {
      this.soundManager.playClick();
    });
    
    trigger.addEventListener('click', () => {
      this.soundManager.playChirp();
      trigger.classList.toggle('active');
      overlay.classList.toggle('active');
    });
    
    // Connect links in mobile overlay to ScrollManager scrolling
    const mobileLinks = overlay.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        this.soundManager.playClick();
      });
      
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.soundManager.playChirp();
        
        // 1. Close mobile overlay
        trigger.classList.remove('active');
        overlay.classList.remove('active');
        
        // 2. Scroll smoothly via master ScrollManager
        const targetIdx = parseInt(link.getAttribute('data-target'), 10);
        if (window.APP_INSTANCE && window.APP_INSTANCE.scrollManager) {
          window.APP_INSTANCE.scrollManager.scrollToSection(targetIdx);
        }
      });
    });
  }

  // ─── 4. BILINGUAL LANGUAGE SELECTOR ─────────────────────────────────────
  initLanguageSelector() {
    const langBtn = document.getElementById('lang-btn');
    if (!langBtn) return;
    
    langBtn.addEventListener('mouseenter', () => {
      this.soundManager.playClick();
    });
    
    langBtn.addEventListener('click', () => {
      this.soundManager.playChirp();
      const nextLang = this.currentLang === 'en' ? 'es' : 'en';
      this.setLanguage(nextLang);
    });
  }

  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('portfolio-lang', lang);
    
    // Update active button classes
    const enCode = document.getElementById('lang-code-en');
    const esCode = document.getElementById('lang-code-es');
    if (enCode && esCode) {
      if (lang === 'en') {
        enCode.classList.add('active');
        esCode.classList.remove('active');
      } else {
        esCode.classList.add('active');
        enCode.classList.remove('active');
      }
    }
    
    // Map projects data list to current language
    this.projectsData = lang === 'es' ? projectsDataES : projectsDataEN;
    
    // Translate static strings with data-i18n
    const dictionary = staticTranslations[lang] || staticTranslations['en'];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = dictionary[key];
      if (translation) {
        // Change text content (preserve HTML e.g. <br> and <span>)
        el.innerHTML = translation;
        
        // Remove split-done so we can re-apply GSAP characters splitting!
        el.classList.remove('split-done');
      }
    });

    // Remove reveal classes so they can be re-animated
    document.querySelectorAll('.scramble-revealed').forEach(el => el.classList.remove('scramble-revealed'));
    document.querySelectorAll('.revealed-word').forEach(el => el.classList.remove('revealed-word'));

    // Re-trigger the dynamic characters and words splitting engine for smooth scroll staggers
    if (window.APP_INSTANCE) {
      if (window.APP_INSTANCE.animator) {
        // Clear animator's animatedSections set so it allows re-triggering
        if (window.APP_INSTANCE.animator.animatedSections) {
          window.APP_INSTANCE.animator.animatedSections.clear();
        }
        window.APP_INSTANCE.animator.splitTitles();
        window.APP_INSTANCE.animator.splitContentText();
      }
      
      // Reset DOM cache to rebuild with the new span elements next frame!
      window.APP_INSTANCE._domCache = null;
      
      // Re-trigger section entrance animation for the currently active section immediately!
      const sections = ['hero', 'about', 'projects', 'vue-frontend', 'laravel-backend', 'postgresql-showcase', 'wordpress-cms', 'contact'];
      const currentIdx = window.APP_INSTANCE.scrollManager ? window.APP_INSTANCE.scrollManager.currentSection : 0;
      const currentSectionId = sections[currentIdx];
      if (currentSectionId && window.APP_INSTANCE.animator) {
        window.APP_INSTANCE.animator.animateSectionIn(currentSectionId);
      }
      window.APP_INSTANCE.explorerMode?.refreshCopy();
      window.APP_INSTANCE.graphicsMode?.refreshCopy();
    }
  }

  initCliTerminals() {
    const inputs = document.querySelectorAll('.cli-input-field');
    inputs.forEach(input => {
      input.addEventListener('keydown', (e) => {
        // Play subtle keystroke clicks for ordinary characters
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          this.soundManager.playKeyboardClick();
        }

        if (e.key === 'Enter') {
          if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
          }
          const commandText = input.value;
          const target = input.getAttribute('data-target');
          if (commandText.trim()) {
            this.executeCliCommand(commandText, target);
            input.value = '';
          }
        }
      });
    });

    // Wire suggestion chip buttons — clicking fills and executes the command
    const suggestBtns = document.querySelectorAll('.cli-suggest-btn');
    suggestBtns.forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        this.soundManager.playClick();
      });
      btn.addEventListener('click', () => {
        this.soundManager.playChirp();
        // Find the nearest cli-input-field in the same .simulator-body parent
        const simBody = btn.closest('.simulator-body');
        if (!simBody) return;
        const input = simBody.querySelector('.cli-input-field');
        if (!input) return;
        const cmd = btn.getAttribute('data-cmd');
        const target = input.getAttribute('data-target');
        if (cmd && target) {
          this.executeCliCommand(cmd, target);
          // Give the input a quick flash focus as feedback
          input.focus();
        }
      });
    });
  }

  executeCliCommand(commandText, target) {
    const container = this.getLogsContainer(target);
    if (!container) return;

    const command = commandText.trim().toLowerCase();
    
    // Print input echo first
    this.appendLogLine(container, `<span class="cli-user">visitor@cordova-core:~$</span> ${commandText}`, 'log-echo');

    const isEs = this.currentLang === 'es';

    if (command === 'help') {
      this.soundManager.playSuccess();
      if (isEs) {
        this.appendLogLine(container, `[SISTEMA] Comandos activos disponibles:<br>` +
          `  - <strong>help</strong> : Listar comandos activos del terminal<br>` +
          `  - <strong>clear</strong> : Limpiar el búfer de pantalla del simulador<br>` +
          `  - <strong>telemetry</strong> : Extraer estadísticas de rendimiento de hardware en tiempo real<br>` +
          `  - <strong>database query</strong> : Ejecutar consulta jerárquica recursiva CTE<br>` +
          `  - <strong>overclock</strong> : Alternar reactor cooling / activar overclock global`, 'log-info');
      } else {
        this.appendLogLine(container, `[SYSTEM] Available active console commands:<br>` +
          `  - <strong>help</strong> : List terminal commands and descriptions<br>` +
          `  - <strong>clear</strong> : Clear scrollback screen logs buffer<br>` +
          `  - <strong>telemetry</strong> : Fetch live real-time hardware performance metrics<br>` +
          `  - <strong>database query</strong> : Run recursive analytical CTE search scanner<br>` +
          `  - <strong>overclock</strong> : Toggle reactor cores / ignite system overclock`, 'log-info');
      }
    } 
    else if (command === 'clear') {
      this.soundManager.playSuccess();
      container.innerHTML = '';
    } 
    else if (command === 'telemetry') {
      this.soundManager.playSuccess();
      this.appendLogLine(container, isEs ? `[SISTEMA] Leyendo diagnósticos del núcleo de renderizado...` : `[SYSTEM] Intercepting core hardware diagnostics...`, 'log-info');
      
      const fps = window.APP_INSTANCE && window.APP_INSTANCE.fps ? window.APP_INSTANCE.fps.toFixed(1) : '60.0';
      const scrollSpeed = window.APP_INSTANCE && window.APP_INSTANCE.scrollVelocity ? Math.abs(window.APP_INSTANCE.scrollVelocity).toFixed(0) : '0';
      
      setTimeout(() => {
        if (isEs) {
          this.appendLogLine(container, 
            ` - DIAGNÓSTICOS DEL SISTEMA INTERACTIVO:<br>` +
            ` &nbsp;&nbsp;&bull; CARGA DE NÚCLEO: [████████████░░░░░░] 68% // NORMAL<br>` +
            ` &nbsp;&nbsp;&bull; FPS DE RENDERIZADO: ${fps} FPS // RUTA FLUIDA<br>` +
            ` &nbsp;&nbsp;&bull; VELOCIDAD DE SCROLL: ${scrollSpeed} px/s<br>` +
            ` &nbsp;&nbsp;&bull; USO DE MEMORIA: 184 MB / 512 MB ASIGNADOS VIRTUALMENTE<br>` +
            ` &nbsp;&nbsp;&bull; TEMPERATURA THERMAL: 42.4 °C // ESTABLE`, 'log-success');
        } else {
          this.appendLogLine(container, 
            ` - INTERACTIVE CONTROL TELEMETRY:<br>` +
            ` &nbsp;&nbsp;&bull; CPU CORE LOAD: [████████████░░░░░░] 68% // NORMAL<br>` +
            ` &nbsp;&nbsp;&bull; SHADER FPS: ${fps} FPS // RUNNING SMOOTH<br>` +
            ` &nbsp;&nbsp;&bull; V-SCROLL VELOCITY: ${scrollSpeed} px/s<br>` +
            ` &nbsp;&nbsp;&bull; SYSTEM RAM: 184 MB / 512 MB VIRTUAL ALLOC<br>` +
            ` &nbsp;&nbsp;&bull; TEMPERATURE: 42.4 °C // CORES STABLE`, 'log-success');
        }
      }, 400);
    } 
    else if (command === 'database query') {
      this.soundManager.playSuccess();
      this.appendLogLine(container, isEs ? `[DB] EXPLAIN ANALYZE consulta recursiva CTE analizando...` : `[DB] EXPLAIN ANALYZE recursive CTE compilation scanning...`, 'log-info');
      
      setTimeout(() => {
        this.appendLogLine(container, isEs ? `[DB] Coincidencia con índice en parent_id...` : `[DB] Custom Index Scan: parent_id_idx on system_nodes (cost=0.00..8.25)`, 'log-info');
      }, 300);
 
      setTimeout(() => {
        const table = `+-------+------------+------------+<br>` +
                      `| depth | node_count | avg_load % |<br>` +
                      `+-------+------------+------------+<br>` +
                      `| &nbsp;&nbsp;&nbsp;&nbsp;1 | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1 | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;34.5 |<br>` +
                      `| &nbsp;&nbsp;&nbsp;&nbsp;2 | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4 | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;56.2 |<br>` +
                      `+-------+------------+------------+`;
        this.appendLogLine(container, `<pre class="sim-table-dump">${table}</pre>`, 'log-success');
        this.appendLogLine(container, isEs ? `(2 filas analizadas, tiempo ejecución: 0.08ms)` : `(2 rows retrieved, execution time: 0.08ms)`, 'log-success');
      }, 700);
    } 
    else if (command === 'overclock') {
      this.soundManager.playSuccess();
      if (isEs) {
        this.appendLogLine(container, `[WARNING] ¡INICIANDO PETICIÓN GLOBAL DE OVERCLOCK DE NÚCLEOS!`, 'log-warn');
      } else {
        this.appendLogLine(container, `[WARNING] SENT GLOBAL CORES OVERCLOCK REQUEST TRIGGER!`, 'log-warn');
      }
      setTimeout(() => {
        if (window.APP_INSTANCE) {
          window.APP_INSTANCE.toggleOverclock();
        }
      }, 300);
    } 
    else {
      this.soundManager.playError();
      if (isEs) {
        this.appendLogLine(container, `[ERROR] Comando no reconocido: '${command}'. Escribe 'help' para comandos.`, 'log-error');
      } else {
        this.appendLogLine(container, `[ERROR] Unrecognized directive: '${command}'. Type 'help' for support.`, 'log-error');
      }
    }
  }

  appendLogLine(container, htmlText, className = 'log-info') {
    const line = document.createElement('div');
    line.className = `log-line-item ${className}`;
    line.style.fontSize = '0.75em';
    line.style.lineHeight = '1.5';
    line.style.marginBottom = '0.3em';
    
    // Custom styling for echo, error, success commands
    if (className === 'log-echo') {
      line.style.color = '#ffffff';
    } else if (className === 'log-error') {
      line.style.color = '#ff3300';
    } else if (className === 'log-success') {
      line.style.color = '#00f2fe';
    } else if (className === 'log-warn') {
      line.style.color = '#fbbf24';
    } else {
      line.style.color = 'var(--color-text-sub)';
    }

    line.innerHTML = htmlText;
    container.appendChild(line);
    container.scrollTop = container.scrollHeight;
  }

  getLogsContainer(target) {
    if (target === 'vue') return document.getElementById('sim-vue-logs');
    if (target === 'laravel') return document.getElementById('sim-laravel-logs');
    if (target === 'postgres') return document.getElementById('sim-sql-logs');
    if (target === 'wordpress') return document.getElementById('sim-wp-logs');
    return null;
  }

  initOverclockConsole() {
    const overclockBtn = document.getElementById('overclock-btn');
    if (overclockBtn) {
      overclockBtn.addEventListener('click', () => {
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        if (window.APP_INSTANCE) {
          window.APP_INSTANCE.toggleOverclock();
        }
      });
    }
  }

  syncOverclockUI(isOverclocked) {
    const hud = document.getElementById('cyber-hud');
    const overclockBtn = document.getElementById('overclock-btn');
    const headerLogo = document.getElementById('header-logo');
    
    if (hud) {
      if (isOverclocked) {
        hud.classList.add('overclocked');
      } else {
        hud.classList.remove('overclocked');
      }
    }
    
    if (headerLogo) {
      if (isOverclocked) {
        headerLogo.classList.add('overclocked');
      } else {
        headerLogo.classList.remove('overclocked');
      }
    }
    
    if (window.APP_INSTANCE && window.APP_INSTANCE.textInteractions) {
      window.APP_INSTANCE.textInteractions.syncOverclockState(isOverclocked);
    }
    
    if (overclockBtn) {
      const dictionary = staticTranslations[this.currentLang] || staticTranslations['en'];
      const key = isOverclocked ? 'hud.overclock_btn_active' : 'hud.overclock_btn';
      overclockBtn.innerHTML = dictionary[key] || (isOverclocked ? '[ DAMPEN CORES ]' : '[ IGNITE OVERCLOCK ]');
    }
    
    // Siren alarm sound disabled by user request
    if (isOverclocked) {
      // this.startSirenSound();
    } else {
      this.stopSirenSound();
    }
  }

  startSirenSound() {
    if (this.sirenActive) return;
    
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    
    this.sirenActive = true;
    
    this.sirenOsc = this.audioCtx.createOscillator();
    this.sirenGain = this.audioCtx.createGain();
    
    this.sirenOsc.type = 'sawtooth';
    this.sirenOsc.frequency.setValueAtTime(250, this.audioCtx.currentTime);
    
    this.sirenFilter = this.audioCtx.createBiquadFilter();
    this.sirenFilter.type = 'bandpass';
    this.sirenFilter.frequency.value = 600;
    this.sirenFilter.Q.value = 1.0;
    
    this.sirenOsc.connect(this.sirenFilter);
    this.sirenFilter.connect(this.sirenGain);
    this.sirenGain.connect(this.audioCtx.destination);
    
    this.sirenGain.gain.value = 0;
    this.sirenOsc.start();
    
    let high = false;
    this.sirenPulseInterval = setInterval(() => {
      if (!this.audioCtx || this.audioCtx.state === 'suspended') return;
      const now = this.audioCtx.currentTime;
      const targetFreq = high ? 320 : 250;
      
      this.sirenOsc.frequency.setValueAtTime(this.sirenOsc.frequency.value, now);
      this.sirenOsc.frequency.linearRampToValueAtTime(targetFreq, now + 0.15);
      
      this.sirenGain.gain.cancelScheduledValues(now);
      this.sirenGain.gain.setValueAtTime(0, now);
      this.sirenGain.gain.linearRampToValueAtTime(0.04, now + 0.08); // kept subtle and satisfying
      this.sirenGain.gain.linearRampToValueAtTime(0.002, now + 0.55);
      
      high = !high;
    }, 600);
  }

  stopSirenSound() {
    this.sirenActive = false;
    if (this.sirenPulseInterval) {
      clearInterval(this.sirenPulseInterval);
      this.sirenPulseInterval = null;
    }
    
    try {
      if (this.sirenOsc) {
        this.sirenOsc.stop();
        this.sirenOsc.disconnect();
        this.sirenOsc = null;
      }
      if (this.sirenGain) {
        this.sirenGain.disconnect();
        this.sirenGain = null;
      }
    } catch (e) {
      // Safety catch
    }
  }

  // ─── 4. COMMAND REGISTRY DEFINITION ──────────────────────────────────
  initCommandRegistry() {
    this.commands = [
      { id: 'help', name: '/help', desc: 'Show all available commands', action: () => this.showHelpCommand() },
      { id: 'ayuda', name: '/ayuda', desc: 'Mostrar todos los comandos disponibles', action: () => this.showHelpCommand() },
      { id: 'goto-home', name: '/goto home', desc: 'Scroll to Home section', action: () => this.scrollTo(0) },
      { id: 'ir-inicio', name: '/ir inicio', desc: 'Desplazarse a la sección Inicio', action: () => this.scrollTo(0) },
      { id: 'goto-dev', name: '/goto dev', desc: 'Scroll to Developer section', action: () => this.scrollTo(1) },
      { id: 'ir-desarrollador', name: '/ir desarrollador', desc: 'Desplazarse a la sección Desarrollador', action: () => this.scrollTo(1) },
      { id: 'goto-works', name: '/goto works', desc: 'Scroll to Featured Works section', action: () => this.scrollTo(2) },
      { id: 'ir-proyectos', name: '/ir proyectos', desc: 'Desplazarse a la sección Proyectos', action: () => this.scrollTo(2) },
      { id: 'goto-vue', name: '/goto vue', desc: 'Scroll to Vue Core section', action: () => this.scrollTo(3) },
      { id: 'ir-vue', name: '/ir vue', desc: 'Desplazarse a la sección Núcleo Vue', action: () => this.scrollTo(3) },
      { id: 'goto-laravel', name: '/goto laravel', desc: 'Scroll to Laravel Core section', action: () => this.scrollTo(4) },
      { id: 'ir-laravel', name: '/ir laravel', desc: 'Desplazarse a la sección Núcleo Laravel', action: () => this.scrollTo(4) },
      { id: 'goto-database', name: '/goto database', desc: 'Scroll to Database section', action: () => this.scrollTo(5) },
      { id: 'ir-base-datos', name: '/ir base-datos', desc: 'Desplazarse a la sección Base Datos', action: () => this.scrollTo(5) },
      { id: 'goto-cms', name: '/goto cms', desc: 'Scroll to WordPress section', action: () => this.scrollTo(6) },
      { id: 'ir-cms', name: '/ir wordpress', desc: 'Desplazarse a la sección WordPress', action: () => this.scrollTo(6) },
      { id: 'goto-portal', name: '/goto portal', desc: 'Scroll to Portal contact section', action: () => this.scrollTo(7) },
      { id: 'ir-contacto', name: '/ir contacto', desc: 'Desplazarse a la sección Contacto', action: () => this.scrollTo(7) },
      { id: 'overclock', name: '/overclock', desc: 'Toggle hardware overclock cores & alarm', action: () => this.toggleOverclockCommand() },
      { id: 'explorer', name: '/explorer', desc: 'Enter the free-roam 6DoF drone explorer', action: () => this.toggleExplorerCommand() },
      { id: 'explorador', name: '/explorador', desc: 'Entrar al explorador libre de dron 6DoF', action: () => this.toggleExplorerCommand() },
      { id: 'lang', name: '/lang', desc: 'Toggle site language (EN / ES)', action: () => this.toggleLanguageCommand() },
      { id: 'idioma', name: '/idioma', desc: 'Cambiar el idioma del sitio (EN / ES)', action: () => this.toggleLanguageCommand() },
      { id: 'clear', name: '/clear', desc: 'Clear search input field', action: () => this.clearCommandInput() },
      { id: 'limpiar', name: '/limpiar', desc: 'Limpiar el campo de entrada de búsqueda', action: () => this.clearCommandInput() }
    ];
  }

  getCommandsForLanguage() {
    const isEs = this.currentLang === 'es';
    return this.commands.filter(cmd => {
      if (isEs) {
        return cmd.id.includes('ir') || cmd.id === 'ayuda' || cmd.id === 'idioma' || cmd.id === 'limpiar' || cmd.id === 'overclock' || cmd.id === 'explorador';
      } else {
        return cmd.id.includes('goto') || cmd.id === 'help' || cmd.id === 'lang' || cmd.id === 'clear' || cmd.id === 'overclock' || cmd.id === 'explorer';
      }
    });
  }

  // ─── 4.1 PALETTE CONTROLLER & KEYBOARD BINDINGS ──────────────────────
  initCommandPalette() {
    this.palette = document.getElementById('cmd-palette');
    this.paletteInput = document.getElementById('cmd-palette-input');
    this.paletteResults = document.getElementById('cmd-palette-results');
    this.paletteTrigger = document.getElementById('cmd-palette-trigger');
    this.paletteBackdrop = document.getElementById('cmd-palette-backdrop');
    
    if (!this.palette || !this.paletteInput || !this.paletteResults) return;
    
    this.activeCmdIndex = 0;
    this.filteredCommands = [];
    
    // UI click hooks
    if (this.paletteTrigger) {
      this.paletteTrigger.addEventListener('mouseenter', () => this.soundManager.playClick());
      this.paletteTrigger.addEventListener('click', () => {
        this.soundManager.playChirp();
        this.toggleCommandPalette();
      });
    }
    if (this.paletteBackdrop) {
      this.paletteBackdrop.addEventListener('click', () => {
        this.soundManager.playChirp();
        this.closeCommandPalette();
      });
    }
    
    // Global keyboard hotkey trigger: Ctrl + K or Cmd + K
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.soundManager.playChirp();
        this.toggleCommandPalette();
      }
    });
    
    // Search input handlers
    this.paletteInput.addEventListener('input', () => this.handlePaletteInput());
    this.paletteInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.soundManager.playClick();
        this.navigatePaletteItems(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.soundManager.playClick();
        this.navigatePaletteItems(-1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.soundManager.playChirp();
        this.executeActiveCommand();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.soundManager.playChirp();
        this.closeCommandPalette();
      } else {
        // Play typing click sounds for standard alphanumeric characters
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          this.soundManager.playKeyboardClick();
        }
      }
    });
  }

  handlePaletteInput() {
    const query = this.paletteInput.value.trim().toLowerCase();
    const defaultCommands = this.getCommandsForLanguage();
    
    if (!query) {
      this.filteredCommands = defaultCommands;
    } else {
      this.filteredCommands = this.commands.filter(cmd => 
        cmd.name.toLowerCase().includes(query) || 
        cmd.desc.toLowerCase().includes(query)
      );
    }
    
    this.activeCmdIndex = 0;
    this.renderPaletteResults();
  }

  renderPaletteResults() {
    this.paletteResults.innerHTML = '';
    
    if (this.filteredCommands.length === 0) {
      const isEs = this.currentLang === 'es';
      const noResult = document.createElement('div');
      noResult.className = 'cmd-palette-item mono';
      noResult.style.pointerEvents = 'none';
      noResult.style.justifyContent = 'center';
      noResult.innerText = isEs ? 'No se encontraron comandos.' : 'No commands matched.';
      this.paletteResults.appendChild(noResult);
      return;
    }
    
    this.filteredCommands.forEach((cmd, idx) => {
      const item = document.createElement('div');
      item.className = `cmd-palette-item ${idx === this.activeCmdIndex ? 'active' : ''}`;
      
      item.innerHTML = `
        <div class="cmd-palette-item-content">
          <span class="cmd-palette-item-icon">></span>
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <span class="cmd-palette-item-name">${cmd.name}</span>
            <span class="cmd-palette-item-desc">${cmd.desc}</span>
          </div>
        </div>
        <span class="cmd-palette-item-badge">ENTER</span>
      `;
      
      item.addEventListener('click', () => {
        this.activeCmdIndex = idx;
        this.executeActiveCommand();
      });
      
      this.paletteResults.appendChild(item);
    });
  }

  navigatePaletteItems(dir) {
    const total = this.filteredCommands.length;
    if (total === 0) return;
    
    this.activeCmdIndex = (this.activeCmdIndex + dir + total) % total;
    
    const items = this.paletteResults.querySelectorAll('.cmd-palette-item');
    items.forEach((item, idx) => {
      if (idx === this.activeCmdIndex) {
        item.classList.add('active');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('active');
      }
    });
  }

  executeActiveCommand() {
    const cmd = this.filteredCommands[this.activeCmdIndex];
    if (cmd && cmd.action) {
      this.closeCommandPalette();
      cmd.action();
    }
  }

  // ─── 4.2 ACTIONS DISPATCHERS ─────────────────────────────────────────
  scrollTo(index) {
    if (window.APP_INSTANCE && window.APP_INSTANCE.scrollManager) {
      window.APP_INSTANCE.scrollManager.scrollToSection(index);
    }
  }

  toggleOverclockCommand() {
    if (window.APP_INSTANCE) {
      window.APP_INSTANCE.toggleOverclock();
    }
  }

  toggleExplorerCommand() {
    window.APP_INSTANCE?.explorerMode?.toggle();
  }

  toggleLanguageCommand() {
    const nextLang = this.currentLang === 'en' ? 'es' : 'en';
    this.setLanguage(nextLang);
  }

  clearCommandInput() {
    this.paletteInput.value = '';
    this.handlePaletteInput();
  }

  showHelpCommand() {
    this.paletteInput.value = '/';
    this.handlePaletteInput();
  }

  // ─── 4.3 DISPLAY LAYER STATE ─────────────────────────────────────────
  toggleCommandPalette() {
    if (this.palette.style.display === 'none') {
      this.openCommandPalette();
    } else {
      this.closeCommandPalette();
    }
  }

  openCommandPalette() {
    this.paletteInput.value = '';
    this.handlePaletteInput();
    
    this.palette.style.display = 'flex';
    this.palette.offsetHeight; // force reflow
    this.palette.classList.add('active');

    // Stop background scrolling to avoid main page moving while interacting
    if (window.APP_INSTANCE && window.APP_INSTANCE.scrollManager && window.APP_INSTANCE.scrollManager.lenis) {
      window.APP_INSTANCE.scrollManager.lenis.stop();
    }
    
    // Close other HUD items like mobile menu
    const trigger = document.getElementById('mobile-menu-trigger');
    const overlay = document.getElementById('mobile-menu-overlay');
    if (trigger && overlay && trigger.classList.contains('active')) {
      trigger.classList.remove('active');
      overlay.classList.remove('active');
    }
    
    // Auto-focus search box
    setTimeout(() => {
      this.paletteInput.focus();
    }, 50);
  }

  closeCommandPalette() {
    this.palette.classList.remove('active');

    // Resume background scrolling
    if (window.APP_INSTANCE && window.APP_INSTANCE.scrollManager && window.APP_INSTANCE.scrollManager.lenis) {
      window.APP_INSTANCE.scrollManager.lenis.start();
    }
    
    setTimeout(() => {
      if (!this.palette.classList.contains('active')) {
        this.palette.style.display = 'none';
      }
    }, 300);
  }
}
