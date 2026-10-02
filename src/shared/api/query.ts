import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60_000 },
    mutations: { retry: false },
  },
});

/**
 * Ключи запросов. В ключ попадает только idInstance: токен не должен оказаться
 * в кэше, devtools или логах.
 */
export const greenApiKeys = {
  all: ['green-api'] as const,
  instance: (idInstance: string) => [...greenApiKeys.all, idInstance] as const,
  settings: (idInstance: string) => [...greenApiKeys.instance(idInstance), 'settings'] as const,
};
