import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StockManagement } from "@/components/business/stock-management"

export default function StockPage() {
  return (
    <DashboardLayout>
      <StockManagement materialType="all" />
    </DashboardLayout>
  )
}
