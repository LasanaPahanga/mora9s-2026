import express from "express";
import { getPool } from "../db.js";

const router = express.Router();

// Function to generate match description
function generateMatchDescription(result) {
  const { team_1_name, team_2_name, team_1_score, team_2_score, 
          penalty_score_team_1, penalty_score_team_2, match_type, 
          goal_scorers, result: matchResult } = result;
  
  let description = "";
  
  // Match type context
  const matchTypeText = match_type === 'final' ? 'In an exciting final match' :
                       match_type === 'semi_final' ? 'In a crucial semi-final' :
                       match_type === '3rd_place' ? 'In the 3rd place playoff' :
                       match_type === 'super6' ? 'In a Super 6 stage match' :
                       'In a competitive group stage match';
  
  // Score difference
  const scoreDiff = Math.abs(team_1_score - team_2_score);
  const totalGoals = team_1_score + team_2_score;
  
  // Winner
  const winner = matchResult === 'team_1_win' ? team_1_name : 
                matchResult === 'team_2_win' ? team_2_name : null;
  
  // Penalty shootout
  const hadPenalties = penalty_score_team_1 !== null && penalty_score_team_2 !== null;
  
  // Build description
  if (matchResult === 'draw') {
    if (totalGoals === 0) {
      description = `${matchTypeText}, ${team_1_name} and ${team_2_name} played out a goalless draw in a tightly contested defensive battle.`;
    } else {
      description = `${matchTypeText}, both ${team_1_name} and ${team_2_name} shared the points in an entertaining ${team_1_score}-${team_2_score} draw with goals from both sides.`;
    }
  } else {
    if (scoreDiff === 1) {
      description = `${matchTypeText}, ${winner} secured a narrow ${team_1_score}-${team_2_score} victory over ${winner === team_1_name ? team_2_name : team_1_name} in a closely fought encounter.`;
    } else if (scoreDiff >= 3) {
      description = `${matchTypeText}, ${winner} dominated with a commanding ${team_1_score}-${team_2_score} win over ${winner === team_1_name ? team_2_name : team_1_name}, showcasing superior attacking prowess.`;
    } else {
      description = `${matchTypeText}, ${winner} emerged victorious with a ${team_1_score}-${team_2_score} win against ${winner === team_1_name ? team_2_name : team_1_name}.`;
    }
  }
  
  // Add penalty info
  if (hadPenalties) {
    const penaltyWinner = penalty_score_team_1 > penalty_score_team_2 ? team_1_name : team_2_name;
    description += ` After a ${team_1_score}-${team_2_score} draw, ${penaltyWinner} held their nerve to win ${penalty_score_team_1}-${penalty_score_team_2} on penalties.`;
  }
  
  // Add top scorer if available
  if (goal_scorers && goal_scorers.length > 0) {
    const topScorer = goal_scorers.reduce((prev, current) => 
      (prev.goals_scored > current.goals_scored) ? prev : current
    );
    if (topScorer.goals_scored > 1) {
      description += ` ${topScorer.player_name} was the star performer with ${topScorer.goals_scored} goals.`;
    }
  }
  
  return description;
}

// GET /api/results
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    
    // Get results with team names and match info including match_type and category
    const [results] = await pool.query(`
      SELECT 
        r.*,
        m.team_1_id,
        m.team_2_id,
        m.match_type,
        m.category,
        t1.name AS team_1_name,
        t2.name AS team_2_name
      FROM results r
      JOIN matches m ON r.match_id = m.id
      JOIN teams t1 ON m.team_1_id = t1.id
      JOIN teams t2 ON m.team_2_id = t2.id
      ORDER BY r.id DESC
    `);
    
    // Get goal scorers for each result and generate descriptions
    for (let result of results) {
      const [scorers] = await pool.query(`
        SELECT 
          gs.player_name,
          gs.goals_scored,
          gs.team_id,
          t.name AS team_name
        FROM goal_scorers gs
        JOIN teams t ON gs.team_id = t.id
        WHERE gs.match_id = ?
        ORDER BY gs.goals_scored DESC
      `, [result.match_id]);
      
      result.goal_scorers = scorers;
      
      // Generate AI-style description for this match
      result.match_description = generateMatchDescription(result);
    }
    
    res.json(results);
  } catch (err) {
    console.error("Error fetching results", err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

export default router;
