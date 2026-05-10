/**
 * Men's group stage completion + Super Six display labels.
 * Promotion overwrites placeholder rows' names in DB; until GS is complete we show fixed slot codes (A1, B2, …).
 */

/** Seed IDs for Super A/B placeholders — stable keys even after names are renamed */
export const MENS_SUPER6_SLOT_BY_TEAM_ID = Object.freeze({
  13: "A1",
  14: "B2",
  15: "C1",
  16: "A2",
  17: "B1",
  18: "C2",
});

export async function isMensGroupStageComplete(pool) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS cnt
     FROM matches m
     WHERE m.category = 'men' AND m.match_type = 'group_stage'
       AND (
         m.status <> 'finished'
         OR NOT EXISTS (SELECT 1 FROM results r WHERE r.match_id = m.id)
       )`
  );
  return Number(rows[0].cnt) === 0;
}

/**
 * @param {object} row — must include category, match_type, team_1_id, team_2_id, team_1_name, team_2_name
 */
export function applyMensSuperSixPlaceholderNames(row, menGsComplete) {
  if (menGsComplete) return row;
  if (String(row.category) !== "men" || String(row.match_type) !== "super6") return row;
  const l1 = MENS_SUPER6_SLOT_BY_TEAM_ID[row.team_1_id];
  const l2 = MENS_SUPER6_SLOT_BY_TEAM_ID[row.team_2_id];
  if (l1 == null && l2 == null) return row;
  return {
    ...row,
    team_1_name: l1 ?? row.team_1_name,
    team_2_name: l2 ?? row.team_2_name,
  };
}
