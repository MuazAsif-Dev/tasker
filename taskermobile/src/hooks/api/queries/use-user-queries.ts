import {useQuery} from '@tanstack/react-query';

import useAuthApi from '@/hooks/api/use-auth-api';
import {z} from 'zod';

const UserApiResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    providers: z
      .array(
        z.object({
          provider: z.string(),
          providerId: z.string(),
        }),
      )
      .optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

export type UserApiResponseType = z.infer<typeof UserApiResponseSchema>;

export function useUserQuery() {
  const {authApi} = useAuthApi();

  const fetchUser = async (): Promise<UserApiResponseType> => {
    const response = await authApi.get('users/me').json();
    const validatedResponse = UserApiResponseSchema.safeParse(response);
    if (!validatedResponse.success) {
      throw new Error(
        `Failed to fetch user. ${validatedResponse.error.message}`,
      );
    }
    return validatedResponse.data;
  };

  return useQuery({
    queryKey: ['user'],
    retry: false,
    queryFn: fetchUser,
  });
}
