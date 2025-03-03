CREATE TABLE customer (
    banquestID VARCHAR(320) NOT NULL,
    email VARCHAR(320) NOT NULL,
    PRIMARY KEY (banquestID, email)
) ENGINE = InnoDB 
  ROW_FORMAT = COMPRESSED
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
