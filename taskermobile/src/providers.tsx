import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactNode, useEffect, useCallback} from 'react';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {env} from '@/config/env';
import messaging from '@react-native-firebase/messaging';
import {
  onDisplayNotification,
  requestNotificationPermissionAndroid,
} from '@/utils/notification';
import {useAuthActions} from '@/hooks/store/auth';

GoogleSignin.configure({
  webClientId: env.GOOGLE_WEB_CLIENT_ID,
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  forceCodeForRefreshToken: false,
  iosClientId: env.GOOGLE_IOS_CLIENT_ID,
});

const queryClient = new QueryClient();

export default function Providers({children}: {children: ReactNode}) {
  const {setFcmToken} = useAuthActions();

  const getFCMToken = useCallback(async () => {
    const token = await messaging().getToken();
    setFcmToken(token);
  }, [setFcmToken]);

  useEffect(() => {
    requestNotificationPermissionAndroid({
      onSuccess: () => {
        getFCMToken();
      },
    });
  }, [getFCMToken]);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      onDisplayNotification({
        title: remoteMessage.notification?.title ?? 'Task Reminder',
        body: remoteMessage.notification?.body ?? '',
      });
    });

    return unsubscribe;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
