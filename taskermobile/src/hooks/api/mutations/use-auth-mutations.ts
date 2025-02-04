import {useMutation} from '@tanstack/react-query';
import {z} from 'zod';

import Toast from 'react-native-toast-message';
import {useAuthActions, useAuthStore} from '@/hooks/store/auth';
import {api} from '@/config/api';
import {ExtendedHTTPError} from '@/types';

export const LoginApiRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginApiRequestType = z.infer<typeof LoginApiRequestSchema>;

export function useLogin() {
  const {setAccessToken} = useAuthActions();
  const fcmToken = useAuthStore(state => state.fcmToken);

  async function login(data: LoginApiRequestType) {
    const res = await api
      .post('users/login', {
        json: {...data, fcmToken},
      })
      .json();

    return res as {token: string};
  }
  return useMutation({
    mutationFn: login,
    onSuccess: async res => {
      setAccessToken(res.token);
    },
    onError(error: ExtendedHTTPError) {
      Toast.show({
        type: 'error',
        text1: `${error.message}`,
        text2: `${error.cause}`,
      });
    },
  });
}

export const RegisterApiRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(3, 'Name must be at least 3 characters'),
});

export type RegisterApiRequestType = z.infer<typeof RegisterApiRequestSchema>;

export function useRegister() {
  const fcmToken = useAuthStore(state => state.fcmToken);

  async function register(data: RegisterApiRequestType) {
    const res = await api
      .post('users/signup', {
        json: {...data, fcmToken},
      })
      .json();

    return res as {token: string};
  }
  return useMutation({
    mutationFn: register,
    onError(error: ExtendedHTTPError) {
      Toast.show({
        type: 'error',
        text1: `${error.message}`,
        text2: `${error.cause}`,
      });
    },
  });
}

export const GoogleOAuthVerificationApiRequestSchema = z.object({
  name: z.string().nullable(),
  email: z.string().email(),
  token: z.string(),
});

export type GoogleOAuthVerificationApiRequestType = z.infer<
  typeof GoogleOAuthVerificationApiRequestSchema
>;

export function useGoogleOAuthVerification() {
  const {setAccessToken} = useAuthActions();
  const fcmToken = useAuthStore(state => state.fcmToken);

  async function googleOAuthVerification(
    data: GoogleOAuthVerificationApiRequestType,
  ) {
    const res = await api
      .post('users/google-login', {
        json: {...data, fcmToken},
      })
      .json();

    return res as {token: string};
  }
  return useMutation({
    mutationFn: googleOAuthVerification,
    onSuccess: async res => {
      setAccessToken(res.token);
    },
    onError(error: ExtendedHTTPError) {
      Toast.show({
        type: 'error',
        text1: `${error.message}`,
        text2: `${error.cause}`,
      });
    },
  });
}
