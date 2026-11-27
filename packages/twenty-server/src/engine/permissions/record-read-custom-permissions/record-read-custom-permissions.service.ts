import { Injectable, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { RECORD_READ_CUSTOM_PERMISSION_HANDLER_METADATA_KEY } from 'src/engine/permissions/record-read-custom-permissions/constants/record-read-custom-permission-handler-metadata-key.constant';
import { RECORD_READ_CUSTOM_PERMISSION_OBJECT_NAME_SINGULARS } from 'src/engine/permissions/record-read-custom-permissions/constants/record-read-custom-permission-object-name-singulars.constant';
import {
  type RecordReadCustomPermissionEventsInput,
  type RecordReadCustomPermissionHandlerService,
  type RecordReadCustomPermissionRecordsInput,
} from 'src/engine/permissions/record-read-custom-permissions/types/record-read-custom-permission-handler-service.type';

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
        throw new PermissionsException(
          `Read custom permission handler for "${objectNameSingular}" is missing from RECORD_READ_CUSTOM_PERMISSION_OBJECT_NAME_SINGULARS`,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }

      this.handlersByObjectNameSingular.set(objectNameSingular, instance);
    }
  }

  public async restrictRecords({
    objectNameSingular,
    ...recordRestrictionInput
  }: RecordReadCustomPermissionRecordsInput & {
    objectNameSingular: string;
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
  }: RecordReadCustomPermissionEventsInput<TEvent> & {
    objectNameSingular: string;
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
