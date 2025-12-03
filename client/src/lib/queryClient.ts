import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

function getAuthHeaders(role?: 'admin' | 'trainer') {
  const headers: Record<string, string> = {};
  let token: string | null = null;
  
  if (role === 'admin') {
    token = sessionStorage.getItem('adminToken');
  } else if (role === 'trainer') {
    token = sessionStorage.getItem('trainerToken');
  } else {
    // Smart token detection based on current URL path
    const currentPath = window.location.pathname;
    
    if (currentPath.startsWith('/admin')) {
      // On admin pages, prioritize admin token
      token = sessionStorage.getItem('adminToken') || sessionStorage.getItem('trainerToken') || localStorage.getItem('token');
    } else if (currentPath.startsWith('/trainer')) {
      // On trainer pages, prioritize trainer token
      token = sessionStorage.getItem('trainerToken') || sessionStorage.getItem('adminToken') || localStorage.getItem('token');
    } else {
      // On client/other pages, prioritize client token
      token = localStorage.getItem('token') || sessionStorage.getItem('trainerToken') || sessionStorage.getItem('adminToken');
    }
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: { 
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...getAuthHeaders()
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include', // Include cookies for HTTP-only auth
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      headers: getAuthHeaders(),
      credentials: 'include', // Include cookies for HTTP-only auth
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: 60000, // 1 minute stale time
      gcTime: 300000, // 5 minutes garbage collection time
      retry: 1, // Retry once on failure
      retryDelay: 1000, // Wait 1 second before retry
    },
    mutations: {
      retry: false,
    },
  },
});
