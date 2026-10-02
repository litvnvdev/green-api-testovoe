import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useSession } from '@/entities/session';
import { DEFAULT_API_URL, getStateInstance, GreenApiError, type Credentials } from '@/shared/api';
import styles from './LoginForm.module.css';

const STATE_MESSAGES: Record<string, string> = {
  notAuthorized:
    'Инстанс не привязан к WhatsApp. Отсканируйте QR-код в личном кабинете GREEN-API и попробуйте снова.',
  blocked: 'Аккаунт WhatsApp заблокирован.',
  sleepMode: 'Телефон с WhatsApp не в сети (режим сна). Проверьте телефон.',
  starting: 'Инстанс запускается. Подождите пару минут и попробуйте снова.',
  yellowCard: 'WhatsApp временно ограничил отправку сообщений (yellowCard).',
};

interface FieldErrors {
  idInstance?: string;
  apiTokenInstance?: string;
  apiUrl?: string;
}

function validate(values: Credentials): FieldErrors {
  const errors: FieldErrors = {};
  if (!/^\d+$/.test(values.idInstance)) {
    errors.idInstance = 'idInstance состоит только из цифр.';
  }
  if (values.apiTokenInstance.length === 0) {
    errors.apiTokenInstance = 'Введите apiTokenInstance.';
  }
  try {
    const url = new URL(values.apiUrl);
    if (url.protocol !== 'https:') errors.apiUrl = 'Адрес должен начинаться с https://';
  } catch {
    errors.apiUrl = 'Неверный адрес. Пример: https://api.green-api.com';
  }
  return errors;
}

export function LoginForm() {
  const { login } = useSession();
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  // Отменяем проверку, если страница размонтировалась посреди запроса.
  useEffect(() => () => controllerRef.current?.abort(), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const values: Credentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
      apiUrl: apiUrl.trim().replace(/\/+$/, ''),
    };
    const errors = validate(values);
    setFieldErrors(errors);
    setFormError(null);
    if (Object.keys(errors).length > 0) return;

    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    try {
      const { stateInstance } = await getStateInstance(values, controller.signal);
      if (stateInstance === 'authorized') {
        login(values);
        return;
      }
      setFormError(
        STATE_MESSAGES[stateInstance] ?? `Инстанс не готов к работе (состояние: ${stateInstance}).`,
      );
    } catch (error) {
      if (error instanceof GreenApiError && error.kind === 'aborted') return;
      setFormError(error instanceof GreenApiError ? error.message : 'Не удалось войти.');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate aria-busy={loading}>
      <div className={styles.field}>
        <label htmlFor="idInstance">idInstance</label>
        <input
          id="idInstance"
          name="idInstance"
          inputMode="numeric"
          autoComplete="username"
          placeholder="1101000001"
          value={idInstance}
          onChange={(e) => setIdInstance(e.target.value)}
          aria-invalid={Boolean(fieldErrors.idInstance)}
          aria-describedby={fieldErrors.idInstance ? 'idInstance-error' : undefined}
          disabled={loading}
          autoFocus
        />
        {fieldErrors.idInstance && (
          <span id="idInstance-error" className={styles.fieldError}>
            {fieldErrors.idInstance}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="apiTokenInstance">apiTokenInstance</label>
        <input
          id="apiTokenInstance"
          name="apiTokenInstance"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••••••"
          value={apiTokenInstance}
          onChange={(e) => setApiTokenInstance(e.target.value)}
          aria-invalid={Boolean(fieldErrors.apiTokenInstance)}
          aria-describedby={fieldErrors.apiTokenInstance ? 'apiToken-error' : undefined}
          disabled={loading}
        />
        {fieldErrors.apiTokenInstance && (
          <span id="apiToken-error" className={styles.fieldError}>
            {fieldErrors.apiTokenInstance}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="apiUrl">apiUrl</label>
        <input
          id="apiUrl"
          name="apiUrl"
          type="url"
          inputMode="url"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          aria-invalid={Boolean(fieldErrors.apiUrl)}
          aria-describedby={fieldErrors.apiUrl ? 'apiUrl-error' : 'apiUrl-hint'}
          disabled={loading}
        />
        {fieldErrors.apiUrl ? (
          <span id="apiUrl-error" className={styles.fieldError}>
            {fieldErrors.apiUrl}
          </span>
        ) : (
          <span id="apiUrl-hint" className={styles.hint}>
            Хост инстанса из личного кабинета, например https://7103.api.greenapi.com
          </span>
        )}
      </div>

      {formError && (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      )}

      <button type="submit" className={styles.submit} disabled={loading}>
        {loading ? 'Проверяем…' : 'Войти'}
      </button>
    </form>
  );
}
