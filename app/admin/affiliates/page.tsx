import { IconUsers } from "@tabler/icons-react";
import { AffiliateTab } from "@/components/admin/affiliate/affiliate-tab";
import { requireSystemAdmin } from "@/lib/admin-auth";
import {
  getAffiliateRelationships,
  getAffiliateEarnings,
  getAffiliateStats,
} from "@/lib/db/queries";

export default async function AdminAffiliatesPage() {
  // Ensure user is system admin
  await requireSystemAdmin();

  // Fetch affiliate data in parallel
  const [relationships, earnings, stats] = await Promise.all([
    getAffiliateRelationships(),
    getAffiliateEarnings(),
    getAffiliateStats(),
  ]);

  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8">
      {/* Page Header */}
      <div className="animate-fade-in-up space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm ring-1 ring-white/10"
            style={{ backgroundColor: "var(--accent-teal)" }}
          >
            <IconUsers className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Affiliates</h1>
            <p className="text-sm text-muted-foreground">
              Administrer affiliate-relasjoner og provisjoner
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="animate-fade-in-up stagger-1">
        <AffiliateTab
          relationships={relationships}
          earnings={earnings}
          stats={stats}
        />
      </div>
    </div>
  );
}
