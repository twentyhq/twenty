import {
  AutoResolverOpts,
  PagingStrategies,
  ReadResolverOpts,
} from '@ptc-org/nestjs-query-graphql';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

import { RelationMetadata } from './relation-metadata.entity';

import { RelationMetadataService } from './services/relation-metadata.service';
import { CreateRelationInput } from './dtos/create-relation.input';

export const relationMetadataAutoResolverOpts: AutoResolverOpts<
  any,
  any,
  unknown,
  unknown,
  ReadResolverOpts<any>,
  PagingStrategies
>[] = [
  {
    EntityClass: RelationMetadata,
    DTOClass: RelationMetadata,
    ServiceClass: RelationMetadataService,
    CreateDTOClass: CreateRelationInput,
    enableTotalCount: true,
    pagingStrategy: PagingStrategies.CURSOR,
    read: { many: { disabled: true } },
    create: { many: { disabled: true } },
    update: { disabled: true },
    delete: { disabled: true },
    guards: [JwtAuthGuard],
  },
];
