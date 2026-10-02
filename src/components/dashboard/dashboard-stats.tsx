"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link2, Send, TrendingUp, Activity, AlertTriangle } from "lucide-react";

export function DashboardStats({
  webhookCount,
  sentCount,
  failedCount,
  successRate,
  recentLogs,
}: {
  webhookCount: number;
  sentCount: number;
  failedCount: number;
  successRate: number;
  recentLogs: Array<{ status: string; mode: string; createdAt: Date }>;
}) {
  const t = useTranslations("dashboard");

  // Calculate this week activity
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thisWeek = recentLogs.filter((l) => new Date(l.createdAt) > weekAgo);
  const weekSent = thisWeek.filter((l) => l.status === "sent").length;

  const stats = [
    { label: t("webhooksCount"), value: webhookCount, icon: Link2 },
    { label: t("messagesSent"), value: sentCount, icon: Send },
    { label: t("successRate"), value: `${successRate}%`, icon: TrendingUp },
    { label: t("failed"), value: failedCount, icon: AlertTriangle },
    { label: t("thisWeek"), value: weekSent, icon: Activity },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0 border-[3px] border-border-ink">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={cn(
            "p-4 bg-surface hover:bg-sunken transition-colors duration-100",
            "border-r-[3px] border-border-ink last:border-r-0",
            i >= 2 && "border-t-[3px] border-border-ink",
            i === 2 && "lg:border-t-0",
            i >= 3 && "border-t-[3px] border-border-ink lg:border-t-0",
          )}
        >
          <stat.icon size={20} className="mb-2" />
          <div className="text-3xl font-display">{stat.value}</div>
          <div className="text-xs text-fg-secondary uppercase tracking-[0.05em] mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
