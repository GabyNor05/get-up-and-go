import React, { useState } from "react";
import { CalendarDays, CheckCircle2, LayoutDashboard, PlusCircle, QrCode, X } from "lucide-react";

import type { Partner, User } from "../../shared-firebase/types";
import Layout, { type NavSection } from "../../components/Layout";
import { usePartnerHappenings } from "../../hooks/usePartnerHappenings";
import PartnerOverview from "./PartnerOverview";
import PartnerHappenings from "./PartnerHappenings";
import CreateHappening from "./CreateHappening";
import VenueQr from "./VenueQr";

type PartnerView = "overview" | "happenings" | "create" | "qr";

interface PartnerDashboardProps {
  user: User;
  partner: Partner;
  onLogout: () => void;
}

const SECTIONS: NavSection<PartnerView>[] = [
  {
    label: "Venue",
    items: [
      { view: "overview", label: "Overview", Icon: LayoutDashboard },
      { view: "happenings", label: "My Happenings", Icon: CalendarDays },
      { view: "create", label: "Create Happening", Icon: PlusCircle },
      { view: "qr", label: "Venue QR", Icon: QrCode },
    ],
  },
];

const TITLES: Record<PartnerView, { title: string; subtitle: string }> = {
  overview: { title: "Overview", subtitle: "How your Happenings are doing in the Get Up & Go app" },
  happenings: { title: "My Happenings", subtitle: "Everything Goers can find at your venue" },
  create: { title: "Create Happening", subtitle: "It goes live in the app as soon as you publish" },
  qr: { title: "Venue QR", subtitle: "Print it, share it, put it at the door" },
};

export default function PartnerDashboard({ user, partner, onLogout }: PartnerDashboardProps) {
  const venueName = partner.venue_name || user.username;
  const [view, setView] = useState<PartnerView>("overview");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const { happenings, loading, error } = usePartnerHappenings(user.uid);

  const navigate = (next: PartnerView) => {
    setView(next);
    setNotice(null);
  };

  const createButton =
    view === "overview" || view === "happenings" ? (
      <button type="button" className="gng-btn gng-btn-primary" onClick={() => navigate("create")}>
        <PlusCircle size={18} aria-hidden="true" /> Create Happening
      </button>
    ) : null;

  return (
    <Layout
      view={view}
      sections={SECTIONS}
      onNavigate={navigate}
      portalLabel="Partner portal"
      title={TITLES[view].title}
      subtitle={TITLES[view].subtitle}
      accountName={venueName}
      accountRole="Venue partner"
      search={search}
      onSearch={view === "happenings" ? setSearch : undefined}
      searchPlaceholder="Search Happenings"
      actions={createButton}
      onLogout={onLogout}
    >
      {notice ? (
        <div className="gng-alert gng-alert-success" role="status" style={{ flexShrink: 0 }}>
          <CheckCircle2 size={18} aria-hidden="true" />
          <span style={{ flex: 1 }}>{notice}</span>
          <button type="button" className="gng-icon-btn" aria-label="Dismiss" onClick={() => setNotice(null)}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {view === "overview" && (
        <PartnerOverview
          partnerUid={user.uid}
          happenings={happenings}
          loading={loading}
          onOpenHappenings={() => navigate("happenings")}
          onOpenQr={() => navigate("qr")}
          onCreate={() => navigate("create")}
        />
      )}
      {view === "happenings" && (
        <PartnerHappenings
          happenings={happenings}
          loading={loading}
          error={error}
          search={search}
          onCreate={() => navigate("create")}
          onShowQr={() => navigate("qr")}
        />
      )}
      {view === "create" && (
        <CreateHappening
          user={user}
          partner={partner}
          venueName={venueName}
          onCancel={() => navigate("happenings")}
          onCreated={(title) => {
            setView("happenings");
            setNotice(`"${title}" is live. Goers can now find it in the app.`);
          }}
        />
      )}
      {view === "qr" && <VenueQr partnerUid={user.uid} venueName={venueName} />}
    </Layout>
  );
}
