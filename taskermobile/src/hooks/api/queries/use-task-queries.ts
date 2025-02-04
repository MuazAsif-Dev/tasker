import {useQuery} from '@tanstack/react-query';

import useAuthApi from '@/hooks/api/use-auth-api';
import {z} from 'zod';

const TaskApiResponseSchema = z.object({
  message: z.string(),
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      dueDate: z.string(),
      reminderTime: z.string(),
      status: z.string(),
      userId: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  ),
});

export type TaskApiResponseType = z.infer<typeof TaskApiResponseSchema>;

export function useTasksQuery() {
  const {authApi} = useAuthApi();

  const fetchTasks = async (): Promise<TaskApiResponseType> => {
    const response = await authApi.get('tasks/me').json();
    const validatedResponse = TaskApiResponseSchema.safeParse(response);
    if (!validatedResponse.success) {
      throw new Error(
        `Failed to fetch tasks. ${validatedResponse.error.message}`,
      );
    }

    return validatedResponse.data;
  };

  return useQuery({
    queryKey: ['tasks'],
    retry: false,
    queryFn: fetchTasks,
  });
}
