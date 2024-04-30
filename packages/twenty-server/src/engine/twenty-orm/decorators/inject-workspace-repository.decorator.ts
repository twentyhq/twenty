import { Inject } from '@nestjs/common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { getWorkspaceRepositoryToken } from 'src/engine/twenty-orm/utils/get-workspace-repository-token.util';

export const InjectWorkspaceRepository = (
  entity: EntityClassOrSchema,
): ReturnType<typeof Inject> => Inject(getWorkspaceRepositoryToken(entity));
