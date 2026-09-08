import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { PersonRelationshipNameService } from 'src/modules/enso/person-relationship/services/person-relationship-name.service';

@Injectable()
@WorkspaceQueryHook(`personRelationship.updateOne`)
export class PersonRelationshipUpdateOnePreQueryHook implements WorkspacePreQueryHookInstance {
  constructor(
    private readonly personRelationshipNameService: PersonRelationshipNameService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<Record<string, unknown>>,
  ): Promise<UpdateOneResolverArgs<Record<string, unknown>>> {
    if (!isDefined(payload.data)) {
      return payload;
    }

    // Only recompute when an input that feeds the name actually changed.
    const touchesNameInputs =
      'relatedPersonId' in payload.data || 'relationType' in payload.data;

    if (!touchesNameInputs) {
      return payload;
    }

    const name = await this.personRelationshipNameService.computeName(
      authContext,
      { ...payload.data, id: payload.id },
    );

    if (!isDefined(name)) {
      return payload;
    }

    return { ...payload, data: { ...payload.data, name } };
  }
}
