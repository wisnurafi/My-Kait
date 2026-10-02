-- Row-Level Security (RLS) — defense-in-depth layer.
--
-- The app enforces ownership in the application layer (requireAuth + user_id
-- filters on every query). These policies are a SECOND layer: they only
-- restrict access when the app explicitly sets `app.current_user_id`
-- (see withRlsContext() in src/lib/db.ts). When the setting is absent,
-- policies permit access so existing app queries keep working unchanged.
--
-- Rationale: the app uses Neon's HTTP driver (@neondatabase/serverless),
-- where each query is a separate HTTP request and SET does not persist
-- across queries. Per-transaction `SET LOCAL app.current_user_id` is the
-- supported way to activate RLS enforcement for sensitive operations.

--> statement-breakpoint

-- Enable RLS on all tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "webhooks" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "webhook_checks" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "webhook_health_alerts" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "template_folders" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "templates" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "template_shares" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "template_reports" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "message_logs" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

-- users: auth needs lookup by discord_id/id, so SELECT stays open;
-- writes are restricted to the owning user when context is set.
CREATE POLICY "users_select" ON "users"
  FOR SELECT USING (true);
--> statement-breakpoint
CREATE POLICY "users_write_own" ON "users"
  FOR UPDATE USING (
    current_setting('app.current_user_id', true) IS NULL
    OR id = current_setting('app.current_user_id', true)
  )
  WITH CHECK (
    current_setting('app.current_user_id', true) IS NULL
    OR id = current_setting('app.current_user_id', true)
  );
--> statement-breakpoint
CREATE POLICY "users_delete_own" ON "users"
  FOR DELETE USING (
    current_setting('app.current_user_id', true) IS NULL
    OR id = current_setting('app.current_user_id', true)
  );
--> statement-breakpoint

-- webhooks: owner-only when context is set
CREATE POLICY "webhooks_owner" ON "webhooks"
  FOR ALL USING (
    current_setting('app.current_user_id', true) IS NULL
    OR user_id = current_setting('app.current_user_id', true)
  )
  WITH CHECK (
    current_setting('app.current_user_id', true) IS NULL
    OR user_id = current_setting('app.current_user_id', true)
  );
--> statement-breakpoint

-- webhook_checks: owned via parent webhook
CREATE POLICY "webhook_checks_owner" ON "webhook_checks"
  FOR ALL USING (
    current_setting('app.current_user_id', true) IS NULL
    OR EXISTS (
      SELECT 1 FROM "webhooks" w
      WHERE w.id = "webhook_checks".webhook_id
        AND w.user_id = current_setting('app.current_user_id', true)
    )
  )
  WITH CHECK (
    current_setting('app.current_user_id', true) IS NULL
    OR EXISTS (
      SELECT 1 FROM "webhooks" w
      WHERE w.id = "webhook_checks".webhook_id
        AND w.user_id = current_setting('app.current_user_id', true)
    )
  );
--> statement-breakpoint

-- webhook_health_alerts: owner-only when context is set
CREATE POLICY "webhook_health_alerts_owner" ON "webhook_health_alerts"
  FOR ALL USING (
    current_setting('app.current_user_id', true) IS NULL
    OR user_id = current_setting('app.current_user_id', true)
  )
  WITH CHECK (
    current_setting('app.current_user_id', true) IS NULL
    OR user_id = current_setting('app.current_user_id', true)
  );
--> statement-breakpoint

-- template_folders: owner-only when context is set
CREATE POLICY "template_folders_owner" ON "template_folders"
  FOR ALL USING (
    current_setting('app.current_user_id', true) IS NULL
    OR user_id = current_setting('app.current_user_id', true)
  )
  WITH CHECK (
    current_setting('app.current_user_id', true) IS NULL
    OR user_id = current_setting('app.current_user_id', true)
  );
--> statement-breakpoint

-- templates: owner-only when context is set
CREATE POLICY "templates_owner" ON "templates"
  FOR ALL USING (
    current_setting('app.current_user_id', true) IS NULL
    OR user_id = current_setting('app.current_user_id', true)
  )
  WITH CHECK (
    current_setting('app.current_user_id', true) IS NULL
    OR user_id = current_setting('app.current_user_id', true)
  );
--> statement-breakpoint

-- template_shares: public read (shared links like /t/[slug] work logged-out);
-- writes restricted to the template owner when context is set.
CREATE POLICY "template_shares_public_read" ON "template_shares"
  FOR SELECT USING (true);
--> statement-breakpoint
CREATE POLICY "template_shares_owner_write" ON "template_shares"
  FOR INSERT WITH CHECK (
    current_setting('app.current_user_id', true) IS NULL
    OR EXISTS (
      SELECT 1 FROM "templates" t
      WHERE t.id = "template_shares".template_id
        AND t.user_id = current_setting('app.current_user_id', true)
    )
  );
--> statement-breakpoint
CREATE POLICY "template_shares_owner_update" ON "template_shares"
  FOR UPDATE USING (
    current_setting('app.current_user_id', true) IS NULL
    OR EXISTS (
      SELECT 1 FROM "templates" t
      WHERE t.id = "template_shares".template_id
        AND t.user_id = current_setting('app.current_user_id', true)
    )
  )
  WITH CHECK (
    current_setting('app.current_user_id', true) IS NULL
    OR EXISTS (
      SELECT 1 FROM "templates" t
      WHERE t.id = "template_shares".template_id
        AND t.user_id = current_setting('app.current_user_id', true)
    )
  );
--> statement-breakpoint
CREATE POLICY "template_shares_owner_delete" ON "template_shares"
  FOR DELETE USING (
    current_setting('app.current_user_id', true) IS NULL
    OR EXISTS (
      SELECT 1 FROM "templates" t
      WHERE t.id = "template_shares".template_id
        AND t.user_id = current_setting('app.current_user_id', true)
    )
  );
--> statement-breakpoint

-- template_reports: anyone can file a report (INSERT open);
-- reads/writes restricted when context is set (reporters see own reports).
CREATE POLICY "template_reports_public_insert" ON "template_reports"
  FOR INSERT WITH CHECK (true);
--> statement-breakpoint
CREATE POLICY "template_reports_restricted_read" ON "template_reports"
  FOR SELECT USING (
    current_setting('app.current_user_id', true) IS NULL
    OR reporter_user_id = current_setting('app.current_user_id', true)
  );
--> statement-breakpoint
CREATE POLICY "template_reports_restricted_write" ON "template_reports"
  FOR UPDATE USING (
    current_setting('app.current_user_id', true) IS NULL
  )
  WITH CHECK (
    current_setting('app.current_user_id', true) IS NULL
  );
--> statement-breakpoint
CREATE POLICY "template_reports_restricted_delete" ON "template_reports"
  FOR DELETE USING (
    current_setting('app.current_user_id', true) IS NULL
  );
--> statement-breakpoint

-- message_logs: owner-only when context is set
CREATE POLICY "message_logs_owner" ON "message_logs"
  FOR ALL USING (
    current_setting('app.current_user_id', true) IS NULL
    OR user_id = current_setting('app.current_user_id', true)
  )
  WITH CHECK (
    current_setting('app.current_user_id', true) IS NULL
    OR user_id = current_setting('app.current_user_id', true)
  );
