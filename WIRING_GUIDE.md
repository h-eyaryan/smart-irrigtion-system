# 🔌 AquaSmart IoT Hardware Wiring & Assembly Guide

This guide details the complete hardware circuit schematics, pinout connections, and component bill of materials (BOM) to connect physical sensors and solenoids to an ESP32 microcontroller.

---

## 📦 Component Bill of Materials

| Component | Quantity | Purpose | Operating Voltage |
|-----------|----------|---------|-------------------|
| **ESP32-WROOM-32** | 1 | Main WiFi MCU & Telemetry Processor | 3.3V / 5V USB |
| **Capacitive Soil Moisture Sensors v1.2** | 4 | Corrosion-resistant soil moisture reading | 3.3V |
| **DHT22 (AM2302)** | 1 | Precision Ambient Air Temp & Relative Humidity | 3.3V - 5V |
| **HC-SR04 Ultrasonic Sensor** | 1 | Water Storage Reservoir Level Measurement | 5V |
| **4-Channel 5V Relay Module** | 1 | Optoisolated switching for 12V DC valves & pump | 5V Logic (Active LOW) |
| **12V DC Solenoid Valves** | 4 | Precision water line control per zone | 12V DC |
| **12V DC Submersible Water Pump** | 1 | High pressure water delivery from tank | 12V DC |
| **LM2596 DC-DC Buck Converter** | 1 | Step down 12V supply to 5V for MCU & Sensors | 12V In -> 5V Out |
| **Flyback Diodes (1N4007)** | 5 | Back-EMF inductive spike protection across coils | - |

---

## 📌 Microcontroller Pinout Mappings

### 1. Soil Moisture Sensors (Analog Inputs)
- **Zone 1 (Greenhouse Alpha):** Connect `AOUT` to **GPIO 34** (ADC1_CH6)
- **Zone 2 (North Acre Field):** Connect `AOUT` to **GPIO 35** (ADC1_CH7)
- **Zone 3 (South Orchard):** Connect `AOUT` to **GPIO 32** (ADC1_CH4)
- **Zone 4 (Seedling Nursery):** Connect `AOUT` to **GPIO 33** (ADC1_CH5)
- *VCC to 3.3V, GND to Common Ground.*

> ⚠️ **Note:** Always use **ADC1** pins on ESP32 (GPIOs 32-39) because **ADC2** pins cannot be used concurrently when WiFi is transmitting.

---

### 2. DHT22 Digital Temperature & Humidity
- `VCC` -> **3.3V**
- `DATA` -> **GPIO 4** (with 10kΩ pull-up resistor to 3.3V)
- `GND` -> **GND**

---

### 3. Ultrasonic Reservoir Level Sensor (HC-SR04)
- `VCC` -> **5V**
- `TRIG` -> **GPIO 5**
- `ECHO` -> **GPIO 21** (Use voltage divider: 1kΩ / 2kΩ resistors to step down 5V echo to 3.3V safe logic)
- `GND` -> **GND**

---

### 4. 4-Channel Relay Actuators (Solenoid Valves & Pump)
- `Relay IN1 (Zone 1 Solenoid)` -> **GPIO 16**
- `Relay IN2 (Zone 2 Solenoid)` -> **GPIO 17**
- `Relay IN3 (Zone 3 Solenoid)` -> **GPIO 18**
- `Relay IN4 (Zone 4 Solenoid)` -> **GPIO 19**
- `Relay IN5 / Extra Relay (Main Pump)` -> **GPIO 23**
- `Relay VCC` -> **5V**
- `Relay GND` -> **GND**

---

## ⚡ Power Supply & Safety Schematic

```text
[ 12V 5A Power Adapter ] 
       │
       ├───► [ LM2596 Buck Converter (12V to 5V) ] ───► ESP32 (5V/VIN) & Sensors
       │
       ├───► [ Relay Common Terminals ]
                   │
                   ├── Relay 1 (NO) ──► 12V Solenoid Valve 1 ──► GND
                   ├── Relay 2 (NO) ──► 12V Solenoid Valve 2 ──► GND
                   ├── Relay 3 (NO) ──► 12V Solenoid Valve 3 ──► GND
                   ├── Relay 4 (NO) ──► 12V Solenoid Valve 4 ──► GND
                   └── Relay 5 (NO) ──► 12V Submersible Pump  ──► GND
```

> 🛡️ **Crucial Protection:** Connect a **1N4007 diode** in reverse bias across the terminals of each solenoid valve and the water pump motor. This dissipates inductive flyback voltage spikes when the relay switches off, preventing ESP32 resets.
