import React, { useState } from "react";
import { CheckCircle2, PlusCircle, X } from "lucide-react";

import type { Partner, User } from "../shared-firebase/types";
import { auth } from "../shared-firebase/config/firebase";
import Layout, { type View } from "../components/Layout";
import { usePartnerHappenings } from "../hooks/usePartnerHappenings";
import { ADMIN_EMAILS } from "../lib/format";
import OverviewPage from "./OverviewPage";
import HappeningsPage from "./HappeningsPage";
import CreateHappeningPage from "./CreateHappeningPage";
import VenueQrPage from "./VenueQrPage";
import AdminPage from "./AdminPage";

interface DashboardPageProps {
  user: User;
  partner: Partner;
  onLogout: () => void;
}

const TITLES: Record<View, { title: string; subtitle: string }> = {
  overview: { title: "Overview", subtitle: "How your Happenings are doing in the Get Up & Go app" },
  happenings: { title: "My Happenings", subtitle: "Everything Goers can find at your venue" },
  create: { title: "Create Happening", subtitle: "It goes live in the app as soon as you publish" },
  qr: { title: "Venue QR", subtitle: "Goers scan these to check in and earn Go-Points" },
  admin: { title: "Demo Happenings", subtitle: "Admin tool: fill an area with realistic Happenings for showcases" },
};

export default function DashboardPage({ user, partner, onLogout }: DashboardPageProps) {
  const venueName = partner.venue_name || user.username;
  const email = (auth.currentUser?.email ?? user.email ?? "").toLowerCase();
  const isAdmin = user.role === "admin" || ADMIN_EMAILS.includes(email);

  const [view, setView] = useState<View>("overview");
  const [search, setSearch] = useState("");
  const [selectedQrId, setSelectedQrId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const { happenings, loading, error } = usePartnerHappenings(user.uid);

  const navigate = (next: View) => {
    setView(next);
    setNotice(null);
  };

  const { title, subtitle } = TITLES[view];
  const createButton =
    view !== "create" && view !== "admin" ? (
      <button type="button" className="gng-btn gng-btn-primary" onClick={() => navigate("create")}>
        <PlusCircle size={18} aria-hidden="true" /> Create Happening
      </button>
    ) : null;

  return (
    <Layout
      view={view}
      onNavigate={navigate}
      title={title}
      subtitle={subtitle}
      venueName={venueName}
      roleLabel={isAdmin ? "Partner · Admin" : "Partner"}
      isAdmin={isAdmin}
      search={search}
      onSearch={view === "happenings" ? setSearch : undefined}
      actions={createButton}
      onLogout={onLogout}
    >
      {notice ? (
        <div className="gng-alert gng-alert-success" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span style={{ flex: 1 }}>{notice}</span>
          <button type="button" className="gng-icon-btn" aria-label="Dismiss" onClick={() => setNotice(null)}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {view === "overview" && (
        <OverviewPage
          happenings={happenings}
          loading={loading}
          onOpenHappenings={() => navigate("happenings")}
          onCreate={() => navigate("create")}
        />
      )}
      {view === "happenings" && (
        <HappeningsPage
          happenings={happenings}
          loading={loading}
          error={error}
          search={search}
          onCreate={() => navigate("create")}
          onShowQr={(id) => {
            setSelectedQrId(id);
            navigate("qr");
          }}
        />
      )}
      {view === "create" && (
        <CreateHappeningPage
          user={user}
          partner={partner}
          venueName={venueName}
          onCancel={() => navigate("happenings")}
          onCreated={(createdTitle) => {
            setView("happenings");
            setNotice(`"${createdTitle}" is live. Goers can now find it in the app.`);
          }}
        />
      )}
      {view === "qr" && (
        <VenueQrPage
          partnerUid={user.uid}
          venueName={venueName}
          happenings={happenings}
          selectedId={selectedQrId}
          onSelect={setSelectedQrId}
        />
      )}
      {view === "admin" && isAdmin && <AdminPage />}
    </Layout>
  );
}
