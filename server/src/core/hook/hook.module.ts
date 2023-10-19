import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/database/prisma.module';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  imports: [PrismaModule],
  providers: [PrismaService],
})
export class HookModule {}
