/**
 * AquaSmart IoT - AgriBot AI Pro Neural Assistant
 * Powered by AgriBrain-v4 Reasoning Engine
 */

(function () {
  'use strict';

  class AgriBot {
    constructor() {
      this.isVoiceMuted = true;
      this.speechSynth = 'speechSynthesis' in window ? window.speechSynthesis : null;
      this.cropDatabase = {
        tomato: {
          name: 'Tomato (Solanum lycopersicum)',
          minMoisture: 60,
          targetMoisture: 75,
          idealTime: 'Early morning (5:30 AM - 7:30 AM)',
          bestSystem: 'Drip irrigation directly at the root zone',
          waterPerWeek: '25-35 mm (1-1.5 inches)',
          tips: 'Avoid wetting leaves to prevent fungal blight and septoria. Maintain steady moisture during fruiting to prevent blossom end rot and fruit cracking.'
        },
        corn: {
          name: 'Maize / Sweet Corn (Zea mays)',
          minMoisture: 55,
          targetMoisture: 70,
          idealTime: 'Early morning or late afternoon',
          bestSystem: 'Center pivot or overhead sprinklers',
          waterPerWeek: '30-40 mm',
          tips: 'Water is most critical during the tasseling and silking stages. Water stress during pollination drastically cuts yield.'
        },
        wheat: {
          name: 'Wheat & Grain (Triticum aestivum)',
          minMoisture: 45,
          targetMoisture: 65,
          idealTime: 'Morning',
          bestSystem: 'Sprinkler or border strip flood irrigation',
          waterPerWeek: '20-30 mm',
          tips: 'Critical growth stages for watering: Crown root initiation, tillering, jointing, flowering, and grain filling.'
        },
        citrus: {
          name: 'Citrus & Orange (Citrus sinensis)',
          minMoisture: 50,
          targetMoisture: 65,
          idealTime: 'Deep morning soak every 5-7 days',
          bestSystem: 'Micro-sprinklers or low-flow drip bubblers under canopy',
          waterPerWeek: '40-50 mm',
          tips: 'Citrus trees need well-aerated soil. Avoid waterlogging around root crown to eliminate Phytophthora root rot.'
        },
        rice: {
          name: 'Paddy Rice (Oryza sativa)',
          minMoisture: 80,
          targetMoisture: 95,
          idealTime: 'Continuous controlled depth or Alternate Wetting & Drying (AWD)',
          bestSystem: 'Controlled basin / canal flood',
          waterPerWeek: '100+ mm',
          tips: 'Use Alternate Wetting and Drying (AWD) technique to reduce water consumption by up to 30% while reducing methane emissions.'
        },
        potato: {
          name: 'Potato (Solanum tuberosum)',
          minMoisture: 65,
          targetMoisture: 80,
          idealTime: 'Morning',
          bestSystem: 'Drip lines buried 5cm below hill crest',
          waterPerWeek: '25-35 mm',
          tips: 'Consistent moisture is necessary during tuber initiation and bulking to prevent hollow heart, secondary growth, and knobby tubers.'
        },
        strawberry: {
          name: 'Strawberry (Fragaria)',
          minMoisture: 70,
          targetMoisture: 85,
          idealTime: 'Morning',
          bestSystem: 'Subsurface drip under plastic mulch',
          waterPerWeek: '20-25 mm',
          tips: 'Strawberries have shallow roots (top 15-20cm). High frequency, low volume drip irrigation prevents root rot.'
        }
      };
    }

    processMessage(rawText) {
      const text = rawText.trim().toLowerCase();
      const sim = window.IrrigationSimulator;
      const auth = window.AuthService;
      const currentUser = auth ? auth.getCurrentUser() : null;
      const role = currentUser ? currentUser.role : 'farmer';

      // 1. AI AGRIBRAIN GREETING
      if (/^(hi|hello|hey|namaste|greetings|help|who are you|menu|ai)/i.test(text)) {
        const name = currentUser ? currentUser.fullName.split(' ')[0] : 'User';
        return {
          reply: `Hello **${name}**! 🧠 I am **AgriBot AI Pro** (*AgriBrain-v4 Neural Engine*).\n\nHere is how I can optimize your farm today:\n• 🤖 **AI Precision:** *"AI irrigation prescription"*, *"Crop disease scan"*, *"Moisture prediction"*\n• 💧 **Actuators:** *"Water Zone 1"*, *"Stop all pumps"*, *"Refill tank"*\n• 📊 **Telemetry:** *"Check soil moisture"*, *"Tank level"*, *"Weather forecast"*\n• 🔧 **Technician:** *"Hardware nodes"*, *"Run diagnostic"*\n• 👑 **Admin:** *"System stats"*, *"Water savings summary"*`,
          suggestions: ['AI Prescription', 'Crop Disease Scan', 'Check Soil Moisture', 'Water Zone 1', 'Hardware Nodes']
        };
      }

      // 2. AI INTELLIGENCE & PRESCRIPTION
      if (/(ai prescription|prescription|et0|evapotranspiration|recommendation|ai advice)/i.test(text)) {
        const ai = sim.aiEngine;
        return {
          reply: `🧠 **AgriBrain AI Irrigation Prescription:**\n\n• **Atmospheric Demand (ET₀):** ${ai.et0MmDay} mm/day (Penman-Monteith)\n• **Vapor Pressure Deficit (VPD):** ${ai.vpdKpa} kPa (Optimal Transpiration)\n• **Current AI Efficiency Rating:** ${ai.aiEfficiencyScore}\n• **Crop Stress Risk Index:** ${ai.cropStressRisk}\n\n💡 **AI Strategic Recommendation:**\n*${ai.irrigationPrescription}*\n\nWould you like me to execute this schedule?`,
          actionButtons: [
            { label: '⚡ Adopt AI Prescription', command: 'water zone 1' },
            { label: '🔍 Run Crop Disease Scan', command: 'crop disease scan' }
          ],
          suggestions: ['Check Soil Moisture', 'Moisture Prediction', 'Tomato Guide']
        };
      }

      // 3. AI CROP DISEASE SCAN
      if (/(disease|scan|leaf|crop health|blight|rust|pathogen|greening)/i.test(text)) {
        return {
          reply: `🔬 **Agri-Vision AI Plant Pathology Suite:**\n\nI can analyze foliar imagery using our trained neural vision model (97.8% diagnostic accuracy):\n• **Tomato Early Blight** (*Alternaria solani*)\n• **Southern Corn Rust** (*Puccinia polysora*)\n• **Citrus Greening** (*Huanglongbing*)\n• **Vigorous Organic Leaf** (Baseline)\n\n*Head to the "AI Intelligence & Vision" section on the Farmer Dashboard to trigger live neural scanning!*`,
          actionButtons: [
            { label: '🧪 Scan Tomato Blight Sample', command: 'diagnose tomato blight' }
          ],
          suggestions: ['AI Prescription', 'Signs of Overwatering', 'Check Soil Moisture']
        };
      }

      // 4. AI MOISTURE PREDICTION
      if (/(predict|forecast|moisture forecast|future moisture|next 12 hours)/i.test(text)) {
        return {
          reply: `📈 **AI 12-Hour Soil Moisture Forecast:**\n\n• **Zone 1 (Greenhouse):** Expected to drop from 38% to 30.1% over next 12 hours without irrigation.\n• **AI Automated Intervention:** Triggering 12-minute drip cycle at 05:00 AM will maintain optimal 68% root zone moisture.\n• **Neural Confidence Score:** 96.8% (Based on wind, solar radiation, and soil moisture sensor calibration).`,
          suggestions: ['AI Prescription', 'Check Soil Moisture', 'Water Zone 1']
        };
      }

      // 4.5. SMART IRRIGATION CALCULATOR
      if (/(calculate|calculator|how much water do|water requirement|volume calculation|runtime calculation)/i.test(text)) {
        return {
          reply: `🧮 **Smart Irrigation & Water Requirement Calculator:**\n\nI can calculate exact daily crop water volume and pump runtime:\n• **Formula:** $ET_c = ET_0 \\times K_c \\times \\text{SoilFactor} / \\text{Efficiency}$\n• **Default (500m² Tomatoes):** Requires ~**272 Liters/day**\n• **Optimal Drip Runtime:** **22 Minutes**\n\n*Use the interactive calculator on the front dashboard to calculate runtime for your field size and apply it directly to any zone with 1 click!*`,
          actionButtons: [
            { label: '⚡ Water Zone 1 (Calculated 22m)', command: 'water zone 1' }
          ],
          suggestions: ['AI Prescription', 'Weather Forecast', 'Check Soil Moisture']
        };
      }

      // 5. HARDWARE NODES
      if (/(hardware|node|nodes|esp32|gateway|signal|rssi)/i.test(text)) {
        const nodes = sim.hardwareNodes;
        const nodeList = nodes.map(n => `• **${n.id}** (${n.status}): Signal ${n.rssiDb} dBm | Battery ${n.batteryVoltage}V | FW ${n.firmwareVersion}`).join('\n');
        return {
          reply: `🔌 **Hardware Node Fleet Status:**\n\n${nodeList}\n\n*All nodes transmitting over WiFi/MQTT.*`,
          actionButtons: [
            { label: '🧪 Run Actuator Diagnostic', command: 'run diagnostic' }
          ],
          suggestions: ['Run Diagnostic', 'Check Soil Moisture', 'Stop all pumps']
        };
      }

      // 6. DIAGNOSTICS
      if (/(diagnostic|test solenoids|test sensors|run diagnostic)/i.test(text)) {
        return {
          reply: `🧪 **Hardware Diagnostic Suite:**\n\n• **Solenoid Actuators:** 32-36Ω coil impedance test\n• **Capacitive Sensors:** Baseline zero-drift reference\n• **Ultrasonic Tank Sensor:** Echo timing test\n• **Gateway:** Broker ping test`,
          actionButtons: [
            { label: '⚡ Test All Solenoids', command: 'test solenoids' },
            { label: '📡 Test Gateway Ping', command: 'test gateway' }
          ],
          suggestions: ['Hardware Nodes', 'Check Soil Moisture', 'Stop all pumps']
        };
      }

      // 7. ADMIN STATS
      if (/(system stats|statistics|total farms|network|registered)/i.test(text)) {
        const users = auth.getAllUsers();
        const farmers = users.filter(u => u.role === 'farmer');
        return {
          reply: `👑 **Admin Network Operations:**\n\n• **Total Registered Farms:** ${farmers.length}\n• **Active IoT Nodes:** 3 Online\n• **System Uptime:** 99.98%\n• **Smart Rain Skips:** 142 events\n• **Water Saved This Month:** 14.8 Megaliters`,
          suggestions: ['Check Soil Moisture', 'Hardware Nodes', 'AI Prescription']
        };
      }

      // 8. VALVE COMMANDS
      const zoneMatch = text.match(/(?:water|turn on|start|irrigate|open)\s+(?:zone\s*)?([1-4]|greenhouse|north|orchard|nursery)/i);
      if (zoneMatch && !text.includes('stop') && !text.includes('turn off') && !text.includes('close')) {
        let zId = 1;
        const target = zoneMatch[1].toLowerCase();
        if (target === '1' || target.includes('greenhouse')) zId = 1;
        else if (target === '2' || target.includes('north')) zId = 2;
        else if (target === '3' || target.includes('orchard')) zId = 3;
        else if (target === '4' || target.includes('nursery')) zId = 4;

        const zone = sim.zones.find(z => z.id === zId);
        if (zone) {
          const ok = sim.openValve(zId, 'Triggered by AgriBot command');
          if (ok) {
            return {
              reply: `✅ **Actuator Activated:** Opened irrigation valve for **${zone.name}** (${zone.crop}).\n\n• **Current Soil Moisture:** ${zone.soilMoisture}%\n• **Target Moisture:** ${zone.targetThreshold}%\n• **Flow Rate:** ${zone.flowRateLpm} L/min\n• **Pump Status:** ACTIVE ⚡\n\nI will automatically close the valve when optimal moisture is reached.`,
              suggestions: ['Stop all pumps', 'Check Soil Moisture', 'Tank Level'],
              actionExecuted: 'open_valve'
            };
          } else {
            return {
              reply: `⚠️ **Warning:** Could not open valve for **${zone.name}**. Reservoir storage is dangerously low (< 50L).`,
              suggestions: ['Refill Tank', 'Tank Level'],
              actionExecuted: 'error'
            };
          }
        }
      }

      if (/(turn off|stop|shut off|close|halt|kill)\s*(all|pump|pumps|irrigation|valves|water)/i.test(text)) {
        sim.stopAllPumps();
        return {
          reply: `🛑 **Master Shutoff Executed:** All irrigation valves closed and main water pump stopped safely.`,
          suggestions: ['Check Soil Moisture', 'Water Zone 1', 'Tank Level'],
          actionExecuted: 'stop_all'
        };
      }

      // 9. CHECK MOISTURE
      if (/(soil moisture|moisture|dry|humidity in soil|wet)/i.test(text)) {
        let statusList = sim.zones.map(z => {
          let badge = z.soilMoisture < z.minThreshold ? '🔴 DRY (Needs Water)' : (z.soilMoisture >= z.targetThreshold ? '🟢 OPTIMAL' : '🟡 ADEQUATE');
          let valve = z.valveOpen ? '💧 *[Watering Active]*' : '';
          return `• **Zone ${z.id} (${z.name}):** ${z.soilMoisture}% (Raw ADC: ${z.rawAdcValue}) — ${badge} ${valve}`;
        }).join('\n');

        return {
          reply: `📊 **Live Soil Moisture Telemetry:**\n\n${statusList}\n\n*AI Recommendation:* Zone 2 (${sim.zones[1].crop}) is currently lowest at ${sim.zones[1].soilMoisture}%.`,
          actionButtons: [
            { label: '💧 Irrigate Zone 2 Now', command: 'water zone 2' },
            { label: '💧 Irrigate Zone 1', command: 'water zone 1' }
          ],
          suggestions: ['Water Zone 2', 'Tank Level', 'AI Prescription']
        };
      }

      // 10. TANK LEVEL
      if (/(tank|reservoir|water level|how much water|liters left)/i.test(text)) {
        const res = sim.reservoir;
        const daysLeft = Math.round(res.currentLiters / (res.totalWaterUsedToday || 300));
        return {
          reply: `🪣 **Central Water Reservoir Status:**\n\n• **Current Storage:** ${res.currentLiters.toLocaleString()} / ${res.capacityLiters.toLocaleString()} Liters (${res.levelPercentage}%)\n• **Water Used Today:** ${res.totalWaterUsedToday} L\n• **Water Saved via AI Skip:** 💚 ${res.waterSavedToday} L\n• **Line Pressure:** ${res.pressurePsi} PSI\n• **Estimated Reserve:** ~${daysLeft} days remaining.`,
          suggestions: ['Refill Tank', 'Check Soil Moisture', 'Stop all pumps'],
          actionButtons: [
            { label: '🔄 Refill Reservoir to 100%', command: 'refill tank' }
          ]
        };
      }

      // 11. WEATHER
      if (/(weather|rain|forecast|temperature|temp)/i.test(text)) {
        const w = sim.weather;
        return {
          reply: `🌦️ **Farm Weather Station Telemetry:**\n\n• **Condition:** ${w.condition} ${w.icon}\n• **Ambient Temp:** ${w.tempC}°C\n• **Relative Humidity:** ${w.humidity}%\n• **Precipitation Probability:** ${w.rainProbability}%\n• **Solar Radiation:** ${w.solarRadiationW} W/m²`,
          suggestions: ['Simulate Rainstorm', 'Simulate Heatwave', 'Check Soil Moisture']
        };
      }

      // 12. CROP ADVICE
      for (const [key, crop] of Object.entries(this.cropDatabase)) {
        if (text.includes(key)) {
          return {
            reply: `🌱 **Agronomy Guide for ${crop.name}:**\n\n• **Target Soil Moisture:** ${crop.minMoisture}% - ${crop.targetMoisture}%\n• **Best Watering Window:** ${crop.idealTime}\n• **Recommended Irrigation Method:** ${crop.bestSystem}\n• **Typical Requirement:** ${crop.waterPerWeek}\n\n💡 **Expert Agronomist Tip:** ${crop.tips}`,
            suggestions: [`Water for ${crop.name.split(' ')[0]}`, 'AI Prescription', 'Check Soil Moisture']
          };
        }
      }

      // 13. DEFAULT FALLBACK
      return {
        reply: `I understand you are asking about *"AI-driven irrigation and precision agriculture"*. 🌿\n\nYou can ask me directly to:\n• AI Analytics: *"AI irrigation prescription"*, *"Crop disease scan"*, *"Predict moisture"*\n• Control hardware: *"Water Zone 1"*, *"Stop all pumps"*, *"Refill tank"*\n• Live status: *"Check soil moisture"*, *"Show tank level"*, *"Hardware nodes"*`,
        suggestions: ['AI Prescription', 'Check Soil Moisture', 'Water Zone 1', 'Crop Disease Scan']
      };
    }

    speak(text) {
      if (this.isVoiceMuted || !this.speechSynth) return;
      try {
        const cleanText = text.replace(/[*_#`•]/g, '').replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
        this.speechSynth.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.05;
        this.speechSynth.speak(utterance);
      } catch (e) {}
    }
  }

  window.AgriBot = new AgriBot();
})();
