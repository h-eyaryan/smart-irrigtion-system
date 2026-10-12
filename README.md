# 🌾 AquaSmart IoT - Smart Irrigation with AI, Weather Station & Calculator

**AquaSmart IoT** is an enterprise-grade precision agricultural platform featuring a **Pure Black OLED Dark Aesthetic**, **Front-Page Weather Station**, **Smart Irrigation Water & Runtime Calculator**, **Front-Page Precision Zones**, **AgriBrain AI Neural Intelligence**, **Agri-Vision Plant Disease Diagnostics**, and **Role-Based Portals (Farmer, Technician & Admin)**.

---

## 🌟 What's New on the Front Dashboard

### 1. 🌦️ Live Farm Weather Station (Front Page)
- **Real-Time Meteorological Metrics**:
  - 🌡️ **Ambient Temperature**: Live dynamic temperature reading (`28.5°C`).
  - 💧 **Relative Humidity**: Real-time atmospheric moisture (`48%`).
  - 💨 **Wind Velocity**: Field wind speed (`11 km/h`).
  - ☀️ **Solar Radiation**: Pyranometer solar flux (`750 W/m²`).
  - 🌧️ **Precipitation Probability**: Live rain probability (`15%`).
  - 🛡️ **Smart Rain Skip Status**: Real-time badge (`ARMED: Auto-Skip when rain > 65%`).
- **1-Click Weather Simulators**: Inject **Rainstorm**, **Heatwave**, or **Mild Sun** scenarios with instant automated pump reactions.

---

### 2. 🧮 Smart Irrigation & Water Requirement Calculator (Front Page)
- **Scientific Agronomy Engine**: Calculates daily crop water requirement volume ($L\text{/day}$) and optimal pump runtime ($minutes$) in real-time.
- **Dynamic Inputs**:
  - **Crop Selection**: Beefsteak Tomatoes ($K_c: 1.15$), Sweet Corn ($K_c: 1.10$), Wheat ($K_c: 0.85$), Citrus ($K_c: 0.70$), Microgreens ($K_c: 0.95$), Vineyard Grapes ($K_c: 0.65$), Mixed Veggies ($K_c: 1.00$).
  - **Field / Zone Area**: Number input with unit toggle ($m^2$ or Acres).
  - **Soil Texture Profile**: Loam (Balanced), Sandy (+20% volume, high drainage), Clay (-12% volume, high retention).
  - **Emitter Hardware**: Precision Drip ($6.2\text{ L/min}$, 92% efficiency), Overhead Sprinklers ($14.5\text{ L/min}$, 75% efficiency), Micro-Misting ($4.5\text{ L/min}$, 85% efficiency).
- **Instant Calculated Results HUD**:
  - 💧 **Daily Water Need**: Exact liters required for the field area.
  - ⏱️ **Optimal Pump Runtime**: Minutes required for the chosen emitter flow rate.
  - 💰 **Monthly Utility Cost**: Estimated water and energy cost.
  - 🌿 **Water Conserved vs Flood**: Liters saved daily.
- **⚡ 1-Click Apply Button**:
  - Select any target zone (Zone 1 to Zone 4) and click **"Apply & Start Cycle"** to immediately initiate the calculated irrigation runtime!

---

### 3. 💧 Front-Page Irrigation Zones & Quick Actions
- All **4 Precision Irrigation Zones** are prominently displayed on the front page:
  - **Zone 1: Greenhouse Alpha** (Tomatoes — Drip)
  - **Zone 2: North Acre Field** (Sweet Corn — Sprinklers)
  - **Zone 3: South Orchard** (Citrus — Micro-Bubblers)
  - **Zone 4: Seedling Nursery** (Microgreens — Misting)
- **Quick Timed Watering Buttons**:
  - `[💧 5m]`: Water for 5 minutes.
  - `[💧 10m]`: Water for 10 minutes.
  - `[💧 15m]`: Water for 15 minutes.
  - `[🛑 Stop Valve]`: Emergency close.
- Displays soil moisture progress gauge, target thresholds, soil temperature, real-time flow rate, and total liters delivered today.

---

### 4. 🧠 AgriBrain AI & Agri-Vision Plant Disease Diagnostics
- **Agri-Vision AI Leaf Scanner**: Scan tomato blight, corn rust, citrus greening, or healthy leaves with neural laser scan animation and confidence scores.
- **Penman-Monteith Evapotranspiration ($ET_0 = 4.35\text{ mm/d}$)** and Vapor Pressure Deficit ($VPD = 1.48\text{ kPa}$).
- **AI 12-Hour Moisture Forecast Graph**.
- **AgriBot AI Pro**: Interactive conversational assistant with voice synthesis.

---

### 5. 👥 Bottom Portal Navigation Dock (Farmer, Technician & Admin)
- Located in a **sleek fixed bottom navigation dock** at the bottom of the viewport for rapid one-touch switching between roles:
  - **👨‍🌾 Farmer Portal**: Weather Station, Scientific Calculator, 4 Precision Zones, AI Neural Hub, Fluid Tank Reservoir & Irrigation Logs.
  - **🔧 Technician Portal**: ESP32 fleet health (RSSI, battery, 3.3V), 1-click diagnostic suite (solenoids, ADC sensors, ultrasonic echo, MQTT ping), live ADC oscilloscope, OTA firmware updater.
  - **👑 Admin Portal**: Multi-farm network registry, 7-day efficiency comparison, crop allocation doughnut chart, user management (Toggle/Delete), global drought quota enforcement.

---

## 🔑 Login Credentials

The instant bypass demo buttons have been replaced with standard credential-based authentication. Enter any of the pre-configured accounts or use the **"Register New Account"** tab:

| Role | Name | Email | Password |
|---|---|---|---|
| 👨‍🌾 **Farmer** | Farmer John Miller | `demo@farm.com` | `farm123` |
| 🔧 **Technician** | Alex Vance (IoT Lead) | `tech@farm.com` | `tech123` |
| 👑 **Admin** | Sarah Connor (Director) | `admin@farm.com` | `admin123` |

---

## 🚀 How to Run

1. Double-click [**`start.bat`**](file:///c:/Users/HP/OneDrive/Desktop/2/start.bat) *(or open [**`index.html`**](file:///c:/Users/HP/OneDrive/Desktop/2/index.html) directly in any browser)*.
2. Enter your email and password (e.g. `demo@farm.com` / `farm123`) or register a new profile.
3. Switch between **Farmer**, **Technician**, and **Admin** portals anytime using the **fixed bottom navigation dock**!
4. Explore the **Front Weather Station**, run the **Irrigation Calculator**, and chat with **AgriBot AI**!
