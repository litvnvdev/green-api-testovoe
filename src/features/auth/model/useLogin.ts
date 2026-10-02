import { useMutation } from '@tanstack/react-query';
import { useSession } from '@/entities/session';
import { getStateInstance, GreenApiError, type Credentials } from '@/shared/api';
import { describeInstanceState } from './instanceState';

/** Проверяет состояние инстанса и сохраняет креды, только если он готов работать. */
export function useLogin() {
  const { login } = useSession();

  const mutation = useMutation({
    mutationFn: async (credentials: Credentials) => {
      const { stateInstance } = await getStateInstance(credentials);
      if (stateInstance !== 'authorized') throw new Error(describeInstanceState(stateInstance));
      return credentials;
    },
    onSuccess: login,
  });

  const error = mutation.error;
  const errorMessage =
    error instanceof GreenApiError || error instanceof Error ? error.message : null;

  return { login: mutation.mutate, isPending: mutation.isPending, errorMessage };
}
