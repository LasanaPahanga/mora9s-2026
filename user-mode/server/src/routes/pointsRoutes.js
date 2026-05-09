import express from "express";
import { getPool } from "../db.js";

const router = express.Router();

// GET /api/points - Auto-calculated points table
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    
    // Omit knockout bracket placeholders (SA1, "Men Final — pending", etc.) — they have no group
    // and must not appear as a fake "No Group" standings bucket. Super 6 placeholders stay (they have group_id).
    const [teams] = await pool.query(`
      SELECT t.id, t.name, t.category, t.group_id, g.name as group_name
      FROM teams t
      LEFT JOIN \`groups\` g ON t.group_id = g.id
      WHERE NOT (COALESCE(t.is_placeholder, 0) = 1 AND t.group_id IS NULL)
    `);
    
    // Get all results with match info - include GROUP STAGE and SUPER6 matches
    const [results] = await pool.query(`
      SELECT 
        r.*,
        m.team_1_id,
        m.team_2_id
      FROM results r
      JOIN matches m ON r.match_id = m.id
      WHERE m.match_type IN ('group_stage', 'super6')
    `);
    
    // Get card penalties
    const [cardPenalties] = await pool.query("SELECT card_type, penalty_points FROM card_penalties");
    const penalties = {};
    cardPenalties.forEach(p => {
      penalties[p.card_type] = p.penalty_points;
    });
    
    // Calculate stats for each team
    const teamStats = {};
    teams.forEach(team => {
      teamStats[team.id] = {
        team_id: team.id,
        team_name: team.name,
        category: team.category,
        group_id: team.group_id,
        group_name: team.group_name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        penalty_points: 0,
        points: 0
      };
    });
    
    // Process each result
    results.forEach(result => {
      const team1Id = result.team_1_id;
      const team2Id = result.team_2_id;
      
      if (teamStats[team1Id]) {
        teamStats[team1Id].played++;
        teamStats[team1Id].goals_for += result.team_1_score;
        teamStats[team1Id].goals_against += result.team_2_score;
        
        // Calculate penalty points for team 1
        const yellowPenalty = (result.yellow_cards_team_1 || 0) * (penalties.yellow || 0);
        const redPenalty = (result.red_cards_team_1 || 0) * (penalties.red || 0);
        const greenPenalty = (result.green_cards_team_1 || 0) * (penalties.green || 0);
        teamStats[team1Id].penalty_points += yellowPenalty + redPenalty + greenPenalty;
        
        if (result.result === 'team_1_win') {
          teamStats[team1Id].won++;
          teamStats[team1Id].points += 3;
        } else if (result.result === 'draw') {
          teamStats[team1Id].drawn++;
          teamStats[team1Id].points += 1;
        } else if (result.result === 'team_2_win') {
          teamStats[team1Id].lost++;
        }
      }
      
      if (teamStats[team2Id]) {
        teamStats[team2Id].played++;
        teamStats[team2Id].goals_for += result.team_2_score;
        teamStats[team2Id].goals_against += result.team_1_score;
        
        // Calculate penalty points for team 2
        const yellowPenalty = (result.yellow_cards_team_2 || 0) * (penalties.yellow || 0);
        const redPenalty = (result.red_cards_team_2 || 0) * (penalties.red || 0);
        const greenPenalty = (result.green_cards_team_2 || 0) * (penalties.green || 0);
        teamStats[team2Id].penalty_points += yellowPenalty + redPenalty + greenPenalty;
        
        if (result.result === 'team_2_win') {
          teamStats[team2Id].won++;
          teamStats[team2Id].points += 3;
        } else if (result.result === 'draw') {
          teamStats[team2Id].drawn++;
          teamStats[team2Id].points += 1;
        } else if (result.result === 'team_1_win') {
          teamStats[team2Id].lost++;
        }
      }
    });
    
    // Calculate goal difference
    Object.values(teamStats).forEach(team => {
      team.goal_difference = team.goals_for - team.goals_against;
    });
    
    // Sort by: points DESC, goal_difference DESC, won DESC, penalty_points DESC (less negative = better)
    const sortedTeams = Object.values(teamStats).sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      if (b.goal_difference !== a.goal_difference) {
        return b.goal_difference - a.goal_difference;
      }
      if (b.won !== a.won) {
        return b.won - a.won;
      }
      // For penalty points: -1 is better than -2, so higher (less negative) is better
      return b.penalty_points - a.penalty_points;
    });
    
    res.json(sortedTeams);
  } catch (err) {
    console.error("Error calculating points", err);
    res.status(500).json({ error: "Failed to calculate points" });
  }
});

export default router;
