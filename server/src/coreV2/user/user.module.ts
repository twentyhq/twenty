import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AbilityModule } from 'src/ability/ability.module';

import { User } from './user.entity';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AbilityModule],
  providers: [UserService, UserResolver],
})
export class UserModule {}
