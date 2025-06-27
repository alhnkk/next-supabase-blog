import { Suspense, lazy } from "react";

const DashboardStats = lazy(() =>
  import("@/components/admin/dashboard-stats").then((module) => ({
    default: module.DashboardStats,
  }))
);

const AnalyticsCharts = lazy(() =>
  import("@/components/admin/analytics-charts").then((module) => ({
    default: module.AnalyticsCharts,
  }))
);

export default async function AdminDashboard() {
  // Middleware zaten admin kontrolünü yapıyor
  return (
    <div className="space-y-8">
      <Suspense
        fallback={<div className="h-48 bg-gray-100 animate-pulse rounded-lg" />}
      >
        <DashboardStats />
      </Suspense>

      <Suspense
        fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}
      >
        <AnalyticsCharts />
      </Suspense>
    </div>
  );
}
