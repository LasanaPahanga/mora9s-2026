-- One-time migration: men's semi/final/3rd must not reuse Super 6 team IDs (13–18),
-- which get renamed after group-stage promotion and incorrectly showed real clubs early.
-- After this: run Super 6 promotion (match 44) so matches 47–48 get real qualifiers.

USE mora9s_2026;

INSERT INTO teams (id, name, group_id, category, is_placeholder) VALUES
(29, 'SA1', NULL, 'men', 1),
(30, 'SB2', NULL, 'men', 1),
(31, 'SA2', NULL, 'men', 1),
(32, 'SB1', NULL, 'men', 1),
(33, 'Men 3rd — pending', NULL, 'men', 1),
(34, 'Men 3rd — pending', NULL, 'men', 1),
(35, 'Men Final — pending', NULL, 'men', 1),
(36, 'Men Final — pending', NULL, 'men', 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  group_id = VALUES(group_id),
  category = VALUES(category),
  is_placeholder = VALUES(is_placeholder);

UPDATE matches SET team_1_id = 29, team_2_id = 30 WHERE id = 47 AND category = 'men' AND match_type = 'semi_final';
UPDATE matches SET team_1_id = 31, team_2_id = 32 WHERE id = 48 AND category = 'men' AND match_type = 'semi_final';
UPDATE matches SET team_1_id = 33, team_2_id = 34 WHERE id = 50 AND category = 'men' AND match_type = '3rd_place';
UPDATE matches SET team_1_id = 35, team_2_id = 36 WHERE id = 52 AND category = 'men' AND match_type = 'final';
