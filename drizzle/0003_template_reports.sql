CREATE TYPE "public"."report_status" AS ENUM('pending', 'reviewed', 'dismissed', 'actioned');--> statement-breakpoint
CREATE TABLE "template_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"reporter_user_id" text,
	"reason" text NOT NULL,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "template_reports_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "template_reports_reporter_user_id_users_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "template_reports_template_id_idx" ON "template_reports" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "template_reports_status_idx" ON "template_reports" USING btree ("status");
