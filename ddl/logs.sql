CREATE TABLE jwt_log_events (
    id BINARY(16) PRIMARY KEY,
    event_type TINYINT UNSIGNED NOT NULL COMMENT '1: CREATION, 2: VERIFICATION',
    success TINYINT(1) NOT NULL DEFAULT 0,
    reason VARCHAR(255),
    ip VARBINARY(16) NOT NULL, -- Use INET6_ATON(ip) to insert
    browser_fingerprint VARCHAR(64) NOT NULL,
    actor_id BINARY(16),
    timestamp DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_actor_id (actor_id),
    INDEX idx_timestamp (timestamp)
) ENGINE = InnoDB
  ROW_FORMAT = COMPRESSED
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE jwt_log_details (
    log_id BINARY(16) PRIMARY KEY,
    jti BINARY(16) NOT NULL,
    command TINYINT UNSIGNED NOT NULL,
    customer_email VARCHAR(320) NOT NULL COMMENT 'WILL BE PARTIALLY HIDDEN e.g., s**********a@outlook.com',
    FOREIGN KEY (log_id) REFERENCES jwt_log_events(id) ON DELETE CASCADE,
    INDEX idx_jti (jti)
) ENGINE = InnoDB
  ROW_FORMAT = COMPRESSED
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
