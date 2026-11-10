import React, { useEffect, useMemo, useState } from "react";
import { arrayRemove, collection, deleteDoc, doc, onSnapshot, query, setDoc, updateDoc, where } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  Download,
  ExternalLink,
  FileDown,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  RotateCcw,
  Trash2,
  UserMinus,
} from "lucide-react";

import Drawer, { Modal } from "../../../components/Drawer";
import CategoryTag from "../../../components/CategoryTag";
import { db } from "../../../shared-firebase/config/firebase";
import type { CircleFeedItem } from "../../../shared-firebase/types";
import { downloadCanvas, formatDate, formatDateTime, millis } from "../../../lib/format";
import { buildVenuePoster, posterFileName } from "../../../lib/venuePoster";
import {
  levelFor,
  nextLevelFor,
  tsMillis,
  type CircleDoc,
  type DetailRef,
  type GoerDoc,
  type HappeningDoc,
  type PartnerDoc,
  type UserDoc,
} from "../../../lib/adminData";

const GP_PER_CHECK_IN = 50;
const QR_FG = "#1A1A1A";
const QR_BG = "#FFFFFF";

export interface AdminData {
  users: UserDoc[];
  goers: GoerDoc[];
  partners: PartnerDoc[];
  circles: CircleDoc[];
  happenings: HappeningDoc[];
}

interface AdminDetailsProps {
  detail: DetailRef;
  data: AdminData;
  venueNames: Map<string, string>;
  onOpen: (detail: DetailRef) => void;
  onClose: () => void;
}

/* ---------- small building blocks ---------- */

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="gng-dstat">
      <span className="gng-dstat-label">{label}</span>
      <span className="gng-dstat-value">{value}</span>
      {sub ? <span className="gng-dstat-sub">{sub}</span> : null}
    </div>
  );
}

function Section({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="gng-dsection">
      <div className="gng-dsection-head">
        <h3>{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Avatar({ label, size = 56, bg }: { label: string; size?: number; bg?: string }) {
  return (
    <span className="gng-davatar" style={{ width: size, height: size, fontSize: size * 0.42, background: bg }}>
      {label}
    </span>
  );
}

const n = (value: number) => value.toLocaleString("en-ZA");
const initial = (text: string | undefined) => (text ?? "?").trim().charAt(0).toUpperCase() || "?";

function useStatus(user: UserDoc | undefined) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const suspended = user?.status === "suspended";
  const toggle = async () => {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await updateDoc(doc(db, "users", user.id), { status: suspended ? "active" : "suspended" });
    } catch (err) {
      console.error("Status update failed", err);
      setError("Couldn't update the status. Check the admin Firestore rules.");
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, suspended, toggle };
}

/* ---------- Goer ---------- */

function GoerDetail({ uid, data, onOpen, onClose }: { uid: string } & Omit<AdminDetailsProps, "detail" | "venueNames">) {
  const user = data.users.find((u) => (u.uid ?? u.id) === uid);
  const goer = data.goers.find((g) => g.id === uid);
  const [showAll, setShowAll] = useState(false);
  const status = useStatus(user);

  const circles = useMemo(
    () =>
      data.circles
        .filter((c) => (c.goer_ids ?? []).includes(uid) || (goer?.circles ?? []).includes(c.id))
        .sort((a, b) => (b.goer_ids?.length ?? 0) - (a.goer_ids?.length ?? 0)),
    [data.circles, goer, uid]
  );
  const activity = useMemo(
    () =>
      data.happenings
        .filter((h) => (h.rsvps ?? []).includes(uid) || (h.attendees ?? []).includes(uid))
        .sort((a, b) => millis(b) - millis(a)),
    [data.happenings, uid]
  );
  const checkIns = activity.filter((h) => (h.attendees ?? []).includes(uid)).length;
  const total = goer?.total_gp ?? 0;
  const monthly = goer?.monthly_gp ?? 0;
  const level = levelFor(total);
  const next = nextLevelFor(total);
  const progress = next ? Math.round(((total - level.target) / (next.target - level.target)) * 100) : 100;
  const name = user?.username ?? "Unknown Goer";
  const fullName = (user as UserDoc & { full_name?: string })?.full_name;

  const circleCard = (c: CircleDoc) => (
    <button key={c.id} type="button" className="gng-dcircle" style={{ background: c.card_bg?.light }} onClick={() => onOpen({ kind: "circle", id: c.id })}>
      <span className="gng-dcircle-emoji">{c.emoji}</span>
      <span className="gng-row-title">{c.title}</span>
      <span className="gng-row-sub">
        {c.goer_ids?.length ?? 0} members{c.created_by === uid ? " · Admin" : ""}
      </span>
    </button>
  );

  return (
    <Drawer
      open
      onClose={onClose}
      label={`Goer ${name}`}
      header={
        <div className="gng-dhero">
          <Avatar label={initial(name)} />
          <div style={{ minWidth: 0 }}>
            <h2>{name}</h2>
            <p className="gng-muted">
              {fullName ? `${fullName} · ` : ""}
              {user?.email}
            </p>
            <div className="gng-dtags">
              <span className="gng-pill gng-pill-brand">L{level.level} · {level.title}</span>
              {goer?.goer_id ? <span className="gng-pill gng-pill-muted"><Hash size={12} aria-hidden="true" /> {goer.goer_id}</span> : null}
              <span className={`gng-pill ${status.suspended ? "gng-pill-danger" : "gng-pill-progress"}`}>{status.suspended ? "Suspended" : "Active"}</span>
            </div>
          </div>
        </div>
      }
      footer={
        <>
          {user?.email ? (
            <a className="gng-btn gng-btn-ghost" href={`mailto:${user.email}`}>
              <Mail size={18} aria-hidden="true" /> Email
            </a>
          ) : null}
          <button type="button" className={`gng-btn ${status.suspended ? "gng-btn-ghost" : "gng-btn-danger"}`} disabled={status.busy || !user} onClick={status.toggle}>
            {status.suspended ? <RotateCcw size={18} aria-hidden="true" /> : <Ban size={18} aria-hidden="true" />}
            {status.suspended ? "Restore Goer" : "Suspend Goer"}
          </button>
        </>
      }
    >
      {status.error ? <div className="gng-alert gng-alert-danger">{status.error}</div> : null}
      <div className="gng-dstats">
        <Stat label="Total GP" value={n(total)} />
        <Stat label="This month" value={n(monthly)} />
        <Stat label="Check-ins" value={checkIns} />
        <Stat label="Circles" value={circles.length} />
      </div>

      <Section title="Level progress" aside={<span className="gng-muted">{next ? `${n(next.target - total)} GP to ${next.title}` : "Top level"}</span>}>
        <div className="gng-dprogress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div style={{ width: `${Math.max(4, progress)}%` }} />
        </div>
      </Section>

      <Section
        title="Circles"
        aside={
          circles.length > 4 ? (
            <button type="button" className="gng-link-btn" onClick={() => setShowAll(true)}>
              Show all {circles.length}
            </button>
          ) : null
        }
      >
        {circles.length === 0 ? <p className="gng-muted">Not in any Circles yet.</p> : <div className="gng-dcircles">{circles.slice(0, 4).map(circleCard)}</div>}
      </Section>

      <Section title="Recent Happenings">
        {activity.length === 0 ? (
          <p className="gng-muted">No RSVPs or check-ins yet.</p>
        ) : (
          <div className="gng-dlist">
            {activity.slice(0, 8).map((h) => {
              const came = (h.attendees ?? []).includes(uid);
              return (
                <button key={h.id} type="button" className="gng-dlist-row" onClick={() => onOpen({ kind: "happening", id: h.id })}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="gng-row-title">{h.title}</div>
                    <div className="gng-row-sub">{formatDateTime(h)} · {h.locationName?.split(",")[0]}</div>
                  </div>
                  <span className={`gng-pill ${came ? "gng-pill-progress" : "gng-pill-muted"}`}>{came ? `Checked in · +${GP_PER_CHECK_IN}` : "Going"}</span>
                </button>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="Account">
        <dl className="gng-dmeta">
          <div><dt>Joined</dt><dd>{formatDate(tsMillis(user?.createdAt))}</dd></div>
          <div><dt>User ID</dt><dd>{goer?.goer_id ?? "—"}</dd></div>
          <div><dt>Firebase UID</dt><dd className="gng-mono">{uid}</dd></div>
        </dl>
      </Section>

      <Modal open={showAll} onClose={() => setShowAll(false)} title={`${name}'s Circles`}>
        <div className="gng-dcircles">{circles.map(circleCard)}</div>
      </Modal>
    </Drawer>
  );
}

/* ---------- Circle ---------- */

function CircleDetail({ id, data, onOpen, onClose }: { id: string } & Omit<AdminDetailsProps, "detail" | "venueNames">) {
  const circle = data.circles.find((c) => c.id === id);
  const [feed, setFeed] = useState<(CircleFeedItem & { id: string })[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "circle_feed"), where("circle_id", "==", id)),
      (snapshot) =>
        setFeed(
          snapshot.docs
            .map((d) => ({ ...(d.data() as CircleFeedItem), id: d.id }))
            .sort((a, b) => tsMillis(b.created_at) - tsMillis(a.created_at))
        ),
      () => setFeed([])
    );
    return () => unsubscribe();
  }, [id]);

  const members = useMemo(() => {
    if (!circle) return [];
    return (circle.goer_ids ?? [])
      .map((uid) => {
        const user = data.users.find((u) => (u.uid ?? u.id) === uid);
        const goer = data.goers.find((g) => g.id === uid);
        return { uid, name: user?.username ?? "Unknown", total: goer?.total_gp ?? 0, monthly: goer?.monthly_gp ?? 0 };
      })
      .sort((a, b) => b.monthly - a.monthly);
  }, [circle, data.users, data.goers]);

  if (!circle) return null;
  const memberIds = new Set(circle.goer_ids ?? []);
  const checkIns = data.happenings.reduce((sum, h) => sum + (h.attendees ?? []).filter((u) => memberIds.has(u)).length, 0);
  const totalGp = members.reduce((s, m) => s + m.total, 0);
  const monthlyGp = members.reduce((s, m) => s + m.monthly, 0);
  const admin = data.users.find((u) => (u.uid ?? u.id) === circle.created_by);

  const removeMember = async (uid: string) => {
    setError(null);
    try {
      await setDoc(doc(db, "circles", circle.id), { goer_ids: arrayRemove(uid) }, { merge: true });
      await setDoc(doc(db, "goers", uid), { circles: arrayRemove(circle.id) }, { merge: true });
    } catch (err) {
      console.error("Remove member failed", err);
      setError("Couldn't remove that member.");
    }
  };

  const deleteCircle = async () => {
    setError(null);
    try {
      await Promise.all((circle.goer_ids ?? []).map((uid) => setDoc(doc(db, "goers", uid), { circles: arrayRemove(circle.id) }, { merge: true })));
      await deleteDoc(doc(db, "circles", circle.id));
      onClose();
    } catch (err) {
      console.error("Delete Circle failed", err);
      setError(`Couldn't delete "${circle.title}".`);
    }
  };

  const feedText = (item: CircleFeedItem) =>
    item.type === "joined"
      ? "joined the Circle"
      : item.type === "check_in"
        ? `checked in to ${item.happening_title}`
        : item.type === "me_too"
          ? `is keen for ${item.happening_title} too`
          : `is going to ${item.happening_title}`;

  return (
    <Drawer
      open
      onClose={onClose}
      label={`Circle ${circle.title}`}
      header={
        <div className="gng-dhero">
          <Avatar label={circle.emoji} bg={circle.card_bg?.light} />
          <div style={{ minWidth: 0 }}>
            <h2>{circle.title}</h2>
            {circle.description ? <p className="gng-muted">{circle.description}</p> : null}
            <div className="gng-dtags">
              {(circle.tags ?? []).map((tag) => (
                <span key={tag} className="gng-pill gng-pill-muted">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      }
      footer={
        confirmDelete ? (
          <>
            <span className="gng-muted" style={{ marginRight: "auto" }}>Delete this Circle for everyone?</span>
            <button type="button" className="gng-btn gng-btn-ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
            <button type="button" className="gng-btn gng-btn-danger" onClick={deleteCircle}>Delete</button>
          </>
        ) : (
          <button type="button" className="gng-btn gng-btn-danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={18} aria-hidden="true" /> Delete Circle
          </button>
        )
      }
    >
      {error ? <div className="gng-alert gng-alert-danger">{error}</div> : null}
      <div className="gng-dstats">
        <Stat label="Members" value={`${members.length}/${circle.max_size ?? 20}`} />
        <Stat label="GP this month" value={n(monthlyGp)} sub="all members" />
        <Stat label="Total GP" value={n(totalGp)} sub="all members" />
        <Stat label="Check-ins" value={n(checkIns)} sub={`${n(checkIns * GP_PER_CHECK_IN)} GP from check-ins`} />
      </div>

      <Section title="Details">
        <dl className="gng-dmeta">
          <div><dt>Join code</dt><dd className="gng-mono">{circle.join_code ?? "—"}</dd></div>
          <div>
            <dt>Admin</dt>
            <dd>
              {admin ? (
                <button type="button" className="gng-link-btn" onClick={() => onOpen({ kind: "goer", id: admin.uid ?? admin.id })}>{admin.username}</button>
              ) : "Unknown"}
            </dd>
          </div>
          <div><dt>Created</dt><dd>{formatDate(tsMillis(circle.created_at))}</dd></div>
          <div><dt>Invites</dt><dd>{circle.everybody_sends_invites ? "Anyone can invite" : "Admin only"}</dd></div>
        </dl>
      </Section>

      <Section title={`Members (${members.length})`} aside={<span className="gng-muted">Sorted by GP this month</span>}>
        <div className="gng-dlist">
          {members.map((m, index) => (
            <div key={m.uid} className="gng-dlist-row">
              <span className="gng-drank">{index + 1}</span>
              <button type="button" className="gng-dmember" onClick={() => onOpen({ kind: "goer", id: m.uid })}>
                <Avatar label={initial(m.name)} size={32} />
                <span className="gng-row-title">{m.name}</span>
                {m.uid === circle.created_by ? <span className="gng-pill gng-pill-brand">Admin</span> : null}
              </button>
              <span className="gng-dnum">{n(m.monthly)} <small>this month</small></span>
              <span className="gng-dnum">{n(m.total)} <small>total</small></span>
              {m.uid !== circle.created_by ? (
                <button type="button" className="gng-icon-btn gng-icon-btn-danger" title="Remove from Circle" aria-label={`Remove ${m.name}`} onClick={() => removeMember(m.uid)}>
                  <UserMinus size={16} aria-hidden="true" />
                </button>
              ) : <span style={{ width: 36 }} />}
            </div>
          ))}
        </div>
      </Section>

      <Section title="What they're doing">
        {feed.length === 0 ? (
          <p className="gng-muted">No activity yet.</p>
        ) : (
          <ul className="gng-dfeed">
            {feed.slice(0, 10).map((item) => (
              <li key={item.id}>
                <strong>{item.username}</strong> {feedText(item)}
                <span className="gng-row-sub">{formatDate(tsMillis(item.created_at))}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </Drawer>
  );
}

/* ---------- Happening ---------- */

function HappeningDetail({ id, data, venueNames, onOpen, onClose }: { id: string } & Omit<AdminDetailsProps, "detail">) {
  const happening = data.happenings.find((h) => h.id === id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!happening) return null;

  const rsvps = happening.rsvps ?? [];
  const attendees = new Set(happening.attendees ?? []);
  const showRate = rsvps.length ? Math.round((attendees.size / rsvps.length) * 100) : 0;
  const venue = venueNames.get(happening.partner_id) ?? happening.locationName?.split(",")[0] ?? "Unknown venue";
  const started = millis(happening) <= Date.now();
  const people = Array.from(new Set([...rsvps, ...Array.from(attendees)])).map((uid) => ({
    uid,
    name: data.users.find((u) => (u.uid ?? u.id) === uid)?.username ?? "Unknown",
    came: attendees.has(uid),
  }));
  people.sort((a, b) => Number(b.came) - Number(a.came) || a.name.localeCompare(b.name));

  const remove = async () => {
    try {
      await deleteDoc(doc(db, "happenings", happening.id));
      onClose();
    } catch (err) {
      console.error("Delete Happening failed", err);
      setError("Couldn't delete this Happening.");
    }
  };

  return (
    <Drawer
      open
      onClose={onClose}
      label={`Happening ${happening.title}`}
      header={
        <div className="gng-dhero">
          {happening.thumbnail_url ? <img className="gng-dthumb" src={happening.thumbnail_url} alt="" /> : <Avatar label={initial(happening.title)} />}
          <div style={{ minWidth: 0 }}>
            <h2>{happening.title}</h2>
            <p className="gng-muted"><CalendarDays size={14} aria-hidden="true" /> {formatDateTime(happening)}</p>
            <div className="gng-dtags">
              <CategoryTag category={happening.category} />
              <span className={`gng-pill ${started ? "gng-pill-muted" : "gng-pill-progress"}`}>{started ? "Happened" : "Upcoming"}</span>
              {happening.demo ? <span className="gng-pill gng-pill-muted">Demo</span> : null}
            </div>
          </div>
        </div>
      }
      footer={
        confirmDelete ? (
          <>
            <span className="gng-muted" style={{ marginRight: "auto" }}>Delete this Happening from the app?</span>
            <button type="button" className="gng-btn gng-btn-ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
            <button type="button" className="gng-btn gng-btn-danger" onClick={remove}>Delete</button>
          </>
        ) : (
          <>
            {happening.google_maps_link ? (
              <a className="gng-btn gng-btn-ghost" href={happening.google_maps_link} target="_blank" rel="noreferrer">
                <ExternalLink size={18} aria-hidden="true" /> Open in Maps
              </a>
            ) : null}
            <button type="button" className="gng-btn gng-btn-danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={18} aria-hidden="true" /> Delete
            </button>
          </>
        )
      }
    >
      {error ? <div className="gng-alert gng-alert-danger">{error}</div> : null}
      <div className="gng-dstats">
        <Stat label="RSVPs" value={rsvps.length} />
        <Stat label="Check-ins" value={attendees.size} />
        <Stat label="Show-up rate" value={`${showRate}%`} />
        <Stat label="GP awarded" value={n(attendees.size * GP_PER_CHECK_IN)} />
      </div>

      <div className="gng-dsplit">
        <Section title="About">
          <p style={{ margin: 0, lineHeight: 1.5 }}>{happening.description || <span className="gng-muted">No description.</span>}</p>
          <dl className="gng-dmeta" style={{ marginTop: 12 }}>
            <div>
              <dt>Partner</dt>
              <dd>
                <button type="button" className="gng-link-btn" onClick={() => onOpen({ kind: "partner", id: happening.partner_id })}>{venue}</button>
              </dd>
            </div>
            <div><dt>Where</dt><dd><MapPin size={14} aria-hidden="true" style={{ flexShrink: 0 }} /> {happening.locationName}</dd></div>
          </dl>
        </Section>
        <Section title="Check-in QR">
          <div className="gng-dqr">
            <QRCodeCanvas value={`partner:${happening.partner_id}`} size={420} level="H" marginSize={2} fgColor={QR_FG} bgColor={QR_BG} />
            <p className="gng-row-sub">The venue's QR. Scanning it from this Happening checks a Goer in.</p>
          </div>
        </Section>
      </div>

      <Section title={`Who's going (${people.length})`}>
        {people.length === 0 ? (
          <p className="gng-muted">No RSVPs yet.</p>
        ) : (
          <div className="gng-dpeople">
            {people.map((p) => (
              <button key={p.uid} type="button" className="gng-dperson" onClick={() => onOpen({ kind: "goer", id: p.uid })}>
                <Avatar label={initial(p.name)} size={28} />
                <span>{p.name}</span>
                {p.came ? <CheckCircle2 size={16} color="#7A9440" aria-label="Checked in" /> : null}
              </button>
            ))}
          </div>
        )}
      </Section>
    </Drawer>
  );
}

/* ---------- Partner ---------- */

function PartnerDetail({ uid, data, onOpen, onClose }: { uid: string } & Omit<AdminDetailsProps, "detail" | "venueNames">) {
  const user = data.users.find((u) => (u.uid ?? u.id) === uid);
  const partner = data.partners.find((p) => (p.uid ?? p.id) === uid);
  const status = useStatus(user);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState<"pdf" | "save" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const venueName = partner?.venue_name || user?.username || "Venue";
  const qrId = `gng-drawer-qr-${uid}`;

  const own = useMemo(() => data.happenings.filter((h) => h.partner_id === uid).sort((a, b) => millis(a) - millis(b)), [data.happenings, uid]);
  const now = Date.now();
  const upcoming = own.filter((h) => millis(h) >= now);
  const past = own.filter((h) => millis(h) < now).reverse();
  const rsvps = own.reduce((s, h) => s + (h.rsvps?.length ?? 0), 0);
  const checkIns = own.reduce((s, h) => s + (h.attendees?.length ?? 0), 0);

  const saveName = async () => {
    const next = name.trim();
    if (!next) return;
    setBusy("save");
    setError(null);
    try {
      await setDoc(doc(db, "partners", uid), { uid, venue_name: next }, { merge: true });
      setEditing(false);
    } catch (err) {
      console.error("Rename failed", err);
      setError("Couldn't rename this venue.");
    } finally {
      setBusy(null);
    }
  };

  const downloadPoster = async () => {
    setBusy("pdf");
    try {
      const pdf = await buildVenuePoster(venueName, qrId);
      pdf.save(posterFileName(venueName));
    } catch (err) {
      console.error("Poster failed", err);
      setError("Couldn't create the PDF poster.");
    } finally {
      setBusy(null);
    }
  };

  const row = (h: HappeningDoc) => (
    <button key={h.id} type="button" className="gng-dlist-row" onClick={() => onOpen({ kind: "happening", id: h.id })}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="gng-row-title">{h.title}</div>
        <div className="gng-row-sub">{formatDateTime(h)}</div>
      </div>
      <CategoryTag category={h.category} />
      <span className="gng-dnum">{h.rsvps?.length ?? 0} <small>going</small></span>
      <span className="gng-dnum">{h.attendees?.length ?? 0} <small>in</small></span>
    </button>
  );

  return (
    <Drawer
      open
      onClose={onClose}
      label={`Partner ${venueName}`}
      header={
        <div className="gng-dhero">
          <Avatar label={initial(venueName)} />
          <div style={{ minWidth: 0, flex: 1 }}>
            {editing ? (
              <div className="gng-actions" style={{ flexWrap: "nowrap" }}>
                <input className="gng-input" value={name} onChange={(e) => setName(e.target.value)} aria-label="Venue name" autoFocus />
                <button type="button" className="gng-btn gng-btn-primary gng-btn-small" onClick={saveName} disabled={busy === "save"}>Save</button>
                <button type="button" className="gng-btn gng-btn-ghost gng-btn-small" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            ) : (
              <h2>
                {venueName}{" "}
                <button type="button" className="gng-icon-btn" title="Rename venue" aria-label="Rename venue" onClick={() => { setName(venueName); setEditing(true); }}>
                  <Pencil size={16} aria-hidden="true" />
                </button>
              </h2>
            )}
            <p className="gng-muted">{partner?.locationName || "No location yet"}</p>
            <div className="gng-dtags">
              <span className={`gng-pill ${status.suspended ? "gng-pill-danger" : "gng-pill-progress"}`}>{status.suspended ? "Suspended" : "Active"}</span>
              <span className="gng-pill gng-pill-muted">Joined {formatDate(tsMillis(user?.createdAt))}</span>
            </div>
          </div>
        </div>
      }
      footer={
        <>
          {partner?.google_maps_link ? (
            <a className="gng-btn gng-btn-ghost" href={partner.google_maps_link} target="_blank" rel="noreferrer">
              <ExternalLink size={18} aria-hidden="true" /> Maps
            </a>
          ) : null}
          {user?.email ? (
            <a className="gng-btn gng-btn-ghost" href={`mailto:${user.email}`}>
              <Mail size={18} aria-hidden="true" /> Email
            </a>
          ) : null}
          <button type="button" className={`gng-btn ${status.suspended ? "gng-btn-ghost" : "gng-btn-danger"}`} disabled={status.busy || !user} onClick={status.toggle}>
            {status.suspended ? <RotateCcw size={18} aria-hidden="true" /> : <Ban size={18} aria-hidden="true" />}
            {status.suspended ? "Restore partner" : "Suspend partner"}
          </button>
        </>
      }
    >
      {error || status.error ? <div className="gng-alert gng-alert-danger">{error ?? status.error}</div> : null}
      <div className="gng-dstats">
        <Stat label="Happenings" value={own.length} sub={`${upcoming.length} upcoming`} />
        <Stat label="RSVPs" value={n(rsvps)} />
        <Stat label="Check-ins" value={n(checkIns)} sub={rsvps ? `${Math.round((checkIns / rsvps) * 100)}% show up` : undefined} />
        <Stat label="GP awarded" value={n(checkIns * GP_PER_CHECK_IN)} />
      </div>

      <div className="gng-dsplit">
        <Section title="Venue QR">
          <div className="gng-dqr">
            <QRCodeCanvas id={qrId} value={`partner:${uid}`} size={840} level="H" marginSize={2} fgColor={QR_FG} bgColor={QR_BG} />
            <p className="gng-row-sub gng-mono">partner:{uid}</p>
            <div className="gng-actions">
              <button type="button" className="gng-btn gng-btn-primary gng-btn-small" onClick={downloadPoster} disabled={busy === "pdf"}>
                {busy === "pdf" ? <Loader2 size={16} className="gng-spin" aria-hidden="true" /> : <FileDown size={16} aria-hidden="true" />} PDF poster
              </button>
              <button type="button" className="gng-btn gng-btn-ghost gng-btn-small" onClick={() => downloadCanvas(qrId, `${venueName}-qr`)}>
                <Download size={16} aria-hidden="true" /> PNG
              </button>
            </div>
          </div>
        </Section>
        <Section title="About">
          <p style={{ margin: 0, lineHeight: 1.5 }}>{partner?.bio || <span className="gng-muted">No bio yet.</span>}</p>
          <dl className="gng-dmeta" style={{ marginTop: 12 }}>
            <div><dt>Email</dt><dd>{user?.email ?? "—"}</dd></div>
            {partner?.website ? <div><dt>Website</dt><dd>{partner.website}</dd></div> : null}
          </dl>
        </Section>
      </div>

      <Section title={`Upcoming (${upcoming.length})`}>
        {upcoming.length === 0 ? <p className="gng-muted">Nothing coming up.</p> : <div className="gng-dlist">{upcoming.slice(0, 8).map(row)}</div>}
      </Section>
      {past.length ? (
        <Section title={`Past (${past.length})`}>
          <div className="gng-dlist">{past.slice(0, 6).map(row)}</div>
        </Section>
      ) : null}
    </Drawer>
  );
}

/** Opens the right detail drawer for whatever row was clicked */
export default function AdminDetails({ detail, data, venueNames, onOpen, onClose }: AdminDetailsProps) {
  if (!detail) return null;
  const shared = { data, onOpen, onClose };
  if (detail.kind === "goer") return <GoerDetail key={detail.id} uid={detail.id} {...shared} />;
  if (detail.kind === "circle") return <CircleDetail key={detail.id} id={detail.id} {...shared} />;
  if (detail.kind === "partner") return <PartnerDetail key={detail.id} uid={detail.id} {...shared} />;
  return <HappeningDetail key={detail.id} id={detail.id} venueNames={venueNames} {...shared} />;
}
