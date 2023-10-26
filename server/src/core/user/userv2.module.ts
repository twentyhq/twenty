import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserV2Service } from './userv2.service';
import { UserV2 } from './userv2.entity';
import { UserV2Resolver } from './userv2.resolver';

import { AbilityModule } from '~/ability/ability.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserV2]), AbilityModule],
  providers: [UserV2Service, UserV2Resolver],
})
export class UserV2Module {}
