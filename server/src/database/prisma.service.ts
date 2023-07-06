import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createPrismaQueryEventHandler } from 'prisma-query-log';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { Stage } from 'src/integrations/environment/interfaces/stage.interface';

// TODO: Check if this is still needed
if (!global.prisma) {
  global.prisma = new PrismaClient();
}
export default global.prisma;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly environmentService: EnvironmentService) {
    const stage = environmentService.getStage();
    super({
      errorFormat: 'minimal',
      log:
        stage === Stage.Development
          ? [
              {
                level: 'query',
                emit: 'event',
              },
            ]
          : undefined,
    });

    if (stage === Stage.Development) {
      const logHandler = createPrismaQueryEventHandler({
        logger: (query: string) => {
          this.logger.log(query, 'PrismaClient');
        },
        format: false,
        colorQuery: '\u001B[96m',
        colorParameter: '\u001B[90m',
      });

      this.$on('query' as any, logHandler);
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
