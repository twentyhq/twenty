import { Command, CommandRunner } from 'nest-commander';

import { PrismaService } from 'src/database/prisma.service';

@Command({
  name: 'database:migrate-old-schema',
  description: 'Migrate old database data into new database',
})
export class MigrateOldSchemaCommand extends CommandRunner {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }
  async run() {
    const workspaces = await this.prismaService.client.workspace.findMany();
  }
}
