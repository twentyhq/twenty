import { Inject } from '@nestjs/common';

import { type EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

export const InjectWorkspaceScopedRepository = (
  entity: EntityClassOrSchema,
): ParameterDecorator => Inject(getWorkspaceScopedRepositoryToken(entity));
