import { type MessageDescriptor } from '@lingui/core';

type TaskTarget = {
  avatarUrl: string;
  name: string;
};

export type Task = {
  body: MessageDescriptor;
  done: boolean;
  due: string;
  id: string;
  target: TaskTarget;
  title: MessageDescriptor;
};
