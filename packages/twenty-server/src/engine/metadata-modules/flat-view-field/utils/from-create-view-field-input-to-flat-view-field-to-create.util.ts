import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { type CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export type FromCreateViewFieldInputToFlatViewFieldToCreateArgs = {
  createViewFieldInput: CreateViewFieldInput;
  flatApplication: FlatApplication;
} & Pick<AllFlatEntityMaps, 'flatFieldMetadataMaps' | 'flatViewMaps'>;

export const fromCreateViewFieldInputToFlatViewFieldToCreate = ({
  createViewFieldInput: rawCreateViewFieldInput,
  flatApplication,
  flatFieldMetadataMaps,
  flatViewMaps,
}: FromCreateViewFieldInputToFlatViewFieldToCreateArgs): UniversalFlatViewField & {
  id: string;
} => {
  const { fieldMetadataId, viewId, ...createViewFieldInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateViewFieldInput,
      ['aggregateOperation', 'fieldMetadataId', 'id', 'viewId'],
    );

  const createdAt = new Date().toISOString();
  const viewFieldId = createViewFieldInput.id ?? v4();

  const { fieldMetadataUniversalIdentifier, viewUniversalIdentifier } =
    resolveEntityRelationUniversalIdentifiers({
      metadataName: 'viewField',
      foreignKeyValues: { fieldMetadataId, viewId },
      flatEntityMaps: { flatFieldMetadataMaps, flatViewMaps },
    });

  return {
    id: viewFieldId,
    fieldMetadataUniversalIdentifier,
    viewUniversalIdentifier,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: createViewFieldInput.universalIdentifier ?? v4(),
    isVisible: createViewFieldInput.isVisible ?? true,
    size: createViewFieldInput.size ?? DEFAULT_VIEW_FIELD_SIZE,
    position: createViewFieldInput.position ?? 0,
    aggregateOperation: createViewFieldInput.aggregateOperation ?? null,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };
};
