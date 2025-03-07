CREATE TABLE customer (
    id BINARY(16) NOT NULL PRIMARY KEY,
    banquest_customer_ID INT NOT NULL,
    email VARCHAR(320) NOT NULL,
    UNIQUE KEY unique_banquest (banquest_customer_ID),
    UNIQUE KEY unique_email (email),
    INDEX idx_banquest_customer_id (banquest_customer_ID),
    INDEX idx_email (email)
) ENGINE = InnoDB 
  ROW_FORMAT = COMPRESSED
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE payment_card (
	id BINARY(16) PRIMARY KEY,
	banquest_reference VARCHAR(20) NOT NULL,
	last4 CHAR(4) NOT NULL,
	avs_zip CHAR(6) DEFAULT NULL,
	expiry_month TINYINT NOT NULL CHECK ( expiry_month BETWEEN 1 AND 12 ),
	expiry_year SMALLINT NOT NULL CHECK ( expiry_year >= 2020 ),
	card_type CHAR(1) NOT NULL CHECK (card_type IN ('V', 'M')) COMMENT 'V=Visa, M=Mastercard',
	INDEX idx_bq_token (banquest_reference),
  INDEX idx_bq_zip (avs_zip),
	INDEX idx_card_num_type (last4, card_type),
	INDEX idx_exp (expiry_month, expiry_year)
) ENGINE = InnoDB 
  ROW_FORMAT = COMPRESSED
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE customer_payment_card (
	customer_ID BINARY(16),
	payment_ID BINARY(16),
	banquest_payment_ID INT NOT NULL,
	PRIMARY KEY (customer_ID, payment_ID),
	FOREIGN KEY(customer_ID) REFERENCES customer(id) ON DELETE CASCADE,
	FOREIGN KEY(payment_ID) REFERENCES payment_card(id) ON DELETE CASCADE
) ENGINE = InnoDB 
  ROW_FORMAT = COMPRESSED
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE VIEW customer_card_lookup AS
SELECT 
    cpc.customer_ID,
    cpc.banquest_payment_ID,
    pc.last4,
    pc.card_type,
    pc.expiry_month,
    pc.expiry_year
FROM 
    customer_payment_card cpc
JOIN 
    payment_card pc ON cpc.payment_ID = pc.id;
