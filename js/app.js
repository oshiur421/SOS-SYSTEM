/**
 * AEGIS Tactical Emergency SOS Command System
 * Core Application Engine: Surveillance Camera Simulator, Threat Telemetry,
 * Responsive Emergency Alert Log, Web Audio Synthesizer & Geo-Spatial Radar.
 */

(() => {
  'use strict';

  // =========================================================================
  // BROWSER ANTI-CACHE & SERVICE WORKER PURGE
  // Ensures zero request interception, spoofing, or stale responses.
  // =========================================================================
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const reg of registrations) {
        reg.unregister();
        console.warn('[AEGIS Core] Unregistered ServiceWorker:', reg.scope);
      }
    });
  }
  if ('caches' in window) {
    caches.keys().then(names => {
      for (const name of names) {
        caches.delete(name);
        console.warn('[AEGIS Core] Cleared CacheStorage:', name);
      }
    });
  }

  // =========================================================================
  // AUDIO SYNTHESIZER (Web Audio API - Pure synthesized sound, zero external deps)
  // =========================================================================
  class TacticalAudioSynth {
    constructor() {
      this.audioCtx = null;
      this.isMuted = false;
    }

    init() {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      return !this.isMuted;
    }

    playBeep(freq = 880, type = 'sine', duration = 0.08, gainVal = 0.15) {
      if (this.isMuted) return;
      try {
        this.init();
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
      } catch (err) {
        console.warn('Audio playback error:', err);
      }
    }

    playEmergencyAlarm() {
      if (this.isMuted) return;
      try {
        this.init();
        if (!this.audioCtx) return;
        const now = this.audioCtx.currentTime;

        // Two-tone warning siren (1100Hz -> 850Hz)
        [0, 0.14, 0.28].forEach((offset, idx) => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = 'sawtooth';
          const startFreq = idx % 2 === 0 ? 1150 : 880;
          osc.frequency.setValueAtTime(startFreq, now + offset);

          gain.gain.setValueAtTime(0.2, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(now + offset);
          osc.stop(now + offset + 0.12);
        });
      } catch (err) {
        console.warn('Emergency audio failed:', err);
      }
    }

    playAckTone() {
      this.playBeep(640, 'triangle', 0.09, 0.12);
      setTimeout(() => this.playBeep(960, 'sine', 0.12, 0.15), 90);
    }
  }

  const audio = new TacticalAudioSynth();

  // =========================================================================
  // INITIAL MOCK EMERGENCY ALERT DATA (COMMENTED OUT)
  // Simulation logic removed: Alert data and actions strictly rely on the
  // real FastAPI backend API (http://127.0.0.1:8000).
  // =========================================================================
  /*
  const INITIAL_ALERTS = [
    {
      id: 'SOS-9482',
      threatLevel: 'CRITICAL',
      time: new Date(Date.now() - 1000 * 60 * 2), // 2 mins ago
      incidentType: 'Duress Beacon Triggered - Panic Sensor',
      location: 'Sub-Level 2 - Chemical Depot B',
      sector: 'Sector 4B',
      coords: '37°46\'29.1"N 122°25\'09.8"W',
      radarAngle: 1.15,
      radarDist: 0.65,
      description: 'Wearable Duress Beacon #09 activated by Officer Davis. Immediate assistance required. Elevated heart rate and sudden acceleration detected.',
      telemetry: { hr: '142 BPM', o2: '96%', signal: '-58 dBm', battery: '78%' },
      status: 'active',
      linkedCam: 'cam-2',
      assignedUnit: 'Rapid Squad Alpha (En Route)'
    },
    {
      id: 'SOS-9479',
      threatLevel: 'CRITICAL',
      time: new Date(Date.now() - 1000 * 60 * 6), // 6 mins ago
      incidentType: 'Perimeter Breach - Motion Array 12',
      location: 'West Perimeter Gate - Sector 4B',
      sector: 'Sector 4B',
      coords: '37°46\'32.4"N 122°25\'15.2"W',
      radarAngle: 3.8,
      radarDist: 0.85,
      description: 'Multiple beam interruptions on outer security barrier. Thermal sensor confirms unauthorized human heat signature moving towards primary checkpoint.',
      telemetry: { hr: '--', o2: '--', signal: '-64 dBm', battery: '100%' },
      status: 'active',
      linkedCam: 'cam-1',
      assignedUnit: 'Drone Recon 01'
    },
    {
      id: 'SEC-8910',
      threatLevel: 'HIGH',
      time: new Date(Date.now() - 1000 * 60 * 14), // 14 mins ago
      incidentType: 'Hazardous Chemical Vapor Anomaly',
      location: 'Ventilation Shaft 03 - Core Plant',
      sector: 'Sector 3A',
      coords: '37°46\'18.5"N 122°25\'02.1"W',
      radarAngle: 2.3,
      radarDist: 0.45,
      description: 'Optical spectrometer registered toxic volatile organic compound spike exceeding 85 PPM. Automated damper shutdown initiated.',
      telemetry: { hr: '--', o2: '15.4% [LOW]', signal: '-72 dBm', battery: '92%' },
      status: 'acknowledged',
      linkedCam: 'cam-2',
      assignedUnit: 'Medic Team 02'
    },
    {
      id: 'SEC-8904',
      threatLevel: 'HIGH',
      time: new Date(Date.now() - 1000 * 60 * 22),
      incidentType: 'Access Control Tamper / Force Entry',
      location: 'Sub-Station Delta - Transformer Vault',
      sector: 'Sector 2',
      coords: '37°46\'40.1"N 122°24\'55.8"W',
      radarAngle: 0.45,
      radarDist: 0.75,
      description: 'Physical tamper switch triggered on high-voltage distribution enclosure. Magnetometer anomaly recorded.',
      telemetry: { hr: '--', o2: '20.9%', signal: '-81 dBm', battery: '89%' },
      status: 'acknowledged',
      linkedCam: 'cam-3',
      assignedUnit: 'Unassigned'
    },
    {
      id: 'SEC-8898',
      threatLevel: 'HIGH',
      time: new Date(Date.now() - 1000 * 60 * 35),
      incidentType: 'Biometric Vital Collapse - Worker #418',
      location: 'Freight Dock Bay 4 - South Loading',
      sector: 'Sector 4',
      coords: '37°46\'12.3"N 122°25\'22.0"W',
      radarAngle: 4.6,
      radarDist: 0.6,
      description: 'Sudden fall detection telemetry accompanied by zero heart rate transmission for 30 seconds. Automatic medic dispatch requested.',
      telemetry: { hr: '48 BPM [CRIT]', o2: '91%', signal: '-60 dBm', battery: '64%' },
      status: 'active',
      linkedCam: 'cam-3',
      assignedUnit: 'Medic Team 02 (On Scene)'
    },
    {
      id: 'WARN-7741',
      threatLevel: 'MODERATE',
      time: new Date(Date.now() - 1000 * 60 * 48),
      incidentType: 'Helipad Approach Laser Interference',
      location: 'Helipad Rooftop - Tower Alpha',
      sector: 'Sector 1',
      coords: '37°46\'22.0"N 122°25\'10.5"W',
      radarAngle: 5.4,
      radarDist: 0.35,
      description: 'Optical detection array intercepted repetitive green strobe illumination targeting inbound medical evacuation rotorcraft.',
      telemetry: { hr: '--', o2: '--', signal: '-52 dBm', battery: '95%' },
      status: 'acknowledged',
      linkedCam: 'cam-3',
      assignedUnit: 'Drone Recon 01'
    },
    {
      id: 'WARN-7735',
      threatLevel: 'MODERATE',
      time: new Date(Date.now() - 1000 * 60 * 65),
      incidentType: 'Backup Generator Fuel Pressure Drop',
      location: 'Utility Bunker West - Sector 6',
      sector: 'Sector 6',
      coords: '37°46\'10.8"N 122°24\'40.1"W',
      radarAngle: 2.9,
      radarDist: 0.9,
      description: 'Auxiliary diesel generator line B experienced sudden pressure variance from 4.2 bar to 1.8 bar during scheduled load test.',
      telemetry: { hr: '--', o2: '--', signal: '-68 dBm', battery: '98%' },
      status: 'acknowledged',
      linkedCam: 'cam-1',
      assignedUnit: 'Unassigned'
    },
    {
      id: 'WARN-7729',
      threatLevel: 'MODERATE',
      time: new Date(Date.now() - 1000 * 60 * 85),
      incidentType: 'Seismic Micro-Tremor / Structural Strain',
      location: 'Foundation Pylon #18 - East Embankment',
      sector: 'Sector 5',
      coords: '37°46\'05.2"N 122°25\'30.4"W',
      radarAngle: 3.4,
      radarDist: 0.8,
      description: 'Piezoelectric strain gauge cluster registered 1.8 mm lateral deflection. Geo-technical monitoring active.',
      telemetry: { hr: '--', o2: '--', signal: '-75 dBm', battery: '91%' },
      status: 'resolved',
      linkedCam: 'cam-4',
      assignedUnit: 'Engineering Unit 04'
    },
    {
      id: 'WARN-7712',
      threatLevel: 'MODERATE',
      time: new Date(Date.now() - 1000 * 60 * 110),
      incidentType: 'Unidentified RF Signal Burst on SOS Band',
      location: 'Radio Mast Charlie - High Ground',
      sector: 'Sector 7',
      coords: '37°46\'45.0"N 122°25\'18.9"W',
      radarAngle: 0.9,
      radarDist: 0.5,
      description: 'Broadband spectrum analyzer picked up short periodic bursts on 406.025 MHz emergency beacon band.',
      telemetry: { hr: '--', o2: '--', signal: '-48 dBm', battery: '100%' },
      status: 'resolved',
      linkedCam: 'cam-4',
      assignedUnit: 'Unassigned'
    },
    {
      id: 'INFO-6102',
      threatLevel: 'LOW',
      time: new Date(Date.now() - 1000 * 60 * 140),
      incidentType: 'Environmental Temperature Advisory',
      location: 'Server Room Alpha - Lower Level',
      sector: 'Sector 2B',
      coords: '37°46\'25.0"N 122°25\'08.0"W',
      radarAngle: 1.8,
      radarDist: 0.25,
      description: 'Ambient intake temperature reached 26.4°C. Secondary CRAC cooling unit auto-engaged.',
      telemetry: { hr: '--', o2: '20.9%', signal: '-45 dBm', battery: '100%' },
      status: 'resolved',
      linkedCam: 'cam-2',
      assignedUnit: 'Unassigned'
    },
    {
      id: 'INFO-6098',
      threatLevel: 'LOW',
      time: new Date(Date.now() - 1000 * 60 * 180),
      incidentType: 'Perimeter Floodlight Lamp Outage',
      location: 'Fence Line North - Post 14',
      sector: 'Sector 1',
      coords: '37°46\'42.1"N 122°25\'05.6"W',
      radarAngle: 0.15,
      radarDist: 0.95,
      description: 'Luminance drop detected by ambient light sensor. Automatic LED ballast failover active.',
      telemetry: { hr: '--', o2: '--', signal: '-62 dBm', battery: '100%' },
      status: 'resolved',
      linkedCam: 'cam-1',
      assignedUnit: 'Maintenance Crew'
    }
  ];
  */

  // Camera presets
  const CAMERA_PRESETS = {
    'cam-1': {
      id: 'CAM-01',
      name: 'CAM-01 // WEST PERIMETER GATE',
      location: 'Sector 4B - West Barrier Checkpoint',
      coords: '37°46\'32.4"N 122°25\'15.2"W • ELEV 24M',
      pan: 0.0,
      tilt: -4.2,
      lux: '14.2 LUX',
      target: {
        title: '🚨 BEACON #09 [CRITICAL]',
        conf: '99.4%',
        xPercent: 54,
        yPercent: 42,
        vitals: 'PULSE: 142 BPM | MOTION: RAPID | O2: 96%'
      }
    },
    'cam-2': {
      id: 'CAM-02',
      name: 'CAM-02 // CHEMICAL STORAGE DEPOT',
      location: 'Sector 3A - Hazardous Material Bay',
      coords: '37°46\'18.5"N 122°25\'02.1"W • SUB-LEVEL 2',
      pan: 45.0,
      tilt: -12.0,
      lux: '4.8 LUX',
      target: {
        title: '⚠️ TOXIC VAPOR PLUME [SEV 2]',
        conf: '96.2%',
        xPercent: 42,
        yPercent: 38,
        vitals: 'GAS: 88 PPM | TEMP: 31.4°C | O2: 15.2%'
      }
    },
    'cam-3': {
      id: 'CAM-03',
      name: 'CAM-03 // COMMAND HELIPAD & ROOF',
      location: 'Sector 1 - Alpha Tower Rooftop',
      coords: '37°46\'22.0"N 122°25\'10.5"W • ELEV 88M',
      pan: -22.5,
      tilt: 8.4,
      lux: '8.4 LUX',
      target: {
        title: '🚑 MEDIC EVAC ROTORCRAFT',
        conf: '98.8%',
        xPercent: 58,
        yPercent: 48,
        vitals: 'STATUS: INBOUND | SPEED: 110 KTS | ETA 2M'
      }
    },
    'cam-4': {
      id: 'DRONE-01',
      name: 'DRONE-01 // AERIAL OVERWATCH',
      location: 'Sector 7 - Dynamic Orbit (Alt 120m)',
      coords: '37°46\'30.0"N 122°25\'00.0"W • AIRBORNE',
      pan: 120.0,
      tilt: -45.0,
      lux: '18.9 LUX',
      target: {
        title: '🎯 TARGET #089 INTERCEPTED',
        conf: '94.5%',
        xPercent: 48,
        yPercent: 52,
        vitals: 'ALT: 120M | SATELLITE LOCK: 14 BIRDS'
      }
    }
  };

  // State: Populated strictly from FastAPI backend (GET /api/v1/alerts)
  let alertsState = [];
  let activeThreatFilter = 'ALL';
  let activeStatusFilter = 'all';
  let searchQuery = '';
  let activeCamId = 'cam-1';
  let visionMode = 'optical'; // 'optical', 'nv', 'thermal'
  let ptz = { pan: 0, tilt: -4.2, zoom: 1.0 };
  let isTrackingActive = true;
  let systemStatusEmergency = false;
  let sessionStartTime = Date.now();

  // =========================================================================
  // DISTRIBUTED MICROSERVICES ARCHITECTURE CONFIGURATION
  // Configurable global variables for distributed microservices:
  // - CAMERA_SERVER_URL: for streaming frames, telemetry, PTZ, and syncing alerts
  // - VOICE_SERVER_URL: for sending audio chunks directly to voice microservice
  // Intelligent fallback chain: window -> localStorage -> default cloud gateway
  // =========================================================================
  const DEFAULT_REMOTE_GATEWAY = 'https://sos-ai-sensor-1.onrender.com';

  // Configurable CAMERA_SERVER_URL (for sending frames, controls, and fetching alerts)
  const CAMERA_SERVER_URL = (typeof window !== 'undefined' && window.CAMERA_SERVER_URL)
    || (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('CAMERA_SERVER_URL'))
    || DEFAULT_REMOTE_GATEWAY;

  // Configurable VOICE_SERVER_URL (for sending audio directly to the voice microservice)
  const VOICE_SERVER_URL = (typeof window !== 'undefined' && window.VOICE_SERVER_URL)
    || (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('VOICE_SERVER_URL'))
    || CAMERA_SERVER_URL;

  // Standard function declarations for microservice endpoint resolution (safely hoisted)
  function getCameraServerUrl() {
    return (typeof window !== 'undefined' && window.CAMERA_SERVER_URL)
      || CAMERA_SERVER_URL
      || DEFAULT_REMOTE_GATEWAY;
  }

  function getVoiceServerUrl() {
    return (typeof window !== 'undefined' && window.VOICE_SERVER_URL)
      || VOICE_SERVER_URL
      || getCameraServerUrl();
  }

  function getCameraServerApi() {
    return getCameraServerUrl();
  }

  function getVoiceServerApi() {
    return getVoiceServerUrl();
  }

  // Expose configurable variables and endpoint resolvers globally on window object
  if (typeof window !== 'undefined') {
    if (!window.DEFAULT_REMOTE_GATEWAY) window.DEFAULT_REMOTE_GATEWAY = DEFAULT_REMOTE_GATEWAY;
    if (!window.CAMERA_SERVER_URL) window.CAMERA_SERVER_URL = CAMERA_SERVER_URL;
    if (!window.VOICE_SERVER_URL) window.VOICE_SERVER_URL = VOICE_SERVER_URL;
    window.getCameraServerUrl = getCameraServerUrl;
    window.getVoiceServerUrl = getVoiceServerUrl;
    window.getCameraServerApi = getCameraServerApi;
    window.getVoiceServerApi = getVoiceServerApi;
  }

  const SOS_BACKEND_CONFIG = {
    get baseUrl() {
      return getCameraServerUrl();
    },
    get alertsEndpoint() {
      return `${this.baseUrl.replace(/\/+$/, '')}/api/v1/alerts`;
    },
    get healthEndpoint() {
      return `${this.baseUrl.replace(/\/+$/, '')}/api/v1/health`;
    }
  };

  /**
   * Helper function to convert degree-minute-second (DMS) GPS coordinates
   * into decimal degrees (latitude, longitude) for backend storage.
   *
   * @param {string} coordStr - DMS GPS string (e.g. 37°46'29.1"N 122°25'09.8"W)
   * @returns {{latitude: number, longitude: number}|null}
   */
  function parseCoordinates(coordStr) {
    if (!coordStr || typeof coordStr !== 'string') return null;
    const match = coordStr.match(/(\d+)°(\d+)'([\d.]+)"\s*([NSEW])\s+(\d+)°(\d+)'([\d.]+)"\s*([NSEW])/i);
    if (match) {
      const latDeg = parseFloat(match[1]) + parseFloat(match[2]) / 60 + parseFloat(match[3]) / 3600;
      const lat = match[4].toUpperCase() === 'S' ? -latDeg : latDeg;
      const lonDeg = parseFloat(match[5]) + parseFloat(match[6]) / 60 + parseFloat(match[7]) / 3600;
      const lon = match[8].toUpperCase() === 'W' ? -lonDeg : lonDeg;
      return {
        latitude: parseFloat(lat.toFixed(6)),
        longitude: parseFloat(lon.toFixed(6))
      };
    }
    return null;
  }

  /**
   * Transmit detection data (including threat level and location) to the
   * SOS BACK FastAPI backend endpoint operating at http://127.0.0.1:8000.
   *
   * @param {Object} detectionData - Telemetry and metadata for the detection event
   * @param {string} [detectionData.threatLevel] - Threat level (LOW, MEDIUM/MODERATE, HIGH, CRITICAL)
   * @param {string} [detectionData.location] - Location name or description
   * @param {string} [detectionData.coords] - GPS coordinate string (DMS format)
   * @param {number} [detectionData.latitude] - Explicit numeric latitude
   * @param {number} [detectionData.longitude] - Explicit numeric longitude
   * @param {string} [detectionData.title] - Incident classification or title
   * @param {string} [detectionData.description] - Detailed incident notes
   * @param {string} [detectionData.detection_source] - Detection camera or sensor source
   * @param {Object} [detectionData.raw_detection_data] - Telemetry payload, sensors, confidence
   * @param {boolean} [detectionData.send_sms] - Optional boolean override for SMS dispatch
   * @returns {Promise<{success: boolean, data?: Object, error?: string, status?: number}>}
   */
  async function sendDetectionData(detectionData = {}) {
    // Normalize threat level to FastAPI ThreatLevel Enum: LOW, MEDIUM, HIGH, CRITICAL
    let rawThreatLevel = (detectionData.threatLevel || detectionData.threat_level || 'HIGH').toString().toUpperCase();
    if (rawThreatLevel === 'MODERATE') {
      rawThreatLevel = 'MEDIUM';
    }
    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(rawThreatLevel)) {
      rawThreatLevel = 'HIGH';
    }

    // Resolve location name
    const locationName = detectionData.location || detectionData.location_name || detectionData.loc || 'Unknown Location';

    // Resolve geodetic coordinates
    let latitude = typeof detectionData.latitude === 'number' ? detectionData.latitude : null;
    let longitude = typeof detectionData.longitude === 'number' ? detectionData.longitude : null;

    if ((latitude === null || longitude === null) && detectionData.coords) {
      const parsedCoords = parseCoordinates(detectionData.coords);
      if (parsedCoords) {
        latitude = parsedCoords.latitude;
        longitude = parsedCoords.longitude;
      }
    }

    // Fallback baseline coordinates if GPS telemetry not provided (Pacific North command center)
    if (latitude === null) latitude = 37.774929;
    if (longitude === null) longitude = -122.419416;

    // Construct request payload conforming to SOS-BACK AlertCreate schema
    const payload = {
      title: detectionData.title || detectionData.incidentType || detectionData.type || 'Emergency Detection Alert',
      threat_level: rawThreatLevel,
      detection_source: detectionData.detection_source || detectionData.detectionSource || (detectionData.linkedCam ? detectionData.linkedCam.toUpperCase() : 'AI_CAMERA'),
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
      location_name: locationName,
      description: detectionData.description || detectionData.desc || `Detection incident logged at ${locationName}.`,
      raw_detection_data: detectionData.raw_detection_data || {
        sector: detectionData.sector || null,
        telemetry: detectionData.telemetry || null,
        confidence: detectionData.confidence || null,
        alertId: detectionData.id || null,
        coords: detectionData.coords || null,
        source: 'AEGIS_SOS_SYSTEM'
      },
      send_sms: typeof detectionData.send_sms === 'boolean'
        ? detectionData.send_sms
        : (rawThreatLevel === 'CRITICAL' || rawThreatLevel === 'HIGH')
    };

    try {
      console.log(`[SOS-BACK API] Dispatching detection data via Fetch API to ${SOS_BACKEND_CONFIG.alertsEndpoint}:`, payload);

      const response = await fetch(SOS_BACKEND_CONFIG.alertsEndpoint, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[SOS-BACK API] Server returned HTTP error ${response.status}:`, errorText);
        throw new Error(`Server returned HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('[SOS-BACK API] Alert successfully stored in SOS-BACK backend:', responseData);
      return { success: true, status: response.status, data: responseData };
    } catch (networkErr) {
      console.error(`[SOS-BACK API] Connection failed to ${SOS_BACKEND_CONFIG.alertsEndpoint}:`, networkErr);
      throw new Error(`FastAPI backend unreachable at ${SOS_BACKEND_CONFIG.alertsEndpoint}: ${networkErr.message}`);
    }
  }

  /**
   * Health check utility to probe the SOS-BACK FastAPI service.
   *
   * @returns {Promise<{online: boolean, data?: Object}>}
   */
  async function checkBackendHealth() {
    try {
      const response = await fetch(SOS_BACKEND_CONFIG.healthEndpoint, {
        method: 'GET',
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const healthData = await response.json();
        console.log('[SOS-BACK API] Backend service is ONLINE:', healthData);
        return { online: true, data: healthData };
      }
      throw new Error(`Health probe returned HTTP ${response.status}`);
    } catch (err) {
      console.warn('[SOS-BACK API] Backend service offline or unreachable at ' + SOS_BACKEND_CONFIG.baseUrl, err.message);
      return { online: false, error: err.message };
    }
  }

  /**
   * Helper to parse any date input (string, Date, number), ensuring that
   * naive ISO timestamp strings from the backend are explicitly treated as UTC.
   * If a string lacks timezone information ('Z' or offset like +06:00, -05:00),
   * appends 'Z' before passing to Date constructor.
   *
   * @param {string|Date|number} dateInput
   * @returns {Date|null}
   */
  function parseUtcDate(dateInput) {
    if (!dateInput) return null;
    if (dateInput instanceof Date) {
      return isNaN(dateInput.getTime()) ? null : dateInput;
    }
    if (typeof dateInput === 'number') {
      const d = new Date(dateInput);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof dateInput === 'string') {
      let str = dateInput.trim();
      if (!str) return null;
      // Handle space-separated SQL datetimes e.g. "2026-10-04 17:16:17"
      if (str.includes(' ') && !str.includes('T')) {
        str = str.replace(' ', 'T');
      }
      // If it doesn't already end with Z/z or a timezone offset (+HH:MM, -HH:MM)
      if (!/[zZ]$/.test(str) && !/[+-]\d{2}(?::?\d{2})?$/.test(str)) {
        str += 'Z';
      }
      const d = new Date(str);
      return isNaN(d.getTime()) ? null : d;
    }
    const fallback = new Date(dateInput);
    return isNaN(fallback.getTime()) ? null : fallback;
  }

  /**
   * Normalize an alert record received from the FastAPI backend into the UI alert model.
   *
   * @param {Object} item - FastAPI AlertResponse object
   * @returns {Object} Frontend formatted alert object
   */
  function mapBackendAlertToFrontend(item) {
    const raw = item.raw_detection_data || {};
    const lat = item.latitude;
    const lon = item.longitude;
    const formattedCoords = (lat != null && lon != null)
      ? `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'} ${Math.abs(lon).toFixed(4)}°${lon >= 0 ? 'E' : 'W'}`
      : '37°46\'28.0"N 122°25\'10.0"W';

    // Normalize threat level
    let threat = (item.threat_level || item.threatLevel || 'HIGH').toUpperCase();
    if (threat === 'MEDIUM') threat = 'MODERATE';

    // Camera mapping from detection_source
    let cam = 'cam-1';
    if (item.detection_source) {
      const match = item.detection_source.toLowerCase().match(/cam-?\d|drone-?\d/);
      if (match) cam = match[0].replace(/(\w+)(\d)/, '$1-$2');
    }

    const rawTimeInput = item.timestamp || item.created_at || (item.time instanceof Date ? item.time.toISOString() : item.time) || new Date().toISOString();
    const dateObj = parseUtcDate(rawTimeInput) || new Date();
    const isoTime = dateObj.toISOString();

    return {
      // Exact FastAPI backend keys (AlertResponse schema)
      id: item.id,
      title: item.title || item.incidentType || 'Emergency Incident Alert',
      threat_level: item.threat_level || threat,
      detection_source: item.detection_source || item.source || 'AI SENSOR',
      timestamp: isoTime,
      created_at: isoTime,
      latitude: item.latitude ?? 23.8769,
      longitude: item.longitude ?? 90.3204,
      location_name: item.location_name || item.location || 'Daffodil Smart City - Ashulia, Dhaka',
      description: item.description || 'Emergency telemetry alert registered.',
      raw_detection_data: raw,
      snapshot_b64: item.snapshot_b64 || (raw && raw.snapshot_b64) || null,
      status: (item.status || 'ACTIVE').toLowerCase(),
      sms_status: item.sms_status || null,

      // Frontend compatibility aliases
      threatLevel: threat,
      time: dateObj,
      incidentType: item.title || item.incidentType || 'Emergency Incident Alert',
      location: item.location_name || item.location || 'Daffodil Smart City - Ashulia, Dhaka',
      source: item.detection_source || item.source || 'AI SENSOR',
      sector: raw.sector || 'Sector 4B',
      coords: raw.coords || formattedCoords,
      radarAngle: raw.radarAngle ?? (((item.id * 1.618) % 1) * Math.PI * 2),
      radarDist: raw.radarDist ?? (0.35 + (((item.id * 0.382) % 1) * 0.5)),
      telemetry: raw.telemetry || { hr: '--', o2: '--', signal: '-60 dBm', battery: '95%' },
      linkedCam: cam,
      assignedUnit: raw.assignedUnit || 'Rapid Squad Alpha'
    };
  }

  let isFetchingAlerts = false;

  /**
   * Fetch all alerts from the backend API.
   * Strictly relies on real backend API responses.
   *
   * @returns {Promise<boolean>}
   */
  async function fetchAlertsFromBackend() {
    if (isFetchingAlerts) return false;
    isFetchingAlerts = true;

    try {
      const response = await fetch(`${SOS_BACKEND_CONFIG.alertsEndpoint}?size=100`, {
        method: 'GET',
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        updateServerConnectionStatus(true);
        const data = await response.json();
        const alerts = Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : []);

        // Debug raw payload as explicitly requested
        console.log("Fetched alerts:", alerts);

        // Completely clear the log container before appending real backend alerts
        if (elAlertListContainer) {
          elAlertListContainer.innerHTML = '';
        }
        const backendAlerts = alerts.map(mapBackendAlertToFrontend);
        const backendIds = new Set(backendAlerts.map(a => String(a.id)));
        const localVoiceAlerts = alertsState.filter(a => !backendIds.has(String(a.id)) && a.detection_source === 'AI-VOICE-SENSOR');
        alertsState = [...localVoiceAlerts, ...backendAlerts];
        renderAlertList();
        evaluateSystemThreatPosture();
        updateMapMarkers(alertsState);
        return true;
      }
      updateServerConnectionStatus(false);
      console.warn(`[SOS-BACK API] Server returned HTTP ${response.status} when listing alerts.`);
      return false;
    } catch (err) {
      updateServerConnectionStatus(false);
      console.warn('[SOS-BACK API] Polling notice: backend offline or unreachable at ' + SOS_BACKEND_CONFIG.baseUrl, err.message);
      return false;
    } finally {
      isFetchingAlerts = false;
    }
  }

  /**
   * Update an alert's status directly in the backend via PATCH /api/v1/alerts/{alert_id}.
   * Strictly relies on real backend API responses.
   *
   * @param {number|string} alertId - Integer ID of the alert in backend
   * @param {'ACKNOWLEDGED'|'RESOLVED'|'ACTIVE'|'FALSE_ALARM'} newStatus - Target status
   * @param {string} [notes] - Optional notes
   * @returns {Promise<{success: boolean, data?: Object}>}
   */
  async function updateBackendAlertStatus(alertId, newStatus, notes = null) {
    const numericId = parseInt(alertId, 10);
    if (isNaN(numericId)) {
      throw new Error(`Invalid backend alert ID: ${alertId}`);
    }

    const bodyPayload = { status: newStatus };
    if (notes) bodyPayload.notes = notes;

    try {
      const response = await fetch(`${SOS_BACKEND_CONFIG.alertsEndpoint}/${numericId}`, {
        method: 'PATCH',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(bodyPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[SOS-BACK API] PATCH failed for alert #${alertId} (${response.status}):`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const updated = await response.json();
      console.log(`[SOS-BACK API] Alert #${alertId} updated to ${newStatus}:`, updated);
      return { success: true, data: updated };
    } catch (networkErr) {
      console.error(`[SOS-BACK API] Backend offline during status update for #${alertId}:`, networkErr);
      throw new Error(`FastAPI backend unreachable during status update: ${networkErr.message}`);
    }
  }

  // Expose globally for automated tests, console verification, and external callers
  window.sendDetectionData = sendDetectionData;
  window.sendDetectionAlert = sendDetectionData;
  window.checkBackendHealth = checkBackendHealth;
  window.fetchAlertsFromBackend = fetchAlertsFromBackend;
  window.fetchAlerts = fetchAlertsFromBackend;
  window.initIncidentMap = initIncidentMap;
  window.updateMapMarkers = updateMapMarkers;
  window.updateBackendAlertStatus = updateBackendAlertStatus;
  window.mapBackendAlertToFrontend = mapBackendAlertToFrontend;
  window.parseUtcDate = parseUtcDate;
  window.getExactTimeString = getExactTimeString;
  window.getRelativeTimeString = getRelativeTimeString;
  window.SOS_BACKEND_CONFIG = SOS_BACKEND_CONFIG;
  window.CAMERA_SERVER_URL = CAMERA_SERVER_URL;
  window.VOICE_SERVER_URL = VOICE_SERVER_URL;
  window.getCameraServerUrl = getCameraServerUrl;
  window.getVoiceServerUrl = getVoiceServerUrl;
  window.getCameraServerApi = getCameraServerApi;
  window.getVoiceServerApi = getVoiceServerApi;

  // DOM Elements
  const elClockLocal = document.getElementById('clock-local');
  const elClockUtc = document.getElementById('clock-utc');
  const elSessionUptime = document.getElementById('session-uptime');
  const elAudioToggle = document.getElementById('btn-audio-toggle');
  const elAudioStatusText = document.getElementById('audio-status-text');
  const elSimulateSosBtn = document.getElementById('btn-simulate-sos');
  const elSystemStatus = document.getElementById('system-status-container');
  const elSystemConditionText = document.getElementById('system-condition-text');
  const elSystemSubText = document.getElementById('system-sub-text');
  const elDefconBadge = document.getElementById('defcon-badge');
  const elEmergencyBanner = document.getElementById('emergency-banner');
  const elBannerMessage = document.getElementById('banner-message');
  const elBannerIncidentTime = document.getElementById('banner-incident-time');
  const elBannerAckBtn = document.getElementById('btn-banner-ack');
  const elBannerViewBtn = document.getElementById('btn-banner-view');

  // Top Header Redesigned Controls & Status Indicator
  const elThemeToggle = document.getElementById('btn-theme-toggle');
  const elThemeStatusText = document.getElementById('theme-status-text');
  const elThemeIcon = document.getElementById('theme-icon');
  const elHeaderStatus = document.getElementById('header-status-indicator');
  const elStatusDot = document.getElementById('status-dot');
  const elStatusLabel = document.getElementById('status-label');

  /**
   * Bind the glowing Green/Red system status indicator to server connectivity.
   * Green dot & "SYSTEM: ACTIVE" when online; Red dot & "SYSTEM: OFFLINE" when offline.
   *
   * @param {boolean} isConnected
   */
  function updateServerConnectionStatus(isConnected) {
    if (elHeaderStatus) {
      elHeaderStatus.classList.toggle('status-online', !!isConnected);
      elHeaderStatus.classList.toggle('status-offline', !isConnected);
    }
    if (elStatusLabel) {
      elStatusLabel.textContent = isConnected ? 'SYSTEM: ACTIVE' : 'SYSTEM: OFFLINE';
    }
  }
  window.updateServerConnectionStatus = updateServerConnectionStatus;

  // Camera Elements
  const canvasCam = document.getElementById('camera-canvas');
  const ctxCam = canvasCam ? canvasCam.getContext('2d') : null;
  const elHudCamName = document.getElementById('hud-cam-name');
  const elHudTimestamp = document.getElementById('hud-timestamp');
  const elHudCoords = document.getElementById('hud-coords');
  const elHudIrVal = document.getElementById('hud-ir-val');
  const elHudZoomVal = document.getElementById('hud-zoom-val');
  const elHudReticleAngle = document.getElementById('hud-reticle-angle');
  const elHudVisionModeText = document.getElementById('hud-vision-mode-text');
  const elActiveCamTitle = document.getElementById('active-cam-title');
  const elHudTargetBox = document.getElementById('hud-target-box');
  const elTargetDetectTitle = document.getElementById('target-detect-title');
  const elTargetDetectConf = document.getElementById('target-detect-conf');
  const elTargetVitalsStrip = document.getElementById('target-vitals-strip');
  const elTelemetryPan = document.getElementById('telemetry-pan');
  const elTelemetryTilt = document.getElementById('telemetry-tilt');
  const elTelemetryLux = document.getElementById('telemetry-lux');
  const elCamFpsBadge = document.getElementById('cam-fps-badge');

  // Alert Log Elements
  const elAlertListContainer = document.getElementById('alert-list-container');
  const elCountCritical = document.getElementById('count-critical');
  const elCountHigh = document.getElementById('count-high');
  const elCountModerate = document.getElementById('count-moderate');
  const elCountLow = document.getElementById('count-low');
  const elTotalAlertsCount = document.getElementById('total-alerts-count');
  const elVisibleAlertCount = document.getElementById('visible-alert-count');
  const elTotalPoolCount = document.getElementById('total-pool-count');
  const elSearchInput = document.getElementById('alert-search-input');
  const elClearSearch = document.getElementById('btn-clear-search');
  const elAckAllBtn = document.getElementById('btn-ack-all');
  const elExportLogBtn = document.getElementById('btn-export-log');

  // Radar / Incident Map Elements
  const elIncidentMap = document.getElementById('incident-map');
  const canvasRadar = document.getElementById('radar-canvas');
  const ctxRadar = canvasRadar ? canvasRadar.getContext('2d') : null;

  // Modals
  const modalCreateAlert = document.getElementById('modal-create-alert');
  const btnOpenCreateAlert = document.getElementById('btn-open-create-alert');
  const btnPurgeAlerts = document.getElementById('btn-purge-alerts');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const formCreateAlert = document.getElementById('form-create-alert');
  const modalAlertDetails = document.getElementById('modal-alert-details');
  const btnCloseDetailModal = document.getElementById('btn-close-detail-modal');
  const modalDetailBody = document.getElementById('modal-detail-body');
  const modalDetailFooter = document.getElementById('modal-detail-footer');
  const detailThreatBadge = document.getElementById('detail-threat-badge');

  const toastContainer = document.getElementById('toast-container');

  // =========================================================================
  // CLOCK & TIMERS
  // =========================================================================
  function updateClocks() {
    const now = new Date();
    // Local Time (12-hour format with AM/PM)
    if (elClockLocal) {
      elClockLocal.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    }

    // UTC Time
    if (elClockUtc) {
      elClockUtc.textContent = now.toISOString().substring(11, 19) + ' UTC';
    }

    // Camera precise timestamp
    if (elHudTimestamp) {
      const ms = String(now.getMilliseconds()).padStart(3, '0');
      elHudTimestamp.textContent = `${now.toISOString().substring(0, 10)} ${now.toLocaleTimeString('en-US', { hour12: false })}.${ms}`;
    }

    // Session Uptime
    if (elSessionUptime) {
      const diffSec = Math.floor((Date.now() - sessionStartTime) / 1000);
      const hrs = String(Math.floor(diffSec / 3600)).padStart(2, '0');
      const mins = String(Math.floor((diffSec % 3600) / 60)).padStart(2, '0');
      const secs = String(diffSec % 60).padStart(2, '0');
      elSessionUptime.textContent = `${hrs}:${mins}:${secs}`;
    }

    // Emergency Banner elapsed timer
    if (systemStatusEmergency && elBannerIncidentTime) {
      const activeEmergency = alertsState.find(a => a.threatLevel === 'CRITICAL' && a.status === 'active');
      if (activeEmergency) {
        const emergencyDate = parseUtcDate(activeEmergency.time || activeEmergency.timestamp || activeEmergency.created_at);
        if (emergencyDate) {
          const elSec = Math.max(0, Math.floor((Date.now() - emergencyDate.getTime()) / 1000));
          const m = String(Math.floor(elSec / 60)).padStart(2, '0');
          const s = String(elSec % 60).padStart(2, '0');
          elBannerIncidentTime.textContent = `00:${m}:${s}`;
        }
      }
    }
  }

  setInterval(updateClocks, 250);
  updateClocks();

  // =========================================================================
  // TOAST NOTIFICATIONS
  // =========================================================================
  function showToast(message, isCritical = false) {
    const toast = document.createElement('div');
    toast.className = `tactical-toast ${isCritical ? 'toast-critical' : ''}`;
    toast.innerHTML = `
      <span class="toast-icon">${isCritical ? '🚨' : '⚡'}</span>
      <span class="toast-text font-mono">${message}</span>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(60px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // =========================================================================
  // SYSTEM STATUS MANAGEMENT (PROMINENT STATUS AT TOP RIGHT)
  // =========================================================================
  function setSystemStatus(isCritical, reason = 'ALL 48 SENSORS ONLINE // 14ms SAT-LINK') {
    systemStatusEmergency = isCritical;
    if (isCritical) {
      if (elSystemStatus) elSystemStatus.classList.add('state-critical');
      if (elSystemConditionText) elSystemConditionText.textContent = 'CODE RED // ACTIVE SOS';
      if (elSystemSubText) elSystemSubText.textContent = 'DURESS BEACON ENGAGED - DISPATCH ACTIVE';
      if (elDefconBadge) {
        elDefconBadge.textContent = 'DEFCON 1';
        elDefconBadge.style.color = '#fff';
        elDefconBadge.style.background = 'var(--color-critical)';
      }
      if (elEmergencyBanner) elEmergencyBanner.classList.add('active');
      if (elBannerMessage) elBannerMessage.textContent = reason;
    } else {
      if (elSystemStatus) elSystemStatus.classList.remove('state-critical');
      if (elSystemConditionText) elSystemConditionText.textContent = 'SYSTEM OPERATIONAL';
      if (elSystemSubText) elSystemSubText.textContent = reason;
      if (elDefconBadge) {
        elDefconBadge.textContent = 'DEFCON 2';
        elDefconBadge.style.color = 'var(--color-high)';
        elDefconBadge.style.background = 'rgba(255, 109, 0, 0.18)';
      }
      if (elEmergencyBanner) elEmergencyBanner.classList.remove('active');
    }
  }

  // Check state based on active alerts
  function evaluateSystemThreatPosture() {
    const activeCriticals = alertsState.filter(a => a.threatLevel === 'CRITICAL' && a.status === 'active');
    if (activeCriticals.length > 0) {
      setSystemStatus(true, `ACTIVE EMERGENCY SOS: ${activeCriticals[0].incidentType.toUpperCase()} IN ${activeCriticals[0].sector.toUpperCase()}`);
    } else {
      setSystemStatus(false, 'ALL 48 SENSORS ONLINE // 14ms SAT-LINK');
    }
  }

  // =========================================================================
  // CAMERA FEED PROCEDURAL SIMULATOR (CANVAS)
  // =========================================================================
  let camTick = 0;
  let fpsHistory = 60;

  function renderCameraFeed() {
    if (!canvasCam || !ctxCam) return;
    camTick += 0.03;
    const w = canvasCam.width;
    const h = canvasCam.height;

    // Background based on vision mode
    if (visionMode === 'optical') {
      // Night security optical surveillance
      ctxCam.fillStyle = '#080c14';
      ctxCam.fillRect(0, 0, w, h);

      // Subtle ground & structure geometry
      const grad = ctxCam.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#060910');
      grad.addColorStop(0.65, '#0a0f1d');
      grad.addColorStop(1, '#0e172a');
      ctxCam.fillStyle = grad;
      ctxCam.fillRect(0, 0, w, h);

      // Distant perimeter posts & fence lines
      ctxCam.strokeStyle = 'rgba(100, 140, 190, 0.25)';
      ctxCam.lineWidth = 1.5;
      for (let i = 0; i < w; i += 80) {
        const offset = Math.sin(camTick * 0.5 + i) * 3;
        ctxCam.beginPath();
        ctxCam.moveTo(i + ptz.pan * 2, h * 0.45);
        ctxCam.lineTo(i + ptz.pan * 2, h * 0.75 + offset);
        ctxCam.stroke();
      }

      // Security lighting sweep
      const sweepX = (Math.sin(camTick * 0.8) * 0.35 + 0.5) * w;
      const lightGrad = ctxCam.createRadialGradient(sweepX, h * 0.35, 10, sweepX, h * 0.5, 260);
      lightGrad.addColorStop(0, 'rgba(180, 220, 255, 0.35)');
      lightGrad.addColorStop(0.5, 'rgba(80, 140, 220, 0.12)');
      lightGrad.addColorStop(1, 'transparent');
      ctxCam.fillStyle = lightGrad;
      ctxCam.fillRect(0, 0, w, h);

      // Security fence mesh lines
      ctxCam.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctxCam.lineWidth = 1;
      for (let y = h * 0.5; y < h * 0.8; y += 14) {
        ctxCam.beginPath();
        ctxCam.moveTo(0, y);
        ctxCam.lineTo(w, y);
        ctxCam.stroke();
      }

    } else if (visionMode === 'nv') {
      // Night Vision: High-gain Green Phosphor
      ctxCam.fillStyle = '#021206';
      ctxCam.fillRect(0, 0, w, h);

      // Phosphor green glow
      const nvGrad = ctxCam.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, w * 0.6);
      nvGrad.addColorStop(0, 'rgba(0, 255, 100, 0.28)');
      nvGrad.addColorStop(0.7, 'rgba(0, 180, 70, 0.15)');
      nvGrad.addColorStop(1, 'rgba(0, 40, 10, 0.7)');
      ctxCam.fillStyle = nvGrad;
      ctxCam.fillRect(0, 0, w, h);

      // Noise grain lines
      ctxCam.fillStyle = 'rgba(0, 255, 120, 0.08)';
      for (let i = 0; i < 400; i++) {
        const nx = Math.random() * w;
        const ny = Math.random() * h;
        ctxCam.fillRect(nx, ny, 2, 2);
      }

      // Outlines of structures in phosphor green
      ctxCam.strokeStyle = 'rgba(0, 255, 100, 0.4)';
      ctxCam.lineWidth = 2;
      ctxCam.strokeRect(w * 0.25 + ptz.pan * 2, h * 0.35, w * 0.5, h * 0.38);

    } else if (visionMode === 'thermal') {
      // Thermal FLIR: Ironbow spectrum (Deep purple/black -> Orange -> White Hot)
      ctxCam.fillStyle = '#070114';
      ctxCam.fillRect(0, 0, w, h);

      // Cold background structures
      ctxCam.fillStyle = '#180736';
      ctxCam.fillRect(0, h * 0.5, w, h * 0.5);

      // Hot spots (heat signatures)
      const targetX = (w * 0.52) + (Math.sin(camTick * 0.6) * 20);
      const targetY = (h * 0.45) + (Math.cos(camTick * 0.4) * 8);

      const heatGrad = ctxCam.createRadialGradient(targetX, targetY, 4, targetX, targetY, 80);
      heatGrad.addColorStop(0, '#ffffff'); // White hot core
      heatGrad.addColorStop(0.25, '#ffe600'); // Yellow
      heatGrad.addColorStop(0.55, '#ff4d00'); // Orange/Red
      heatGrad.addColorStop(0.85, '#990099'); // Purple cold
      heatGrad.addColorStop(1, 'transparent');

      ctxCam.fillStyle = heatGrad;
      ctxCam.beginPath();
      ctxCam.arc(targetX, targetY, 80, 0, Math.PI * 2);
      ctxCam.fill();
    }

    // Dynamic Tracking Box Coordinates based on active preset and pan/tilt
    if (isTrackingActive && elHudTargetBox) {
      const preset = CAMERA_PRESETS[activeCamId] || CAMERA_PRESETS['cam-1'];
      const target = preset.target;
      const computedX = (target.xPercent + (ptz.pan * 0.4) + Math.sin(camTick * 1.2) * 1.5);
      const computedY = (target.yPercent + (ptz.tilt * 0.3) + Math.cos(camTick * 0.9) * 1.2);

      elHudTargetBox.style.display = 'block';
      elHudTargetBox.style.left = `${Math.max(10, Math.min(85, computedX))}%`;
      elHudTargetBox.style.top = `${Math.max(10, Math.min(75, computedY))}%`;
      elTargetDetectTitle.textContent = target.title;
      elTargetDetectConf.textContent = `CONF: ${target.conf}`;
      elTargetVitalsStrip.textContent = target.vitals;
    } else if (elHudTargetBox) {
      elHudTargetBox.style.display = 'none';
    }

    // Live FPS and bitrate telemetry are updated via fetchCameraTelemetry() polling

    requestAnimationFrame(renderCameraFeed);
  }

  requestAnimationFrame(renderCameraFeed);

  // =========================================================================
  // CAMERA STREAM CONTROLLER & TELEMETRY
  // Connects to Camera Server / Microservice for live video feed,
  // hardware telemetry polling, digital PTZ adjustments, and vision filters.
  // =========================================================================
  const CAMERA_FRAME_API_URL = `${getCameraServerUrl().replace(/\/+$/, '')}/api/camera/frame`;

  // -------------------------------------------------------------------------
  // LOCAL WEBCAM & CLIENT-SIDE FRAME STREAMING TO AI SENSOR BACKEND
  // Captures local video feed via navigator.mediaDevices.getUserMedia({ video: true }),
  // displays local <video> feed inside the dashboard viewport, and streams
  // base64 video frames every 500ms to /api/camera/frame for real-time AI processing.
  // -------------------------------------------------------------------------
  let localWebcamStream = null;
  let isLocalWebcamActive = false;
  let frameCaptureIntervalId = null;
  let isSendingFrame = false;
  let frameCaptureCanvas = null;

  async function initLocalWebcamCapture() {
    if (isLocalWebcamActive) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('[Webcam AI] navigator.mediaDevices.getUserMedia is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      localWebcamStream = stream;
      isLocalWebcamActive = true;
      console.log('[Webcam AI] Local webcam access granted.');

      const cameraContainer = document.getElementById('camera-feed-container');
      const remoteImgFeed = document.getElementById('main-camera-feed');

      let localVideoFeed = document.getElementById('local-webcam-feed');
      if (!localVideoFeed) {
        localVideoFeed = document.createElement('video');
        localVideoFeed.id = 'local-webcam-feed';
        localVideoFeed.autoplay = true;
        localVideoFeed.muted = true;
        localVideoFeed.playsInline = true;
        localVideoFeed.style.width = '100%';
        localVideoFeed.style.height = '100%';
        localVideoFeed.style.objectFit = 'cover';
        localVideoFeed.style.borderRadius = '5px';
        localVideoFeed.style.display = 'block';

        if (cameraContainer) {
          if (remoteImgFeed) {
            remoteImgFeed.style.display = 'none';
            remoteImgFeed.removeAttribute('src'); // Stop pulling remote image source
            cameraContainer.insertBefore(localVideoFeed, remoteImgFeed);
          } else {
            cameraContainer.prepend(localVideoFeed);
          }
        }
      } else {
        localVideoFeed.style.display = 'block';
        if (remoteImgFeed) {
          remoteImgFeed.style.display = 'none';
        }
      }

      localVideoFeed.srcObject = stream;
      localVideoFeed.play().catch(playErr => {
        console.warn('[Webcam AI] Video play error:', playErr);
      });

      // Start frame capture loop: capture frame every 500ms and POST to /api/camera/frame
      if (frameCaptureIntervalId) {
        clearInterval(frameCaptureIntervalId);
      }
      frameCaptureIntervalId = setInterval(() => {
        captureAndSendWebcamFrame(localVideoFeed);
      }, 500);

      console.log('[Webcam AI] Local video feed active and 500ms frame capture loop initiated.');
    } catch (err) {
      console.error('[Webcam AI] Error starting local webcam:', err);
    }
  }

  function captureAndSendWebcamFrame(videoEl) {
    if (!videoEl || videoEl.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return;
    }
    if (videoEl.videoWidth === 0 || videoEl.videoHeight === 0) {
      return;
    }
    if (isSendingFrame) {
      // Prevent stacking if request is still in flight
      return;
    }

    if (!frameCaptureCanvas) {
      frameCaptureCanvas = document.createElement('canvas');
    }

    const width = videoEl.videoWidth;
    const height = videoEl.videoHeight;
    if (frameCaptureCanvas.width !== width || frameCaptureCanvas.height !== height) {
      frameCaptureCanvas.width = width;
      frameCaptureCanvas.height = height;
    }

    const ctx = frameCaptureCanvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, width, height);

    const base64Image = frameCaptureCanvas.toDataURL('image/jpeg', 0.75);
    isSendingFrame = true;

    const targetApiUrl = `${getCameraServerUrl().replace(/\/+$/, '')}/api/camera/frame`;

    fetch(targetApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        frame: base64Image,
        image: base64Image
      })
    })
      .then(async (response) => {
        if (!response.ok) {
          const errText = await response.text();
          console.error(`[Webcam AI] /api/camera/frame error (${response.status}):`, errText);
          return;
        }
        const data = await response.json();
      })
      .catch((err) => {
        console.error('[Webcam AI] Error uploading camera frame:', err);
      })
      .finally(() => {
        isSendingFrame = false;
      });
  }

  window.initLocalWebcamCapture = initLocalWebcamCapture;

  // Switch camera function (updates HUD telemetry and preset overlays)
  function switchCamera(camKey) {
    if (!CAMERA_PRESETS[camKey]) return;
    activeCamId = camKey;
    const preset = CAMERA_PRESETS[camKey];

    // Update active tab styles
    document.querySelectorAll('.cam-tab').forEach(tab => {
      const isCurrent = tab.getAttribute('data-cam-id') === camKey;
      tab.classList.toggle('active', isCurrent);
      tab.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
    });

    // Update HUD text & Subtitles
    if (elHudCamName) elHudCamName.textContent = preset.name;
    if (elActiveCamTitle) elActiveCamTitle.textContent = `${preset.id} // ${preset.location.toUpperCase()}`;
    if (elHudCoords) elHudCoords.textContent = preset.coords;
    if (elTelemetryPan) elTelemetryPan.textContent = `${preset.pan.toFixed(1)}°`;
    if (elTelemetryTilt) elTelemetryTilt.textContent = `${preset.tilt.toFixed(1)}°`;
    if (elTelemetryLux) elTelemetryLux.textContent = preset.lux;
    if (elHudReticleAngle) elHudReticleAngle.textContent = `AZIMUTH: ${(342.6 + preset.pan).toFixed(1)}°`;

    ptz.pan = preset.pan;
    ptz.tilt = preset.tilt;

    // Ensure main video feed points directly to single stream endpoint if local webcam is not active
    const mainVideoFeed = document.getElementById('main-camera-feed') || document.querySelector('#camera-feed-container img');
    if (mainVideoFeed && !isLocalWebcamActive) {
      const targetSrc = `${getCameraServerUrl().replace(/\/+$/, '')}/video_feed`;
      if (mainVideoFeed.src !== targetSrc) {
        mainVideoFeed.src = targetSrc;
      }
    }

    audio.playBeep(720, 'sine', 0.06, 0.1);
    showToast(`Switched optics to ${preset.name}`, false);
  }

  // Camera Selector Tabs click handlers
  document.querySelectorAll('.cam-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const camKey = tab.getAttribute('data-cam-id');
      switchCamera(camKey);
      fetchCameraTelemetry();
    });
  });

  // Sync PTZ & Video Filter state with Camera Server
  async function syncCameraFilterToServer(mode) {
    try {
      const modeMap = {
        optical: 'NORMAL',
        nv: 'NIGHT_VISION',
        thermal: 'THERMAL'
      };
      const filterMode = modeMap[mode] || 'NORMAL';
      await fetch(`${getCameraServerUrl().replace(/\/+$/, '')}/api/camera/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter: filterMode })
      });
    } catch (_) {
      // Quiet fail if camera server is currently offline
    }
  }

  async function syncCameraPTZToServer() {
    try {
      await fetch(`${getCameraServerUrl().replace(/\/+$/, '')}/api/camera/ptz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoom: ptz.zoom,
          pan: Math.round(ptz.pan * 6),
          tilt: Math.round(ptz.tilt * 6)
        })
      });
    } catch (_) {
      // Quiet fail
    }
  }

  // ---------------------------------------------------------------------------
  // Real-Time Camera Hardware Telemetry Polling (FPS, Mbps, Video Quality)
  // ---------------------------------------------------------------------------
  async function fetchCameraTelemetry() {
    try {
      const response = await fetch(`${getCameraServerUrl().replace(/\/+$/, '')}/status`, { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();

      const elFps = document.getElementById('telemetry-fps');
      const elMbps = document.getElementById('telemetry-mbps');
      const elQuality = document.getElementById('telemetry-quality');

      if (elFps && data.fps !== undefined) {
        elFps.innerText = `${parseFloat(data.fps).toFixed(1)} FPS`;
      }
      if (elMbps && data.mbps !== undefined) {
        elMbps.innerText = `${parseFloat(data.mbps).toFixed(2)} Mbps`;
      }
      if (elQuality && data.quality !== undefined) {
        elQuality.innerHTML = `<span class="rec-blink-dot"></span> REC ${data.quality}`;
      }
    } catch (_) {
      // Quiet fail if camera server is offline
    }
  }

  // Poll camera server telemetry every 1000ms
  setInterval(fetchCameraTelemetry, 1000);
  fetchCameraTelemetry();
  window.fetchCameraTelemetry = fetchCameraTelemetry;

  // Vision Mode Switcher
  const visionButtons = document.querySelectorAll('.vision-modes .hud-ctrl-btn');
  visionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      visionButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      visionMode = btn.getAttribute('data-mode');

      if (visionMode === 'optical') {
        if (elHudVisionModeText) elHudVisionModeText.textContent = 'VISION MODE: OPTICAL STANDARD';
        if (elHudIrVal) elHudIrVal.textContent = 'STANDBY';
      } else if (visionMode === 'nv') {
        if (elHudVisionModeText) elHudVisionModeText.textContent = 'VISION MODE: NIGHT VISION [IR 850nm]';
        if (elHudIrVal) elHudIrVal.textContent = 'ACTIVE (94%)';
      } else if (visionMode === 'thermal') {
        if (elHudVisionModeText) elHudVisionModeText.textContent = 'VISION MODE: THERMAL FLIR [IRONBOW]';
        if (elHudIrVal) elHudIrVal.textContent = 'FLIR MATRIX';
      }

      audio.playBeep(880, 'sine', 0.05, 0.1);
      showToast(`Vision filter mode set to ${visionMode.toUpperCase()}`);
      syncCameraFilterToServer(visionMode);
    });
  });

  // PTZ Control Listeners
  document.getElementById('btn-pan-left').addEventListener('click', () => {
    ptz.pan -= 5;
    elTelemetryPan.textContent = `${ptz.pan.toFixed(1)}°`;
    audio.playBeep(520, 'square', 0.03, 0.05);
    syncCameraPTZToServer();
  });
  document.getElementById('btn-pan-right').addEventListener('click', () => {
    ptz.pan += 5;
    elTelemetryPan.textContent = `${ptz.pan.toFixed(1)}°`;
    audio.playBeep(520, 'square', 0.03, 0.05);
    syncCameraPTZToServer();
  });
  document.getElementById('btn-tilt-up').addEventListener('click', () => {
    ptz.tilt += 4;
    elTelemetryTilt.textContent = `${ptz.tilt.toFixed(1)}°`;
    audio.playBeep(520, 'square', 0.03, 0.05);
    syncCameraPTZToServer();
  });
  document.getElementById('btn-tilt-down').addEventListener('click', () => {
    ptz.tilt -= 4;
    elTelemetryTilt.textContent = `${ptz.tilt.toFixed(1)}°`;
    audio.playBeep(520, 'square', 0.03, 0.05);
    syncCameraPTZToServer();
  });
  document.getElementById('btn-zoom-in').addEventListener('click', () => {
    if (ptz.zoom < 4.0) {
      ptz.zoom = +(ptz.zoom + 0.5).toFixed(1);
      if (elHudZoomVal) elHudZoomVal.textContent = `${ptz.zoom.toFixed(1)}X`;
      audio.playBeep(640, 'triangle', 0.04, 0.08);
      syncCameraPTZToServer();
    }
  });
  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    if (ptz.zoom > 1.0) {
      ptz.zoom = +(ptz.zoom - 0.5).toFixed(1);
      if (elHudZoomVal) elHudZoomVal.textContent = `${ptz.zoom.toFixed(1)}X`;
      audio.playBeep(480, 'triangle', 0.04, 0.08);
      syncCameraPTZToServer();
    }
  });
  document.getElementById('btn-cam-reset').addEventListener('click', () => {
    const preset = CAMERA_PRESETS[activeCamId];
    ptz = { pan: preset.pan, tilt: preset.tilt, zoom: 1.0 };
    if (elTelemetryPan) elTelemetryPan.textContent = `${ptz.pan.toFixed(1)}°`;
    if (elTelemetryTilt) elTelemetryTilt.textContent = `${ptz.tilt.toFixed(1)}°`;
    if (elHudZoomVal) elHudZoomVal.textContent = '1.0X';
    audio.playBeep(440, 'sine', 0.08, 0.1);
    syncCameraPTZToServer();
    syncCameraFilterToServer('optical');
  });

  // Toggle Motion AI tracking
  const btnToggleMotion = document.getElementById('btn-toggle-motion');
  btnToggleMotion.addEventListener('click', () => {
    isTrackingActive = !isTrackingActive;
    btnToggleMotion.classList.toggle('active', isTrackingActive);
    audio.playBeep(580, 'sine', 0.06, 0.1);
    showToast(`AI Tracking overlay ${isTrackingActive ? 'ENABLED' : 'DISABLED'}`);
  });

  // Camera Snapshot
  document.getElementById('btn-cam-snapshot').addEventListener('click', () => {
    // Flash effect
    const overlay = document.querySelector('.camera-viewport-wrapper');
    const flashDiv = document.createElement('div');
    flashDiv.style.position = 'absolute';
    flashDiv.style.inset = '0';
    flashDiv.style.backgroundColor = '#ffffff';
    flashDiv.style.opacity = '0.7';
    flashDiv.style.zIndex = '20';
    flashDiv.style.pointerEvents = 'none';
    flashDiv.style.transition = 'opacity 0.4s ease';
    overlay.appendChild(flashDiv);

    setTimeout(() => {
      flashDiv.style.opacity = '0';
      setTimeout(() => flashDiv.remove(), 400);
    }, 50);

    audio.playBeep(1200, 'square', 0.1, 0.2);
    showToast(`Snapshot frame saved: ${activeCamId.toUpperCase()}_CAP_${Date.now()}.png`);
  });

  // =========================================================================
  // CONTINUOUS MICROPHONE AUDIO CAPTURE (AI Voice Emergency Detection)
  // Streams 3-second audio chunks directly to VOICE_SERVER_URL/api/voice/audio
  // with resilient fallback to the central camera gateway if unreachable.
  // =========================================================================
  const VOICE_AUDIO_API_URL = `${getVoiceServerUrl().replace(/\/+$/, '')}/api/voice/audio`;
  let isMicrophoneCapturing = false;

  async function initContinuousAudioCapture() {
    if (isMicrophoneCapturing) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('[Voice Capture] navigator.mediaDevices.getUserMedia is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      isMicrophoneCapturing = true;
      console.log('[Voice Capture] Microphone access granted. Starting continuous audio recording...');

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0) {
          const formData = new FormData();
          formData.append('file', event.data, 'audio.wav');

          try {
            const currentVoiceServer = getVoiceServerUrl().replace(/\/+$/, '');
            const targetVoiceUrl = `${currentVoiceServer}/api/voice/audio`;
            const currentCameraServer = getCameraServerUrl().replace(/\/+$/, '');
            const fallbackVoiceUrl = `${currentCameraServer}/api/voice/audio`;

            let response;
            try {
              // Direct dispatch to dedicated voice microservice
              response = await fetch(targetVoiceUrl, {
                method: 'POST',
                body: formData
              });

              // Fallback logic: if direct voice microservice returns server error (502/503/404) and fallback gateway is distinct, attempt fallback
              if (!response.ok && (response.status === 502 || response.status === 503 || response.status === 404) && targetVoiceUrl !== fallbackVoiceUrl) {
                console.warn(`[Voice Capture] Direct voice server responded with HTTP ${response.status}. Attempting fallback to camera gateway: ${fallbackVoiceUrl}`);
                try {
                  const fallbackResp = await fetch(fallbackVoiceUrl, {
                    method: 'POST',
                    body: formData
                  });
                  if (fallbackResp.ok) {
                    response = fallbackResp;
                  }
                } catch (fallbackErr) {
                  console.warn('[Voice Capture] Fallback to camera gateway also failed:', fallbackErr.message);
                }
              }
            } catch (netErr) {
              // Fallback logic: if direct voice microservice is unreachable, fallback to camera gateway
              if (targetVoiceUrl !== fallbackVoiceUrl) {
                console.warn(`[Voice Capture] Direct voice microservice unreachable at ${targetVoiceUrl} (${netErr.message}). Attempting fallback to: ${fallbackVoiceUrl}`);
                try {
                  response = await fetch(fallbackVoiceUrl, {
                    method: 'POST',
                    body: formData
                  });
                } catch (fallbackNetErr) {
                  console.error('[Voice Capture] Fallback to camera gateway also failed:', fallbackNetErr);
                  throw netErr;
                }
              } else {
                throw netErr;
              }
            }

            if (!response.ok) {
              const errText = await response.text();
              console.error(`[Voice Capture] Server error (${response.status}):`, errText);
              return;
            }

            const data = await response.json();
            console.log('[Voice Capture] Audio chunk upload response:', data);

            // Automatically inject a new alert into the 'EMERGENCY ALERT LOG' UI table when a threat is detected
            const threatLevel = (data.threat_level || '').toUpperCase();
            const recognizedKeyword = data.recognized_keyword || null;

            if ((threatLevel && threatLevel !== 'NONE') || recognizedKeyword) {
              console.warn(`[Voice Capture] 🚨 Acoustic Threat Detected: Keyword="${recognizedKeyword}", ThreatLevel="${threatLevel}"`);

              const alertId = data.alert_id || Date.now();
              const timestamp = new Date().toISOString();
              const keywordDisplay = recognizedKeyword ? `"${recognizedKeyword.toUpperCase()}"` : 'DISTRESS';

              const newVoiceAlert = mapBackendAlertToFrontend({
                id: alertId,
                title: `Acoustic Distress: ${keywordDisplay} Detected`,
                threat_level: threatLevel || 'HIGH',
                detection_source: 'AI-VOICE-SENSOR',
                timestamp: timestamp,
                created_at: timestamp,
                latitude: 23.8769,
                longitude: 90.3204,
                location_name: 'Central Command - Acoustic Surveillance Zone',
                description: data.transcript
                  ? `Voice analysis detected keyword ${keywordDisplay}. Transcript: "${data.transcript}"`
                  : `Acoustic threat triggered by keyword ${keywordDisplay}.`,
                status: 'active',
                raw_detection_data: {
                  keyword: recognizedKeyword,
                  transcript: data.transcript || '',
                  sensor: 'voice_emergency',
                  sector: 'Sector 4B',
                  assignedUnit: 'Rapid Acoustic Response Squad'
                }
              });

              // Avoid duplicates if alert already present in alertsState
              const exists = alertsState.some(a => String(a.id) === String(newVoiceAlert.id));
              if (!exists) {
                alertsState.unshift(newVoiceAlert);

                // Re-render the EMERGENCY ALERT LOG table & update threat posture
                renderAlertList();
                evaluateSystemThreatPosture();
                updateThreatSummaryCounters();
                updateMapMarkers(alertsState);

                // Play emergency alarm and trigger toast alert
                audio.playEmergencyAlarm();
                showToast(`🚨 VOICE SOS: Distress Keyword ${keywordDisplay} Detected! Alert logged.`, true);
              }
            }
          } catch (err) {
            console.error('[Voice Capture] Error uploading audio chunk:', err);
          }
        }
      };

      mediaRecorder.onerror = (err) => {
        console.error('[Voice Capture] MediaRecorder error:', err);
      };

      // Record audio in 3-second chunks (3000 ms)
      mediaRecorder.start(3000);
      console.log('[Voice Capture] MediaRecorder started with 3-second chunks.');
    } catch (err) {
      console.error('[Voice Capture] Error accessing microphone:', err);
    }
  }

  window.initContinuousAudioCapture = initContinuousAudioCapture;

  // =========================================================================
  // =========================================================================
  // LEAFLET INTERACTIVE INCIDENT MAP & RADAR ENGINE
  // =========================================================================
  let incidentMap = null;
  let alertMarkersLayer = null;

  /**
   * Initializes the Leaflet interactive map centered at Daffodil Smart City.
   */
  function initIncidentMap() {
    const mapElement = document.getElementById('incident-map');
    if (!mapElement) return;

    if (typeof L === 'undefined') {
      console.warn('[AEGIS Map] Leaflet library not loaded yet.');
      return;
    }

    if (incidentMap) {
      incidentMap.invalidateSize();
      return;
    }

    try {
      // Center at Daffodil Smart City (Lat: 23.8769, Lon: 90.3204) with zoom 14
      incidentMap = L.map('incident-map', {
        center: [23.8769, 90.3204],
        zoom: 14,
        zoomControl: true,
        attributionControl: false
      });

      // Standard OpenStreetMap tile layer (no API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(incidentMap);

      // LayerGroup to store alert markers so they can be cleared and redrawn on every update
      alertMarkersLayer = L.layerGroup().addTo(incidentMap);

      // Campus reference marker (HQ Tactical Command)
      const campusIcon = L.divIcon({
        className: 'campus-center-marker',
        html: '<div style="width: 10px; height: 10px; border-radius: 50%; background: #38bdf8; border: 2px solid #ffffff; box-shadow: 0 0 10px #38bdf8;"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });
      L.marker([23.8769, 90.3204], { icon: campusIcon })
        .bindTooltip('<strong>DAFFODIL SMART CITY</strong><br>HQ Tactical Command', { direction: 'top', className: 'tactical-map-tooltip' })
        .addTo(incidentMap);

      // Invalidate size once container finishes rendering
      setTimeout(() => {
        if (incidentMap) incidentMap.invalidateSize();
      }, 350);

      window.addEventListener('resize', () => {
        if (incidentMap) incidentMap.invalidateSize();
      });

      console.log('[AEGIS Map] Leaflet incident map initialized at Daffodil Smart City [23.8769, 90.3204].');
    } catch (err) {
      console.error('[AEGIS Map] Error initializing Leaflet incident map:', err);
    }
  }

  /**
   * Color-codes and plots active alert markers onto the Leaflet map.
   * Color scheme:
   *   - CRITICAL: #ff1744 (Red)
   *   - HIGH:     #ff9100 (Orange)
   *   - MODERATE: #ffea00 (Yellow)
   *   - LOW:      #00e5ff (Cyan)
   *
   * @param {Array<Object>} alerts - Real-time alert list
   */
  function updateMapMarkers(alerts) {
    if (!alertMarkersLayer || !incidentMap) {
      if (!incidentMap) initIncidentMap();
      if (!alertMarkersLayer) return;
    }

    // Clear existing alert markers
    alertMarkersLayer.clearLayers();

    if (!Array.isArray(alerts) || alerts.length === 0) {
      const mapStatus = document.getElementById('map-status-label');
      if (mapStatus) mapStatus.textContent = 'NO ACTIVE INCIDENTS';
      return;
    }

    const threatColorMap = {
      'CRITICAL': '#ff1744',
      'HIGH': '#ff9100',
      'MODERATE': '#ffea00',
      'MEDIUM': '#ffea00',
      'LOW': '#00e5ff'
    };

    // Tracking count per coordinate to fan out exact overlapping markers
    const coordOccurrences = new Map();

    alerts.forEach((alert, index) => {
      // Ignore resolved alerts from the live tactical map
      if (alert.status === 'resolved') return;

      const rawLat = (alert.latitude !== undefined && alert.latitude !== null) ? alert.latitude : 23.8769;
      const rawLon = (alert.longitude !== undefined && alert.longitude !== null) ? alert.longitude : 90.3204;
      const baseLat = parseFloat(rawLat);
      const baseLon = parseFloat(rawLon);

      if (isNaN(baseLat) || isNaN(baseLon)) return;

      // Group overlapping coordinates to ensure each marker remains visible and clickable
      const coordKey = `${baseLat.toFixed(4)}_${baseLon.toFixed(4)}`;
      const occurrence = coordOccurrences.get(coordKey) || 0;
      coordOccurrences.set(coordKey, occurrence + 1);

      let plotLat = baseLat;
      let plotLon = baseLon;
      if (occurrence > 0) {
        // Small radial displacement (~30-60 meters) so overlapping markers fan out cleanly
        const angle = occurrence * (Math.PI * 2 / 6) + (index * 0.4);
        const radius = 0.00035 * Math.ceil(occurrence / 6);
        plotLat += Math.sin(angle) * radius;
        plotLon += Math.cos(angle) * (radius * 1.1);
      }

      const rawThreat = (alert.threatLevel || alert.threat_level || 'LOW').toUpperCase();
      const threatLevel = (rawThreat === 'MEDIUM') ? 'MODERATE' : rawThreat;
      const markerColor = threatColorMap[threatLevel] || '#00e5ff';
      const isCritical = threatLevel === 'CRITICAL';

      // Create circular tactical marker
      const marker = L.circleMarker([plotLat, plotLon], {
        radius: isCritical ? 9 : 7,
        fillColor: markerColor,
        color: '#ffffff',
        weight: isCritical ? 2 : 1.5,
        opacity: 0.95,
        fillOpacity: 0.82
      });

      const alertId = alert.id || 'N/A';
      const title = alert.title || alert.incidentType || 'Emergency Incident';
      const location = alert.locationName || alert.location || alert.location_name || 'Daffodil Smart City';
      const timeStr = alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';

      // Tooltip on hover
      marker.bindTooltip(`<strong>Alert #${alertId}</strong>: ${threatLevel}`, {
        direction: 'top',
        offset: [0, -6],
        className: 'tactical-map-tooltip'
      });

      // Interactive popup on click
      marker.bindPopup(`
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; line-height: 1.45; color: #f8fafc; min-width: 170px;">
          <div style="font-weight: 700; color: ${markerColor}; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 4px;">
            🚨 ALERT #${alertId} [${threatLevel}]
          </div>
          <div style="font-size: 11px; color: #cbd5e1; font-weight: 600;">${title}</div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">📍 ${location}</div>
          <div style="font-size: 9px; color: #64748b; margin-top: 4px;">
            LAT: ${baseLat.toFixed(4)} | LON: ${baseLon.toFixed(4)}
            ${timeStr ? '<br>TIME: ' + timeStr : ''}
          </div>
        </div>
      `);

      alertMarkersLayer.addLayer(marker);
    });

    // Update map status label
    const mapStatus = document.getElementById('map-status-label');
    if (mapStatus) {
      const activeCount = alerts.filter(a => a.status !== 'resolved').length;
      mapStatus.textContent = `${activeCount} ACTIVE INCIDENT${activeCount === 1 ? '' : 'S'}`;
    }
  }

  // =========================================================================
  // ALERT LOG RENDERING & FILTERING
  // =========================================================================

  function getRelativeTimeString(dateInput) {
    if (!dateInput) return 'Just now';
    const date = parseUtcDate(dateInput);
    if (!date || isNaN(date.getTime())) return 'Just now';

    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    // Negative difference (slight clock skew) or very fresh alert
    if (diffSec < 10) return 'Just now';
    if (diffSec < 45) return 'a few seconds ago';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  }

  function getExactTimeString(dateInput) {
    if (!dateInput) return '--:--:--';
    const date = parseUtcDate(dateInput);
    if (!date || isNaN(date.getTime())) return '--:--:--';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  function updateThreatSummaryCounters() {
    let crit = 0, high = 0, mod = 0, low = 0;
    alertsState.forEach(a => {
      const status = (a.status || '').toLowerCase();
      if (status !== 'resolved') {
        const threat = (a.threat_level || a.threatLevel || '').toUpperCase();
        if (threat === 'CRITICAL') crit++;
        else if (threat === 'HIGH') high++;
        else if (threat === 'MODERATE' || threat === 'MEDIUM') mod++;
        else if (threat === 'LOW') low++;
      }
    });

    if (elCountCritical) elCountCritical.textContent = crit;
    if (elCountHigh) elCountHigh.textContent = high;
    if (elCountModerate) elCountModerate.textContent = mod;
    if (elCountLow) elCountLow.textContent = low;
    if (elTotalAlertsCount) elTotalAlertsCount.textContent = alertsState.length;
    if (elTotalPoolCount) elTotalPoolCount.textContent = alertsState.length;
  }

  function renderAlertList() {
    if (!elAlertListContainer) return;
    elAlertListContainer.innerHTML = '';

    // Filter alerts by threat level, status, and search query
    const filtered = alertsState.filter(item => {
      // Threat filter (support both threat_level and threatLevel, including MEDIUM / MODERATE)
      const itemThreat = (item.threat_level || item.threatLevel || '').toUpperCase();
      if (activeThreatFilter !== 'ALL') {
        if (activeThreatFilter === 'MODERATE' && (itemThreat === 'MEDIUM' || itemThreat === 'MODERATE')) {
          // match
        } else if (itemThreat !== activeThreatFilter) {
          return false;
        }
      }
      // Status filter
      const itemStatus = (item.status || '').toLowerCase();
      if (activeStatusFilter !== 'all' && itemStatus !== activeStatusFilter.toLowerCase()) {
        return false;
      }
      // Search keyword
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const idStr = String(item.id || '').toLowerCase();
        const titleStr = (item.title || item.incidentType || '').toLowerCase();
        const locStr = (item.location_name || item.location || '').toLowerCase();
        const srcStr = (item.detection_source || item.source || '').toLowerCase();
        const sectorStr = (item.sector || '').toLowerCase();
        const descStr = (item.description || '').toLowerCase();
        const match = idStr.includes(q) ||
          locStr.includes(q) ||
          srcStr.includes(q) ||
          sectorStr.includes(q) ||
          titleStr.includes(q) ||
          itemThreat.toLowerCase().includes(q) ||
          descStr.includes(q);
        if (!match) return false;
      }
      return true;
    });

    if (elVisibleAlertCount) {
      elVisibleAlertCount.textContent = filtered.length;
    }

    if (alertsState.length === 0) {
      elAlertListContainer.innerHTML = `
        <div class="alert-empty-state">
          <div class="empty-icon">🛡️</div>
          <div class="font-bold">NO ALERTS IN SYSTEM</div>
          <p class="font-mono text-secondary">All monitored sectors operating within expected parameters. Alerts strictly sync from FastAPI backend at ${SOS_BACKEND_CONFIG.baseUrl}.</p>
        </div>
      `;
      updateThreatSummaryCounters();
      return;
    }

    if (filtered.length === 0) {
      elAlertListContainer.innerHTML = `
        <div class="alert-empty-state">
          <div class="empty-icon">🛡️</div>
          <div class="font-bold">NO MATCHING ALERTS RECORDED</div>
          <p class="font-mono text-secondary">No alerts match the current filter criteria.</p>
        </div>
      `;
      updateThreatSummaryCounters();
      return;
    }

    filtered.forEach(alert => {
      const row = document.createElement('article');

      // 1. Read threat level using exact backend key: alert.threat_level
      const rawThreat = (alert.threat_level || alert.threatLevel || 'HIGH').toUpperCase();
      const isCritical = rawThreat === 'CRITICAL';
      const isHigh = rawThreat === 'HIGH';
      const isMod = rawThreat === 'MEDIUM' || rawThreat === 'MODERATE';

      let threatClass = 'low';
      if (isCritical) threatClass = 'critical';
      else if (isHigh) threatClass = 'high';
      else if (isMod) threatClass = 'moderate';

      const alertStatus = (alert.status || 'ACTIVE').toLowerCase();
      row.className = `alert-row alert-card threat-${threatClass} status-${alertStatus}`;
      row.id = `alert-card-${alert.id}`;
      row.setAttribute('tabindex', '0');
      row.setAttribute('role', 'article');
      row.setAttribute('data-id', String(alert.id));

      // Status tag
      let statusTagClass = 'status-tag-active';
      let statusText = (alert.status || 'ACTIVE').toUpperCase();
      if (alertStatus === 'acknowledged') {
        statusTagClass = 'status-tag-acknowledged';
        statusText = 'ACKNOWLEDGED';
      } else if (alertStatus === 'resolved') {
        statusTagClass = 'status-tag-resolved';
        statusText = 'RESOLVED';
      }

      // 2. Read title and source using exact backend keys: alert.title & alert.detection_source
      const alertTitle = alert.title || alert.incidentType || 'Emergency Incident Alert';
      const sourceLabel = alert.detection_source || alert.source || alert.location_name || alert.location || 'AI SENSOR';

      // 3. Read timestamp using exact backend keys: alert.timestamp or alert.created_at
      const rawTimestamp = alert.timestamp || alert.created_at || alert.time;
      const formattedTime = getExactTimeString(rawTimestamp);

      row.innerHTML = `
        <!-- [Threat Level Badge] -->
        <div class="alert-col-threat">
          <span class="threat-level-badge badge-threat-${threatClass}">${rawThreat}</span>
        </div>

        <!-- [Alert Title / Source] -->
        <div class="alert-col-info">
          <span class="alert-title">${alertTitle}</span>
          <span class="alert-source-sep" aria-hidden="true">•</span>
          <span class="alert-source font-mono">${sourceLabel}</span>
        </div>

        <!-- [Time] -->
        <div class="alert-col-time font-mono">
          <span class="time-exact">${formattedTime}</span>
        </div>

        <!-- [Status Badge] -->
        <div class="alert-col-status">
          <span class="incident-status-tag ${statusTagClass}">${statusText}</span>
        </div>
      `;

      // Clicking an alert row opens the full incident dossier details modal
      row.addEventListener('click', () => {
        openDossierModal(alert.id);
      });

      elAlertListContainer.appendChild(row);
    });

    // Attach card action listeners
    attachCardActionListeners();
    updateThreatSummaryCounters();
  }

  function attachCardActionListeners() {
    // Locate button: Switches live camera to alert location
    document.querySelectorAll('.btn-action-locate').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const camKey = btn.getAttribute('data-locate-cam') || 'cam-1';
        switchCamera(camKey);
        // Scroll camera viewport into view smoothly if scrolled down
        document.querySelector('.camera-hero-section').scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Acknowledge button: strictly relies on PATCH /api/v1/alerts/{id}
    document.querySelectorAll('[data-action="ack"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const alertId = btn.getAttribute('data-id');
        const target = alertsState.find(a => String(a.id) === String(alertId));
        if (!target) return;

        btn.disabled = true;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span>UPDATING...</span>';

        try {
          const res = await updateBackendAlertStatus(alertId, 'ACKNOWLEDGED');
          target.status = 'acknowledged';
          audio.playAckTone();
          showToast(`⚡ Backend Confirmed: Alert #${alertId} Acknowledged in SQLite`);
          renderAlertList();
          evaluateSystemThreatPosture();
        } catch (err) {
          showToast(`❌ Backend Unreachable: Unable to acknowledge alert #${alertId} (${err.message}). Status unchanged.`, true);
          console.error('[Alert Ack Error]', err);
        } finally {
          btn.disabled = false;
          btn.innerHTML = originalText;
        }
      });
    });

    // Resolve button: strictly relies on PATCH /api/v1/alerts/{id}
    document.querySelectorAll('[data-action="resolve"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const alertId = btn.getAttribute('data-id');
        const target = alertsState.find(a => String(a.id) === String(alertId));
        if (!target) return;

        btn.disabled = true;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span>RESOLVING...</span>';

        try {
          const res = await updateBackendAlertStatus(alertId, 'RESOLVED');
          target.status = 'resolved';
          audio.playBeep(880, 'sine', 0.1, 0.1);
          showToast(`⚡ Backend Confirmed: Incident #${alertId} Marked RESOLVED in SQLite (ALL CLEAR)`);
          renderAlertList();
          evaluateSystemThreatPosture();
        } catch (err) {
          showToast(`❌ Backend Unreachable: Unable to resolve alert #${alertId} (${err.message}). Status unchanged.`, true);
          console.error('[Alert Resolve Error]', err);
        } finally {
          btn.disabled = false;
          btn.innerHTML = originalText;
        }
      });
    });

    // Dossier button
    document.querySelectorAll('[data-action="dossier"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const alertId = btn.getAttribute('data-id');
        openDossierModal(alertId);
      });
    });
  }

  // =========================================================================
  // FILTERING LOGIC
  // =========================================================================
  document.querySelectorAll('.threat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.threat-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeThreatFilter = chip.getAttribute('data-filter-threat');
      audio.playBeep(700, 'sine', 0.04, 0.08);
      renderAlertList();
    });
  });

  document.querySelectorAll('.status-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.status-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeStatusFilter = btn.getAttribute('data-status-filter');
      audio.playBeep(700, 'sine', 0.04, 0.08);
      renderAlertList();
    });
  });

  // Search input with instant filter
  elSearchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    elClearSearch.classList.toggle('visible', searchQuery.length > 0);
    renderAlertList();
  });

  elClearSearch.addEventListener('click', () => {
    elSearchInput.value = '';
    searchQuery = '';
    elClearSearch.classList.remove('visible');
    renderAlertList();
    elSearchInput.focus();
  });

  // Acknowledge All: strictly updates each active alert in the backend
  elAckAllBtn.addEventListener('click', async () => {
    const activeAlerts = alertsState.filter(a => a.status === 'active');
    if (activeAlerts.length === 0) {
      showToast('No active pending alerts to acknowledge');
      return;
    }

    elAckAllBtn.disabled = true;
    showToast(`Transmitting acknowledgement for ${activeAlerts.length} active alerts to backend...`);

    let ackSuccessCount = 0;
    let failedCount = 0;
    for (const a of activeAlerts) {
      try {
        await updateBackendAlertStatus(a.id, 'ACKNOWLEDGED');
        a.status = 'acknowledged';
        ackSuccessCount++;
      } catch (err) {
        failedCount++;
        console.error(`[Bulk Ack Failure] Alert #${a.id}:`, err);
      }
    }

    elAckAllBtn.disabled = false;

    if (ackSuccessCount > 0) {
      audio.playAckTone();
      showToast(`⚡ Backend Confirmed: Acknowledged ${ackSuccessCount} of ${activeAlerts.length} alerts in database`);
      renderAlertList();
      evaluateSystemThreatPosture();
    }
    if (failedCount > 0) {
      showToast(`❌ Backend Unreachable: Failed to acknowledge ${failedCount} alerts. Server offline.`, true);
    }
  });

  // Export Incident Log (JSON)
  elExportLogBtn.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(alertsState, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `AEGIS_SOS_INCIDENT_LOG_${Date.now()}.json`);
    dlAnchor.click();
    showToast('Exported Emergency SOS log dossier to JSON');
  });

  // Purge All Alert Logs & Reset System Data
  if (btnPurgeAlerts) {
    btnPurgeAlerts.addEventListener('click', async () => {
      const confirmed = confirm("Are you sure you want to purge all alert logs? This action cannot be undone.");
      if (!confirmed) return;

      btnPurgeAlerts.disabled = true;
      const originalHtml = btnPurgeAlerts.innerHTML;
      btnPurgeAlerts.innerHTML = '<span>PURGING...</span>';

      try {
        const response = await fetch(SOS_BACKEND_CONFIG.alertsEndpoint, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}`);
        }

        const data = await response.json();
        const deletedCount = (data && typeof data.deleted_count === 'number') ? data.deleted_count : 0;

        // Instantly clear alerts state and UI alert rows
        alertsState = [];
        if (elAlertListContainer) {
          elAlertListContainer.innerHTML = '';
        }

        // Reset all threat level counters back to 0
        if (elCountCritical) elCountCritical.textContent = '0';
        if (elCountHigh) elCountHigh.textContent = '0';
        if (elCountModerate) elCountModerate.textContent = '0';
        if (elCountLow) elCountLow.textContent = '0';
        if (elTotalAlertsCount) elTotalAlertsCount.textContent = '0';
        if (elTotalPoolCount) elTotalPoolCount.textContent = '0';
        if (elVisibleAlertCount) elVisibleAlertCount.textContent = '0';

        // Re-render empty state and evaluate system posture
        renderAlertList();
        evaluateSystemThreatPosture();
        updateMapMarkers([]);

        audio.playAckTone();
        showToast(`🗑️ Alert logs purged (${deletedCount} records removed). Threat counters reset to 0.`);
      } catch (err) {
        console.error('[Purge Error] Failed to purge alert logs:', err);
        showToast(`❌ Failed to purge alert logs: ${err.message}`, true);
      } finally {
        btnPurgeAlerts.disabled = false;
        btnPurgeAlerts.innerHTML = originalHtml;
      }
    });
  }

  // =========================================================================
  // =========================================================================
  // EMERGENCY SOS TRIGGER (STRICTLY TRANSMITS REAL ALERT TO BACKEND)
  // Simulation fallback removed: UI only updates upon real backend confirmation.
  // =========================================================================
  const SOS_SCENARIOS = [
    {
      type: 'Wearable Duress SOS Beacon - High Impact Crash',
      loc: 'Perimeter West Gate - Sector 4B',
      sector: 'Sector 4B',
      coords: '37°46\'29.8"N 122°25\'12.4"W',
      cam: 'cam-1',
      desc: 'Mobile security vehicle beacon triggered G-force sensor limit (6.8G). Urgent responder dispatch required.',
      hr: '158 BPM [CRIT]',
      o2: '94%',
      unit: 'Rapid Squad Alpha (DISPATCHED)'
    },
    {
      type: 'Toxic Chemical Gas Leak & Triage Alarm',
      loc: 'Sub-Level 2 - Chemical Depot B',
      sector: 'Sector 3A',
      coords: '37°46\'18.5"N 122°25\'02.1"W',
      cam: 'cam-2',
      desc: 'Flammable vapor sensor exceeded 120 PPM threshold. Automated ventilation lockdown tripped.',
      hr: '144 BPM',
      o2: '14.1% [DANGER]',
      unit: 'Medic Team 02'
    },
    {
      type: 'Armed Intrusion Detection - Perimeter Fence Breach',
      loc: 'North Helipad Gate - Access Point 2',
      sector: 'Sector 1',
      coords: '37°46\'23.0"N 122°25\'11.2"W',
      cam: 'cam-3',
      desc: 'Optical tripwire cut. Two unauthorized heat signatures approaching command communications tower.',
      hr: '--',
      o2: '--',
      unit: 'Drone Recon 01'
    }
  ];

  async function triggerSimulatedSos() {
    const scenario = SOS_SCENARIOS[Math.floor(Math.random() * SOS_SCENARIOS.length)];

    elSimulateSosBtn.disabled = true;
    showToast('📡 Transmitting Emergency SOS Beacon to Backend...');

    try {
      const result = await sendDetectionData({
        title: scenario.type,
        threatLevel: 'CRITICAL',
        location: scenario.loc,
        sector: scenario.sector,
        coords: scenario.coords,
        description: scenario.desc,
        telemetry: {
          hr: scenario.hr,
          o2: scenario.o2,
          signal: '-52 dBm',
          battery: '94%'
        },
        detection_source: scenario.cam ? scenario.cam.toUpperCase() : 'AI_CAMERA',
        raw_detection_data: {
          sector: scenario.sector,
          assignedUnit: scenario.unit,
          telemetry: {
            hr: scenario.hr,
            o2: scenario.o2,
            signal: '-52 dBm',
            battery: '94%'
          }
        }
      });

      // Map verified backend alert data
      const confirmedAlert = mapBackendAlertToFrontend(result.data);
      alertsState.unshift(confirmedAlert);

      // Audio alarm and camera switch ONLY on real backend success
      audio.playEmergencyAlarm();
      switchCamera(scenario.cam);
      evaluateSystemThreatPosture();
      renderAlertList();

      showToast(`🚨 REAL BACKEND CONFIRMED: SOS #${confirmedAlert.id} recorded [SMS: ${result.data.sms_status}] in ${confirmedAlert.sector}`, true);
      document.querySelector('.camera-hero-section').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      showToast(`❌ Backend Unreachable: Emergency SOS rejected (${err.message}). Action aborted.`, true);
      console.error('[SOS Trigger Failure]', err);
    } finally {
      if (elSimulateSosBtn) elSimulateSosBtn.disabled = false;
    }
  }

  if (elSimulateSosBtn) {
    elSimulateSosBtn.addEventListener('click', triggerSimulatedSos);
  }
  window.triggerSimulatedSos = triggerSimulatedSos;

  // Audio Toggle
  if (elAudioToggle) {
    elAudioToggle.addEventListener('click', () => {
      const isUnmuted = audio.toggleMute();
      if (elAudioStatusText) {
        elAudioStatusText.textContent = isUnmuted ? 'AUDIO ON' : 'AUDIO MUTED';
      }
      elAudioToggle.classList.toggle('btn-secondary-accent', isUnmuted);
      if (isUnmuted) {
        audio.playBeep(980, 'sine', 0.1, 0.15);
        showToast('Tactical audio alerts enabled');
      } else {
        showToast('Tactical audio muted');
      }
    });
  }

  // Dark / Light Mode Theme Toggle
  function updateThemeUI(isLight) {
    if (elThemeStatusText) {
      elThemeStatusText.textContent = isLight ? 'DARK MODE' : 'LIGHT MODE';
    }
    if (elThemeIcon) {
      if (isLight) {
        // Moon icon for switching back to dark
        elThemeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
      } else {
        // Sun icon for switching to light
        elThemeIcon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>';
      }
    }
  }

  // Restore saved theme preference if any
  try {
    const savedTheme = localStorage.getItem('sos_system_theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
      updateThemeUI(true);
    }
  } catch (storageErr) {
    console.warn('Could not read localStorage for theme:', storageErr);
  }

  if (elThemeToggle) {
    elThemeToggle.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-mode');
      try {
        localStorage.setItem('sos_system_theme', isLight ? 'light' : 'dark');
      } catch (storageErr) {
        console.warn('Could not save theme to localStorage:', storageErr);
      }
      updateThemeUI(isLight);
      showToast(isLight ? 'Switched to Light Mode' : 'Switched to Dark Mode');
    });
  }

  // Emergency banner buttons: strictly relies on PATCH /api/v1/alerts/{id}
  elBannerAckBtn.addEventListener('click', async () => {
    const firstCrit = alertsState.find(a => a.threatLevel === 'CRITICAL' && a.status === 'active');
    if (!firstCrit) return;

    elBannerAckBtn.disabled = true;
    try {
      await updateBackendAlertStatus(firstCrit.id, 'ACKNOWLEDGED');
      firstCrit.status = 'acknowledged';
      audio.playAckTone();
      renderAlertList();
      evaluateSystemThreatPosture();
      showToast(`⚡ Critical Alert #${firstCrit.id} Acknowledged in Backend`);
    } catch (err) {
      showToast(`❌ Backend Unreachable: Unable to acknowledge alert #${firstCrit.id} (${err.message}).`, true);
      console.error('[Banner Ack Failure]', err);
    } finally {
      elBannerAckBtn.disabled = false;
    }
  });

  elBannerViewBtn.addEventListener('click', () => {
    const firstCrit = alertsState.find(a => a.threatLevel === 'CRITICAL' && a.status === 'active');
    if (firstCrit) {
      switchCamera(firstCrit.linkedCam || 'cam-1');
      document.querySelector('.camera-hero-section').scrollIntoView({ behavior: 'smooth' });
    }
  });

  // =========================================================================
  // MODAL: CREATE NEW EMERGENCY ALERT MANUALLY
  // =========================================================================
  btnOpenCreateAlert.addEventListener('click', () => {
    modalCreateAlert.classList.add('active');
    audio.playBeep(640, 'sine', 0.05, 0.08);
  });

  function closeModal() {
    modalCreateAlert.classList.remove('active');
    formCreateAlert.reset();
  }

  btnCloseModal.addEventListener('click', closeModal);
  btnCancelModal.addEventListener('click', closeModal);

  formCreateAlert.addEventListener('submit', async (e) => {
    e.preventDefault();

    const threatLevel = document.getElementById('input-threat-level').value;
    const incidentType = document.getElementById('input-incident-type').value;
    const locationName = document.getElementById('input-location-name').value;
    const sectorCode = document.getElementById('input-sector-code').value;
    const details = document.getElementById('input-details').value || 'Operator registered emergency incident.';
    const assignedCam = document.getElementById('input-assigned-camera').value;
    const autoDispatch = document.getElementById('input-auto-dispatch').value;

    let assignedUnit = 'Unassigned';
    if (autoDispatch === 'ALPHA') assignedUnit = 'Rapid Squad Alpha (Dispatched)';
    else if (autoDispatch === 'MEDIC') assignedUnit = 'Medic Team 02 (En Route)';
    else if (autoDispatch === 'DRONE') assignedUnit = 'Recon Drone 01 (Airborne)';

    const btnSubmit = formCreateAlert.querySelector('button[type="submit"]');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'TRANSMITTING TO BACKEND...';
    }

    try {
      const result = await sendDetectionData({
        title: incidentType,
        threatLevel: threatLevel,
        location: locationName,
        sector: sectorCode,
        coords: '37°46\'28.0"N 122°25\'10.0"W',
        description: details,
        telemetry: {
          hr: threatLevel === 'CRITICAL' ? '148 BPM' : '78 BPM',
          o2: '98%',
          signal: '-60 dBm',
          battery: '99%'
        },
        detection_source: assignedCam ? assignedCam.toUpperCase() : 'MANUAL_DISPATCH',
        raw_detection_data: {
          autoDispatch,
          assignedUnit,
          sector: sectorCode,
          telemetry: {
            hr: threatLevel === 'CRITICAL' ? '148 BPM' : '78 BPM',
            o2: '98%',
            signal: '-60 dBm',
            battery: '99%'
          }
        }
      });

      closeModal();
      const confirmedAlert = mapBackendAlertToFrontend(result.data);
      alertsState.unshift(confirmedAlert);

      if (threatLevel === 'CRITICAL') {
        audio.playEmergencyAlarm();
      } else {
        audio.playBeep(880, 'sine', 0.1, 0.15);
      }

      renderAlertList();
      evaluateSystemThreatPosture();
      showToast(`⚡ Real Alert #${confirmedAlert.id} Stored in Backend [SMS: ${result.data.sms_status}]`, threatLevel === 'CRITICAL');
    } catch (err) {
      showToast(`❌ Backend Unreachable: Failed to register alert (${err.message}). Alert was NOT created.`, true);
      console.error('[Create Alert Failure]', err);
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'DISPATCH SOS BROADCAST';
      }
    }
  });

  // =========================================================================
  // MODAL: ALERT DOSSIER INSPECTOR
  // =========================================================================
  // =========================================================================
  // MODAL: ALERT DOSSIER INSPECTOR
  // =========================================================================
  function openIncidentDossier(alertOrId) {
    let alert;
    if (typeof alertOrId === 'object' && alertOrId !== null) {
      alert = alertOrId;
    } else {
      alert = alertsState.find(a => String(a.id) === String(alertOrId));
    }
    if (!alert) return;

    // Normalize raw_detection_data if stringified
    if (typeof alert.raw_detection_data === 'string') {
      try {
        alert.raw_detection_data = JSON.parse(alert.raw_detection_data);
      } catch (_) {
        alert.raw_detection_data = {};
      }
    }

    const threatLevel = (alert.threat_level || alert.threatLevel || 'HIGH').toUpperCase();
    const alertTitle = alert.title || alert.incidentType || 'Emergency Incident Alert';
    const locationName = alert.location_name || alert.location || 'Daffodil Smart City - Ashulia, Dhaka';
    const alertSource = alert.detection_source || alert.source || 'AI SENSOR';
    const rawTime = alert.timestamp || alert.created_at || alert.time;
    const rawData = alert.raw_detection_data || {};

    const telemetry = alert.telemetry || rawData.telemetry || {
      hr: '--', o2: '--', signal: '-60 dBm', battery: '95%'
    };

    // Dynamic coordinates
    const lat = alert.latitude != null ? alert.latitude : 23.8769;
    const lon = alert.longitude != null ? alert.longitude : 90.3204;

    if (detailThreatBadge) {
      detailThreatBadge.textContent = `${threatLevel} // LEVEL ${threatLevel === 'CRITICAL' ? '1' : threatLevel === 'HIGH' ? '2' : '3'}`;
      detailThreatBadge.className = `detail-threat-pill badge-threat-${threatLevel.toLowerCase()}`;
    }

    // Ensure template exists in modal-detail-body
    if (!document.getElementById('dossier-snapshot-img')) {
      modalDetailBody.innerHTML = `
        <div class="dossier-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div style="background: rgba(0,0,0,0.4); padding: 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.68rem; color: var(--text-muted); font-weight: 700;">INCIDENT IDENTIFIER</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: #fff;" class="font-mono" id="dossier-incident-id">#--</div>
            <div style="font-size: 0.75rem; color: var(--color-low); margin-top: 4px;" id="dossier-incident-title">--</div>
          </div>

          <div style="background: rgba(0,0,0,0.4); padding: 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.68rem; color: var(--text-muted); font-weight: 700;">TIMESTAMP &amp; DURATION</div>
            <div style="font-size: 0.9rem; font-weight: 600; color: #fff;" class="font-mono" id="dossier-timestamp">--:--:--</div>
            <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 4px;" id="dossier-elapsed">Elapsed: --</div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.35); padding: 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.68rem; color: var(--text-muted); font-weight: 700; margin-bottom: 4px;">LOCATION &amp; GEODETIC COORDINATES</div>
          <div style="color: #fff; font-size: 0.9rem; font-weight: 600;" id="dossier-location">📍 Daffodil Smart City - Ashulia, Dhaka</div>
          <div class="font-mono text-cyan" style="font-size: 0.75rem; margin-top: 2px;" id="dossier-coords">GPS: LAT 23.8769, LON 90.3204</div>
        </div>

        <div id="dossier-telemetry-section" style="background: rgba(0,0,0,0.4); padding: 14px; border-radius: 8px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; letter-spacing: 0.05em;">
            <span>PRIMARY OPTICAL SNAPSHOT // INCIDENT VISUAL TELEMETRY</span>
            <span id="dossier-snapshot-badge" style="color: #ff3366; font-size: 0.68rem; font-weight: 700; display: none;" class="font-mono">LIVE AI OPTICAL CAPTURE</span>
          </div>

          <!-- Prominently Expanded Optical Snapshot Image Container -->
          <div id="dossier-snapshot-container" style="display: none; width: 100%; border-radius: 6px; overflow: hidden; background: #050811; border: 1px solid rgba(255, 23, 68, 0.45); box-shadow: 0 0 24px rgba(255, 23, 68, 0.25); text-align: center;">
            <img id="dossier-snapshot-img" src="" alt="Live Optical Incident Snapshot" style="width: 100%; max-height: 440px; min-height: 220px; object-fit: contain; display: block; margin: 0 auto; background: #070a10;">
          </div>

          <!-- Fallback when no optical snapshot is available -->
          <div id="dossier-snapshot-fallback" style="display: none; padding: 28px 16px; text-align: center; background: rgba(255, 23, 68, 0.05); border: 1px dashed rgba(255, 23, 68, 0.25); border-radius: 6px;">
            <div style="font-size: 1.8rem; margin-bottom: 6px;">📷</div>
            <div style="font-size: 0.82rem; font-weight: 700; color: #fff; font-family: var(--font-tactical); letter-spacing: 0.06em;">NO OPTICAL SNAPSHOT AVAILABLE</div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px; font-family: var(--font-mono);">Hardware camera feed was offline, disengaged, or occupied during distress detection.</div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.68rem; color: var(--text-muted); font-weight: 700; margin-bottom: 4px;">INCIDENT LOG DETAILS</div>
          <p style="font-size: 0.82rem; line-height: 1.5; color: var(--text-primary); margin: 0;" id="dossier-description">Emergency telemetry alert registered.</p>
        </div>

        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 0.68rem; color: var(--text-muted); font-weight: 700;">ASSIGNED RESPONDER MATRIX</div>
            <div style="font-size: 0.85rem; font-weight: 700; color: #fff;" id="dossier-assigned-unit">Rapid Squad Alpha</div>
          </div>
          <button type="button" class="tactical-btn btn-secondary-accent" id="btn-dossier-radio" onclick="alert('Dispatch radio transmission active on emergency channel 4');">
            DISPATCH RADIO
          </button>
        </div>
      `;
    }

    // Populate textual info
    const elId = document.getElementById('dossier-incident-id');
    if (elId) elId.textContent = `#${alert.id}`;

    const elTitle = document.getElementById('dossier-incident-title');
    if (elTitle) elTitle.textContent = alertTitle;

    const elTime = document.getElementById('dossier-timestamp');
    if (elTime) elTime.textContent = getExactTimeString(rawTime);

    const elElapsed = document.getElementById('dossier-elapsed');
    if (elElapsed) elElapsed.textContent = `Elapsed: ${getRelativeTimeString(rawTime)}`;

    const elLoc = document.getElementById('dossier-location');
    if (elLoc) elLoc.textContent = `📍 ${locationName}`;

    const elCoords = document.getElementById('dossier-coords');
    if (elCoords) elCoords.textContent = `GPS: LAT ${lat}, LON ${lon} [${alertSource}]`;

    const elDesc = document.getElementById('dossier-description');
    if (elDesc) elDesc.textContent = alert.description || 'Emergency telemetry alert registered.';

    const elUnit = document.getElementById('dossier-assigned-unit');
    if (elUnit) elUnit.textContent = alert.assignedUnit || 'Rapid Squad Alpha';

    // Optical Snapshot Logic (checks alert.snapshot_b64 first, falls back to raw_detection_data)
    const snapshotContainer = document.getElementById('dossier-snapshot-container');
    const snapshotImg = document.getElementById('dossier-snapshot-img');
    const snapshotFallback = document.getElementById('dossier-snapshot-fallback');
    const snapshotBadge = document.getElementById('dossier-snapshot-badge');

    const rawSnapshot = alert.snapshot_b64 || (alert.raw_detection_data && alert.raw_detection_data.snapshot_b64) || null;

    if (rawSnapshot && typeof rawSnapshot === 'string' && rawSnapshot.trim().length > 50) {
      const srcUrl = rawSnapshot.startsWith('data:') ? rawSnapshot : `data:image/jpeg;base64,${rawSnapshot.trim()}`;
      if (snapshotImg) {
        snapshotImg.src = srcUrl;
        snapshotImg.style.display = 'block';
      }
      if (snapshotContainer) {
        snapshotContainer.style.display = 'block';
      }
      if (snapshotFallback) {
        snapshotFallback.style.display = 'none';
      }
      if (snapshotBadge) {
        snapshotBadge.style.display = 'inline';
      }
    } else {
      if (snapshotImg) {
        snapshotImg.src = '';
        snapshotImg.style.display = 'none';
      }
      if (snapshotContainer) {
        snapshotContainer.style.display = 'none';
      }
      if (snapshotFallback) {
        snapshotFallback.style.display = 'block';
      }
      if (snapshotBadge) {
        snapshotBadge.style.display = 'none';
      }
    }

    modalDetailFooter.innerHTML = `
      <button class="tactical-btn btn-ghost" id="btn-close-dossier-footer">CLOSE DOSSIER</button>
      <button class="tactical-btn btn-secondary-accent" id="btn-dossier-cam">LOCATE ON OPTICS</button>
      <button class="tactical-btn btn-secondary-accent" id="btn-dossier-sync-backend">SYNC TO BACKEND</button>
      ${alert.status === 'active' ? `<button class="tactical-btn btn-critical-solid" id="btn-dossier-ack">ACKNOWLEDGE THREAT</button>` : ''}
    `;

    document.getElementById('btn-close-dossier-footer').addEventListener('click', () => {
      modalAlertDetails.classList.remove('active');
    });

    document.getElementById('btn-dossier-cam').addEventListener('click', () => {
      modalAlertDetails.classList.remove('active');
      switchCamera(alert.linkedCam || 'cam-1');
      document.querySelector('.camera-hero-section').scrollIntoView({ behavior: 'smooth' });
    });

    const btnDossierSync = document.getElementById('btn-dossier-sync-backend');
    if (btnDossierSync) {
      btnDossierSync.textContent = `SYNCED (ID #${alert.id})`;
      btnDossierSync.disabled = true;
    }

    const btnDossierAck = document.getElementById('btn-dossier-ack');
    if (btnDossierAck) {
      btnDossierAck.addEventListener('click', async () => {
        btnDossierAck.disabled = true;
        try {
          await updateBackendAlertStatus(alert.id, 'ACKNOWLEDGED');
          alert.status = 'acknowledged';
          audio.playAckTone();
          modalAlertDetails.classList.remove('active');
          renderAlertList();
          evaluateSystemThreatPosture();
          showToast(`⚡ Incident #${alert.id} Acknowledged in Backend`);
        } catch (err) {
          showToast(`❌ Backend Unreachable: Unable to acknowledge incident #${alert.id} (${err.message}).`, true);
          console.error('[Dossier Ack Failure]', err);
        } finally {
          btnDossierAck.disabled = false;
        }
      });
    }

    modalAlertDetails.classList.add('active');
    audio.playBeep(720, 'sine', 0.05, 0.08);
  }

  const openDossierModal = openIncidentDossier;
  window.openIncidentDossier = openIncidentDossier;
  window.openDossierModal = openIncidentDossier;

  btnCloseDetailModal.addEventListener('click', () => {
    modalAlertDetails.classList.remove('active');
  });

  // Close modals on Escape key or backdrop click
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modalCreateAlert.classList.remove('active');
      modalAlertDetails.classList.remove('active');
    }
  });

  [modalCreateAlert, modalAlertDetails].forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('active');
      }
    });
  });

  // Initial render & backend probe: strictly loads real alerts from backend
  if (elAlertListContainer) {
    elAlertListContainer.innerHTML = '';
  }
  renderAlertList();
  evaluateSystemThreatPosture();
  initIncidentMap();

  // Initial immediate fetch
  fetchAlertsFromBackend();

  // Active polling: poll backend every 2.5 seconds (2500ms) for real-time automatic UI updates
  const BACKEND_POLL_INTERVAL_MS = 2500;
  const alertPollIntervalId = setInterval(() => {
    fetchAlertsFromBackend();
  }, BACKEND_POLL_INTERVAL_MS);
  window.alertPollIntervalId = alertPollIntervalId;
  console.log(`[SOS-BACK API] Real-time backend alert polling started (every ${BACKEND_POLL_INTERVAL_MS}ms).`);

  checkBackendHealth().then(health => {
    const isOnline = !!(health && health.online);
    updateServerConnectionStatus(isOnline);
    if (!isOnline) {
      console.warn('[SOS-BACK API] Backend is currently offline. Actions require online server.');
    }
  });

  // Initialize local webcam video capture & frame streaming
  initLocalWebcamCapture();

  // Initialize continuous microphone audio capture
  initContinuousAudioCapture();

  // If user interaction is required by browser security policy to access media devices,
  // ensure capture initiates upon the first user interaction.
  const triggerMediaCaptureOnInteraction = () => {
    if (!isLocalWebcamActive) {
      initLocalWebcamCapture();
    }
    if (!isMicrophoneCapturing) {
      initContinuousAudioCapture();
    }
  };
  window.addEventListener('click', triggerMediaCaptureOnInteraction, { once: true });
  window.addEventListener('keydown', triggerMediaCaptureOnInteraction, { once: true });

  console.log('AEGIS Emergency SOS Command System Initialized.');
})();
