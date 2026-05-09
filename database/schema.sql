CREATE DATABASE IF NOT EXISTS mora9s_2026;
USE mora9s_2026;

CREATE TABLE IF NOT EXISTS `groups` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  category ENUM('men', 'women') NOT NULL DEFAULT 'men'
);

CREATE TABLE IF NOT EXISTS teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  group_id INT,
  category ENUM('men', 'women') NOT NULL DEFAULT 'men',
  is_placeholder BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT,
  team_1_id INT NOT NULL,
  team_2_id INT NOT NULL,
  status ENUM('scheduled', 'finished') DEFAULT 'scheduled',
  category ENUM('men', 'women') NOT NULL DEFAULT 'men',
  match_type ENUM('group_stage', 'super6', 'semi_final', '3rd_place', 'final') DEFAULT 'group_stage',
  FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE SET NULL,
  FOREIGN KEY (team_1_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (team_2_id) REFERENCES teams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  match_id INT NOT NULL,
  team_1_score INT NOT NULL,
  team_2_score INT NOT NULL,
  result VARCHAR(50),
  yellow_cards_team_1 INT DEFAULT 0,
  red_cards_team_1 INT DEFAULT 0,
  green_cards_team_1 INT DEFAULT 0,
  yellow_cards_team_2 INT DEFAULT 0,
  red_cards_team_2 INT DEFAULT 0,
  green_cards_team_2 INT DEFAULT 0,
  penalty_score_team_1 INT DEFAULT NULL,
  penalty_score_team_2 INT DEFAULT NULL,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS goal_scorers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  match_id INT NOT NULL,
  player_name VARCHAR(100) NOT NULL,
  team_id INT NOT NULL,
  goals_scored INT NOT NULL DEFAULT 1,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS card_penalties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_type ENUM('yellow', 'red', 'green') NOT NULL UNIQUE,
  penalty_points INT NOT NULL DEFAULT 0,
  description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
);
