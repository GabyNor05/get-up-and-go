/**
 * Demo generator for the admin portal (showcase data).
 *
 * Everything it writes has an id starting with "demo-" and `demo: true`, so
 * re-running refreshes instead of duplicating and clearAllDemoData() removes
 * it all again. Random choices use a seeded generator, so the same button
 * gives the same people, circles and numbers every time.
 *
 * Demo partners, Goers and their logins: these are Firestore docs only (no
 * Firebase Auth accounts). Nobody can log in as them; they exist so the app
 * and portal have real-looking data to show.
 */
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  GeoPoint,
  getDocs,
  Timestamp,
  writeBatch,
  type DocumentReference,
  type WriteBatch,
} from "firebase/firestore";

import { db } from "../shared-firebase/config/firebase";
import {
  DEMO_VENUES,
  buildDemoHappenings,
  type DemoVenue,
  type GenerateDemoOptions,
} from "../shared-firebase/demo/demoHappenings";
import type { CircleDoc, GoerDoc, HappeningDoc, PartnerDoc, SupportTicket, UserDoc } from "./adminData";

const DAY = 86_400_000;
const WEEK = 7 * DAY;

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function hashString(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Seeded random numbers, so re-running gives the same data */
export function seeded(seed: string) {
  let a = hashString(seed);
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T,>(items: T[]): T => items[Math.floor(next() * items.length)],
    shuffle: <T,>(items: T[]): T[] => {
      const copy = [...items];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
  };
}

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const ymd = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
const mapsLink = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const isDemoId = (id: string | undefined) => !!id && id.startsWith("demo-");
export const isDemoDoc = (d: { id: string; demo?: boolean }) => d.demo === true || isDemoId(d.id);

/** Goer ID in the app's format XXXX-00-XG, but stable for a given person */
function demoGoerId(name: string): string {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "").padEnd(4, "X").slice(0, 4);
  const digits = String(hashString(name) % 100).padStart(2, "0");
  return `${letters}-${digits}-${letters.charAt(0)}G`;
}

function joinCode(title: string): string {
  const letters = title.toUpperCase().replace(/[^A-Z]/g, "").padEnd(4, "X").slice(0, 4);
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const h = hashString(title);
  return `${letters}-${chars[h % 32]}${chars[(h >> 5) % 32]}${chars[(h >> 10) % 32]}`;
}

/** Firestore batches max out at 500 writes; this commits as it goes */
class Writer {
  private batch: WriteBatch = writeBatch(db);
  private count = 0;
  private pending: Promise<void>[] = [];
  writes = 0;

  private bump() {
    this.count++;
    this.writes++;
    if (this.count >= 450) {
      this.pending.push(this.batch.commit());
      this.batch = writeBatch(db);
      this.count = 0;
    }
  }
  set(ref: DocumentReference, data: Record<string, unknown>, merge = true) {
    this.batch.set(ref, data, { merge });
    this.bump();
  }
  delete(ref: DocumentReference) {
    this.batch.delete(ref);
    this.bump();
  }
  async done() {
    if (this.count > 0) this.pending.push(this.batch.commit());
    await Promise.all(this.pending);
  }
}

/** What the generator needs to know about the database right now */
export interface SeedContext {
  users: UserDoc[];
  goers: GoerDoc[];
  partners: PartnerDoc[];
  circles: CircleDoc[];
  happenings: HappeningDoc[];
}

/* ------------------------------------------------------------------ */
/* Partners: one per real venue                                         */
/* ------------------------------------------------------------------ */

export const venuePartnerId = (key: string) => `demo-venue-${key}`;

const VENUE_BIOS: Record<string, string> = {
  "open-window": "Creative campus in Southdowns. Student showcases, sketch walks and mixers.",
  "cappuccinos-southdowns": "Neighbourhood coffee spot around the corner from campus.",
  "irene-farm": "Historic dairy farm: milkshakes, farm walks and the Rooted night market.",
  "irene-village-mall": "Open-air piazza with classes, movie nights and painting evenings.",
  "smuts-house": "Museum grounds, the koppie trail and a Saturday market.",
  "irene-river": "River trail through the estate for runs, walks and dogs.",
  "big-red-barn": "Forest trails, MTB loops and the Irene Village Market.",
  "centurion-mall": "Board game café meet-ups and weekend live music.",
  "centurion-lake": "Lakeside walks with jazz at sunset.",
  "supersport-park": "Home of Centurion cricket, with social nets sessions.",
  rietvlei: "Nature reserve for game drives and birding.",
  "lots-of-pots": "Garden nursery with Kappie'ccino coffee shop.",
};

/** Builds the users + partners docs for every demo venue */
export function seedPartners(options: { spreadWeeks: number; venues?: DemoVenue[] }): Promise<number> {
  return writePartners(options.venues ?? DEMO_VENUES, options.spreadWeeks);
}

async function writePartners(venues: DemoVenue[], spreadWeeks: number): Promise<number> {
  const writer = new Writer();
  const now = Date.now();
  venues.forEach((venue, index) => {
    const id = venuePartnerId(venue.key);
    const rand = seeded(`partner-${venue.key}`);
    // Spread join dates over the chosen weeks so "Newest partners" looks lived-in
    const joined = now - Math.round(((index + rand.next()) / venues.length) * spreadWeeks * WEEK) - rand.int(1, 20) * 3600_000;
    writer.set(doc(db, "users", id), {
      uid: id,
      username: venue.name,
      email: `hello@${slug(venue.name)}.demo`,
      role: "partner",
      status: "active",
      createdAt: Timestamp.fromMillis(joined),
      demo: true,
    });
    writer.set(doc(db, "partners", id), {
      uid: id,
      venue_name: venue.name,
      locationName: `${venue.name}, ${venue.address}`,
      google_maps_link: mapsLink(`${venue.name}, ${venue.address}`),
      coordinates: new GeoPoint(venue.latitude, venue.longitude),
      bio: VENUE_BIOS[venue.key] ?? "",
      venue_images: [],
      demo: true,
    });
  });
  await writer.done();
  return venues.length;
}

/* ------------------------------------------------------------------ */
/* Happenings at real venues, each owned by that venue's partner        */
/* ------------------------------------------------------------------ */

function venueForLocation(locationName: string): DemoVenue | undefined {
  return DEMO_VENUES.find((venue) => locationName.startsWith(venue.name));
}

/** Same as the shared builder, but every Happening belongs to its venue's partner (so venue QRs work) */
export function buildVenueHappenings(options: GenerateDemoOptions) {
  return buildDemoHappenings(options).map((item) => {
    const venue = venueForLocation(String(item.data.locationName));
    return venue ? { ...item, data: { ...item.data, partner_id: venuePartnerId(venue.key) } } : item;
  });
}

export async function generateVenueHappenings(options: GenerateDemoOptions, ctx: SeedContext): Promise<number> {
  const docs = buildVenueHappenings(options);

  // Make sure every venue used has a partner, so its QR and name show up
  const existing = new Set(ctx.partners.map((p) => p.id));
  const missing = DEMO_VENUES.filter(
    (venue) => !existing.has(venuePartnerId(venue.key)) && docs.some((d) => d.data.partner_id === venuePartnerId(venue.key))
  );
  if (missing.length) await writePartners(missing, 10);

  const writer = new Writer();
  docs.forEach(({ id, data }) => {
    writer.set(doc(db, "happenings", id), { ...data, rsvps: arrayUnion(), attendees: arrayUnion() });
  });
  await writer.done();
  return docs.length;
}

/* ------------------------------------------------------------------ */
/* Goers                                                                */
/* ------------------------------------------------------------------ */

interface DemoPerson {
  key: string;
  name: string;
  /** Shown as the username in the app */
  nickname: string;
}

const RANDOM_PEOPLE: DemoPerson[] = [
  ["thabo-m", "Thabo", "ThaboM"], ["lerato-k", "Lerato", "LeratoK"], ["sipho-n", "Sipho", "SiphoN"],
  ["zanele-d", "Zanele", "ZaneleD"], ["pieter-v", "Pieter", "PieterVdM"], ["annika-b", "Annika", "AnnikaB"],
  ["ruan-s", "Ruan", "RuanS"], ["nomvula-z", "Nomvula", "NomvulaZ"], ["kagiso-m", "Kagiso", "KagisoM"],
  ["chloe-r", "Chloé", "ChloeR"], ["liam-p", "Liam", "LiamP"], ["ayanda-n", "Ayanda", "AyandaN"],
  ["bongani-k", "Bongani", "BonganiK"], ["mia-vw", "Mia", "MiaVW"], ["jaco-l", "Jaco", "JacoL"],
  ["tshepo-m", "Tshepo", "TshepoM"], ["refilwe-s", "Refilwe", "RefilweS"], ["sanele-x", "Sanele", "SaneleX"],
  ["amber-j", "Amber", "AmberJ"], ["keegan-f", "Keegan", "KeeganF"], ["palesa-t", "Palesa", "PalesaT"],
  ["ethan-c", "Ethan", "EthanC"], ["zoe-h", "Zoë", "ZoeH"], ["lwazi-d", "Lwazi", "LwaziD"],
  ["carla-dk", "Carla", "CarlaDK"], ["neo-m", "Neo", "NeoM"], ["isabel-g", "Isabel", "IsabelG"],
  ["khanyi-z", "Khanyisile", "KhanyiZ"], ["dylan-o", "Dylan", "DylanO"], ["ruby-w", "Ruby", "RubyW"],
  ["mpho-l", "Mpho", "MphoL"], ["jessica-a", "Jessica", "JessA"], ["tumi-k", "Tumi", "TumiK"],
  ["marco-p", "Marco", "MarcoP"], ["olwethu-s", "Olwethu", "OlwethuS"], ["hannah-b", "Hannah", "HannahB"],
  ["sibusiso-n", "Sibusiso", "SbuN"], ["leah-v", "Leah", "LeahV"], ["tyler-m", "Tyler", "TylerM"],
  ["nandi-q", "Nandi", "NandiQ"],
].map(([key, name, nickname]) => ({ key, name, nickname }));

export const MAX_RANDOM_GOERS = RANDOM_PEOPLE.length;

/** Gaby's friends, with the nicknames they show up under in the app */
export const FRIENDS: DemoPerson[] = [
  { key: "yulani", name: "Yulani", nickname: "Yulans" },
  { key: "michelle", name: "Michelle", nickname: "Mish" },
  { key: "pomolo", name: "Pomolo", nickname: "Pomi" },
  { key: "diana", name: "Diana", nickname: "Dions" },
  { key: "luca-b", name: "Luca", nickname: "Lukey" },
  { key: "tani", name: "Tani", nickname: "Tans" },
  { key: "annalie", name: "Annalie", nickname: "Annie" },
  { key: "xander", name: "Xander", nickname: "Xandy" },
  { key: "jono", name: "Jonathan", nickname: "JonoV" },
  { key: "emily", name: "Emily", nickname: "Ems" },
  { key: "eloise", name: "Eloise", nickname: "Lou" },
  { key: "vunene", name: "Vunene", nickname: "Vuvu" },
  { key: "kb", name: "KB", nickname: "KB" },
  { key: "mikey", name: "Mikey", nickname: "Mikey" },
  { key: "luca-f", name: "Luca", nickname: "LucaZoom" },
  { key: "charmaine", name: "Charmaine", nickname: "Charms" },
  { key: "desi", name: "Desi", nickname: "DesiP" },
  { key: "tiana", name: "Tiana", nickname: "Tee" },
  { key: "kaylin", name: "Kaylin", nickname: "Kaylz" },
  { key: "georgia", name: "Georgia", nickname: "Georgie" },
  { key: "kayla", name: "Kayla", nickname: "Kay" },
  { key: "dearis", name: "Dearis", nickname: "Dee" },
  { key: "charissa", name: "Charissa", nickname: "Rissa" },
  { key: "anchen", name: "Anchen", nickname: "Anch" },
  { key: "darian", name: "Darian", nickname: "Dari" },
  { key: "rose", name: "Rose", nickname: "Rosie" },
  { key: "alzon", name: "Alzon", nickname: "Al" },
];

export const goerUid = (key: string) => `demo-goer-${key}`;

/** `exists`: the Goer is already in the database (keep their name and GP, only make sure the doc is complete) */
function writeGoer(writer: Writer, person: DemoPerson, exists = false, joinedWithinWeeks = 16) {
  const uid = goerUid(person.key);
  const rand = seeded(`goer-${person.key}`);
  const total = rand.int(4, 34) * 50 + rand.int(0, 1) * 25;
  const monthly = Math.min(total, rand.int(2, 9) * 50);
  if (!exists) {
    writer.set(doc(db, "users", uid), {
      uid,
      username: person.nickname,
      full_name: person.name,
      email: `${slug(person.nickname)}@demo.getupandgo.app`,
      role: "goer",
      status: "active",
      createdAt: Timestamp.fromMillis(Date.now() - rand.int(3, joinedWithinWeeks * 7) * DAY - rand.int(0, 23) * 3600_000),
      demo: true,
    });
  }
  writer.set(doc(db, "goers", uid), {
    uid,
    ...(exists ? {} : { goer_id: demoGoerId(person.name), total_gp: total, monthly_gp: monthly, avatarPublicId: "" }),
    circles: arrayUnion(),
    ping_mes: arrayUnion(),
    demo: true,
  });
}

/** Adds `count` made-up Goers (South African names, random GP and join dates) */
export async function seedGoers(count: number, ctx: SeedContext): Promise<number> {
  const people = RANDOM_PEOPLE.slice(0, Math.max(0, Math.min(count, RANDOM_PEOPLE.length)));
  const existing = new Set(ctx.users.map((u) => u.id));
  const writer = new Writer();
  people.forEach((person) => writeGoer(writer, person, existing.has(goerUid(person.key))));
  await writer.done();
  return people.length;
}

/* ------------------------------------------------------------------ */
/* Circles                                                              */
/* ------------------------------------------------------------------ */

const THEMES = {
  purple: { accent: "#A88AED", light: "#ECE4FC", dark: "#352C53" },
  celery: { accent: "#A6C261", light: "#E9F2D3", dark: "#36421B" },
  amber: { accent: "#E8A84C", light: "#FDF0DA", dark: "#3D2E14" },
  sky: { accent: "#6CB8E8", light: "#E1F1FB", dark: "#1E2B35" },
  coral: { accent: "#E87D6C", light: "#FBE4E0", dark: "#3A2320" },
  green: { accent: "#7DC98A", light: "#E3F4E6", dark: "#203024" },
};
type ThemeName = keyof typeof THEMES;

interface CircleSpec {
  id: string;
  title: string;
  emoji: string;
  theme: ThemeName;
  tags: string[];
  description: string;
  /** Friend keys (see FRIENDS) or full uids for existing demo Goers */
  members: string[];
  daysAgo: number;
}

/** Gaby's real-life circles. Every friend ends up in at least two. */
export const FRIEND_CIRCLES: CircleSpec[] = [
  {
    id: "demo-circle-band",
    title: "The Band",
    emoji: "🎸",
    theme: "purple",
    tags: ["Music", "Gigs", "Jam sessions"],
    description: "Rehearsals, gigs and the after-gig snack run.",
    members: ["yulani", "michelle", "pomolo", "diana", "luca-b", "tani", "annalie", "xander", "jono", "emily", "eloise"],
    daysAgo: 62,
  },
  {
    id: "demo-circle-flash",
    title: "Flash Fans",
    emoji: "⚡",
    theme: "amber",
    tags: ["Movies", "Series", "Comics"],
    description: "Fastest Circle alive. Watch parties for every Flash episode and DC drop.",
    members: ["vunene", "kb", "mikey", "luca-f", "charmaine", "xander", "luca-b"],
    daysAgo: 48,
  },
  {
    id: "demo-circle-girlies",
    title: "The Girlies",
    emoji: "🌸",
    theme: "purple",
    tags: ["Hiking", "Markets"],
    description: "Markets, hikes and long brunches.",
    members: ["demo-goer-lea", "desi", "demo-goer-aisha", "demo-goer-naledi", "yulani", "annalie", "tani", "tiana", "kaylin", "georgia"],
    daysAgo: 40,
  },
  {
    id: "demo-circle-bookclub",
    title: "The Book Club",
    emoji: "📚",
    theme: "sky",
    tags: ["Books", "Coffee", "Cosy"],
    description: "One book a month, argued about over very good coffee.",
    members: ["kayla", "dearis", "charissa", "anchen", "georgia", "emily", "eloise"],
    daysAgo: 35,
  },
  {
    id: "demo-circle-hobbits",
    title: "The Hobbits",
    emoji: "🍿",
    theme: "green",
    tags: ["Movies", "Snacks", "Marathons"],
    description: "Second breakfast, then the cinema. Catching everyone up on the films they still haven't seen.",
    members: ["tiana", "kaylin", "kb", "darian", "michelle", "pomolo", "mikey"],
    daysAgo: 27,
  },
  {
    id: "demo-circle-walk",
    title: "Neighbourhood Walkers",
    emoji: "🚶",
    theme: "coral",
    tags: ["Walking", "Outdoors", "Sunsets"],
    description: "Evening loops around the neighbourhood, sunset optional but encouraged.",
    members: ["rose", "charmaine", "alzon", "charissa", "diana", "kayla"],
    daysAgo: 19,
  },
  {
    id: "demo-circle-coffee",
    title: "Coffee Run",
    emoji: "☕",
    theme: "celery",
    tags: ["Coffee", "Campus"],
    description: "Between-class coffee at Cappuccino's. Someone always owes someone a flat white.",
    members: ["vunene", "luca-f", "alzon", "darian", "dearis", "anchen", "rose", "jono", "diana", "desi"],
    daysAgo: 12,
  },
];

const RANDOM_CIRCLES: Omit<CircleSpec, "members" | "id">[] = [
  { title: "Sunday Market Squad", emoji: "🧺", theme: "amber", tags: ["Markets", "Food"], description: "Every market in Irene, ranked.", daysAgo: 30 },
  { title: "Quiz Night Legends", emoji: "🧠", theme: "purple", tags: ["Games", "Trivia"], description: "Undefeated (mostly) at Cappuccino's quiz night.", daysAgo: 26 },
  { title: "Pilates Pals", emoji: "🧘", theme: "green", tags: ["Fitness", "Mornings"], description: "Early classes on the piazza, then coffee.", daysAgo: 22 },
  { title: "Cricket Nets Crew", emoji: "🏏", theme: "sky", tags: ["Sport", "Cricket"], description: "Social nets at SuperSport Park.", daysAgo: 21 },
  { title: "Sketch Walkers", emoji: "🎨", theme: "coral", tags: ["Art", "Walking"], description: "Sketchbooks out, all levels welcome.", daysAgo: 18 },
  { title: "Night Market Munchers", emoji: "🍜", theme: "amber", tags: ["Food", "Night out"], description: "Here for the food trucks.", daysAgo: 16 },
  { title: "Plant Parents", emoji: "🪴", theme: "celery", tags: ["Plants", "Swaps"], description: "Cuttings, swaps and nursery trips.", daysAgo: 14 },
  { title: "Sunrise Hikers", emoji: "⛰️", theme: "green", tags: ["Hiking", "Nature"], description: "Up the koppie before the sun is.", daysAgo: 11 },
  { title: "MTB Mates", emoji: "🚴", theme: "sky", tags: ["Cycling", "Trails"], description: "Golden-hour loops at the Big Red Barn.", daysAgo: 9 },
  { title: "Jazz & Jol", emoji: "🎷", theme: "amber", tags: ["Music", "Food"], description: "Live music and a good table.", daysAgo: 7 },
  { title: "Board Game Bunch", emoji: "🎲", theme: "coral", tags: ["Games", "Café"], description: "Catan rematches every week.", daysAgo: 5 },
  { title: "Lake Loopers", emoji: "🌊", theme: "sky", tags: ["Running", "Walking"], description: "Laps around Centurion Lake.", daysAgo: 3 },
];

export const MAX_RANDOM_CIRCLES = RANDOM_CIRCLES.length;

function circleDoc(spec: CircleSpec, ownerUid: string) {
  const theme = THEMES[spec.theme];
  return {
    title: spec.title,
    description: spec.description,
    emoji: spec.emoji,
    accent: theme.accent,
    card_bg: { light: theme.light, dark: theme.dark },
    tags: spec.tags,
    join_code: joinCode(spec.title),
    max_size: 20,
    everybody_sends_invites: true,
    created_by: ownerUid,
    created_at: Timestamp.fromMillis(Date.now() - spec.daysAgo * DAY),
    demo: true,
  };
}

const FEED_TYPES = ["rsvp", "check_in", "me_too", "rsvp", "check_in"] as const;

/** A few "What we're doing" items per Circle, pointing at Happenings that exist */
function writeFeed(writer: Writer, circleId: string, memberUids: string[], names: Map<string, string>, happenings: HappeningDoc[]) {
  const rand = seeded(`feed-${circleId}`);
  const usable = happenings.filter((h) => h.title);
  const now = Date.now();
  const items = Math.min(6, memberUids.length);
  for (let i = 0; i < items; i++) {
    const uid = memberUids[i];
    const happening = usable.length ? rand.pick(usable) : null;
    const type = happening ? FEED_TYPES[i % FEED_TYPES.length] : "joined";
    writer.set(
      doc(db, "circle_feed", `demo-feed-${circleId.replace("demo-circle-", "")}-${i + 1}`),
      {
        circle_id: circleId,
        goer_uid: uid,
        username: names.get(uid) ?? "Goer",
        type,
        ...(happening && type !== "joined" ? { happening_id: happening.id, happening_title: happening.title } : {}),
        created_at: Timestamp.fromMillis(now - (i + 1) * rand.int(40, 300) * 60_000),
        demo: true,
      },
      false
    );
  }
}

export interface FriendCirclesOptions {
  /** Real account that owns the Circles (Gaby) */
  ownerUid: string;
  /** Other real accounts to add to The Girlies and The Hobbits */
  extraUids: string[];
}

/** Creates Gaby's friends as Goers and puts them into her real-life Circles */
export async function seedFriendCircles(options: FriendCirclesOptions, ctx: SeedContext): Promise<{ goers: number; circles: number }> {
  const writer = new Writer();
  const existing = new Set(ctx.users.map((u) => u.id));
  FRIENDS.forEach((friend) => writeGoer(writer, friend, existing.has(goerUid(friend.key))));

  const names = new Map<string, string>(ctx.users.map((u) => [u.uid ?? u.id, u.username]));
  FRIENDS.forEach((f) => names.set(goerUid(f.key), f.nickname));
  ["lea", "aisha", "naledi"].forEach((k) => names.set(goerUid(k), names.get(goerUid(k)) ?? k));

  const toUid = (member: string) => (member.startsWith("demo-goer-") ? member : goerUid(member));
  // Members from the mobile seed (Lea, Aisha, Naledi) only if they exist
  const isPresent = (uid: string) => FRIENDS.some((f) => goerUid(f.key) === uid) || existing.has(uid);

  FRIEND_CIRCLES.forEach((spec) => {
    const extras = ["demo-circle-girlies", "demo-circle-hobbits"].includes(spec.id) ? options.extraUids : [];
    const members = Array.from(new Set([options.ownerUid, ...spec.members.map(toUid).filter(isPresent), ...extras].filter(Boolean)));
    writer.set(doc(db, "circles", spec.id), { ...circleDoc(spec, options.ownerUid), goer_ids: arrayUnion(...members) });
    members.forEach((uid) => writer.set(doc(db, "goers", uid), { circles: arrayUnion(spec.id) }));
    writeFeed(writer, spec.id, members.slice(1), names, ctx.happenings);
  });

  await writer.done();
  return { goers: FRIENDS.length, circles: FRIEND_CIRCLES.length };
}

export interface RandomCirclesOptions {
  count: number;
  minMembers: number;
  maxMembers: number;
  /** Top up demo Goers so each is in at least this many Circles */
  atLeast: number;
}

/** Fills generic Circles with the demo Goers that exist */
export async function seedRandomCircles(options: RandomCirclesOptions, ctx: SeedContext): Promise<{ circles: number; members: number }> {
  const pool = ctx.goers.filter((g) => isDemoId(g.id)).map((g) => g.id);
  if (pool.length < 2) throw new Error("Generate some Goers first.");

  const rand = seeded(`random-circles-${options.count}-${options.minMembers}-${options.maxMembers}`);
  const specs = RANDOM_CIRCLES.slice(0, Math.min(options.count, RANDOM_CIRCLES.length));
  const membership = new Map<string, Set<string>>(); // circle id -> uids
  const perGoer = new Map<string, number>();
  ctx.goers.forEach((g) => perGoer.set(g.id, g.circles?.length ?? 0));

  specs.forEach((spec) => {
    const id = `demo-circle-${slug(spec.title)}`;
    const size = Math.min(pool.length, rand.int(options.minMembers, Math.max(options.minMembers, options.maxMembers)));
    // Favour people in the fewest Circles so it spreads out
    const ordered = rand.shuffle(pool).sort((a, b) => (perGoer.get(a) ?? 0) - (perGoer.get(b) ?? 0));
    const members = new Set(ordered.slice(0, size));
    members.forEach((uid) => perGoer.set(uid, (perGoer.get(uid) ?? 0) + 1));
    membership.set(id, members);
  });

  // Everyone should be in a couple of Circles
  const ids = Array.from(membership.keys());
  if (ids.length) {
    pool.forEach((uid) => {
      let guard = 0;
      while ((perGoer.get(uid) ?? 0) < options.atLeast && guard++ < ids.length) {
        const target = ids.find((id) => !membership.get(id)!.has(uid) && membership.get(id)!.size < 20);
        if (!target) break;
        membership.get(target)!.add(uid);
        perGoer.set(uid, (perGoer.get(uid) ?? 0) + 1);
      }
    });
  }

  const names = new Map<string, string>(ctx.users.map((u) => [u.uid ?? u.id, u.username]));
  const writer = new Writer();
  let memberCount = 0;
  specs.forEach((spec) => {
    const id = `demo-circle-${slug(spec.title)}`;
    const members = Array.from(membership.get(id) ?? []);
    memberCount += members.length;
    writer.set(doc(db, "circles", id), { ...circleDoc({ ...spec, id, members }, members[0]), goer_ids: arrayUnion(...members) });
    members.forEach((uid) => writer.set(doc(db, "goers", uid), { circles: arrayUnion(id) }));
    writeFeed(writer, id, members, names, ctx.happenings);
  });
  await writer.done();
  return { circles: specs.length, members: memberCount };
}

/* ------------------------------------------------------------------ */
/* RSVPs and check-ins                                                  */
/* ------------------------------------------------------------------ */

export interface ActivityOptions {
  /** Max RSVPs per Happening */
  maxRsvps: number;
  /** Share of RSVPs (0–1) that check in to Happenings that already started */
  showRate: number;
  /** Also fill partners' own (non-demo) Happenings */
  includeReal: boolean;
}

/** Fills Happenings with RSVPs from demo Goers, and check-ins for the ones that already happened */
export async function fillActivity(options: ActivityOptions, ctx: SeedContext): Promise<{ happenings: number; rsvps: number; checkIns: number }> {
  const pool = ctx.goers.filter((g) => isDemoId(g.id)).map((g) => g.id);
  if (!pool.length) throw new Error("Generate some Goers first.");
  const now = Date.now();
  const writer = new Writer();
  let rsvps = 0;
  let checkIns = 0;
  const targets = ctx.happenings.filter((h) => options.includeReal || isDemoDoc(h));
  targets.forEach((h) => {
    const rand = seeded(`activity-${h.id}`);
    const size = rand.int(Math.min(3, options.maxRsvps), Math.max(3, options.maxRsvps));
    const going = rand.shuffle(pool).slice(0, size);
    const started = (h.dateTime?.toMillis?.() ?? 0) <= now;
    const came = started ? going.filter(() => rand.next() < options.showRate) : [];
    rsvps += going.length;
    checkIns += came.length;
    writer.set(doc(db, "happenings", h.id), {
      rsvps: arrayUnion(...going),
      attendees: arrayUnion(...came),
    });
  });
  await writer.done();
  return { happenings: targets.length, rsvps, checkIns };
}

/* ------------------------------------------------------------------ */
/* Support tickets                                                      */
/* ------------------------------------------------------------------ */

const TICKETS: { subject: string; message: string; topic: string; from: "goer" | "partner"; resolved?: boolean; note?: string }[] = [
  { subject: "Check-in QR won't scan", message: "I'm at Irene Farm for the milkshake tasting and the camera opens but nothing happens when I point it at the QR on the counter.", topic: "Check-ins", from: "goer" },
  { subject: "Didn't get my Go-Points", message: "Checked in to the Sunset Lake Walk on Wednesday and it said +50 GP but my total didn't change.", topic: "Go-Points", from: "goer", resolved: true, note: "Points were delayed by a sync issue. Confirmed they landed the next morning." },
  { subject: "How do I leave a Circle?", message: "I joined a Circle by accident with a join code. Is there a way to leave it?", topic: "Circles", from: "goer", resolved: true, note: "Pointed them to Circle → ⋯ → Leave Circle." },
  { subject: "Can I change my username?", message: "I made my username at 2am and I regret it. Can it be changed?", topic: "Account", from: "goer" },
  { subject: "Happening shows the wrong time", message: "Our Sip & Paint shows 18:00 but it starts at 18:30. I can't see where to edit it.", topic: "Happenings", from: "partner" },
  { subject: "Notifications for RSVPs", message: "Is there a way to get an email when someone RSVPs to our market?", topic: "Partners", from: "partner", resolved: true, note: "Not yet. Added to the roadmap and told them the dashboard updates live." },
  { subject: "Circle invite link expired", message: "My friend says the join code I sent doesn't work any more.", topic: "Circles", from: "goer" },
  { subject: "Dark mode text hard to read", message: "On the Go-Points screen some of the grey text is hard to read in dark mode.", topic: "App", from: "goer" },
  { subject: "Report a Happening", message: "The Rietvlei game drive listed for Sunday doesn't seem to exist. The reserve said they don't run one at that time.", topic: "Safety", from: "goer" },
  { subject: "Printing our venue QR", message: "The PDF poster is great. Can we get a smaller table-tent size too?", topic: "Partners", from: "partner" },
  { subject: "Leaderboard looks stuck", message: "My monthly GP has been the same for three days even though I checked in twice.", topic: "Go-Points", from: "goer" },
  { subject: "Delete my account", message: "I'm moving overseas. Please delete my account and data.", topic: "Account", from: "goer", resolved: true, note: "Account removed on request." },
];

export const MAX_TICKETS = TICKETS.length;

export async function seedTickets(count: number, ctx: SeedContext): Promise<number> {
  const goers = ctx.users.filter((u) => u.role === "goer" && isDemoId(u.id));
  const partners = ctx.users.filter((u) => u.role === "partner" && isDemoId(u.id));
  const rand = seeded("tickets");
  const now = Date.now();
  const writer = new Writer();
  const chosen = TICKETS.slice(0, Math.min(count, TICKETS.length));
  chosen.forEach((ticket, index) => {
    const from = ticket.from === "partner" ? partners : goers;
    const sender = from.length ? from[index % from.length] : undefined;
    const created = now - (index * 19 + rand.int(1, 18)) * 3600_000;
    writer.set(
      doc(db, "support_tickets", `demo-ticket-${index + 1}`),
      {
        uid: sender?.uid ?? sender?.id ?? null,
        username: sender?.username ?? (ticket.from === "partner" ? "Venue partner" : "Goer"),
        email: sender?.email ?? null,
        subject: ticket.subject,
        message: ticket.message,
        topic: ticket.topic,
        status: ticket.resolved ? "resolved" : "open",
        source: ticket.from === "partner" ? "portal" : "app",
        ...(ticket.note ? { admin_note: ticket.note } : {}),
        created_at: Timestamp.fromMillis(created),
        ...(ticket.resolved ? { resolved_at: Timestamp.fromMillis(created + rand.int(2, 30) * 3600_000) } : {}),
        demo: true,
      },
      false
    );
  });
  await writer.done();
  return chosen.length;
}

/* ------------------------------------------------------------------ */
/* Boost real Goers                                                     */
/* ------------------------------------------------------------------ */

export interface GpUpdate {
  uid: string;
  total: number;
  monthly: number;
}

export async function boostGoers(updates: GpUpdate[]): Promise<number> {
  const writer = new Writer();
  updates.forEach((u) => {
    writer.set(doc(db, "goers", u.uid), { total_gp: Math.max(0, Math.round(u.total)), monthly_gp: Math.max(0, Math.round(Math.min(u.monthly, u.total))) });
  });
  await writer.done();
  return updates.length;
}

/* ------------------------------------------------------------------ */
/* Showcase partner (a real partner login with a full dashboard)        */
/* ------------------------------------------------------------------ */

const SHOWCASE_TEMPLATES = [
  { title: "Brunch Club", category: "FOOD", hour: 9, minute: 30, image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=800", description: "Long tables, bottomless filter coffee and the best French toast in Southdowns." },
  { title: "Design Crit & Coffee", category: "COMMUNITY", hour: 10, minute: 0, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800", description: "Bring a project, get friendly feedback from other creatives over a flat white." },
  { title: "Board Game Night", category: "GAMES", hour: 18, minute: 0, image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=800", description: "Catan, Codenames and a stack of party games. Tables for newcomers." },
  { title: "Open Mic & Hot Chocolate", category: "MUSIC", hour: 18, minute: 30, image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800", description: "Sign up at the counter for a 10-minute slot. Poetry, songs, comedy all welcome." },
  { title: "Sunrise Stretch on the Deck", category: "SPORT", hour: 6, minute: 30, image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800", description: "Gentle 40-minute stretch class on the deck, then coffee on us." },
  { title: "Pottery & Pastries", category: "COMMUNITY", hour: 14, minute: 0, image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=800", description: "Hand-build a mug with a local ceramicist. Clay, glaze and pastries included." },
  { title: "Acoustic Sundowners", category: "MUSIC", hour: 17, minute: 0, image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=800", description: "Local acoustic acts on the patio as the sun goes down." },
] as const;

export interface ShowcaseOptions {
  partnerUid: string;
  venueName: string;
  address: string;
  latitude: number;
  longitude: number;
  daysBack: number;
  daysForward: number;
}

/** Renames a real partner and gives them a fortnight of Happenings full of RSVPs and check-ins */
export async function setupShowcasePartner(options: ShowcaseOptions, ctx: SeedContext): Promise<number> {
  const pool = ctx.goers.filter((g) => isDemoId(g.id)).map((g) => g.id);
  const where = `${options.venueName}, ${options.address}`;
  const writer = new Writer();

  writer.set(doc(db, "partners", options.partnerUid), {
    uid: options.partnerUid,
    venue_name: options.venueName,
    locationName: where,
    google_maps_link: mapsLink(where),
    coordinates: new GeoPoint(options.latitude, options.longitude),
    bio: "Café and creative space a few minutes from campus: brunch, games, open mics and workshops.",
  });

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const now = Date.now();
  let count = 0;
  for (let offset = -options.daysBack; offset <= options.daysForward; offset++) {
    const day = new Date(start.getTime() + offset * DAY);
    const rand = seeded(`showcase-${options.partnerUid}-${ymd(day)}`);
    // One or two Happenings a day
    const picks = rand.shuffle([...SHOWCASE_TEMPLATES]).slice(0, offset === 0 ? 2 : rand.int(1, 2));
    for (const template of picks) {
      const when = new Date(day);
      when.setHours(template.hour, template.minute, 0, 0);
      const going = pool.length ? rand.shuffle(pool).slice(0, rand.int(Math.min(4, pool.length), Math.min(pool.length, 16))) : [];
      const came = when.getTime() <= now ? going.filter(() => rand.next() < 0.7) : [];
      writer.set(doc(db, "happenings", `demo-showcase-${options.partnerUid.slice(0, 8)}-${ymd(day)}-${slug(template.title)}`), {
        partner_id: options.partnerUid,
        title: template.title,
        description: template.description,
        thumbnail_url: template.image,
        category: template.category,
        dateTime: Timestamp.fromDate(when),
        locationName: where,
        google_maps_link: mapsLink(where),
        coordinates: new GeoPoint(options.latitude, options.longitude),
        rsvps: arrayUnion(...going),
        attendees: arrayUnion(...came),
        demo: true,
      });
      count++;
    }
  }
  await writer.done();
  return count;
}

/* ------------------------------------------------------------------ */
/* Remove everything                                                    */
/* ------------------------------------------------------------------ */

/** Deletes every demo doc and takes demo Circles/Goers off real accounts and Happenings */
export async function clearAllDemoData(ctx: SeedContext): Promise<number> {
  const writer = new Writer();
  const feed = await getDocs(collection(db, "circle_feed"));
  const tickets = await getDocs(collection(db, "support_tickets"));

  const demoCircleIds = ctx.circles.filter(isDemoDoc).map((c) => c.id);
  const demoGoerIds = new Set(ctx.goers.filter(isDemoDoc).map((g) => g.id));

  // Real Goers: drop demo Circles from their profile
  ctx.goers
    .filter((g) => !isDemoDoc(g) && (g.circles ?? []).some((id) => demoCircleIds.includes(id)))
    .forEach((g) => writer.set(doc(db, "goers", g.id), { circles: arrayRemove(...demoCircleIds) }));
  // Real Happenings: drop demo RSVPs and check-ins
  ctx.happenings
    .filter((h) => !isDemoDoc(h) && [...(h.rsvps ?? []), ...(h.attendees ?? [])].some((uid) => demoGoerIds.has(uid)))
    .forEach((h) => {
      const ids = Array.from(demoGoerIds);
      writer.set(doc(db, "happenings", h.id), { rsvps: arrayRemove(...ids), attendees: arrayRemove(...ids) });
    });

  ctx.users.filter(isDemoDoc).forEach((d) => writer.delete(doc(db, "users", d.id)));
  ctx.partners.filter(isDemoDoc).forEach((d) => writer.delete(doc(db, "partners", d.id)));
  ctx.goers.filter(isDemoDoc).forEach((d) => writer.delete(doc(db, "goers", d.id)));
  ctx.circles.filter(isDemoDoc).forEach((d) => writer.delete(doc(db, "circles", d.id)));
  ctx.happenings.filter(isDemoDoc).forEach((d) => writer.delete(doc(db, "happenings", d.id)));
  feed.docs.filter((d) => isDemoId(d.id) || d.data().demo === true).forEach((d) => writer.delete(d.ref));
  tickets.docs.filter((d) => isDemoId(d.id) || (d.data() as SupportTicket & { demo?: boolean }).demo === true).forEach((d) => writer.delete(d.ref));

  await writer.done();
  return writer.writes;
}
