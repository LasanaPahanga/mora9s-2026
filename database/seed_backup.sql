-- Mora 9s 2026 Men's Hockey Tournament Data
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
INSERT INTO `groups` (id, name, description, category) VALUES
(1, 'Group A', 'Men''s Tournament Group A', 'men'),
(2, 'Group B', 'Men''s Tournament Group B', 'men'),
(3, 'Group A', 'Women''s Tournament Group A', 'women'),
(4, 'Group B', 'Women''s Tournament Group B', 'women');

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

-- Women's Group A Teams
INSERT INTO teams (id, name, group_id, category) VALUES
(11, 'Mora B', 3, 'women'),
(12, 'Colombo', 3, 'women'),
(13, 'Wayamba', 3, 'women'),
(14, 'Kelani', 3, 'women'),
(15, 'Pera', 3, 'women');

-- Women's Group B Teams
INSERT INTO teams (id, name, group_id, category) VALUES
(16, 'Mora A', 4, 'women'),
(17, 'Ruhuna', 4, 'women'),
(18, 'Japura', 4, 'women'),
(19, 'Rajarata', 4, 'women');

-- ========================================
-- Insert Matches
-- ========================================
-- Group Stage Matches
INSERT INTO matches (id, group_id, team_1_id, team_2_id, status, category, match_type) VALUES
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
(23, NULL, 8, 3, 'finished', 'men', '3rd_place'),   -- 3rd Place: Kelani vs Pera (0-1)
(24, NULL, 1, 10, 'finished', 'men', 'final');      -- Final: Mora A vs Colombo (1-2)

-- Women's Group Stage Matches
INSERT INTO matches (id, group_id, team_1_id, team_2_id, status, category, match_type) VALUES
(25, 3, 16, 17, 'finished', 'women', 'group_stage'),  -- Mora A vs Ruhuna (0-0)
(26, 3, 14, 15, 'finished', 'women', 'group_stage'),  -- Kelani vs Pera (1-0)
(27, 3, 12, 13, 'finished', 'women', 'group_stage'),  -- Colombo vs Wayamba (0-0)
(28, 4, 18, 19, 'finished', 'women', 'group_stage'),  -- Japura vs Rajarata (2-0)
(29, 3, 11, 12, 'finished', 'women', 'group_stage'),  -- Mora B vs Colombo (0-0)
(30, 3, 13, 14, 'finished', 'women', 'group_stage'),  -- Wayamba vs Kelani (0-1)
(31, 4, 17, 18, 'finished', 'women', 'group_stage'),  -- Ruhuna vs Japura (0-3)
(32, 3, 12, 15, 'finished', 'women', 'group_stage'),  -- Colombo vs Pera (1-0)
(33, 3, 11, 13, 'finished', 'women', 'group_stage'),  -- Mora B vs Wayamba (0-0)
(34, 3, 16, 19, 'finished', 'women', 'group_stage'),  -- Mora A vs Rajarata (1-0)
(35, 3, 12, 14, 'finished', 'women', 'group_stage'),  -- Colombo vs Kelani (1-0)
(36, 3, 11, 15, 'finished', 'women', 'group_stage'),  -- Mora B vs Pera (0-1)
(37, 3, 16, 18, 'finished', 'women', 'group_stage'),  -- Mora A vs Japura (0-1)
(38, 3, 13, 15, 'finished', 'women', 'group_stage'),  -- Wayamba vs Pera (0-0)
(39, 3, 11, 14, 'finished', 'women', 'group_stage'),  -- Mora B vs Kelani (0-1)
(40, 4, 17, 19, 'finished', 'women', 'group_stage');  -- Ruhuna vs Rajarata (0-0)

-- Women's Knockout Stage Matches
INSERT INTO matches (id, group_id, team_1_id, team_2_id, status, category, match_type) VALUES
(41, NULL, 16, 14, 'finished', 'women', 'semi_final'),  -- SF 01: Mora A vs Kelani (3-4)
(42, NULL, 12, 18, 'finished', 'women', 'semi_final'),  -- SF 02: Colombo vs Japura (0-1)
(43, NULL, 16, 12, 'finished', 'women', '3rd_place'),   -- 3rd Place: Mora A vs Colombo (0-1)
(44, NULL, 14, 18, 'finished', 'women', 'final');       -- Final: Kelani vs Japura (0-2)

-- ========================================
-- Insert Results with Cards
-- ========================================
INSERT INTO results (match_id, team_1_score, team_2_score, result, 
                     green_cards_team_1, yellow_cards_team_1, red_cards_team_1,
                     green_cards_team_2, yellow_cards_team_2, red_cards_team_2) VALUES
(1, 4, 0, 'team_1_win', 2, 1, 0, 1, 0, 0),
(2, 0, 0, 'draw', 1, 1, 0, 1, 0, 1),
(3, 0, 0, 'draw', 1, 0, 0, 2, 2, 0),
(4, 0, 1, 'team_2_win', 1, 0, 0, 1, 1, 0),
(5, 1, 0, 'team_1_win', 0, 0, 0, 1, 0, 0),
(6, 0, 2, 'team_2_win', 0, 0, 0, 0, 0, 0),
(7, 0, 1, 'team_2_win', 0, 0, 0, 0, 0, 0),
(8, 1, 0, 'team_1_win', 0, 0, 0, 0, 0, 0),
(9, 0, 0, 'draw', 0, 0, 0, 0, 0, 0),
(10, 0, 0, 'draw', 0, 0, 0, 0, 0, 0),
(11, 0, 0, 'draw', 0, 0, 0, 0, 0, 0),
(12, 0, 1, 'team_2_win', 0, 0, 0, 0, 0, 0),
(13, 1, 1, 'draw', 0, 0, 0, 0, 0, 0),
(14, 2, 0, 'team_1_win', 0, 0, 0, 0, 0, 0),
(15, 1, 1, 'draw', 0, 0, 0, 0, 0, 0),
(16, 0, 3, 'team_2_win', 0, 0, 0, 0, 0, 0),
(17, 0, 1, 'team_2_win', 0, 0, 0, 0, 0, 0),
(18, 2, 0, 'team_1_win', 0, 0, 0, 0, 0, 0),
(19, 0, 1, 'team_2_win', 0, 0, 0, 0, 0, 0),
(20, 0, 0, 'draw', 0, 0, 0, 0, 0, 0),
(21, 3, 2, 'team_1_win', 0, 0, 0, 0, 0, 0),
(22, 0, 1, 'team_2_win', 0, 0, 0, 0, 0, 0),
(23, 0, 1, 'team_2_win', 0, 0, 0, 0, 0, 0),
(24, 1, 2, 'team_2_win', 0, 0, 0, 0, 0, 0),

-- Women's Results
(25, 0, 0, 'draw', 0, 0, 0, 0, 0, 0),        -- Mora A vs Ruhuna (0-0)
(26, 1, 0, 'team_1_win', 0, 0, 0, 0, 0, 0),  -- Kelani vs Pera (1-0)
(27, 0, 0, 'draw', 0, 0, 0, 0, 0, 0),        -- Colombo vs Wayamba (0-0)
(28, 2, 0, 'team_1_win', 0, 0, 0, 0, 0, 0),  -- Japura vs Rajarata (2-0)
(29, 0, 0, 'draw', 0, 0, 0, 0, 0, 0),        -- Mora B vs Colombo (0-0)
(30, 0, 1, 'team_2_win', 0, 0, 0, 0, 0, 0),  -- Wayamba vs Kelani (0-1)
(31, 0, 3, 'team_2_win', 0, 0, 0, 0, 0, 0),  -- Ruhuna vs Japura (0-3)
(32, 1, 0, 'team_1_win', 0, 0, 0, 0, 0, 0),  -- Colombo vs Pera (1-0)
(33, 0, 0, 'draw', 0, 0, 0, 0, 0, 0),        -- Mora B vs Wayamba (0-0)
(34, 1, 0, 'team_1_win', 0, 0, 0, 0, 0, 0),  -- Mora A vs Rajarata (1-0)
(35, 1, 0, 'team_1_win', 0, 0, 0, 0, 0, 0),  -- Colombo vs Kelani (1-0)
(36, 0, 1, 'team_2_win', 0, 0, 0, 0, 0, 0),  -- Mora B vs Pera (0-1)
(37, 0, 1, 'team_2_win', 0, 0, 0, 0, 0, 0),  -- Mora A vs Japura (0-1)
(38, 0, 0, 'draw', 0, 0, 0, 0, 0, 0),        -- Wayamba vs Pera (0-0)
(39, 0, 1, 'team_2_win', 0, 0, 0, 0, 0, 0),  -- Mora B vs Kelani (0-1)
(40, 0, 0, 'draw', 0, 0, 0, 0, 0, 0),        -- Ruhuna vs Rajarata (0-0)
(41, 3, 4, 'team_2_win', 0, 0, 0, 0, 0, 0),  -- SF 01: Mora A vs Kelani (3-4)
(42, 0, 1, 'team_2_win', 0, 0, 0, 0, 0, 0),  -- SF 02: Colombo vs Japura (0-1)
(43, 0, 1, 'team_2_win', 0, 0, 0, 0, 0, 0),  -- 3rd Place: Mora A vs Colombo (0-1)
(44, 0, 2, 'team_2_win', 0, 0, 0, 0, 0, 0);  -- Final: Kelani vs Japura (0-2)

-- ========================================
-- Insert Admin User (username: admin, password: admin123)
-- ========================================
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2a$10$uFvb5fxTMMgcRq1YOQnYB.mwYzjnXWvF.AdkkJjJxUBa6rHt.vs9O');

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;
