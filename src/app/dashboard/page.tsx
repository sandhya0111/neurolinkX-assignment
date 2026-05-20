import { Package, Search, BarChart3, Settings } from 'lucide-react';
import { ShipmentTable } from '@/src/components/dashboard/shipment-table';
import { useUIStore } from '@/src/store/use-ui-store';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

export function DashboardPage() {
  const { isSidebarOpen, isDarkMode, toggleDarkMode, notifications } = useUIStore();

  return (
    <div className="min-h-screen bg-background flex w-full">
      
      {/* Sidebar - Controlled by Zustand */}
      <aside className={cn(
        "border-r bg-muted/20 flex flex-col transition-all duration-300 ease-in-out",
        isSidebarOpen ? "w-64" : "w-0 overflow-hidden border-none opacity-0"
      )}>
        <div className="p-6 h-16 flex items-center border-b">
          <span className="font-bold tracking-tight text-lg text-primary whitespace-nowrap">
            NeurolinkX
          </span>
        </div>
        <nav className="p-4 space-y-1.5 flex-1">
          <Button variant="secondary" className="w-full justify-start shadow-none bg-accent/50 text-foreground">
            <Package className="w-4 h-4 mr-2" />
            Shipments
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
            <Settings className="w-4 h-4 mr-2" />
            Configuration
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b flex items-center justify-between px-6 bg-background">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search waybills..." 
                className="h-9 w-64 rounded-md border bg-transparent pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={toggleDarkMode}>
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Active Hub Shipments</h1>
              <p className="text-muted-foreground mt-1">
                Monitor and manage active logistical routes. Ensure high-priority cargo is expedited.
              </p>
            </div>

            <ShipmentTable />
          </div>
        </div>
      </main>

      {/* Render simple Toast Notifications from Zustand */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {notifications.map((n) => (
          <div key={n.id} className={cn(
            "pointer-events-auto px-4 py-3 rounded-md border shadow-lg max-w-sm flex flex-col bg-background",
            n.type === 'error' && "border-destructive text-destructive",
            n.type === 'success' && "border-green-500/50 text-green-700 dark:text-green-400",
          )}>
            <span className="font-semibold text-sm">{n.title}</span>
            <span className="text-sm opacity-90">{n.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
