import {useMutation, useQueryClient} from '@tanstack/react-query';
import {z} from 'zod';
import Toast from 'react-native-toast-message';
import useAuthApi from '@/hooks/api/use-auth-api';

export const CreateTaskApiRequestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  dueDate: z.string().datetime(),
  reminderTime: z.string().datetime(),
  status: z.enum(['planned', 'in progress', 'completed']),
});

export type CreateTaskApiRequestType = z.infer<
  typeof CreateTaskApiRequestSchema
>;

export function useCreateTask() {
  const queryClient = useQueryClient();
  const {authApi} = useAuthApi();

  async function createTask(data: CreateTaskApiRequestType) {
    const res = await authApi
      .post('tasks', {
        json: data,
      })
      .json();

    return res;
  }
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['tasks']});
      Toast.show({
        type: 'success',
        text1: 'Task created successfully',
      });
    },
    onError(error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `${error.message}`,
      });
    },
  });
}

export const EditTaskApiRequestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  dueDate: z.string().datetime(),
  reminderTime: z.string().datetime(),
  status: z.enum(['planned', 'in progress', 'completed']),
});

export type EditTaskApiRequestType = z.infer<typeof EditTaskApiRequestSchema>;

export function useEditTask() {
  const queryClient = useQueryClient();
  const {authApi} = useAuthApi();

  async function editTask({
    taskId,
    data,
  }: {
    taskId: string;
    data: EditTaskApiRequestType;
  }) {
    const res = await authApi
      .put(`tasks/${taskId}`, {
        json: data,
      })
      .json();

    return res;
  }
  return useMutation({
    mutationFn: editTask,
    onSuccess: async () => {
      queryClient.invalidateQueries({queryKey: ['tasks']});
      Toast.show({
        type: 'success',
        text1: 'Task updated successfully',
      });
    },
    onError(error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `${error.message}`,
      });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const {authApi} = useAuthApi();

  async function deleteTask({taskId}: {taskId: string}) {
    const res = await authApi.delete(`tasks/${taskId}`);

    return res;
  }
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: async () => {
      queryClient.invalidateQueries({queryKey: ['tasks']});
      Toast.show({
        type: 'success',
        text1: 'Task deleted successfully',
      });
    },
    onError(error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `${error.message}`,
      });
    },
  });
}
