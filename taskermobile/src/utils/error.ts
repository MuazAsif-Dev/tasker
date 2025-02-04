import Toast from 'react-native-toast-message';

export function handleError({
  error,
  message,
}: {
  error: unknown;
  message: string;
}) {
  console.log(`Error: ${error}`);

  Toast.show({
    type: 'error',
    text1: 'Error',
    text2: message,
  });
}
