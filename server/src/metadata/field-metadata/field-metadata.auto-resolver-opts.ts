import { SortDirection } from '@ptc-org/nestjs-query-core';
import {
  AutoResolverOpts,
  PagingStrategies,
  ReadResolverOpts,
} from '@ptc-org/nestjs-query-graphql';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

import { FieldMetadata } from './field-metadata.entity';

import { FieldMetadataService } from './services/field-metadata.service';
import { CreateFieldInput } from './dtos/create-field.input';
import { UpdateFieldInput } from './dtos/update-field.input';

export const fieldMetadataAutoResolverOpts: AutoResolverOpts<
  any,
  any,
  unknown,
  unknown,
  ReadResolverOpts<any>,
  PagingStrategies
>[] = [
  {
    EntityClass: FieldMetadata,
    DTOClass: FieldMetadata,
    CreateDTOClass: CreateFieldInput,
    UpdateDTOClass: UpdateFieldInput,
    ServiceClass: FieldMetadataService,
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
