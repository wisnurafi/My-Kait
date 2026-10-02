CREATE TABLE "webhook_health_alerts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"webhook_id" text NOT NULL,
	"type" text NOT NULL,
	"message" text,
	"acknowledged_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "webhook_health_alerts" ADD CONSTRAINT "webhook_health_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_health_alerts" ADD CONSTRAINT "webhook_health_alerts_webhook_id_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."webhooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "webhook_health_alerts_user_id_idx" ON "webhook_health_alerts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "webhook_health_alerts_webhook_id_idx" ON "webhook_health_alerts" USING btree ("webhook_id");