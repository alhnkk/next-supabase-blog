import { DashboardStats } from "@/components/admin/dashboard-stats";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";

export default async function AdminDashboard() {
  // Middleware zaten admin kontrolünü yapıyor
  return (
    <div className="space-y-8">
      <DashboardStats />
      <AnalyticsCharts />
    </div>
  );
}
