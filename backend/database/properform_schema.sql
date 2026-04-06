-- ProPerform Mobile Fitness Platform - Complete Database Schema
-- MariaDB Schema in 3NF
-- Complete fresh installation script
-- All tables include created_at and updated_at timestamps

-- ============================================================================
-- CORE USER MANAGEMENT TABLES
-- ============================================================================

-- Defines user role types in the system
CREATE TABLE role (
  rid INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Main user table for all platform users
CREATE TABLE users (
  uid INT AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(50) NOT NULL,
  birthdate DATE,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  weight DECIMAL(5,2) COMMENT 'weight in kilograms',
  height DECIMAL(5,2) COMMENT 'height in centimeters',
  gender ENUM('male', 'female', 'other', 'not specified') DEFAULT 'not specified',
  profile_image_url VARCHAR(500),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  fitness_level ENUM('beginner', 'intermediate', 'advanced'),
  training_frequency INT COMMENT 'times per week',
  primary_goal VARCHAR(100) COMMENT 'weight_loss, muscle_gain, endurance, etc.',
  role_id INT DEFAULT 2,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES role(rid) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_email (email),
  INDEX idx_role (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User interests/preferences
CREATE TABLE interests (
  iid INT AUTO_INCREMENT PRIMARY KEY,
  interest VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Links users to their interests (many-to-many)
CREATE TABLE user_has_interest (
  uid INT NOT NULL,
  iid INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (uid, iid),
  FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (iid) REFERENCES interests(iid) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TRAINER SYSTEM TABLES
-- ============================================================================

-- Extended profile for users with trainer role
-- Trainers are not publicly visible, users must know them in real life
CREATE TABLE trainers (
  tid INT AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  birthdate DATE,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(50),
  profile_image_url VARCHAR(500),
  invite_code VARCHAR(12) UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_invite_code (invite_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Links trainers to their assigned athletes (one-to-many)
-- Each user can have only ONE trainer, but trainers can manage multiple athletes
CREATE TABLE trainer_athletes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tid INT NOT NULL COMMENT 'trainer id',
  athlete_uid INT UNIQUE NOT NULL COMMENT 'athlete user id - UNIQUE ensures one trainer per user',
  assigned_date DATE NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tid) REFERENCES trainers(tid) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (athlete_uid) REFERENCES users(uid) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_trainer (tid),
  INDEX idx_athlete (athlete_uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- EXERCISE SYSTEM TABLES
-- ============================================================================

-- Categories of sports available in the platform (only gym and basketball)
CREATE TABLE sports (
  sid INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL COMMENT 'gym, basketball',
  description TEXT,
  icon_url VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Body muscle groups targeted by exercises
CREATE TABLE muscle_groups (
  mgid INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL COMMENT 'chest, legs, back, arms, core, etc.',
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Difficulty levels for exercises
CREATE TABLE difficulty_levels (
  dlid INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL COMMENT 'beginner, intermediate, advanced, expert',
  level_order INT UNIQUE NOT NULL COMMENT '1, 2, 3, 4 for sorting',
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Complete exercise database with videos and metadata
CREATE TABLE exercises (
  eid INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT COMMENT 'step-by-step instructions',
  video_url VARCHAR(500) COMMENT 'link to exercise demonstration video',
  thumbnail_url VARCHAR(500),
  sid INT NOT NULL,
  dlid INT NOT NULL,
  duration_minutes INT COMMENT 'estimated duration',
  equipment_needed VARCHAR(255) COMMENT 'none, dumbbells, barbell, basketball, etc.',
  created_by INT COMMENT 'trainer or user who created it',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sid) REFERENCES sports(sid) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (dlid) REFERENCES difficulty_levels(dlid) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(uid) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_sport (sid),
  INDEX idx_difficulty (dlid),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Links exercises to multiple muscle groups (many-to-many)
CREATE TABLE exercise_muscle_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eid INT NOT NULL,
  mgid INT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE COMMENT 'true if this is the primary muscle group',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (eid) REFERENCES exercises(eid) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (mgid) REFERENCES muscle_groups(mgid) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_exercise_muscle (eid, mgid),
  INDEX idx_exercise (eid),
  INDEX idx_muscle_group (mgid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TRAINING PLANS & ASSIGNMENTS
-- ============================================================================

-- Custom workout plans created by users or trainers
-- Plans are sport-specific: either gym OR basketball, never mixed
-- Users without trainers can create their own plans
-- Users with trainers can only have plans created by their trainers
CREATE TABLE training_plans (
  tpid INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sid INT NOT NULL COMMENT 'sport id - must be either gym or basketball',
  dlid INT,
  duration_weeks INT COMMENT 'total plan duration',
  sessions_per_week INT,
  created_by_user INT COMMENT 'user who created the plan (for self-created plans)',
  created_by_trainer INT COMMENT 'trainer who created the plan (for trainer-assigned plans)',
  is_template BOOLEAN DEFAULT FALSE COMMENT 'true if this is a reusable template',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sid) REFERENCES sports(sid) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (dlid) REFERENCES difficulty_levels(dlid) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (created_by_user) REFERENCES users(uid) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (created_by_trainer) REFERENCES trainers(tid) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_sport (sid),
  INDEX idx_created_by_user (created_by_user),
  INDEX idx_created_by_trainer (created_by_trainer)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exercises within a training plan with order and details
CREATE TABLE training_plan_exercises (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tpid INT NOT NULL,
  eid INT NOT NULL,
  week_number INT COMMENT 'which week of the plan',
  day_number INT COMMENT 'which day of the week (1-7)',
  exercise_order INT NOT NULL COMMENT 'order within the session',
  sets INT,
  reps INT,
  duration_minutes INT,
  rest_seconds INT COMMENT 'rest time between sets',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tpid) REFERENCES training_plans(tpid) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (eid) REFERENCES exercises(eid) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_plan (tpid),
  INDEX idx_exercise (eid),
  INDEX idx_week_day (week_number, day_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assigns training plans to specific users with date ranges
-- Users can have multiple active training plans (e.g., one gym, one basketball)
CREATE TABLE user_training_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uid INT NOT NULL,
  tpid INT NOT NULL,
  assigned_by_trainer INT COMMENT 'trainer id who assigned it (NULL if self-assigned)',
  start_date DATE NOT NULL,
  end_date DATE,
  completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (tpid) REFERENCES training_plans(tpid) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (assigned_by_trainer) REFERENCES trainers(tid) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_user (uid),
  INDEX idx_plan (tpid),
  INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PROGRESS TRACKING TABLES
-- ============================================================================

-- Records of completed exercises with performance metrics
CREATE TABLE exercise_logs (
  elid INT AUTO_INCREMENT PRIMARY KEY,
  uid INT NOT NULL,
  eid INT NOT NULL,
  training_plan_exercise_id INT COMMENT 'link to specific plan exercise if applicable',
  completed_at DATETIME NOT NULL,
  duration_minutes INT,
  sets_completed INT,
  reps_completed INT,
  weight_used_kg DECIMAL(6,2) COMMENT 'weight used for the exercise',
  difficulty_rating INT COMMENT '1-5 user rating of difficulty',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (eid) REFERENCES exercises(eid) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (training_plan_exercise_id) REFERENCES training_plan_exercises(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_user (uid),
  INDEX idx_exercise (eid),
  INDEX idx_completed_at (completed_at),
  INDEX idx_user_date (uid, completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User weight measurements over time
CREATE TABLE weight_logs (
  wlid INT AUTO_INCREMENT PRIMARY KEY,
  uid INT NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL,
  measured_at DATETIME NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_user (uid),
  INDEX idx_measured_at (measured_at),
  INDEX idx_user_date (uid, measured_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- COMMUNICATION TABLES
-- ============================================================================

-- Stored push notifications and reminders for users
CREATE TABLE notifications (
  nid INT AUTO_INCREMENT PRIMARY KEY,
  uid INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) COMMENT 'workout_reminder, progress_update, trainer_message, system',
  is_read BOOLEAN DEFAULT FALSE,
  read_at DATETIME,
  action_url VARCHAR(500) COMMENT 'deep link to specific screen in app',
  scheduled_for DATETIME COMMENT 'for scheduled/future notifications',
  sent_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_user (uid),
  INDEX idx_is_read (is_read),
  INDEX idx_scheduled (scheduled_for)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INITIAL DATA SEEDING
-- ============================================================================

-- Insert default roles
-- Role IDs: 1 = owner, 2 = user, 3 = trainer
INSERT INTO role (rid, role_name, description) VALUES
(1, 'owner', 'Platform administrator with full access'),
(2, 'user', 'Regular platform user/athlete'),
(3, 'trainer', 'Certified trainer who can manage athletes and create plans');

-- Insert sports categories (only gym and basketball)
INSERT INTO sports (name, description) VALUES
('gym', 'General gym and fitness exercises'),
('basketball', 'Basketball specific training exercises');

-- Insert muscle groups
INSERT INTO muscle_groups (name, description) VALUES
('chest', 'Pectoral muscles'),
('back', 'Back muscles including lats and traps'),
('legs', 'Quadriceps, hamstrings, calves'),
('arms', 'Biceps, triceps, forearms'),
('shoulders', 'Deltoid muscles'),
('core', 'Abdominals and obliques'),
('glutes', 'Gluteal muscles'),
('full_body', 'Exercises targeting multiple muscle groups');

-- Insert difficulty levels
INSERT INTO difficulty_levels (name, level_order, description) VALUES
('beginner', 1, 'Suitable for those new to exercise'),
('intermediate', 2, 'For those with some training experience'),
('advanced', 3, 'For experienced athletes'),
('expert', 4, 'For elite-level performance');