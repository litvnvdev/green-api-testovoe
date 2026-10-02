/** Чат адресуется номером без @c.us: /chat/79001234567. */
export const ROUTES = {
  login: '/login',
  chats: '/',
  chat: '/chat/:phone',
} as const;

export function chatPath(chatId: string): string {
  return `/chat/${chatId.replace(/@.*$/, '')}`;
}
