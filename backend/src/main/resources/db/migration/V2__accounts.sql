-- Additive migration. Does not modify V1 or existing measurement records.
CREATE TABLE app_accounts (
 id VARCHAR(36) PRIMARY KEY,
 email VARCHAR(254) NOT NULL UNIQUE,
 display_name VARCHAR(120) NOT NULL,
 password_hash VARCHAR(100) NOT NULL,
 account_role VARCHAR(12) NOT NULL,
 created_at DATETIME(6) NOT NULL,
 CONSTRAINT chk_account_role CHECK (account_role IN ('BUYER','SELLER'))
);
