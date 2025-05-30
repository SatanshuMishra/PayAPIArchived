CREATE TABLE role (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    KEY idx_name (name)
) ENGINE = InnoDB 
  ROW_FORMAT = COMPRESSED
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE permission (
  permission_id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(255) NOT NULL,  
  category VARCHAR(32) NOT NULL,     
  method VARCHAR(32) NOT NULL,       
  endpoint_path VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  UNIQUE KEY endpoint (category, method, endpoint_path),
  UNIQUE KEY code (category, code),
  KEY idx_code (code),
  KEY idx_category_method (category, method)
) ENGINE = InnoDB;

INSERT INTO permission (code, category, method, endpoint_path, description) 
VALUES ('AUTH_TOKEN_CREATE', 'AUTH', 'POST', '/auth/tokens', 'Create a new JWT');

INSERT INTO permission (code, category, method, endpoint_path, description) 
VALUES ('PING_PONG', 'PING', 'GET', '/ping', 'Ping the server. See if anything comes back.');

INSERT INTO permission (code, category, method, endpoint_path, description) 
VALUES ('CARD_GET_CUSTOMER', 'CUSTOMERS', 'GET', '/customers/payment-method', 'Get a card assigned to Customer');

INSERT INTO permission (code, category, method, endpoint_path, description) 
VALUES ('CUSTOMER_CREATE', 'CUSTOMERS', 'POST', '/customers', 'Create new Customer');

INSERT INTO permission (code, category, method, endpoint_path, description) 
VALUES ('CARD_CREATE', 'PAYMENTMETHODS', 'POST', '/paymentmethods/card' 'Create new card');

INSERT INTO permission (code, category, method, endpoint_path, description) 
VALUES ('CARD_VERIFY', 'PAYMENTMETHODS', 'GET', '/paymentmethods/card', 'Check if Card exists');

INSERT INTO permission (code, category, method, endpoint_path, description) 
VALUES ('TRANSACTION_CREATE', 'TRANSACTION', 'POST', '/transactions', 'Create new Transaction');

CREATE TABLE role_permission (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permission(permission_id) ON DELETE CASCADE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB
  ROW_FORMAT = COMPRESSED
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


INSERT INTO role (role_id, name, description, is_system_role)
VALUES (1, 'Administrator', 'Full system access with all permissions', TRUE);


INSERT INTO role_permission (role_id, permission_id)
VALUES 
    (1, 1), 
    (1, 2), 
    (1, 3), 
    (1, 4), 
    (1, 5), 
    (1, 6); 

CREATE TABLE user (
    id BINARY(16) PRIMARY KEY,
    username VARCHAR(320) NOT NULL UNIQUE,
    password VARCHAR(320) NOT NULL,
    role_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME NULL,
    INDEX idx_username (username),
    INDEX idx_role_id (role_id),
    FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE RESTRICT
) ENGINE = InnoDB 
  ROW_FORMAT = COMPRESSED
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO user (id, username, password, role_id) 
VALUES (UUID_TO_BIN('52afd119-dc7d-422f-8930-b8dec0dfc999'), 'SatanshuMishra', 'Test@12345', 1);

CREATE TABLE api_key (
    id BINARY(16) PRIMARY KEY,
    key_hash VARCHAR(255) NOT NULL,  
    name VARCHAR(64) NOT NULL,        
    role_id INT NOT NULL,             
    last_used DATETIME NULL,
    expires_at DATETIME NULL,        
	is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_key_hash (key_hash),
    INDEX idx_role_id (role_id),
    FOREIGN KEY (role_id) REFERENCES role(role_id)
) ENGINE = InnoDB 
  ROW_FORMAT = COMPRESSED
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

