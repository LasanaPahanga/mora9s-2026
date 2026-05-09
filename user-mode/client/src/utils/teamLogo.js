/**
 * Public-site logo filename under /assets/uni_logo/
 * Handles legacy DB spelling "SLIT" → sliit.png (file was renamed from slit.png).
 */
const LOGO_MAP = {
  "Mora A": "mora.png",
  "Mora B": "mora.png",
  Sabra: "sabra.png",
  Pera: "pera.png",
  Wayamba: "wayamba.png",
  Rajarata: "rajarata.png",
  Ruhuna: "ruhuna.png",
  Kelani: "kelani.png",
  Japura: "japura.png",
  SLIIT: "sliit.png",
  SLIT: "sliit.png",
  Colombo: "pera.png",
};

/** Strip squad suffix " A" / " B" so "SLIIT A" resolves like "SLIIT". */
function baseUniversityName(teamName) {
  return String(teamName).trim().replace(/\s+[A-Z]$/, "").trim();
}

export function resolveTeamLogoFile(teamName) {
  if (!teamName) return "mora.png";
  const key = baseUniversityName(teamName);
  if (LOGO_MAP[key]) return LOGO_MAP[key];

  const slug = key.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (slug === "slit") return "sliit.png";

  return `${slug}.png`;
}
