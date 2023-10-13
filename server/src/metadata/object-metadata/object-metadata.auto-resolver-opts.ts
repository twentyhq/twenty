import { SortDirection } from '@ptc-org/nestjs-query-core';
import {
  AutoResolverOpts,
  PagingStrategies,
  ReadResolverOpts,
} from '@ptc-org/nestjs-query-graphql';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

import { ObjectMetadata } from './object-metadata.entity';

import { ObjectMetadataService } from './services/object-metadata.service';
import { CreateObjectInput } from './dtos/create-object.input';
import { UpdateObjectInput } from './dtos/update-object.input';

export const objectMetadataAutoResolverOpts: AutoResolverOpts<
  any,
  any,
  unknown,
  unknown,
  ReadResolverOpts<any>,
  PagingStrategies
>[] = [
  {
    EntityClass: ObjectMetadata,
    DTOClass: ObjectMetadata,
    CreateDTOClass: CreateObjectInput,
    UpdateDTOClass: UpdateObjectInput,
    ServiceClass: ObjectMetadataService,
    enableTotalCount: true,
    pagingStrategy: PagingStrategies.CURSOR,
    read: {
      defaultSort: [{ field: 'id', direction: SortDirection.DESC }],
    },
    create: {
      many: { disabled: true },
    },
    update: {
      many: { disabled: true },
    },
    delete: { disabled: true },
    guards: [JwtAuthGuard],
  },
];
