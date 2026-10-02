import { useSession } from '@/entities/session';
import { IconButton, LogoutIcon } from '@/shared/ui';

export function LogoutButton() {
  const { credentials, logout } = useSession();
  return (
    <IconButton
      label={credentials ? `Выйти (инстанс ${credentials.idInstance})` : 'Выйти'}
      icon={<LogoutIcon />}
      onClick={logout}
    />
  );
}
