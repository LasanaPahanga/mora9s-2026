-- Migration script to rename columns from home/away to team_1/team_2
-- Run this if you already have data in your database

USE mora9s_2026;

-- Update matches table
ALTER TABLE matches 
  CHANGE COLUMN team_home_id team_1_id INT,
  CHANGE COLUMN team_away_id team_2_id INT,
  DROP COLUMN match_date,
  DROP COLUMN home_score,
  DROP COLUMN away_score;

-- Update results table
ALTER TABLE results 
  CHANGE COLUMN team_home_score team_1_score INT NOT NULL,
  CHANGE COLUMN team_away_score team_2_score INT NOT NULL;

-- Update existing result labels if needed (optional)
UPDATE results SET result = 'team_1_win' WHERE result = 'home_win';
UPDATE results SET result = 'team_2_win' WHERE result = 'away_win';
