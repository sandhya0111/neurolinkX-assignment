import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { getShipments, updateShipmentStatus, Shipment, ShipmentStatus } from '@/src/api/shipments';
import { useUIStore } from '@/src/store/use-ui-store';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

const columnHelper = createColumnHelper<Shipment>();

export function ShipmentTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const queryClient = useQueryClient();
  const addNotification = useUIStore((state) => state.addNotification);

  // 1. Data Fetching
  const { data: shipments = [], isLoading, isError } = useQuery({
    queryKey: ['shipments'],
    queryFn: getShipments,
  });

  // 2. Optimistic Update Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ShipmentStatus }) => 
      updateShipmentStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['shipments'] });

      // Snapshot previous value
      const previousShipments = queryClient.getQueryData<Shipment[]>(['shipments']);

      // Optimistically update to the new value
      if (previousShipments) {
        queryClient.setQueryData<Shipment[]>(['shipments'], (old) =>
          old?.map((shipment) =>
            shipment.id === id ? { ...shipment, status } : shipment
          )
        );
      }

      return { previousShipments };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousShipments) {
        queryClient.setQueryData(['shipments'], context.previousShipments);
      }
      addNotification(`Failed to update tracking ${variables.id}: ${err.message}`, "error");
    },
    onSuccess: (data) => {
      addNotification(`Shipment ${data.trackingNumber} is now ${data.status}`, 'success');
    },
    onSettled: () => {
      // Re-fetch to ensure sync after success/error
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });

  // 3. Define Columns
  const columns = [
    columnHelper.accessor('trackingNumber', {
      header: 'Tracking No.',
      cell: (info) => <span className="font-mono text-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor('origin', {
      header: 'Origin',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('destination', {
      header: 'Destination',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const val = info.getValue() as ShipmentStatus;
        const id = info.row.original.id;
        
        // Status badging & Inline Actions
        return (
          <div className="flex items-center gap-3">
            <span className={cn(
              "px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap",
              val === "Pending" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
              val === "In Transit" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
              val === "Delivered" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
              val === "Canceled" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
            )}>
              {val}
            </span>
            
            {/* Quick Action: if pending, ship it */}
            {val === "Pending" && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => statusMutation.mutate({ id, status: "In Transit" })}
                isLoading={statusMutation.isPending && statusMutation.variables?.id === id}
              >
                Ship Now
              </Button>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor('estimatedDelivery', {
      header: 'Est. Delivery',
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
  ];

  // 4. Initialize Table
  const table = useReactTable({
    data: shipments,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 8 },
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-destructive p-4 border border-destructive/20 rounded-md">Failed to load shipments.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-md overflow-hidden bg-background">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th 
                    key={header.id} 
                    className="px-4 py-3 font-medium text-muted-foreground"
                    colSpan={header.colSpan}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? 'cursor-pointer select-none flex items-center gap-1 hover:text-foreground transition-colors'
                            : '',
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ChevronUp className="w-4 h-4" />,
                          desc: <ChevronDown className="w-4 h-4" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                  No shipments found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {shipments.length} results
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
