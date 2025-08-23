-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon_url" VARCHAR(255),
    "is_usable" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "quantity_used" INTEGER NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "config" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_activity_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "activity_id" UUID NOT NULL,
    "record_date" DATE NOT NULL,
    "data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activity_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "from_item_id" UUID NOT NULL,
    "to_item_id" UUID NOT NULL,
    "from_quantity" INTEGER NOT NULL,
    "to_quantity" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exchange_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "idx_users_username" ON "users"("username");

-- CreateIndex
CREATE INDEX "idx_users_role" ON "users"("role");

-- CreateIndex
CREATE INDEX "idx_items_name" ON "items"("name");

-- CreateIndex
CREATE INDEX "idx_items_is_usable" ON "items"("is_usable");

-- CreateIndex
CREATE UNIQUE INDEX "user_items_user_id_item_id_key" ON "user_items"("user_id", "item_id");

-- CreateIndex
CREATE INDEX "idx_user_items_user_id" ON "user_items"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_items_item_id" ON "user_items"("item_id");

-- CreateIndex
CREATE INDEX "idx_usage_history_user_id" ON "usage_history"("user_id");

-- CreateIndex
CREATE INDEX "idx_usage_history_item_id" ON "usage_history"("item_id");

-- CreateIndex
CREATE INDEX "idx_usage_history_used_at" ON "usage_history"("used_at");

-- CreateIndex
CREATE INDEX "idx_activities_type" ON "activities"("type");

-- CreateIndex
CREATE INDEX "idx_activities_is_active" ON "activities"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "user_activity_records_user_id_activity_id_record_date_key" ON "user_activity_records"("user_id", "activity_id", "record_date");

-- CreateIndex
CREATE INDEX "idx_user_activity_records_user_id" ON "user_activity_records"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_activity_records_activity_id" ON "user_activity_records"("activity_id");

-- CreateIndex
CREATE INDEX "idx_user_activity_records_record_date" ON "user_activity_records"("record_date");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rules_from_item_id_to_item_id_key" ON "exchange_rules"("from_item_id", "to_item_id");

-- CreateIndex
CREATE INDEX "idx_exchange_rules_from_item_id" ON "exchange_rules"("from_item_id");

-- CreateIndex
CREATE INDEX "idx_exchange_rules_to_item_id" ON "exchange_rules"("to_item_id");

-- CreateIndex
CREATE INDEX "idx_exchange_rules_is_active" ON "exchange_rules"("is_active");

-- AddForeignKey
ALTER TABLE "user_items" ADD CONSTRAINT "user_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_items" ADD CONSTRAINT "user_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_history" ADD CONSTRAINT "usage_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_history" ADD CONSTRAINT "usage_history_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activity_records" ADD CONSTRAINT "user_activity_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activity_records" ADD CONSTRAINT "user_activity_records_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_rules" ADD CONSTRAINT "exchange_rules_from_item_id_fkey" FOREIGN KEY ("from_item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_rules" ADD CONSTRAINT "exchange_rules_to_item_id_fkey" FOREIGN KEY ("to_item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON "users" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_items_updated_at 
    BEFORE UPDATE ON "user_items" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();