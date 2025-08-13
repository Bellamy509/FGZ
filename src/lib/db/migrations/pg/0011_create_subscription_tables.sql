-- Create subscriptions table
CREATE TABLE IF NOT EXISTS "subscriptions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "stripe_customer_id" text,
    "stripe_price_id" text,
    "stripe_subscription_id" text,
    "status" text NOT NULL,
    "current_period_start" timestamp,
    "current_period_end" timestamp,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Create user_credits table
CREATE TABLE IF NOT EXISTS "user_credits" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "credits" integer NOT NULL DEFAULT 0,
    "is_initial_credit" boolean DEFAULT false,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_subscriptions_user_id" ON "subscriptions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_credits_user_id" ON "user_credits"("user_id"); 