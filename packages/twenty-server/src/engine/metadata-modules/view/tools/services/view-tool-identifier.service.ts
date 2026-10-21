import { Injectable } from '@nestjs/common';

import {
  ViewCalendarLayout,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';

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
    private readonly viewService: ViewService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async resolveObjectMetadataId({
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

    if (!objectMetadataId) {
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

    if (!fieldMetadata) {
      throw new ViewException(
        `Field "${fieldName}" not found on this object. Use get_field_metadata to list available fields.`,
        ViewExceptionCode.INVALID_VIEW_DATA,
      );
    }

    return fieldMetadata;
  }

  async resolveFieldMetadataId({
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
      return this.resolveFieldMetadataId({
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
    workspaceId,
    userWorkspaceId,
  }: {
    input: {
      id?: string;
      objectNameSingular?: string;
      type?: ViewType;
      mainGroupByFieldName?: string;
      kanbanAggregateOperationFieldName?: string;
      calendarLayout?: ViewCalendarLayout;
      calendarFieldName?: string;
      calendarEndFieldName?: string;
    };
    workspaceId: string;
    userWorkspaceId?: string;
  }): Promise<UpsertCompleteViewIdentifiers> {
    if (isDefined(input.id)) {
      const existingView = await this.viewService.findById(
        input.id,
        workspaceId,
      );

      if (!existingView) {
        throw new ViewException(
          `View with id ${input.id} not found`,
          ViewExceptionCode.VIEW_NOT_FOUND,
        );
      }

      if (
        existingView.visibility === ViewVisibility.UNLISTED &&
        existingView.createdByUserWorkspaceId !== userWorkspaceId
      ) {
        throw new ViewException(
          'You can only update your own unlisted views',
          ViewExceptionCode.VIEW_MODIFY_PERMISSION_DENIED,
        );
      }

      const calendarEndFieldMetadataId = isDefined(input.calendarEndFieldName)
        ? await this.resolveFieldMetadataId({
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

    const objectMetadataId = await this.resolveObjectMetadataId({
      workspaceId,
      objectNameSingular: input.objectNameSingular,
    });

    if (
      input.type === ViewType.KANBAN &&
      !isDefined(input.mainGroupByFieldName)
    ) {
      throw new ViewException(
        'KANBAN views require mainGroupByFieldName. Provide a SELECT or many-to-one relation field name (e.g. "stage").',
        ViewExceptionCode.INVALID_VIEW_DATA,
      );
    }

    if (input.type === ViewType.CALENDAR) {
      if (!isDefined(input.calendarFieldName)) {
        throw new ViewException(
          'CALENDAR views require calendarFieldName (a DATE or DATE_TIME field name).',
          ViewExceptionCode.INVALID_VIEW_DATA,
        );
      }

      if (!isDefined(input.calendarLayout)) {
        throw new ViewException(
          'CALENDAR views require calendarLayout. Provide one of: "DAY", "WEEK", "MONTH".',
          ViewExceptionCode.INVALID_VIEW_DATA,
        );
      }
    }

    const mainGroupByFieldMetadataId = isDefined(input.mainGroupByFieldName)
      ? await this.resolveFieldMetadataId({
          workspaceId,
          objectMetadataId,
          fieldName: input.mainGroupByFieldName,
        })
      : undefined;

    const kanbanAggregateOperationFieldMetadataId = isDefined(
      input.kanbanAggregateOperationFieldName,
    )
      ? await this.resolveFieldMetadataId({
          workspaceId,
          objectMetadataId,
          fieldName: input.kanbanAggregateOperationFieldName,
        })
      : undefined;

    const calendarFieldMetadataId = isDefined(input.calendarFieldName)
      ? await this.resolveFieldMetadataId({
          workspaceId,
          objectMetadataId,
          fieldName: input.calendarFieldName,
        })
      : undefined;

    const calendarEndFieldMetadataId = isDefined(input.calendarEndFieldName)
      ? await this.resolveFieldMetadataId({
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
