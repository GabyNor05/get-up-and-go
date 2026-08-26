export interface CircleMember {
  name: string;
  email: string;
  km: number;
  level: number;
  circles: number;
  userId: string;
  gpScore: number; // used to rank the leaderboard podium
}

export interface Circle {
  id: number;
  circleId: string; // shareable join code
  name: string;
  emoji: string;
  accent: string;
  cardBg: { light: string; dark: string };
  tags: string[];
  lastActive: string;
  goal: string | null;
  goalPct: number;
  gpsCaption: string; // "20 gps from Alex584" style caption shown on the list
  members: CircleMember[]; // does NOT include "You" — the current user is implicit
}

export const CIRCLES: Circle[] = [
  {
    id: 1,
    circleId: "GRLZ-04-TG",
    name: "The Girlies",
    emoji: "🌸",
    accent: "#A88AED",
    cardBg: { light: "#EDE8FF", dark: "#2A2340" },
    tags: ["Hiking", "Outdoors"],
    lastActive: "Today",
    goal: "10 km from Moonlith",
    goalPct: 68,
    gpsCaption: "20 gps from Alex584",
    members: [
      { name: "LeaMillar", email: "LeaM867@yabber.co.za", km: 62, level: 21, circles: 3, userId: "LEAM-14-QZ", gpScore: 980 },
      { name: "DesiP", email: "desi05.p@gmail.com", km: 50, level: 14, circles: 5, userId: "ZDUX-08-DP", gpScore: 860 },
      { name: "sueDoe", email: "sueDoe@yahoo.com", km: 38, level: 9, circles: 2, userId: "SUED-22-OE", gpScore: 640 },
    ],
  },
  {
    id: 2,
    circleId: "BKLN-99-RN",
    name: "Brooklyn 99",
    emoji: "⚡",
    accent: "#A6C261",
    cardBg: { light: "#E8F5D8", dark: "#1E2A18" },
    tags: ["Running", "Competitive"],
    lastActive: "2h ago",
    goal: "10 km to FIRST PLACE",
    goalPct: 82,
    gpsCaption: "10 gps to FIRST PLACE",
    members: [
      { name: "Amy", email: "amy.s@nine-nine.co.za", km: 88, level: 27, circles: 4, userId: "AMYS-01-NN", gpScore: 1240 },
      { name: "Jake", email: "jake.p@nine-nine.co.za", km: 74, level: 24, circles: 3, userId: "JAKP-02-NN", gpScore: 1105 },
      { name: "Terry", email: "terry.j@nine-nine.co.za", km: 65, level: 22, circles: 2, userId: "TERJ-03-NN", gpScore: 990 },
      { name: "Rosa", email: "rosa.d@nine-nine.co.za", km: 59, level: 20, circles: 3, userId: "ROSD-04-NN", gpScore: 940 },
      { name: "Charles", email: "charles.b@nine-nine.co.za", km: 41, level: 15, circles: 2, userId: "CHAB-05-NN", gpScore: 760 },
      { name: "Gina", email: "gina.l@nine-nine.co.za", km: 33, level: 12, circles: 1, userId: "GINL-06-NN", gpScore: 610 },
    ],
  },
  {
    id: 3,
    circleId: "DAFM-03-HM",
    name: "Da Fam",
    emoji: "🏡",
    accent: "#E8A84C",
    cardBg: { light: "#FFF3E0", dark: "#2A2018" },
    tags: ["Casual", "Family"],
    lastActive: "Yesterday",
    goal: null,
    goalPct: 0,
    gpsCaption: "",
    members: [
      { name: "Mom", email: "mom.fam@mail.com", km: 12, level: 5, circles: 1, userId: "MOMF-01-DF", gpScore: 220 },
      { name: "Dad", email: "dad.fam@mail.com", km: 18, level: 6, circles: 1, userId: "DADF-02-DF", gpScore: 260 },
    ],
  },
  {
    id: 4,
    circleId: "YOGA-05-SQ",
    name: "Yoga Squad",
    emoji: "🧘",
    accent: "#6CB8E8",
    cardBg: { light: "#E8F4FF", dark: "#182030" },
    tags: ["Wellness", "Morning"],
    lastActive: "1d ago",
    goal: "30 sessions this month",
    goalPct: 47,
    gpsCaption: "14 sessions logged",
    members: [
      { name: "Priya", email: "priya.n@mail.com", km: 20, level: 11, circles: 2, userId: "PRIN-01-YS", gpScore: 540 },
      { name: "Quin", email: "quin.a@mail.com", km: 15, level: 9, circles: 2, userId: "QUIA-02-YS", gpScore: 480 },
      { name: "Rae", email: "rae.t@mail.com", km: 22, level: 12, circles: 3, userId: "RAET-03-YS", gpScore: 560 },
      { name: "Sam", email: "sam.k@mail.com", km: 9, level: 6, circles: 1, userId: "SAMK-04-YS", gpScore: 310 },
    ],
  },
  {
    id: 5,
    circleId: "TRLB-06-HK",
    name: "Trail Blazers",
    emoji: "⛰️",
    accent: "#E87D6C",
    cardBg: { light: "#FFE8E4", dark: "#2A1E1B" },
    tags: ["Hiking", "Weekend"],
    lastActive: "3h ago",
    goal: "25 km this week",
    goalPct: 91,
    gpsCaption: "2 gps to weekly goal",
    members: [
      { name: "Noah", email: "noah.b@mail.com", km: 71, level: 19, circles: 3, userId: "NOAB-01-TB", gpScore: 880 },
      { name: "Ella", email: "ella.v@mail.com", km: 66, level: 18, circles: 2, userId: "ELLV-02-TB", gpScore: 830 },
      { name: "Kabelo", email: "kabelo.m@mail.com", km: 55, level: 16, circles: 4, userId: "KABM-03-TB", gpScore: 720 },
    ],
  },
  {
    id: 6,
    circleId: "BOOK-07-CL",
    name: "Book Club",
    emoji: "📚",
    accent: "#B8A0E8",
    cardBg: { light: "#F1EBFF", dark: "#241E30" },
    tags: ["Reading", "Cozy"],
    lastActive: "5d ago",
    goal: null,
    goalPct: 0,
    gpsCaption: "",
    members: [
      { name: "Zanele", email: "zanele.k@mail.com", km: 4, level: 3, circles: 1, userId: "ZANK-01-BC", gpScore: 140 },
      { name: "Tumi", email: "tumi.r@mail.com", km: 6, level: 4, circles: 2, userId: "TUMR-02-BC", gpScore: 180 },
    ],
  },
  {
    id: 7,
    circleId: "SOCR-08-5A",
    name: "5-a-side Crew",
    emoji: "⚽",
    accent: "#7DC98A",
    cardBg: { light: "#E4F7E8", dark: "#182A1D" },
    tags: ["Sport", "Weekly"],
    lastActive: "6h ago",
    goal: "8 matches this season",
    goalPct: 62,
    gpsCaption: "3 gps behind top scorer",
    members: [
      { name: "Ben", email: "ben.o@mail.com", km: 40, level: 13, circles: 2, userId: "BENO-01-5A", gpScore: 600 },
      { name: "Farai", email: "farai.c@mail.com", km: 44, level: 14, circles: 2, userId: "FARC-02-5A", gpScore: 640 },
      { name: "Liam", email: "liam.s@mail.com", km: 29, level: 10, circles: 1, userId: "LIAS-03-5A", gpScore: 470 },
      { name: "Kyle", email: "kyle.d@mail.com", km: 33, level: 11, circles: 2, userId: "KYLD-04-5A", gpScore: 500 },
    ],
  },
  {
    id: 8,
    circleId: "SUNR-09-BK",
    name: "Sunrise Riders",
    emoji: "🚴",
    accent: "#E8C24C",
    cardBg: { light: "#FFF7E0", dark: "#2A2618" },
    tags: ["Cycling", "Early Bird"],
    lastActive: "12h ago",
    goal: "120 km this month",
    goalPct: 54,
    gpsCaption: "6 gps ahead of pace",
    members: [
      { name: "Wandile", email: "wandile.n@mail.com", km: 95, level: 25, circles: 3, userId: "WANN-01-SR", gpScore: 1080 },
      { name: "Chloe", email: "chloe.f@mail.com", km: 80, level: 21, circles: 2, userId: "CHOF-02-SR", gpScore: 940 },
      { name: "Pieter", email: "pieter.v@mail.com", km: 68, level: 19, circles: 2, userId: "PIEV-03-SR", gpScore: 850 },
    ],
  },
];
