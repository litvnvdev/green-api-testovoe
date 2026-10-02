import { LoginForm } from '@/features/auth';
import { GREEN_API_CONSOLE_URL } from '@/shared/config';
import { ChatBubbleIcon } from '@/shared/ui';
import styles from './LoginPage.module.css';

export function LoginPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="login-title">
        <div className={styles.logo} aria-hidden="true">
          <ChatBubbleIcon width={32} height={32} />
        </div>
        <h1 id="login-title" className={styles.title}>
          Вход в WhatsApp-чат
        </h1>
        <p className={styles.subtitle}>
          Данные инстанса есть в{' '}
          <a href={GREEN_API_CONSOLE_URL} target="_blank" rel="noreferrer">
            личном кабинете GREEN-API
          </a>
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
