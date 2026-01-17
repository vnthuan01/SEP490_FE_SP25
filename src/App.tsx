import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import AppRoutes from '@/routes/index';
import { Analytics } from '@vercel/analytics/react';
// import { SignalRProvider } from '@/components/provider/signalr/SignalRProvider';
// import { ConnectionIndicator } from '@/components/provider/signalr/ConnectionIndicator';

// Tạo queryClient global
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* <SignalRProvider> */}
      <AppRoutes />
      <Analytics />
      {/* <ConnectionIndicator /> */}
      {/* </SignalRProvider> */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
