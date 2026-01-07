"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UninvoicedTable } from "./uninvoiced-table";
import { InvoiceHistoryTable } from "./invoice-history-table";
import type { UninvoicedLineItemRow, InvoiceHistoryRow } from "@/lib/db/queries";

interface BillingTabsProps {
  uninvoicedItems: UninvoicedLineItemRow[];
  invoices: InvoiceHistoryRow[];
}

export function BillingTabs({ uninvoicedItems, invoices }: BillingTabsProps) {
  return (
    <Tabs defaultValue="uninvoiced" className="space-y-4">
      <TabsList>
        <TabsTrigger value="uninvoiced">Ikke fakturert</TabsTrigger>
        <TabsTrigger value="history">Fakturahistorikk</TabsTrigger>
      </TabsList>

      <TabsContent value="uninvoiced" className="mt-4">
        <UninvoicedTable items={uninvoicedItems} />
      </TabsContent>

      <TabsContent value="history" className="mt-4">
        <InvoiceHistoryTable invoices={invoices} />
      </TabsContent>
    </Tabs>
  );
}
