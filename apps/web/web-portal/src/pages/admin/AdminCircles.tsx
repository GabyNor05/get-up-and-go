import React, { useMemo, useState } from "react";
import { arrayRemove, deleteDoc, doc, setDoc } from "firebase/firestore";
import { Trash2 } from "lucide-react";

import { db } from "../../shared-firebase/config/firebase";
import { formatDate } from "../../lib/format";
import { tsMillis, type CircleDoc, type UserDoc } from "../../lib/adminData";

interface AdminCirclesProps {
  circles: CircleDoc[];
  users: UserDoc[];
  search: string;
}

export default function AdminCircles({ circles, users, search }: AdminCirclesProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const names = useMemo(() => new Map(users.map((u) => [u.uid ?? u.id, u.username])), [users]);
  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return circles
      .filter((c) => !term || `${c.title} ${c.join_code ?? ""} ${(c.tags ?? []).join(" ")}`.toLowerCase().includes(term))
      .sort((a, b) => (b.goer_ids?.length ?? 0) - (a.goer_ids?.length ?? 0));
  }, [circles, search]);

  const removeCircle = async (circle: CircleDoc) => {
    setError(null);
    try {
      // Take the Circle off every member's profile, then delete it
      await Promise.all(
        (circle.goer_ids ?? []).map((uid) =>
          setDoc(doc(db, "goers", uid), { circles: arrayRemove(circle.id) }, { merge: true })
        )
      );
      await deleteDoc(doc(db, "circles", circle.id));
    } catch (err) {
      console.error("Delete Circle error:", err);
      setError(`Couldn't delete "${circle.title}".`);
    } finally {
      setConfirmId(null);
    }
  };

  return (
    <div className="gng-page">
      <section className="gng-panel gng-panel-fill">
        <div className="gng-toolbar">
          <span className="gng-muted">Sorted by size</span>
          <span className="gng-muted">{rows.length} Circles</span>
        </div>
        {error ? <div className="gng-alert gng-alert-danger" role="alert" style={{ marginBottom: 12 }}>{error}</div> : null}
        <div className="gng-table-wrap gng-scroll">
          <table className="gng-table">
            <thead>
              <tr>
                <th>Circle</th>
                <th>Join code</th>
                <th>Members</th>
                <th>Admin</th>
                <th>Tags</th>
                <th>Created</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="gng-muted" style={{ textAlign: "center", padding: 32 }}>
                    No Circles yet.
                  </td>
                </tr>
              ) : (
                rows.map((c) => {
                  const members = c.goer_ids?.length ?? 0;
                  const max = c.max_size ?? 20;
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="gng-cell-happening" style={{ minWidth: 200 }}>
                          <span className="gng-avatar-sm" style={{ background: `${c.accent ?? "#A88AED"}33`, fontSize: 16 }}>
                            {c.emoji}
                          </span>
                          <div className="gng-row-title">{c.title}</div>
                        </div>
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: 13 }}>{c.join_code ?? "—"}</td>
                      <td style={{ minWidth: 140 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="gng-cat-track" style={{ flex: 1 }}>
                            <div className="gng-cat-fill" style={{ width: `${Math.min(100, (members / max) * 100)}%`, background: "var(--gng-action-primary)" }} />
                          </div>
                          <span className="gng-row-sub" style={{ whiteSpace: "nowrap" }}>
                            {members}/{max}
                          </span>
                        </div>
                      </td>
                      <td>{names.get(c.created_by) ?? <span className="gng-muted">Unknown</span>}</td>
                      <td>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {(c.tags ?? []).slice(0, 3).map((tag) => (
                            <span key={tag} className="gng-pill gng-pill-muted">{tag}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>{formatDate(tsMillis(c.created_at))}</td>
                      <td>
                        {confirmId === c.id ? (
                          <div className="gng-actions" style={{ flexWrap: "nowrap" }}>
                            <button type="button" className="gng-btn gng-btn-ghost gng-btn-small" onClick={() => setConfirmId(null)}>
                              Cancel
                            </button>
                            <button type="button" className="gng-btn gng-btn-danger gng-btn-small" onClick={() => removeCircle(c)}>
                              Delete
                            </button>
                          </div>
                        ) : (
                          <button type="button" className="gng-icon-btn gng-icon-btn-danger" title="Delete Circle" aria-label={`Delete ${c.title}`} onClick={() => setConfirmId(c.id)}>
                            <Trash2 size={18} aria-hidden="true" />
                          </button>
                        )}
                      </td>
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
