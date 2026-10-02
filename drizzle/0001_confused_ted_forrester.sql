ALTER TABLE "message_logs" ADD COLUMN "idempotency_key" text;--> statement-breakpoint
CREATE UNIQUE INDEX "message_logs_idempotency_idx" ON "message_logs" USING btree ("user_id","idempotency_key");