"use client";

/**
 * Health alerts banner — shows unacknowledged webhook down/recovered
 * notifications from the scheduled health monitor.
 */

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { acknowledgeAlertAction, acknowledgeAllAlertsAction } from "@/server/actions/webhooks";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

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
    <Card className="p-4 bg-surface border-[3px] border-warning">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm uppercase tracking-[0.05em] flex items-center gap-2">
          <AlertTriangle size={16} />
          {t("healthAlerts")} ({visible.length})
        </h3>
        <Button variant="ghost" size="sm" onClick={dismissAll} disabled={pending} className="uppercase text-xs">
          {t("dismissAll")}
        </Button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {visible.map((alert) => (
          <div key={alert.id} className="flex items-center gap-2 text-sm border-b-[1px] border-border-ink pb-2">
            {alert.type === "down" ? (
              <Badge variant="danger" className="gap-1">
                <AlertTriangle size={12} /> {t("alertDown")}
              </Badge>
            ) : (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 size={12} /> {t("alertRecovered")}
              </Badge>
            )}
            <span className="flex-1">
              <strong>{alert.webhookName}</strong>
              {alert.message && <span className="text-muted"> — {alert.message}</span>}
            </span>
            <Button variant="ghost" size="sm" onClick={() => dismiss(alert.id)} disabled={pending}>
              <X size={14} />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
