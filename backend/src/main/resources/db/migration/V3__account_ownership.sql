
-- SizeSure Implementation 02
-- Phase 2: Account-based data ownership
-- Preserve existing records and previously applied migrations.

ALTER TABLE measurement_profiles
    ADD COLUMN owner_account_id VARCHAR(36) NULL;

ALTER TABLE seller_charts
    ADD COLUMN owner_account_id VARCHAR(36) NULL;

ALTER TABLE comparison_runs
    ADD COLUMN buyer_account_id VARCHAR(36) NULL;

-- Indexes for account-specific queries.

CREATE INDEX idx_profiles_owner
    ON measurement_profiles(owner_account_id);

CREATE INDEX idx_charts_owner
    ON seller_charts(owner_account_id);

CREATE INDEX idx_comparisons_buyer
    ON comparison_runs(buyer_account_id);

-- Link ownership to authenticated accounts.

ALTER TABLE measurement_profiles
    ADD CONSTRAINT fk_profiles_owner
    FOREIGN KEY (owner_account_id)
    REFERENCES app_accounts(id);

ALTER TABLE seller_charts
    ADD CONSTRAINT fk_charts_owner
    FOREIGN KEY (owner_account_id)
    REFERENCES app_accounts(id);

ALTER TABLE comparison_runs
    ADD CONSTRAINT fk_comparisons_buyer
    FOREIGN KEY (buyer_account_id)
    REFERENCES app_accounts(id);
