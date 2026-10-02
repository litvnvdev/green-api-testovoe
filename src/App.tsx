import { ChatProvider, useChat } from './context/ChatContext';
import { LoginPage } from './pages/LoginPage';

function Screen() {
  const { state, logout } = useChat();
  if (!state.credentials) return <LoginPage />;
  return (
    <main>
      <p>Инстанс {state.credentials.idInstance}</p>
      <button type="button" onClick={logout}>
        Выйти
      </button>
    </main>
  );
}

export default function App() {
  return (
    <ChatProvider>
      <Screen />
    </ChatProvider>
  );
}
