import React from 'react';
import { Redirect } from 'expo-router';

import { AppSplash } from '@/src/components/AppSplash';
import { useAppContext } from '@/src/features/app/AppContext';

export default function IndexRoute() {
  const { loading } = useAppContext();
  const [minSplashDone, setMinSplashDone] = React.useState(false);

  React.useEffect(() => {
    const timeout = setTimeout(() => setMinSplashDone(true), 1800);
    return () => clearTimeout(timeout);
  }, []);

  if (loading || !minSplashDone) {
    return <AppSplash />;
  }

  return <Redirect href="/(tabs)/today" />;
}
