CREATE TABLE jwt (
	jti VARCHAR(64) PRIMARY KEY NOT NULL,
	expires_at TIMESTAMP,
	INDEX idx_jti (jti),
	INDEX idx_expires_at (expires_at)
) ENGINE = InnoDB 
  ROW_FORMAT = COMPRESSED
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
