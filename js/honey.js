// Honey the bear, redrawn for this build: a tan bear peeking out of a pastel candy jar.
// honeySVG(mood) returns an SVG string. Moods follow the sugar scale:
//   peek (nothing logged) · happy (under 50%) · content (50–99%) · ohmy (at or over the limit)

const C = {
  fur: "#efcfac",
  furDark: "#e3b98f",
  innerEar: "#f7a8bf",
  muzzle: "#fbe8d4",
  nose: "#6b3e2e",
  eye: "#3b2420",
  blush: "#ff9fb8",
  mouth: "#b5475f",
  tongue: "#ff9fb0",
};

const CANDY = ["#ff7fa8", "#8fd8c4", "#ffd98e", "#c9b3f2", "#ff7fa8", "#ffb08a"];

export const MOODS = ["peek", "happy", "content", "ohmy"];

function eyes(mood) {
  const line = (d) => `<path d="${d}" stroke="${C.eye}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`;
  const dot = (x, y, r, hx, hy, hr) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.eye}"/><circle cx="${hx}" cy="${hy}" r="${hr}" fill="#fff"/>`;
  switch (mood) {
    case "happy":
      return line("M38 60 Q44 51 50 60") + line("M70 60 Q76 51 82 60");
    case "ohmy":
      return (
        dot(44, 57, 7.2, 46.5, 54.5, 2.6) +
        dot(76, 57, 7.2, 78.5, 54.5, 2.6) +
        `<path d="M36 45 Q43 41 50 44" stroke="${C.nose}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
        `<path d="M70 44 Q77 41 84 45" stroke="${C.nose}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
      );
    case "peek":
      return dot(47, 55, 5.2, 48.6, 53.4, 1.7) + dot(79, 55, 5.2, 80.6, 53.4, 1.7);
    default:
      return dot(44, 58, 5.2, 45.6, 56.4, 1.7) + dot(76, 58, 5.2, 77.6, 56.4, 1.7);
  }
}

function mouth(mood) {
  switch (mood) {
    case "happy":
      return `<path d="M51 80 Q60 93 69 80 Z" fill="${C.mouth}"/><path d="M55 85 Q60 89 65 85 Q60 83 55 85Z" fill="${C.tongue}"/>`;
    case "ohmy":
      return `<ellipse cx="60" cy="84" rx="4.2" ry="5.4" fill="${C.mouth}"/>`;
    case "peek":
      return `<path d="M56 81 Q60 84.5 64 81" stroke="${C.nose}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    default:
      return `<path d="M53 80 Q60 87 67 80" stroke="${C.nose}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`;
  }
}

function head(mood) {
  const blushWidth = mood === "ohmy" ? 9 : 7;
  return (
    `<g class="honey-ears">` +
    `<circle cx="28" cy="31" r="15" fill="${C.furDark}"/><circle cx="28" cy="31" r="8" fill="${C.innerEar}"/>` +
    `<circle cx="92" cy="31" r="15" fill="${C.furDark}"/><circle cx="92" cy="31" r="8" fill="${C.innerEar}"/>` +
    `</g>` +
    `<circle cx="60" cy="62" r="40" fill="${C.fur}"/>` +
    `<ellipse cx="60" cy="77" rx="16.5" ry="12.5" fill="${C.muzzle}"/>` +
    `<ellipse cx="60" cy="71" rx="5.4" ry="4" fill="${C.nose}"/>` +
    eyes(mood) +
    mouth(mood) +
    `<ellipse cx="31" cy="73" rx="${blushWidth}" ry="4.6" fill="${C.blush}" opacity=".85"/>` +
    `<ellipse cx="89" cy="73" rx="${blushWidth}" ry="4.6" fill="${C.blush}" opacity=".85"/>`
  );
}

function jar() {
  const candies = [
    [36, 102, 6], [50, 107, 5.5], [64, 101, 6], [79, 107, 5.5], [88, 96, 4.5], [45, 93, 4],
  ]
    .map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${CANDY[i]}"/>`)
    .join("");
  return (
    `<rect x="20" y="80" width="80" height="37" rx="12" fill="#ffe3ee" stroke="#f4b3cb" stroke-width="2"/>` +
    candies +
    `<path d="M28 86 Q26 98 30 110" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>` +
    `<rect x="15" y="71" width="90" height="11" rx="5.5" fill="#ffc4da"/>` +
    `<g class="honey-paw honey-paw--left"><ellipse cx="42" cy="72" rx="9" ry="6.5" fill="${C.fur}" stroke="${C.furDark}" stroke-width="1.5"/></g>` +
    `<g class="honey-paw honey-paw--right"><ellipse cx="78" cy="72" rx="9" ry="6.5" fill="${C.fur}" stroke="${C.furDark}" stroke-width="1.5"/></g>`
  );
}

const LABELS = {
  peek: "Honey the bear peeking out of her candy jar",
  happy: "Honey the bear smiling in her candy jar",
  content: "Honey the bear looking content in her candy jar",
  ohmy: "Honey the bear saying oh my from her candy jar",
};

// jar: true draws the full candy jar; false draws just her head (for small spots like the header).
// label: pass a string for an image with alt text; leave it out when Honey is decorative.
export function honeySVG(mood = "happy", { jar: withJar = true, label } = {}) {
  if (!MOODS.includes(mood)) mood = "happy";
  const a11y = label
    ? `role="img" aria-label="${label === true ? LABELS[mood] : label}"`
    : `aria-hidden="true" focusable="false"`;
  if (!withJar) {
    return `<svg class="honey honey--${mood}" viewBox="8 12 104 94" xmlns="http://www.w3.org/2000/svg" ${a11y}>${head(mood)}</svg>`;
  }
  return (
    `<svg class="honey honey--${mood}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" ${a11y}>` +
    `<g class="honey-head"><g transform="translate(60 44) scale(0.78) translate(-60 -62)">${head(mood)}</g></g>` +
    jar() +
    `</svg>`
  );
}
