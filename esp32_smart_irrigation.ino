/**
 * AquaSmart IoT - ESP32 Smart Irrigation System Firmware
 * Real-world Microcontroller Code for ESP32-WROOM-32
 * 
 * Hardware Requirements:
 * - 1x ESP32 Development Board
 * - 4x Capacitive Soil Moisture Sensors v1.2 (Corrosion resistant)
 * - 1x DHT22 Temperature & Humidity Sensor
 * - 1x HC-SR04 Ultrasonic Water Level Sensor
 * - 1x 4-Channel 5V Optocoupler Relay Module
 * - 4x 12V DC Solenoid Valves
 * - 1x 12V Submersible Water Pump & Buck Converter (12V to 5V)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// --- WiFi Credentials ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// --- Cloud / Local Server Endpoint ---
const char* serverUrl = "http://192.168.1.100:8000/api/telemetry";

// --- Pin Definitions ---
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// Capacitive Soil Moisture Sensors (Analog ADC Pins)
const int SOIL_PIN_ZONE1 = 34;
const int SOIL_PIN_ZONE2 = 35;
const int SOIL_PIN_ZONE3 = 32;
const int SOIL_PIN_ZONE4 = 33;

// 4-Channel Relay Control Pins (Active LOW)
const int RELAY_PIN_VALVE1 = 16;
const int RELAY_PIN_VALVE2 = 17;
const int RELAY_PIN_VALVE3 = 18;
const int RELAY_PIN_VALVE4 = 19;
const int RELAY_PIN_MAIN_PUMP = 23;

// HC-SR04 Ultrasonic Reservoir Level Pins
const int TRIG_PIN = 5;
const int ECHO_PIN = 21;
const float TANK_MAX_DEPTH_CM = 150.0; // Empty distance

// Moisture Calibration Constants (Air = ~3200, Water = ~1400 on ESP32 12-bit ADC)
const int AIR_VALUE = 3200;
const int WATER_VALUE = 1400;

// Moisture Threshold Defaults
int minMoistureThreshold = 35; // %

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n--- AquaSmart IoT Irrigation Node Initializing ---");

  // Sensor Inits
  dht.begin();
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // Relay Pins (Active LOW: HIGH = OFF, LOW = ON)
  pinMode(RELAY_PIN_VALVE1, OUTPUT);
  pinMode(RELAY_PIN_VALVE2, OUTPUT);
  pinMode(RELAY_PIN_VALVE3, OUTPUT);
  pinMode(RELAY_PIN_VALVE4, OUTPUT);
  pinMode(RELAY_PIN_MAIN_PUMP, OUTPUT);

  // Turn all actuators OFF initially
  digitalWrite(RELAY_PIN_VALVE1, HIGH);
  digitalWrite(RELAY_PIN_VALVE2, HIGH);
  digitalWrite(RELAY_PIN_VALVE3, HIGH);
  digitalWrite(RELAY_PIN_VALVE4, HIGH);
  digitalWrite(RELAY_PIN_MAIN_PUMP, HIGH);

  // Connect to WiFi
  connectWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  // 1. Read Environmental Sensors
  float airTemp = dht.readTemperature();
  float airHumidity = dht.readHumidity();

  // 2. Read Soil Moisture Percentages
  int moistureZ1 = readMoisturePercent(SOIL_PIN_ZONE1);
  int moistureZ2 = readMoisturePercent(SOIL_PIN_ZONE2);
  int moistureZ3 = readMoisturePercent(SOIL_PIN_ZONE3);
  int moistureZ4 = readMoisturePercent(SOIL_PIN_ZONE4);

  // 3. Read Water Tank Level
  float tankDistanceCm = readUltrasonicDistance();
  float tankFillPercent = constrain((1.0 - (tankDistanceCm / TANK_MAX_DEPTH_CM)) * 100.0, 0.0, 100.0);

  // Debug Output
  Serial.printf("[Telemetry] Air: %.1fC, RH: %.1f%% | Z1: %d%%, Z2: %d%%, Z3: %d%%, Z4: %d%% | Tank: %.1f%%\n",
                airTemp, airHumidity, moistureZ1, moistureZ2, moistureZ3, moistureZ4, tankFillPercent);

  // 4. Automated Failsafe Logic: Safety check for low tank
  if (tankFillPercent < 5.0) {
    Serial.println("[ALERT] Water Reservoir depleted! Shutting down all valves and pump.");
    digitalWrite(RELAY_PIN_VALVE1, HIGH);
    digitalWrite(RELAY_PIN_VALVE2, HIGH);
    digitalWrite(RELAY_PIN_VALVE3, HIGH);
    digitalWrite(RELAY_PIN_VALVE4, HIGH);
    digitalWrite(RELAY_PIN_MAIN_PUMP, HIGH);
  } else {
    // Check automatic threshold for Zone 1
    if (moistureZ1 < minMoistureThreshold) {
      Serial.println("[AUTO] Zone 1 critically dry. Activating Valve 1 & Main Pump.");
      digitalWrite(RELAY_PIN_VALVE1, LOW); // Turn ON Valve 1
      digitalWrite(RELAY_PIN_MAIN_PUMP, LOW); // Turn ON Pump
    } else if (moistureZ1 > 70) {
      digitalWrite(RELAY_PIN_VALVE1, HIGH); // Turn OFF Valve 1
    }
  }

  // 5. Send Telemetry JSON to AquaSmart Web Dashboard
  sendTelemetryJson(airTemp, airHumidity, moistureZ1, moistureZ2, moistureZ3, moistureZ4, tankFillPercent);

  delay(3000); // 3 second cycle
}

int readMoisturePercent(int pin) {
  int raw = analogRead(pin);
  int percent = map(raw, AIR_VALUE, WATER_VALUE, 0, 100);
  return constrain(percent, 0, 100);
}

float readUltrasonicDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 25000);
  if (duration == 0) return TANK_MAX_DEPTH_CM;
  return (duration * 0.034) / 2.0; // Distance in cm
}

void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 15) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected! IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi Connection failed. Running in autonomous offline mode.");
  }
}

void sendTelemetryJson(float temp, float hum, int z1, int z2, int z3, int z4, float tank) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<300> doc;
  doc["airTemp"] = temp;
  doc["airHumidity"] = hum;
  doc["z1Moisture"] = z1;
  doc["z2Moisture"] = z2;
  doc["z3Moisture"] = z3;
  doc["z4Moisture"] = z4;
  doc["tankLevel"] = tank;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  int httpCode = http.POST(jsonPayload);
  http.end();
}
