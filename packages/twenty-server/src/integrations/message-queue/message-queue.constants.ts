export const QUEUE_DRIVER = Symbol('QUEUE_DRIVER');

export enum MessageQueue {
  taskAssignedQueue = 'task-assigned-queue',
  messagingQueue = 'messaging-queue',
  webhookQueue = 'webhook-queue',
}
