-- ============================================================
--  properform – Datenbankschema (kommentiert)
--  Exportiert: 2026-04-04  |  MariaDB 10.11
-- ============================================================

-- ────────────────────────────────────────────────────────────
--  ROLLEN & BENUTZER
-- ────────────────────────────────────────────────────────────

-- Rollen: owner (Admin), user (Athlet), trainer
CREATE TABLE `role` (
  `rid`         INT(11)      NOT NULL AUTO_INCREMENT,
  `role_name`   VARCHAR(50)  NOT NULL,                  -- 'owner' | 'user' | 'trainer'
  `description` TEXT         DEFAULT NULL,
  `created_at`  DATETIME     DEFAULT current_timestamp(),
  `updated_at`  DATETIME     DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`rid`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alle App-Nutzer (Athleten + Owner)
-- Trainer haben eine eigene Tabelle (trainers)
CREATE TABLE `users` (
  `uid`                        INT(11)       NOT NULL AUTO_INCREMENT,
  `firstname`                  VARCHAR(50)   NOT NULL,
  `birthdate`                  DATE          DEFAULT NULL,
  `email`                      VARCHAR(100)  NOT NULL,
  `password_hash`              VARCHAR(255)  NOT NULL,
  `weight`                     DECIMAL(5,2)  DEFAULT NULL,           -- kg
  `height`                     DECIMAL(5,2)  DEFAULT NULL,           -- cm
  `gender`                     ENUM('male','female','other','not specified') DEFAULT 'not specified',
  `profile_image_url`          VARCHAR(500)  DEFAULT NULL,
  `onboarding_completed`       TINYINT(1)    DEFAULT 0,
  `fitness_level`              ENUM('beginner','intermediate','advanced') DEFAULT NULL,
  `training_frequency`         INT(11)       DEFAULT NULL,           -- Mal pro Woche
  `primary_goal`               VARCHAR(100)  DEFAULT NULL,           -- z.B. 'muscle_gain'
  `role_id`                    INT(11)       DEFAULT 2,              -- FK → role.rid
  `last_login`                 DATETIME      DEFAULT NULL,
  `created_at`                 DATETIME      DEFAULT current_timestamp(),
  `updated_at`                 DATETIME      DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `email_verified`             TINYINT(1)    DEFAULT 0,
  `email_verification_code`    VARCHAR(255)  DEFAULT NULL,
  `email_verification_expires` DATETIME      DEFAULT NULL,
  `last_password_change`       DATETIME      DEFAULT current_timestamp(),
  PRIMARY KEY (`uid`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role`  (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`rid`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
--  AUTHENTIFIZIERUNG
-- ────────────────────────────────────────────────────────────

-- JWT Refresh Tokens (User bleibt eingeloggt)
CREATE TABLE `refresh_tokens` (
  `rtid`       INT(11)      NOT NULL AUTO_INCREMENT,
  `uid`        INT(11)      NOT NULL,                   -- FK → users.uid
  `token`      VARCHAR(500) NOT NULL,
  `expires_at` DATETIME     NOT NULL,
  `created_at` TIMESTAMP    DEFAULT current_timestamp(),
  PRIMARY KEY (`rtid`),
  KEY `uid` (`uid`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Passwort-Reset-Tokens (zeitlich begrenzt)
CREATE TABLE `password_resets` (
  `prid`       INT(11)      NOT NULL AUTO_INCREMENT,
  `email`      VARCHAR(255) NOT NULL,
  `token`      VARCHAR(255) NOT NULL,
  `expires_at` TIMESTAMP    NOT NULL,
  PRIMARY KEY (`prid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Expo Push-Tokens für Push-Benachrichtigungen (React Native)
CREATE TABLE `push_tokens` (
  `ptid`            INT(11)      NOT NULL AUTO_INCREMENT,
  `uid`             INT(11)      NOT NULL,               -- FK → users.uid
  `expo_push_token` VARCHAR(255) NOT NULL,
  `project_id`      VARCHAR(255) DEFAULT NULL,           -- Expo Project ID
  `device`          VARCHAR(100) DEFAULT NULL,
  `created_at`      TIMESTAMP    DEFAULT current_timestamp(),
  PRIMARY KEY (`ptid`),
  UNIQUE KEY `unique_user_token` (`uid`, `expo_push_token`),
  KEY `idx_push_tokens_project_id` (`project_id`),
  CONSTRAINT `fk_push_user` FOREIGN KEY (`uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ────────────────────────────────────────────────────────────
--  TRAINER-SYSTEM
-- ────────────────────────────────────────────────────────────

-- Trainer-Accounts (getrennt von users – eigene Auth-Tabelle)
CREATE TABLE `trainers` (
  `tid`           INT(11)      NOT NULL AUTO_INCREMENT,
  `firstname`     VARCHAR(100) NOT NULL,
  `lastname`      VARCHAR(100) NOT NULL,
  `birthdate`     DATE         DEFAULT NULL,
  `email`         VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone_number`  VARCHAR(50)  DEFAULT NULL,
  `invite_code`   VARCHAR(12)  NOT NULL,                -- z.B. 'TRN-KLV-HL6' – Athlet nutzt diesen Code
  `created_at`    DATETIME     DEFAULT current_timestamp(),
  `updated_at`    DATETIME     DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`tid`),
  UNIQUE KEY `email`       (`email`),
  UNIQUE KEY `invite_code` (`invite_code`),
  KEY `idx_email`       (`email`),
  KEY `idx_invite_code` (`invite_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Zuordnung Trainer ↔ Athlet (1 Trainer kann viele Athleten haben)
CREATE TABLE `trainer_athletes` (
  `id`            INT(11) NOT NULL AUTO_INCREMENT,
  `tid`           INT(11) NOT NULL,                     -- FK → trainers.tid
  `uid`           INT(11) NOT NULL,                     -- FK → users.uid (Athlet)
  `assigned_date` DATE    NOT NULL,
  `notes`         TEXT    DEFAULT NULL,
  `created_at`    DATETIME DEFAULT current_timestamp(),
  `updated_at`    DATETIME DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid` (`uid`),                             -- Athlet kann nur 1 Trainer haben
  KEY `idx_trainer` (`tid`),
  KEY `idx_athlete` (`uid`),
  CONSTRAINT `trainer_athletes_ibfk_1` FOREIGN KEY (`tid`) REFERENCES `trainers` (`tid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `trainer_athletes_ibfk_2` FOREIGN KEY (`uid`) REFERENCES `users`   (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Gruppen von Athleten (erstellt von Trainer)
CREATE TABLE `athlete_groups` (
  `agid`               INT(11)      NOT NULL AUTO_INCREMENT,
  `name`               VARCHAR(255) NOT NULL,
  `description`        TEXT         DEFAULT NULL,
  `created_by_trainer` INT(11)      NOT NULL,           -- FK → users.uid (Trainer-User)
  `created_at`         DATETIME     DEFAULT current_timestamp(),
  `updated_at`         DATETIME     DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`agid`),
  KEY `created_by_trainer` (`created_by_trainer`),
  CONSTRAINT `athlete_groups_ibfk_1` FOREIGN KEY (`created_by_trainer`) REFERENCES `users` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Mitglieder einer Athleten-Gruppe (n:m)
CREATE TABLE `athlete_group_members` (
  `id`        INT(11)  NOT NULL AUTO_INCREMENT,
  `agid`      INT(11)  NOT NULL,                        -- FK → athlete_groups.agid
  `uid`       INT(11)  NOT NULL,                        -- FK → users.uid
  `joined_at` DATETIME DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `agid` (`agid`, `uid`),                    -- Athlet nur einmal pro Gruppe
  KEY `uid` (`uid`),
  CONSTRAINT `athlete_group_members_ibfk_1` FOREIGN KEY (`agid`) REFERENCES `athlete_groups` (`agid`) ON DELETE CASCADE,
  CONSTRAINT `athlete_group_members_ibfk_2` FOREIGN KEY (`uid`)  REFERENCES `users`          (`uid`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ────────────────────────────────────────────────────────────
--  SPORT & ÜBUNGEN
-- ────────────────────────────────────────────────────────────

-- Sportarten (aktuell: gym, basketball)
CREATE TABLE `sports` (
  `sid`         INT(11)      NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(100) NOT NULL,                  -- 'gym' | 'basketball'
  `description` TEXT         DEFAULT NULL,
  `icon_url`    VARCHAR(500) DEFAULT NULL,
  `created_at`  DATETIME     DEFAULT current_timestamp(),
  `updated_at`  DATETIME     DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`sid`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Schwierigkeitsgrade (1=beginner … 4=expert)
CREATE TABLE `difficulty_levels` (
  `dlid`        INT(11)     NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(50) NOT NULL,                   -- 'beginner' | 'intermediate' | 'advanced' | 'expert'
  `level_order` INT(11)     NOT NULL,                   -- 1–4 für Sortierung
  `description` TEXT        DEFAULT NULL,
  `created_at`  DATETIME    DEFAULT current_timestamp(),
  `updated_at`  DATETIME    DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`dlid`),
  UNIQUE KEY `name`        (`name`),
  UNIQUE KEY `level_order` (`level_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Muskelgruppen (chest, back, legs, arms, shoulders, core, glutes, full_body)
CREATE TABLE `muscle_groups` (
  `mgid`        INT(11)      NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(100) NOT NULL,
  `description` TEXT         DEFAULT NULL,
  `created_at`  DATETIME     DEFAULT current_timestamp(),
  `updated_at`  DATETIME     DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`mgid`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Medien-Dateien (Videos & Bilder für Übungen, Profilbilder, etc.)
CREATE TABLE `media` (
  `mid`              INT(11)      NOT NULL AUTO_INCREMENT,
  `type`             ENUM('image','video') NOT NULL,
  `filename`         VARCHAR(255) NOT NULL,
  `url`              VARCHAR(500) NOT NULL,              -- CDN-URL z.B. https://media.properform.app/...
  `size`             INT(11)      DEFAULT NULL,          -- Bytes
  `created_at`       DATETIME     DEFAULT current_timestamp(),
  `created_by_user`  INT(11)      DEFAULT NULL,          -- NULL = Owner-Upload
  `created_by_role`  VARCHAR(15)  NOT NULL DEFAULT 'owner',
  PRIMARY KEY (`mid`),
  UNIQUE KEY `filename` (`filename`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Übungen (Kern-Content der App)
CREATE TABLE `exercises` (
  `eid`              INT(11)      NOT NULL AUTO_INCREMENT,
  `name`             VARCHAR(255) NOT NULL,
  `description`      TEXT         DEFAULT NULL,
  `instructions`     TEXT         DEFAULT NULL,          -- Schritt-für-Schritt-Anleitung
  `sid`              INT(11)      NOT NULL,              -- FK → sports.sid
  `dlid`             INT(11)      NOT NULL,              -- FK → difficulty_levels.dlid
  `duration_minutes` INT(11)      DEFAULT NULL,          -- geschätzte Dauer
  `equipment_needed` VARCHAR(255) DEFAULT NULL,          -- z.B. 'Basketball', 'None'
  `created_by`       INT(11)      DEFAULT NULL,          -- FK → users.uid (wer hat die Übung erstellt)
  `created_at`       DATETIME     DEFAULT current_timestamp(),
  `updated_at`       DATETIME     DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `video_mid`        INT(11)      DEFAULT NULL,          -- FK → media.mid (Demo-Video)
  `thumbnail_mid`    INT(11)      DEFAULT NULL,          -- FK → media.mid (Vorschaubild)
  PRIMARY KEY (`eid`),
  KEY `created_by`         (`created_by`),
  KEY `idx_sport`          (`sid`),
  KEY `idx_difficulty`     (`dlid`),
  KEY `idx_name`           (`name`),
  KEY `fk_video_media`     (`video_mid`),
  KEY `fk_thumbnail_media` (`thumbnail_mid`),
  CONSTRAINT `exercises_ibfk_1`    FOREIGN KEY (`sid`)          REFERENCES `sports`           (`sid`)  ON UPDATE CASCADE,
  CONSTRAINT `exercises_ibfk_2`    FOREIGN KEY (`dlid`)         REFERENCES `difficulty_levels`(`dlid`) ON UPDATE CASCADE,
  CONSTRAINT `exercises_ibfk_3`    FOREIGN KEY (`created_by`)   REFERENCES `users`            (`uid`)  ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_video_media`      FOREIGN KEY (`video_mid`)    REFERENCES `media`            (`mid`)  ON DELETE SET NULL,
  CONSTRAINT `fk_thumbnail_media`  FOREIGN KEY (`thumbnail_mid`)REFERENCES `media`            (`mid`)  ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verknüpfung Übung ↔ Muskelgruppe (n:m, mit is_primary Flag)
CREATE TABLE `exercise_muscle_groups` (
  `id`         INT(11)  NOT NULL AUTO_INCREMENT,
  `eid`        INT(11)  NOT NULL,                       -- FK → exercises.eid
  `mgid`       INT(11)  NOT NULL,                       -- FK → muscle_groups.mgid
  `is_primary` TINYINT(1) DEFAULT 0,                    -- 1 = primäre Muskelgruppe
  `created_at` DATETIME DEFAULT current_timestamp(),
  `updated_at` DATETIME DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_exercise_muscle` (`eid`, `mgid`),
  KEY `idx_exercise`     (`eid`),
  KEY `idx_muscle_group` (`mgid`),
  CONSTRAINT `exercise_muscle_groups_ibfk_1` FOREIGN KEY (`eid`)  REFERENCES `exercises`     (`eid`)  ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `exercise_muscle_groups_ibfk_2` FOREIGN KEY (`mgid`) REFERENCES `muscle_groups` (`mgid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
--  TRAININGSPLÄNE
-- ────────────────────────────────────────────────────────────

-- Trainingspläne (erstellt von Athlet oder Trainer)
CREATE TABLE `training_plans` (
  `tpid`               INT(11)      NOT NULL AUTO_INCREMENT,
  `name`               VARCHAR(255) NOT NULL,
  `description`        TEXT         DEFAULT NULL,
  `sid`                INT(11)      NOT NULL,            -- FK → sports.sid
  `dlid`               INT(11)      DEFAULT NULL,        -- FK → difficulty_levels.dlid
  `duration_weeks`     INT(11)      DEFAULT NULL,        -- Gesamtdauer in Wochen
  `sessions_per_week`  INT(11)      DEFAULT NULL,
  `created_by_user`    INT(11)      DEFAULT NULL,        -- FK → users.uid (Athlet erstellt selbst)
  `created_by_trainer` INT(11)      DEFAULT NULL,        -- FK → trainers.tid (Trainer erstellt)
  `is_template`        TINYINT(1)   DEFAULT 0,           -- 1 = wiederverwendbare Vorlage
  `created_at`         DATETIME     DEFAULT current_timestamp(),
  `updated_at`         DATETIME     DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`tpid`),
  KEY `dlid`                 (`dlid`),
  KEY `idx_sport`            (`sid`),
  KEY `idx_created_by_user`  (`created_by_user`),
  KEY `idx_created_by_trainer`(`created_by_trainer`),
  CONSTRAINT `training_plans_ibfk_1` FOREIGN KEY (`sid`)                REFERENCES `sports`           (`sid`)  ON UPDATE CASCADE,
  CONSTRAINT `training_plans_ibfk_2` FOREIGN KEY (`dlid`)               REFERENCES `difficulty_levels`(`dlid`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `training_plans_ibfk_3` FOREIGN KEY (`created_by_user`)    REFERENCES `users`            (`uid`)  ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `training_plans_ibfk_4` FOREIGN KEY (`created_by_trainer`) REFERENCES `trainers`         (`tid`)  ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Übungen innerhalb eines Trainingsplans (welche Übung, welche Woche, welcher Tag, in welcher Reihenfolge)
CREATE TABLE `training_plan_exercises` (
  `id`             INT(11) NOT NULL AUTO_INCREMENT,
  `tpid`           INT(11) NOT NULL,                    -- FK → training_plans.tpid
  `eid`            INT(11) NOT NULL,                    -- FK → exercises.eid
  `week_number`    INT(11) DEFAULT NULL,                -- Woche im Plan
  `day_number`     INT(11) DEFAULT NULL,                -- Tag in der Woche (1–7)
  `exercise_order` INT(11) NOT NULL,                   -- Reihenfolge innerhalb der Session
  `sets`           INT(11) DEFAULT NULL,
  `reps`           INT(11) DEFAULT NULL,
  `duration_minutes` INT(11) DEFAULT NULL,
  `rest_seconds`   INT(11) DEFAULT NULL,               -- Pause zwischen Sets
  `notes`          TEXT    DEFAULT NULL,
  `created_at`     DATETIME DEFAULT current_timestamp(),
  `updated_at`     DATETIME DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_training_plan_exercise` (`tpid`, `week_number`, `day_number`, `eid`),
  KEY `idx_plan`     (`tpid`),
  KEY `idx_exercise` (`eid`),
  KEY `idx_week_day` (`week_number`, `day_number`),
  CONSTRAINT `training_plan_exercises_ibfk_1` FOREIGN KEY (`tpid`) REFERENCES `training_plans` (`tpid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `training_plan_exercises_ibfk_2` FOREIGN KEY (`eid`)  REFERENCES `exercises`      (`eid`)  ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trainingsplan einem einzelnen User zuweisen
CREATE TABLE `user_training_plans` (
  `id`                   INT(11)       NOT NULL AUTO_INCREMENT,
  `uid`                  INT(11)       NOT NULL,         -- FK → users.uid
  `tpid`                 INT(11)       NOT NULL,         -- FK → training_plans.tpid
  `assigned_by_trainer`  INT(11)       DEFAULT NULL,     -- FK → trainers.tid (NULL = selbst zugewiesen)
  `start_date`           DATE          NOT NULL,
  `end_date`             DATE          DEFAULT NULL,
  `completion_percentage`DECIMAL(5,2)  DEFAULT 0.00,
  `status`               ENUM('active','paused','completed') NOT NULL DEFAULT 'active',
  `is_selected`          TINYINT(1)   NOT NULL DEFAULT 0, -- aktuell aktiver Plan des Users
  `created_at`           DATETIME     DEFAULT current_timestamp(),
  `updated_at`           DATETIME     DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `assigned_by_trainer` (`assigned_by_trainer`),
  KEY `idx_user`  (`uid`),
  KEY `idx_plan`  (`tpid`),
  KEY `idx_dates` (`start_date`, `end_date`),
  CONSTRAINT `user_training_plans_ibfk_1` FOREIGN KEY (`uid`)                 REFERENCES `users`          (`uid`)  ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_training_plans_ibfk_2` FOREIGN KEY (`tpid`)                REFERENCES `training_plans` (`tpid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_training_plans_ibfk_3` FOREIGN KEY (`assigned_by_trainer`) REFERENCES `trainers`       (`tid`)  ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trainingsplan einer ganzen Athleten-Gruppe zuweisen
CREATE TABLE `group_training_plans` (
  `id`                  INT(11) NOT NULL AUTO_INCREMENT,
  `agid`                INT(11) NOT NULL,               -- FK → athlete_groups.agid
  `tpid`                INT(11) NOT NULL,               -- FK → training_plans.tpid
  `assigned_by_trainer` INT(11) DEFAULT NULL,           -- FK → users.uid
  `start_date`          DATE    NOT NULL,
  `created_at`          DATETIME DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `agid`                (`agid`),
  KEY `tpid`                (`tpid`),
  KEY `assigned_by_trainer` (`assigned_by_trainer`),
  CONSTRAINT `group_training_plans_ibfk_1` FOREIGN KEY (`agid`) REFERENCES `athlete_groups` (`agid`) ON DELETE CASCADE,
  CONSTRAINT `group_training_plans_ibfk_2` FOREIGN KEY (`tpid`) REFERENCES `training_plans` (`tpid`) ON DELETE CASCADE,
  CONSTRAINT `group_training_plans_ibfk_3` FOREIGN KEY (`assigned_by_trainer`) REFERENCES `users` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ────────────────────────────────────────────────────────────
--  WORKOUT-SESSIONS & LOGGING
-- ────────────────────────────────────────────────────────────

-- Eine aktive oder abgeschlossene Trainingseinheit
CREATE TABLE `workout_sessions` (
  `wsid`                 INT(11)  NOT NULL AUTO_INCREMENT,
  `uid`                  INT(11)  NOT NULL,              -- FK → users.uid
  `tpid`                 INT(11)  NOT NULL,              -- FK → training_plans.tpid
  `user_training_plan_id`INT(11)  DEFAULT NULL,          -- FK → user_training_plans.id
  `started_at`           DATETIME NOT NULL DEFAULT current_timestamp(),
  `finished_at`          DATETIME DEFAULT NULL,
  `status`               ENUM('in_progress','completed','cancelled') NOT NULL DEFAULT 'in_progress',
  `week_number`          INT(11)  DEFAULT NULL,
  `day_number`           INT(11)  DEFAULT NULL,
  `created_at`           DATETIME DEFAULT current_timestamp(),
  `updated_at`           DATETIME DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`wsid`),
  KEY `uid`                  (`uid`),
  KEY `tpid`                 (`tpid`),
  KEY `user_training_plan_id`(`user_training_plan_id`),
  CONSTRAINT `workout_sessions_ibfk_1` FOREIGN KEY (`uid`)                   REFERENCES `users`               (`uid`)  ON DELETE CASCADE,
  CONSTRAINT `workout_sessions_ibfk_2` FOREIGN KEY (`tpid`)                  REFERENCES `training_plans`      (`tpid`) ON DELETE CASCADE,
  CONSTRAINT `workout_sessions_ibfk_3` FOREIGN KEY (`user_training_plan_id`) REFERENCES `user_training_plans` (`id`)   ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Einzelne Übungen innerhalb einer Workout-Session (Plan vs. tatsächlich)
CREATE TABLE `workout_session_exercises` (
  `id`              INT(11)  NOT NULL AUTO_INCREMENT,
  `wsid`            INT(11)  NOT NULL,                  -- FK → workout_sessions.wsid
  `eid`             INT(11)  NOT NULL,                  -- FK → exercises.eid
  `planned_sets`    INT(11)  DEFAULT NULL,
  `planned_reps`    INT(11)  DEFAULT NULL,
  `actual_sets`     INT(11)  DEFAULT NULL,
  `actual_reps`     INT(11)  DEFAULT NULL,
  `duration_minutes`INT(11)  DEFAULT NULL,
  `rest_seconds`    INT(11)  DEFAULT NULL,
  `notes`           TEXT     DEFAULT NULL,
  `exercise_order`  INT(11)  NOT NULL,
  `is_completed`    TINYINT(1) NOT NULL DEFAULT 0,
  `created_at`      DATETIME DEFAULT current_timestamp(),
  `updated_at`      DATETIME DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `wsid` (`wsid`),
  KEY `eid`  (`eid`),
  CONSTRAINT `workout_session_exercises_ibfk_1` FOREIGN KEY (`wsid`) REFERENCES `workout_sessions` (`wsid`) ON DELETE CASCADE,
  CONSTRAINT `workout_session_exercises_ibfk_2` FOREIGN KEY (`eid`)  REFERENCES `exercises`        (`eid`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Detailliertes Logging einzelner Übungen (auch außerhalb eines Plans möglich)
CREATE TABLE `exercise_logs` (
  `elid`                     INT(11)      NOT NULL AUTO_INCREMENT,
  `uid`                      INT(11)      NOT NULL,      -- FK → users.uid
  `eid`                      INT(11)      NOT NULL,      -- FK → exercises.eid
  `training_plan_exercise_id`INT(11)      DEFAULT NULL,  -- FK → training_plan_exercises.id (optional)
  `completed_at`             DATETIME     NOT NULL,
  `duration_minutes`         INT(11)      DEFAULT NULL,
  `sets_completed`           INT(11)      DEFAULT NULL,
  `reps_completed`           INT(11)      DEFAULT NULL,
  `weight_used_kg`           DECIMAL(6,2) DEFAULT NULL,
  `difficulty_rating`        INT(11)      DEFAULT NULL,  -- 1–5 (User-Bewertung)
  `notes`                    TEXT         DEFAULT NULL,
  `created_at`               DATETIME     DEFAULT current_timestamp(),
  `updated_at`               DATETIME     DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`elid`),
  KEY `training_plan_exercise_id` (`training_plan_exercise_id`),
  KEY `idx_user`         (`uid`),
  KEY `idx_exercise`     (`eid`),
  KEY `idx_completed_at` (`completed_at`),
  KEY `idx_user_date`    (`uid`, `completed_at`),
  CONSTRAINT `exercise_logs_ibfk_1` FOREIGN KEY (`uid`)                       REFERENCES `users`                  (`uid`)  ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `exercise_logs_ibfk_2` FOREIGN KEY (`eid`)                       REFERENCES `exercises`              (`eid`)  ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `exercise_logs_ibfk_3` FOREIGN KEY (`training_plan_exercise_id`) REFERENCES `training_plan_exercises`(`id`)   ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Gewichts-Tracking (User loggt sein Körpergewicht)
CREATE TABLE `weight_logs` (
  `wlid`        INT(11)      NOT NULL AUTO_INCREMENT,
  `uid`         INT(11)      NOT NULL,                  -- FK → users.uid
  `weight_kg`   DECIMAL(5,2) NOT NULL,
  `measured_at` DATETIME     NOT NULL,
  `notes`       TEXT         DEFAULT NULL,
  `created_at`  DATETIME     DEFAULT current_timestamp(),
  `updated_at`  DATETIME     DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`wlid`),
  KEY `idx_user`        (`uid`),
  KEY `idx_measured_at` (`measured_at`),
  KEY `idx_user_date`   (`uid`, `measured_at`),
  CONSTRAINT `weight_logs_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
--  STREAKS (Trainings-Serien)
-- ────────────────────────────────────────────────────────────

-- Aktueller und längster Streak pro User und Typ (z.B. 'training')
CREATE TABLE `streaks` (
  `id`                 INT(11)  NOT NULL AUTO_INCREMENT,
  `uid`                INT(11)  NOT NULL,               -- FK → users.uid
  `type`               VARCHAR(50) NOT NULL,            -- z.B. 'training'
  `current_streak`     INT(11)  DEFAULT 0,
  `longest_streak`     INT(11)  DEFAULT 0,
  `last_activity_date` DATE     DEFAULT NULL,
  `created_at`         TIMESTAMP DEFAULT current_timestamp(),
  `updated_at`         TIMESTAMP DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_streak` (`uid`, `type`),
  CONSTRAINT `fk_streaks_user` FOREIGN KEY (`uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Einzelne Tage an denen ein Streak-Eintrag stattfand (für Rekonstruktion)
CREATE TABLE `streak_logs` (
  `id`            INT(11)  NOT NULL AUTO_INCREMENT,
  `uid`           INT(11)  NOT NULL,                   -- FK → users.uid
  `type`          VARCHAR(50) NOT NULL,
  `activity_date` DATE     NOT NULL,
  `created_at`    TIMESTAMP DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_daily_log` (`uid`, `type`, `activity_date`),  -- pro Tag nur 1 Eintrag
  CONSTRAINT `fk_streak_logs_user` FOREIGN KEY (`uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ────────────────────────────────────────────────────────────
--  NOTIFICATIONS & INTERESSEN
-- ────────────────────────────────────────────────────────────

-- Push-Benachrichtigungen (an alle, einzelne User, oder Trainer-Gruppen)
CREATE TABLE `notifications` (
  `nid`         INT(11)     NOT NULL AUTO_INCREMENT,
  `title`       VARCHAR(255) NOT NULL,
  `body`        TEXT        NOT NULL,
  `target_type` ENUM('all','single','trainer_group') NOT NULL,
  `target_id`   INT(11)     DEFAULT NULL,              -- uid oder agid je nach target_type
  `created_by`  INT(11)     NOT NULL,                 -- FK → users.uid
  `created_at`  TIMESTAMP   DEFAULT current_timestamp(),
  PRIMARY KEY (`nid`),
  KEY `fk_notification_creator` (`created_by`),
  CONSTRAINT `fk_notification_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`uid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Interessen-Kategorien (aktuell noch leer / für zukünftige Features)
CREATE TABLE `interests` (
  `iid`         INT(11)     NOT NULL AUTO_INCREMENT,
  `interest`    VARCHAR(50) NOT NULL,
  `description` TEXT        DEFAULT NULL,
  `created_at`  DATETIME    DEFAULT current_timestamp(),
  `updated_at`  DATETIME    DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`iid`),
  UNIQUE KEY `interest` (`interest`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verknüpfung User ↔ Interessen (n:m)
CREATE TABLE `user_has_interest` (
  `uid`        INT(11) NOT NULL,                       -- FK → users.uid
  `iid`        INT(11) NOT NULL,                       -- FK → interests.iid
  `created_at` DATETIME DEFAULT current_timestamp(),
  `updated_at` DATETIME DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`uid`, `iid`),
  KEY `iid` (`iid`),
  CONSTRAINT `user_has_interest_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `users`     (`uid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_has_interest_ibfk_2` FOREIGN KEY (`iid`) REFERENCES `interests` (`iid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  ENDE DES SCHEMAS
-- ============================================================