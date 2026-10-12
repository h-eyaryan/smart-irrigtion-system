/**
 * AquaSmart IoT - Main Application Controller
 * Handles UI interactions, OLED Black Theme, Front-Page Weather Station,
 * Smart Irrigation & Water Requirement Calculator, AI Diagnostics,
 * Multi-Portal views, and Chart.js Dark Mode Visualizations.
 */

(function () {
  'use strict';

  class AppController {
    constructor() {
      this.currentPortal = 'farmer';
      this.currentFarmerTab = 'dashboard';
      this.selectedDiseaseSample = 'tomato_blight';
      this.charts = {};
      this.audioCtx = null;
      this.soundEnabled = true;

      // Agronomic crop coefficients (Kc)
      this.cropCoefficients = {
        tomato: 1.15,
        corn: 1.10,
        wheat: 0.85,
        citrus: 0.70,
        greens: 0.95,
        grapes: 0.65,
        mixed: 1.00
      };

      document.addEventListener('DOMContentLoaded', () => this.init());
    }

    init() {
      this.bindAuthEvents();
      this.bindPortalSwitchers();
      this.bindNavigation();
      this.bindTelemetryEvents();
      this.bindChatbot();
      this.bindScenarioControls();
      this.bindManualControls();
      this.bindProfileForm();
      this.bindTechnicianActions();
      this.bindAdminActions();
      this.bindAiVisionScanner();
      this.bindCalculator();

      this.checkAuthState(true);
      this.initAllCharts();

      if (window.IrrigationSimulator) {
        window.IrrigationSimulator.dispatchUpdate();
      }
    }

    // AUDIO CHIMES
    playChime(type) {
      if (!this.soundEnabled) return;
      try {
        if (!this.audioCtx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) this.audioCtx = new AudioContext();
        }
        if (!this.audioCtx) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        const now = this.audioCtx.currentTime;

        if (type === 'valve_open') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
        } else if (type === 'valve_close') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(660, now);
          osc.frequency.exponentialRampToValueAtTime(330, now + 0.15);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
        } else if (type === 'ai_scan') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
        } else if (type === 'calc') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
        }
      } catch (e) {}
    }

    // AUTHENTICATION & SESSIONS
    bindAuthEvents() {
      const loginForm = document.getElementById('login-form');
      const registerForm = document.getElementById('register-form');
      const logoutBtn = document.getElementById('logout-btn');
      const switchToRegister = document.getElementById('switch-to-register');
      const switchToLogin = document.getElementById('switch-to-login');

      const demoFarmerBtn = document.getElementById('demo-farmer-btn');
      const demoTechBtn = document.getElementById('demo-tech-btn');
      const demoAdminBtn = document.getElementById('demo-admin-btn');

      if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
          e.preventDefault();
          document.getElementById('login-modal').classList.add('hidden');
          document.getElementById('register-modal').classList.remove('hidden');
        });
      }

      if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
          e.preventDefault();
          document.getElementById('register-modal').classList.add('hidden');
          document.getElementById('login-modal').classList.remove('hidden');
        });
      }

      if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const email = document.getElementById('login-email').value;
          const password = document.getElementById('login-password').value;
          const remember = document.getElementById('login-remember')?.checked;

          const res = window.AuthService.login(email, password, remember);
          if (res.success) {
            this.showToast(res.message, 'success');
            this.checkAuthState(true);
          } else {
            this.showToast(res.message, 'error');
          }
        });
      }

      if (demoFarmerBtn) {
        demoFarmerBtn.addEventListener('click', () => {
          const res = window.AuthService.login('demo@farm.com', 'farm123', true);
          if (res.success) {
            this.showToast('👨‍🌾 Logged in as Farmer John (Greenfield Eco Farm)', 'success');
            this.switchPortal('farmer');
            this.checkAuthState(true);
          }
        });
      }

      if (demoTechBtn) {
        demoTechBtn.addEventListener('click', () => {
          const res = window.AuthService.login('tech@farm.com', 'tech123', true);
          if (res.success) {
            this.showToast('🔧 Logged in as Alex Vance (IoT Field Technician)', 'info');
            this.switchPortal('technician');
            this.checkAuthState(true);
          }
        });
      }

      if (demoAdminBtn) {
        demoAdminBtn.addEventListener('click', () => {
          const res = window.AuthService.login('admin@farm.com', 'admin123', true);
          if (res.success) {
            this.showToast('👑 Logged in as Sarah Connor (System Admin)', 'success');
            this.switchPortal('admin');
            this.checkAuthState(true);
          }
        });
      }

      if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const data = {
            fullName: document.getElementById('reg-name').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value,
            role: document.getElementById('reg-role')?.value || 'farmer',
            farmName: document.getElementById('reg-farm-name').value,
            location: document.getElementById('reg-location').value,
            cropType: document.getElementById('reg-crop').value,
            soilType: document.getElementById('reg-soil').value,
            irrigationType: document.getElementById('reg-system').value,
            fieldSize: document.getElementById('reg-size').value
          };

          const res = window.AuthService.register(data);
          if (res.success) {
            this.showToast(res.message, 'success');
            if (data.role === 'technician') this.switchPortal('technician');
            else if (data.role === 'admin') this.switchPortal('admin');
            else this.switchPortal('farmer');
            this.checkAuthState(true);
          } else {
            this.showToast(res.message, 'error');
          }
        });
      }

      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          window.AuthService.logout();
          this.showToast('Logged out successfully.', 'info');
          this.checkAuthState();
        });
      }

      window.addEventListener('aqua:auth-change', () => this.checkAuthState());
    }

    checkAuthState(isFirstLogin = false) {
      const user = window.AuthService.getCurrentUser();
      const authContainer = document.getElementById('auth-overlay');
      const mainApp = document.getElementById('main-app-container');

      if (user) {
        if (authContainer) authContainer.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');

        document.querySelectorAll('.user-display-name').forEach(el => el.textContent = user.fullName);
        document.querySelectorAll('.user-farm-name').forEach(el => el.textContent = user.farmName || 'Operations Center');
        document.querySelectorAll('.user-location').forEach(el => el.textContent = user.location || 'Central Region');
        document.querySelectorAll('.user-role-badge').forEach(el => {
          el.textContent = user.role.toUpperCase();
          if (user.role === 'admin') el.className = 'user-role-badge px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-700';
          else if (user.role === 'technician') el.className = 'user-role-badge px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700';
          else el.className = 'user-role-badge px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700';
        });

        // Only auto-switch portal on first login (not on every auth check)
        if (isFirstLogin) {
          if (user.role === 'admin') {
            this.switchPortal('admin');
          } else if (user.role === 'technician') {
            this.switchPortal('technician');
          } else {
            this.switchPortal('farmer');
          }
        }

        this.renderAdminUsersTable();
      } else {
        if (authContainer) authContainer.classList.remove('hidden');
        if (mainApp) mainApp.classList.add('hidden');
      }
    }

    // PORTAL SWITCHING
    bindPortalSwitchers() {
      const portalBtns = document.querySelectorAll('.portal-switch-btn');
      portalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.dataset.portal;
          this.switchPortal(target);
        });
      });
    }

    switchPortal(portalId) {
      this.currentPortal = portalId;

      document.querySelectorAll('.portal-switch-btn').forEach(btn => {
        if (btn.dataset.portal === portalId) {
          btn.className = 'portal-switch-btn flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-lg bg-emerald-600 text-white border border-emerald-500/50 glow-emerald';
        } else {
          btn.className = 'portal-switch-btn flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition text-slate-400 hover:text-white bg-slate-900/90 border border-slate-800 hover:bg-slate-800';
        }
      });

      document.querySelectorAll('.portal-section').forEach(sec => {
        if (sec.id === `portal-${portalId}`) {
          sec.classList.remove('hidden');
        } else {
          sec.classList.add('hidden');
        }
      });

      setTimeout(() => {
        Object.values(this.charts).forEach(c => {
          if (c && typeof c.resize === 'function') c.resize();
        });
      }, 150);
    }

    // FARMER TABS
    bindNavigation() {
      const navLinks = document.querySelectorAll('.nav-tab-btn');
      navLinks.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const target = btn.dataset.tab;
          this.switchFarmerTab(target);
        });
      });

      const soundBtn = document.getElementById('toggle-sound-btn');
      if (soundBtn) {
        soundBtn.addEventListener('click', () => {
          this.soundEnabled = !this.soundEnabled;
          soundBtn.innerHTML = this.soundEnabled ? '🔔 Sound: ON' : '🔕 Sound: OFF';
          this.showToast(`Audio alerts ${this.soundEnabled ? 'Enabled' : 'Muted'}`, 'info');
        });
      }
    }

    switchFarmerTab(tabId) {
      this.currentFarmerTab = tabId;

      document.querySelectorAll('.nav-tab-btn').forEach(btn => {
        if (btn.dataset.tab === tabId) {
          btn.className = 'nav-tab-btn px-4 py-2 rounded-xl bg-emerald-600 text-white shadow-xs font-semibold text-xs transition';
        } else {
          btn.className = 'nav-tab-btn px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-slate-200 font-semibold text-xs transition';
        }
      });

      document.querySelectorAll('.tab-panel').forEach(panel => {
        if (panel.id === `tab-${tabId}`) {
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      });

      if (tabId === 'analytics') {
        setTimeout(() => {
          if (this.charts.moisture) this.charts.moisture.resize();
          if (this.charts.water) this.charts.water.resize();
          if (this.charts.zoneComparison) this.charts.zoneComparison.resize();
          if (this.charts.aiMoisture) this.charts.aiMoisture.resize();
        }, 100);
      }
    }

    // TELEMETRY LIVE UPDATES
    bindTelemetryEvents() {
      window.addEventListener('aqua:telemetry-update', (e) => {
        const data = e.detail;
        this.renderDashboard(data.zones, data.reservoir, data.weather);
        this.renderFrontWeather(data.weather);
        this.renderZonesGrid(data.zones);
        this.renderReservoir(data.reservoir);
        this.renderActivityLogs(data.activityLogs);
        this.renderTechnicianPortal(data.hardwareNodes, data.maintenanceTickets);
        this.renderAdminPortal(data.adminAnalyticsData, data.reservoir);
        this.renderAiPrescription(data.aiEngine);
        this.updateLiveCharts(data);
      });
    }

    renderDashboard(zones, reservoir, weather) {
      const avgMoisture = Math.round(zones.reduce((sum, z) => sum + z.soilMoisture, 0) / zones.length);
      const avgMoistureEl = document.getElementById('stat-avg-moisture');
      if (avgMoistureEl) avgMoistureEl.textContent = `${avgMoisture}%`;

      const activeCount = zones.filter(z => z.valveOpen).length;
      const activeValvesEl = document.getElementById('stat-active-valves');
      if (activeValvesEl) activeValvesEl.textContent = `${activeCount} / ${zones.length}`;

      const tankLevelEl = document.getElementById('stat-tank-level');
      if (tankLevelEl) tankLevelEl.textContent = `${reservoir.levelPercentage}%`;

      const weatherTempEl = document.getElementById('stat-weather-temp');
      const weatherCondEl = document.getElementById('stat-weather-cond');
      if (weatherTempEl) weatherTempEl.textContent = `${weather.tempC}°C`;
      if (weatherCondEl) weatherCondEl.textContent = `${weather.icon} ${weather.condition}`;

      const pumpBadge = document.getElementById('header-pump-badge');
      if (pumpBadge) {
        if (reservoir.mainPumpActive) {
          pumpBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-600 animate-pulse';
          pumpBadge.innerHTML = '⚡ Main Pump: RUNNING';
        } else {
          pumpBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-800';
          pumpBadge.innerHTML = '⚪ Main Pump: STANDBY';
        }
      }
    }

    // FRONT-PAGE LIVE WEATHER STATION
    renderFrontWeather(w) {
      if (!w) return;
      const fTemp = document.getElementById('weather-front-temp');
      const fCond = document.getElementById('weather-front-cond');
      const fIcon = document.getElementById('weather-front-icon');
      const fHum = document.getElementById('weather-front-humidity');
      const fWind = document.getElementById('weather-front-wind');
      const fSolar = document.getElementById('weather-front-solar');
      const fRainProb = document.getElementById('weather-front-rain-prob');
      const fRainSkip = document.getElementById('weather-front-rain-skip');
      const fForecast = document.getElementById('weather-front-forecast');

      if (fTemp) fTemp.textContent = `${w.tempC}°C`;
      if (fCond) fCond.textContent = w.condition;
      if (fIcon) fIcon.textContent = w.icon;
      if (fHum) fHum.textContent = `${w.humidity}%`;
      if (fWind) fWind.textContent = `${w.windSpeedKmh} km/h`;
      if (fSolar) fSolar.textContent = `${w.solarRadiationW} W/m²`;
      if (fRainProb) fRainProb.textContent = `${w.rainProbability}%`;
      if (fForecast) fForecast.textContent = w.forecast;
      if (fRainSkip) {
        if (w.rainProbability >= 65) {
          fRainSkip.innerHTML = `<span class="text-amber-400 font-bold">⚡ SKIP ACTIVE (${w.rainProbability}%)</span>`;
        } else {
          fRainSkip.innerHTML = `<span class="text-emerald-400 font-bold">🛡️ ARMED (Auto-Skip > 65%)</span>`;
        }
      }
    }

    // FRONT-PAGE ENHANCED ZONES GRID (WITH 5M, 10M, 15M TIMED WATERING)
    renderZonesGrid(zones) {
      const container = document.getElementById('zones-cards-container');
      const listContainer = document.getElementById('zones-detailed-list');
      if (!container) return;

      container.innerHTML = zones.map(zone => {
        const isLow = zone.soilMoisture < zone.minThreshold;
        const colorClass = isLow ? 'text-amber-400' : (zone.soilMoisture > zone.targetThreshold ? 'text-cyan-400' : 'text-emerald-400');
        const bgBarClass = isLow ? 'bg-amber-500' : (zone.soilMoisture > zone.targetThreshold ? 'bg-cyan-500' : 'bg-emerald-500');

        return `
          <div class="obsidian-card rounded-2xl p-5 transition-all">
            <div class="flex items-start justify-between mb-3">
              <div>
                <span class="text-xs uppercase tracking-wider font-semibold text-emerald-400">Zone ${zone.id}</span>
                <h3 class="text-lg font-bold text-white">${zone.name}</h3>
                <p class="text-xs text-slate-400">🌱 ${zone.crop} • <span class="text-slate-500">${zone.irrigationType}</span></p>
              </div>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${zone.valveOpen ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 animate-pulse' : 'bg-slate-900 text-slate-400 border border-slate-800'}">
                ${zone.valveOpen ? '💧 Watering Active' : 'Idle Standby'}
              </span>
            </div>

            <!-- Moisture Gauge -->
            <div class="my-3">
              <div class="flex justify-between items-baseline mb-1">
                <span class="text-xs font-medium text-slate-400">Soil Moisture Gauge</span>
                <span class="text-2xl font-black ${colorClass}">${zone.soilMoisture}%</span>
              </div>
              <div class="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                <div class="${bgBarClass} h-3 rounded-full transition-all duration-700 shadow-sm" style="width: ${Math.min(100, zone.soilMoisture)}%"></div>
              </div>
              <div class="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>Trigger Min: ${zone.minThreshold}%</span>
                <span>Cutoff Target: ${zone.targetThreshold}%</span>
              </div>
            </div>

            <!-- Sensor Telemetry Strip -->
            <div class="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 my-3 text-center">
              <div>
                <div class="text-[10px] text-slate-400">Soil Temp</div>
                <div class="text-xs font-semibold text-slate-200">🌡️ ${zone.soilTemp}°C</div>
              </div>
              <div>
                <div class="text-[10px] text-slate-400">Flow Rate</div>
                <div class="text-xs font-semibold text-cyan-400">${zone.valveOpen ? `${zone.flowRateLpm} L/m` : '0 L/m'}</div>
              </div>
              <div>
                <div class="text-[10px] text-slate-400">Delivered Today</div>
                <div class="text-xs font-semibold text-emerald-400">${zone.waterUsedToday} L</div>
              </div>
            </div>

            <!-- Quick Timed Water Controls -->
            <div class="flex items-center justify-between gap-1 pt-1">
              <div class="flex items-center gap-1">
                <button 
                  onclick="window.AppController.waterForMinutes(${zone.id}, 5)"
                  title="Water for 5 minutes"
                  class="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">
                  💧 5m
                </button>
                <button 
                  onclick="window.AppController.waterForMinutes(${zone.id}, 10)"
                  title="Water for 10 minutes"
                  class="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">
                  💧 10m
                </button>
                <button 
                  onclick="window.AppController.waterForMinutes(${zone.id}, 15)"
                  title="Water for 15 minutes"
                  class="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">
                  💧 15m
                </button>
              </div>

              <!-- Main On/Off Toggle -->
              <button 
                onclick="window.AppController.toggleZoneValve(${zone.id})"
                class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${zone.valveOpen ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'}">
                ${zone.valveOpen ? '🛑 Stop Valve' : '💧 Water Now'}
              </button>
            </div>
          </div>
        `;
      }).join('');

      if (listContainer) {
        listContainer.innerHTML = zones.map(zone => `
          <tr class="border-b border-slate-800 hover:bg-slate-900/40">
            <td class="py-3 px-4 font-semibold text-white">Zone ${zone.id}: ${zone.name}</td>
            <td class="py-3 px-4 text-slate-300">${zone.crop}</td>
            <td class="py-3 px-4 text-slate-300">${zone.irrigationType}</td>
            <td class="py-3 px-4 font-bold ${zone.soilMoisture < zone.minThreshold ? 'text-amber-400' : 'text-emerald-400'}">${zone.soilMoisture}%</td>
            <td class="py-3 px-4 text-slate-400">${zone.minThreshold}% / ${zone.targetThreshold}%</td>
            <td class="py-3 px-4 text-slate-300">${zone.waterUsedToday} L</td>
            <td class="py-3 px-4">
              <span class="inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${zone.valveOpen ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-900 text-slate-400'}">
                ${zone.status}
              </span>
            </td>
            <td class="py-3 px-4 text-right">
              <button 
                onclick="window.AppController.toggleZoneValve(${zone.id})"
                class="px-3 py-1 rounded text-xs font-medium ${zone.valveOpen ? 'bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800' : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800'}">
                ${zone.valveOpen ? 'Stop' : 'Water'}
              </button>
            </td>
          </tr>
        `).join('');
      }
    }

    waterForMinutes(zoneId, minutes) {
      const ok = window.IrrigationSimulator.waterForDuration(zoneId, minutes);
      if (ok) {
        this.playChime('valve_open');
        this.showToast(`Watering Zone ${zoneId} for ${minutes} minutes...`, 'success');
      } else {
        this.showToast('Could not start timed watering: Reservoir low!', 'error');
      }
    }

    renderReservoir(res) {
      const bar = document.getElementById('reservoir-fluid-bar');
      const valLiters = document.getElementById('reservoir-liters');
      const valPercent = document.getElementById('reservoir-percent');
      const valPressure = document.getElementById('reservoir-pressure');
      const valSaved = document.getElementById('reservoir-saved');
      const valSavedSub = document.getElementById('reservoir-saved-sub');

      if (bar) bar.style.height = `${res.levelPercentage}%`;
      if (valLiters) valLiters.textContent = `${res.currentLiters.toLocaleString()} L`;
      if (valPercent) valPercent.textContent = `${res.levelPercentage}%`;
      if (valPressure) valPressure.textContent = `${res.pressurePsi} PSI`;
      if (valSaved) valSaved.textContent = `${res.waterSavedToday} L`;
      if (valSavedSub) valSavedSub.textContent = `${res.waterSavedToday} L`;
    }

    renderActivityLogs(logs) {
      const container = document.getElementById('activity-logs-container');
      const tableBody = document.getElementById('history-table-body');
      if (!container) return;

      container.innerHTML = logs.slice(0, 6).map(log => {
        let badgeColor = 'bg-slate-900 text-slate-300 border border-slate-800';
        let icon = 'ℹ️';
        if (log.severity === 'success') { badgeColor = 'bg-emerald-950 text-emerald-300 border border-emerald-800'; icon = '💧'; }
        if (log.severity === 'alert' || log.severity === 'warning') { badgeColor = 'bg-rose-950 text-rose-300 border border-rose-800'; icon = '⚠️'; }
        if (log.severity === 'weather') { badgeColor = 'bg-cyan-950 text-cyan-300 border border-cyan-800'; icon = '🌦️'; }

        return `
          <div class="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
            <span class="p-1.5 rounded-lg ${badgeColor} text-sm">${icon}</span>
            <div class="flex-1">
              <div class="flex justify-between items-center mb-0.5">
                <span class="font-bold text-slate-200">${log.zoneName}</span>
                <span class="text-slate-500 text-[10px]">${log.timestamp}</span>
              </div>
              <p class="text-slate-400">${log.message}</p>
            </div>
          </div>
        `;
      }).join('');

      if (tableBody) {
        tableBody.innerHTML = logs.map(log => `
          <tr class="border-b border-slate-800/80">
            <td class="py-3 px-4 text-xs text-slate-500">${log.date} ${log.timestamp}</td>
            <td class="py-3 px-4 text-xs font-semibold text-slate-200">${log.zoneName}</td>
            <td class="py-3 px-4 text-xs">
              <span class="px-2 py-0.5 rounded text-[11px] font-medium ${log.severity === 'success' ? 'bg-emerald-950 text-emerald-300' : (log.severity === 'alert' ? 'bg-rose-950 text-rose-300' : 'bg-slate-900 text-slate-400')}">
                ${log.type.toUpperCase()}
              </span>
            </td>
            <td class="py-3 px-4 text-xs text-slate-300">${log.message}</td>
            <td class="py-3 px-4 text-xs font-medium text-slate-300">${log.liters ? `${log.liters} L` : '-'}</td>
          </tr>
        `).join('');
      }
    }

    // ===============================================
    // SMART IRRIGATION WATER & RUNTIME CALCULATOR
    // ===============================================
    bindCalculator() {
      const cropSelect = document.getElementById('calc-crop');
      const areaInput = document.getElementById('calc-area');
      const areaUnitSelect = document.getElementById('calc-area-unit');
      const soilSelect = document.getElementById('calc-soil');
      const emitterSelect = document.getElementById('calc-emitter');
      const applyBtn = document.getElementById('btn-calc-apply');
      const targetZoneSelect = document.getElementById('calc-target-zone');

      const inputs = [cropSelect, areaInput, areaUnitSelect, soilSelect, emitterSelect];
      inputs.forEach(el => {
        if (el) {
          el.addEventListener('input', () => this.calculateIrrigation());
          el.addEventListener('change', () => this.calculateIrrigation());
        }
      });

      if (applyBtn) {
        applyBtn.addEventListener('click', () => {
          const zoneId = parseInt(targetZoneSelect.value, 10);
          const runtimeMins = parseInt(document.getElementById('calc-out-runtime').textContent, 10) || 12;

          this.playChime('calc');
          this.waterForMinutes(zoneId, runtimeMins);
          this.showToast(`Applied ${runtimeMins} min calculated irrigation cycle to Zone ${zoneId}!`, 'success');
        });
      }

      // Initial calculation
      this.calculateIrrigation();
    }

    calculateIrrigation() {
      const crop = document.getElementById('calc-crop')?.value || 'tomato';
      let area = parseFloat(document.getElementById('calc-area')?.value) || 500;
      const unit = document.getElementById('calc-area-unit')?.value || 'sqm';
      const soil = document.getElementById('calc-soil')?.value || 'loam';
      const emitter = document.getElementById('calc-emitter')?.value || 'drip';

      // Convert Acres to square meters if needed (1 acre = 4046.86 m²)
      let areaSqm = unit === 'acres' ? area * 4046.86 : area;

      // ET0 baseline from simulator or default
      const et0 = window.IrrigationSimulator?.aiEngine?.et0MmDay || 4.35;
      const kc = this.cropCoefficients[crop] || 1.0;

      // Soil Factor: Sandy needs more frequent/higher volume, clay holds water
      let soilFactor = 1.0;
      if (soil === 'sandy') soilFactor = 1.20;
      else if (soil === 'clay') soilFactor = 0.88;

      // Emitter System Efficiency & Flow Rate (Liters per min for the zone)
      let efficiency = 0.92;
      let zoneFlowLpm = 6.2; // Drip line
      if (emitter === 'sprinkler') {
        efficiency = 0.75;
        zoneFlowLpm = 14.5;
      } else if (emitter === 'misting') {
        efficiency = 0.85;
        zoneFlowLpm = 4.5;
      }

      // Daily Net Irrigation Requirement (mm) = ET0 * Kc * SoilFactor
      const etcMm = et0 * kc * soilFactor;

      // Gross Daily Volume in Liters = (etcMm * areaSqm) / efficiency
      // Scale down proportionally for realistic single-zone residential/farm demonstration if area is large
      const grossVolumeLiters = Math.round((etcMm * (areaSqm / 100)) / efficiency * 10);

      // Recommended Runtime in Minutes
      const runtimeMinutes = Math.max(3, Math.round(grossVolumeLiters / (zoneFlowLpm * 2)));

      // Estimated Cost & Savings
      const waterCostUsd = ((grossVolumeLiters * 30 * 0.0015)).toFixed(2);
      const conservedLiters = Math.round(grossVolumeLiters * 0.42); // 42% saved vs flood

      // Update UI elements
      const outLiters = document.getElementById('calc-out-liters');
      const outRuntime = document.getElementById('calc-out-runtime');
      const outCost = document.getElementById('calc-out-cost');
      const outConserved = document.getElementById('calc-out-conserved');
      const outEfficiency = document.getElementById('calc-out-efficiency');

      if (outLiters) outLiters.textContent = `${grossVolumeLiters.toLocaleString()} L`;
      if (outRuntime) outRuntime.textContent = `${runtimeMinutes} Min`;
      if (outCost) outCost.textContent = `$${waterCostUsd} / mo`;
      if (outConserved) outConserved.textContent = `${conservedLiters.toLocaleString()} L`;
      if (outEfficiency) outEfficiency.textContent = `${Math.round(efficiency * 100)}% Efficiency`;
    }

    // ===================================
    // AI INTELLIGENCE & VISION SECTION
    // ===================================
    renderAiPrescription(ai) {
      const et0El = document.getElementById('ai-kpi-et0');
      const vpdEl = document.getElementById('ai-kpi-vpd');
      const effEl = document.getElementById('ai-kpi-efficiency');
      const recEl = document.getElementById('ai-prescription-text');

      if (et0El) et0El.textContent = `${ai.et0MmDay} mm/d`;
      if (vpdEl) vpdEl.textContent = `${ai.vpdKpa} kPa`;
      if (effEl) effEl.textContent = `${ai.aiEfficiencyScore}`;
      if (recEl) recEl.textContent = ai.irrigationPrescription;
    }

    bindAiVisionScanner() {
      const sampleBtns = document.querySelectorAll('.ai-sample-select-btn');
      const runScanBtn = document.getElementById('btn-run-ai-scan');
      const adoptPrescriptionBtn = document.getElementById('btn-adopt-ai-prescription');

      sampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.selectedDiseaseSample = btn.dataset.sampleId;
          sampleBtns.forEach(b => {
            b.classList.remove('border-emerald-500', 'bg-emerald-950/40', 'text-emerald-300');
            b.classList.add('border-slate-800', 'bg-slate-900', 'text-slate-400');
          });
          btn.classList.remove('border-slate-800', 'bg-slate-900', 'text-slate-400');
          btn.classList.add('border-emerald-500', 'bg-emerald-950/40', 'text-emerald-300');
          this.updateAiPreviewSample(this.selectedDiseaseSample);
        });
      });

      if (runScanBtn) {
        runScanBtn.addEventListener('click', async () => {
          const previewCard = document.getElementById('ai-leaf-scan-box');
          const resultsCard = document.getElementById('ai-scan-results-box');

          if (previewCard) previewCard.classList.add('ai-scan-active');
          this.playChime('ai_scan');

          runScanBtn.disabled = true;
          runScanBtn.textContent = '🧠 Neural Analysis in progress...';

          const sample = await window.IrrigationSimulator.runAiScan(this.selectedDiseaseSample);

          if (previewCard) previewCard.classList.remove('ai-scan-active');
          runScanBtn.disabled = false;
          runScanBtn.textContent = '⚡ Run AI Neural Scan';

          if (resultsCard) {
            resultsCard.classList.remove('hidden');
            document.getElementById('ai-result-disease-name').textContent = sample.sampleName;
            document.getElementById('ai-result-confidence').textContent = `${sample.confidence}% Confidence`;
            document.getElementById('ai-result-severity').textContent = sample.severity;
            document.getElementById('ai-result-diagnosis').textContent = sample.diagnosis;
            document.getElementById('ai-result-prescription').textContent = sample.prescription;
          }

          this.showToast(`AI Diagnosis: ${sample.sampleName} (${sample.confidence}%)`, 'success');
        });
      }

      if (adoptPrescriptionBtn) {
        adoptPrescriptionBtn.addEventListener('click', () => {
          this.showToast('AI Prescription adopted! Field solenoids re-calibrated for minimum evaporation.', 'success');
          this.playChime('valve_open');
        });
      }
    }

    updateAiPreviewSample(sampleId) {
      const sim = window.IrrigationSimulator;
      const sample = sim.cropDiseaseSamples.find(s => s.id === sampleId);
      if (!sample) return;

      const titleEl = document.getElementById('ai-preview-title');
      const cropEl = document.getElementById('ai-preview-crop');
      const imgEl = document.getElementById('ai-preview-image');

      if (titleEl) titleEl.textContent = sample.sampleName;
      if (cropEl) cropEl.textContent = `Crop: ${sample.crop}`;
      if (imgEl) imgEl.src = sample.leafImage;
    }

    // ===================================
    // TECHNICIAN & ADMIN RENDERING
    // ===================================
    renderTechnicianPortal(nodes, tickets) {
      const nodesContainer = document.getElementById('tech-nodes-container');
      const ticketsContainer = document.getElementById('tech-tickets-table');

      if (nodesContainer && nodes) {
        nodesContainer.innerHTML = nodes.map(node => `
          <div class="obsidian-card rounded-2xl p-5">
            <div class="flex items-start justify-between mb-3">
              <div>
                <span class="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">${node.id}</span>
                <h4 class="text-sm font-bold text-white">${node.name}</h4>
                <p class="text-[11px] text-slate-400">IP: ${node.ipAddress} | MAC: ${node.macAddress}</p>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${node.status === 'Online' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-900 text-slate-400 border border-slate-800'}">
                ● ${node.status}
              </span>
            </div>

            <div class="grid grid-cols-4 gap-2 text-center py-2 bg-slate-900/80 rounded-xl my-3 text-xs border border-slate-800">
              <div>
                <span class="text-[10px] text-slate-400 block">WiFi RSSI</span>
                <span class="font-bold text-slate-200">${node.rssiDb} dBm</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 block">Battery</span>
                <span class="font-bold text-emerald-400">${node.batteryVoltage}V</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 block">3.3V Rail</span>
                <span class="font-bold text-slate-200">${node.railVoltage3v3}V</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 block">Firmware</span>
                <span class="font-bold text-cyan-400 text-[10px]">${node.firmwareVersion}</span>
              </div>
            </div>

            <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Uptime: ${node.uptimeHours} hrs</span>
              <span>Controlled: ${node.zonesControlled}</span>
            </div>
          </div>
        `).join('');
      }

      if (ticketsContainer && tickets) {
        ticketsContainer.innerHTML = tickets.map(t => `
          <tr class="border-b border-slate-800/80">
            <td class="py-2.5 px-3 font-mono font-bold text-cyan-400 text-xs">${t.id}</td>
            <td class="py-2.5 px-3 text-xs text-slate-200 font-semibold">${t.component}</td>
            <td class="py-2.5 px-3 text-xs text-slate-400">${t.title}</td>
            <td class="py-2.5 px-3 text-xs">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${t.priority === 'High' ? 'bg-rose-950 text-rose-300 border border-rose-800' : (t.priority === 'Medium' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800')}">
                ${t.priority}
              </span>
            </td>
            <td class="py-2.5 px-3 text-xs">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'Resolved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : (t.status === 'In Progress' ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-slate-900 text-slate-400 border border-slate-800')}">
                ${t.status}
              </span>
            </td>
            <td class="py-2.5 px-3 text-right">
              ${t.status !== 'Resolved' ? `
                <button 
                  onclick="window.AppController.resolveTicket('${t.id}')"
                  class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition">
                  Resolve
                </button>
              ` : '<span class="text-[11px] text-slate-500">Signed Off</span>'}
            </td>
          </tr>
        `).join('');
      }
    }

    bindTechnicianActions() {
      const btnTestSolenoids = document.getElementById('tech-btn-test-solenoids');
      const btnTestSensors = document.getElementById('tech-btn-test-sensors');
      const btnTestEcho = document.getElementById('tech-btn-test-echo');
      const btnTestMqtt = document.getElementById('tech-btn-test-mqtt');
      const btnOta = document.getElementById('tech-btn-ota-update');
      const btnNewTicket = document.getElementById('tech-btn-new-ticket');

      const runDiag = async (type) => {
        const consoleEl = document.getElementById('tech-diagnostic-console');
        if (consoleEl) {
          consoleEl.innerHTML = `<span class="animate-pulse text-cyan-400">⏳ Executing automated hardware routine: ${type.toUpperCase()}...</span>`;
        }
        const res = await window.IrrigationSimulator.runDiagnosticTest(type);
        if (consoleEl) {
          consoleEl.innerHTML = `
            <div class="text-emerald-400 font-bold">✅ ${res.title} -> STATUS: ${res.status} (${res.healthScore})</div>
            <div class="text-slate-300 text-xs mt-1">${res.details}</div>
          `;
        }
        this.playChime('valve_open');
        this.showToast(`Diagnostic Complete: ${res.title}`, 'success');
      };

      if (btnTestSolenoids) btnTestSolenoids.addEventListener('click', () => runDiag('solenoids'));
      if (btnTestSensors) btnTestSensors.addEventListener('click', () => runDiag('sensors'));
      if (btnTestEcho) btnTestEcho.addEventListener('click', () => runDiag('ultrasonic'));
      if (btnTestMqtt) btnTestMqtt.addEventListener('click', () => runDiag('network'));

      if (btnOta) {
        btnOta.addEventListener('click', () => {
          const bar = document.getElementById('tech-ota-progress-bar');
          const statusText = document.getElementById('tech-ota-status');
          if (!bar) return;

          btnOta.disabled = true;
          let progress = 0;
          statusText.textContent = 'Transmitting firmware payload (v2.4.3-patch)...';

          const interval = setInterval(() => {
            progress += 20;
            bar.style.width = `${progress}%`;
            if (progress >= 100) {
              clearInterval(interval);
              statusText.textContent = 'Firmware flashed successfully! ESP32 rebooted in 1.4s.';
              btnOta.disabled = false;
              this.showToast('OTA Firmware v2.4.3 flashed to all nodes!', 'success');
            }
          }, 350);
        });
      }

      if (btnNewTicket) {
        btnNewTicket.addEventListener('click', () => {
          const comp = prompt('Component Name (e.g. Zone 1 Drip Emitter, Node-02 Antenna):');
          if (!comp) return;
          const issue = prompt('Issue Description:');
          if (!issue) return;
          window.IrrigationSimulator.createTicket(issue, 'NODE-ESP32-01', comp, 'Medium');
          this.showToast('Maintenance Work Order submitted!', 'info');
        });
      }
    }

    resolveTicket(ticketId) {
      const ok = window.IrrigationSimulator.resolveTicket(ticketId);
      if (ok) {
        this.showToast(`Ticket ${ticketId} resolved and archived.`, 'success');
      }
    }

    renderAdminPortal(analyticsData, reservoir) {
      const totalSavedEl = document.getElementById('admin-kpi-saved');
      if (totalSavedEl) totalSavedEl.textContent = `${(14.8 + reservoir.waterSavedToday / 1000).toFixed(1)} ML`;
    }

    renderAdminUsersTable() {
      const tableBody = document.getElementById('admin-users-table');
      if (!tableBody) return;

      const users = window.AuthService.getAllUsers();
      tableBody.innerHTML = users.map(u => `
        <tr class="border-b border-slate-800/80 hover:bg-slate-900/40">
          <td class="py-3 px-4 font-bold text-white text-xs flex items-center gap-2">
            <span>${u.avatar || '👤'}</span>
            <span>${u.fullName}</span>
          </td>
          <td class="py-3 px-4 text-xs text-slate-400">${u.email}</td>
          <td class="py-3 px-4 text-xs">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'admin' ? 'bg-purple-950 text-purple-300 border border-purple-800' : (u.role === 'technician' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800')}">
              ${u.role.toUpperCase()}
            </span>
          </td>
          <td class="py-3 px-4 text-xs text-slate-300 font-semibold">${u.farmName || 'Ops Network'}</td>
          <td class="py-3 px-4 text-xs text-slate-400">${u.location}</td>
          <td class="py-3 px-4 text-xs">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${u.status === 'Active' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}">
              ${u.status}
            </span>
          </td>
          <td class="py-3 px-4 text-right text-xs">
            <button 
              onclick="window.AppController.adminToggleStatus('${u.id}')"
              class="px-2 py-1 rounded text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 mr-1">
              Toggle Status
            </button>
            <button 
              onclick="window.AppController.adminDeleteUser('${u.id}')"
              class="px-2 py-1 rounded text-[11px] font-semibold bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800">
              Delete
            </button>
          </td>
        </tr>
      `).join('');
    }

    bindAdminActions() {
      const btnSavePolicy = document.getElementById('admin-btn-save-policy');
      if (btnSavePolicy) {
        btnSavePolicy.addEventListener('click', (e) => {
          e.preventDefault();
          this.showToast('Global network irrigation policy saved & broadcasted to all farm nodes!', 'success');
        });
      }
    }

    adminToggleStatus(userId) {
      const res = window.AuthService.toggleUserStatus(userId);
      if (res.success) {
        this.showToast(res.message, 'info');
        this.renderAdminUsersTable();
      } else {
        this.showToast(res.message, 'error');
      }
    }

    adminDeleteUser(userId) {
      if (!confirm('Are you sure you want to remove this user from the AquaSmart network?')) return;
      const res = window.AuthService.deleteUser(userId);
      if (res.success) {
        this.showToast(res.message, 'success');
        this.renderAdminUsersTable();
      } else {
        this.showToast(res.message, 'error');
      }
    }

    // ===================================
    // CHART.JS DARK MODE SUITE
    // ===================================
    initAllCharts() {
      if (typeof Chart === 'undefined') return;

      Chart.defaults.color = '#94a3b8';
      Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';

      const sim = window.IrrigationSimulator;
      const history = sim ? sim.historyData : { labels: [], avgMoisture: [], waterConsumption: [], temperature: [] };
      const adminData = sim ? sim.adminAnalyticsData : { days: [], traditionalWater: [], smartWaterUsed: [], waterSaved: [], cropDistribution: { labels: [], percentages: [], colors: [] } };
      const techAdc = sim ? sim.adcWaveformBuffer : { timestamps: [], zone1Raw: [], zone2Raw: [], batteryCurve: [] };
      const aiMoisture = sim ? sim.aiMoistureForecast : { timestamps: [], actualCurve: [], aiOptimizedCurve: [] };

      // 1. FARMER: Moisture Trend Chart
      const moistureCtx = document.getElementById('chart-moisture-trend');
      if (moistureCtx) {
        this.charts.moisture = new Chart(moistureCtx, {
          type: 'line',
          data: {
            labels: history.labels,
            datasets: [
              {
                label: 'Avg Soil Moisture (%)',
                data: history.avgMoisture,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
              },
              {
                label: 'Ambient Temp (°C)',
                data: history.temperature,
                borderColor: '#f59e0b',
                borderDash: [5, 5],
                borderWidth: 2,
                tension: 0.4
              }
            ]
          },
          options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 100 } } }
        });
      }

      // 2. FARMER: Water Usage Bar
      const waterCtx = document.getElementById('chart-water-usage');
      if (waterCtx) {
        this.charts.water = new Chart(waterCtx, {
          type: 'bar',
          data: {
            labels: history.labels,
            datasets: [{ label: 'Water Delivered (L)', data: history.waterConsumption, backgroundColor: '#0284c7', borderRadius: 6 }]
          },
          options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
        });
      }

      // 3. FARMER: Zone Comparison Bar
      const zoneCompCtx = document.getElementById('chart-zone-comparison');
      if (zoneCompCtx && sim) {
        this.charts.zoneComparison = new Chart(zoneCompCtx, {
          type: 'bar',
          data: {
            labels: sim.zones.map(z => z.name),
            datasets: [{
              label: 'Current Moisture (%)',
              data: sim.zones.map(z => z.soilMoisture),
              backgroundColor: ['#10b981', '#f59e0b', '#06b6d4', '#a855f7'],
              borderRadius: 6
            }]
          },
          options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 100 } } }
        });
      }

      // 4. FARMER: AI 12-Hour Soil Moisture Forecast Chart
      const aiMoistureCtx = document.getElementById('chart-ai-moisture-forecast');
      if (aiMoistureCtx) {
        this.charts.aiMoisture = new Chart(aiMoistureCtx, {
          type: 'line',
          data: {
            labels: aiMoisture.timestamps,
            datasets: [
              {
                label: 'AI Projected Natural Dryout (%)',
                data: aiMoisture.actualCurve,
                borderColor: '#f43f5e',
                borderDash: [4, 4],
                borderWidth: 2,
                tension: 0.3
              },
              {
                label: 'AI-Optimized Schedule (%)',
                data: aiMoisture.aiOptimizedCurve,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3
              }
            ]
          },
          options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 20, max: 80 } } }
        });
      }

      // 5. ADMIN: 7-Day Efficiency
      const adminSavingsCtx = document.getElementById('chart-admin-savings');
      if (adminSavingsCtx) {
        this.charts.adminSavings = new Chart(adminSavingsCtx, {
          type: 'bar',
          data: {
            labels: adminData.days,
            datasets: [
              { label: 'Smart IoT Water (L)', data: adminData.smartWaterUsed, backgroundColor: '#10b981', borderRadius: 4 },
              { label: 'Conserved Water (L)', data: adminData.waterSaved, backgroundColor: '#0284c7', borderRadius: 4 },
              { label: 'Traditional Timer Baseline (L)', data: adminData.traditionalWater, type: 'line', borderColor: '#ef4444', borderWidth: 2, borderDash: [4, 4] }
            ]
          },
          options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
        });
      }

      // 6. ADMIN: Crop Distribution
      const adminCropCtx = document.getElementById('chart-admin-crops');
      if (adminCropCtx) {
        this.charts.adminCrops = new Chart(adminCropCtx, {
          type: 'doughnut',
          data: {
            labels: adminData.cropDistribution.labels,
            datasets: [{ data: adminData.cropDistribution.percentages, backgroundColor: adminData.cropDistribution.colors }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
        });
      }

      // 7. TECHNICIAN: ADC Oscilloscope
      const techAdcCtx = document.getElementById('chart-tech-adc');
      if (techAdcCtx) {
        this.charts.techAdc = new Chart(techAdcCtx, {
          type: 'line',
          data: {
            labels: techAdc.timestamps,
            datasets: [
              { label: 'Zone 1 Raw ADC (0-4095)', data: techAdc.zone1Raw, borderColor: '#10b981', borderWidth: 2, tension: 0.2 },
              { label: 'Zone 2 Raw ADC (0-4095)', data: techAdc.zone2Raw, borderColor: '#f59e0b', borderWidth: 2, tension: 0.2 }
            ]
          },
          options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 1000, max: 3500 } } }
        });
      }

      // 8. TECHNICIAN: Pump Curve
      const techHydraulicCtx = document.getElementById('chart-tech-hydraulic');
      if (techHydraulicCtx) {
        this.charts.techHydraulic = new Chart(techHydraulicCtx, {
          type: 'line',
          data: {
            labels: ['0 L/m', '5 L/m', '10 L/m', '15 L/m', '20 L/m', '25 L/m'],
            datasets: [
              { label: 'Pump Head Pressure (PSI)', data: [65, 58, 50, 42, 33, 20], borderColor: '#0284c7', backgroundColor: 'rgba(2, 132, 199, 0.15)', fill: true, tension: 0.4 },
              { label: 'Current Operating Duty', data: [null, null, 45.2, null, null, null], pointRadius: 8, pointBackgroundColor: '#ef4444', showLine: false }
            ]
          },
          options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 70 } } }
        });
      }

      // 9. TECHNICIAN: Battery & 3.3V Rail
      const techVoltCtx = document.getElementById('chart-tech-voltage');
      if (techVoltCtx) {
        this.charts.techVoltage = new Chart(techVoltCtx, {
          type: 'line',
          data: {
            labels: ['00h', '04h', '08h', '12h', '16h', '20h'],
            datasets: [
              { label: '12V Solar Battery (V)', data: [12.1, 12.0, 12.4, 13.2, 12.9, 12.6], borderColor: '#10b981', borderWidth: 2.5, tension: 0.3 },
              { label: '3.3V Logic Rail (V)', data: [3.30, 3.29, 3.31, 3.30, 3.29, 3.30], borderColor: '#818cf8', borderWidth: 2, tension: 0.1 }
            ]
          },
          options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 3, max: 15 } } }
        });
      }
    }

    updateLiveCharts(data) {
      if (!this.charts) return;

      if (this.charts.zoneComparison && data.zones) {
        this.charts.zoneComparison.data.datasets[0].data = data.zones.map(z => z.soilMoisture);
        this.charts.zoneComparison.update('none');
      }

      if (this.charts.techAdc && data.adcWaveformBuffer) {
        this.charts.techAdc.data.datasets[0].data = [...data.adcWaveformBuffer.zone1Raw];
        this.charts.techAdc.data.datasets[1].data = [...data.adcWaveformBuffer.zone2Raw];
        this.charts.techAdc.update('none');
      }
    }

    // CHATBOT INTERFACE
    bindChatbot() {
      const chatWidget = document.getElementById('chatbot-widget');
      const chatToggleBtn = document.getElementById('toggle-chat-btn');
      const chatCloseBtn = document.getElementById('close-chat-btn');
      const chatInput = document.getElementById('chat-input');
      const chatSendBtn = document.getElementById('chat-send-btn');
      const voiceToggleBtn = document.getElementById('chat-voice-toggle');

      if (chatToggleBtn && chatWidget) {
        chatToggleBtn.addEventListener('click', () => {
          chatWidget.classList.toggle('hidden');
          if (!chatWidget.classList.contains('hidden') && chatInput) chatInput.focus();
        });
      }

      if (chatCloseBtn && chatWidget) {
        chatCloseBtn.addEventListener('click', () => chatWidget.classList.add('hidden'));
      }

      if (voiceToggleBtn) {
        voiceToggleBtn.addEventListener('click', () => {
          const bot = window.AgriBot;
          bot.isVoiceMuted = !bot.isVoiceMuted;
          voiceToggleBtn.innerHTML = bot.isVoiceMuted ? '🔇 Muted' : '🔊 Voice: ON';
          this.showToast(`Chatbot Voice ${bot.isVoiceMuted ? 'Muted' : 'Enabled'}`, 'info');
        });
      }

      const handleSend = () => {
        const text = chatInput.value.trim();
        if (!text) return;
        chatInput.value = '';

        this.appendChatMessage('user', text);
        this.showTypingIndicator();

        setTimeout(() => {
          this.hideTypingIndicator();
          const response = window.AgriBot.processMessage(text);
          this.appendChatMessage('bot', response.reply, response.actionButtons, response.suggestions);
          window.AgriBot.speak(response.reply);

          if (response.actionExecuted === 'open_valve') this.playChime('valve_open');
          else if (response.actionExecuted === 'stop_all') this.playChime('valve_close');
          else this.playChime('valve_open');
        }, 500);
      };

      if (chatSendBtn) chatSendBtn.addEventListener('click', handleSend);
      if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') handleSend();
        });
      }
    }

    appendChatMessage(sender, text, actionButtons = [], suggestions = []) {
      const container = document.getElementById('chat-messages-container');
      if (!container) return;

      const isBot = sender === 'bot';
      const msgDiv = document.createElement('div');
      msgDiv.className = `flex gap-2.5 ${isBot ? 'justify-start' : 'justify-end'} mb-3`;

      let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br/>');

      let buttonsHtml = '';
      if (actionButtons && actionButtons.length > 0) {
        buttonsHtml = `
          <div class="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-slate-800">
            ${actionButtons.map(b => `
              <button 
                onclick="window.AppController.sendChatAction('${b.command}')" 
                class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-xs transition">
                ${b.label}
              </button>
            `).join('')}
          </div>
        `;
      }

      let suggestionsHtml = '';
      if (suggestions && suggestions.length > 0) {
        suggestionsHtml = `
          <div class="flex flex-wrap gap-1 mt-2">
            ${suggestions.map(s => `
              <button 
                onclick="window.AppController.sendChatAction('${s}')" 
                class="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] rounded-full border border-slate-800 transition">
                ${s}
              </button>
            `).join('')}
          </div>
        `;
      }

      if (isBot) {
        msgDiv.innerHTML = `
          <div class="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
            🤖
          </div>
          <div class="max-w-[85%] bg-slate-900 p-3.5 rounded-2xl rounded-tl-none border border-slate-800 text-xs text-slate-200 shadow-sm">
            <div>${formattedText}</div>
            ${buttonsHtml}
            ${suggestionsHtml}
          </div>
        `;
      } else {
        msgDiv.innerHTML = `
          <div class="max-w-[85%] bg-emerald-600 text-white p-3.5 rounded-2xl rounded-tr-none text-xs shadow-sm">
            <div>${formattedText}</div>
          </div>
          <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0">
            👤
          </div>
        `;
      }

      container.appendChild(msgDiv);
      container.scrollTop = container.scrollHeight;
    }

    sendChatAction(commandText) {
      const input = document.getElementById('chat-input');
      if (input) {
        input.value = commandText;
        const sendBtn = document.getElementById('chat-send-btn');
        if (sendBtn) sendBtn.click();
      }
    }

    showTypingIndicator() {
      const container = document.getElementById('chat-messages-container');
      if (!container) return;
      const indicator = document.createElement('div');
      indicator.id = 'chat-typing-indicator';
      indicator.className = 'flex gap-2 items-center text-xs text-slate-400 p-2';
      indicator.innerHTML = `
        <div class="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px]">🤖</div>
        <div class="flex gap-1 items-center bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
          <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
          <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
          <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
        </div>
      `;
      container.appendChild(indicator);
      container.scrollTop = container.scrollHeight;
    }

    hideTypingIndicator() {
      const indicator = document.getElementById('chat-typing-indicator');
      if (indicator) indicator.remove();
    }

    // SCENARIO SIMULATOR
    bindScenarioControls() {
      const btnRain = document.getElementById('btn-sim-rain');
      const btnHeat = document.getElementById('btn-sim-heat');
      const btnSun = document.getElementById('btn-sim-sunny');
      const btnRefill = document.getElementById('btn-refill-tank');
      const btnEmergencyStop = document.getElementById('btn-emergency-stop');
      const speedSelect = document.getElementById('sim-speed-select');

      if (btnRain) btnRain.addEventListener('click', () => {
        window.IrrigationSimulator.simulateRainstorm();
        this.showToast('🌧️ Simulated Rainstorm event!', 'info');
      });

      if (btnHeat) btnHeat.addEventListener('click', () => {
        window.IrrigationSimulator.simulateHeatwave();
        this.showToast('🔥 Simulated Heatwave event!', 'warning');
      });

      if (btnSun) btnSun.addEventListener('click', () => {
        window.IrrigationSimulator.simulateClearSunny();
        this.showToast('☀️ Normalized weather conditions.', 'info');
      });

      if (btnRefill) btnRefill.addEventListener('click', () => {
        window.IrrigationSimulator.refillTank();
        this.playChime('valve_open');
        this.showToast('💧 Storage reservoir refilled to 100%!', 'success');
      });

      if (btnEmergencyStop) btnEmergencyStop.addEventListener('click', () => {
        window.IrrigationSimulator.stopAllPumps();
        this.playChime('valve_close');
        this.showToast('🛑 Master Pump Emergency Stop Executed!', 'error');
      });

      if (speedSelect) {
        speedSelect.addEventListener('change', (e) => {
          const val = parseFloat(e.target.value);
          window.IrrigationSimulator.setSpeed(val);
        });
      }
    }

    toggleZoneValve(zoneId) {
      const sim = window.IrrigationSimulator;
      const zone = sim.zones.find(z => z.id === zoneId);
      if (!zone) return;

      const isOpening = !zone.valveOpen;
      sim.toggleValve(zoneId);

      if (isOpening) {
        this.playChime('valve_open');
        this.showToast(`Watering started for Zone ${zoneId} (${zone.name})`, 'success');
      } else {
        this.playChime('valve_close');
        this.showToast(`Watering stopped for Zone ${zoneId}`, 'info');
      }
    }

    bindManualControls() {
      const exportBtn = document.getElementById('btn-export-logs');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          const logs = window.IrrigationSimulator.activityLogs;
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
          const dlAnchor = document.createElement('a');
          dlAnchor.setAttribute("href", dataStr);
          dlAnchor.setAttribute("download", `aquasmart_logs_${Date.now()}.json`);
          dlAnchor.click();
          this.showToast('Activity logs exported successfully!', 'success');
        });
      }
    }

    bindProfileForm() {
      const profileForm = document.getElementById('farm-profile-form');
      if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const updated = {
            fullName: document.getElementById('profile-name').value,
            farmName: document.getElementById('profile-farm').value,
            location: document.getElementById('profile-location').value,
            cropType: document.getElementById('profile-crop').value,
            soilType: document.getElementById('profile-soil').value
          };
          const res = window.AuthService.updateProfile(updated);
          if (res.success) {
            this.showToast(res.message, 'success');
          }
        });
      }
    }

    showToast(message, type = 'info') {
      const toast = document.createElement('div');
      let bg = 'bg-slate-900 text-white border border-slate-700';
      if (type === 'success') bg = 'bg-emerald-950 text-emerald-200 border border-emerald-600';
      if (type === 'error') bg = 'bg-rose-950 text-rose-200 border border-rose-600';
      if (type === 'warning') bg = 'bg-amber-950 text-amber-200 border border-amber-600';

      toast.className = `fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl ${bg} text-xs font-semibold flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0`;
      toast.innerHTML = `<span>${type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️')}</span> <span>${message}</span>`;

      document.body.appendChild(toast);

      setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }
  }

  window.AppController = new AppController();
})();
