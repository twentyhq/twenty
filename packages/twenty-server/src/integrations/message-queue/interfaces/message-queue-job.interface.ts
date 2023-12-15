export interface MessageQueueJob<T extends MessageQueueJobData> {
  handle(data: T): Promise<void> | void;
}

export interface MessageQueueJobData {
  [key: string]: any;
}
