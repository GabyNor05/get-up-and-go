import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, Timestamp, GeoPoint } from "firebase/firestore";
import { db } from "../shared-firebase/config/firebase";
import { User, Partner, Happening, HappeningCategory } from "../shared-firebase/types";
import { happeningService } from "../shared-firebase/services/happeningService";
import { QRCodeCanvas } from "qrcode.react";
import {
  QrCode,
  PlusCircle,
  CalendarDays,
  LogOut,
  MapPin,
  Users,
  CheckCircle2,
  Trash2,
  Download,
  AlertCircle,
  Loader2,
} from "lucide-react";

type View = "list" | "create" | "qr";
type Category = Exclude<HappeningCategory, "ALL">;

const CATEGORIES: Category[] = ["NATURE", "MUSIC", "GAMES", "FAMILY", "SPORT", "FOOD", "COMMUNITY"];
const DEFAULT_COORDS = { latitude: -25.7479, longitude: 28.2293 }; // Pretoria
const DEFAULT_THUMBNAIL =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80";
// Canvas pixels can't read CSS variables, so the QR uses the token values directly
// (--gng-text-primary on --gng-bg-elevated).
const QR_FG = "#1A1A1A";
const QR_BG = "#FFFFFF";
const VENUE_QR_ID = "gng-venue-qr";
const HAPPENING_QR_ID = "gng-happening-qr";

const NAV: { view: View; label: string; Icon: typeof QrCode }[] = [
  { view: "list", label: "My Happenings", Icon: CalendarDays },
  { view: "create", label: "Create Happening", Icon: PlusCircle },
  { view: "qr", label: "Venue QR", Icon: QrCode },
];

interface Props {
  user: User;
  partner: Partner;
  onLogout: () => void;
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

const millis = (h: Happening) => h.dateTime?.toMillis?.() ?? 0;

function formatDateTime(h: Happening): string {
  if (!h.dateTime?.toDate) return "No date set";
  return h.dateTime.toDate().toLocaleString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function titleCase(category: string): string {
  return category.charAt(0) + category.slice(1).toLowerCase();
}

function downloadQr(canvasId: string, fileName: string) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return;
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `${fileName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "qr"}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function DashboardPage({ user, partner, onLogout }: Props) {
  const venueName = partner.venue_name || user.username;

  const emptyForm = (): FormState => ({
    title: "",
    description: "",
    category: "COMMUNITY",
    date: "",
    time: "",
    locationName: partner.locationName || "",
    google_maps_link: partner.google_maps_link || "",
    latitude: "",
    longitude: "",
    thumbnail_url: "",
  });

  const [view, setView] = useState<View>("list");
  const [happenings, setHappenings] = useState<Happening[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "happenings"), where("partner_id", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as Happening))
          .sort((a, b) => millis(a) - millis(b));
        setHappenings(items);
        setListError(null);
        setListLoading(false);
      },
      (err) => {
        console.error("Happenings listener error:", err);
        setListError("We couldn't load your Happenings. Refresh the page to try again.");
        setListLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user.uid]);

  const selected = happenings.find((h) => h.id === selectedId) || null;

  const update = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const go = (next: View) => {
    setView(next);
    setNotice(null);
    setConfirmDeleteId(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setFormError(null);

    const when = new Date(`${form.date}T${form.time}`);
    if (!form.date || !form.time || Number.isNaN(when.getTime())) {
      setFormError("Choose a date and a time for the Happening.");
      return;
    }

    const lat = form.latitude.trim() === "" ? DEFAULT_COORDS.latitude : Number(form.latitude);
    const lng = form.longitude.trim() === "" ? DEFAULT_COORDS.longitude : Number(form.longitude);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
      setFormError("Latitude must be between -90 and 90, and longitude between -180 and 180.");
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
      const id = await happeningService.createHappening(data);
      setSelectedId(id);
      setForm(emptyForm());
      setView("list");
      setNotice(`"${data.title}" is live. Goers can now find it in the app.`);
    } catch (err) {
      console.error("Create Happening error:", err);
      setFormError("We couldn't publish this Happening. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (h: Happening) => {
    setDeletingId(h.id);
    try {
      await happeningService.deleteHappening(h.id);
      if (selectedId === h.id) setSelectedId("");
      setNotice(`"${h.title}" was deleted.`);
    } catch (err) {
      console.error("Delete Happening error:", err);
      setNotice(null);
      setListError(`We couldn't delete "${h.title}". Try again.`);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="gng-shell">
      <aside className="gng-sidebar">
        <p className="gng-logo">Get Up &amp; Go</p>
        <p className="gng-venue">{venueName}</p>
        <nav className="gng-nav" aria-label="Portal">
          {NAV.map(({ view: v, label, Icon }) => (
            <button
              key={v}
              type="button"
              className="gng-nav-item"
              aria-current={view === v ? "page" : undefined}
              onClick={() => go(v)}
              title={label}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <button type="button" className="gng-nav-item" onClick={onLogout} title="Log out" style={{ width: "auto" }}>
          <LogOut size={20} aria-hidden="true" />
          <span>Log out</span>
        </button>
      </aside>

      <main className="gng-content">
        {notice && (
          <div className="gng-alert gng-alert-success" role="status" style={{ marginBottom: 20 }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} /> {notice}
          </div>
        )}

        {view === "list" && (
          <section>
            <div className="gng-page-head">
              <div>
                <h1 style={{ fontSize: 32 }}>My Happenings</h1>
                <p className="gng-muted" style={{ marginTop: 6 }}>
                  {happenings.length} {happenings.length === 1 ? "Happening" : "Happenings"} at {venueName}
                </p>
              </div>
              <button type="button" className="gng-btn gng-btn-primary" onClick={() => go("create")}>
                <PlusCircle size={18} aria-hidden="true" /> Create Happening
              </button>
            </div>

            {listError && (
              <div className="gng-alert gng-alert-danger" role="alert" style={{ marginBottom: 16 }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} /> {listError}
              </div>
            )}

            {listLoading ? (
              <p className="gng-muted">Loading your Happenings...</p>
            ) : happenings.length === 0 ? (
              <div className="gng-card" style={{ textAlign: "center" }}>
                <h2 style={{ fontSize: 22 }}>No Happenings yet</h2>
                <p className="gng-muted" style={{ margin: "8px 0 16px" }}>
                  Create your first Happening so Goers nearby can RSVP and check in.
                </p>
                <button type="button" className="gng-btn gng-btn-primary" onClick={() => go("create")}>
                  Create Happening
                </button>
              </div>
            ) : (
              <div className="gng-list">
                {happenings.map((h) => (
                  <article key={h.id} className="gng-card gng-happening">
                    {h.thumbnail_url && <img className="gng-thumb" src={h.thumbnail_url} alt="" loading="lazy" />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <h2 style={{ fontSize: 20 }}>{h.title}</h2>
                        {h.category && <span className="gng-chip gng-chip-brand">{titleCase(h.category)}</span>}
                      </div>
                      <div className="gng-meta">
                        <span><CalendarDays size={16} aria-hidden="true" /> {formatDateTime(h)}</span>
                        {h.locationName && <span><MapPin size={16} aria-hidden="true" /> {h.locationName}</span>}
                      </div>
                      <div className="gng-actions" style={{ marginBottom: 12 }}>
                        <span className="gng-chip gng-chip-brand">
                          <Users size={14} aria-hidden="true" /> {h.rsvps?.length ?? 0} RSVPs
                        </span>
                        <span className="gng-chip gng-chip-progress">
                          <CheckCircle2 size={14} aria-hidden="true" /> {h.attendees?.length ?? 0} checked in
                        </span>
                      </div>

                      {confirmDeleteId === h.id ? (
                        <div className="gng-alert gng-alert-danger" role="alert" style={{ flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{ flex: "1 1 200px" }}>Delete "{h.title}"? Goers will no longer see it.</span>
                          <div className="gng-actions">
                            <button type="button" className="gng-btn gng-btn-ghost gng-btn-small" onClick={() => setConfirmDeleteId(null)} disabled={deletingId === h.id}>
                              Cancel
                            </button>
                            <button type="button" className="gng-btn gng-btn-danger gng-btn-small" onClick={() => handleDelete(h)} disabled={deletingId === h.id}>
                              {deletingId === h.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="gng-actions">
                          <button
                            type="button"
                            className="gng-btn gng-btn-secondary gng-btn-small"
                            onClick={() => {
                              setSelectedId(h.id);
                              go("qr");
                            }}
                          >
                            <QrCode size={16} aria-hidden="true" /> Show QR
                          </button>
                          <button type="button" className="gng-btn gng-btn-ghost gng-btn-small" onClick={() => setConfirmDeleteId(h.id)}>
                            <Trash2 size={16} aria-hidden="true" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {view === "create" && (
          <section style={{ maxWidth: 720 }}>
            <div className="gng-page-head">
              <div>
                <h1 style={{ fontSize: 32 }}>Create Happening</h1>
                <p className="gng-muted" style={{ marginTop: 6 }}>It appears in the Get Up &amp; Go app as soon as you publish.</p>
              </div>
            </div>
            <form className="gng-card gng-form" onSubmit={handleCreate}>
              {formError && (
                <div className="gng-alert gng-alert-danger" role="alert">
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} /> {formError}
                </div>
              )}
              <div className="gng-field">
                <label htmlFor="h-title">Title</label>
                <input id="h-title" className="gng-input" value={form.title} onChange={update("title")} placeholder="Sunset jazz on the lawn" required />
              </div>
              <div className="gng-field">
                <label htmlFor="h-description">Description</label>
                <textarea id="h-description" className="gng-input" value={form.description} onChange={update("description")} placeholder="What should Goers expect?" required />
              </div>
              <div className="gng-row">
                <div className="gng-field">
                  <label htmlFor="h-category">Category</label>
                  <select id="h-category" className="gng-input" value={form.category} onChange={update("category")}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{titleCase(c)}</option>
                    ))}
                  </select>
                </div>
                <div className="gng-field">
                  <label htmlFor="h-location">Location name</label>
                  <input id="h-location" className="gng-input" value={form.locationName} onChange={update("locationName")} placeholder="Main lawn, Hatfield" />
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
                Leave latitude and longitude empty to use Pretoria. In Google Maps, right-click your venue to copy its coordinates.
              </p>
              <div className="gng-field">
                <label htmlFor="h-thumb">Image URL (optional)</label>
                <input id="h-thumb" type="url" className="gng-input" value={form.thumbnail_url} onChange={update("thumbnail_url")} placeholder="https://..." />
                <p className="gng-hint">Leave empty to use a default photo.</p>
              </div>
              <div className="gng-actions" style={{ justifyContent: "flex-end" }}>
                <button type="button" className="gng-btn gng-btn-ghost" onClick={() => { setForm(emptyForm()); setFormError(null); go("list"); }} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="gng-btn gng-btn-primary" disabled={saving} aria-busy={saving}>
                  {saving && <Loader2 size={18} className="gng-spin" aria-hidden="true" />}
                  {saving ? "Publishing..." : "Publish Happening"}
                </button>
              </div>
            </form>
          </section>
        )}

        {view === "qr" && (
          <section>
            <div className="gng-page-head">
              <div>
                <h1 style={{ fontSize: 32 }}>Venue QR</h1>
                <p className="gng-muted" style={{ marginTop: 6 }}>Goers scan this in the Get Up &amp; Go app to check in.</p>
              </div>
            </div>
            <div className="gng-qr-grid">
              <div className="gng-card gng-qr-card">
                <h2 style={{ fontSize: 22 }}>{venueName}</h2>
                <p className="gng-muted">Venue check-in. Print it and keep it at the door.</p>
                <div className="gng-qr-frame">
                  <QRCodeCanvas id={VENUE_QR_ID} value={`partner:${user.uid}`} size={240} level="H" marginSize={2} fgColor={QR_FG} bgColor={QR_BG} />
                </div>
                <button type="button" className="gng-btn gng-btn-primary" onClick={() => downloadQr(VENUE_QR_ID, `${venueName} venue QR`)}>
                  <Download size={18} aria-hidden="true" /> Download PNG
                </button>
              </div>

              <div className="gng-card gng-qr-card">
                <h2 style={{ fontSize: 22 }}>Happening QR</h2>
                <div className="gng-field" style={{ width: "100%", textAlign: "left" }}>
                  <label htmlFor="qr-happening">Choose a Happening</label>
                  <select id="qr-happening" className="gng-input" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                    <option value="">Select a Happening</option>
                    {happenings.map((h) => (
                      <option key={h.id} value={h.id}>{h.title} ({formatDateTime(h)})</option>
                    ))}
                  </select>
                </div>
                {selected ? (
                  <>
                    <p className="gng-muted">{selected.title} &middot; {formatDateTime(selected)}</p>
                    <div className="gng-qr-frame">
                      <QRCodeCanvas id={HAPPENING_QR_ID} value={selected.id} size={240} level="H" marginSize={2} fgColor={QR_FG} bgColor={QR_BG} />
                    </div>
                    <button type="button" className="gng-btn gng-btn-primary" onClick={() => downloadQr(HAPPENING_QR_ID, `${selected.title} QR`)}>
                      <Download size={18} aria-hidden="true" /> Download PNG
                    </button>
                  </>
                ) : (
                  <p className="gng-muted">
                    {happenings.length === 0 ? "Create a Happening to get its own QR." : "Pick a Happening to show its own check-in QR."}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
