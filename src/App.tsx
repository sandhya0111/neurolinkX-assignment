import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardPage } from '@/src/app/dashboard/page';

// Note: Within the Vite environment simulation we omit Next.js built-in routing,
// but perfectly map the enterprise structure by mounting the page component.
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardPage />
    </QueryClientProvider>
  );
}
