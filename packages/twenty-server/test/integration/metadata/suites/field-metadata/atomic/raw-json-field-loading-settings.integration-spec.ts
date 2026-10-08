import { createOneFieldMetadataQueryFactory } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-query-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { updateOneFieldMetadataQueryFactory } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata-query-factory.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  type FieldMetadataRawJsonSettings,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const FIELD_GQL_FIELDS = 'id settings isUIEditable';
const LOADING_SETTING_VALIDATION_ERROR = {
  extensions: {
    code: 'METADATA_VALIDATION_FAILED',
    userFriendlyMessage: 'JSON field loading setting must be a boolean',
  },
};

describe('RAW_JSON field loading settings (integration)', () => {
  let objectMetadataId: string | undefined;

  const fieldRepository = () =>
    getCoreRepository<FieldMetadataEntity<FieldMetadataType.RAW_JSON>>(
      FieldMetadataEntity,
    );

  const fetchFieldMetadata = async (fieldMetadataId: string) => {
    const { fields, errors } = await findManyFieldsMetadata({
      expectToFail: false,
      input: { filter: { id: { eq: fieldMetadataId } }, paging: { first: 1 } },
      gqlFields: FIELD_GQL_FIELDS,
    });
    const persistedField = await fieldRepository().findOneByOrFail({
      id: fieldMetadataId,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

    expect(errors).toBeUndefined();
    expect(fields).toEqual([
      {
        node: {
          id: persistedField.id,
          settings: persistedField.settings,
          isUIEditable: persistedField.isUIEditable,
        },
      },
    ]);

    return persistedField;
  };

  const createJsonField = async ({
    name,
    settings,
  }: {
    name: string;
    settings?: FieldMetadataRawJsonSettings;
  }) => {
    jestExpectToBeDefined(objectMetadataId);
    const { data, errors } =
      await createOneFieldMetadata<FieldMetadataType.RAW_JSON>({
        expectToFail: false,
        input: {
          objectMetadataId,
          name,
          label: name,
          type: FieldMetadataType.RAW_JSON,
          settings,
        },
        gqlFields: FIELD_GQL_FIELDS,
      });

    expect(errors).toBeUndefined();

    return data.createOneField;
  };

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'jsonLoadingSettingsTest',
        namePlural: 'jsonLoadingSettingsTests',
        labelSingular: 'JSON Loading Settings Test',
        labelPlural: 'JSON Loading Settings Tests',
        isLabelSyncedWithName: false,
      },
    });
    objectMetadataId = data.createOneObject.id;
  });

  afterAll(async () => {
    if (!isDefined(objectMetadataId)) {
      return;
    }

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: objectMetadataId },
    });
  });

  it.each([
    { name: 'loadOnOpen', settings: { isValueLoadedOnOpen: true } },
    { name: 'loadImmediately', settings: { isValueLoadedOnOpen: false } },
    { name: 'defaultLoading', settings: undefined },
  ])(
    'persists and reads the loading preference for $name',
    async ({ name, settings }) => {
      const field = await createJsonField({ name, settings });
      const persistedField = await fetchFieldMetadata(field.id);

      expect(persistedField.settings).toEqual(settings ?? null);
      expect(persistedField.isUIEditable).toBe(true);
    },
  );

  it('updates the loading preference while retaining supplied sibling settings', async () => {
    const settings = { isValueLoadedOnOpen: true, legacySetting: 'preserved' };
    const field = await createJsonField({ name: 'editableLoading', settings });
    const updatedSettings = { ...settings, isValueLoadedOnOpen: false };
    const { errors } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: field.id,
        updatePayload: { settings: updatedSettings },
      },
    });

    expect(errors).toBeUndefined();
    expect((await fetchFieldMetadata(field.id)).settings).toEqual(
      updatedSettings,
    );
  });

  it('rejects an invalid loading preference on creation without storing the field', async () => {
    jestExpectToBeDefined(objectMetadataId);
    const operation = createOneFieldMetadataQueryFactory({
      input: {
        objectMetadataId,
        name: 'invalidLoading',
        label: 'invalidLoading',
        type: FieldMetadataType.RAW_JSON,
      },
    });
    const response = await makeMetadataApiRequest({
      ...operation,
      variables: {
        input: {
          field: {
            ...operation.variables.input.field,
            settings: { isValueLoadedOnOpen: 'false' },
          },
        },
      },
    });

    expect(response.body.errors).toMatchObject([
      {
        extensions: {
          code: 'METADATA_VALIDATION_FAILED',
          errors: {
            fieldMetadata: [
              {
                errors: [
                  {
                    code: 'INVALID_FIELD_INPUT',
                    message:
                      'JSON field isValueLoadedOnOpen setting must be a boolean',
                  },
                ],
                flatEntityMinimalInformation: { name: 'invalidLoading' },
                type: 'create',
              },
            ],
          },
        },
      },
    ]);
    expect(
      await fieldRepository().findOneBy({
        objectMetadataId,
        name: 'invalidLoading',
      }),
    ).toBeNull();
    const field = await createJsonField({
      name: 'invalidLoading',
      settings: { isValueLoadedOnOpen: false },
    });

    expect((await fetchFieldMetadata(field.id)).settings).toEqual({
      isValueLoadedOnOpen: false,
    });
  });

  it('rejects an invalid update without changing the persisted preference', async () => {
    const settings = { isValueLoadedOnOpen: false, legacySetting: 'preserved' };
    const field = await createJsonField({ name: 'rejectedUpdate', settings });
    const beforeUpdate = await fetchFieldMetadata(field.id);
    const operation = updateOneFieldMetadataQueryFactory({
      input: { idToUpdate: field.id, updatePayload: {} },
    });
    const response = await makeMetadataApiRequest({
      ...operation,
      variables: {
        ...operation.variables,
        updatePayload: { settings: { isValueLoadedOnOpen: 'true' } },
      },
    });

    expect(response.body.errors).toMatchObject([
      LOADING_SETTING_VALIDATION_ERROR,
    ]);
    expect(await fetchFieldMetadata(field.id)).toEqual(beforeUpdate);
  });

  it('allows the standard transcript loading preference to change while its value stays read-only', async () => {
    const transcript = await fieldRepository().findOneByOrFail({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      universalIdentifier:
        STANDARD_OBJECTS.callRecording.fields.transcript.universalIdentifier,
    });

    try {
      const { errors } = await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: transcript.id,
          updatePayload: {
            settings: { ...transcript.settings, isValueLoadedOnOpen: false },
          },
        },
      });

      expect(errors).toBeUndefined();
      expect(await fetchFieldMetadata(transcript.id)).toMatchObject({
        settings: { ...transcript.settings, isValueLoadedOnOpen: false },
        isUIEditable: false,
      });
    } finally {
      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: transcript.id,
          updatePayload: { settings: transcript.settings },
        },
      });
    }
  });
});
