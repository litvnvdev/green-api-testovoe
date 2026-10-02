import { useEffect, useRef, useState } from 'react';
import { useChatActions } from '@/entities/chat';
import { EraseIcon, IconButton, MoreIcon, TrashIcon } from '@/shared/ui';
import styles from './ChatActions.module.css';

type PendingAction = 'clear' | 'delete';

const CONFIRM_TEXT: Record<PendingAction, { question: string; action: string }> = {
  clear: {
    question: 'Удалить историю этого чата на сайте? В WhatsApp сообщения останутся.',
    action: 'Очистить',
  },
  delete: {
    question:
      'Удалить чат из списка вместе с историей? В WhatsApp ничего не изменится, новое сообщение с этого номера вернёт чат.',
    action: 'Удалить',
  },
};

interface ChatActionsProps {
  chatId: string;
  hasMessages: boolean;
  /** Вызывается после удаления чата, например чтобы уйти со страницы чата. */
  onDeleted?: () => void;
}

/** Меню «⋯» с очисткой истории и удалением чата; оба действия — только на сайте. */
export function ChatActions({ chatId, hasMessages, onDeleted }: ChatActionsProps) {
  const { clearChat, deleteChat } = useChatActions();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const open = menuOpen || pending !== null;

  // Меню и подтверждение закрываются по клику вне них и по Escape.
  useEffect(() => {
    if (!open) return;
    const close = () => {
      setMenuOpen(false);
      setPending(null);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function choose(action: PendingAction) {
    setMenuOpen(false);
    setPending(action);
  }

  function confirm() {
    if (pending === 'clear') clearChat(chatId);
    if (pending === 'delete') {
      deleteChat(chatId);
      onDeleted?.();
    }
    setPending(null);
  }

  return (
    <div className={styles.menuWrap} ref={rootRef}>
      <IconButton
        label="Действия с чатом"
        icon={<MoreIcon width={22} height={22} />}
        onClick={() => {
          setPending(null);
          setMenuOpen((value) => !value);
        }}
        aria-expanded={menuOpen}
        aria-controls="chat-actions"
      />

      {menuOpen && (
        <ul id="chat-actions" className={styles.menu}>
          <li>
            <button type="button" onClick={() => choose('clear')} disabled={!hasMessages} autoFocus>
              <EraseIcon width={20} height={20} />
              Очистить историю
            </button>
          </li>
          <li>
            <button type="button" className={styles.menuDanger} onClick={() => choose('delete')}>
              <TrashIcon width={20} height={20} />
              Удалить чат
            </button>
          </li>
        </ul>
      )}

      {pending && (
        <div className={styles.confirm} role="alertdialog" aria-labelledby="chat-confirm-text">
          <p id="chat-confirm-text">{CONFIRM_TEXT[pending].question}</p>
          <div className={styles.confirmActions}>
            <button type="button" onClick={() => setPending(null)} autoFocus>
              Отмена
            </button>
            <button type="button" className={styles.danger} onClick={confirm}>
              {CONFIRM_TEXT[pending].action}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
