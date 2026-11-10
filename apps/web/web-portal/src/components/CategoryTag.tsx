import React from "react";

import { categoryTagStyle, titleCase } from "../lib/format";

export default function CategoryTag({ category }: { category: string | undefined }) {
  const { background, dot } = categoryTagStyle(category);
  return (
    <span className="gng-cat" style={{ background }}>
      <i className="gng-dot" style={{ background: dot }} aria-hidden="true" />
      {titleCase(category ?? "COMMUNITY")}
    </span>
  );
}
