import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserV2Service } from './userv2.service';
import { UserV2Resolver } from './userv2.resolver';
import { User } from './user.entity';

import { AbilityModule } from '~/ability/ability.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AbilityModule],
  providers: [UserV2Service, UserV2Resolver],
})
export class UserModule {}
