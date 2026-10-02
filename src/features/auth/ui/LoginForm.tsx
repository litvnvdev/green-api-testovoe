import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { credentialsSchema, DEFAULT_API_URL } from '@/shared/api';
import { TextField } from '@/shared/ui';
import { useLogin } from '../model/useLogin';
import styles from './LoginForm.module.css';

export function LoginForm() {
  const { login, isPending, errorMessage } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    // Та же схема проверяет креды при чтении сессии из localStorage.
    resolver: zodResolver(credentialsSchema),
    defaultValues: { idInstance: '', apiTokenInstance: '', apiUrl: DEFAULT_API_URL },
  });

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit((credentials) => login(credentials))}
      noValidate
      aria-busy={isPending}
    >
      <TextField
        label="idInstance"
        inputMode="numeric"
        autoComplete="username"
        placeholder="1101000001"
        error={errors.idInstance?.message}
        disabled={isPending}
        autoFocus
        {...register('idInstance')}
      />
      <TextField
        label="apiTokenInstance"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••••••"
        error={errors.apiTokenInstance?.message}
        disabled={isPending}
        {...register('apiTokenInstance')}
      />
      <TextField
        label="apiUrl"
        type="url"
        inputMode="url"
        error={errors.apiUrl?.message}
        hint="Хост инстанса из личного кабинета, например https://7103.api.greenapi.com"
        disabled={isPending}
        {...register('apiUrl')}
      />

      {errorMessage && (
        <p className={styles.formError} role="alert">
          {errorMessage}
        </p>
      )}

      <button type="submit" className={styles.submit} disabled={isPending}>
        {isPending ? 'Проверяем…' : 'Войти'}
      </button>
    </form>
  );
}
