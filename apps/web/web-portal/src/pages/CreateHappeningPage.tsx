import React, { useState } from "react";
import { GeoPoint, Timestamp } from "firebase/firestore";
import { AlertCircle, CalendarDays, Loader2, MapPin } from "lucide-react";

import type { Happening, Partner, User } from "../shared-firebase/types";
import { happeningService } from "../shared-firebase/services/happeningService";
import { CATEGORIES, type Category, categoryColor, titleCase } from "../lib/format";

interface CreateHappeningPageProps {
  user: User;
  partner: Partner;
  venueName: string;
  onCreated: (title: string) => void;
  onCancel: () => void;
}

interface FormState {
  title: string;
  description: string;
  category: Category;
  date: string;
  time: string;
  locationName: string;
  google_maps_link: string;
  latitude: string;
  longitude: string;
  thumbnail_url: string;
}

const DEFAULT_COORDS = { latitude: -25.8795, longitude: 28.2005 }; // Southdowns, Centurion
const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800";

export default function CreateHappeningPage({ user, partner, venueName, onCreated, onCancel }: CreateHappeningPageProps) {
  const emptyForm = (): FormState => ({
    title: "",
    description: "",
    category: "COMMUNITY",
    date: "",
    time: "",
    locationName: partner.locationName || "",
    google_maps_link: partner.google_maps_link || "",
    latitude: partner.coordinates ? String(partner.coordinates.latitude) : "",
    longitude: partner.coordinates ? String(partner.coordinates.longitude) : "",
    thumbnail_url: "",
  });

  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const update =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setError(null);

    const when = new Date(`${form.date}T${form.time}`);
    if (!form.date || !form.time || Number.isNaN(when.getTime())) {
      setError("Choose a date and a time for the Happening.");
      return;
    }
    const lat = form.latitude.trim() === "" ? DEFAULT_COORDS.latitude : Number(form.latitude);
    const lng = form.longitude.trim() === "" ? DEFAULT_COORDS.longitude : Number(form.longitude);
    if (!Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lng) || Math.abs(lng) > 180) {
      setError("Latitude must be between -90 and 90, and longitude between -180 and 180.");
      return;
    }

    const data: Omit<Happening, "id"> = {
      partner_id: user.uid,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      dateTime: Timestamp.fromDate(when),
      locationName: form.locationName.trim() || partner.locationName || venueName,
      google_maps_link: form.google_maps_link.trim(),
      coordinates: new GeoPoint(lat, lng),
      thumbnail_url: form.thumbnail_url.trim() || DEFAULT_THUMBNAIL,
      rsvps: [],
      attendees: [],
    };

    setSaving(true);
    try {
      await happeningService.createHappening(data);
      setForm(emptyForm());
      onCreated(data.title);
    } catch (err) {
      console.error("Create Happening error:", err);
      setError("We couldn't publish this Happening. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const previewWhen =
    form.date && form.time
      ? new Date(`${form.date}T${form.time}`).toLocaleString("en-ZA", {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Pick a date and time";

  return (
    <div className="gng-create">
      <form className="gng-panel gng-form" onSubmit={handleSubmit}>
        {error ? (
          <div className="gng-alert gng-alert-danger" role="alert">
            <AlertCircle size={18} aria-hidden="true" /> {error}
          </div>
        ) : null}

        <div className="gng-field">
          <label htmlFor="h-title">Title</label>
          <input id="h-title" className="gng-input" value={form.title} onChange={update("title")} placeholder="Sunset jazz on the lawn" maxLength={60} required />
        </div>
        <div className="gng-field">
          <label htmlFor="h-description">Description</label>
          <textarea id="h-description" className="gng-input" value={form.description} onChange={update("description")} placeholder="What should Goers expect?" rows={4} required />
        </div>
        <div className="gng-field">
          <label>Category</label>
          <div className="gng-segment" role="group" aria-label="Category">
            {CATEGORIES.map((c) => (
              <button key={c} type="button" aria-pressed={form.category === c} onClick={() => setForm((f) => ({ ...f, category: c }))}>
                {titleCase(c)}
              </button>
            ))}
          </div>
        </div>
        <div className="gng-row">
          <div className="gng-field">
            <label htmlFor="h-date">Date</label>
            <input id="h-date" type="date" className="gng-input" value={form.date} onChange={update("date")} required />
          </div>
          <div className="gng-field">
            <label htmlFor="h-time">Time</label>
            <input id="h-time" type="time" className="gng-input" value={form.time} onChange={update("time")} required />
          </div>
        </div>
        <div className="gng-field">
          <label htmlFor="h-location">Location name</label>
          <input id="h-location" className="gng-input" value={form.locationName} onChange={update("locationName")} placeholder="Main lawn, Irene Farm" />
        </div>
        <div className="gng-field">
          <label htmlFor="h-maps">Google Maps link</label>
          <input id="h-maps" type="url" className="gng-input" value={form.google_maps_link} onChange={update("google_maps_link")} placeholder="https://maps.app.goo.gl/..." />
        </div>
        <div className="gng-row">
          <div className="gng-field">
            <label htmlFor="h-lat">Latitude</label>
            <input id="h-lat" inputMode="decimal" className="gng-input" value={form.latitude} onChange={update("latitude")} placeholder={String(DEFAULT_COORDS.latitude)} />
          </div>
          <div className="gng-field">
            <label htmlFor="h-lng">Longitude</label>
            <input id="h-lng" inputMode="decimal" className="gng-input" value={form.longitude} onChange={update("longitude")} placeholder={String(DEFAULT_COORDS.longitude)} />
          </div>
        </div>
        <p className="gng-hint" style={{ margin: "-8px 0 0", fontSize: 12, color: "var(--gng-text-secondary)" }}>
          In Google Maps, right-click your venue to copy its coordinates. Empty uses Southdowns, Centurion.
        </p>
        <div className="gng-field">
          <label htmlFor="h-thumb">Image URL (optional)</label>
          <input id="h-thumb" type="url" className="gng-input" value={form.thumbnail_url} onChange={update("thumbnail_url")} placeholder="https://..." />
        </div>
        <div className="gng-actions" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="gng-btn gng-btn-ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="gng-btn gng-btn-primary" disabled={saving} aria-busy={saving}>
            {saving ? <Loader2 size={18} className="gng-spin" aria-hidden="true" /> : null}
            {saving ? "Publishing…" : "Publish Happening"}
          </button>
        </div>
      </form>

      <aside className="gng-preview" aria-label="Preview in the app">
        <p className="gng-nav-label" style={{ margin: 0 }}>Preview in the app</p>
        <div className="gng-phone-card">
          <img src={form.thumbnail_url.trim() || DEFAULT_THUMBNAIL} alt="" />
          <div className="gng-phone-body">
            <span className="gng-cat" style={{ background: categoryColor(form.category), alignSelf: "flex-start" }}>
              {titleCase(form.category)}
            </span>
            <h3>{form.title.trim() || "Your Happening title"}</h3>
            <span className="gng-row-sub" style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <CalendarDays size={14} aria-hidden="true" /> {previewWhen}
            </span>
            <span className="gng-row-sub" style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <MapPin size={14} aria-hidden="true" /> {form.locationName.trim() || venueName}
            </span>
            <p className="gng-muted" style={{ margin: 0, fontSize: 14 }}>
              {form.description.trim() || "Tell Goers what to expect."}
            </p>
            <span className="gng-btn gng-btn-primary" style={{ marginTop: 4, justifyContent: "center" }} aria-hidden="true">
              RSVP Yes
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
