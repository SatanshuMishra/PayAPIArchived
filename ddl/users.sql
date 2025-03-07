CREATE TABLE role (
	name VARCHAR(64) PRIMARY KEY,
	permission_level INT NOT NULL DEFAULT 0,
	INDEX idx_name (name),
	INDEX idx_level (permission_level)
) ENGINE = InnoDB 
  ROW_FORMAT = COMPRESSED
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE user (
	id BINARY(16) PRIMARY KEY,
	username VARCHAR(320) NOT NULL,
	password VARCHAR(320) NOT NULL,
	role VARCHAR(64) NOT NULL,
	INDEX idx_username (username),
	INDEX idx_role (role),
	FOREIGN KEY(role) REFERENCES role(name)
) ENGINE = InnoDB 
  ROW_FORMAT = COMPRESSED
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

  INSERT INTO role (name, permission_level) VALUE ('Administrator', 2);
  INSERT INTO user (id, username, password, role) VALUES (UUID_TO_BIN('52afd119-dc7d-422f-8930-b8dec0dfc999'), 'SatanshuMishra', 'Test@12345', 'Administrator');
