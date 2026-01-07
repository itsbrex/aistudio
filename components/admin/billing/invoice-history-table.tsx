"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconExternalLink,
  IconFileInvoice,
  IconBuilding,
  IconCheck,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { markInvoiceAsPaidAction } from "@/lib/actions/billing";
import type { InvoiceHistoryRow } from "@/lib/db/queries";

// Format Norwegian currency
function formatNOK(amountOre: number): string {
  const nok = amountOre / 100;
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(nok);
}

type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled" | "overdue";

function StatusBadge({ status }: { status: InvoiceStatus }) {
  switch (status) {
    case "paid":
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        >
          Betalt
        </Badge>
      );
    case "sent":
      return (
        <Badge
          variant="outline"
          className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400"
        >
          Sendt
        </Badge>
      );
    case "draft":
      return (
        <Badge
          variant="outline"
          className="border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-400"
        >
          Utkast
        </Badge>
      );
    case "overdue":
      return (
        <Badge
          variant="outline"
          className="border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
        >
          Forfalt
        </Badge>
      );
    case "cancelled":
      return (
        <Badge
          variant="outline"
          className="border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-400"
        >
          Kansellert
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
        >
          Venter
        </Badge>
      );
  }
}

interface InvoiceHistoryTableProps {
  invoices: InvoiceHistoryRow[];
}

export function InvoiceHistoryTable({ invoices }: InvoiceHistoryTableProps) {
  const router = useRouter();
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);

  const handleMarkAsPaid = async (invoiceId: string) => {
    setMarkingPaidId(invoiceId);
    try {
      const result = await markInvoiceAsPaidAction(invoiceId);
      if (result.success) {
        toast.success("Faktura markert som betalt", {
          description: result.affiliateEarningCreated
            ? "Affiliate-provisjon er også opprettet"
            : undefined,
        });
        router.refresh();
      } else {
        toast.error("Feil", { description: result.error });
      }
    } catch {
      toast.error("Feil", { description: "Kunne ikke markere som betalt" });
    } finally {
      setMarkingPaidId(null);
    }
  };

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
          style={{
            backgroundColor:
              "color-mix(in oklch, var(--accent-violet) 15%, transparent)",
          }}
        >
          <IconFileInvoice
            className="h-6 w-6"
            style={{ color: "var(--accent-violet)" }}
          />
        </div>
        <h3 className="text-lg font-semibold">Ingen fakturaer enna</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Fakturaer vil vises her nar du begynner a fakturere.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fakturanr.</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead className="text-center">Prosjekter</TableHead>
              <TableHead className="text-right">Belop</TableHead>
              <TableHead className="text-right">Med MVA</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Utstedt</TableHead>
              <TableHead>Forfall</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              const canMarkAsPaid =
                invoice.status === "sent" && invoice.fikenInvoiceId;

              return (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <div className="font-mono font-medium">
                      {invoice.fikenInvoiceNumber
                        ? `#${invoice.fikenInvoiceNumber}`
                        : "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-md"
                        style={{
                          backgroundColor:
                            "color-mix(in oklch, var(--accent-violet) 15%, transparent)",
                        }}
                      >
                        <IconBuilding
                          className="h-4 w-4"
                          style={{ color: "var(--accent-violet)" }}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {invoice.workspaceName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {invoice.workspaceOrgNumber
                            ? `Org: ${invoice.workspaceOrgNumber}`
                            : "Mangler org.nr"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="tabular-nums">{invoice.lineItemCount}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono">
                      {formatNOK(invoice.totalAmountOre)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className="font-mono font-semibold"
                      style={{ color: "var(--accent-green)" }}
                    >
                      {formatNOK(invoice.totalAmountWithVatOre)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {invoice.issueDate
                        ? invoice.issueDate.toLocaleDateString("nb-NO", {
                            day: "numeric",
                            month: "short",
                          })
                        : "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {invoice.dueDate
                        ? invoice.dueDate.toLocaleDateString("nb-NO", {
                            day: "numeric",
                            month: "short",
                          })
                        : "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {canMarkAsPaid && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              onClick={() => handleMarkAsPaid(invoice.id)}
                              disabled={markingPaidId === invoice.id}
                            >
                              {markingPaidId === invoice.id ? (
                                <IconLoader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <IconCheck className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Marker som betalt</TooltipContent>
                        </Tooltip>
                      )}
                      {invoice.fikenInvoiceId && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              asChild
                            >
                              <a
                                href={`https://fiken.no/foretak/fiken-demo-mulig-hytte-as2/handel/salg/${invoice.fikenInvoiceId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <IconExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Apne i Fiken</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Footer */}
        <div className="border-t px-4 py-3 text-sm text-muted-foreground">
          <span
            className="font-mono font-semibold"
            style={{ color: "var(--accent-violet)" }}
          >
            {invoices.length}
          </span>{" "}
          fakturaer totalt
        </div>
      </div>
    </TooltipProvider>
  );
}
