import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRoutes from './routes/routes.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import "./i18n";
import ErrorBoundary from './components/ErrorBoundary';

// Global error handlers to catch unhandled promise rejections and errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  // Prevent default browser error handling
  event.preventDefault();
  // Log to console for debugging
  if (import.meta.env.DEV) {
    console.error('Error details:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Prevent default browser error handling
  event.preventDefault();
  // Log to console for debugging
  if (import.meta.env.DEV) {
    console.error('Promise rejection details:', {
      reason: event.reason,
      promise: event.promise
    });
  }
  // Don't crash the app - let React Query handle it
});

// Configure QueryClient with cache management and retry logic
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Optimize refetch behavior for performance
      refetchOnMount: false, // Don't refetch if data exists in cache
      refetchOnWindowFocus: false, // Disable to reduce unnecessary requests
      refetchOnReconnect: true, // Only refetch when reconnecting
      // Longer stale time to reduce API calls (5 minutes for better caching)
      staleTime: 5 * 60 * 1000,
      // Longer garbage collection time (10 minutes)
      gcTime: 10 * 60 * 1000,
      // Retry failed requests
      retry: 2, // Reduce retries for faster failure feedback
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      // Don't throw errors, return them instead
      throwOnError: false,
      // Add network error handling
      networkMode: 'online',
    },
    mutations: {
      // Retry mutations on failure
      retry: 1,
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
