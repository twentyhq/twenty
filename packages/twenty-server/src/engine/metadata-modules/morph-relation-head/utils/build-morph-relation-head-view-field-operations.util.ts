import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { fromUpdateViewFieldInputToFlatViewFieldToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view-field/utils/from-update-view-field-input-to-flat-view-field-to-update-or-throw.util';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export const buildMorphRelationHeadViewFieldOperations = ({
  isMorphRelationHeadEnabled,
  destinationFieldByOriginFieldId,
  workspaceCustomApplicationUniversalIdentifier,
  flatViewFieldMaps,
  flatViewFieldGroupMaps,
}: {
  isMorphRelationHeadEnabled: boolean;
  destinationFieldByOriginFieldId: Map<string, FlatFieldMetadata>;
  workspaceCustomApplicationUniversalIdentifier: string;
  flatViewFieldMaps: FlatEntityMaps<FlatViewField>;
  flatViewFieldGroupMaps: FlatEntityMaps<FlatViewFieldGroup>;
}): {
  viewFieldsToCreate: FlatViewField[];
  viewFieldsToUpdate: UniversalFlatViewField[];
  viewFieldsToDelete: FlatViewField[];
} => {
  const viewFields = Object.values(flatViewFieldMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter((viewField) => !isDefined(viewField.deletedAt));
  const viewFieldByViewAndFieldId = new Map(
    viewFields.map((viewField) => [
      `${viewField.viewId}:${viewField.fieldMetadataId}`,
      viewField,
    ]),
  );

  const viewFieldsToCreate: FlatViewField[] = [];
  const viewFieldsToUpdate: UniversalFlatViewField[] = [];
  const viewFieldsToDelete: FlatViewField[] = [];

  for (const viewField of viewFields) {
    const destination = destinationFieldByOriginFieldId.get(
      viewField.fieldMetadataId,
    );

    if (!isDefined(destination)) {
      continue;
    }

    if (!isMorphRelationHeadEnabled) {
      viewFieldsToDelete.push(viewField);
    }

    const destinationKey = `${viewField.viewId}:${destination.id}`;
    const destinationViewField = viewFieldByViewAndFieldId.get(destinationKey);
    const { isVisible, size, position, aggregateOperation, viewFieldGroupId } =
      resolveEffectiveFlatEntity({
        metadataName: 'viewField',
        flatEntity: viewField,
      });
    const presentation = {
      isVisible,
      size,
      position,
      aggregateOperation,
      viewFieldGroupId,
    };

    if (isDefined(destinationViewField)) {
      viewFieldsToUpdate.push(
        fromUpdateViewFieldInputToFlatViewFieldToUpdateOrThrow({
          updateViewFieldInput: {
            id: destinationViewField.id,
            update: {
              ...presentation,
              aggregateOperation: aggregateOperation ?? undefined,
            },
          },
          flatViewFieldMaps,
          flatViewFieldGroupMaps,
          callerApplicationUniversalIdentifier:
            workspaceCustomApplicationUniversalIdentifier,
          workspaceCustomApplicationUniversalIdentifier,
        }),
      );
      continue;
    }

    const createdViewField = {
      ...viewField,
      ...presentation,
      viewFieldGroupUniversalIdentifier: isDefined(viewFieldGroupId)
        ? (flatViewFieldGroupMaps.universalIdentifierById[viewFieldGroupId] ??
          null)
        : null,
      overrides: null,
      universalOverrides: null,
      id: v4(),
      universalIdentifier: v4(),
      fieldMetadataId: destination.id,
      fieldMetadataUniversalIdentifier: destination.universalIdentifier,
      applicationUniversalIdentifier:
        workspaceCustomApplicationUniversalIdentifier,
    };

    viewFieldByViewAndFieldId.set(destinationKey, createdViewField);
    viewFieldsToCreate.push(createdViewField);
  }

  return { viewFieldsToCreate, viewFieldsToUpdate, viewFieldsToDelete };
};
