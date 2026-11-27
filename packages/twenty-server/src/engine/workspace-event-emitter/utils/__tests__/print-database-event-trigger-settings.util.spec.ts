import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { printDatabaseEventTriggerSettings } from 'src/engine/workspace-event-emitter/utils/print-database-event-trigger-settings.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const buildMaps = () => {
  const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> =
    createEmptyFlatEntityMaps();
  const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> =
    createEmptyFlatEntityMaps();

  addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
    flatEntity: getFlatObjectMetadataMock({
      id: 'company-id',
      universalIdentifier: 'company',
      nameSingular: 'company',
      fieldIds: ['employees-id'],
    }),
    flatEntityMapsToMutate: flatObjectMetadataMaps,
  });
  addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
    flatEntity: getFlatFieldMetadataMock({
      id: 'employees-id',
      universalIdentifier: 'employees',
      objectMetadataId: 'company-id',
      type: FieldMetadataType.NUMBER,
      name: 'headcount',
    }),
    flatEntityMapsToMutate: flatFieldMetadataMaps,
  });

  return { flatObjectMetadataMaps, flatFieldMetadataMaps };
};

const READ_EMPLOYEES_TREE = {
  type: 'COMPARISON',
  operator: 'GREATER_THAN',
  left: { type: 'FIELD', fieldUniversalIdentifier: 'employees' },
  right: { type: 'LITERAL', value: 100 },
};

describe('printDatabaseEventTriggerSettings', () => {
  it('should print the tree with the current field names and drop it', () => {
    expect(
      printDatabaseEventTriggerSettings({
        settings: {
          eventName: 'company.updated',
          batchMode: true,
          conditionTree: READ_EMPLOYEES_TREE,
        },
        ...buildMaps(),
      }),
    ).toEqual({
      eventName: 'company.updated',
      batchMode: true,
      condition: 'headcount > 100',
    });
  });

  it('should print a field that is gone as a name no field can take', () => {
    expect(
      printDatabaseEventTriggerSettings({
        settings: {
          eventName: 'invoice.updated',
          conditionTree: READ_EMPLOYEES_TREE,
        },
        ...buildMaps(),
      }),
    ).toEqual({
      eventName: 'invoice.updated',
      condition: 'missingField_employees > 100',
    });
  });

  it('should keep a condition stored as text', () => {
    const settings = { eventName: '*.updated', condition: 'isDefined(id)' };

    expect(
      printDatabaseEventTriggerSettings({ settings, ...buildMaps() }),
    ).toEqual(settings);
  });
});
