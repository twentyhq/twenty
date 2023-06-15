import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserRelationsResolver } from './user-relations.resolver';

@Module({
  providers: [UserService, UserResolver, UserRelationsResolver],
})
export class UserModule {}
