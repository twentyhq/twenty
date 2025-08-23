import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { MKT_CUSTOMER_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

export const mktCustomersAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const itemObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktCustomer,
  );

  if (!itemObjectMetadata) {
    throw new Error('Customer object metadata not found');
  }

  return {
    name: 'All Customers',
    objectMetadataId: itemObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 10,
    icon: 'IconBox',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [],
    fields: [
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_CUSTOMER_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_CUSTOMER_FIELD_IDS.email,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_CUSTOMER_FIELD_IDS.phone,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_CUSTOMER_FIELD_IDS.taxCode,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_CUSTOMER_FIELD_IDS.address,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_CUSTOMER_FIELD_IDS.companyName,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
