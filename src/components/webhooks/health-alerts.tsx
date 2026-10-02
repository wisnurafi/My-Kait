"use client";

/**
 * Health alerts banner — shows unacknowledged webhook down/recovered
 * notifications from the scheduled health monitor.
 */

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { acknowledgeAlertAction, acknowledgeAllAlertsAction } from "@/server/actions/webhooks";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: string;
  message: string | null;
  createdAt: Date;
  acknowledgedAt: Date | null;
  webhookName: string;
}

export function HealthAlerts({
  initialAlerts,
}: {
  initialAlerts: { alerts: Alert[]; unacknowledgedCount: number };
}) {
  const t = useTranslations("webhooks");
  const [pending, startTransition] = useTransition();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = initialAlerts.alerts.filter(
    (a) => !a.acknowledgedAt && !dismissed.has(a.id),
  );

  function dismiss(id: string) {
    startTransition(async () => {
      await acknowledgeAlertAction(id);
      setDismissed((prev) => new Set(prev).add(id));
    });
  }

  function dismissAll() {
    startTransition(async () => {
      await acknowledgeAllAlertsAction();
      setDismissed(new Set(initialAlerts.alerts.map((a) => a.id)));
    });
  }

  if (visible.length === 0) return null;

  return (
    <div className="glass p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm uppercase tracking-[0.05em] flex items-center gap-2">
          <AlertTriangle size={16} className="text-warning" />
          {t("healthAlerts")} ({visible.length})
        </h3>
        <Button variant="ghost" size="sm" onClick={dismissAll} disabled={pending} className="uppercase text-xs">
          {t("dismissAll")}
        </Button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        <AnimatePresence initial={false}>
          {visible.map((alert) => {
            const down = alert.type === "down";
            return (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 60, transition: { duration: 0.25 } }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={cn(
                  "flex items-center gap-2 text-sm rounded-xl border px-3 py-2.5 backdrop-blur-sm",
                  down
                    ? "border-[rgba(251,113,133,0.35)] bg-[rgba(251,113,133,0.07)] shadow-[0_0_28px_rgba(251,113,133,0.12)]"
                    : "border-[rgba(52,211,153,0.35)] bg-[rgba(52,211,153,0.07)] shadow-[0_0_28px_rgba(52,211,153,0.12)]",
                )}
              >
                {down ? (
                  <Badge variant="danger" pulse className="gap-1 shrink-0">
                    <AlertTriangle size={12} /> {t("alertDown")}
                  </Badge>
                ) : (
                  <Badge variant="success" className="gap-1 shrink-0">
                    <CheckCircle2 size={12} /> {t("alertRecovered")}
                  </Badge>
                )}
                <span className="flex-1 min-w-0">
                  <strong>{alert.webhookName}</strong>
                  {alert.message && <span className="text-muted"> — {alert.message}</span>}
                </span>
                <Button variant="ghost" size="sm" onClick={() => dismiss(alert.id)} disabled={pending} className="shrink-0">
                  <X size={14} />
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
