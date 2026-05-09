-- Women's semi / 3rd / final must use knockout placeholders until promotions run.
-- Run once on existing DB (after men's migration if applicable).

USE mora9s_2026;

INSERT INTO teams (id, name, group_id, category, is_placeholder) VALUES
(37, 'WA1', NULL, 'women', 1),
(38, 'WB2', NULL, 'women', 1),
(39, 'WB1', NULL, 'women', 1),
(40, 'WA2', NULL, 'women', 1),
(41, 'Women 3rd — pending', NULL, 'women', 1),
(42, 'Women 3rd — pending', NULL, 'women', 1),
(43, 'Women Final — pending', NULL, 'women', 1),
(44, 'Women Final — pending', NULL, 'women', 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  group_id = VALUES(group_id),
  category = VALUES(category),
  is_placeholder = VALUES(is_placeholder);

UPDATE matches SET team_1_id = 37, team_2_id = 38 WHERE id = 45 AND category = 'women' AND match_type = 'semi_final';
UPDATE matches SET team_1_id = 39, team_2_id = 40 WHERE id = 46 AND category = 'women' AND match_type = 'semi_final';
UPDATE matches SET team_1_id = 41, team_2_id = 42 WHERE id = 49 AND category = 'women' AND match_type = '3rd_place';
UPDATE matches SET team_1_id = 43, team_2_id = 44 WHERE id = 51 AND category = 'women' AND match_type = 'final';
