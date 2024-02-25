export interface MessageQueueJob<T extends MessageQueueJobData | undefined> {
  handle(data: T): Promise<void> | void;
}

export interface MessageQueueCronJobData<
  T extends MessageQueueJobData | undefined,
> {
  handle(data: T): Promise<void> | void;
}

export interface MessageQueueJobData {
  [key: string]: any;
}
