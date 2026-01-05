import { DataTable } from "@/components/tables/properties/data-table"
import { IconBuilding } from "@tabler/icons-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8">
      {/* Page header with icon badge */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: "var(--accent-teal)" }}
          >
            <IconBuilding className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
        </div>
        <p className="text-muted-foreground">
          View and manage all your property listings and AI edits.
        </p>
      </div>

      {/* Data table */}
      <DataTable />
    </div>
  )
}
