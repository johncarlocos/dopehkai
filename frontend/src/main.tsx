import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRoutes from './routes/routes.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import "./i18n";
import ErrorBoundary from './components/ErrorBoundary';

// Configure QueryClient with cache management and retry logic
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Refetch on mount and window focus for production
      refetchOnMount: true,
      refetchOnWindowFocus: false, // Disable to reduce unnecessary requests
      // Longer stale time to reduce API calls (2 minutes)
      staleTime: 2 * 60 * 1000,
      // Longer garbage collection time (5 minutes)
      gcTime: 5 * 60 * 1000,
      // Retry failed requests
      retry: 2, // Retry up to 2 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      // Don't throw errors, return them instead
      throwOnError: false,
    },
  },
})
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className="font-body">
          <AppRoutes />
        </div>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
