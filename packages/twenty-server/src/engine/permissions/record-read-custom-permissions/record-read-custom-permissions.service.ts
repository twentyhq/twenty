import { Injectable, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { RECORD_READ_CUSTOM_PERMISSION_HANDLER_METADATA_KEY } from 'src/engine/permissions/record-read-custom-permissions/constants/record-read-custom-permission-handler-metadata-key.constant';
import { RECORD_READ_CUSTOM_PERMISSION_OBJECT_NAME_SINGULARS } from 'src/engine/permissions/record-read-custom-permissions/constants/record-read-custom-permission-object-name-singulars.constant';
import { type RecordReadCustomPermissionHandlerService } from 'src/engine/permissions/record-read-custom-permissions/types/record-read-custom-permission-handler-service.type';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';

// TODO(@charlesBochet): replace with row-level security once it can express channel visibility
@Injectable()
export class RecordReadCustomPermissionsService implements OnModuleInit {
  private readonly handlersByObjectNameSingular = new Map<
    string,
    RecordReadCustomPermissionHandlerService
  >();

  constructor(private readonly discoveryService: DiscoveryService) {}

  onModuleInit() {
    for (const { instance, metatype } of this.discoveryService.getProviders()) {
      if (!isDefined(instance) || !isDefined(metatype)) {
        continue;
      }

      const objectNameSingular: unknown = Reflect.getMetadata(
        RECORD_READ_CUSTOM_PERMISSION_HANDLER_METADATA_KEY,
        metatype,
      );

      if (!isNonEmptyString(objectNameSingular)) {
        continue;
      }

      if (
        !RECORD_READ_CUSTOM_PERMISSION_OBJECT_NAME_SINGULARS.has(
          objectNameSingular,
        )
      ) {
        throw new Error(
          `Read custom permission handler for "${objectNameSingular}" is missing from RECORD_READ_CUSTOM_PERMISSION_OBJECT_NAME_SINGULARS`,
        );
      }

      this.handlersByObjectNameSingular.set(objectNameSingular, instance);
    }
  }

  public findObjectNameSingulars(): ReadonlySet<string> {
    return RECORD_READ_CUSTOM_PERMISSION_OBJECT_NAME_SINGULARS;
  }

  public async restrictRecords({
    objectNameSingular,
    ...recordRestrictionInput
  }: {
    objectNameSingular: string;
    records: ObjectRecord[];
    authContext: WorkspaceAuthContext;
    permissionsPrincipals: PermissionsPrincipalsWithRolesContext | undefined;
    recordReadRestrictions: RecordReadRestrictions;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }): Promise<void> {
    if (
      !RECORD_READ_CUSTOM_PERMISSION_OBJECT_NAME_SINGULARS.has(
        objectNameSingular,
      ) ||
      !isNonEmptyArray(recordRestrictionInput.records)
    ) {
      return;
    }

    await this.findHandlerOrThrow(objectNameSingular).restrictRecords(
      recordRestrictionInput,
    );
  }

  public async restrictEvents<TEvent extends ObjectRecordEvent>({
    objectNameSingular,
    ...eventRestrictionInput
  }: {
    objectNameSingular: string;
    events: TEvent[];
    permissionsPrincipals: PermissionsPrincipalsWithRolesContext;
    recordReadRestrictions: RecordReadRestrictions;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }): Promise<TEvent[]> {
    if (
      !RECORD_READ_CUSTOM_PERMISSION_OBJECT_NAME_SINGULARS.has(
        objectNameSingular,
      ) ||
      !isNonEmptyArray(eventRestrictionInput.events)
    ) {
      return eventRestrictionInput.events;
    }

    const handler = this.findHandlerOrThrow(objectNameSingular);

    if (!isDefined(handler.restrictEvents)) {
      return eventRestrictionInput.events;
    }

    return handler.restrictEvents(eventRestrictionInput);
  }

  // A protected object without its handler must deny rather than serve unrestricted records
  private findHandlerOrThrow(
    objectNameSingular: string,
  ): RecordReadCustomPermissionHandlerService {
    const handler = this.handlersByObjectNameSingular.get(objectNameSingular);

    if (!isDefined(handler)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }

    return handler;
  }
}
