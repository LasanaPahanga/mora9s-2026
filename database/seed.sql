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
(12, 'SLIIT', 3, 'men');

-- Men's Super A Group (A1, B2, C1)
INSERT INTO teams (id, name, group_id, category, is_placeholder) VALUES
(13, 'A1', 4, 'men', 1),
(14, 'B2', 4, 'men', 1),
(15, 'C1', 4, 'men', 1);

-- Men's Super B Group (A2, B1, C2)
INSERT INTO teams (id, name, group_id, category, is_placeholder) VALUES
(16, 'A2', 5, 'men', 1),
(17, 'B1', 5, 'men', 1),
(18, 'C2', 5, 'men', 1);

-- Men's knockout placeholders (NOT Super 6 IDs 13–18 — those get renamed after group promotion)
INSERT INTO teams (id, name, group_id, category, is_placeholder) VALUES
(29, 'SA1', NULL, 'men', 1),
(30, 'SB2', NULL, 'men', 1),
(31, 'SA2', NULL, 'men', 1),
(32, 'SB1', NULL, 'men', 1),
(33, 'Men 3rd — pending', NULL, 'men', 1),
(34, 'Men 3rd — pending', NULL, 'men', 1),
(35, 'Men Final — pending', NULL, 'men', 1),
(36, 'Men Final — pending', NULL, 'men', 1);

-- Women's Group A Teams
INSERT INTO teams (id, name, group_id, category) VALUES
(19, 'Mora', 6, 'women'),
(20, 'Sabra', 6, 'women'),
(21, 'Kelani', 6, 'women'),
(22, 'Eastern', 6, 'women'),
(23, 'SLIIT', 6, 'women');

-- Women's Group B Teams
INSERT INTO teams (id, name, group_id, category) VALUES
(24, 'Japura', 7, 'women'),
(25, 'Colombo', 7, 'women'),
(26, 'Ruhuna', 7, 'women'),
(27, 'Wayamba', 7, 'women'),
(28, 'NSBM', 7, 'women');

-- Women's knockout placeholders (filled after all women's group games → semis; 3rd/final after semis)
INSERT INTO teams (id, name, group_id, category, is_placeholder) VALUES
(37, 'WA1', NULL, 'women', 1),
(38, 'WB2', NULL, 'women', 1),
(39, 'WB1', NULL, 'women', 1),
(40, 'WA2', NULL, 'women', 1),
(41, 'Women 3rd — pending', NULL, 'women', 1),
(42, 'Women 3rd — pending', NULL, 'women', 1),
(43, 'Women Final — pending', NULL, 'women', 1),
(44, 'Women Final — pending', NULL, 'women', 1);

-- ========================================
-- Insert Matches (52) — order from official Mora 9s 2026 schedule PDF
-- ========================================

-- Matches 1–30: pool stage (WA/WB = women A/B; A/B/C = men A/B/C)
INSERT INTO matches (id, group_id, team_1_id, team_2_id, status, category, match_type) VALUES
(1, 6, 19, 20, 'scheduled', 'women', 'group_stage'),   -- 1 WA Mora(W) vs Sabra(W)
(2, 2, 5, 7, 'scheduled', 'men', 'group_stage'),       -- 2 B Colombo(M) vs Wayamba(M)
(3, 6, 21, 22, 'scheduled', 'women', 'group_stage'),   -- 3 WA Kelani(W) vs Eastern(W)
(4, 7, 24, 28, 'scheduled', 'women', 'group_stage'),   -- 4 WB Japura(W) vs NSBM(W)
(5, 7, 25, 27, 'scheduled', 'women', 'group_stage'),   -- 5 WB Colombo(W) vs Wayamba(W)
(6, 1, 1, 3, 'scheduled', 'men', 'group_stage'),       -- 6 A Mora A(M) vs Sabra(M)
(7, 1, 4, 2, 'scheduled', 'men', 'group_stage'),       -- 7 A NSBM(M) vs Kelani(M)
(8, 2, 8, 6, 'scheduled', 'men', 'group_stage'),       -- 8 B Mora B(M) vs Japura(M)
(9, 3, 12, 10, 'scheduled', 'men', 'group_stage'),      -- 9 C SLIIT(M) vs Ruhuna(M)
(10, 3, 9, 11, 'scheduled', 'men', 'group_stage'),     -- 10 C Pera(M) vs Eastern(M)
(11, 1, 4, 3, 'scheduled', 'men', 'group_stage'),      -- 11 A NSBM(M) vs Sabra(M)
(12, 1, 1, 2, 'scheduled', 'men', 'group_stage'),       -- 12 A Mora A(M) vs Kelani(M)
(13, 2, 8, 7, 'scheduled', 'men', 'group_stage'),       -- 13 B Mora B(M) vs Wayamba(M)
(14, 2, 5, 6, 'scheduled', 'men', 'group_stage'),       -- 14 B Colombo(M) vs Japura(M)
(15, 3, 12, 11, 'scheduled', 'men', 'group_stage'),    -- 15 C SLIIT(M) vs Eastern(M)
(16, 3, 9, 10, 'scheduled', 'men', 'group_stage'),     -- 16 C Pera(M) vs Ruhuna(M)
(17, 6, 19, 22, 'scheduled', 'women', 'group_stage'),   -- 17 WA Mora(W) vs Eastern(W)
(18, 6, 23, 21, 'scheduled', 'women', 'group_stage'),   -- 18 WA SLIIT(W) vs Kelani(W)
(19, 7, 24, 27, 'scheduled', 'women', 'group_stage'),   -- 19 WB Japura(W) vs Wayamba(W)
(20, 7, 28, 26, 'scheduled', 'women', 'group_stage'),   -- 20 WB NSBM(W) vs Ruhuna(W)
(21, 2, 8, 5, 'scheduled', 'men', 'group_stage'),       -- 21 B Mora B(M) vs Colombo(M)
(22, 2, 7, 6, 'scheduled', 'men', 'group_stage'),       -- 22 B Wayamba(M) vs Japura(M)
(23, 1, 4, 1, 'scheduled', 'men', 'group_stage'),       -- 23 A NSBM(M) vs Mora A(M)
(24, 1, 3, 2, 'scheduled', 'men', 'group_stage'),       -- 24 A Sabra(M) vs Kelani(M)
(25, 3, 12, 9, 'scheduled', 'men', 'group_stage'),     -- 25 C SLIIT(M) vs Pera(M)
(26, 3, 11, 10, 'scheduled', 'men', 'group_stage'),      -- 26 C Eastern(M) vs Ruhuna(M)
(27, 6, 19, 23, 'scheduled', 'women', 'group_stage'),   -- 27 WA Mora(W) vs SLIIT(W)
(28, 6, 20, 22, 'scheduled', 'women', 'group_stage'),   -- 28 WA Sabra(W) vs Eastern(W)
(29, 7, 24, 26, 'scheduled', 'women', 'group_stage'),   -- 29 WB Japura(W) vs Ruhuna(W)
(30, 7, 25, 28, 'scheduled', 'women', 'group_stage');   -- 30 WB Colombo(W) vs NSBM(W)

-- Matches 31–44: Super 6 (men) interleaved with women pool (PDF order)
INSERT INTO matches (id, group_id, team_1_id, team_2_id, status, category, match_type) VALUES
(31, 4, 13, 14, 'scheduled', 'men', 'super6'),        -- 31 SA A1(M) vs B2(M)
(32, 5, 16, 17, 'scheduled', 'men', 'super6'),        -- 32 SB A2(M) vs B1(M)
(33, 6, 19, 21, 'scheduled', 'women', 'group_stage'),  -- 33 WA Mora(W) vs Kelani(W)
(34, 6, 20, 23, 'scheduled', 'women', 'group_stage'),  -- 34 WA Sabra(W) vs SLIIT(W)
(35, 7, 24, 25, 'scheduled', 'women', 'group_stage'),   -- 35 WB Japura(W) vs Colombo(W)
(36, 7, 26, 27, 'scheduled', 'women', 'group_stage'), -- 36 WB Ruhuna(W) vs Wayamba(W)
(37, 4, 13, 15, 'scheduled', 'men', 'super6'),         -- 37 SA A1(M) vs C1(M)
(38, 5, 16, 18, 'scheduled', 'men', 'super6'),         -- 38 SB A2(M) vs C2(M)
(39, 6, 20, 21, 'scheduled', 'women', 'group_stage'),  -- 39 WA Sabra(W) vs Kelani(W)
(40, 6, 22, 23, 'scheduled', 'women', 'group_stage'), -- 40 WA Eastern(W) vs SLIIT(W)
(41, 7, 25, 26, 'scheduled', 'women', 'group_stage'), -- 41 WB Colombo(W) vs Ruhuna(W)
(42, 7, 27, 28, 'scheduled', 'women', 'group_stage'), -- 42 WB Wayamba(W) vs NSBM(W)
(43, 4, 14, 15, 'scheduled', 'men', 'super6'),         -- 43 SA B2(M) vs C1(M)
(44, 5, 17, 18, 'scheduled', 'men', 'super6');        -- 44 SB B1(M) vs C2(M)

-- Knockouts 45–52 (PDF)
INSERT INTO matches (id, group_id, team_1_id, team_2_id, status, category, match_type) VALUES
(45, NULL, 37, 38, 'scheduled', 'women', 'semi_final'), -- WSF1 A1 vs B2 → filled by promotion
(46, NULL, 39, 40, 'scheduled', 'women', 'semi_final'), -- WSF2 B1 vs A2
(47, NULL, 29, 30, 'scheduled', 'men', 'semi_final'),    -- MSF1 SA1 vs SB2 → Super 6 promotion
(48, NULL, 31, 32, 'scheduled', 'men', 'semi_final'),    -- MSF2 SB1 vs SA2

INSERT INTO matches (id, group_id, team_1_id, team_2_id, status, category, match_type) VALUES
(49, NULL, 41, 42, 'scheduled', 'women', '3rd_place'),  -- W 3rd loser SF1 vs loser SF2
(50, NULL, 33, 34, 'scheduled', 'men', '3rd_place'),    -- M 3rd loser MSF1 vs loser MSF2

INSERT INTO matches (id, group_id, team_1_id, team_2_id, status, category, match_type) VALUES
(51, NULL, 43, 44, 'scheduled', 'women', 'final'),     -- WF winner 45 vs winner 46
(52, NULL, 35, 36, 'scheduled', 'men', 'final');        -- MF winner 47 vs winner 48

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;
