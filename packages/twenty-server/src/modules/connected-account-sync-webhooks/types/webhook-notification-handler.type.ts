export type WebhookNotificationHandler<TRequest> = {
  handle(request: TRequest): Promise<void>;
};
