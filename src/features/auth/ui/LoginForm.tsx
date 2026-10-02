import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSession } from '@/entities/session';
import {
  credentialsSchema,
  DEFAULT_API_URL,
  getStateInstance,
  GreenApiError,
  type Credentials,
} from '@/shared/api';
import { TextField } from '@/shared/ui';
import { describeInstanceState } from '../model/instanceState';
import styles from './LoginForm.module.css';

export function LoginForm() {
  const { login } = useSession();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    // Та же схема проверяет креды при чтении сессии из localStorage.
    resolver: zodResolver(credentialsSchema),
    defaultValues: { idInstance: '', apiTokenInstance: '', apiUrl: DEFAULT_API_URL },
  });

  async function onSubmit(credentials: Credentials) {
    try {
      // Сохраняем креды, только если инстанс реально готов работать.
      const { stateInstance } = await getStateInstance(credentials);
      if (stateInstance === 'authorized') {
        login(credentials);
        return;
      }
      setError('root', { message: describeInstanceState(stateInstance) });
    } catch (error) {
      setError('root', {
        message: error instanceof GreenApiError ? error.message : 'Не удалось войти.',
      });
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-busy={isSubmitting}
    >
      <TextField
        label="idInstance"
        inputMode="numeric"
        autoComplete="username"
        placeholder="1101000001"
        error={errors.idInstance?.message}
        disabled={isSubmitting}
        autoFocus
        {...register('idInstance')}
      />
      <TextField
        label="apiTokenInstance"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••••••"
        error={errors.apiTokenInstance?.message}
        disabled={isSubmitting}
        {...register('apiTokenInstance')}
      />
      <TextField
        label="apiUrl"
        type="url"
        inputMode="url"
        error={errors.apiUrl?.message}
        hint="Хост инстанса из личного кабинета, например https://7103.api.greenapi.com"
        disabled={isSubmitting}
        {...register('apiUrl')}
      />

      {errors.root?.message && (
        <p className={styles.formError} role="alert">
          {errors.root.message}
        </p>
      )}

      <button type="submit" className={styles.submit} disabled={isSubmitting}>
        {isSubmitting ? 'Проверяем…' : 'Войти'}
      </button>
    </form>
  );
}
