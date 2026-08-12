-- EduPortal schema
-- Tables are prefixed with eduportal_ because this TiDB Serverless database
-- ("test") is shared across projects — no CREATE DATABASE on the free tier,
-- so we namespace by prefix instead of by database.

CREATE TABLE IF NOT EXISTS eduportal_students (
    id                  BIGINT AUTO_RANDOM PRIMARY KEY,
    registration_number VARCHAR(50)  NOT NULL UNIQUE,
    full_name           VARCHAR(150) NOT NULL,
    email               VARCHAR(150) NOT NULL UNIQUE,
    date_of_birth       DATE         NOT NULL,
    gender              ENUM('male', 'female', 'other') NOT NULL,
    course_code         VARCHAR(10)  NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eduportal_accommodation_bookings (
    id                  BIGINT AUTO_RANDOM PRIMARY KEY,
    registration_number VARCHAR(50)  NOT NULL,
    full_name           VARCHAR(150) NOT NULL,
    gender              ENUM('male', 'female', 'other') NOT NULL,
    campus              VARCHAR(50)  NOT NULL,
    room_type           VARCHAR(20)  NOT NULL,
    status              ENUM('pending', 'confirmed', 'rejected') DEFAULT 'pending',
    created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_number) REFERENCES eduportal_students(registration_number)
);

CREATE TABLE IF NOT EXISTS eduportal_fee_records (
    id                  BIGINT AUTO_RANDOM PRIMARY KEY,
    student_id          VARCHAR(50)  NOT NULL,
    full_name           VARCHAR(150) NOT NULL,
    course_code         VARCHAR(10)  NOT NULL,
    semester             TINYINT      NOT NULL,
    tuition_fee         DECIMAL(10,2) NOT NULL DEFAULT 70000,
    statutory_fee       DECIMAL(10,2) NOT NULL DEFAULT 10000,
    discount            DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount        DECIMAL(10,2) NOT NULL,
    payment_method      ENUM('card', 'mpesa') NOT NULL,
    transaction_id      VARCHAR(100) NOT NULL,
    created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES eduportal_students(registration_number)
);