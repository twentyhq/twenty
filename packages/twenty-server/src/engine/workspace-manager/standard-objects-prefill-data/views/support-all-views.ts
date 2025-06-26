import { AGGREGATE_OPERATIONS } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SUPPORT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

export const supportAllView = (objectMetadataItems: ObjectMetadataEntity[]) => {
  const supportObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.support,
  );

  if (!supportObjectMetadata) {
    throw new Error('Support object metadata not found');
  }

  return {
    name: 'All supports',
    objectMetadataId: supportObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    openRecordIn: ViewOpenRecordInType.RECORD_PAGE,
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          supportObjectMetadata.fields.find(
            (field) => field.standardId === SUPPORT_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          supportObjectMetadata.fields.find(
            (field) => field.standardId === SUPPORT_STANDARD_FIELD_IDS.statuses,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          supportObjectMetadata.fields.find(
            (field) => field.standardId === SUPPORT_STANDARD_FIELD_IDS.stage,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          supportObjectMetadata.fields.find(
            (field) => field.standardId === SUPPORT_STANDARD_FIELD_IDS.emails,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
        aggregateOperation: AGGREGATE_OPERATIONS.countUniqueValues,
      },
      {
        fieldMetadataId:
          supportObjectMetadata.fields.find(
            (field) => field.standardId === SUPPORT_STANDARD_FIELD_IDS.phones,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
        aggregateOperation: AGGREGATE_OPERATIONS.percentageEmpty,
      },
    ],
  };
};
