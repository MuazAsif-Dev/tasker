import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {Task} from './index';
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Welcome: undefined;
  ForgotPassword: undefined;
};

type AuthScreenProps<Screen extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, Screen>;

export type WelcomeScreenProps = AuthScreenProps<'Welcome'>;
export type LoginScreenProps = AuthScreenProps<'Login'>;
export type RegisterScreenProps = AuthScreenProps<'Register'>;

export type TaskStackParamList = {
  TaskList: undefined;
  TaskCreate: undefined;
  TaskEdit: {task: Task};
};

type TaskScreenProps<Screen extends keyof TaskStackParamList> =
  NativeStackScreenProps<TaskStackParamList, Screen>;

export type TaskListScreenProps = TaskScreenProps<'TaskList'>;
export type TaskCreateScreenProps = TaskScreenProps<'TaskCreate'>;
export type TaskEditScreenProps = TaskScreenProps<'TaskEdit'>;
