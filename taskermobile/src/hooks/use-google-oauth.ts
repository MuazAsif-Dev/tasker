import {handleError} from '@/utils/error';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {useGoogleOAuthVerification} from '@/hooks/api/mutations/use-auth-mutations';

export default function useGoogleOauth() {
  const {mutate: googleOAuthVerification} = useGoogleOAuthVerification();

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        if (!response.data.idToken) {
          throw new Error('Failed to sign in');
        }

        googleOAuthVerification({
          email: response.data.user.email,
          name: response.data.user.name,
          token: response.data.idToken,
        });
        return response.data;
      } else {
        return null;
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            handleError({
              error,
              message: 'Operation already in progress',
            });
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            handleError({
              error,
              message: 'Play services not available or outdated',
            });
            break;
          default:
            handleError({error, message: 'Something went wrong'});
        }
      } else {
        handleError({error, message: 'Failed to sign in'});
      }
    }
  };

  const signOut = async () => {
    try {
      const user = GoogleSignin.getCurrentUser();

      if (!user) {
        return;
      }

      await GoogleSignin.signOut();
    } catch (error) {
      handleError({error, message: 'Error signing out'});
    }
  };

  return {signIn, signOut};
}
