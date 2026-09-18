import React, { useEffect, useState } from 'react';
import { CheckCircle2, MapPin, Navigation, ShieldCheck } from 'lucide-react';
import { Circle, CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { cognitiveStore } from '../lib/store/cognitiveStore';

const CHECK_INTERVAL_MS = 3 * 60 * 1000;
const DEFAULT_MAP_CENTER = [20.5937, 78.9629];

function distanceInMeters(first, second) {
  const earthRadius = 6371000;
  const toRadians = (value) => (value * Math.PI) / 180;
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function formatTime(value) {
  if (!value) return 'Not checked yet';
  return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function GeofenceMap({ settings }) {
  const home = settings.home;
  const lastCheck = settings.lastCheck;
  const center = home ? [home.latitude, home.longitude] : DEFAULT_MAP_CENTER;
  const current = lastCheck?.latitude && lastCheck?.longitude
    ? [lastCheck.latitude, lastCheck.longitude]
    : null;

  return (
    <MapContainer
      key={`${center[0]}-${center[1]}`}
      center={center}
      zoom={home ? 15 : 5}
      scrollWheelZoom={false}
      className="h-full min-h-[260px] w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {home && (
        <>
          <Circle
            center={center}
            radius={settings.radiusMeters || 500}
            pathOptions={{ color: '#C1653A', fillColor: '#D4A24C', fillOpacity: 0.2, weight: 2 }}
          />
          <CircleMarker center={center} radius={8} pathOptions={{ color: '#FFFDF9', fillColor: '#C1653A', fillOpacity: 1, weight: 3 }}>
            <Popup>Saved home point</Popup>
          </CircleMarker>
        </>
      )}
      {current && (
        <CircleMarker center={current} radius={7} pathOptions={{ color: '#FFFDF9', fillColor: lastCheck.inside ? '#8B9A7A' : '#D4A24C', fillOpacity: 1, weight: 3 }}>
          <Popup>Latest consented location check</Popup>
        </CircleMarker>
      )}
    </MapContainer>
  );
}

export default function GeofenceMonitor() {
  const [settings, setSettings] = useState(cognitiveStore.getState().geofence);
  const [radius, setRadius] = useState(String(settings.radiusMeters || 500));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Set a home point before enabling safety checks.');

  useEffect(() => cognitiveStore.subscribe((state) => setSettings({ ...state.geofence })), []);

  const saveSettings = (next) => {
    const saved = cognitiveStore.saveGeofence(next);
    setSettings({ ...saved });
  };

  const getCurrentPosition = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Location is not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: 120000,
      timeout: 15000,
    });
  });

  const setHomeFromCurrentLocation = async () => {
    setBusy(true);
    try {
      const position = await getCurrentPosition();
      saveSettings({
        home: { latitude: position.coords.latitude, longitude: position.coords.longitude },
        radiusMeters: Number(radius),
      });
      setMessage('Home point saved on this device.');
    } catch (error) {
      setMessage(error.message || 'We could not read the current location.');
    } finally {
      setBusy(false);
    }
  };

  const checkLocation = async () => {
    if (!settings.home || !settings.consentGranted) return;
    try {
      const position = await getCurrentPosition();
      const current = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      const distance = distanceInMeters(settings.home, current);
      const inside = distance <= settings.radiusMeters;
      const recentAlert = settings.lastAlert?.time
        && Date.now() - new Date(settings.lastAlert.time).getTime() < CHECK_INTERVAL_MS;
      if (!inside && recentAlert) {
        cognitiveStore.saveGeofence({ lastCheck: { inside, ...current, checkedAt: new Date().toISOString() } });
      } else {
        cognitiveStore.recordGeofenceCheck({ inside, ...current });
      }
      setMessage(inside ? 'The latest check is within the safe radius.' : 'A gentle caregiver check-in was added.');
    } catch (error) {
      setMessage(error.message || 'The location check could not be completed.');
    }
  };

  useEffect(() => {
    if (!settings.monitoring || !settings.consentGranted || !settings.home) return undefined;
    checkLocation();
    const timer = window.setInterval(checkLocation, CHECK_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [settings.monitoring, settings.consentGranted, settings.home?.latitude, settings.home?.longitude]);

  const toggleMonitoring = () => {
    if (!settings.home) {
      setMessage('Save a home point first.');
      return;
    }
    const nextMonitoring = !settings.monitoring;
    saveSettings({
      consentGranted: true,
      monitoring: nextMonitoring,
      radiusMeters: Number(radius),
    });
    setMessage(nextMonitoring ? 'Safety checks are active every few minutes.' : 'Safety checks are paused.');
  };

  return (
    <section className="mt-12 border-t border-charcoal/10 pt-10" aria-labelledby="geofence-title">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-eyebrow text-terracotta font-semibold">
            <ShieldCheck size={14} /> Family safety boundary
          </div>
          <h3 id="geofence-title" className="font-serif text-3xl sm:text-4xl text-charcoal mt-2">A calm check-in when someone goes further than usual.</h3>
          <p className="text-sm text-charcoal/65 mt-2 max-w-2xl">A caregiver can save a home point and a distance boundary. The browser checks periodically, not continuously, and adds a gentle update to the same family timeline.</p>
        </div>
        <span className="inline-flex items-center gap-2 text-xs font-medium text-sage-dark bg-sage-light border border-sage/25 rounded-pill px-3 py-2">
          <span className={`w-2 h-2 rounded-full ${settings.monitoring ? 'bg-sage animate-pulse' : 'bg-charcoal/30'}`} />
          {settings.monitoring ? 'Monitoring on' : 'Monitoring off'}
        </span>
      </div>

      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-5">
        <div className="bg-cream rounded-card border border-charcoal/10 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-terracotta-light text-terracotta flex items-center justify-center shrink-0"><MapPin size={19} /></div>
            <div>
              <h4 className="font-serif text-xl">Set the home point</h4>
              <p className="text-xs text-charcoal/60 mt-1">This demo uses the caregiver device's current location. A geocoded address can replace this later.</p>
            </div>
          </div>
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <label className="flex-1 text-xs font-semibold text-charcoal/70">Safe radius (meters)
              <input value={radius} onChange={(event) => setRadius(event.target.value)} type="number" min="100" step="50" className="mt-1 w-full rounded-pill border border-charcoal/20 bg-warm-white px-4 py-2.5 text-sm font-normal focus:border-terracotta focus:outline-none" />
            </label>
            <button type="button" onClick={setHomeFromCurrentLocation} disabled={busy} className="self-end inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-terracotta/30 px-4 py-2.5 text-sm font-semibold text-terracotta hover:bg-terracotta-light disabled:opacity-50">
              <Navigation size={16} /> {busy ? 'Reading location...' : 'Use my location'}
            </button>
          </div>
          <label className="mt-5 flex items-start gap-3 rounded-soft border border-charcoal/10 bg-warm-white p-3 text-xs text-charcoal/70">
            <input type="checkbox" checked={settings.consentGranted} onChange={(event) => saveSettings({ consentGranted: event.target.checked, monitoring: event.target.checked && settings.monitoring })} className="mt-0.5 h-4 w-4 accent-[#C1653A]" />
            <span>I understand and consent to periodic location checks on this device for family safety. Location is not streamed continuously.</span>
          </label>
          <button type="button" onClick={toggleMonitoring} className="mt-4 w-full min-h-12 rounded-pill bg-terracotta px-5 py-3 text-sm font-semibold text-warm-white hover:bg-terracotta-hover disabled:opacity-50" disabled={!settings.consentGranted || !settings.home}>
            {settings.monitoring ? 'Pause safety checks' : 'Start safety checks'}
          </button>
          <p className="mt-3 text-center text-xs text-charcoal/60" role="status">{message}</p>
        </div>

        <div className="relative min-h-[300px] overflow-hidden rounded-card border border-charcoal/10 bg-[#E7D9BD] shadow-warm-sm">
          <GeofenceMap settings={settings} />
          <div className="absolute left-3 right-3 top-3 z-[500] flex items-center justify-between gap-3 rounded-soft border border-charcoal/10 bg-warm-white/90 p-3 text-xs shadow-warm-sm backdrop-blur-sm">
            <span><strong className="block text-charcoal">Caregiver location view</strong><span className="text-charcoal/60">OpenStreetMap · free map data</span></span>
            <span className="shrink-0 font-semibold text-charcoal/65">{settings.home ? `${settings.radiusMeters || 500}m boundary` : 'Set home first'}</span>
          </div>
          <div className="absolute bottom-3 left-3 right-3 z-[500] flex items-center justify-between rounded-soft border border-charcoal/10 bg-warm-white/90 p-3 text-xs shadow-warm-sm backdrop-blur-sm"><span className="flex items-center gap-2"><CheckCircle2 size={15} className={settings.lastCheck?.inside ? 'text-sage' : 'text-charcoal/30'} /> Last check: {formatTime(settings.lastCheck?.checkedAt)}</span><span className="font-semibold text-charcoal/65">{settings.lastCheck ? (settings.lastCheck.inside ? 'Within boundary' : 'Check-in sent') : 'Awaiting consent'}</span></div>
        </div>
      </div>
      <p className="mt-4 text-[11px] text-charcoal/55">Map data © OpenStreetMap contributors. Smriti Sathi supports cognitive engagement and family connection — it does not diagnose or treat any medical condition.</p>
    </section>
  );
}
