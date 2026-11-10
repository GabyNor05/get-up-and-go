import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  LifeBuoy,
  Loader2,
  Sparkles,
  Store,
  Ticket,
  Trash2,
  Trophy,
  Users,
  UsersRound,
  Wand2,
} from "lucide-react";

import { DEMO_AREAS, DEMO_VENUES } from "../../shared-firebase/demo/demoHappenings";
import { ADMIN_EMAILS } from "../../lib/roles";
import {
  FRIEND_CIRCLES,
  FRIENDS,
  MAX_RANDOM_CIRCLES,
  MAX_RANDOM_GOERS,
  MAX_TICKETS,
  boostGoers,
  buildVenueHappenings,
  clearAllDemoData,
  fillActivity,
  generateVenueHappenings,
  isDemoDoc,
  seedFriendCircles,
  seedGoers,
  seedPartners,
  seedRandomCircles,
  seedTickets,
  setupShowcasePartner,
  type SeedContext,
} from "../../lib/demoSeed";

type Status = { text: string; error: boolean } | null;
type Job = "partners" | "happenings" | "goers" | "friends" | "circles" | "activity" | "tickets" | "boost" | "showcase" | "clear";

const SHOWCASE_EMAIL = "gmmnorris@gmail.com";

/** Suggested points for Gaby's real accounts (editable before saving) */
const BOOST_PRESETS: Record<string, { total: number; monthly: number }> = {
  gabby: { total: 2150, monthly: 640 },
  gabster: { total: 1475, monthly: 420 },
  megan: { total: 1180, monthly: 365 },
  lily: { total: 960, monthly: 310 },
};

function dateInput(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function errorText(err: unknown): string {
  const code = (err as { code?: string })?.code;
  if (code === "permission-denied") return "Firestore said no (permission denied). The admin rules need to allow writes to that collection.";
  return (err as Error)?.message || "Something went wrong. Check your connection and try again.";
}

interface StepProps {
  n: number;
  Icon: typeof Users;
  title: string;
  description: React.ReactNode;
  status: Status;
  children?: React.ReactNode;
  action: React.ReactNode;
  have?: string;
}

function Step({ n, Icon, title, description, status, children, action, have }: StepProps) {
  return (
    <section className="gng-panel gng-gen-step">
      <header className="gng-gen-head">
        <span className="gng-gen-n" aria-hidden="true">{n}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2>
            <Icon size={18} aria-hidden="true" /> {title}
          </h2>
          <p className="gng-muted">{description}</p>
        </div>
        {have ? <span className="gng-pill gng-pill-muted">{have}</span> : null}
      </header>
      {children ? <div className="gng-gen-body">{children}</div> : null}
      {status ? (
        <div className={`gng-alert ${status.error ? "gng-alert-danger" : "gng-alert-success"}`} role="status">
          {status.error ? <AlertCircle size={18} aria-hidden="true" /> : <CheckCircle2 size={18} aria-hidden="true" />}
          {status.text}
        </div>
      ) : null}
      <div className="gng-gen-action">{action}</div>
    </section>
  );
}

function RunButton({ busy, job, onClick, children, disabled }: { busy: Job | null; job: Job; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button type="button" className="gng-btn gng-btn-primary" onClick={onClick} disabled={busy !== null || disabled}>
      {busy === job ? <Loader2 size={18} className="gng-spin" aria-hidden="true" /> : <Wand2 size={18} aria-hidden="true" />}
      {children}
    </button>
  );
}

function Slider({ id, label, value, min, max, onChange, step = 1 }: { id: string; label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return (
    <div className="gng-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="range" className="gng-range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

/** Admin-only: fills the database with believable showcase data, step by step */
export default function AdminDemo({ ctx }: { ctx: SeedContext }) {
  const [busy, setBusy] = useState<Job | null>(null);
  const [status, setStatus] = useState<Partial<Record<Job, Status>>>({});

  // 1 · Partners
  const [spreadWeeks, setSpreadWeeks] = useState(10);
  // 2 · Happenings
  const [areaKey, setAreaKey] = useState(DEMO_AREAS[0].key);
  const [startDate, setStartDate] = useState(() => dateInput(-3));
  const [days, setDays] = useState(7);
  const [radiusKm, setRadiusKm] = useState(15);
  // 3 · Goers
  const [goerCount, setGoerCount] = useState(24);
  // 4 · Friends' circles
  const realGoers = useMemo(
    () => ctx.users.filter((u) => u.role === "goer" && !isDemoDoc(u)).sort((a, b) => a.username.localeCompare(b.username)),
    [ctx.users]
  );
  const [ownerUid, setOwnerUid] = useState("");
  const [extraUids, setExtraUids] = useState<string[]>([]);
  // 5 · More circles
  const [circleCount, setCircleCount] = useState(8);
  const [minMembers, setMinMembers] = useState(4);
  const [maxMembers, setMaxMembers] = useState(10);
  const [atLeast, setAtLeast] = useState(2);
  // 6 · Activity
  const [maxRsvps, setMaxRsvps] = useState(14);
  const [showRate, setShowRate] = useState(70);
  const [includeReal, setIncludeReal] = useState(false);
  // 7 · Tickets
  const [ticketCount, setTicketCount] = useState(MAX_TICKETS);
  // 8 · Boost
  const [boost, setBoost] = useState<Record<string, { on: boolean; total: number; monthly: number }>>({});
  // 9 · Showcase partner
  const realPartners = useMemo(() => ctx.users.filter((u) => u.role === "partner" && !isDemoDoc(u)), [ctx.users]);
  const [showcaseUid, setShowcaseUid] = useState("");
  const [venueName, setVenueName] = useState("Window Seat Café");
  const [address, setAddress] = useState("Southdowns, Centurion");
  const [daysBack, setDaysBack] = useState(7);
  const [daysForward, setDaysForward] = useState(7);
  // Remove all
  const [confirmClear, setConfirmClear] = useState(false);

  // Sensible defaults once the live data arrives
  useEffect(() => {
    if (!ownerUid && realGoers.length) {
      const mine = realGoers.find((u) => ADMIN_EMAILS.includes((u.email ?? "").toLowerCase())) ?? realGoers[0];
      setOwnerUid(mine.uid ?? mine.id);
    }
  }, [realGoers, ownerUid]);
  useEffect(() => {
    if (!extraUids.length && ownerUid) {
      const picks = realGoers.filter((u) => (u.uid ?? u.id) !== ownerUid && /megan|lily|gab/i.test(u.username));
      if (picks.length) setExtraUids(picks.map((u) => u.uid ?? u.id));
    }
  }, [realGoers, ownerUid, extraUids.length]);
  useEffect(() => {
    if (!showcaseUid && realPartners.length) {
      const mine = realPartners.find((u) => (u.email ?? "").toLowerCase() === SHOWCASE_EMAIL) ?? realPartners[0];
      setShowcaseUid(mine.uid ?? mine.id);
    }
  }, [realPartners, showcaseUid]);
  useEffect(() => {
    setBoost((current) => {
      const next = { ...current };
      realGoers.forEach((u) => {
        const uid = u.uid ?? u.id;
        if (next[uid]) return;
        const goer = ctx.goers.find((g) => g.id === uid);
        const preset = BOOST_PRESETS[u.username.trim().toLowerCase()];
        next[uid] = {
          on: !!preset,
          total: preset?.total ?? goer?.total_gp ?? 0,
          monthly: preset?.monthly ?? goer?.monthly_gp ?? 0,
        };
      });
      return next;
    });
  }, [realGoers, ctx.goers]);

  const area = DEMO_AREAS.find((a) => a.key === areaKey) ?? DEMO_AREAS[0];
  const start = useMemo(() => new Date(`${startDate}T00:00:00`), [startDate]);
  const happeningPreview = useMemo(
    () => (Number.isNaN(start.getTime()) ? [] : buildVenueHappenings({ center: area, radiusKm, startDate: start, days })),
    [area, radiusKm, start, days]
  );

  const counts = useMemo(() => {
    const demoGoers = ctx.goers.filter(isDemoDoc).length;
    return {
      partners: ctx.partners.filter(isDemoDoc).length,
      happenings: ctx.happenings.filter(isDemoDoc).length,
      goers: demoGoers,
      circles: ctx.circles.filter(isDemoDoc).length,
      friends: ctx.circles.filter((c) => FRIEND_CIRCLES.some((f) => f.id === c.id)).length,
    };
  }, [ctx]);

  const run = async (job: Job, work: () => Promise<string>) => {
    setBusy(job);
    setStatus((s) => ({ ...s, [job]: null }));
    try {
      const text = await work();
      setStatus((s) => ({ ...s, [job]: { text, error: false } }));
    } catch (err) {
      console.error(`Demo ${job} failed`, err);
      setStatus((s) => ({ ...s, [job]: { text: errorText(err), error: true } }));
    } finally {
      setBusy(null);
    }
  };

  const toggleExtra = (uid: string) =>
    setExtraUids((list) => (list.includes(uid) ? list.filter((x) => x !== uid) : [...list, uid]));

  const showcaseArea = DEMO_AREAS[0];
  const boostRows = realGoers.map((u) => ({ user: u, value: boost[u.uid ?? u.id] })).filter((r) => r.value);

  return (
    <div className="gng-page gng-gen">
      <div className="gng-gen-steps gng-scroll">
        <Step
          n={1}
          Icon={Building2}
          title="Partners"
          description={`One partner for each real venue (${DEMO_VENUES.length}), with a venue QR that matches its Happenings. Join dates are spread out so "Newest partners" looks lived-in.`}
          have={`${counts.partners} demo partners`}
          status={status.partners ?? null}
          action={
            <RunButton busy={busy} job="partners" onClick={() => run("partners", async () => `Created ${await seedPartners({ spreadWeeks })} partners. Open one in Partners to see its QR.`)}>
              Create {DEMO_VENUES.length} partners
            </RunButton>
          }
        >
          <Slider id="g-spread" label={`Spread join dates over the last ${spreadWeeks} weeks`} value={spreadWeeks} min={1} max={26} onChange={setSpreadWeeks} />
        </Step>

        <Step
          n={2}
          Icon={CalendarDays}
          title="Happenings"
          description="Made-up Happenings at those real venues, on the days they'd realistically run. Start a few days back so some already have check-ins."
          have={`${counts.happenings} demo Happenings`}
          status={status.happenings ?? null}
          action={
            <RunButton
              busy={busy}
              job="happenings"
              disabled={!happeningPreview.length}
              onClick={() => run("happenings", async () => `Added ${await generateVenueHappenings({ center: area, radiusKm, startDate: start, days }, ctx)} Happenings, each linked to its venue's QR.`)}
            >
              {happeningPreview.length ? `Add ${happeningPreview.length} Happenings` : "No venues in range"}
            </RunButton>
          }
        >
          <div className="gng-segment" role="group" aria-label="Area">
            {DEMO_AREAS.map((a) => (
              <button key={a.key} type="button" aria-pressed={areaKey === a.key} onClick={() => setAreaKey(a.key)}>
                {a.label}
              </button>
            ))}
          </div>
          <div className="gng-row">
            <div className="gng-field">
              <label htmlFor="g-start">Start date</label>
              <input id="g-start" type="date" className="gng-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <Slider id="g-days" label={`${days} days`} value={days} min={1} max={21} onChange={setDays} />
            <Slider id="g-radius" label={`${radiusKm} km radius`} value={radiusKm} min={2} max={40} onChange={setRadiusKm} />
          </div>
        </Step>

        <Step
          n={3}
          Icon={Users}
          title="Goers"
          description="Made-up Goers with South African names, Go-Points and join dates. They can't log in; they fill leaderboards, Circles and RSVPs."
          have={`${counts.goers} demo Goers`}
          status={status.goers ?? null}
          action={
            <RunButton busy={busy} job="goers" onClick={() => run("goers", async () => `Added ${await seedGoers(goerCount, ctx)} Goers.`)}>
              Add {goerCount} Goers
            </RunButton>
          }
        >
          <Slider id="g-goers" label={`${goerCount} Goers`} value={goerCount} min={4} max={MAX_RANDOM_GOERS} onChange={setGoerCount} />
        </Step>

        <Step
          n={4}
          Icon={Sparkles}
          title="Your friends' Circles"
          description={
            <>
              Adds {FRIENDS.length} friends with their nicknames (Yulans, Mish, Pomi, Dions, Charms…) and puts them in{" "}
              {FRIEND_CIRCLES.map((c) => c.title).join(", ")}. Everyone ends up in at least two.
            </>
          }
          have={`${counts.friends}/${FRIEND_CIRCLES.length} created`}
          status={status.friends ?? null}
          action={
            <RunButton
              busy={busy}
              job="friends"
              disabled={!ownerUid}
              onClick={() =>
                run("friends", async () => {
                  const r = await seedFriendCircles({ ownerUid, extraUids: extraUids.filter((u) => u !== ownerUid) }, ctx);
                  return `Created ${r.circles} Circles with ${r.goers} friends. You're the admin of each one.`;
                })
              }
            >
              Create friends' Circles
            </RunButton>
          }
        >
          <div className="gng-row">
            <div className="gng-field">
              <label htmlFor="g-owner">Circle admin (your account)</label>
              <select id="g-owner" className="gng-input" value={ownerUid} onChange={(e) => setOwnerUid(e.target.value)}>
                {realGoers.length === 0 ? <option value="">No real Goers yet</option> : null}
                {realGoers.map((u) => (
                  <option key={u.id} value={u.uid ?? u.id}>
                    {u.username} · {u.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {realGoers.length > 1 ? (
            <div className="gng-field">
              <label>Also add to The Girlies and The Hobbits</label>
              <div className="gng-chips">
                {realGoers
                  .filter((u) => (u.uid ?? u.id) !== ownerUid)
                  .map((u) => {
                    const uid = u.uid ?? u.id;
                    return (
                      <button key={uid} type="button" className="gng-chip" aria-pressed={extraUids.includes(uid)} onClick={() => toggleExtra(uid)}>
                        {u.username}
                      </button>
                    );
                  })}
              </div>
            </div>
          ) : null}
        </Step>

        <Step
          n={5}
          Icon={UsersRound}
          title="More Circles"
          description="Generic Circles (Quiz Night Legends, Pilates Pals, MTB Mates…) filled with the demo Goers that exist. Run step 3 first."
          have={`${counts.circles} demo Circles`}
          status={status.circles ?? null}
          action={
            <RunButton
              busy={busy}
              job="circles"
              disabled={counts.goers < 2}
              onClick={() =>
                run("circles", async () => {
                  const r = await seedRandomCircles({ count: circleCount, minMembers, maxMembers: Math.max(minMembers, maxMembers), atLeast }, ctx);
                  return `Created ${r.circles} Circles with ${r.members} memberships.`;
                })
              }
            >
              Create {circleCount} Circles
            </RunButton>
          }
        >
          <div className="gng-row">
            <Slider id="g-circles" label={`${circleCount} Circles`} value={circleCount} min={1} max={MAX_RANDOM_CIRCLES} onChange={setCircleCount} />
            <Slider id="g-min" label={`At least ${minMembers} members each`} value={minMembers} min={2} max={20} onChange={(v) => { setMinMembers(v); if (v > maxMembers) setMaxMembers(v); }} />
            <Slider id="g-max" label={`Up to ${maxMembers} members`} value={maxMembers} min={2} max={20} onChange={(v) => { setMaxMembers(v); if (v < minMembers) setMinMembers(v); }} />
          </div>
          <Slider id="g-atleast" label={`Every demo Goer in at least ${atLeast} Circle${atLeast === 1 ? "" : "s"}`} value={atLeast} min={0} max={4} onChange={setAtLeast} />
        </Step>

        <Step
          n={6}
          Icon={Ticket}
          title="RSVPs and check-ins"
          description="Demo Goers RSVP to Happenings, and most of them check in to the ones that already started. This is what fills the partner dashboards."
          status={status.activity ?? null}
          action={
            <RunButton
              busy={busy}
              job="activity"
              disabled={counts.goers < 1}
              onClick={() =>
                run("activity", async () => {
                  const r = await fillActivity({ maxRsvps, showRate: showRate / 100, includeReal }, ctx);
                  return `${r.rsvps} RSVPs and ${r.checkIns} check-ins across ${r.happenings} Happenings.`;
                })
              }
            >
              Fill RSVPs and check-ins
            </RunButton>
          }
        >
          <div className="gng-row">
            <Slider id="g-rsvps" label={`Up to ${maxRsvps} RSVPs per Happening`} value={maxRsvps} min={3} max={40} onChange={setMaxRsvps} />
            <Slider id="g-show" label={`${showRate}% show up`} value={showRate} min={10} max={100} step={5} onChange={setShowRate} />
          </div>
          <label className="gng-check">
            <input type="checkbox" checked={includeReal} onChange={(e) => setIncludeReal(e.target.checked)} />
            Also fill real partners' Happenings
          </label>
        </Step>

        <Step
          n={7}
          Icon={LifeBuoy}
          title="Support tickets"
          description="Realistic tickets from demo Goers and partners, some open and some resolved with notes."
          status={status.tickets ?? null}
          action={
            <RunButton busy={busy} job="tickets" onClick={() => run("tickets", async () => `Added ${await seedTickets(ticketCount, ctx)} support tickets.`)}>
              Add {ticketCount} tickets
            </RunButton>
          }
        >
          <Slider id="g-tickets" label={`${ticketCount} tickets`} value={ticketCount} min={1} max={MAX_TICKETS} onChange={setTicketCount} />
        </Step>

        <Step
          n={8}
          Icon={Trophy}
          title="Boost real accounts"
          description="Set Go-Points on real accounts so their profiles and the leaderboard look busy. Tick who to update."
          status={status.boost ?? null}
          action={
            <RunButton
              busy={busy}
              job="boost"
              disabled={!boostRows.some((r) => r.value.on)}
              onClick={() =>
                run("boost", async () => {
                  const updates = boostRows.filter((r) => r.value.on).map((r) => ({ uid: r.user.uid ?? r.user.id, total: r.value.total, monthly: r.value.monthly }));
                  return `Updated Go-Points for ${await boostGoers(updates)} accounts.`;
                })
              }
            >
              Save Go-Points
            </RunButton>
          }
        >
          {boostRows.length === 0 ? (
            <p className="gng-muted">No real Goers yet.</p>
          ) : (
            <div className="gng-boost">
              <div className="gng-boost-row gng-boost-headrow">
                <span />
                <span>Goer</span>
                <span>Total GP</span>
                <span>This month</span>
              </div>
              {boostRows.map(({ user, value }) => {
                const uid = user.uid ?? user.id;
                const update = (patch: Partial<typeof value>) => setBoost((b) => ({ ...b, [uid]: { ...b[uid], ...patch } }));
                return (
                  <div key={uid} className="gng-boost-row">
                    <input type="checkbox" aria-label={`Update ${user.username}`} checked={value.on} onChange={(e) => update({ on: e.target.checked })} />
                    <span className="gng-row-title">{user.username}</span>
                    <input className="gng-input" type="number" min={0} step={25} value={value.total} onChange={(e) => update({ total: Number(e.target.value), on: true })} />
                    <input className="gng-input" type="number" min={0} step={25} value={value.monthly} onChange={(e) => update({ monthly: Number(e.target.value), on: true })} />
                  </div>
                );
              })}
            </div>
          )}
        </Step>

        <Step
          n={9}
          Icon={Store}
          title="Showcase partner"
          description="Renames a real partner login and gives it a fortnight of Happenings full of RSVPs and check-ins, so its own dashboard has stats to show and Happenings to scan."
          status={status.showcase ?? null}
          action={
            <RunButton
              busy={busy}
              job="showcase"
              disabled={!showcaseUid || !venueName.trim()}
              onClick={() =>
                run("showcase", async () => {
                  const n = await setupShowcasePartner(
                    { partnerUid: showcaseUid, venueName: venueName.trim(), address: address.trim(), latitude: showcaseArea.latitude + 0.0007, longitude: showcaseArea.longitude + 0.0005, daysBack, daysForward },
                    ctx
                  );
                  return `"${venueName.trim()}" now has ${n} Happenings. Log in as that partner to see the dashboard.`;
                })
              }
            >
              Set up showcase partner
            </RunButton>
          }
        >
          <div className="gng-row">
            <div className="gng-field">
              <label htmlFor="g-partner">Partner login</label>
              <select id="g-partner" className="gng-input" value={showcaseUid} onChange={(e) => setShowcaseUid(e.target.value)}>
                {realPartners.length === 0 ? <option value="">No real partners yet</option> : null}
                {realPartners.map((u) => (
                  <option key={u.id} value={u.uid ?? u.id}>
                    {u.username} · {u.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="gng-field">
              <label htmlFor="g-venue">New venue name</label>
              <input id="g-venue" className="gng-input" value={venueName} onChange={(e) => setVenueName(e.target.value)} />
            </div>
            <div className="gng-field">
              <label htmlFor="g-address">Address</label>
              <input id="g-address" className="gng-input" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>
          <div className="gng-row">
            <Slider id="g-back" label={`${daysBack} days back (with check-ins)`} value={daysBack} min={0} max={21} onChange={setDaysBack} />
            <Slider id="g-forward" label={`${daysForward} days ahead`} value={daysForward} min={0} max={21} onChange={setDaysForward} />
          </div>
        </Step>
      </div>

      <aside className="gng-panel gng-gen-side">
        <div className="gng-panel-head">
          <h2>Demo data now</h2>
        </div>
        <dl className="gng-gen-counts">
          <div><dt>Partners</dt><dd>{counts.partners}</dd></div>
          <div><dt>Happenings</dt><dd>{counts.happenings}</dd></div>
          <div><dt>Goers</dt><dd>{counts.goers}</dd></div>
          <div><dt>Circles</dt><dd>{counts.circles}</dd></div>
        </dl>
        <p className="gng-muted" style={{ fontSize: 13 }}>
          Run the steps in order the first time. Every step can run again: it refreshes the same docs instead of
          making copies. Demo docs all start with <code>demo-</code>.
        </p>
        <p className="gng-muted" style={{ fontSize: 13 }}>
          QR codes: each demo partner's venue QR (Partners → open a venue) checks Goers in to any of that venue's
          Happenings.
        </p>
        <div style={{ marginTop: "auto" }}>
          {status.clear ? (
            <div className={`gng-alert ${status.clear.error ? "gng-alert-danger" : "gng-alert-success"}`} role="status" style={{ marginBottom: 12 }}>
              {status.clear.text}
            </div>
          ) : null}
          {confirmClear ? (
            <div className="gng-gen-confirm">
              <span>Delete all demo data? Real accounts stay, minus their demo Circles. Points boosts and the showcase partner's name aren't undone.</span>
              <div className="gng-actions">
                <button type="button" className="gng-btn gng-btn-ghost gng-btn-small" onClick={() => setConfirmClear(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="gng-btn gng-btn-danger gng-btn-small"
                  disabled={busy !== null}
                  onClick={() => {
                    setConfirmClear(false);
                    run("clear", async () => `Removed demo data (${await clearAllDemoData(ctx)} writes).`);
                  }}
                >
                  {busy === "clear" ? "Removing…" : "Delete"}
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="gng-btn gng-btn-ghost" style={{ width: "100%", color: "var(--gng-danger)" }} onClick={() => setConfirmClear(true)} disabled={busy !== null}>
              <Trash2 size={18} aria-hidden="true" /> Remove all demo data
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
