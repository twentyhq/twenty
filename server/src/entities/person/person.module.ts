import { Module } from '@nestjs/common';
import { PersonRepository } from './person.repository';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PersonRepository],
  exports: [PersonRepository],
})
export class PersonModule {}
