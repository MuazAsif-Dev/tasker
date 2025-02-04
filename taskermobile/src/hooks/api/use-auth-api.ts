import {api} from '@/config/api';
import {useAuthStore} from '@/hooks/store/auth';

export default function useAuthApi() {
  const {accessToken} = useAuthStore();

  const authApi = api.extend({
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return {
    authApi,
  };
}
