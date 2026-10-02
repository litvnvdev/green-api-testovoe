import { Outlet, useMatch } from 'react-router';
import { ROUTES } from '@/shared/config';
import { Sidebar } from '@/widgets/sidebar';
import styles from './ChatsPage.module.css';

/** Двухколоночный layout: список чатов слева, вложенный маршрут справа. */
export function ChatsPage() {
  const chatOpen = useMatch(ROUTES.chat) !== null;

  return (
    // data-view переключает колонки на узких экранах: либо список, либо переписка.
    <div className={styles.layout} data-view={chatOpen ? 'chat' : 'list'}>
      <aside className={styles.sidebar} aria-label="Список чатов">
        <Sidebar />
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
