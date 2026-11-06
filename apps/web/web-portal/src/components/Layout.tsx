import React from "react";
import { LogOut, Search, type LucideIcon } from "lucide-react";

export interface NavItem<V extends string> {
  view: V;
  label: string;
  Icon: LucideIcon;
  badge?: number;
}

export interface NavSection<V extends string> {
  label: string;
  items: NavItem<V>[];
}

interface LayoutProps<V extends string> {
  view: V;
  sections: NavSection<V>[];
  onNavigate: (view: V) => void;
  portalLabel: string;
  title: string;
  subtitle?: string;
  accountName: string;
  accountRole: string;
  search?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  onLogout: () => void;
  children: React.ReactNode;
}

/** Fixed-height dashboard shell: sidebar + top bar; only inner panels scroll */
export default function Layout<V extends string>({
  view,
  sections,
  onNavigate,
  portalLabel,
  title,
  subtitle,
  accountName,
  accountRole,
  search,
  onSearch,
  searchPlaceholder = "Search",
  actions,
  onLogout,
  children,
}: LayoutProps<V>) {
  return (
    <div className="gng-shell">
      <aside className="gng-sidebar">
        <div className="gng-brand">
          <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="" />
          <div>
            <div className="gng-brand-name">Get Up &amp; Go</div>
            <div className="gng-brand-sub">{portalLabel}</div>
          </div>
        </div>

        {sections.map((section) => (
          <div key={section.label}>
            <p className="gng-nav-label">{section.label}</p>
            <nav className="gng-nav" aria-label={section.label}>
              {section.items.map(({ view: target, label, Icon, badge }) => (
                <button
                  key={target}
                  type="button"
                  className="gng-nav-item"
                  aria-current={view === target ? "page" : undefined}
                  onClick={() => onNavigate(target)}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span style={{ flex: 1 }}>{label}</span>
                  {badge ? <span className="gng-badge">{badge}</span> : null}
                </button>
              ))}
            </nav>
          </div>
        ))}

        <div className="gng-sidebar-foot">
          <div className="gng-venue-card">
            <div className="gng-venue-avatar" aria-hidden="true">
              {accountName.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="gng-venue-name">{accountName}</div>
              <div className="gng-brand-sub">{accountRole}</div>
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
                  placeholder={searchPlaceholder}
                  value={search ?? ""}
                  onChange={(e) => onSearch(e.target.value)}
                  aria-label={searchPlaceholder}
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
