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
    
    this.currentLang = localStorage.getItem('portfolio-lang') || 'es';
    this.currentProjectIndex = null;
    
    this.intervals = {};
    
    this.initShowcaseSimulators();
    this.initProjectsDrawer();
    this.initDrawerTabs();
    this.initCyberTooltip();
    this.initMobileMenu();
    this.initLanguageSelector();
    this.initCommandRegistry();
    this.initCommandPalette();
    
    this.setLanguage(this.currentLang);
    
    this.initCliTerminals();
    this.initOverclockConsole();
  }

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
      
      codeBtn.addEventListener('click', () => {
        codeBtn.classList.add('active');
        simBtn.classList.remove('active');
        codeView.style.display = 'block';
        simView.style.display = 'none';
        this.soundManager.playClick();
        
        if (this.intervals[p]) {
          clearInterval(this.intervals[p]);
          delete this.intervals[p];
        }
      });
      
      simBtn.addEventListener('click', () => {
        simBtn.classList.add('active');
        codeBtn.classList.remove('active');
        codeView.style.display = 'none';
        simView.style.display = 'block';
        this.soundManager.playChirp();
        
        this.startSimulator(p);
      });
    });
  }

  startSimulator(panelKey) {
    if (this.intervals[panelKey]) {
      clearInterval(this.intervals[panelKey]);
    }
    
    switch (panelKey) {
      case 'vue':
        this.runVueSimulator();
        break;
      case 'laravel':
        this.runLaravelRouter();
        break;
      case 'postgres':
        this.runPostgresQueryCompiler();
        break;
      case 'wordpress':
        this.runWordPressSimulator();
        break;
    }
  }

  runVueSimulator() {
    const statusText = document.getElementById('sim-vue-status');
    const loadText = document.getElementById('sim-vue-load');
    const loadBar = document.getElementById('sim-vue-load-bar');
    const logsContainer = document.getElementById('sim-vue-logs');
    
    if (!statusText || !loadText || !loadBar || !logsContainer) return;
    
    logsContainer.innerHTML = '<span class="log-info">[VUE] Reactive DOM runtime connected. Observing Pinia root state.</span>';
    
    const messages = [
      "[PINIA] Action dispatched: 'syncHardwareTelemetry' (payload: 64B)",
      "[STORE] Active modules synchronized: 4 state nodes updated",
      "[COMPUTED] Recalculating active telemetry aggregates in 0.04ms",
      "[VUE] Reactive dependency tracked on system_telemetry_rate",
      "[PINIA] coreLoad value mutated in reactive chain",
      "[VUE] Virtual DOM tree reconciliation finished • Diff checked",
      "[STORE] Computed state: isHealthy -> resolved: true",
      "[SYSTEM] Triggering reactive telemetry render update..."
    ];
    
    let counter = 0;
    this.intervals['vue'] = setInterval(() => {
      const coreLoad = 35 + Math.floor(Math.random() * 42);
      loadText.innerText = `${coreLoad}%`;
      loadBar.style.width = `${coreLoad}%`;
      
      if (coreLoad > 70) {
        statusText.innerText = 'HIGH LOAD • OPTIMIZING';
        statusText.className = 'sim-accent-amber';
      } else {
        statusText.innerText = 'OK • DECOUPLED';
        statusText.className = 'sim-accent-cyan';
      }
      
      const msg = messages[counter % messages.length];
      const logLine = document.createElement('span');
      logLine.className = 'log-success';
      logLine.innerText = msg;
      
      logsContainer.appendChild(logLine);
      logsContainer.scrollTop = logsContainer.scrollHeight;
      
      counter++;
    }, 1800);
  }

  runLaravelRouter() {
    const latencyText = document.getElementById('sim-laravel-latency');
    const dumpPre = document.getElementById('sim-laravel-dump');
    const logsContainer = document.getElementById('sim-laravel-logs');
    
    if (!latencyText || !dumpPre || !logsContainer) return;
    
    logsContainer.innerHTML = '<span class="log-info">[API] Routing orchestrator initialized. Dispatch pipeline open.</span>';
    
    const logs = [
      "[ROUTER] Request intercepted: POST /api/v1/telemetry/dispatch",
      "[MIDDLEWARE] Token validated • CSRF checked • Route allowed",
      "[CONTROLLER] EventRepository -> pushToQueue initialized",
      "[QUEUE] Payload pushing into isolated Redis queue worker...",
      "[QUEUE] Job dispatched to queue: App\\Jobs\\ProcessSystemEvent",
      "[DATABASE] Event saved -> ID: 41829, latency_average: 12ms",
      "[CONTROLLER] TelemetryOrchestrator logged success metrics",
      "[ROUTER] Dispatch completed. Serializing JSON object payload..."
    ];
    
    let counter = 0;
    this.intervals['laravel'] = setInterval(() => {
      const latency = 10 + Math.floor(Math.random() * 6);
      latencyText.innerText = `${latency}ms • VERIFIED`;
      
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
      
      const logLine = document.createElement('span');
      logLine.className = counter % 2 === 0 ? 'log-info' : 'log-warn';
      logLine.innerText = logs[counter % logs.length];
      
      logsContainer.appendChild(logLine);
      logsContainer.scrollTop = logsContainer.scrollHeight;
      
      counter++;
    }, 2000);
  }

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
      const speed = (0.05 + Math.random() * 0.06).toFixed(2);
      speedText.innerText = `${speed}ms`;
      
      const depth1Load = (30 + Math.random() * 10).toFixed(1);
      const depth2Load = (55 + Math.random() * 20).toFixed(1);
      
      const newTable = `+-------+------------+------------+
| depth | node_count | avg_load % |
++------+------------+------------+
|     1 |          1 |       ${depth1Load} |
|     2 |          4 |       ${depth2Load} |
+-------+------------+------------+`;
      tablePre.innerText = newTable;
      
      const logLine = document.createElement('span');
      logLine.className = 'log-success';
      logLine.innerText = dbLogs[counter % dbLogs.length];
      
      logsContainer.appendChild(logLine);
      logsContainer.scrollTop = logsContainer.scrollHeight;
      
      counter++;
    }, 2200);
  }

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
      statusText.innerText = 'BUILDER RUNNING • ACTIVE';
      statusText.className = 'sim-accent-cyan';
      
      const logLine = document.createElement('span');
      logLine.className = 'log-success';
      logLine.innerText = logs[counter % logs.length];
      
      logsContainer.appendChild(logLine);
      logsContainer.scrollTop = logsContainer.scrollHeight;
      
      counter++;
    }, 1900);
  }

  initProjectsDrawer() {
    if (!this.drawer) return;
    
    const rows = document.querySelectorAll('.project-row');
    rows.forEach(row => {
      row.addEventListener('mouseenter', () => {
        document.body.classList.add('hovering-link');
        this.soundManager.playClick();
      });
      row.addEventListener('mouseleave', () => {
        document.body.classList.remove('hovering-link');
      });
      
      row.addEventListener('click', () => {
        this.soundManager.playChirp();
        const projIdx = parseInt(row.getAttribute('data-project'), 10);
        this.openDrawer(projIdx);
      });
    });
    
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeDrawer());
    }
    if (this.closeBackdrop) {
      this.closeBackdrop.addEventListener('click', () => this.closeDrawer());
    }
    
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.drawer.classList.contains('active')) {
        this.closeDrawer();
      }
    });
  }

  openDrawer(index, isLangSwitch = false) {
    this.currentProjectIndex = index;
    const data = this.projectsData[index];
    if (!data) return;

    if (!isLangSwitch) {
      this.soundManager.playDrawerSweep(true);
    }
    
    document.getElementById('drawer-num').innerText = data.id;
    document.getElementById('drawer-category').innerText = data.category;
    document.getElementById('drawer-title').innerText = data.title;
    document.getElementById('drawer-challenge').innerText = data.challenge;
    document.getElementById('drawer-solution').innerText = data.solution;
    document.getElementById('drawer-architecture').innerText = data.architecture;
    
    const svgContainer = document.getElementById('drawer-architecture-svg');
    if (svgContainer) {
      svgContainer.innerHTML = data.svg || '';
    }
    
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
    
    const resourceContainer = document.getElementById('drawer-resource-svg');
    if (resourceContainer) {
      resourceContainer.innerHTML = data.resourceSvg || '';
    }
    
    const resourceDesc = document.getElementById('drawer-resource-desc');
    if (resourceDesc) {
      resourceDesc.innerText = data.resourceDesc || '';
    }
    
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
    
    const techsContainer = document.getElementById('drawer-techs');
    techsContainer.innerHTML = '';
    data.techs.forEach(t => {
      const pill = document.createElement('span');
      pill.className = 'drawer-tech-pill mono';
      pill.innerText = t;
      techsContainer.appendChild(pill);
    });
    
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
    
    this.resetDrawerTabs();
    
    const gitLink = document.getElementById('drawer-github-link');
    if (gitLink) {
      gitLink.style.display = 'none';
    }
    
    this.drawer.classList.add('active');
    
    if (window.APP_INSTANCE && window.APP_INSTANCE.scrollManager && window.APP_INSTANCE.scrollManager.lenis) {
      window.APP_INSTANCE.scrollManager.lenis.stop();
    }
    
    if (!isLangSwitch) {
      gsap.fromTo(this.drawer.querySelector('.drawer-panel'), 
        { x: '100%' }, 
        { x: '0%', duration: 0.6, ease: 'power3.out' }
      );
    }
  }

  closeDrawer() {
    this.currentProjectIndex = null;
    if (!this.drawer.classList.contains('active')) return;

    this.soundManager.playDrawerSweep(false);
    
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
        
        if (window.APP_INSTANCE && window.APP_INSTANCE.scrollManager && window.APP_INSTANCE.scrollManager.lenis) {
          window.APP_INSTANCE.scrollManager.lenis.start();
        }
      }
    });
  }

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
        
        this.drawer.querySelectorAll(`.drawer-tab-btn[data-tab-group="${group}"]`).forEach(b => {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        
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

  initCyberTooltip() {
    const tooltip = document.getElementById('cyber-tooltip');
    const tooltipText = document.getElementById('cyber-tooltip-text');
    if (!tooltip || !tooltipText) return;
    
    this.drawer.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-tooltip]');
      if (target) {
        const text = target.getAttribute('data-tooltip');
        tooltipText.innerHTML = text;
        tooltip.style.display = 'block';
        tooltip.offsetHeight; 
        tooltip.classList.add('visible');
      }
    });
    
    this.drawer.addEventListener('mousemove', (e) => {
      if (tooltip.classList.contains('visible')) {
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
    
    const mobileLinks = overlay.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        this.soundManager.playClick();
      });
      
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.soundManager.playChirp();
        
        trigger.classList.remove('active');
        overlay.classList.remove('active');
        
        const targetIdx = parseInt(link.getAttribute('data-target'), 10);
        if (window.APP_INSTANCE && window.APP_INSTANCE.scrollManager) {
          window.APP_INSTANCE.scrollManager.scrollToSection(targetIdx);
        }
      });
    });
  }

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
    
    this.projectsData = lang === 'es' ? projectsDataES : projectsDataEN;
    this.updateProjectsList(lang);
    
    if (this.currentProjectIndex !== null && this.currentProjectIndex !== undefined && this.drawer && this.drawer.classList.contains('active')) {
      this.openDrawer(this.currentProjectIndex, true);
    }
    
    const dictionary = staticTranslations[lang] || staticTranslations['en'];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = dictionary[key];
      if (translation) {
        el.innerHTML = translation;
        el.classList.remove('split-done');
      }
    });

    document.querySelectorAll('.scramble-revealed').forEach(el => el.classList.remove('scramble-revealed'));
    document.querySelectorAll('.revealed-word').forEach(el => el.classList.remove('revealed-word'));

    if (window.APP_INSTANCE) {
      if (window.APP_INSTANCE.animator) {
        if (window.APP_INSTANCE.animator.animatedSections) {
          window.APP_INSTANCE.animator.animatedSections.clear();
        }
        window.APP_INSTANCE.animator.splitTitles();
        window.APP_INSTANCE.animator.splitContentText();
      }
      
      window.APP_INSTANCE._domCache = null;
      
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

  updateProjectsList(lang) {
    const data = lang === 'es' ? projectsDataES : projectsDataEN;
    const rows = document.querySelectorAll('.project-row');
    rows.forEach((row) => {
      const idx = parseInt(row.getAttribute('data-project'), 10);
      const p = data[idx];
      if (!p) return;
      const nameEl = row.querySelector('.project-name');
      const badgeEl = row.querySelector('.project-badge');
      const subEl = row.querySelector('.project-category-sub');
      if (nameEl && p.title) nameEl.textContent = p.title;
      if (badgeEl && p.badge) badgeEl.textContent = p.badge;
      if (subEl && p.sub) subEl.textContent = p.sub;
    });
  }

  initCliTerminals() {
    const inputs = document.querySelectorAll('.cli-input-field');
    inputs.forEach(input => {
      input.addEventListener('keydown', (e) => {
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

    const suggestBtns = document.querySelectorAll('.cli-suggest-btn');
    suggestBtns.forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        this.soundManager.playClick();
      });
      btn.addEventListener('click', () => {
        this.soundManager.playChirp();
        
        const simBody = btn.closest('.simulator-body');
        if (!simBody) return;
        const input = simBody.querySelector('.cli-input-field');
        if (!input) return;
        const cmd = btn.getAttribute('data-cmd');
        const target = input.getAttribute('data-target');
        if (cmd && target) {
          this.executeCliCommand(cmd, target);
          input.focus();
        }
      });
    });
  }

  executeCliCommand(commandText, target) {
    const container = this.getLogsContainer(target);
    if (!container) return;

    const command = commandText.trim().toLowerCase();
    
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
            ` &nbsp;&nbsp;&bull; CARGA DE NÚCLEO: [████████████░░░░░░] 68% • NORMAL<br>` +
            ` &nbsp;&nbsp;&bull; FPS DE RENDERIZADO: ${fps} FPS • RUTA FLUIDA<br>` +
            ` &nbsp;&nbsp;&bull; VELOCIDAD DE SCROLL: ${scrollSpeed} px/s<br>` +
            ` &nbsp;&nbsp;&bull; USO DE MEMORIA: 184 MB / 512 MB ASIGNADOS VIRTUALMENTE<br>` +
            ` &nbsp;&nbsp;&bull; TEMPERATURA THERMAL: 42.4 °C • ESTABLE`, 'log-success');
        } else {
          this.appendLogLine(container, 
            ` - INTERACTIVE CONTROL TELEMETRY:<br>` +
            ` &nbsp;&nbsp;&bull; CPU CORE LOAD: [████████████░░░░░░] 68% • NORMAL<br>` +
            ` &nbsp;&nbsp;&bull; SHADER FPS: ${fps} FPS • RUNNING SMOOTH<br>` +
            ` &nbsp;&nbsp;&bull; V-SCROLL VELOCITY: ${scrollSpeed} px/s<br>` +
            ` &nbsp;&nbsp;&bull; SYSTEM RAM: 184 MB / 512 MB VIRTUAL ALLOC<br>` +
            ` &nbsp;&nbsp;&bull; TEMPERATURE: 42.4 °C • CORES STABLE`, 'log-success');
        }
      }, 400);
    } 
    else if (command === 'database query') {
      this.soundManager.playSuccess();
      this.appendLogLine(container, isEs ? `[DB] EXPLAIN ANALYZE consulta recursiva CTE analizando...` : `[DB] EXPLAIN ANALYZE recursive CTE compilation scanning...`, 'log-info');
      
      setTimeout(() => {
        this.appendLogLine(container, isEs ? `[DB] Coincidencia con índice en parent_id...` : `[DB] Custom Index Scan: parent_id_idx on system_nodes (cost=0.00..8.25)`, 'log-info');
        this.appendLogLine(container, isEs ? `[DB] 2 niveles de jerarquía analizados en 0.07ms (ACID OK)` : `[DB] 2 recursive hierarchy levels processed in 0.07ms (ACID OK)`, 'log-success');
      }, 350);
    } 
    else if (command === 'overclock') {
      this.soundManager.playSuccess();
      this.appendLogLine(container, isEs ? `[HARDWARE] Modulando frecuencia de reactor...` : `[HARDWARE] Modulating core overclock frequency...`, 'log-warn');
      if (window.APP_INSTANCE) {
        window.APP_INSTANCE.toggleOverclock();
      }
    } 
    else {
      this.soundManager.playError();
      this.appendLogLine(container, isEs 
        ? `[ERROR] Comando no reconocido: '${commandText}'. Escribe <strong>help</strong> para la lista de comandos.` 
        : `[ERROR] Command unrecognized: '${commandText}'. Type <strong>help</strong> for available console commands.`, 'log-error');
    }
  }

  getLogsContainer(target) {
    switch (target) {
      case 'vue':
        return document.getElementById('sim-vue-logs');
      case 'laravel':
        return document.getElementById('sim-laravel-logs');
      case 'postgres':
        return document.getElementById('sim-sql-logs');
      case 'wordpress':
        return document.getElementById('sim-wp-logs');
      default:
        return null;
    }
  }

  appendLogLine(container, htmlContent, className = '') {
    const line = document.createElement('div');
    line.className = `log-line-item ${className}`;
    line.innerHTML = htmlContent;
    container.appendChild(line);
    container.scrollTop = container.scrollHeight;
  }

  initOverclockConsole() {
    const btn = document.getElementById('overclock-btn');
    if (!btn) return;
    
    btn.addEventListener('click', () => {
      if (window.APP_INSTANCE) {
        window.APP_INSTANCE.toggleOverclock();
      }
    });
  }

  initCommandRegistry() {
    this.commands = this.getCommandsForLanguage();
  }

  getCommandsForLanguage() {
    const isEs = this.currentLang === 'es';
    return [
      { name: '/goto home', desc: isEs ? 'Navegar al inicio del portafolio' : 'Navigate to the Hero entrance section', action: () => window.APP_INSTANCE?.scrollManager?.scrollToSection(0) },
      { name: '/goto developer', desc: isEs ? 'Navegar a la sección de Desarrollador' : 'Jump to Developer profile & engineering bio', action: () => window.APP_INSTANCE?.scrollManager?.scrollToSection(1) },
      { name: '/goto works', desc: isEs ? 'Navegar al catálogo de Proyectos' : 'Open Constructed Systems showroom', action: () => window.APP_INSTANCE?.scrollManager?.scrollToSection(2) },
      { name: '/goto vue', desc: isEs ? 'Explorar el núcleo de Frontend Vue 3' : 'Jump to Vue.js reactive frontend core', action: () => window.APP_INSTANCE?.scrollManager?.scrollToSection(3) },
      { name: '/goto laravel', desc: isEs ? 'Explorar la arquitectura Backend Laravel' : 'Jump to Laravel backend enterprise architecture', action: () => window.APP_INSTANCE?.scrollManager?.scrollToSection(4) },
      { name: '/goto postgresql', desc: isEs ? 'Inspeccionar el motor de base de datos SQL' : 'Jump to PostgreSQL high-performance CTE engine', action: () => window.APP_INSTANCE?.scrollManager?.scrollToSection(5) },
      { name: '/goto wordpress', desc: isEs ? 'Inspeccionar el CMS interactivo WordPress' : 'Jump to WordPress & Elementor creative suite', action: () => window.APP_INSTANCE?.scrollManager?.scrollToSection(6) },
      { name: '/goto portal', desc: isEs ? 'Ir al portal orbital de contacto' : 'Navigate to Orbital Contact Portal & Footer', action: () => window.APP_INSTANCE?.scrollManager?.scrollToSection(7) },
      { name: '/overclock', desc: isEs ? 'Alternar modo de overclocking del sistema' : 'Toggle 3D visual overclocking state', action: () => this.toggleOverclockCommand() },
      { name: '/explorer', desc: isEs ? 'Alternar vuelo libre con dron en 3D' : 'Toggle free-roam drone 3D exploration', action: () => this.toggleExplorerCommand() },
      { name: '/lang', desc: isEs ? 'Cambiar idioma (Español / English)' : 'Switch language (English / Spanish)', action: () => this.toggleLanguageCommand() },
      { name: '/clear', desc: isEs ? 'Limpiar entrada de comandos' : 'Clear command input field', action: () => this.clearCommandInput() },
      { name: '/help', desc: isEs ? 'Ver todos los comandos disponibles' : 'Display interactive command dictionary', action: () => this.showHelpCommand() }
    ];
  }

  initCommandPalette() {
    this.palette = document.getElementById('cmd-palette');
    this.paletteInput = document.getElementById('cmd-palette-input');
    this.paletteResults = document.getElementById('cmd-palette-results');
    this.paletteTrigger = document.getElementById('cmd-palette-trigger');
    this.paletteBackdrop = document.getElementById('cmd-palette-backdrop');
    
    if (!this.palette || !this.paletteInput || !this.paletteResults) return;
    
    this.activeCmdIndex = 0;
    this.filteredCommands = [];
    
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
    
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.soundManager.playChirp();
        this.toggleCommandPalette();
      }
    });
    
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
      this.filteredCommands = defaultCommands.filter(cmd => 
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
      const noResult = document.createElement('div');
      noResult.className = 'cmd-palette-item mono';
      noResult.innerHTML = `<span style="opacity: 0.5;">${this.currentLang === 'es' ? 'No se encontraron comandos coincidentes' : 'No matching commands found'}</span>`;
      this.paletteResults.appendChild(noResult);
      return;
    }
    
    this.filteredCommands.forEach((cmd, idx) => {
      const item = document.createElement('div');
      item.className = `cmd-palette-item ${idx === this.activeCmdIndex ? 'active' : ''}`;
      item.setAttribute('data-idx', idx);
      
      item.innerHTML = `
        <div class="cmd-palette-item-content">
          <span class="cmd-palette-item-icon">></span>
          <div class="cmd-palette-item-text">
            <span class="cmd-palette-item-name">${cmd.name}</span>
            <span class="cmd-palette-item-desc">${cmd.desc}</span>
          </div>
        </div>
        <span class="cmd-palette-item-badge">ENTER</span>
      `;
      
      item.addEventListener('mouseenter', () => {
        this.activeCmdIndex = idx;
        this.updateActivePaletteItem();
        this.soundManager.playClick();
      });
      
      item.addEventListener('click', () => {
        this.soundManager.playChirp();
        this.executeActiveCommand();
      });
      
      this.paletteResults.appendChild(item);
    });
  }

  updateActivePaletteItem() {
    const items = this.paletteResults.querySelectorAll('.cmd-palette-item');
    items.forEach((it, idx) => {
      if (idx === this.activeCmdIndex) {
        it.classList.add('active');
        it.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        it.classList.remove('active');
      }
    });
  }

  navigatePaletteItems(delta) {
    if (this.filteredCommands.length === 0) return;
    this.activeCmdIndex = (this.activeCmdIndex + delta + this.filteredCommands.length) % this.filteredCommands.length;
    this.updateActivePaletteItem();
  }

  executeActiveCommand() {
    if (this.filteredCommands.length > 0 && this.filteredCommands[this.activeCmdIndex]) {
      const cmd = this.filteredCommands[this.activeCmdIndex];
      this.closeCommandPalette();
      if (cmd.action) {
        cmd.action();
      }
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
    this.palette.offsetHeight; 
    this.palette.classList.add('active');

    if (window.APP_INSTANCE && window.APP_INSTANCE.scrollManager && window.APP_INSTANCE.scrollManager.lenis) {
      window.APP_INSTANCE.scrollManager.lenis.stop();
    }
    
    const trigger = document.getElementById('mobile-menu-trigger');
    const overlay = document.getElementById('mobile-menu-overlay');
    if (trigger && overlay && trigger.classList.contains('active')) {
      trigger.classList.remove('active');
      overlay.classList.remove('active');
    }
    
    setTimeout(() => {
      this.paletteInput.focus();
    }, 50);
  }

  closeCommandPalette() {
    this.palette.classList.remove('active');

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
