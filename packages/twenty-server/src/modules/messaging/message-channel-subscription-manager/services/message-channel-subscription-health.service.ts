import { Injectable, Logger } from '@nestjs/common';

const MAX_CONSECUTIVE_ERRORS = 5;
const HEALTH_CHECK_WINDOW_MS = 10 * 60 * 1000;

@Injectable()
export class MessageChannelSubscriptionHealthService {
  private readonly logger = new Logger(
    MessageChannelSubscriptionHealthService.name,
  );

  private lastMessageReceivedAt: Date | null = null;
  private lastErrorAt: Date | null = null;
  private consecutiveErrors = 0;
  private totalMessagesReceived = 0;
  private totalErrors = 0;
  private isSubscriberRunning = false;

  recordMessageReceived(): void {
    this.lastMessageReceivedAt = new Date();
    this.consecutiveErrors = 0;
    this.totalMessagesReceived++;
  }

  recordError(error: Error): void {
    this.lastErrorAt = new Date();
    this.consecutiveErrors++;
    this.totalErrors++;
    this.logger.error(
      `Pub/Sub error recorded (consecutive: ${this.consecutiveErrors}): ${error.message}`,
    );
  }

  setSubscriberRunning(isRunning: boolean): void {
    this.isSubscriberRunning = isRunning;
    this.logger.log(`Pub/Sub subscriber running: ${isRunning}`);
  }

  isHealthy(): boolean {
    if (!this.isSubscriberRunning) {
      return false;
    }

    if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      return false;
    }

    if (!this.lastMessageReceivedAt) {
      return true;
    }

    const timeSinceLastMessage =
      Date.now() - this.lastMessageReceivedAt.getTime();

    if (timeSinceLastMessage > HEALTH_CHECK_WINDOW_MS) {
      this.logger.warn(
        `No Pub/Sub messages received in ${timeSinceLastMessage / 1000}s`,
      );
    }

    return true;
  }

  getHealthStatus(): {
    isHealthy: boolean;
    isSubscriberRunning: boolean;
    lastMessageReceivedAt: Date | null;
    lastErrorAt: Date | null;
    consecutiveErrors: number;
    totalMessagesReceived: number;
    totalErrors: number;
  } {
    return {
      isHealthy: this.isHealthy(),
      isSubscriberRunning: this.isSubscriberRunning,
      lastMessageReceivedAt: this.lastMessageReceivedAt,
      lastErrorAt: this.lastErrorAt,
      consecutiveErrors: this.consecutiveErrors,
      totalMessagesReceived: this.totalMessagesReceived,
      totalErrors: this.totalErrors,
    };
  }

  resetErrors(): void {
    this.consecutiveErrors = 0;
  }
}
