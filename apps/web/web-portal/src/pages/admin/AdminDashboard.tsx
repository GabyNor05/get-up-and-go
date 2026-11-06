import React, { useMemo, useState } from "react";
import { Building2, CalendarDays, LayoutDashboard, LifeBuoy, Users, UsersRound, Wand2 } from "lucide-react";

import type { User } from "../../shared-firebase/types";
import Layout, { type NavSection } from "../../components/Layout";
import { useLiveCollection } from "../../hooks/useLiveCollection";
import type { CircleDoc, GoerDoc, HappeningDoc, PartnerDoc, SupportTicket, UserDoc } from "../../lib/adminData";
import AdminOverview from "./AdminOverview";
import AdminPartners from "./AdminPartners";
import AdminHappenings from "./AdminHappenings";
import AdminGoers from "./AdminGoers";
import AdminCircles from "./AdminCircles";
import AdminSupport from "./AdminSupport";
import AdminDemo from "./AdminDemo";

type AdminView = "overview" | "partners" | "happenings" | "goers" | "circles" | "support" | "demo";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const TITLES: Record<AdminView, { title: string; subtitle: string; search?: string }> = {
  overview: { title: "Admin overview", subtitle: "Everything happening on Get Up & Go" },
  partners: { title: "Partners", subtitle: "Venues publishing Happenings", search: "Search venues or emails" },
  happenings: { title: "Happenings", subtitle: "Every Happening in the app", search: "Search Happenings" },
  goers: { title: "Goers", subtitle: "People using the app", search: "Search Goers" },
  circles: { title: "Circles", subtitle: "Groups getting out together", search: "Search Circles" },
  support: { title: "Support tickets", subtitle: "Messages from Goers and partners", search: "Search tickets" },
  demo: { title: "Demo Happenings", subtitle: "Fill an area with realistic Happenings for showcases" },
};

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [view, setView] = useState<AdminView>("overview");
  const [search, setSearch] = useState("");

  const users = useLiveCollection<UserDoc>("users");
  const partners = useLiveCollection<PartnerDoc>("partners");
  const goers = useLiveCollection<GoerDoc>("goers");
  const happenings = useLiveCollection<HappeningDoc>("happenings");
  const circles = useLiveCollection<CircleDoc>("circles");
  const tickets = useLiveCollection<SupportTicket>("support_tickets");

  const venueNames = useMemo(() => {
    const names = new Map<string, string>();
    users.items.filter((u) => u.role === "partner").forEach((u) => names.set(u.uid ?? u.id, u.username));
    partners.items.forEach((p) => {
      if (p.venue_name) names.set(p.uid ?? p.id, p.venue_name);
    });
    return names;
  }, [users.items, partners.items]);

  const openTickets = tickets.items.filter((t) => t.status !== "resolved").length;

  const sections: NavSection<AdminView>[] = [
    { label: "Admin", items: [{ view: "overview", label: "Overview", Icon: LayoutDashboard }] },
    {
      label: "Manage",
      items: [
        { view: "partners", label: "Partners", Icon: Building2 },
        { view: "happenings", label: "Happenings", Icon: CalendarDays },
        { view: "goers", label: "Goers", Icon: Users },
        { view: "circles", label: "Circles", Icon: UsersRound },
        { view: "support", label: "Support tickets", Icon: LifeBuoy, badge: openTickets },
      ],
    },
    { label: "Tools", items: [{ view: "demo", label: "Demo Happenings", Icon: Wand2 }] },
  ];

  const navigate = (next: AdminView) => {
    setView(next);
    setSearch("");
  };

  const loadError = [users, partners, goers, happenings, circles].find((c) => c.error)?.error;
  const meta = TITLES[view];

  return (
    <Layout
      view={view}
      sections={sections}
      onNavigate={navigate}
      portalLabel="Admin portal"
      title={meta.title}
      subtitle={meta.subtitle}
      accountName={user.username || "Admin"}
      accountRole="Get Up & Go admin"
      search={search}
      onSearch={meta.search ? setSearch : undefined}
      searchPlaceholder={meta.search}
      onLogout={onLogout}
    >
      {loadError ? (
        <div className="gng-alert gng-alert-danger" role="alert" style={{ flexShrink: 0 }}>
          {loadError}
        </div>
      ) : null}

      {view === "overview" && (
        <AdminOverview
          users={users.items}
          happenings={happenings.items}
          circles={circles.items}
          tickets={tickets.items}
          venueNames={venueNames}
          onOpen={navigate}
        />
      )}
      {view === "partners" && (
        <AdminPartners users={users.items} partners={partners.items} happenings={happenings.items} search={search} />
      )}
      {view === "happenings" && <AdminHappenings happenings={happenings.items} venueNames={venueNames} search={search} />}
      {view === "goers" && <AdminGoers users={users.items} goers={goers.items} search={search} />}
      {view === "circles" && <AdminCircles circles={circles.items} users={users.items} search={search} />}
      {view === "support" && <AdminSupport tickets={tickets.items} loading={tickets.loading} search={search} />}
      {view === "demo" && <AdminDemo />}
    </Layout>
  );
}
