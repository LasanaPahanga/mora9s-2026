import { getPool } from "../db.js";
import { emitToUsers } from "../utils/socket.js";

// Promote top teams from each group into Super6 placeholders (A1,A2,B1,B2,C1,C2)
// Only runs when ALL group stage matches for men are finished
export const generateSuper6 = async (req, res) => {
  try {
    const pool = getPool();

    // Check that ALL men's group stage matches are finished
    const [unfinished] = await pool.query(
      "SELECT COUNT(*) as cnt FROM matches WHERE category='men' AND match_type='group_stage' AND status!='finished'"
    );
    if (unfinished[0].cnt > 0) {
      return res.status(400).json({ error: `Cannot promote yet: ${unfinished[0].cnt} group stage matches still scheduled or in progress. All must be finished.` });
    }

    // Load groups for men's group stage
    const [groups] = await pool.query(
      "SELECT id, name FROM `groups` WHERE category = 'men' AND name LIKE 'Group %' ORDER BY id"
    );

    if (!groups || groups.length === 0) {
      return res.status(400).json({ error: 'No men groups found to promote from' });
    }

    // Load teams in those groups
    const groupIds = groups.map(g => g.id);

    const [teams] = await pool.query(
      `SELECT t.id, t.name, t.group_id
       FROM teams t
       WHERE t.group_id IN (${groupIds.join(',')}) AND t.category = 'men' AND t.is_placeholder = 0`
    );

    // Load results for group stage matches
    const [results] = await pool.query(
      `SELECT r.*, m.team_1_id, m.team_2_id
       FROM results r
       JOIN matches m ON r.match_id = m.id
       WHERE m.match_type = 'group_stage' AND m.category = 'men'`
    );

    // Load card penalties
    const [cardPenalties] = await pool.query("SELECT card_type, penalty_points FROM card_penalties");
    const penalties = {};
    cardPenalties.forEach(p => { penalties[p.card_type] = p.penalty_points; });

    // Initialize stats per team
    const stats = {};
    teams.forEach(t => {
      stats[t.id] = { team_id: t.id, team_name: t.name, group_id: t.group_id, played:0, won:0, drawn:0, lost:0, goals_for:0, goals_against:0, goal_difference:0, penalty_points:0, points:0 };
    });

    // Process results
    results.forEach(r => {
      const t1 = r.team_1_id; const t2 = r.team_2_id;
      if (stats[t1]) {
        stats[t1].played++;
        stats[t1].goals_for += r.team_1_score;
        stats[t1].goals_against += r.team_2_score;
        stats[t1].penalty_points += (r.yellow_cards_team_1||0)*(penalties.yellow||0) + (r.red_cards_team_1||0)*(penalties.red||0) + (r.green_cards_team_1||0)*(penalties.green||0);
        if (r.result === 'team_1_win') { stats[t1].won++; stats[t1].points += 3; }
        else if (r.result === 'draw') { stats[t1].drawn++; stats[t1].points += 1; }
        else if (r.result === 'team_2_win') { stats[t1].lost++; }
      }
      if (stats[t2]) {
        stats[t2].played++;
        stats[t2].goals_for += r.team_2_score;
        stats[t2].goals_against += r.team_1_score;
        stats[t2].penalty_points += (r.yellow_cards_team_2||0)*(penalties.yellow||0) + (r.red_cards_team_2||0)*(penalties.red||0) + (r.green_cards_team_2||0)*(penalties.green||0);
        if (r.result === 'team_2_win') { stats[t2].won++; stats[t2].points += 3; }
        else if (r.result === 'draw') { stats[t2].drawn++; stats[t2].points += 1; }
        else if (r.result === 'team_1_win') { stats[t2].lost++; }
      }
    });

    // compute goal_difference
    Object.values(stats).forEach(s => { s.goal_difference = s.goals_for - s.goals_against; });

    // For each group, sort and pick top 2
    const promotions = {}; // groupId -> [top1Id, top2Id]
    for (const g of groups) {
      const groupTeams = Object.values(stats).filter(s => s.group_id === g.id);
      groupTeams.sort((a,b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
        if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
        if (b.won !== a.won) return b.won - a.won;
        return b.penalty_points - a.penalty_points;
      });
      promotions[g.id] = groupTeams.slice(0,2).map(t => t.team_id);
    }

    // Load placeholder teams to update
    const [placeholders] = await pool.query(
      "SELECT id, name FROM teams WHERE is_placeholder = 1 AND category = 'men' AND name IN ('A1','A2','B1','B2','C1','C2')"
    );

    const groupOrder = groups;
    const updates = [];
    const map = { A: groupOrder[0].id, B: groupOrder[1].id, C: groupOrder[2].id };

    for (const ph of placeholders) {
      const p = ph.name;
      const letter = p.charAt(0);
      const pos = Number(p.charAt(1));
      const sourceGroupId = map[letter];
      const promoted = promotions[sourceGroupId];
      if (!promoted || promoted.length < pos) continue;
      const realTeamId = promoted[pos-1];
      const [realRows] = await pool.query('SELECT name FROM teams WHERE id = ? AND is_placeholder=0', [realTeamId]);
      const realName = realRows[0]?.name || `Team ${realTeamId}`;
      updates.push({ placeholderId: ph.id, placeholderName: p, newName: realName, realTeamId });
    }

    // Apply updates to placeholder team rows
    for (const u of updates) {
      await pool.query('UPDATE teams SET name = ? WHERE id = ?', [u.newName, u.placeholderId]);
    }

    emitToUsers('super6_promoted', { updated: updates.length, details: updates });

    res.json({ message: 'Group stage promotions complete', promoted: updates.length, details: updates });
  } catch (err) {
    console.error('Error generating Super6 promotions', err);
    res.status(500).json({ error: 'Failed to generate Super6 promotions' });
  }
};

export default { generateSuper6 };
