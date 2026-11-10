/**
 * Writes shared-ui.css (CSS variables) from shared-theme.js.
 * Run from the repo root: node packages/shared-ui/scripts/build-css.js
 */
const fs = require('fs');
const path = require('path');
const theme = require('../shared-theme.js');

const toVars = (scheme) =>
  Object.entries(theme.semantic[scheme])
    .map(([key, value]) => `  ${theme.cssVar(key)}: ${value};`)
    .join('\n');

const categoryVars = Object.entries(theme.category)
  .map(([key, value]) => `  --gng-category-${key.toLowerCase()}: ${value};`)
  .join('\n');

const radiusVars = Object.entries(theme.radius)
  .map(([key, value]) => `  --gng-radius-${key}: ${value}px;`)
  .join('\n');

const css = `/* Generated from shared-theme.js. Edit the tokens there, then run:
   node packages/shared-ui/scripts/build-css.js */

:root {
${toVars('light')}
${categoryVars}
${radiusVars}
  --gng-font-display: "${theme.fonts.display}", "Arial Rounded MT Bold", sans-serif;
  --gng-font-body: ${theme.fonts.body}, sans-serif;
  --gng-shadow-card: 0 2px 8px rgba(36, 34, 27, 0.08);
  --gng-shadow-float: 0 8px 24px rgba(36, 34, 27, 0.16);
}

.dark,
[data-theme="dark"] {
${toVars('dark')}
}

.font-display {
  font-family: var(--gng-font-display);
}

.font-body {
  font-family: var(--gng-font-body);
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'shared-ui.css'), css);
console.log('Wrote shared-ui.css');
