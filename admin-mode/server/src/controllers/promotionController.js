import { getPool } from "../db.js";
import { emitToUsers } from "../utils/socket.js";

// ========================================
// AUTO-PROMOTION LOGIC
// Triggers when specific match milestones are reached
// ========================================

// After match 26 (last men's group stage match): Replace A1/A2/B1/B2/C1/C2 with group winners
export const promoteGroupToSuper6 = async () => {
  try {
    const pool = getPool();

    // Check that ALL men's group stage matches are finished
    const [unfinished] = await pool.query(
      "SELECT COUNT(*) as cnt FROM matches WHERE category='men' AND match_type='group_stage' AND status!='finished'"
    );
    if (unfinished[0].cnt > 0) {
      console.log(`[promoteGroupToSuper6] ${unfinished[0].cnt} group stage matches still pending, skipping promotion`);
      return false;
    }

    // Load groups for men's group stage
    const [groups] = await pool.query(
      "SELECT id, name FROM `groups` WHERE category = 'men' AND name LIKE 'Group %' ORDER BY id"
    );

    if (!groups || groups.length === 0) {
      throw new Error('No men groups found to promote from');
    }

    const groupIds = groups.map(g => g.id);

    // Load real teams (not placeholders)
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

    // Calculate standings
    const stats = {};
    teams.forEach(t => {
      stats[t.id] = { team_id: t.id, team_name: t.name, group_id: t.group_id, played:0, won:0, drawn:0, lost:0, goals_for:0, goals_against:0, goal_difference:0, penalty_points:0, points:0 };
    });

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

    Object.values(stats).forEach(s => { s.goal_difference = s.goals_for - s.goals_against; });

    // For each group, sort and pick top 2
    const promotions = {};
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

    // Load and update placeholder teams
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
      await pool.query('UPDATE teams SET name = ? WHERE id = ?', [realName, ph.id]);
    }

    console.log(`[promoteGroupToSuper6] Auto-promoted ${updates.length} teams to Super6`);
    emitToUsers('super6_promoted', { updated: updates.length, details: updates });
    return true;
  } catch (err) {
    console.error('[promoteGroupToSuper6] Error:', err);
    return false;
  }
};

// After match 44 (last men's super6 match): Set semi-final match rows from Super 6 standings
// MSF1 = Super A winner vs Super B runner-up | MSF2 = Super A runner-up vs Super B winner
// (Semis must NOT reuse Super 6 team IDs 13–18 — those only reflect pool placeholders renamed after group stage.)
export const promoteSuper6ToSemiFinals = async () => {
  try {
    const pool = getPool();

    const [unfinished] = await pool.query(
      "SELECT COUNT(*) as cnt FROM matches WHERE category='men' AND match_type='super6' AND status!='finished'"
    );
    if (unfinished[0].cnt > 0) {
      console.log(`[promoteSuper6ToSemiFinals] ${unfinished[0].cnt} super6 matches still pending, skipping promotion`);
      return false;
    }

    const [groups] = await pool.query(
      "SELECT id, name FROM `groups` WHERE category = 'men' AND name LIKE 'Super %' ORDER BY id"
    );

    if (!groups || groups.length < 2) {
      throw new Error("Need Super A and Super B groups for men's Super 6 promotion");
    }

    const groupIds = groups.map((g) => g.id);

    const [teams] = await pool.query(
      `SELECT t.id, t.name, t.group_id FROM teams t WHERE t.group_id IN (${groupIds.join(",")}) AND t.category = 'men'`
    );

    const [results] = await pool.query(
      `SELECT r.*, m.team_1_id, m.team_2_id FROM results r
       JOIN matches m ON r.match_id = m.id WHERE m.match_type = 'super6' AND m.category = 'men'`
    );

    const [cardPenalties] = await pool.query("SELECT card_type, penalty_points FROM card_penalties");
    const penalties = {};
    cardPenalties.forEach((p) => {
      penalties[p.card_type] = p.penalty_points;
    });

    const stats = {};
    teams.forEach((t) => {
      stats[t.id] = {
        team_id: t.id,
        team_name: t.name,
        group_id: t.group_id,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        penalty_points: 0,
        points: 0,
      };
    });

    results.forEach((r) => {
      const t1 = r.team_1_id;
      const t2 = r.team_2_id;
      if (stats[t1]) {
        stats[t1].played++;
        stats[t1].goals_for += r.team_1_score;
        stats[t1].goals_against += r.team_2_score;
        stats[t1].penalty_points +=
          (r.yellow_cards_team_1 || 0) * (penalties.yellow || 0) +
          (r.red_cards_team_1 || 0) * (penalties.red || 0) +
          (r.green_cards_team_1 || 0) * (penalties.green || 0);
        if (r.result === "team_1_win") {
          stats[t1].won++;
          stats[t1].points += 3;
        } else if (r.result === "draw") {
          stats[t1].drawn++;
          stats[t1].points += 1;
        } else if (r.result === "team_2_win") stats[t1].lost++;
      }
      if (stats[t2]) {
        stats[t2].played++;
        stats[t2].goals_for += r.team_2_score;
        stats[t2].goals_against += r.team_1_score;
        stats[t2].penalty_points +=
          (r.yellow_cards_team_2 || 0) * (penalties.yellow || 0) +
          (r.red_cards_team_2 || 0) * (penalties.red || 0) +
          (r.green_cards_team_2 || 0) * (penalties.green || 0);
        if (r.result === "team_2_win") {
          stats[t2].won++;
          stats[t2].points += 3;
        } else if (r.result === "draw") {
          stats[t2].drawn++;
          stats[t2].points += 1;
        } else if (r.result === "team_1_win") stats[t2].lost++;
      }
    });

    Object.values(stats).forEach((s) => {
      s.goal_difference = s.goals_for - s.goals_against;
    });

    const rankGroup = (groupId) => {
      const groupTeams = Object.values(stats).filter((s) => s.group_id === groupId);
      groupTeams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
        if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
        if (b.won !== a.won) return b.won - a.won;
        return b.penalty_points - a.penalty_points;
      });
      return groupTeams;
    };

    const superAId = groups[0].id;
    const superBId = groups[1].id;
    const rankedA = rankGroup(superAId);
    const rankedB = rankGroup(superBId);

    if (rankedA.length < 2 || rankedB.length < 2) {
      throw new Error("Super 6 standings incomplete — need at least 2 teams per Super pool");
    }

    const saWinner = rankedA[0].team_id;
    const saRunner = rankedA[1].team_id;
    const sbWinner = rankedB[0].team_id;
    const sbRunner = rankedB[1].team_id;

    await pool.query(
      "UPDATE matches SET team_1_id = ?, team_2_id = ? WHERE id = 47 AND category = ? AND match_type = ?",
      [saWinner, sbRunner, "men", "semi_final"]
    );
    await pool.query(
      "UPDATE matches SET team_1_id = ?, team_2_id = ? WHERE id = 48 AND category = ? AND match_type = ?",
      [saRunner, sbWinner, "men", "semi_final"]
    );

    console.log(
      `[promoteSuper6ToSemiFinals] Semi line-ups: 47 (${saWinner} vs ${sbRunner}), 48 (${saRunner} vs ${sbWinner})`
    );
    emitToUsers("semi_finals_promoted", {
      match47: [saWinner, sbRunner],
      match48: [saRunner, sbWinner],
    });
    return true;
  } catch (err) {
    console.error("[promoteSuper6ToSemiFinals] Error:", err);
    return false;
  }
};

// After ALL women's group-stage matches: set semi-finals from standings (women skip Super 6).
// WSF1 = Pool A winner vs Pool B runner-up | WSF2 = Pool B winner vs Pool A runner-up
export const promoteWomenGroupToSemiFinals = async () => {
  try {
    const pool = getPool();

    const [unfinished] = await pool.query(
      "SELECT COUNT(*) as cnt FROM matches WHERE category='women' AND match_type='group_stage' AND status!='finished'"
    );
    if (unfinished[0].cnt > 0) {
      console.log(
        `[promoteWomenGroupToSemiFinals] ${unfinished[0].cnt} women's group matches still pending, skipping promotion`
      );
      return false;
    }

    const [groups] = await pool.query(
      "SELECT id, name FROM `groups` WHERE category = 'women' AND name LIKE 'Group %' ORDER BY id"
    );

    if (!groups || groups.length < 2) {
      throw new Error("Need two women's groups for semi-final promotion");
    }

    const groupIds = groups.map((g) => g.id);

    const [teams] = await pool.query(
      `SELECT t.id, t.name, t.group_id
       FROM teams t
       WHERE t.group_id IN (${groupIds.join(",")}) AND t.category = 'women' AND COALESCE(t.is_placeholder, 0) = 0`
    );

    const [results] = await pool.query(
      `SELECT r.*, m.team_1_id, m.team_2_id
       FROM results r
       JOIN matches m ON r.match_id = m.id
       WHERE m.match_type = 'group_stage' AND m.category = 'women'`
    );

    const [cardPenalties] = await pool.query("SELECT card_type, penalty_points FROM card_penalties");
    const penalties = {};
    cardPenalties.forEach((p) => {
      penalties[p.card_type] = p.penalty_points;
    });

    const stats = {};
    teams.forEach((t) => {
      stats[t.id] = {
        team_id: t.id,
        team_name: t.name,
        group_id: t.group_id,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        penalty_points: 0,
        points: 0,
      };
    });

    results.forEach((r) => {
      const t1 = r.team_1_id;
      const t2 = r.team_2_id;
      if (stats[t1]) {
        stats[t1].played++;
        stats[t1].goals_for += r.team_1_score;
        stats[t1].goals_against += r.team_2_score;
        stats[t1].penalty_points +=
          (r.yellow_cards_team_1 || 0) * (penalties.yellow || 0) +
          (r.red_cards_team_1 || 0) * (penalties.red || 0) +
          (r.green_cards_team_1 || 0) * (penalties.green || 0);
        if (r.result === "team_1_win") {
          stats[t1].won++;
          stats[t1].points += 3;
        } else if (r.result === "draw") {
          stats[t1].drawn++;
          stats[t1].points += 1;
        } else if (r.result === "team_2_win") stats[t1].lost++;
      }
      if (stats[t2]) {
        stats[t2].played++;
        stats[t2].goals_for += r.team_2_score;
        stats[t2].goals_against += r.team_1_score;
        stats[t2].penalty_points +=
          (r.yellow_cards_team_2 || 0) * (penalties.yellow || 0) +
          (r.red_cards_team_2 || 0) * (penalties.red || 0) +
          (r.green_cards_team_2 || 0) * (penalties.green || 0);
        if (r.result === "team_2_win") {
          stats[t2].won++;
          stats[t2].points += 3;
        } else if (r.result === "draw") {
          stats[t2].drawn++;
          stats[t2].points += 1;
        } else if (r.result === "team_1_win") stats[t2].lost++;
      }
    });

    Object.values(stats).forEach((s) => {
      s.goal_difference = s.goals_for - s.goals_against;
    });

    const promotions = {};
    for (const g of groups) {
      const groupTeams = Object.values(stats).filter((s) => s.group_id === g.id);
      groupTeams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
        if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
        if (b.won !== a.won) return b.won - a.won;
        return b.penalty_points - a.penalty_points;
      });
      promotions[g.id] = groupTeams.slice(0, 2).map((t) => t.team_id);
    }

    const groupAId = groups[0].id;
    const groupBId = groups[1].id;
    const topA = promotions[groupAId];
    const topB = promotions[groupBId];

    if (!topA || topA.length < 2 || !topB || topB.length < 2) {
      throw new Error("Women's standings incomplete — need top two teams per group");
    }

    const winnerA = topA[0];
    const runnerA = topA[1];
    const winnerB = topB[0];
    const runnerB = topB[1];

    await pool.query(
      "UPDATE matches SET team_1_id = ?, team_2_id = ? WHERE id = 45 AND category = 'women' AND match_type = 'semi_final'",
      [winnerA, runnerB]
    );
    await pool.query(
      "UPDATE matches SET team_1_id = ?, team_2_id = ? WHERE id = 46 AND category = 'women' AND match_type = 'semi_final'",
      [winnerB, runnerA]
    );

    console.log(
      `[promoteWomenGroupToSemiFinals] Semis set — 45: ${winnerA} vs ${runnerB}, 46: ${winnerB} vs ${runnerA}`
    );
    emitToUsers("women_semi_finals_ready", {
      match45: [winnerA, runnerB],
      match46: [winnerB, runnerA],
    });
    return true;
  } catch (err) {
    console.error("[promoteWomenGroupToSemiFinals] Error:", err);
    return false;
  }
};

// After women's semi-finals (match 46): Update final and 3rd place with winners/losers
export const promoteWomenSemiToFinals = async () => {
  try {
    const pool = getPool();

    // Check that ALL women's semi-final matches are finished
    const [unfinished] = await pool.query(
      "SELECT COUNT(*) as cnt FROM matches WHERE category='women' AND match_type='semi_final' AND status!='finished'"
    );
    if (unfinished[0].cnt > 0) {
      console.log(`[promoteWomenSemiToFinals] ${unfinished[0].cnt} semi-finals still pending, skipping promotion`);
      return false;
    }

    // Get semi-final results
    const [semiResults] = await pool.query(
      `SELECT m.id, m.team_1_id, m.team_2_id, r.result
       FROM matches m
       LEFT JOIN results r ON m.id = r.match_id
       WHERE m.match_type = 'semi_final' AND m.category = 'women'
       ORDER BY m.id`
    );

    if (!semiResults || semiResults.length < 2) {
      throw new Error('Not enough women semi-final results');
    }

    const semi1 = semiResults[0]; // Match 45
    const semi2 = semiResults[1]; // Match 46

    // Determine winners and losers
    const winner1 = semi1.result === 'team_1_win' ? semi1.team_1_id : semi1.team_2_id;
    const loser1 = semi1.result === 'team_1_win' ? semi1.team_2_id : semi1.team_1_id;
    const winner2 = semi2.result === 'team_1_win' ? semi2.team_1_id : semi2.team_2_id;
    const loser2 = semi2.result === 'team_1_win' ? semi2.team_2_id : semi2.team_1_id;

    // Update final and 3rd place matches
    const updates = [];
    await pool.query('UPDATE matches SET team_1_id = ?, team_2_id = ? WHERE id = 49 AND category = ? AND match_type = ?', [loser1, loser2, 'women', '3rd_place']);
    updates.push({ match: 49, type: '3rd_place', team_1: loser1, team_2: loser2 });

    await pool.query('UPDATE matches SET team_1_id = ?, team_2_id = ? WHERE id = 51 AND category = ? AND match_type = ?', [winner1, winner2, 'women', 'final']);
    updates.push({ match: 51, type: 'final', team_1: winner1, team_2: winner2 });

    console.log(`[promoteWomenSemiToFinals] Updated ${updates.length} matches with women semi-final winners/losers`);
    emitToUsers('women_finals_ready', { updated: updates.length, details: updates });
    return true;
  } catch (err) {
    console.error('[promoteWomenSemiToFinals] Error:', err);
    return false;
  }
};

// After men's semi-finals (match 48): Update final and 3rd place with winners/losers
export const promoteMenSemiToFinals = async () => {
  try {
    const pool = getPool();

    // Check that ALL men's semi-final matches are finished
    const [unfinished] = await pool.query(
      "SELECT COUNT(*) as cnt FROM matches WHERE category='men' AND match_type='semi_final' AND status!='finished'"
    );
    if (unfinished[0].cnt > 0) {
      console.log(`[promoteMenSemiToFinals] ${unfinished[0].cnt} semi-finals still pending, skipping promotion`);
      return false;
    }

    // Get semi-final results
    const [semiResults] = await pool.query(
      `SELECT m.id, m.team_1_id, m.team_2_id, r.result
       FROM matches m
       LEFT JOIN results r ON m.id = r.match_id
       WHERE m.match_type = 'semi_final' AND m.category = 'men'
       ORDER BY m.id`
    );

    if (!semiResults || semiResults.length < 2) {
      throw new Error('Not enough men semi-final results');
    }

    const semi1 = semiResults[0]; // Match 47
    const semi2 = semiResults[1]; // Match 48

    // Determine winners and losers
    const winner1 = semi1.result === 'team_1_win' ? semi1.team_1_id : semi1.team_2_id;
    const loser1 = semi1.result === 'team_1_win' ? semi1.team_2_id : semi1.team_1_id;
    const winner2 = semi2.result === 'team_1_win' ? semi2.team_1_id : semi2.team_2_id;
    const loser2 = semi2.result === 'team_1_win' ? semi2.team_2_id : semi2.team_1_id;

    // Update final and 3rd place matches
    const updates = [];
    await pool.query('UPDATE matches SET team_1_id = ?, team_2_id = ? WHERE id = 50 AND category = ? AND match_type = ?', [loser1, loser2, 'men', '3rd_place']);
    updates.push({ match: 50, type: '3rd_place', team_1: loser1, team_2: loser2 });

    await pool.query('UPDATE matches SET team_1_id = ?, team_2_id = ? WHERE id = 52 AND category = ? AND match_type = ?', [winner1, winner2, 'men', 'final']);
    updates.push({ match: 52, type: 'final', team_1: winner1, team_2: winner2 });

    console.log(`[promoteMenSemiToFinals] Updated ${updates.length} matches with men semi-final winners/losers`);
    emitToUsers('men_finals_ready', { updated: updates.length, details: updates });
    return true;
  } catch (err) {
    console.error('[promoteMenSemiToFinals] Error:', err);
    return false;
  }
};

// Auto-promotion after a match is marked finished (each promotion checks prerequisites internally)
export const triggerAutoPromotion = async (finishedMatchId) => {
  const pool = getPool();
  const [rows] = await pool.query(
    "SELECT category, match_type FROM matches WHERE id = ?",
    [finishedMatchId]
  );
  const m = rows[0];
  if (!m) return;

  if (m.category === "men" && m.match_type === "group_stage") {
    await promoteGroupToSuper6();
  }
  if (m.category === "women" && m.match_type === "group_stage") {
    await promoteWomenGroupToSemiFinals();
  }
  if (m.category === "men" && m.match_type === "super6") {
    await promoteSuper6ToSemiFinals();
  }
  if (m.category === "women" && m.match_type === "semi_final") {
    await promoteWomenSemiToFinals();
  }
  if (m.category === "men" && m.match_type === "semi_final") {
    await promoteMenSemiToFinals();
  }
};
