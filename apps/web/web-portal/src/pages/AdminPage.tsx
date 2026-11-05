import React, { useMemo, useState } from "react";
import type { Timestamp } from "firebase/firestore";
import { AlertCircle, CheckCircle2, Loader2, LocateFixed, Trash2, Wand2 } from "lucide-react";

import {
  DEMO_AREAS,
  buildDemoHappenings,
  clearDemoHappenings,
  generateDemoHappenings,
} from "../shared-firebase/demo/demoHappenings";
import { categoryColor, formatDay, titleCase } from "../lib/format";

interface Center {
  key: string;
  latitude: number;
  longitude: number;
}

const CUSTOM = "custom";

function todayInput(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Admin-only: fill an area with realistic demo Happenings at real venues */
export default function AdminPage() {
  const [center, setCenter] = useState<Center>(DEMO_AREAS[0]);
  const [customLat, setCustomLat] = useState(String(DEMO_AREAS[0].latitude));
  const [customLng, setCustomLng] = useState(String(DEMO_AREAS[0].longitude));
  const [startDate, setStartDate] = useState(todayInput);
  const [days, setDays] = useState(4);
  const [radiusKm, setRadiusKm] = useState(15);
  const [busy, setBusy] = useState<"add" | "clear" | "locate" | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const effectiveCenter = useMemo(() => {
    if (center.key !== CUSTOM) return center;
    const lat = Number(customLat);
    const lng = Number(customLng);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { key: CUSTOM, latitude: lat, longitude: lng } : null;
  }, [center, customLat, customLng]);

  const start = useMemo(() => new Date(`${startDate}T00:00:00`), [startDate]);

  const preview = useMemo(() => {
    if (!effectiveCenter || Number.isNaN(start.getTime())) return [];
    return buildDemoHappenings({ center: effectiveCenter, radiusKm, startDate: start, days });
  }, [effectiveCenter, radiusKm, start, days]);

  const byDay = useMemo(() => {
    const groups = new Map<string, typeof preview>();
    preview.forEach((item) => {
      const date = (item.data.dateTime as Timestamp).toDate();
      const key = date.toDateString();
      groups.set(key, [...(groups.get(key) ?? []), item]);
    });
    return Array.from(groups.entries()).map(([key, items]) => ({
      label: formatDay(new Date(key)),
      items: items.sort(
        (a, b) => (a.data.dateTime as Timestamp).toMillis() - (b.data.dateTime as Timestamp).toMillis()
      ),
    }));
  }, [preview]);

  const endDate = new Date(start.getTime() + (days - 1) * 86_400_000);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setBusy("locate");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomLat(pos.coords.latitude.toFixed(5));
        setCustomLng(pos.coords.longitude.toFixed(5));
        setCenter({ key: CUSTOM, latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setBusy(null);
      },
      () => {
        setMessage({ text: "Couldn't get your location. Pick an area or type coordinates.", error: true });
        setBusy(null);
      }
    );
  };

  const handleAdd = async () => {
    if (!effectiveCenter) return;
    setBusy("add");
    setMessage(null);
    try {
      const count = await generateDemoHappenings({ center: effectiveCenter, radiusKm, startDate: start, days });
      setMessage({ text: `Added ${count} demo Happenings. They're live in the app now.`, error: false });
    } catch (err) {
      console.error("Demo generation failed", err);
      setMessage({ text: "Couldn't add Happenings. Check your connection and Firestore rules.", error: true });
    } finally {
      setBusy(null);
    }
  };

  const handleClear = async () => {
    setBusy("clear");
    setMessage(null);
    try {
      const removed = await clearDemoHappenings();
      setMessage({ text: `Removed ${removed} demo Happenings. Partner Happenings were not touched.`, error: false });
    } catch (err) {
      console.error("Clear demo failed", err);
      setMessage({ text: "Couldn't remove demo Happenings. Try again.", error: true });
    } finally {
      setBusy(null);
      setConfirmClear(false);
    }
  };

  return (
    <div className="gng-create">
      <section className="gng-panel gng-form">
        <p className="gng-muted" style={{ margin: 0 }}>
          Fills the app with made-up Happenings at real venues around Centurion and Irene (Irene Farm, Cappuccino's
          Southdowns, Big Red Barn, Smuts House…), on the weekdays they'd realistically run. Running it again
          refreshes them and keeps RSVPs.
        </p>

        {message ? (
          <div className={`gng-alert ${message.error ? "gng-alert-danger" : "gng-alert-success"}`} role="status">
            {message.error ? <AlertCircle size={18} aria-hidden="true" /> : <CheckCircle2 size={18} aria-hidden="true" />}
            {message.text}
          </div>
        ) : null}

        <div className="gng-field">
          <label>Location</label>
          <div className="gng-segment" role="group" aria-label="Area">
            {DEMO_AREAS.map((area) => (
              <button key={area.key} type="button" aria-pressed={center.key === area.key} onClick={() => setCenter(area)}>
                {area.label}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={center.key === CUSTOM}
              onClick={() => setCenter({ key: CUSTOM, latitude: Number(customLat), longitude: Number(customLng) })}
            >
              Custom
            </button>
          </div>
        </div>

        {center.key === CUSTOM ? (
          <div className="gng-row">
            <div className="gng-field">
              <label htmlFor="d-lat">Latitude</label>
              <input id="d-lat" className="gng-input" inputMode="decimal" value={customLat} onChange={(e) => setCustomLat(e.target.value)} />
            </div>
            <div className="gng-field">
              <label htmlFor="d-lng">Longitude</label>
              <input id="d-lng" className="gng-input" inputMode="decimal" value={customLng} onChange={(e) => setCustomLng(e.target.value)} />
            </div>
          </div>
        ) : null}
        <div>
          <button type="button" className="gng-btn gng-btn-ghost gng-btn-small" onClick={useMyLocation} disabled={busy !== null}>
            {busy === "locate" ? <Loader2 size={16} className="gng-spin" aria-hidden="true" /> : <LocateFixed size={16} aria-hidden="true" />}
            Use my location
          </button>
        </div>

        <div className="gng-row">
          <div className="gng-field">
            <label htmlFor="d-start">Start date</label>
            <input id="d-start" type="date" className="gng-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="gng-field">
            <label htmlFor="d-days">
              Days: {days} (to {endDate.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" })})
            </label>
            <input id="d-days" type="range" min={1} max={14} value={days} onChange={(e) => setDays(Number(e.target.value))} className="gng-range" />
          </div>
        </div>
        <div className="gng-field">
          <label htmlFor="d-radius">Radius: {radiusKm} km</label>
          <input id="d-radius" type="range" min={2} max={40} value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))} className="gng-range" />
        </div>

        <div className="gng-actions" style={{ justifyContent: "space-between" }}>
          {confirmClear ? (
            <div className="gng-actions">
              <span className="gng-muted">Remove every demo Happening?</span>
              <button type="button" className="gng-btn gng-btn-ghost gng-btn-small" onClick={() => setConfirmClear(false)}>
                Cancel
              </button>
              <button type="button" className="gng-btn gng-btn-danger gng-btn-small" onClick={handleClear} disabled={busy !== null}>
                {busy === "clear" ? "Removing…" : "Remove"}
              </button>
            </div>
          ) : (
            <button type="button" className="gng-btn gng-btn-ghost" onClick={() => setConfirmClear(true)} disabled={busy !== null}>
              <Trash2 size={18} aria-hidden="true" /> Remove all demo Happenings
            </button>
          )}
          <button type="button" className="gng-btn gng-btn-primary" onClick={handleAdd} disabled={busy !== null || preview.length === 0}>
            {busy === "add" ? <Loader2 size={18} className="gng-spin" aria-hidden="true" /> : <Wand2 size={18} aria-hidden="true" />}
            {preview.length ? `Add ${preview.length} Happenings` : "No venues in range"}
          </button>
        </div>
      </section>

      <aside className="gng-panel" aria-label="Preview">
        <div className="gng-panel-head">
          <h2>Preview</h2>
          <span className="gng-muted">{preview.length} Happenings</span>
        </div>
        {byDay.length === 0 ? (
          <p className="gng-muted">No venues within {radiusKm} km of that location. Increase the radius.</p>
        ) : (
          byDay.map((group) => (
            <div key={group.label} className="gng-day-group">
              <h3>{group.label}</h3>
              <div className="gng-upnext">
                {group.items.map(({ id, data }) => (
                  <div key={id} className="gng-upnext-row">
                    <span className="gng-cat" style={{ background: categoryColor(data.category as string) }}>
                      {titleCase(data.category as string)}
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="gng-row-title">{data.title as string}</div>
                      <div className="gng-row-sub">
                        {(data.dateTime as Timestamp).toDate().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })} ·{" "}
                        {(data.locationName as string).split(",")[0]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </aside>
    </div>
  );
}
