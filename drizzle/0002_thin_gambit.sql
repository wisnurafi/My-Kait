CREATE TABLE "template_folders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "folder_id" text;--> statement-breakpoint
ALTER TABLE "template_folders" ADD CONSTRAINT "template_folders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "template_folders_user_id_idx" ON "template_folders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "template_folders_name_idx" ON "template_folders" USING btree ("user_id","name");--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_folder_id_template_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."template_folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "templates_folder_id_idx" ON "templates" USING btree ("folder_id");