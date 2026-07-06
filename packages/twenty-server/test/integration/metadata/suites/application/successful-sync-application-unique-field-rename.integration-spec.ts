import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import {
  getFieldUniversalIdentifier,
  type FieldManifest,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { generateDeterministicIndexName } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();

const TEST_OBJECT = buildDefaultObjectManifest({
  applicationUniversalIdentifier: TEST_APP_ID,
  nameSingular: 'uniqueRenameObject',
  namePlural: 'uniqueRenameObjects',
  labelSingular: 'Unique Rename Object',
  labelPlural: 'Unique Rename Objects',
  description: 'Object used to test unique field renames',
  icon: 'IconTag',
});

const buildUniqueFieldManifest = ({
  universalIdentifier,
  name,
}: {
  universalIdentifier: string;
  name: string;
}): FieldManifest => ({
  universalIdentifier,
  type: FieldMetadataType.TEXT,
  name,
  label: 'Unique Reference',
  description: 'Unique reference field',
  icon: 'IconId',
  isUnique: true,
  isNullable: true,
  objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
});

const buildManifest = (fields: FieldManifest[]) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: { objects: [TEST_OBJECT], fields },
  });

// Mirrors the engine's derivation so the test asserts the exact backing index
// the side-effect engine is expected to own for a given field name.
const computeExpectedUniqueIndexName = (fieldName: string): string =>
  generateDeterministicIndexName({
    flatObjectMetadata: {
      nameSingular: TEST_OBJECT.nameSingular,
      applicationUniversalIdentifier: TEST_APP_ID,
    } as UniversalFlatObjectMetadata,
    orderedIndexColumnNames: [fieldName],
    isUnique: true,
    indexWhereClause: null,
  });

const findTestObject = async () => {
  const objects = await findManyObjectMetadataWithIndexes({
    expectToFail: false,
  });

  const object = objects.find(
    (objectMetadata) =>
      objectMetadata.universalIdentifier === TEST_OBJECT.universalIdentifier,
  );

  expect(object).toBeDefined();

  return object!;
};

describe('Sync application unique field rename', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Unique Field Rename App',
      description: 'App for testing unique field rename behaviors',
      sourcePath: 'test-unique-field-rename',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should drop and recreate the field and its backing unique index when the rename changes the field universal identifier', async () => {
    const computeNameDerivedFieldUniversalIdentifier = (name: string) =>
      getFieldUniversalIdentifier({
        applicationUniversalIdentifier: TEST_APP_ID,
        objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
        name,
      });

    await syncApplication({
      manifest: buildManifest([
        buildUniqueFieldManifest({
          universalIdentifier:
            computeNameDerivedFieldUniversalIdentifier('tata'),
          name: 'tata',
        }),
      ]),
      expectToFail: false,
    });

    const objectAfterFirstSync = await findTestObject();
    const tataField = objectAfterFirstSync.fieldsList.find(
      (field) => field.name === 'tata',
    );

    expect(tataField).toBeDefined();
    expect(
      objectAfterFirstSync.indexMetadataList.find(
        (index) => index.name === computeExpectedUniqueIndexName('tata'),
      ),
    ).toBeDefined();

    await syncApplication({
      manifest: buildManifest([
        buildUniqueFieldManifest({
          universalIdentifier:
            computeNameDerivedFieldUniversalIdentifier('toto'),
          name: 'toto',
        }),
      ]),
      expectToFail: false,
    });

    const objectAfterSecondSync = await findTestObject();

    const totoField = objectAfterSecondSync.fieldsList.find(
      (field) => field.name === 'toto',
    );

    expect(totoField).toBeDefined();
    expect(totoField?.universalIdentifier).toBe(
      computeNameDerivedFieldUniversalIdentifier('toto'),
    );
    // A different metadata id proves the field was dropped and recreated,
    // not updated in place.
    expect(totoField?.id).not.toBe(tataField?.id);
    expect(
      objectAfterSecondSync.fieldsList.find((field) => field.name === 'tata'),
    ).toBeUndefined();

    const totoUniqueIndex = objectAfterSecondSync.indexMetadataList.find(
      (index) => index.name === computeExpectedUniqueIndexName('toto'),
    );

    expect(totoUniqueIndex).toBeDefined();
    expect(totoUniqueIndex?.isUnique).toBe(true);
    expect(
      totoUniqueIndex?.indexFieldMetadataList.some(
        (indexField) => indexField.fieldMetadataId === totoField?.id,
      ),
    ).toBe(true);

    expect(
      objectAfterSecondSync.indexMetadataList.find(
        (index) => index.name === computeExpectedUniqueIndexName('tata'),
      ),
    ).toBeUndefined();
  }, 60000);

  it('should update the field in place and swap its backing unique index when the rename keeps a static universal identifier', async () => {
    const staticFieldUniversalIdentifier = uuidv4();

    await syncApplication({
      manifest: buildManifest([
        buildUniqueFieldManifest({
          universalIdentifier: staticFieldUniversalIdentifier,
          name: 'tata',
        }),
      ]),
      expectToFail: false,
    });

    const objectAfterFirstSync = await findTestObject();
    const tataField = objectAfterFirstSync.fieldsList.find(
      (field) => field.name === 'tata',
    );

    expect(tataField).toBeDefined();
    expect(tataField?.universalIdentifier).toBe(staticFieldUniversalIdentifier);
    expect(
      objectAfterFirstSync.indexMetadataList.find(
        (index) => index.name === computeExpectedUniqueIndexName('tata'),
      ),
    ).toBeDefined();

    await syncApplication({
      manifest: buildManifest([
        buildUniqueFieldManifest({
          universalIdentifier: staticFieldUniversalIdentifier,
          name: 'toto',
        }),
      ]),
      expectToFail: false,
    });

    const objectAfterSecondSync = await findTestObject();

    const renamedField = objectAfterSecondSync.fieldsList.find(
      (field) => field.universalIdentifier === staticFieldUniversalIdentifier,
    );

    expect(renamedField).toBeDefined();
    expect(renamedField?.name).toBe('toto');
    // The same metadata id proves the field was updated in place, not dropped
    // and recreated.
    expect(renamedField?.id).toBe(tataField?.id);
    expect(
      objectAfterSecondSync.fieldsList.find((field) => field.name === 'tata'),
    ).toBeUndefined();

    const totoUniqueIndex = objectAfterSecondSync.indexMetadataList.find(
      (index) => index.name === computeExpectedUniqueIndexName('toto'),
    );

    expect(totoUniqueIndex).toBeDefined();
    expect(totoUniqueIndex?.isUnique).toBe(true);
    expect(
      totoUniqueIndex?.indexFieldMetadataList.some(
        (indexField) => indexField.fieldMetadataId === renamedField?.id,
      ),
    ).toBe(true);

    expect(
      objectAfterSecondSync.indexMetadataList.find(
        (index) => index.name === computeExpectedUniqueIndexName('tata'),
      ),
    ).toBeUndefined();
  }, 60000);
});
