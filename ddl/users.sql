CREATE TABLE role (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_name (name)
) ENGINE = InnoDB 
  ROW_FORMAT = COMPRESSED
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE role_permission (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permission(permission_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

CREATE TABLE permission (
  permission_id INT PRIMARY KEY,
  code VARCHAR(64) NOT NULL UNIQUE,  
  category VARCHAR(32) NOT NULL,     
  action VARCHAR(32) NOT NULL,       
  description VARCHAR(255),
  KEY idx_code (code),
  KEY idx_category_action (category, action)
) ENGINE = InnoDB;

INSERT INTO permission (permission_id, code, category, action, description) 
VALUES (1, 'CARD_GET_CUSTOMER', 'CARD', 'GET', 'Get Card assigned to Customer');

INSERT INTO permission (permission_id, code, category, action, description) 
VALUES (2, 'CUSTOMER_CREATE', 'CUSTOMER', 'CREATE', 'Create new Customer');

INSERT INTO permission (permission_id, code, category, action, description) 
VALUES (3, 'PAYMENT_METHOD_CREATE', 'PAYMENT', 'CREATE', 'Create New payment method');

INSERT INTO permission (permission_id, code, category, action, description) 
VALUES (4, 'CARD_VERIFY', 'CARD', 'GET', 'Check if Card exists');

INSERT INTO permission (permission_id, code, category, action, description) 
VALUES (5, 'TRANSACTION_CREATE', 'TRANSACTION', 'CREATE', 'Create new Transaction');

INSERT INTO permission (permission_id, code, category, action, description) 
VALUES (6, 'AUTH_TOKEN_CREATE', 'AUTH', 'CREATE', 'CREATE new JWT');

CREATE TABLE user (
    id BINARY(16) PRIMARY KEY,
    username VARCHAR(320) NOT NULL UNIQUE,
    password VARCHAR(320) NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_role_id (role_id),
    FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE RESTRICT
) ENGINE = InnoDB 
  ROW_FORMAT = COMPRESSED
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO user (id, username, password, role_id) 
VALUES (UUID_TO_BIN('52afd119-dc7d-422f-8930-b8dec0dfc999'), 'SatanshuMishra', 'Test@12345', 1);
