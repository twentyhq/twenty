type TaskTarget = {
  avatarUrl: string;
  name: string;
};

export type Task = {
  body: string;
  done: boolean;
  due: string;
  id: string;
  target: TaskTarget;
  title: string;
};
