import { Outlet, useNavigation } from 'react-router';
import { ProgressBar } from '@/shared/ui';

/** Корень: полоса прогресса, пока грузится код следующей страницы. */
export function RootLayout() {
  const navigation = useNavigation();
  return (
    <>
      <ProgressBar active={navigation.state === 'loading'} />
      <Outlet />
    </>
  );
}
