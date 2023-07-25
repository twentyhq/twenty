import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { Prisma, PrismaClient } from '@prisma/client';
import { createPrismaQueryEventHandler } from 'prisma-query-log';

import { EnvironmentService } from 'src/integrations/environment/environment.service';

// Prepare Prisma extenstion ability
const createPrismaClient = (options: Prisma.PrismaClientOptions) => {
  const client = new PrismaClient(options);

  return client;
};

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

@Injectable()
export class PrismaService implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private prismaClient!: ExtendedPrismaClient;

  public get client(): ExtendedPrismaClient {
    return this.prismaClient;
  }

  constructor(private readonly environmentService: EnvironmentService) {
    const debugMode = environmentService.isDebugMode();

    this.prismaClient = createPrismaClient({
      errorFormat: 'minimal',
      log: debugMode
        ? [
            {
              level: 'query',
              emit: 'event',
            },
          ]
        : undefined,
    });

    if (debugMode) {
      const logHandler = createPrismaQueryEventHandler({
        logger: (query: string) => {
          this.logger.log(query, 'PrismaClient');
        },
        format: false,
        colorQuery: '\u001B[96m',
        colorParameter: '\u001B[90m',
      });

      this.prismaClient.$on('query' as any, logHandler);
    }
  }

  async onModuleInit(): Promise<void> {
    await this.prismaClient.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.prismaClient.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
