import React, { useMemo, useState } from "react";

import { formatDate } from "../../lib/format";
import { tsMillis, type GoerDoc, type UserDoc } from "../../lib/adminData";

interface AdminGoersProps {
  users: UserDoc[];
  goers: GoerDoc[];
  search: string;
}

type Sort = "gp" | "monthly" | "name" | "newest";

const LEVELS = [
  { level: 1, title: "Starter", target: 0 },
  { level: 2, title: "Explorer", target: 150 },
  { level: 3, title: "Regular", target: 400 },
  { level: 4, title: "Trailblazer", target: 800 },
  { level: 5, title: "Local Legend", target: 1500 },
];

function levelFor(gp: number) {
  return [...LEVELS].reverse().find((l) => gp >= l.target) ?? LEVELS[0];
}

export default function AdminGoers({ users, goers, search }: AdminGoersProps) {
  const [sort, setSort] = useState<Sort>("gp");

  const rows = useMemo(() => {
    const goerById = new Map(goers.map((g) => [g.uid ?? g.id, g]));
    const term = search.trim().toLowerCase();
    return users
      .filter((u) => u.role === "goer")
      .map((u) => {
        const goer = goerById.get(u.uid ?? u.id);
        return {
          user: u,
          goerId: goer?.goer_id ?? "—",
          total: goer?.total_gp ?? 0,
          monthly: goer?.monthly_gp ?? 0,
          circles: goer?.circles?.length ?? 0,
        };
      })
      .filter((row) => !term || `${row.user.username} ${row.user.email} ${row.goerId}`.toLowerCase().includes(term))
      .sort((a, b) => {
        if (sort === "name") return a.user.username.localeCompare(b.user.username);
        if (sort === "monthly") return b.monthly - a.monthly;
        if (sort === "newest") return tsMillis(b.user.createdAt) - tsMillis(a.user.createdAt);
        return b.total - a.total;
      });
  }, [users, goers, search, sort]);

  return (
    <div className="gng-page">
      <section className="gng-panel gng-panel-fill">
        <div className="gng-toolbar">
          <div className="gng-segment" role="group" aria-label="Sort by">
            {([
              ["gp", "Total GP"],
              ["monthly", "This month"],
              ["newest", "Newest"],
              ["name", "Name"],
            ] as [Sort, string][]).map(([value, label]) => (
              <button key={value} type="button" aria-pressed={sort === value} onClick={() => setSort(value)}>
                {label}
              </button>
            ))}
          </div>
          <span className="gng-muted">{rows.length} Goers</span>
        </div>
        <div className="gng-table-wrap gng-scroll">
          <table className="gng-table">
            <thead>
              <tr>
                <th>Goer</th>
                <th>User ID</th>
                <th>Level</th>
                <th className="gng-num">Total GP</th>
                <th className="gng-num">This month</th>
                <th className="gng-num">Circles</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="gng-muted" style={{ textAlign: "center", padding: 32 }}>
                    No Goers match.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const level = levelFor(row.total);
                  return (
                    <tr key={row.user.id}>
                      <td>
                        <div className="gng-cell-happening" style={{ minWidth: 220 }}>
                          <span className="gng-avatar-sm">{row.user.username.charAt(0).toUpperCase()}</span>
                          <div style={{ minWidth: 0 }}>
                            <div className="gng-row-title">{row.user.username}</div>
                            <div className="gng-row-sub">{row.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: 13 }}>{row.goerId}</td>
                      <td>
                        <span className="gng-pill gng-pill-brand">
                          L{level.level} · {level.title}
                        </span>
                      </td>
                      <td className="gng-num">{row.total.toLocaleString("en-ZA")}</td>
                      <td className="gng-num">{row.monthly.toLocaleString("en-ZA")}</td>
                      <td className="gng-num">{row.circles}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{formatDate(tsMillis(row.user.createdAt))}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
