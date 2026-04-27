-- Reset and Seed Men's Tournament Data for Mora 9s 2026
USE mora9s_2026;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Clear all existing data
TRUNCATE TABLE goal_scorers;
TRUNCATE TABLE results;
TRUNCATE TABLE matches;
TRUNCATE TABLE teams;
TRUNCATE TABLE `groups`;
TRUNCATE TABLE card_penalties;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- Insert Card Penalties
-- ========================================
INSERT INTO card_penalties (card_type, penalty_points, description) VALUES
('green', -1, 'Green card penalty'),
('yellow', -2, 'Yellow card penalty'),
('red', -5, 'Red card penalty');

-- ========================================
-- Insert Groups
-- ========================================
INSERT INTO `groups` (id, name, description, category) VALUES
(1, 'Group A', 'Men''s Tournament Group A', 'men'),
(2, 'Group B', 'Men''s Tournament Group B', 'men');

-- ========================================
-- Insert Teams
-- ========================================
-- Group A Teams
INSERT INTO teams (id, name, group_id, category) VALUES
(1, 'Mora A', 1, 'men'),
(2, 'Sabra', 1, 'men'),
(3, 'Pera', 1, 'men'),
(4, 'Wayamba', 1, 'men'),
(5, 'Rajarata', 1, 'men');

-- Group B Teams
INSERT INTO teams (id, name, group_id, category) VALUES
(6, 'Mora B', 2, 'men'),
(7, 'Ruhuna', 2, 'men'),
(8, 'Kelani', 2, 'men'),
(9, 'Japura', 2, 'men'),
(10, 'Colombo', 2, 'men');

-- ========================================
-- Insert Matches
-- ========================================
-- Group Stage Matches
INSERT INTO matches (id, group_id, team_1_id, team_2_id, status, category, match_type) VALUES
-- Group A vs Group A & Group B vs Group B matches
(1, 1, 1, 2, 'finished', 'men', 'group_stage'),     -- Mora A vs Sabra (4-0)
(2, 1, 3, 4, 'finished', 'men', 'group_stage'),     -- Pera vs Wayamba (0-0)
(3, 2, 7, 8, 'finished', 'men', 'group_stage'),     -- Ruhuna vs Kelani (0-0)
(4, 2, 9, 10, 'finished', 'men', 'group_stage'),    -- Japura vs Colombo (0-1)
(5, 1, 1, 5, 'finished', 'men', 'group_stage'),     -- Mora A vs Rajarata (1-0)
(6, 1, 2, 3, 'finished', 'men', 'group_stage'),     -- Sabra vs Pera (0-2)
(7, 2, 6, 7, 'finished', 'men', 'group_stage'),     -- Mora B vs Ruhuna (0-1)
(8, 2, 8, 9, 'finished', 'men', 'group_stage'),     -- Kelani vs Japura (1-0)
(9, 1, 1, 4, 'finished', 'men', 'group_stage'),     -- Mora A vs Wayamba (0-0)
(10, 1, 2, 5, 'finished', 'men', 'group_stage'),    -- Sabra vs Rajarata (0-0)
(11, 2, 7, 10, 'finished', 'men', 'group_stage'),   -- Ruhuna vs Colombo (0-0)
(12, 2, 6, 8, 'finished', 'men', 'group_stage'),    -- Mora B vs Kelani (0-1)
(13, 1, 1, 3, 'finished', 'men', 'group_stage'),    -- Mora A vs Pera (1-1)
(14, 1, 4, 5, 'finished', 'men', 'group_stage'),    -- Wayamba vs Rajarata (2-0)
(15, 2, 7, 9, 'finished', 'men', 'group_stage'),    -- Ruhuna vs Japura (1-1)
(16, 2, 6, 10, 'finished', 'men', 'group_stage'),   -- Mora B vs Colombo (0-3)
(17, 1, 2, 4, 'finished', 'men', 'group_stage'),    -- Sabra vs Wayamba (0-1)
(18, 1, 3, 5, 'finished', 'men', 'group_stage'),    -- Pera vs Rajarata (2-0)
(19, 2, 8, 10, 'finished', 'men', 'group_stage'),   -- Kelani vs Colombo (0-1)
(20, 2, 6, 9, 'finished', 'men', 'group_stage');    -- Mora B vs Japura (0-0)

-- Knockout Stage Matches
INSERT INTO matches (id, group_id, team_1_id, team_2_id, status, category, match_type) VALUES
(21, NULL, 1, 8, 'finished', 'men', 'semi_final'),  -- SF 01: Mora A vs Kelani (3-2)
(22, NULL, 10, 3, 'finished', 'men', 'semi_final'), -- SF 02: Colombo vs Pera (0-1)
(23, NULL, 8, 3, 'finished', 'men', 'final'),       -- 3rd Place: Kelani vs Pera (0-1)
(24, NULL, 1, 10, 'finished', 'men', 'final');      -- Final: Mora A vs Colombo (1-2)

-- ========================================
-- Insert Results with Cards
-- ========================================
-- Match 1: Mora A vs Sabra (4-0) - Mora A wins
INSERT INTO results (match_id, team_1_score, team_2_score, result, 
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2) 
VALUES (1, 4, 0, 'team_1_win', 2, 1, 0, 1, 0, 0);

-- Match 2: Pera vs Wayamba (0-0) - Draw
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (2, 0, 0, 'draw', 1, 1, 0, 1, 0, 1);

-- Match 3: Ruhuna vs Kelani (0-0) - Draw
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (3, 0, 0, 'draw', 1, 0, 0, 2, 2, 0);

-- Match 4: Japura vs Colombo (0-1) - Colombo wins
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (4, 0, 1, 'team_2_win', 1, 0, 0, 1, 1, 0);

-- Match 5: Mora A vs Rajarata (1-0) - Mora A wins
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (5, 1, 0, 'team_1_win', 0, 0, 0, 1, 0, 0);

-- Match 6: Sabra vs Pera (0-2) - Pera wins
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (6, 0, 2, 'team_2_win', 0, 0, 0, 0, 0, 0);

-- Match 7: Mora B vs Ruhuna (0-1) - Ruhuna wins
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (7, 0, 1, 'team_2_win', 0, 0, 0, 0, 0, 0);

-- Match 8: Kelani vs Japura (1-0) - Kelani wins
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (8, 1, 0, 'team_1_win', 0, 0, 0, 0, 0, 0);

-- Match 9: Mora A vs Wayamba (0-0) - Draw
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (9, 0, 0, 'draw', 0, 0, 0, 0, 0, 0);

-- Match 10: Sabra vs Rajarata (0-0) - Draw
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (10, 0, 0, 'draw', 0, 0, 0, 0, 0, 0);

-- Match 11: Ruhuna vs Colombo (0-0) - Draw
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (11, 0, 0, 'draw', 0, 0, 0, 0, 0, 0);

-- Match 12: Mora B vs Kelani (0-1) - Kelani wins
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (12, 0, 1, 'team_2_win', 0, 0, 0, 0, 0, 0);

-- Match 13: Mora A vs Pera (1-1) - Draw
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (13, 1, 1, 'draw', 0, 0, 0, 0, 0, 0);

-- Match 14: Wayamba vs Rajarata (2-0) - Wayamba wins
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (14, 2, 0, 'team_1_win', 0, 0, 0, 0, 0, 0);

-- Match 15: Ruhuna vs Japura (1-1) - Draw
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (15, 1, 1, 'draw', 0, 0, 0, 0, 0, 0);

-- Match 16: Mora B vs Colombo (0-3) - Colombo wins
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (16, 0, 3, 'team_2_win', 0, 0, 0, 0, 0, 0);

-- Match 17: Sabra vs Wayamba (0-1) - Wayamba wins
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (17, 0, 1, 'team_2_win', 0, 0, 0, 0, 0, 0);

-- Match 18: Pera vs Rajarata (2-0) - Pera wins
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (18, 2, 0, 'team_1_win', 0, 0, 0, 0, 0, 0);

-- Match 19: Kelani vs Colombo (0-1) - Colombo wins
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (19, 0, 1, 'team_2_win', 0, 0, 0, 0, 0, 0);

-- Match 20: Mora B vs Japura (0-0) - Draw
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (20, 0, 0, 'draw', 0, 0, 0, 0, 0, 0);

-- Match 21: SF 01 - Mora A vs Kelani (3-2) - Mora A wins
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (21, 3, 2, 'team_1_win', 0, 0, 0, 0, 0, 0);

-- Match 22: SF 02 - Colombo vs Pera (0-1) - Pera wins
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (22, 0, 1, 'team_2_win', 0, 0, 0, 0, 0, 0);

-- Match 23: 3rd Place - Kelani vs Pera (0-1) - Pera wins
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (23, 0, 1, 'team_2_win', 0, 0, 0, 0, 0, 0);

-- Match 24: Final - Mora A vs Colombo (1-2) - Colombo wins (CHAMPIONS!)
INSERT INTO results (match_id, team_1_score, team_2_score, result,
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2)
VALUES (24, 1, 2, 'team_2_win', 0, 0, 0, 0, 0, 0);

-- ========================================
-- Verification Queries
-- ========================================
SELECT 'Data Import Complete!' as Status;
SELECT COUNT(*) as 'Total Teams' FROM teams;
SELECT COUNT(*) as 'Total Matches' FROM matches;
SELECT COUNT(*) as 'Total Results' FROM results;
SELECT name as 'Groups' FROM `groups`;
