export interface CircleMember {
  id: number;
  initial: string;
  name: string;
  email: string;
  userId: string;
  km: number;
  level: number;
  circles: number;
  color: string;
  rank?: number;
}

export interface CircleFeedItem {
  actor: string;
  action: string;
  meToo?: boolean;
}

export interface CircleItem {
  name: string;
  members: number;
  avatars: string[];
  goal: string | null;
  goalPct: number;
  tags: string[];
  lastActive: string;
  cardBg: { light: string; dark: string };
  accent: string;
  emoji: string;
  size: "featured" | "wide" | "compact";
  blurb: string;
  live?: boolean;
  memberProfiles: CircleMember[];
  feed: CircleFeedItem[];
}

export const avatarColors = [
  "#A88AED",
  "#A6C261",
  "#E8A84C",
  "#6CB8E8",
  "#E87D6C",
  "#B8A0E8",
  "#7DC98A",
];

export const circles: CircleItem[] = [
  {
    name: "The Girlies",
    members: 4,
    avatars: ["D", "L", "S", "M"],
    goal: "10 km from Moonlith",
    goalPct: 68,
    tags: ["Hiking", "Outdoors"],
    lastActive: "Today",
    cardBg: { light: "#EDE8FF", dark: "#2A2340" },
    accent: "#A88AED",
    emoji: "🌸",
    size: "featured",
    blurb:
      "Weekend plans, shared playlists, and a soft launch for the next trail day.",
    live: true,
    memberProfiles: [
      {
        id: 1,
        initial: "D",
        name: "Diana",
        email: "diana@getupandgo.app",
        userId: "@diana",
        km: 94,
        level: 8,
        circles: 5,
        color: "#A88AED",
        rank: 2,
      },
      {
        id: 2,
        initial: "L",
        name: "Lina",
        email: "lina@getupandgo.app",
        userId: "@lina",
        km: 112,
        level: 9,
        circles: 6,
        color: "#6CB8E8",
        rank: 1,
      },
      {
        id: 3,
        initial: "S",
        name: "Sia",
        email: "sia@getupandgo.app",
        userId: "@sia",
        km: 77,
        level: 7,
        circles: 4,
        color: "#A6C261",
        rank: 3,
      },
      {
        id: 4,
        initial: "M",
        name: "Mia",
        email: "mia@getupandgo.app",
        userId: "@mia",
        km: 66,
        level: 6,
        circles: 3,
        color: "#E87D6C",
        rank: 4,
      },
    ],
    feed: [
      {
        actor: "Lina",
        action: "posted a sunrise trail checkpoint",
        meToo: true,
      },
      { actor: "Diana", action: "shared the weekend playlist" },
      { actor: "Mia", action: "joined the next meetup poll" },
    ],
  },
  {
    name: "Brooklyn 99",
    members: 7,
    avatars: ["A", "B", "C", "D", "E", "F", "G"],
    goal: "10 km to first place",
    goalPct: 82,
    tags: ["Running", "Competitive"],
    lastActive: "2h ago",
    cardBg: { light: "#E8F5D8", dark: "#1E2A18" },
    accent: "#A6C261",
    emoji: "⚡",
    size: "compact",
    blurb:
      "A fast-paced training circle with a leaderboard and weekly check-ins.",
    memberProfiles: [
      {
        id: 5,
        initial: "A",
        name: "Ava",
        email: "ava@getupandgo.app",
        userId: "@ava",
        km: 128,
        level: 10,
        circles: 7,
        color: "#A6C261",
        rank: 1,
      },
      {
        id: 6,
        initial: "B",
        name: "Ben",
        email: "ben@getupandgo.app",
        userId: "@ben",
        km: 116,
        level: 9,
        circles: 6,
        color: "#A88AED",
        rank: 2,
      },
      {
        id: 7,
        initial: "C",
        name: "Cleo",
        email: "cleo@getupandgo.app",
        userId: "@cleo",
        km: 103,
        level: 8,
        circles: 5,
        color: "#6CB8E8",
        rank: 3,
      },
    ],
    feed: [
      { actor: "Ava", action: "completed the 7 km sprint challenge" },
      { actor: "Ben", action: "set a new personal best" },
    ],
  },
  {
    name: "Da Fam",
    members: 3,
    avatars: ["X", "Y", "Z"],
    goal: null,
    goalPct: 0,
    tags: ["Casual", "Family"],
    lastActive: "Yesterday",
    cardBg: { light: "#FFF3E0", dark: "#2A2018" },
    accent: "#E8A84C",
    emoji: "🏡",
    size: "compact",
    blurb: "Low-pressure meetups for brunches, errands, and sunset walks.",
    memberProfiles: [
      {
        id: 8,
        initial: "X",
        name: "Xena",
        email: "xena@getupandgo.app",
        userId: "@xena",
        km: 48,
        level: 5,
        circles: 4,
        color: "#E8A84C",
        rank: 2,
      },
      {
        id: 9,
        initial: "Y",
        name: "Yara",
        email: "yara@getupandgo.app",
        userId: "@yara",
        km: 40,
        level: 4,
        circles: 3,
        color: "#B8A0E8",
        rank: 1,
      },
      {
        id: 10,
        initial: "Z",
        name: "Zoe",
        email: "zoe@getupandgo.app",
        userId: "@zoe",
        km: 32,
        level: 4,
        circles: 2,
        color: "#6CB8E8",
        rank: 3,
      },
    ],
    feed: [
      { actor: "Yara", action: "planned a Sunday market walk" },
      { actor: "Zoe", action: "shared a family brunch idea" },
    ],
  },
  {
    name: "Yoga Squad",
    members: 5,
    avatars: ["P", "Q", "R", "S", "T"],
    goal: "30 sessions this month",
    goalPct: 47,
    tags: ["Wellness", "Morning"],
    lastActive: "1d ago",
    cardBg: { light: "#E8F4FF", dark: "#182030" },
    accent: "#6CB8E8",
    emoji: "🧘",
    size: "wide",
    blurb:
      "A calm crew for early classes, breathwork, and gentle accountability.",
    memberProfiles: [
      {
        id: 11,
        initial: "P",
        name: "Priya",
        email: "priya@getupandgo.app",
        userId: "@priya",
        km: 85,
        level: 7,
        circles: 5,
        color: "#6CB8E8",
        rank: 2,
      },
      {
        id: 12,
        initial: "Q",
        name: "Quinn",
        email: "quinn@getupandgo.app",
        userId: "@quinn",
        km: 91,
        level: 8,
        circles: 6,
        color: "#A88AED",
        rank: 1,
      },
      {
        id: 13,
        initial: "R",
        name: "Rae",
        email: "rae@getupandgo.app",
        userId: "@rae",
        km: 63,
        level: 6,
        circles: 4,
        color: "#A6C261",
        rank: 3,
      },
    ],
    feed: [
      { actor: "Quinn", action: "posted the sunrise mobility checklist" },
      { actor: "Priya", action: "shared the breathing routine" },
    ],
  },
  {
    name: "Park Crew",
    members: 6,
    avatars: ["J", "K", "L", "M", "N", "O"],
    goal: "4 meetups this week",
    goalPct: 75,
    tags: ["Social", "Outdoors"],
    lastActive: "3h ago",
    cardBg: { light: "#FBEFE7", dark: "#251B16" },
    accent: "#E87D6C",
    emoji: "🌳",
    size: "compact",
    blurb: "Picnics, park loops, and spontaneous coffee runs after work.",
    memberProfiles: [
      {
        id: 14,
        initial: "J",
        name: "Jules",
        email: "jules@getupandgo.app",
        userId: "@jules",
        km: 74,
        level: 6,
        circles: 4,
        color: "#E87D6C",
        rank: 1,
      },
      {
        id: 15,
        initial: "K",
        name: "Kai",
        email: "kai@getupandgo.app",
        userId: "@kai",
        km: 61,
        level: 5,
        circles: 3,
        color: "#A88AED",
        rank: 2,
      },
      {
        id: 16,
        initial: "L",
        name: "Luca",
        email: "luca@getupandgo.app",
        userId: "@luca",
        km: 53,
        level: 5,
        circles: 3,
        color: "#6CB8E8",
        rank: 3,
      },
    ],
    feed: [
      { actor: "Jules", action: "opened a new park meetup slot" },
      { actor: "Kai", action: "shared the café suggestion" },
    ],
  },
  {
    name: "Night Owls",
    members: 8,
    avatars: ["R", "S", "T", "U", "V", "W", "X", "Y"],
    goal: "2 sunset runs",
    goalPct: 58,
    tags: ["Evening", "Running"],
    lastActive: "5h ago",
    cardBg: { light: "#F2ECFF", dark: "#221B2F" },
    accent: "#B8A0E8",
    emoji: "🌙",
    size: "compact",
    blurb:
      "Late-night energy for runners who want a little more spark after dinner.",
    memberProfiles: [
      {
        id: 17,
        initial: "R",
        name: "Rory",
        email: "rory@getupandgo.app",
        userId: "@rory",
        km: 97,
        level: 8,
        circles: 5,
        color: "#B8A0E8",
        rank: 1,
      },
      {
        id: 18,
        initial: "S",
        name: "Sage",
        email: "sage@getupandgo.app",
        userId: "@sage",
        km: 84,
        level: 7,
        circles: 4,
        color: "#A88AED",
        rank: 2,
      },
      {
        id: 19,
        initial: "T",
        name: "Tara",
        email: "tara@getupandgo.app",
        userId: "@tara",
        km: 71,
        level: 6,
        circles: 3,
        color: "#6CB8E8",
        rank: 3,
      },
    ],
    feed: [
      { actor: "Rory", action: "posted a dusk route suggestion" },
      { actor: "Sage", action: "checked in from the river path" },
    ],
  },
];
