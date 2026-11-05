import { arrayUnion, doc, setDoc, Timestamp, writeBatch } from 'firebase/firestore';

import { db } from '../../../packages/firebase/src/config/firebase';
import type { CircleFeedItem } from '../../../packages/firebase/src/types/circleFeed';
import type { Level } from '../../../packages/firebase/src/types/level';
import { injectPretoriaHappenings } from './seedHappenings';

/**
 * Demo content for testing and for poster screenshots.
 * Every document uses a fixed id, so running it again refreshes the data
 * instead of duplicating it. Demo Goers are Firestore docs only (no logins).
 */

export interface SeedResult {
  happenings: number;
  levels: number;
  goers: number;
  circles: number;
  feedItems: number;
}

export const LEVELS: Level[] = [
  { level: 1, title: 'Starter', gp_target: 0 },
  { level: 2, title: 'Explorer', gp_target: 150 },
  { level: 3, title: 'Regular', gp_target: 400 },
  { level: 4, title: 'Trailblazer', gp_target: 800 },
  { level: 5, title: 'Local Legend', gp_target: 1500 },
];

const DEMO_GOERS = [
  { uid: 'demo-goer-lea', username: 'LeaMillar', goer_id: 'LEAM-14-QZ', total_gp: 1240, monthly_gp: 420 },
  { uid: 'demo-goer-desi', username: 'DesiP', goer_id: 'DESI-22-KP', total_gp: 980, monthly_gp: 365 },
  { uid: 'demo-goer-thabo', username: 'ThaboM', goer_id: 'THAB-07-RW', total_gp: 760, monthly_gp: 310 },
  { uid: 'demo-goer-aisha', username: 'AishaK', goer_id: 'AISH-31-LN', total_gp: 540, monthly_gp: 205 },
  { uid: 'demo-goer-jono', username: 'JonoV', goer_id: 'JONO-18-BT', total_gp: 420, monthly_gp: 150 },
  { uid: 'demo-goer-naledi', username: 'NalediS', goer_id: 'NALE-05-CY', total_gp: 300, monthly_gp: 95 },
];

const DEMO_CIRCLES = [
  {
    id: 'demo-circle-girlies',
    title: 'The Girlies',
    emoji: '🌸',
    accent: '#A88AED',
    card_bg: { light: '#ECE4FC', dark: '#352C53' },
    tags: ['Hiking', 'Markets'],
    join_code: 'GRLZ-4TQ',
    members: ['demo-goer-lea', 'demo-goer-desi', 'demo-goer-aisha', 'demo-goer-naledi'],
  },
  {
    id: 'demo-circle-trail',
    title: 'Trail Crew',
    emoji: '🥾',
    accent: '#A6C261',
    card_bg: { light: '#E9F2D3', dark: '#36421B' },
    tags: ['Running', 'Nature'],
    join_code: 'TRAI-8KD',
    members: ['demo-goer-thabo', 'demo-goer-jono', 'demo-goer-lea'],
  },
  {
    id: 'demo-circle-jazz',
    title: 'Jazz & Jol',
    emoji: '🎷',
    accent: '#E8A84C',
    card_bg: { light: '#FDF0DA', dark: '#3D2E14' },
    tags: ['Music', 'Food'],
    join_code: 'JAZZ-2MX',
    members: ['demo-goer-desi', 'demo-goer-thabo', 'demo-goer-naledi', 'demo-goer-jono'],
  },
];

// Happening ids come from scripts/seedHappenings.ts
const DEMO_FEED: Omit<CircleFeedItem, 'created_at'>[] = [
  { circle_id: 'demo-circle-girlies', goer_uid: 'demo-goer-lea', username: 'LeaMillar', type: 'rsvp', happening_id: 'evt-usr-001', happening_title: 'Garden Social & Artisan Market' },
  { circle_id: 'demo-circle-girlies', goer_uid: 'demo-goer-desi', username: 'DesiP', type: 'check_in', happening_id: 'evt-usr-002', happening_title: 'Wild Café Acoustic Afternoon' },
  { circle_id: 'demo-circle-girlies', goer_uid: 'demo-goer-aisha', username: 'AishaK', type: 'me_too', happening_id: 'evt-usr-001', happening_title: 'Garden Social & Artisan Market' },
  { circle_id: 'demo-circle-trail', goer_uid: 'demo-goer-thabo', username: 'ThaboM', type: 'rsvp', happening_id: 'evt-usr-003', happening_title: 'Trail Run & Outdoor Fitness' },
  { circle_id: 'demo-circle-trail', goer_uid: 'demo-goer-jono', username: 'JonoV', type: 'check_in', happening_id: 'evt-usr-003', happening_title: 'Trail Run & Outdoor Fitness' },
  { circle_id: 'demo-circle-jazz', goer_uid: 'demo-goer-desi', username: 'DesiP', type: 'rsvp', happening_id: 'evt-usr-004', happening_title: 'Live Theatre & Musical Tribute' },
  { circle_id: 'demo-circle-jazz', goer_uid: 'demo-goer-naledi', username: 'NalediS', type: 'joined' },
];

/**
 * Seeds Happenings, levels, demo Goers, three Circles (with the signed-in
 * Goer as a member) and some Circle activity.
 */
export async function seedDemoData(currentUid: string | null): Promise<SeedResult> {
  const happenings = await injectPretoriaHappenings();

  const batch = writeBatch(db);
  const now = Date.now();

  LEVELS.forEach((level) => {
    batch.set(doc(db, 'levels', `level-${level.level}`), level);
  });

  DEMO_GOERS.forEach((goer) => {
    batch.set(doc(db, 'users', goer.uid), {
      uid: goer.uid,
      username: goer.username,
      email: `${goer.username.toLowerCase()}@demo.getupandgo.app`,
      role: 'goer',
      createdAt: Timestamp.now(),
    });
    batch.set(
      doc(db, 'goers', goer.uid),
      {
        uid: goer.uid,
        goer_id: goer.goer_id,
        avatarPublicId: '',
        circles: DEMO_CIRCLES.filter((c) => c.members.includes(goer.uid)).map((c) => c.id),
        ping_mes: [],
        total_gp: goer.total_gp,
        monthly_gp: goer.monthly_gp,
      },
      { merge: true },
    );
  });

  DEMO_CIRCLES.forEach(({ id, members, ...circle }) => {
    const goerIds = currentUid ? [currentUid, ...members] : members;
    batch.set(doc(db, 'circles', id), {
      ...circle,
      goer_ids: goerIds,
      max_size: 20,
      everybody_sends_invites: true,
      created_by: currentUid ?? members[0],
      created_at: Timestamp.fromMillis(now - 1000 * 60 * 60 * 24 * 14),
    });
  });

  DEMO_FEED.forEach((item, index) => {
    batch.set(doc(db, 'circle_feed', `demo-feed-${index + 1}`), {
      ...item,
      created_at: Timestamp.fromMillis(now - 1000 * 60 * (25 * (index + 1))),
    });
  });

  await batch.commit();

  if (currentUid) {
    await setDoc(
      doc(db, 'goers', currentUid),
      { circles: arrayUnion(...DEMO_CIRCLES.map((c) => c.id)) },
      { merge: true },
    );
  }

  return {
    happenings,
    levels: LEVELS.length,
    goers: DEMO_GOERS.length,
    circles: DEMO_CIRCLES.length,
    feedItems: DEMO_FEED.length,
  };
}
