import { Module } from '@nestjs/common';
import { CompanyRepository } from './company.repository';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CompanyRepository],
  exports: [CompanyRepository],
})
export class CompanyModule {}
