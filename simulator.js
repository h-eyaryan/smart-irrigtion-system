/**
 * AquaSmart IoT - Telemetry & Sensor Simulation Engine
 * Integrated with AI Evapotranspiration Engine, AI Moisture Predictor,
 * AI Vision Plant Disease Diagnostics, and Hardware Fleet Telemetry.
 */

(function () {
  'use strict';

  class IrrigationSimulator {
    constructor() {
      this.speedMultiplier = 1;
      this.isRunning = true;
      this.autoModeGlobal = true;
      this.smartRainSkip = true;

      // Central Reservoir & Pump Status
      this.reservoir = {
        capacityLiters: 6000,
        currentLiters: 4850,
        levelPercentage: 80.8,
        mainPumpActive: false,
        pressurePsi: 45.2,
        pumpHealth: 'Optimal',
        totalWaterUsedToday: 412,
        waterSavedToday: 260
      };

      // Environmental Weather Station
      this.weather = {
        condition: 'Sunny',
        icon: '☀️',
        tempC: 28.5,
        humidity: 48,
        rainProbability: 15,
        windSpeedKmh: 11,
        solarRadiationW: 750,
        rainDetected: false,
        forecast: 'Clear skies through afternoon. 15% chance of late evening breeze.'
      };

      // 4 Precision Irrigation Zones
      this.zones = [
        {
          id: 1,
          name: 'Greenhouse Alpha',
          crop: 'Organic Beefsteak Tomatoes',
          irrigationType: 'Precision Drip Line',
          soilType: 'Loam Soil',
          areaSqMeters: 650,
          soilMoisture: 38,
          soilTemp: 22.4,
          airTemp: 26.8,
          airHumidity: 58,
          minThreshold: 35,
          targetThreshold: 72,
          valveOpen: false,
          flowRateLpm: 0,
          rawAdcValue: 2450,
          autoMode: true,
          waterUsedToday: 135,
          lastWatered: 'Today, 06:15 AM',
          status: 'Optimal'
        },
        {
          id: 2,
          name: 'North Acre Field',
          crop: 'Sweet Corn & Grain',
          irrigationType: 'Overhead Rotor Sprinklers',
          soilType: 'Sandy Loam',
          areaSqMeters: 1400,
          soilMoisture: 29,
          soilTemp: 24.1,
          airTemp: 28.5,
          airHumidity: 45,
          minThreshold: 32,
          targetThreshold: 68,
          valveOpen: false,
          flowRateLpm: 0,
          rawAdcValue: 2890,
          autoMode: true,
          waterUsedToday: 180,
          lastWatered: 'Yesterday, 07:00 PM',
          status: 'Needs Water'
        },
        {
          id: 3,
          name: 'South Orchard',
          crop: 'Valencia Orange & Citrus',
          irrigationType: 'Micro-Bubbler Emitters',
          soilType: 'Clay Loam',
          areaSqMeters: 980,
          soilMoisture: 52,
          soilTemp: 21.8,
          airTemp: 27.9,
          airHumidity: 50,
          minThreshold: 30,
          targetThreshold: 65,
          valveOpen: false,
          flowRateLpm: 0,
          rawAdcValue: 1980,
          autoMode: true,
          waterUsedToday: 97,
          lastWatered: 'Today, 05:40 AM',
          status: 'Adequate'
        },
        {
          id: 4,
          name: 'Seedling Nursery',
          crop: 'Microgreens & Herbs',
          irrigationType: 'Ultrasonic Fine Misting',
          soilType: 'Peat / Perlite Mix',
          areaSqMeters: 280,
          soilMoisture: 68,
          soilTemp: 21.0,
          airTemp: 25.2,
          airHumidity: 70,
          minThreshold: 45,
          targetThreshold: 80,
          valveOpen: false,
          flowRateLpm: 0,
          rawAdcValue: 1540,
          autoMode: true,
          waterUsedToday: 42,
          lastWatered: 'Today, 09:30 AM',
          status: 'Optimal'
        }
      ];

      // ===================================
      // AI INTELLIGENCE & AGRONOMY ENGINE
      // ===================================
      this.aiEngine = {
        modelName: 'AgriBrain-v4 Neural Engine',
        et0MmDay: 4.35, // Penman-Monteith Evapotranspiration
        vpdKpa: 1.48, // Vapor Pressure Deficit
        aiEfficiencyScore: '94.6%',
        irrigationPrescription: 'AI advises shifting Zone 2 watering to 05:30 AM tomorrow. Low night transpiration will save ~48 Liters with zero crop water stress.',
        cropStressRisk: 'Low (0.12)',
        predictionConfidence: 96.8
      };

      // AI 12-Hour Soil Moisture Forecast Curve
      this.aiMoistureForecast = {
        timestamps: ['Now', '+2h', '+4h', '+6h', '+8h', '+10h', '+12h'],
        actualCurve: [38, 36.8, 35.5, 34.1, 32.8, 31.4, 30.1],
        aiOptimizedCurve: [38, 37.5, 68.0, 66.2, 64.0, 62.1, 60.5]
      };

      // AI Vision Crop Disease Diagnostic Database
      this.cropDiseaseSamples = [
        {
          id: 'tomato_blight',
          crop: 'Tomato',
          sampleName: 'Early Blight (Alternaria solani)',
          imageEmoji: '🍅',
          confidence: 97.8,
          severity: 'Moderate Infection',
          pathogen: 'Fungal Ascomycota',
          leafImage: 'https://images.unsplash.com/photo-1592417817098-8f3d69106093?auto=format&fit=crop&w=400&q=80',
          diagnosis: 'Concentric dark target-board rings detected on lower foliar margins.',
          prescription: 'Apply organic copper sulfate or Bacillus subtilis. CRITICAL IRRIGATION ADVICE: Avoid overhead sprinklers; switch to root drip irrigation to halt spore germination.'
        },
        {
          id: 'corn_rust',
          crop: 'Sweet Corn',
          sampleName: 'Southern Corn Rust (Puccinia polysora)',
          imageEmoji: '🌽',
          confidence: 96.4,
          severity: 'Early Warning',
          pathogen: 'Basidiomycete Fungus',
          leafImage: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=400&q=80',
          diagnosis: 'Raised circular orange-cinnamon pustules primarily on upper leaf lamina.',
          prescription: 'Apply triazole / strobilurin fungicide. Water management: Halt irrigation between 11:00 AM - 04:00 PM to reduce ambient leaf canopy humidity.'
        },
        {
          id: 'citrus_greening',
          crop: 'Valencia Orange',
          sampleName: 'Citrus Greening (Huanglongbing)',
          imageEmoji: '🍊',
          confidence: 94.2,
          severity: 'High Priority',
          pathogen: 'Candidatus Liberibacter asiaticus',
          leafImage: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=400&q=80',
          diagnosis: 'Asymmetric blotchy mottle chlorosis with yellowing veins crossing lateral veins.',
          prescription: 'Prune affected branches. Apply foliar zinc, iron, and potassium chelates. Prevent root water-logging with automated moisture cutoff at 65%.'
        },
        {
          id: 'healthy_leaf',
          crop: 'Organic Tomato',
          sampleName: 'Healthy Vigorous Leaf (No Disease)',
          imageEmoji: '🌿',
          confidence: 99.4,
          severity: 'Thriving (Zero Pathogen)',
          pathogen: 'None',
          leafImage: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=400&q=80',
          diagnosis: 'Uniform chlorophyll distribution, optimal cellular turgor, zero necrosis.',
          prescription: 'Leaf health and cellular respiration are exceptional. Maintain current AI-optimized drip irrigation rate (45 L/day).'
        }
      ];

      // ===================================
      // TECHNICIAN HARDWARE TELEMETRY
      // ===================================
      this.hardwareNodes = [
        {
          id: 'NODE-ESP32-01',
          name: 'Primary Gateway & Greenhouse Controller',
          ipAddress: '192.168.1.101',
          macAddress: '24:6F:28:B4:7A:1C',
          firmwareVersion: 'v2.4.2-prod',
          status: 'Online',
          rssiDb: -64,
          batteryVoltage: 12.6,
          railVoltage3v3: 3.29,
          uptimeHours: 1042,
          packetLossPct: 0.12,
          temperatureC: 34.2,
          zonesControlled: 'Zone 1, Zone 2',
          activeRelays: 0
        },
        {
          id: 'NODE-ESP32-02',
          name: 'Field Node: Orchard & Nursery Controller',
          ipAddress: '192.168.1.102',
          macAddress: '24:6F:28:C8:9E:44',
          firmwareVersion: 'v2.4.2-prod',
          status: 'Online',
          rssiDb: -73,
          batteryVoltage: 12.3,
          railVoltage3v3: 3.31,
          uptimeHours: 512,
          packetLossPct: 0.45,
          temperatureC: 37.1,
          zonesControlled: 'Zone 3, Zone 4',
          activeRelays: 0
        },
        {
          id: 'NODE-ESP32-03',
          name: 'Deep Well Auxiliary Pump Station',
          ipAddress: '192.168.1.103',
          macAddress: '24:6F:28:DF:11:82',
          firmwareVersion: 'v2.4.0-legacy',
          status: 'Standby',
          rssiDb: -81,
          batteryVoltage: 12.9,
          railVoltage3v3: 3.30,
          uptimeHours: 240,
          packetLossPct: 0.88,
          temperatureC: 31.8,
          zonesControlled: 'Reservoir Inflow Valve',
          activeRelays: 0
        }
      ];

      this.adcWaveformBuffer = {
        timestamps: ['0s', '2s', '4s', '6s', '8s', '10s', '12s', '14s', '16s', '18s'],
        zone1Raw: [2450, 2462, 2448, 2455, 2470, 2458, 2445, 2452, 2465, 2450],
        zone2Raw: [2890, 2885, 2902, 2894, 2880, 2899, 2910, 2895, 2888, 2892],
        batteryCurve: [12.6, 12.58, 12.61, 12.59, 12.62, 12.60, 12.59, 12.63, 12.61, 12.60]
      };

      this.maintenanceTickets = [
        {
          id: 'TCK-108',
          nodeId: 'NODE-ESP32-01',
          component: 'Zone 2 Solenoid Valve',
          title: 'Minor weeping at brass threaded connector',
          priority: 'Medium',
          status: 'Open',
          reportedAt: '2026-10-10 14:20',
          assignee: 'Alex Vance'
        },
        {
          id: 'TCK-109',
          nodeId: 'NODE-ESP32-02',
          component: 'Sensor 3 Capacitive Blade',
          title: 'Re-calibrate analog zero-drift baseline post soil tilling',
          priority: 'Low',
          status: 'In Progress',
          reportedAt: '2026-10-11 09:15',
          assignee: 'Alex Vance'
        },
        {
          id: 'TCK-110',
          nodeId: 'NODE-ESP32-03',
          component: 'HC-SR04 Ultrasonic Sensor',
          title: 'Clean ultrasonic transducer mesh from mineral dusting',
          priority: 'High',
          status: 'Resolved',
          reportedAt: '2026-10-09 11:40',
          assignee: 'Alex Vance'
        }
      ];

      this.activityLogs = [
        {
          id: 101,
          timestamp: new Date(Date.now() - 3600000 * 3).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toLocaleDateString(),
          type: 'auto',
          zoneId: 1,
          zoneName: 'Greenhouse Alpha',
          message: 'Automated Drip Cycle completed. Delivered 45L. Moisture reached 71%.',
          severity: 'success',
          liters: 45
        },
        {
          id: 102,
          timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toLocaleDateString(),
          type: 'weather',
          zoneId: null,
          zoneName: 'Central Station',
          message: 'Smart Weather Advisor: Rain forecast reduced by 20%. Soil evaporation rate calculated at 1.4 mm/day.',
          severity: 'info',
          liters: 0
        },
        {
          id: 103,
          timestamp: new Date(Date.now() - 3600000 * 1).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toLocaleDateString(),
          type: 'schedule',
          zoneId: 4,
          zoneName: 'Seedling Nursery',
          message: 'Scheduled 5-minute fine misting cycle completed. Humidity maintained above 68%.',
          severity: 'success',
          liters: 12
        }
      ];

      this.historyData = this.generateInitialHistory();
      this.adminAnalyticsData = this.generateAdminAnalytics();

      this.timerInterval = setInterval(() => this.tick(), 2500);
    }

    generateInitialHistory() {
      const hours = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
      return {
        labels: hours,
        avgMoisture: [54, 52, 68, 62, 53, 44, 49, 47],
        waterConsumption: [0, 15, 120, 85, 30, 45, 117, 0],
        temperature: [18, 17, 20, 26, 31, 32, 28, 22]
      };
    }

    generateAdminAnalytics() {
      return {
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        traditionalWater: [3400, 3600, 3800, 3500, 3700, 3900, 3650],
        smartWaterUsed: [2100, 2050, 2300, 1950, 2150, 2250, 2080],
        waterSaved: [1300, 1550, 1500, 1550, 1550, 1650, 1570],
        cropDistribution: {
          labels: ['Tomatoes & Veggies', 'Vineyard Grapes', 'Sweet Corn & Grain', 'Orchard Citrus', 'Nursery Greens'],
          percentages: [32, 28, 22, 12, 6],
          colors: ['#10b981', '#8b5cf6', '#f59e0b', '#0284c7', '#06b6d4']
        }
      };
    }

    tick() {
      if (!this.isRunning) return;

      let anyValveOpen = false;

      this.zones.forEach(zone => {
        if (!zone.valveOpen) {
          const evaporationRate = (0.12 + (this.weather.tempC - 20) * 0.015) * this.speedMultiplier;
          zone.soilMoisture = Math.max(12, +(zone.soilMoisture - evaporationRate).toFixed(1));
        } else {
          anyValveOpen = true;
          const wateringRate = 1.6 * this.speedMultiplier;
          zone.soilMoisture = Math.min(95, +(zone.soilMoisture + wateringRate).toFixed(1));

          const consumed = +(0.8 * this.speedMultiplier).toFixed(2);
          if (this.reservoir.currentLiters > consumed) {
            this.reservoir.currentLiters = Math.max(0, +(this.reservoir.currentLiters - consumed).toFixed(1));
            zone.waterUsedToday = +(zone.waterUsedToday + consumed).toFixed(1);
            this.reservoir.totalWaterUsedToday = +(this.reservoir.totalWaterUsedToday + consumed).toFixed(1);
          } else {
            this.closeValve(zone.id, 'Water tank depleted! Valve closed automatically to protect pump.');
            this.reservoir.mainPumpActive = false;
          }

          if (zone.soilMoisture >= zone.targetThreshold) {
            this.closeValve(zone.id, `Target soil moisture (${zone.targetThreshold}%) reached for ${zone.name}.`);
          }
        }

        const baseAdc = Math.round(3200 - (zone.soilMoisture / 100) * 1800);
        const noise = Math.round((Math.random() - 0.5) * 18);
        zone.rawAdcValue = baseAdc + noise;

        if (this.autoModeGlobal && zone.autoMode && !zone.valveOpen) {
          if (zone.soilMoisture < zone.minThreshold) {
            if (this.smartRainSkip && this.weather.rainProbability >= 65) {
              this.reservoir.waterSavedToday = +(this.reservoir.waterSavedToday + 0.3 * this.speedMultiplier).toFixed(1);
              zone.status = 'Rain Skip Active';
            } else if (this.reservoir.currentLiters > 100) {
              this.openValve(zone.id, `Auto-irrigation triggered: moisture dropped to ${zone.soilMoisture}%.`);
            }
          }
        }

        if (zone.valveOpen) {
          zone.status = 'Watering Active 💧';
        } else if (zone.soilMoisture < zone.minThreshold) {
          zone.status = 'Critically Dry ⚠️';
        } else if (zone.soilMoisture > zone.targetThreshold - 5) {
          zone.status = 'Saturated / Moist';
        } else {
          zone.status = 'Optimal Moisture';
        }
      });

      this.reservoir.mainPumpActive = anyValveOpen;
      this.reservoir.levelPercentage = +((this.reservoir.currentLiters / this.reservoir.capacityLiters) * 100).toFixed(1);

      if (this.reservoir.mainPumpActive) {
        this.reservoir.pressurePsi = +(44 + Math.random() * 4).toFixed(1);
      } else {
        this.reservoir.pressurePsi = +(20 + Math.random() * 2).toFixed(1);
      }

      this.weather.tempC = +(this.weather.tempC + (Math.random() - 0.5) * 0.1).toFixed(1);

      // Shift Technician ADC Oscilloscope buffer
      const newZone1 = this.zones[0].rawAdcValue;
      const newZone2 = this.zones[1].rawAdcValue;
      const newBat = +(12.55 + (Math.random() - 0.5) * 0.1).toFixed(2);

      this.adcWaveformBuffer.zone1Raw.push(newZone1);
      this.adcWaveformBuffer.zone1Raw.shift();
      this.adcWaveformBuffer.zone2Raw.push(newZone2);
      this.adcWaveformBuffer.zone2Raw.shift();
      this.adcWaveformBuffer.batteryCurve.push(newBat);
      this.adcWaveformBuffer.batteryCurve.shift();

      this.dispatchUpdate();
    }

    openValve(zoneId, reason = 'Manual switch triggered') {
      const zone = this.zones.find(z => z.id === zoneId);
      if (!zone) return false;

      if (this.reservoir.currentLiters < 50) {
        this.logEvent('alert', zoneId, zone.name, 'Cannot start irrigation: Reservoir tank level is dangerously low (< 50L)!');
        return false;
      }

      zone.valveOpen = true;
      zone.flowRateLpm = zone.irrigationType.includes('Sprinkler') ? 14.5 : 6.2;
      zone.lastWatered = 'Just now';
      this.reservoir.mainPumpActive = true;

      const node = zoneId <= 2 ? this.hardwareNodes[0] : this.hardwareNodes[1];
      node.activeRelays = (node.activeRelays || 0) + 1;

      this.logEvent('success', zoneId, zone.name, `Pump Valve OPEN. ${reason}`);
      this.dispatchUpdate();
      return true;
    }

    closeValve(zoneId, reason = 'Manual stop') {
      const zone = this.zones.find(z => z.id === zoneId);
      if (!zone) return false;

      zone.valveOpen = false;
      zone.flowRateLpm = 0;

      const anyOtherRunning = this.zones.some(z => z.id !== zoneId && z.valveOpen);
      if (!anyOtherRunning) {
        this.reservoir.mainPumpActive = false;
      }

      const node = zoneId <= 2 ? this.hardwareNodes[0] : this.hardwareNodes[1];
      node.activeRelays = Math.max(0, (node.activeRelays || 1) - 1);

      this.logEvent('info', zoneId, zone.name, `Pump Valve CLOSED. ${reason}`);
      this.dispatchUpdate();
      return true;
    }

    toggleValve(zoneId) {
      const zone = this.zones.find(z => z.id === zoneId);
      if (!zone) return false;
      if (zone.valveOpen) {
        return this.closeValve(zoneId);
      } else {
        return this.openValve(zoneId);
      }
    }

    stopAllPumps() {
      this.zones.forEach(z => {
        z.valveOpen = false;
        z.flowRateLpm = 0;
      });
      this.reservoir.mainPumpActive = false;
      this.hardwareNodes.forEach(n => n.activeRelays = 0);
      this.logEvent('warning', null, 'Emergency Master Switch', 'All irrigation valves and pump halted immediately.');
      this.dispatchUpdate();
    }

    refillTank() {
      this.reservoir.currentLiters = this.reservoir.capacityLiters;
      this.reservoir.levelPercentage = 100;
      this.logEvent('success', null, 'Central Reservoir', 'Water storage tank refilled to 100% capacity (6,000 Liters).');
      this.dispatchUpdate();
    }

    // AI Diagnostics Simulation
    runAiScan(sampleId) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const sample = this.cropDiseaseSamples.find(s => s.id === sampleId) || this.cropDiseaseSamples[0];
          this.logEvent('info', null, 'Agri-Vision AI', `Neural scan complete for ${sample.sampleName} (Confidence: ${sample.confidence}%).`);
          resolve(sample);
        }, 1200);
      });
    }

    runDiagnosticTest(testType) {
      return new Promise((resolve) => {
        setTimeout(() => {
          let result = {};
          if (testType === 'solenoids') {
            result = {
              title: 'Solenoid Actuator Coil Impedance Test',
              status: 'PASS',
              details: 'All 4 coils measured within normal 32Ω - 36Ω nominal impedance. Optocoupler latch latency: 12ms. Zero back-EMF spike detected.',
              healthScore: '99%'
            };
          } else if (testType === 'sensors') {
            result = {
              title: 'Capacitive ADC Sensor Calibration Loop',
              status: 'PASS',
              details: 'Analog baseline within 5mV reference. Zero oxidation detected on capacitive PCB traces. SNR: 38dB.',
              healthScore: '97%'
            };
          } else if (testType === 'ultrasonic') {
            result = {
              title: 'HC-SR04 Ultrasonic Echo Timing Test',
              status: 'PASS',
              details: 'Ping acoustic flight time: 8.82ms. Calculated reservoir depth: 150.0cm. Level accuracy ±0.4cm.',
              healthScore: '100%'
            };
          } else if (testType === 'network') {
            result = {
              title: 'Gateway Ping & MQTT Broker Connectivity',
              status: 'PASS',
              details: 'Broker latency: 24ms. TLS 1.3 handshake verified. Packet delivery rate: 99.88%.',
              healthScore: '100%'
            };
          }
          this.logEvent('info', null, 'Diagnostic Tool', `${result.title}: ${result.status} (${result.healthScore})`);
          resolve(result);
        }, 800);
      });
    }

    createTicket(title, nodeId, component, priority) {
      const newTicket = {
        id: 'TCK-' + Math.floor(100 + Math.random() * 900),
        nodeId: nodeId || 'NODE-ESP32-01',
        component: component || 'Hardware Actuator',
        title: title || 'Field Service Request',
        priority: priority || 'Medium',
        status: 'Open',
        reportedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        assignee: 'Alex Vance'
      };
      this.maintenanceTickets.unshift(newTicket);
      this.logEvent('warning', null, 'Maintenance Dispatch', `New ticket created: ${newTicket.id} - ${newTicket.title}`);
      this.dispatchUpdate();
      return newTicket;
    }

    resolveTicket(ticketId) {
      const ticket = this.maintenanceTickets.find(t => t.id === ticketId);
      if (ticket) {
        ticket.status = 'Resolved';
        this.logEvent('success', null, 'Maintenance Dispatch', `Ticket ${ticketId} resolved and signed off.`);
        this.dispatchUpdate();
        return true;
      }
      return false;
    }

    simulateRainstorm() {
      this.weather.condition = 'Heavy Rain';
      this.weather.icon = '⛈️';
      this.weather.tempC = 19.5;
      this.weather.humidity = 92;
      this.weather.rainProbability = 95;
      this.weather.rainDetected = true;
      this.weather.forecast = 'Active rainstorm over farm. Rain sensor reading: 18mm/hr.';

      this.zones.forEach(z => {
        if (!z.name.includes('Greenhouse')) {
          z.soilMoisture = Math.min(92, +(z.soilMoisture + 25).toFixed(1));
        }
      });

      this.reservoir.currentLiters = Math.min(this.reservoir.capacityLiters, this.reservoir.currentLiters + 800);
      this.reservoir.waterSavedToday += 350;

      this.logEvent('weather', null, 'Weather Station', 'Rainstorm detected! Natural precipitation recharging soil. Rainwater harvesting active (+800L).');
      this.dispatchUpdate();
    }

    simulateHeatwave() {
      this.weather.condition = 'Heatwave / Drought';
      this.weather.icon = '🔥';
      this.weather.tempC = 38.5;
      this.weather.humidity = 22;
      this.weather.rainProbability = 0;
      this.weather.rainDetected = false;
      this.weather.forecast = 'Extreme heat warning. High evapotranspiration risk.';

      this.zones.forEach(z => {
        z.soilMoisture = Math.max(15, +(z.soilMoisture - 18).toFixed(1));
      });

      this.logEvent('alert', null, 'Weather Station', 'Heatwave advisory: High evaporation detected. Moisture levels dropping quickly.');
      this.dispatchUpdate();
    }

    simulateClearSunny() {
      this.weather.condition = 'Sunny & Warm';
      this.weather.icon = '☀️';
      this.weather.tempC = 27.0;
      this.weather.humidity = 50;
      this.weather.rainProbability = 10;
      this.weather.rainDetected = false;
      this.weather.forecast = 'Clear skies, optimal conditions for crop photosynthesis.';
      this.logEvent('info', null, 'Weather Station', 'Weather normalized to mild sunny conditions.');
      this.dispatchUpdate();
    }

    logEvent(severity, zoneId, zoneName, message) {
      const newEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        date: new Date().toLocaleDateString(),
        type: severity,
        zoneId: zoneId,
        zoneName: zoneName || 'System',
        message: message,
        severity: severity,
        liters: zoneId ? (this.zones.find(z => z.id === zoneId)?.flowRateLpm || 0) : 0
      };

      this.activityLogs.unshift(newEntry);
      if (this.activityLogs.length > 60) this.activityLogs.pop();
    }

    setSpeed(mult) {
      this.speedMultiplier = mult;
      this.logEvent('info', null, 'System', `Simulation speed set to ${mult}x.`);
    }

    dispatchUpdate() {
      window.dispatchEvent(new CustomEvent('aqua:telemetry-update', {
        detail: {
          zones: this.zones,
          reservoir: this.reservoir,
          weather: this.weather,
          aiEngine: this.aiEngine,
          aiMoistureForecast: this.aiMoistureForecast,
          cropDiseaseSamples: this.cropDiseaseSamples,
          hardwareNodes: this.hardwareNodes,
          adcWaveformBuffer: this.adcWaveformBuffer,
          maintenanceTickets: this.maintenanceTickets,
          activityLogs: this.activityLogs,
          autoModeGlobal: this.autoModeGlobal,
          smartRainSkip: this.smartRainSkip,
          historyData: this.historyData,
          adminAnalyticsData: this.adminAnalyticsData
        }
      }));
    }
  }

  window.IrrigationSimulator = new IrrigationSimulator();
})();
