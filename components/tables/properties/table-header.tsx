"use client";

import { Button } from "@/components/ui/button";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  type SortableColumn,
  type SortDirection,
} from "@/hooks/use-property-filters";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";

interface SortButtonProps {
  label: string;
  sortField: SortableColumn;
  currentSortColumn: SortableColumn | null;
  currentSortDirection: SortDirection | null;
  onSort: (column: SortableColumn) => void;
  width: number;
  minWidth?: number;
  maxWidth?: number;
}

function SortButton({
  label,
  sortField,
  currentSortColumn,
  currentSortDirection,
  onSort,
}: SortButtonProps) {
  const isActive = sortField === currentSortColumn;

  return (
    <Button
      variant="ghost"
      className="h-auto p-0 hover:bg-transparent gap-1.5 font-medium text-muted-foreground hover:text-foreground"
      onClick={() => onSort(sortField)}
    >
      <span>{label}</span>
      {isActive && currentSortDirection === "asc" && (
        <IconArrowUp className="h-4 w-4" />
      )}
      {isActive && currentSortDirection === "desc" && (
        <IconArrowDown className="h-4 w-4" />
      )}
    </Button>
  );
}

interface ColumnConfig {
  id: string;
  label: string;
  sortField?: SortableColumn;
  width: number;
  minWidth?: number;
  maxWidth?: number;
}

const columnConfigs: ColumnConfig[] = [
  {
    id: "address",
    label: "Address",
    sortField: "address",
    width: 280,
    minWidth: 200,
  },
  {
    id: "status",
    label: "Status",
    sortField: "status",
    width: 120,
    minWidth: 100,
    maxWidth: 140,
  },
  { id: "tags", label: "Tags", width: 200, minWidth: 150 },
  {
    id: "editCount",
    label: "Edits",
    sortField: "editCount",
    width: 80,
    minWidth: 60,
    maxWidth: 100,
  },
  { id: "actions", label: "", width: 60, minWidth: 60, maxWidth: 60 },
];

interface DataTableHeaderProps {
  sortColumn: SortableColumn | null;
  sortDirection: SortDirection | null;
  onSort: (column: SortableColumn) => void;
}

export function DataTableHeader({
  sortColumn,
  sortDirection,
  onSort,
}: DataTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="flex hover:bg-transparent">
        {columnConfigs.map((column) => {
          const isFlexColumn = column.id === "address";
          return (
            <TableHead
              key={column.id}
              className="flex items-center"
              style={
                isFlexColumn
                  ? { flex: 1, minWidth: column.minWidth }
                  : {
                      width: column.width,
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                    }
              }
            >
              {column.sortField ? (
                <SortButton
                  label={column.label}
                  sortField={column.sortField}
                  currentSortColumn={sortColumn}
                  currentSortDirection={sortDirection}
                  onSort={onSort}
                  width={column.width}
                  minWidth={column.minWidth}
                  maxWidth={column.maxWidth}
                />
              ) : (
                <span className="font-medium text-muted-foreground">
                  {column.label}
                </span>
              )}
            </TableHead>
          );
        })}
      </TableRow>
    </TableHeader>
  );
}
