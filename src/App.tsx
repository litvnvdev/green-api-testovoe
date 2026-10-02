import { ChatLayout } from './components/ChatLayout';
import { ChatProvider, useChat } from './context/ChatContext';
import { LoginPage } from './pages/LoginPage';

function Screen() {
  const { state } = useChat();
  return state.credentials ? <ChatLayout /> : <LoginPage />;
}

export default function App() {
  return (
    <ChatProvider>
      <Screen />
    </ChatProvider>
  );
}
