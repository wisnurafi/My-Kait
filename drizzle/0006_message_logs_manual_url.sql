-- Add encrypted manual URL columns to message_logs
-- Allows edit/delete for messages sent via manual URL (no saved webhook)
--> statement-breakpoint
ALTER TABLE "message_logs" ADD COLUMN IF NOT EXISTS "manual_url_encrypted" text;
--> statement-breakpoint
ALTER TABLE "message_logs" ADD COLUMN IF NOT EXISTS "manual_url_key_version" text;
