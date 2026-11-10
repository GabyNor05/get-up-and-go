/**
 * Demo Happening generator for showcases.
 *
 * Builds realistic Happenings at REAL venues around Centurion / Irene
 * (made-up events, real places) for a chosen area, date range and radius.
 * Every doc has a deterministic id and `demo: true`, so re-running refreshes
 * instead of duplicating, and clearDemoHappenings() removes them all.
 *
 * Shared by the mobile Settings dev tools and the portal admin page.
 * Coordinates are approximate (good enough for distance filtering).
 */
import { arrayUnion, collection, doc, getDocs, query, where, writeBatch, GeoPoint, Timestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import type { HappeningCategory } from "../types/happening";

export interface DemoArea {
  key: string;
  label: string;
  latitude: number;
  longitude: number;
}

export interface DemoVenue {
  key: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface DemoTemplate {
  venue: string;
  title: string;
  description: string;
  category: Exclude<HappeningCategory, "ALL">;
  /** 0 = Sunday … 6 = Saturday */
  weekdays: number[];
  hour: number;
  minute?: number;
  image: string;
}

export interface GenerateDemoOptions {
  center: { latitude: number; longitude: number };
  radiusKm: number;
  /** First day (local time); defaults to today */
  startDate?: Date;
  /** How many days to cover, including the start day */
  days: number;
  /** Stored as partner_id so the demo partner's venue QR works */
  partnerId?: string;
}

export const DEMO_PARTNER_ID = "demo-partner";

export const DEMO_AREAS: DemoArea[] = [
  { key: "open-window", label: "Open Window campus, Southdowns", latitude: -25.8795, longitude: 28.2005 },
  { key: "irene", label: "Irene village", latitude: -25.8730, longitude: 28.2230 },
  { key: "centurion-cbd", label: "Centurion Mall & Lake", latitude: -25.8580, longitude: 28.1890 },
];

const IMG = {
  coffee: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800",
  milkshake: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800",
  market: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800",
  garden: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800",
  food: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800",
  music: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800",
  jazz: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=800",
  run: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=800",
  trail: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?q=80&w=800",
  yoga: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800",
  bike: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800",
  nature: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800",
  games: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=800",
  family: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=800",
  cricket: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=800",
  theatre: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=800",
};

export const DEMO_VENUES: DemoVenue[] = [
  { key: "open-window", name: "Open Window Centurion", address: "1297 John Vorster Dr, Southdowns, Centurion", latitude: -25.8795, longitude: 28.2005 },
  { key: "cappuccinos-southdowns", name: "Cappuccino's Southdowns", address: "Southdowns Shopping Centre, John Vorster Dr, Centurion", latitude: -25.8765, longitude: 28.1985 },
  { key: "irene-farm", name: "Irene Farm", address: "1 Nellmapius Dr, Irene, Centurion", latitude: -25.8783, longitude: 28.2239 },
  { key: "irene-village-mall", name: "Irene Village Mall", address: "Cnr Nellmapius Dr & Van Ryneveld Ave, Irene, Centurion", latitude: -25.8615, longitude: 28.2505 },
  { key: "smuts-house", name: "Smuts House Museum", address: "53 Jan Smuts Ave, Irene, Centurion", latitude: -25.8890, longitude: 28.2330 },
  { key: "irene-river", name: "Irene River Estate grounds", address: "Jan Smuts Rd (before Smuts House), Irene, Centurion", latitude: -25.8878, longitude: 28.2304 },
  { key: "big-red-barn", name: "The Big Red Barn", address: "7 Nelson Rd, Olifantsfontein (Irene)", latitude: -25.9270, longitude: 28.2290 },
  { key: "centurion-mall", name: "Centurion Mall", address: "Heuwel Ave, Centurion Central", latitude: -25.8580, longitude: 28.1885 },
  { key: "centurion-lake", name: "Centurion Lake", address: "Lenchen Ave North, Centurion Central", latitude: -25.8555, longitude: 28.1905 },
  { key: "supersport-park", name: "SuperSport Park", address: "West Ave, Centurion", latitude: -25.8603, longitude: 28.1952 },
  { key: "rietvlei", name: "Rietvlei Nature Reserve", address: "Game Reserve Ave, Centurion", latitude: -25.8821, longitude: 28.2815 },
  { key: "lots-of-pots", name: "Kappie'ccino at Lots of Pots", address: "630 Ashwood Dr, Lyttelton AH, Centurion", latitude: -25.8420, longitude: 28.2140 },
];

const WEEKDAYS = [1, 2, 3, 4, 5];
const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];
const WEEKEND = [0, 6];

const TEMPLATES: DemoTemplate[] = [
  // Around campus
  { venue: "cappuccinos-southdowns", title: "Coffee Tasting & Latte Art", description: "Taste three single-origin brews and try your hand at latte art with the baristas. Bring a friend from class.", category: "FOOD", weekdays: WEEKDAYS, hour: 10, image: IMG.coffee },
  { venue: "cappuccinos-southdowns", title: "After-Class Quiz Night", description: "Teams of up to six, general knowledge plus a pop-culture round. Prizes for the top three tables.", category: "GAMES", weekdays: [2, 4], hour: 18, minute: 30, image: IMG.games },
  { venue: "open-window", title: "Lunchtime Sketch Walk", description: "A relaxed 45-minute sketch walk around campus and Southdowns. All levels welcome; bring a sketchbook.", category: "COMMUNITY", weekdays: [2, 3, 4], hour: 12, minute: 30, image: IMG.garden },
  { venue: "open-window", title: "Student Showcase Mixer", description: "See this year's student work, meet the makers and grab a snack. Open to friends and family.", category: "COMMUNITY", weekdays: [5], hour: 16, image: IMG.music },
  // Irene Farm
  { venue: "irene-farm", title: "Milkshake Tasting Flight", description: "Five farm-fresh milkshake flavours, each paired with a sweet treat, at the historic dairy farm.", category: "FOOD", weekdays: WEEKDAYS, hour: 11, image: IMG.milkshake },
  { venue: "irene-farm", title: "Meet the Herd: Farm Walk", description: "A guided walk past the dairy herd and petting zoo, finishing with fresh farm milk.", category: "FAMILY", weekdays: [3, 5, 6], hour: 9, minute: 30, image: IMG.family },
  { venue: "irene-farm", title: "Rooted Night Market", description: "Evening market under the oak trees: food trucks, local makers and live acoustic sets.", category: "FOOD", weekdays: [4], hour: 16, image: IMG.market },
  // Irene Village Mall
  { venue: "irene-village-mall", title: "Pilates on the Piazza", description: "An easy outdoor Pilates class on the piazza. Bring a mat and water; beginners welcome.", category: "SPORT", weekdays: [2, 4, 6], hour: 7, image: IMG.yoga },
  { venue: "irene-village-mall", title: "Sip & Paint Evening", description: "Paint a canvas step by step with a local artist. All materials included.", category: "COMMUNITY", weekdays: [3], hour: 18, image: IMG.garden },
  { venue: "irene-village-mall", title: "Movie Night in the Piazza", description: "A crowd-pleaser on the big outdoor screen. Bring a blanket; popcorn on sale.", category: "FAMILY", weekdays: [5, 6], hour: 18, minute: 30, image: IMG.theatre },
  // Smuts House & river
  { venue: "smuts-house", title: "Smuts Koppie Sunrise Hike", description: "A short guided hike up the koppie for sunrise views, then coffee in the tea garden.", category: "NATURE", weekdays: [3, 6], hour: 5, minute: 45, image: IMG.trail },
  { venue: "smuts-house", title: "Saturday Morning Market", description: "Crafts, plants, baked goods and coffee on the museum grounds.", category: "FOOD", weekdays: [6], hour: 9, image: IMG.market },
  { venue: "irene-river", title: "River Trail Fun Run/Walk", description: "2, 5 or 10 km along the river trail. Pet friendly; register from 06:30.", category: "SPORT", weekdays: [2, 6], hour: 7, image: IMG.run },
  // Big Red Barn
  { venue: "big-red-barn", title: "Golden-Hour MTB Ride", description: "A social mountain bike loop on the Big Red Barn trails. Helmets required.", category: "SPORT", weekdays: [2, 4], hour: 17, image: IMG.bike },
  { venue: "big-red-barn", title: "Irene Village Market", description: "Arts and crafts market in the forest with food trucks and family activities.", category: "COMMUNITY", weekdays: [6], hour: 9, image: IMG.market },
  // Centurion
  { venue: "centurion-lake", title: "Sunset Lake Walk & Jazz", description: "A gentle walk around Centurion Lake ending with live jazz at a lakeside spot.", category: "MUSIC", weekdays: [3, 5], hour: 17, minute: 30, image: IMG.jazz },
  { venue: "centurion-mall", title: "Board Game Café Meet-up", description: "Drop in for strategy and party games. Tables for newcomers and regulars.", category: "GAMES", weekdays: [1, 3, 5], hour: 18, image: IMG.games },
  { venue: "supersport-park", title: "Social Cricket Nets", description: "Casual nets session for all levels; bats and balls provided.", category: "SPORT", weekdays: [3, 6], hour: 16, image: IMG.cricket },
  { venue: "rietvlei", title: "Rietvlei Game Drive & Birding", description: "An early game drive in the reserve followed by birding at the dam hide.", category: "NATURE", weekdays: EVERY_DAY, hour: 6, minute: 30, image: IMG.nature },
  { venue: "lots-of-pots", title: "Plant Swap & Coffee", description: "Bring a cutting, take a cutting. Coffee and cake at Kappie'ccino.", category: "NATURE", weekdays: [4, 6], hour: 10, image: IMG.coffee },
  { venue: "centurion-mall", title: "Weekend Live Music Courtyard", description: "Local acoustic acts in the courtyard all afternoon. Free entry.", category: "MUSIC", weekdays: WEEKEND, hour: 14, image: IMG.music },
];

const VENUE_BY_KEY = new Map(DEMO_VENUES.map((venue) => [venue.key, venue]));

export function distanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) * Math.cos((b.latitude * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const ymd = (d: Date) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

export interface DemoHappeningDoc {
  id: string;
  data: Record<string, unknown>;
}

/** Builds (but doesn't write) the demo Happenings for an area and date range */
export function buildDemoHappenings(options: GenerateDemoOptions): DemoHappeningDoc[] {
  const start = new Date(options.startDate ?? new Date());
  start.setHours(0, 0, 0, 0);
  const days = Math.max(1, Math.min(31, Math.round(options.days)));
  const venuesInRange = new Set(
    DEMO_VENUES.filter((venue) => distanceKm(options.center, venue) <= options.radiusKm).map((venue) => venue.key)
  );
  const docs: DemoHappeningDoc[] = [];

  for (let offset = 0; offset < days; offset++) {
    const day = new Date(start);
    day.setDate(start.getDate() + offset);

    for (const template of TEMPLATES) {
      if (!venuesInRange.has(template.venue) || !template.weekdays.includes(day.getDay())) continue;
      const venue = VENUE_BY_KEY.get(template.venue);
      if (!venue) continue;

      const when = new Date(day);
      when.setHours(template.hour, template.minute ?? 0, 0, 0);

      docs.push({
        id: `demo-${ymd(day)}-${template.venue}-${slug(template.title)}`,
        data: {
          partner_id: options.partnerId ?? DEMO_PARTNER_ID,
          title: template.title,
          description: template.description,
          thumbnail_url: template.image,
          dateTime: Timestamp.fromDate(when),
          google_maps_link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address}`)}`,
          locationName: `${venue.name}, ${venue.address}`,
          coordinates: new GeoPoint(venue.latitude, venue.longitude),
          rsvps: [],
          attendees: [],
          category: template.category,
          demo: true,
        },
      });
    }
  }
  return docs;
}

/**
 * Writes the demo Happenings. Merges into existing docs and uses arrayUnion()
 * for rsvps/attendees, so re-running keeps any RSVPs and check-ins.
 */
export async function generateDemoHappenings(options: GenerateDemoOptions): Promise<number> {
  const docs = buildDemoHappenings(options);
  for (let i = 0; i < docs.length; i += 400) {
    const batch = writeBatch(db);
    docs.slice(i, i + 400).forEach(({ id, data }) => {
      batch.set(
        doc(db, "happenings", id),
        { ...data, rsvps: arrayUnion(), attendees: arrayUnion() },
        { merge: true }
      );
    });
    await batch.commit();
  }
  return docs.length;
}

/** Deletes every generated demo Happening */
export async function clearDemoHappenings(): Promise<number> {
  const snapshot = await getDocs(query(collection(db, "happenings"), where("demo", "==", true)));
  for (let i = 0; i < snapshot.docs.length; i += 400) {
    const batch = writeBatch(db);
    snapshot.docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  return snapshot.size;
}
