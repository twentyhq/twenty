import { Injectable } from '@nestjs/common';

import {
  FieldMetadataType,
  ViewCalendarLayout,
  ViewType,
} from 'twenty-shared/types';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { type ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';

type FieldReference = { fieldName?: string; fieldMetadataId?: string };

type UpsertCompleteViewIdentifiers = {
  existingViewId?: string;
  objectMetadataId: string;
  mainGroupByFieldMetadataId?: string;
  kanbanAggregateOperationFieldMetadataId?: string;
  calendarFieldMetadataId?: string;
  calendarEndFieldMetadataId?: string;
};

@Injectable()
export class ViewToolIdentifierService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async resolveObjectMetadataIdOrThrow({
    workspaceId,
    objectNameSingular,
  }: {
    workspaceId: string;
    objectNameSingular: string;
  }): Promise<string> {
    const { flatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const { idByNameSingular } = buildObjectIdByNameMaps(
      flatObjectMetadataMaps,
    );

    const objectMetadataId = idByNameSingular[objectNameSingular];

    if (!isDefined(objectMetadataId)) {
      throw new ViewException(
        `Object "${objectNameSingular}" not found. Use get_object_metadata to list available objects.`,
        ViewExceptionCode.INVALID_VIEW_DATA,
      );
    }

    return objectMetadataId;
  }

  private async findFlatFieldMetadataByNameOrThrow({
    workspaceId,
    objectMetadataId,
    fieldName,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    fieldName: string;
  }): Promise<FlatFieldMetadata> {
    const { flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        },
      );

    const fieldMetadata = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    ).find(
      (field) =>
        field?.name === fieldName &&
        field?.objectMetadataId === objectMetadataId,
    );

    if (!isDefined(fieldMetadata)) {
      throw new ViewException(
        `Field "${fieldName}" not found on this object. Use get_field_metadata to list available fields.`,
        ViewExceptionCode.INVALID_VIEW_DATA,
      );
    }

    return fieldMetadata;
  }

  async resolveFieldMetadataIdOrThrow({
    workspaceId,
    objectMetadataId,
    fieldName,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    fieldName: string;
  }): Promise<string> {
    const fieldMetadata = await this.findFlatFieldMetadataByNameOrThrow({
      workspaceId,
      objectMetadataId,
      fieldName,
    });

    return fieldMetadata.id;
  }

  async resolveGroupByFieldMetadataIdOrThrow({
    workspaceId,
    objectMetadataId,
    fieldName,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    fieldName: string;
  }): Promise<string> {
    const fieldMetadata = await this.findFlatFieldMetadataByNameOrThrow({
      workspaceId,
      objectMetadataId,
      fieldName,
    });

    if (fieldMetadata.type !== FieldMetadataType.SELECT) {
      throw new ViewException(
        `Field "${fieldName}" has type "${fieldMetadata.type}" and cannot be used as a group-by field. Only SELECT fields are supported for grouping (board columns and table groups).`,
        ViewExceptionCode.INVALID_VIEW_DATA,
      );
    }

    return fieldMetadata.id;
  }

  async resolveCalendarFieldMetadataIdOrThrow({
    workspaceId,
    objectMetadataId,
    fieldName,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    fieldName: string;
  }): Promise<string> {
    const fieldMetadata = await this.findFlatFieldMetadataByNameOrThrow({
      workspaceId,
      objectMetadataId,
      fieldName,
    });

    if (!isFieldMetadataDateKind(fieldMetadata.type)) {
      throw new ViewException(
        `Field "${fieldName}" has type "${fieldMetadata.type}" and cannot be used as a calendar field. Only DATE or DATE_TIME fields are supported.`,
        ViewExceptionCode.INVALID_VIEW_DATA,
      );
    }

    return fieldMetadata.id;
  }

  async getFieldMetadataIdOrThrow({
    workspaceId,
    objectMetadataId,
    reference,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    reference: FieldReference;
  }): Promise<string> {
    if (isDefined(reference.fieldMetadataId)) {
      return reference.fieldMetadataId;
    }

    if (isDefined(reference.fieldName)) {
      return this.resolveFieldMetadataIdOrThrow({
        workspaceId,
        objectMetadataId,
        fieldName: reference.fieldName,
      });
    }

    throw new ViewException(
      'Each field, filter, and sort entry must provide either fieldName or fieldMetadataId.',
      ViewExceptionCode.INVALID_VIEW_DATA,
    );
  }

  async resolveUpsertCompleteViewIdentifiersOrThrow({
    input,
    existingView,
    workspaceId,
  }: {
    input: {
      objectNameSingular?: string;
      type?: ViewType;
      mainGroupByFieldName?: string;
      kanbanAggregateOperationFieldName?: string;
      calendarLayout?: ViewCalendarLayout;
      calendarFieldName?: string;
      calendarEndFieldName?: string;
    };
    existingView?: ViewDTO;
    workspaceId: string;
  }): Promise<UpsertCompleteViewIdentifiers> {
    if (isDefined(existingView)) {
      const calendarEndFieldMetadataId = isDefined(input.calendarEndFieldName)
        ? await this.resolveCalendarFieldMetadataIdOrThrow({
            workspaceId,
            objectMetadataId: existingView.objectMetadataId,
            fieldName: input.calendarEndFieldName,
          })
        : undefined;

      return {
        existingViewId: existingView.id,
        objectMetadataId: existingView.objectMetadataId,
        calendarEndFieldMetadataId,
      };
    }

    if (!isDefined(input.objectNameSingular)) {
      throw new ViewException(
        'objectNameSingular is required when creating a view (no id provided).',
        ViewExceptionCode.INVALID_VIEW_DATA,
      );
    }

    const objectMetadataId = await this.resolveObjectMetadataIdOrThrow({
      workspaceId,
      objectNameSingular: input.objectNameSingular,
    });

    if (
      input.type === ViewType.KANBAN &&
      !isDefined(input.mainGroupByFieldName)
    ) {
      throw new ViewException(
        'KANBAN views require mainGroupByFieldName. Provide a SELECT field name (e.g. "stage").',
        ViewExceptionCode.INVALID_VIEW_DATA,
      );
    }

    if (
      input.type === ViewType.CALENDAR &&
      !isDefined(input.calendarFieldName)
    ) {
      throw new ViewException(
        'CALENDAR views require calendarFieldName (a DATE or DATE_TIME field name).',
        ViewExceptionCode.INVALID_VIEW_DATA,
      );
    }

    if (input.type === ViewType.CALENDAR && !isDefined(input.calendarLayout)) {
      throw new ViewException(
        'CALENDAR views require calendarLayout. Provide one of: "DAY", "WEEK", "MONTH".',
        ViewExceptionCode.INVALID_VIEW_DATA,
      );
    }

    const mainGroupByFieldMetadataId = isDefined(input.mainGroupByFieldName)
      ? await this.resolveGroupByFieldMetadataIdOrThrow({
          workspaceId,
          objectMetadataId,
          fieldName: input.mainGroupByFieldName,
        })
      : undefined;

    const kanbanAggregateOperationFieldMetadataId = isDefined(
      input.kanbanAggregateOperationFieldName,
    )
      ? await this.resolveFieldMetadataIdOrThrow({
          workspaceId,
          objectMetadataId,
          fieldName: input.kanbanAggregateOperationFieldName,
        })
      : undefined;

    const calendarFieldMetadataId = isDefined(input.calendarFieldName)
      ? await this.resolveCalendarFieldMetadataIdOrThrow({
          workspaceId,
          objectMetadataId,
          fieldName: input.calendarFieldName,
        })
      : undefined;

    const calendarEndFieldMetadataId = isDefined(input.calendarEndFieldName)
      ? await this.resolveCalendarFieldMetadataIdOrThrow({
          workspaceId,
          objectMetadataId,
          fieldName: input.calendarEndFieldName,
        })
      : undefined;

    return {
      objectMetadataId,
      mainGroupByFieldMetadataId,
      kanbanAggregateOperationFieldMetadataId,
      calendarFieldMetadataId,
      calendarEndFieldMetadataId,
    };
  }
}
