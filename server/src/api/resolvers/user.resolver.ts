import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UserRepository } from 'src/entities/user/user.repository';
import { User } from '../models/user.model';
import { CRUDResolver } from '@ptc-org/nestjs-query-graphql';
import { InjectQueryService, QueryService } from '@ptc-org/nestjs-query-core';

@Resolver(() => User)
export class UserResolver extends CRUDResolver(User) {
  constructor(
    @InjectQueryService(User) readonly service: QueryService<User>
  ) {
    super(service);
  }
}