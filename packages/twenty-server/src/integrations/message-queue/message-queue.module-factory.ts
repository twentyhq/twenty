import { EnvironmentService } from 'src/integrations/environment/environment.service';
import {
  MessageQueueDriverType,
  MessageQueueModuleOptions,
} from 'src/integrations/message-queue/interfaces';

/**
 * MessageQueue Module factory
 * @param environment
 * @returns MessageQueueModuleOptions
 */
export const messageQueueModuleFactory = async (
  environmentService: EnvironmentService,
): Promise<MessageQueueModuleOptions> => {
  const driverType = environmentService.getMessageQueueDriverType();

  switch (driverType) {
    case MessageQueueDriverType.Sync: {
      return {
        type: MessageQueueDriverType.Sync,
        options: {},
      };
    }
    case MessageQueueDriverType.PgBoss: {
      const connectionString = environmentService.getPGDatabaseUrl();

      return {
        type: MessageQueueDriverType.PgBoss,
        options: {
          connectionString,
        },
      };
    }
    case MessageQueueDriverType.BullMQ: {
      const host = environmentService.getRedisHost();
      const port = environmentService.getRedisPort();

      return {
        type: MessageQueueDriverType.BullMQ,
        options: {
          connection: {
            host,
            port,
          },
        },
      };
    }
    default:
      throw new Error(
        `Invalid message queue driver type (${driverType}), check your .env file`,
      );
  }
};
