/** Sentinel value for "show everything" in admin list filters */
export const FILTER_ALL = "all";

export function normalizeCategory(cat) {
  return String(cat ?? "")
    .toLowerCase()
    .trim();
}

export function normalizeMatchType(mt) {
  return String(mt ?? "")
    .toLowerCase()
    .trim()
    .replace(/-/g, "_");
}

export function rowMatchesCategory(rowCategory, filter) {
  if (filter === FILTER_ALL) return true;
  return normalizeCategory(rowCategory) === filter;
}

export function rowMatchesMatchType(rowMatchType, filter) {
  if (filter === FILTER_ALL) return true;
  return normalizeMatchType(rowMatchType) === filter;
}
