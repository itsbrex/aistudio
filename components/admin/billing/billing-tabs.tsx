"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UninvoicedTable } from "./uninvoiced-table";
import { InvoiceHistoryTable } from "./invoice-history-table";
import { AffiliateTab } from "./affiliate-tab";
import type {
  UninvoicedLineItemRow,
  InvoiceHistoryRow,
  AffiliateRelationshipRow,
  AffiliateEarningRow,
  AffiliateStats,
} from "@/lib/db/queries";

interface BillingTabsProps {
  uninvoicedItems: UninvoicedLineItemRow[];
  invoices: InvoiceHistoryRow[];
  affiliateRelationships: AffiliateRelationshipRow[];
  affiliateEarnings: AffiliateEarningRow[];
  affiliateStats: AffiliateStats;
}

export function BillingTabs({
  uninvoicedItems,
  invoices,
  affiliateRelationships,
  affiliateEarnings,
  affiliateStats,
}: BillingTabsProps) {
  return (
    <Tabs defaultValue="uninvoiced" className="space-y-4">
      <TabsList>
        <TabsTrigger value="uninvoiced">Ikke fakturert</TabsTrigger>
        <TabsTrigger value="history">Fakturahistorikk</TabsTrigger>
        <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
      </TabsList>

      <TabsContent value="uninvoiced" className="mt-4">
        <UninvoicedTable items={uninvoicedItems} />
      </TabsContent>

      <TabsContent value="history" className="mt-4">
        <InvoiceHistoryTable invoices={invoices} />
      </TabsContent>

      <TabsContent value="affiliates" className="mt-4">
        <AffiliateTab
          relationships={affiliateRelationships}
          earnings={affiliateEarnings}
          stats={affiliateStats}
        />
      </TabsContent>
    </Tabs>
  );
}
