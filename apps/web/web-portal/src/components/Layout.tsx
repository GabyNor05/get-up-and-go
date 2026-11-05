import React from "react";
import { CalendarDays, LayoutDashboard, LogOut, PlusCircle, QrCode, Search, Wand2, type LucideIcon } from "lucide-react";

export type View = "overview" | "happenings" | "create" | "qr" | "admin";

interface NavItem {
  view: View;
  label: string;
  Icon: LucideIcon;
}

const PARTNER_NAV: NavItem[] = [
  { view: "overview", label: "Overview", Icon: LayoutDashboard },
  { view: "happenings", label: "My Happenings", Icon: CalendarDays },
  { view: "create", label: "Create Happening", Icon: PlusCircle },
  { view: "qr", label: "Venue QR", Icon: QrCode },
];

const ADMIN_NAV: NavItem[] = [{ view: "admin", label: "Demo Happenings", Icon: Wand2 }];

interface LayoutProps {
  view: View;
  onNavigate: (view: View) => void;
  title: string;
  subtitle?: string;
  venueName: string;
  roleLabel: string;
  isAdmin: boolean;
  search?: string;
  onSearch?: (value: string) => void;
  actions?: React.ReactNode;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function Layout({
  view,
  onNavigate,
  title,
  subtitle,
  venueName,
  roleLabel,
  isAdmin,
  search,
  onSearch,
  actions,
  onLogout,
  children,
}: LayoutProps) {
  const renderNav = (items: NavItem[]) =>
    items.map(({ view: target, label, Icon }) => (
      <button
        key={target}
        type="button"
        className="gng-nav-item"
        aria-current={view === target ? "page" : undefined}
        onClick={() => onNavigate(target)}
      >
        <Icon size={20} aria-hidden="true" />
        <span>{label}</span>
      </button>
    ));

  return (
    <div className="gng-shell">
      <aside className="gng-sidebar">
        <div className="gng-brand">
          <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="" />
          <div>
            <div className="gng-brand-name">Get Up &amp; Go</div>
            <div className="gng-brand-sub">Partner portal</div>
          </div>
        </div>

        <div>
          <p className="gng-nav-label">Venue</p>
          <nav className="gng-nav" aria-label="Partner">
            {renderNav(PARTNER_NAV)}
          </nav>
        </div>

        {isAdmin ? (
          <div>
            <p className="gng-nav-label">Admin</p>
            <nav className="gng-nav" aria-label="Admin">
              {renderNav(ADMIN_NAV)}
            </nav>
          </div>
        ) : null}

        <div className="gng-sidebar-foot">
          <div className="gng-venue-card">
            <div className="gng-venue-avatar" aria-hidden="true">
              {venueName.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="gng-venue-name">{venueName}</div>
              <div className="gng-brand-sub">{roleLabel}</div>
            </div>
          </div>
          <button type="button" className="gng-nav-item" onClick={onLogout}>
            <LogOut size={20} aria-hidden="true" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <div className="gng-main">
        <header className="gng-topbar">
          <div style={{ minWidth: 0 }}>
            <h1>{title}</h1>
            {subtitle ? <p className="gng-topbar-sub">{subtitle}</p> : null}
          </div>
          <div className="gng-topbar-actions">
            {onSearch ? (
              <label className="gng-search">
                <Search size={18} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search Happenings"
                  value={search ?? ""}
                  onChange={(e) => onSearch(e.target.value)}
                  aria-label="Search Happenings"
                />
              </label>
            ) : null}
            {actions}
          </div>
        </header>
        <main className="gng-content">{children}</main>
      </div>
    </div>
  );
}
