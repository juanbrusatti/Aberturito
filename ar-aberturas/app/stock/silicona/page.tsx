import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StockManagement } from "@/components/business/stock-management"

export default function StockSiliconaPage() {
  return (
    <DashboardLayout>
      <StockManagement materialType="silicona" />
    </DashboardLayout>
  )
}
