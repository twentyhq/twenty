import { Injectable } from '@nestjs/common';

import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';
import { type RecordVisibilityRestrictionHandler } from 'src/engine/permissions/types/record-visibility-restriction-handler.type';

// TODO(@charlesBochet): replace with row-level security once it can express channel visibility
@Injectable()
export class RecordVisibilityRestrictionsService {
  private readonly handlersByObjectNameSingular = new Map<
    string,
    RecordVisibilityRestrictionHandler
  >();

  public registerHandler({
    objectNameSingular,
    handler,
  }: {
    objectNameSingular: string;
    handler: RecordVisibilityRestrictionHandler;
  }) {
    this.handlersByObjectNameSingular.set(objectNameSingular, handler);
  }

  public findRestrictedObjectNameSingulars(): ReadonlySet<string> {
    return new Set(this.handlersByObjectNameSingular.keys());
  }

  public async applyVisibilityRestrictions({
    objectNameSingular,
    ...visibilityRestrictionsInput
  }: {
    objectNameSingular: string;
    records: ObjectRecord[];
    authContext: WorkspaceAuthContext;
    permissionsPrincipals: PermissionsPrincipalsWithRolesContext | undefined;
    recordReadRestrictions: RecordReadRestrictions;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }): Promise<void> {
    if (!isNonEmptyArray(visibilityRestrictionsInput.records)) {
      return;
    }

    await this.handlersByObjectNameSingular
      .get(objectNameSingular)
      ?.applyVisibilityRestrictions(visibilityRestrictionsInput);
  }

  public async applyEventVisibilityRestrictions<
    TEvent extends ObjectRecordEvent,
  >({
    objectNameSingular,
    ...eventVisibilityRestrictionsInput
  }: {
    objectNameSingular: string;
    events: TEvent[];
    permissionsPrincipals: PermissionsPrincipalsWithRolesContext;
    recordReadRestrictions: RecordReadRestrictions;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }): Promise<TEvent[]> {
    const handler = this.handlersByObjectNameSingular.get(objectNameSingular);

    if (
      !isDefined(handler?.applyEventVisibilityRestrictions) ||
      !isNonEmptyArray(eventVisibilityRestrictionsInput.events)
    ) {
      return eventVisibilityRestrictionsInput.events;
    }

    return handler.applyEventVisibilityRestrictions(
      eventVisibilityRestrictionsInput,
    );
  }
}
