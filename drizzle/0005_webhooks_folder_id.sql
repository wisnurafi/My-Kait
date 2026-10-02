-- Add missing folder_id column to webhooks table
-- (schema.ts defines it, but no prior migration created it)
--> statement-breakpoint
ALTER TABLE "webhooks" ADD COLUMN IF NOT EXISTS "folder_id" text;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_folder_id_template_folders_id_fk"
    FOREIGN KEY ("folder_id") REFERENCES "public"."template_folders"("id") ON DELETE set null;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "webhooks_folder_id_idx" ON "webhooks" USING btree ("folder_id");
