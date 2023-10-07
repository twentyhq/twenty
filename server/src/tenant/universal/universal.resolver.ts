import { Query, Resolver } from '@nestjs/graphql';
import { ForbiddenException, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

import { UniversalEntity } from './universal.entity';

@UseGuards(JwtAuthGuard)
@Resolver(() => UniversalEntity)
export class UniversalResolver {
  constructor(private readonly environmentService: EnvironmentService) {}

  @Query(() => UniversalEntity)
  updateOneCustom(): UniversalEntity {
    if (!this.environmentService.isFlexibleBackendEnabled()) {
      throw new ForbiddenException();
    }

    return {
      id: 'exampleId',
      data: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  @Query(() => UniversalEntity)
  deleteOneCustom(): UniversalEntity {
    if (!this.environmentService.isFlexibleBackendEnabled()) {
      throw new ForbiddenException();
    }

    return {
      id: 'exampleId',
      data: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
