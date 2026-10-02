CREATE TYPE "public"."message_mode" AS ENUM('normal', 'embed', 'both');--> statement-breakpoint
CREATE TYPE "public"."message_status" AS ENUM('sent', 'failed', 'rate_limited', 'edited', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."webhook_status" AS ENUM('active', 'invalid', 'rate_limited', 'unchecked');--> statement-breakpoint
CREATE TABLE "message_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"webhook_id" text,
	"webhook_name_snapshot" text NOT NULL,
	"mode" "message_mode" NOT NULL,
	"payload" jsonb,
	"status" "message_status" NOT NULL,
	"http_status" integer,
	"latency_ms" integer,
	"discord_message_id" text,
	"error" text,
	"source" text DEFAULT 'send' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_shares" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"slug" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"import_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"tags" text[] DEFAULT '{}',
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"discord_id" text NOT NULL,
	"username" text NOT NULL,
	"avatar" text,
	"global_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_discord_id_unique" UNIQUE("discord_id")
);
--> statement-breakpoint
CREATE TABLE "webhook_checks" (
	"id" text PRIMARY KEY NOT NULL,
	"webhook_id" text NOT NULL,
	"status" "webhook_status" NOT NULL,
	"http_status" integer,
	"latency_ms" integer,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"discord_webhook_id" text,
	"url_encrypted" text NOT NULL,
	"key_version" text NOT NULL,
	"last_status" "webhook_status" DEFAULT 'unchecked' NOT NULL,
	"last_checked_at" timestamp with time zone,
	"channel_id" text,
	"channel_name" text,
	"guild_id" text,
	"guild_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "message_logs" ADD CONSTRAINT "message_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_logs" ADD CONSTRAINT "message_logs_webhook_id_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."webhooks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_shares" ADD CONSTRAINT "template_shares_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_checks" ADD CONSTRAINT "webhook_checks_webhook_id_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."webhooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "message_logs_user_created_idx" ON "message_logs" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "message_logs_user_status_idx" ON "message_logs" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "message_logs_webhook_id_idx" ON "message_logs" USING btree ("webhook_id");--> statement-breakpoint
CREATE UNIQUE INDEX "template_shares_slug_idx" ON "template_shares" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "templates_user_id_idx" ON "templates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "templates_name_idx" ON "templates" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "webhook_checks_webhook_id_idx" ON "webhook_checks" USING btree ("webhook_id");--> statement-breakpoint
CREATE INDEX "webhook_checks_created_at_idx" ON "webhook_checks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "webhooks_user_id_idx" ON "webhooks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "webhooks_discord_webhook_id_idx" ON "webhooks" USING btree ("discord_webhook_id");--> statement-breakpoint
CREATE INDEX "webhooks_name_idx" ON "webhooks" USING btree ("user_id","name");