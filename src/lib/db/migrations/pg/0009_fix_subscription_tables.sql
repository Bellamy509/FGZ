DO $$ 
BEGIN
    -- Drop existing tables and indexes if they exist
    DROP INDEX IF EXISTS idx_user_credits_user_id;
    DROP INDEX IF EXISTS idx_subscriptions_user_id;
    DROP TABLE IF EXISTS "user_credits" CASCADE;
    DROP TABLE IF EXISTS "subscriptions" CASCADE;

    -- Create subscriptions table
    CREATE TABLE IF NOT EXISTS "subscriptions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "stripe_customer_id" text,
        "stripe_price_id" text,
        "stripe_subscription_id" text,
        "status" text NOT NULL,
        "current_period_start" timestamp,
        "current_period_end" timestamp,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user
            FOREIGN KEY(user_id) 
            REFERENCES "user"(id)
            ON DELETE CASCADE
    );

    -- Create user_credits table
    CREATE TABLE IF NOT EXISTS "user_credits" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "credits" integer NOT NULL DEFAULT 0,
        "is_initial_credit" boolean DEFAULT false,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user_credits
            FOREIGN KEY(user_id) 
            REFERENCES "user"(id)
            ON DELETE CASCADE
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);

END $$; 