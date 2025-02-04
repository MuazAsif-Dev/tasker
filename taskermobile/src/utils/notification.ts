import {Alert, PermissionsAndroid, Platform} from 'react-native';
import notifee from '@notifee/react-native';

export async function onDisplayNotification({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId,
      pressAction: {
        id: 'default',
      },
    },
  });
}

export async function requestNotificationPermissionAndroid({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      onSuccess();
    } else {
      Alert.alert(
        'Notification permission denied',
        'You need to enable notification permission to receive notifications',
      );
    }
  }
}
