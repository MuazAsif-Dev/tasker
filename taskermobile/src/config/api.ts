import {env} from '@/config/env';
import {ExtendedHTTPError} from '@/types';
import ky from 'ky';
import {Platform} from 'react-native';

export const api = ky.create({
  prefixUrl:
    env.NODE_ENV === 'development'
      ? Platform.OS === 'android'
        ? env.ANDROID_API_URL
        : env.IOS_API_URL
      : env.API_URL,
  hooks: {
    beforeError: [
      async (error: ExtendedHTTPError) => {
        const {response} = error;
        const data = (await response.json()) as {
          message?: string;
          cause?: string;
        };

        if (data?.message && data?.cause) {
          error.message = data.message;
          error.cause = data.cause;
        }
        return error;
      },
    ],
  },
});
