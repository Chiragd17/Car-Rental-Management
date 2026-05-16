-- ============================================================
-- Car Rental Management System — MySQL 8.0 Schema
-- Run once:  mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS car_rental_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE car_rental_db;

-- ──────────────────────────────────────────────────────────────
-- 1. EMPLOYEE  (self-referencing FK for manager hierarchy)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employee (
  emp_id          INT           AUTO_INCREMENT PRIMARY KEY,
  first_name      VARCHAR(50)   NOT NULL,
  last_name       VARCHAR(50)   NOT NULL,
  salary          DECIMAL(10,2) NOT NULL,
  joined_date     DATE          NOT NULL,
  responsibility  VARCHAR(100)  NOT NULL,
  contact_no      VARCHAR(20)   NOT NULL,
  house_no        VARCHAR(20),
  city            VARCHAR(50),
  country         VARCHAR(50),
  -- Self-referencing FK: a manager is also an employee
  manager_id      INT           NULL,

  INDEX idx_manager (manager_id),

  CONSTRAINT fk_employee_manager
    FOREIGN KEY (manager_id) REFERENCES employee(emp_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
-- 2. CUSTOMER  (linked to Supabase Auth via supabase_uid)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customer (
  cust_id         INT           AUTO_INCREMENT PRIMARY KEY,
  -- Supabase UUID — one-to-one mapping with Supabase Auth user
  supabase_uid    VARCHAR(255)  NOT NULL UNIQUE,
  first_name      VARCHAR(50)   NOT NULL,
  last_name       VARCHAR(50)   NOT NULL,
  email           VARCHAR(255)  UNIQUE,
  contact_no      VARCHAR(20),
  driving_license VARCHAR(50)   UNIQUE,
  house_no        VARCHAR(20),
  city            VARCHAR(50),
  country         VARCHAR(50),
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  is_admin        BOOLEAN       DEFAULT FALSE,

  INDEX idx_supabase_uid (supabase_uid)
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
-- 3. VEHICLE  (registered & managed by employees)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicle (
  vehicle_id      INT             AUTO_INCREMENT PRIMARY KEY,
  plate_no        VARCHAR(20)     NOT NULL UNIQUE,
  model           VARCHAR(100)    NOT NULL,
  mileage         INT             NOT NULL DEFAULT 0,
  daily_price     DECIMAL(10,2)   NOT NULL,
  `condition`     ENUM('Excellent','Good','Fair','Poor') NOT NULL DEFAULT 'Good',
  availability    BOOLEAN         NOT NULL DEFAULT TRUE,
  -- Which employee registered this vehicle
  registered_by   INT             NULL,
  -- Which employee currently manages this vehicle
  managed_by      INT             NULL,
  vehicle_type    VARCHAR(50)     DEFAULT 'Sedan',
  image_url       VARCHAR(255)    NULL,
  location        VARCHAR(100)    DEFAULT 'Mumbai',

  INDEX idx_availability (availability),

  CONSTRAINT fk_vehicle_registered
    FOREIGN KEY (registered_by) REFERENCES employee(emp_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  CONSTRAINT fk_vehicle_managed
    FOREIGN KEY (managed_by) REFERENCES employee(emp_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
-- 4. RESERVATION  (customer ↔ vehicle, with generated column)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservation (
  reserve_id          INT         AUTO_INCREMENT PRIMARY KEY,
  reserve_date        DATE        NOT NULL,
  pickup_date         DATE        NOT NULL,
  return_date         DATE        NOT NULL,
  -- Derived column: MySQL auto-calculates & stores the value
  number_of_days      INT         GENERATED ALWAYS AS (DATEDIFF(return_date, pickup_date)) STORED,
  pickup_location     VARCHAR(150) NOT NULL,
  cancellation_details TEXT       NULL,
  cancellation_reason  VARCHAR(100) NULL,
  refund_amount        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  refund_percentage    INT          NOT NULL DEFAULT 0,
  -- Foreign keys
  cust_id             INT         NOT NULL,
  vehicle_id          INT         NOT NULL,

  INDEX idx_cust (cust_id),
  INDEX idx_vehicle (vehicle_id),

  CONSTRAINT fk_reservation_customer
    FOREIGN KEY (cust_id) REFERENCES customer(cust_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_reservation_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
-- 5. RENT  (payment record tied to a reservation, 1-to-1)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rent (
  rent_id             INT             AUTO_INCREMENT PRIMARY KEY,
  pay_method          ENUM('Cash','Card','Online','UPI') NOT NULL,
  down_payment        DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  refund              DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  damage_compensation DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  damage_description  TEXT            NULL,
  -- total_pay is calculated in application code (NOT stored)
  -- Formula: (number_of_days × daily_price) + damage_compensation - refund
  total_pay           DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  pay_date            DATE            NOT NULL,
  -- Foreign keys
  cust_id             INT             NOT NULL,
  vehicle_id          INT             NOT NULL,
  -- One rent per reservation (UNIQUE constraint)
  reserve_id          INT             NOT NULL UNIQUE,

  INDEX idx_rent_cust (cust_id),
  INDEX idx_rent_vehicle (vehicle_id),

  CONSTRAINT fk_rent_customer
    FOREIGN KEY (cust_id) REFERENCES customer(cust_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_rent_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_rent_reservation
    FOREIGN KEY (reserve_id) REFERENCES reservation(reserve_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;
