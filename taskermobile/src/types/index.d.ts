import {HTTPError} from 'ky';

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  reminderTime: string;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type ExtendedHTTPError = HTTPError & {cause?: string};
