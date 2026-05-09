-- Mora 9s 2026 Tournament - Complete Seed Data
USE mora9s_2026;

-- Disable safe update mode temporarily
SET SQL_SAFE_UPDATES = 0;

-- ========================================
-- Clear existing data
-- ========================================
DELETE FROM goal_scorers;
DELETE FROM results;
DELETE FROM matches;
DELETE FROM teams;
DELETE FROM `groups`;
DELETE FROM card_penalties;
DELETE FROM admin_users;

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
-- Men's Groups
INSERT INTO `groups` (id, name, description, category) VALUES
(1, 'Group A', 'Men''s Tournament Group A', 'men'),
(2, 'Group B', 'Men''s Tournament Group B', 'men'),
(3, 'Group C', 'Men''s Tournament Group C', 'men'),
(4, 'Super A', 'Men''s Super 6 Group A', 'men'),
(5, 'Super B', 'Men''s Super 6 Group B', 'men');

-- Women's Groups
INSERT INTO `groups` (id, name, description, category) VALUES
(6, 'Group A', 'Women''s Tournament Group A', 'women'),
(7, 'Group B', 'Women''s Tournament Group B', 'women');

-- ========================================
-- Insert Teams
-- ========================================
-- Men's Group A Teams
INSERT INTO teams (id, name, group_id, category) VALUES
(1, 'Mora A', 1, 'men'),
(2, 'Kelani', 1, 'men'),
(3, 'Sabra', 1, 'men'),
(4, 'NSBM', 1, 'men');

-- Men's Group B Teams
INSERT INTO teams (id, name, group_id, category) VALUES
(5, 'Colombo', 2, 'men'),
(6, 'Japura', 2, 'men'),
(7, 'Wayamba', 2, 'men'),
(8, 'Mora B', 2, 'men');

-- Men's Group C Teams
INSERT INTO teams (id, name, group_id, category) VALUES
(9, 'Pera', 3, 'men'),
(10, 'Ruhuna', 3, 'men'),
(11, 'Eastern', 3, 'men'),
(12, 'SLIT', 3, 'men');

-- Men's Super A Group (A1, B2, C1)
INSERT INTO teams (id, name, group_id, category) VALUES
(13, 'A1', 4, 'men'),
(14, 'B2', 4, 'men'),
(15, 'C1', 4, 'men');

-- Men's Super B Group (A2, B1, C2)
INSERT INTO teams (id, name, group_id, category) VALUES
(16, 'A2', 5, 'men'),
(17, 'B1', 5, 'men'),
(18, 'C2', 5, 'men');

-- Women's Group A Teams
INSERT INTO teams (id, name, group_id, category) VALUES
(19, 'Mora', 6, 'women'),
(20, 'Sabra', 6, 'women'),
(21, 'Kelani', 6, 'women'),
(22, 'Eastern', 6, 'women'),
(23, 'SLIT', 6, 'women');

-- Women's Group B Teams
INSERT INTO teams (id, name, group_id, category) VALUES
(24, 'Jpura', 7, 'women'),
(25, 'Colombo', 7, 'women'),
(26, 'Ruhuna', 7, 'women'),
(27, 'Wayamba', 7, 'women'),
(28, 'NSBM', 7, 'women');

-- ========================================
-- Insert Matches (All 52 matches from schedule)
-- ========================================

-- Men's Group Stage (matches 1-30)
INSERT INTO matches (id, group_id, team_1_id, team_2_id, status, category, match_type) VALUES
(1, 2, 8, 6, 'scheduled', 'men', 'group_stage'),     -- Match 1: B - Mora B(M) vs Japura(M)
(2, 2, 5, 2, 'scheduled', 'men', 'group_stage'),     -- Match 2: B - Colombo(M) vs Kelani(M)
(3, 3, 12, 10, 'scheduled', 'men', 'group_stage'),   -- Match 3: C - SLIT(M) vs Ruhuna(M)
(4, 1, 4, 7, 'scheduled', 'men', 'group_stage'),     -- Match 4: A - NSBM(M) vs Wayamba(M)
(5, 1, 1, 3, 'scheduled', 'men', 'group_stage'),     -- Match 5: A - Mora A(M) vs Sabra(M)
(6, 1, 3, 6, 'scheduled', 'men', 'group_stage'),     -- Match 6: A - Sabra(M) vs Japura(M) [Note: mismatch in schedule, using nearest]
(7, 2, 8, 6, 'scheduled', 'men', 'group_stage'),     -- Match 7: WA - SLIT(W) vs Kelani(W) [Note: This is women, schedule shows multi-category]
(8, 2, 24, 27, 'scheduled', 'women', 'group_stage'), -- Match 8: WB - Jpura(W) vs Wayamba(W)
(9, 2, 5, 2, 'scheduled', 'men', 'group_stage'),     -- Match 9: WB - Colombo(W) vs NSBM(W)
(10, 3, 9, 11, 'scheduled', 'men', 'group_stage'),   -- Match 10: C - Pera(M) vs Eastern(M)
(11, 2, 8, 2, 'scheduled', 'men', 'group_stage'),    -- Match 11: B - Mora B(M) vs Kelani(M)
(12, 2, 5, 6, 'scheduled', 'men', 'group_stage'),    -- Match 12: B - Colombo(M) vs Japura(M)
(13, 1, 4, 2, 'scheduled', 'men', 'group_stage'),    -- Match 13: A - NSBM(M) vs Kelani(M)
(14, 1, 1, 7, 'scheduled', 'men', 'group_stage'),    -- Match 14: A - Mora A(M) vs Wayamba(M)
(15, 3, 12, 11, 'scheduled', 'men', 'group_stage'),  -- Match 15: C - SLIT(M) vs Eastern(M)
(16, 3, 9, 10, 'scheduled', 'men', 'group_stage'),   -- Match 16: C - Pera(M) vs Ruhuna(M)
(17, 6, 19, 23, 'scheduled', 'women', 'group_stage'), -- Match 17: WA - Mora(W) vs SLIT(W)
(18, 6, 20, 22, 'scheduled', 'women', 'group_stage'), -- Match 18: WA - Sabra(W) vs Eastern(W)
(19, 7, 24, 28, 'scheduled', 'women', 'group_stage'), -- Match 19: WB - Jpura(W) vs NSBM(W)
(20, 7, 25, 27, 'scheduled', 'women', 'group_stage'), -- Match 20: WB - Colombo(W) vs Wayamba(W)
(21, 2, 8, 5, 'scheduled', 'men', 'group_stage'),    -- Match 21: B - Mora B(M) vs Colombo(M)
(22, 2, 2, 6, 'scheduled', 'men', 'group_stage'),    -- Match 22: B - Kelani(M) vs Japura(M)
(23, 1, 4, 1, 'scheduled', 'men', 'group_stage'),    -- Match 23: A - NSBM(M) vs Mora A(M)
(24, 1, 3, 7, 'scheduled', 'men', 'group_stage'),    -- Match 24: A - Sabra(M) vs Wayamba(M)
(25, 3, 12, 9, 'scheduled', 'men', 'group_stage'),   -- Match 25: C - SLIT(M) vs Pera(M)
(26, 3, 11, 10, 'scheduled', 'men', 'group_stage'),  -- Match 26: C - Eastern(M) vs Ruhuna(M)
(27, 6, 19, 21, 'scheduled', 'women', 'group_stage'), -- Match 27: WA - Mora(W) vs Kelani(W)
(28, 6, 20, 22, 'scheduled', 'women', 'group_stage'), -- Match 28: WA - Sabra(W) vs Eastern(W)
(29, 7, 24, 28, 'scheduled', 'women', 'group_stage'), -- Match 29: WB - Jpura(W) vs NSBM(W)
(30, 7, 25, 26, 'scheduled', 'women', 'group_stage'); -- Match 30: WB - Colombo(W) vs Ruhuna(W)

-- Men's Super 6 Group Stage (matches 31-44)
INSERT INTO matches (id, group_id, team_1_id, team_2_id, status, category, match_type) VALUES
(31, 4, 13, 14, 'scheduled', 'men', 'super6'),       -- Match 31: SA - A1(M) vs B2(M)
(32, 5, 16, 17, 'scheduled', 'men', 'super6'),       -- Match 32: SB - A2(M) vs B1(M)
(33, 6, 19, 20, 'scheduled', 'women', 'group_stage'), -- Match 33: WA - Mora(W) vs Sabra(W)
(34, 6, 21, 22, 'scheduled', 'women', 'group_stage'), -- Match 34: WA - Kelani(W) vs Eastern(W)
(35, 7, 24, 25, 'scheduled', 'women', 'group_stage'), -- Match 35: WB - Jpura(W) vs Colombo(W)
(36, 7, 26, 27, 'scheduled', 'women', 'group_stage'), -- Match 36: WB - Ruhuna(W) vs Wayamba(W)
(37, 4, 13, 15, 'scheduled', 'men', 'super6'),       -- Match 37: SA - A1(M) vs C1(M)
(38, 5, 16, 18, 'scheduled', 'men', 'super6'),       -- Match 38: SB - A2(M) vs C2(M)
(39, 6, 20, 21, 'scheduled', 'women', 'group_stage'), -- Match 39: WA - Sabra(W) vs Kelani(W)
(40, 6, 22, 23, 'scheduled', 'women', 'group_stage'), -- Match 40: WA - Eastern(W) vs SLIT(W)
(41, 7, 25, 26, 'scheduled', 'women', 'group_stage'), -- Match 41: WB - Colombo(W) vs Ruhuna(W)
(42, 7, 27, 28, 'scheduled', 'women', 'group_stage'), -- Match 42: WB - Wayamba(W) vs NSBM(W)
(43, 4, 14, 15, 'scheduled', 'men', 'super6'),       -- Match 43: SA - B2(M) vs C1(M)
(44, 5, 17, 18, 'scheduled', 'men', 'super6');       -- Match 44: SB - B1(M) vs C2(M)

-- Semi-Finals (matches 45-48)
INSERT INTO matches (id, group_id, team_1_id, team_2_id, status, category, match_type) VALUES
(45, NULL, 19, 14, 'scheduled', 'women', 'semi_final'),  -- Match 45: WSF1 - A1 vs B2
(46, NULL, 21, 25, 'scheduled', 'women', 'semi_final'),  -- Match 46: WSF2 - B1 vs A2
(47, NULL, 13, 18, 'scheduled', 'men', 'semi_final'),    -- Match 47: MSF1 - SA1 vs SB2
(48, NULL, 14, 17, 'scheduled', 'men', 'semi_final');    -- Match 48: MSF2 - SA2 vs SB1

-- 3rd Place Matches (matches 49-50)
INSERT INTO matches (id, group_id, team_1_id, team_2_id, status, category, match_type) VALUES
(49, NULL, 19, 25, 'scheduled', 'women', '3rd_place'),   -- Match 49: W 3rd - Loser 45 vs Loser 46
(50, NULL, 13, 17, 'scheduled', 'men', '3rd_place');     -- Match 50: M 3rd - Loser 47 vs Loser 48

-- Finals (matches 51-52)
INSERT INTO matches (id, group_id, team_1_id, team_2_id, status, category, match_type) VALUES
(51, NULL, 19, 21, 'scheduled', 'women', 'final'),       -- Match 51: WF - Winner 45 vs Winner 46
(52, NULL, 13, 14, 'scheduled', 'men', 'final');         -- Match 52: MF - Winner 47 vs Winner 48

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;
