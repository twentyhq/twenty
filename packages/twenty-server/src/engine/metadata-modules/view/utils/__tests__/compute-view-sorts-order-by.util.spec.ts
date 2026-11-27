import { FieldMetadataType, ViewSortDirection } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { computeViewSortsOrderBy } from 'src/engine/metadata-modules/view/utils/compute-view-sorts-order-by.util';

const personNameField = getFlatFieldMetadataMock({
  id: 'person-name-field-id',
  universalIdentifier: 'person-name-field',
  objectMetadataId: 'person-object-id',
  type: FieldMetadataType.TEXT,
  name: 'jobTitle',
});

const personCompanyField = getFlatFieldMetadataMock({
  id: 'person-company-field-id',
  universalIdentifier: 'person-company-field',
  objectMetadataId: 'person-object-id',
  type: FieldMetadataType.RELATION,
  name: 'company',
  relationTargetObjectMetadataId: 'company-object-id',
});

const companyEmployeesField = getFlatFieldMetadataMock({
  id: 'company-employees-field-id',
  universalIdentifier: 'company-employees-field',
  objectMetadataId: 'company-object-id',
  type: FieldMetadataType.NUMBER,
  name: 'employees',
});

const companyAddressField = getFlatFieldMetadataMock({
  id: 'company-address-field-id',
  universalIdentifier: 'company-address-field',
  objectMetadataId: 'company-object-id',
  type: FieldMetadataType.ADDRESS,
  name: 'address',
});

const flatFieldMetadataMaps = [
  personNameField,
  personCompanyField,
  companyEmployeesField,
  companyAddressField,
].reduce<FlatEntityMaps<FlatFieldMetadata>>(
  (flatEntityMaps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
  createEmptyFlatEntityMaps(),
);

describe('computeViewSortsOrderBy', () => {
  it('orders by the sorted field itself when the sort has no relation target', () => {
    expect(
      computeViewSortsOrderBy({
        viewSorts: [
          {
            fieldMetadataId: personNameField.id,
            direction: ViewSortDirection.ASC,
            subFieldName: null,
            relationTargetFieldMetadataId: null,
          },
        ],
        flatFieldMetadataMaps,
      }),
    ).toEqual([{ jobTitle: 'AscNullsFirst' }]);
  });

  it('orders by a scalar field of the related record', () => {
    expect(
      computeViewSortsOrderBy({
        viewSorts: [
          {
            fieldMetadataId: personCompanyField.id,
            direction: ViewSortDirection.DESC,
            subFieldName: null,
            relationTargetFieldMetadataId: companyEmployeesField.id,
          },
        ],
        flatFieldMetadataMaps,
      }),
    ).toEqual([{ company: { employees: 'DescNullsLast' } }]);
  });

  it('orders by the selected sub-field of a composite field of the related record', () => {
    expect(
      computeViewSortsOrderBy({
        viewSorts: [
          {
            fieldMetadataId: personCompanyField.id,
            direction: ViewSortDirection.ASC,
            subFieldName: 'addressCountry',
            relationTargetFieldMetadataId: companyAddressField.id,
          },
        ],
        flatFieldMetadataMaps,
      }),
    ).toEqual([{ company: { address: { addressCountry: 'AscNullsFirst' } } }]);
  });

  it('skips a sort whose relation target field no longer exists', () => {
    expect(
      computeViewSortsOrderBy({
        viewSorts: [
          {
            fieldMetadataId: personCompanyField.id,
            direction: ViewSortDirection.ASC,
            subFieldName: null,
            relationTargetFieldMetadataId: 'deleted-field-id',
          },
        ],
        flatFieldMetadataMaps,
      }),
    ).toEqual([]);
  });
});
