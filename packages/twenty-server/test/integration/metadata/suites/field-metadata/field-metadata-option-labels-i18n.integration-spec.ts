import gql from 'graphql-tag';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import {
  type FieldMetadataComplexOption,
  FieldMetadataType,
} from 'twenty-shared/types';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type MetadataTranslationRow = {
  property: string;
  locale: string;
  value: string;
  provenance: string;
};

const updateWorkspaceMemberLocale = async (locale: string) => {
  const response = await makeMetadataApiRequest({
    query: gql`
      mutation UpdateWorkspaceMemberSettings(
        $input: UpdateWorkspaceMemberSettingsInput!
      ) {
        updateWorkspaceMemberSettings(input: $input)
      }
    `,
    variables: {
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        update: { locale },
      },
    },
  });

  expect(response.body.errors).toBeUndefined();
};

const findFieldOptions = async (
  fieldMetadataId: string,
): Promise<FieldMetadataComplexOption[]> => {
  const response = await makeMetadataApiRequest({
    query: gql`
      query FieldOptions($id: UUID!) {
        field(id: $id) {
          options
        }
      }
    `,
    variables: { id: fieldMetadataId },
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.field.options;
};

const findOptionLabels = async (fieldMetadataId: string) =>
  (await findFieldOptions(fieldMetadataId)).map(({ label }) => label);

const findMetadataTranslations = async (
  fieldMetadataId: string,
): Promise<MetadataTranslationRow[]> => {
  const response = await makeMetadataApiRequest({
    query: gql`
      query MetadataTranslations($input: MetadataTranslationsInput!) {
        metadataTranslations(input: $input) {
          property
          locale
          value
          provenance
        }
      }
    `,
    variables: { input: { fieldMetadataId } },
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.metadataTranslations;
};

describe('field metadata option labels i18n', () => {
  let objectMetadataId: string;
  let fieldMetadataId: string;
  let weekOptionId: string;
  let monthOptionId: string;

  beforeAll(async () => {
    const { data: objectData } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'budgetPlan',
        namePlural: 'budgetPlans',
        labelSingular: 'Budget plan',
        labelPlural: 'Budget plans',
        icon: 'IconTestPipe',
        isLabelSyncedWithName: false,
      },
    });

    objectMetadataId = objectData.createOneObject.id;

    const { data: fieldData } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId,
        type: FieldMetadataType.SELECT,
        name: 'budgetPeriod',
        label: 'Budget period',
        isLabelSyncedWithName: false,
        options: [
          { label: 'Неделя', value: 'WEEK', color: 'blue', position: 0 },
          { label: 'Месяц', value: 'MONTH', color: 'green', position: 1 },
        ],
      },
      gqlFields: `
        id
        options
      `,
    });

    fieldMetadataId = fieldData.createOneField.id;

    const options: FieldMetadataComplexOption[] =
      fieldData.createOneField.options;

    weekOptionId = options.find(({ value }) => value === 'WEEK')?.id ?? '';
    monthOptionId = options.find(({ value }) => value === 'MONTH')?.id ?? '';

    const { errors } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: fieldMetadataId,
        updatePayload: {
          translations: [
            {
              locale: 'en',
              property: `options.${weekOptionId}.label`,
              value: 'Week',
            },
            {
              locale: 'en',
              property: `options.${monthOptionId}.label`,
              value: 'Month',
            },
          ],
        },
      },
    });

    expect(errors).toBeUndefined();
  });

  afterAll(async () => {
    await updateWorkspaceMemberLocale('en');
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

  it('should translate standard option labels to the member locale', async () => {
    await updateWorkspaceMemberLocale('fr-FR');

    const response = await makeMetadataApiRequest({
      query: gql`
        query OpportunityStageOptions {
          objects(paging: { first: 1000 }) {
            edges {
              node {
                nameSingular
                fieldsList {
                  name
                  options
                }
              }
            }
          }
        }
      `,
    });

    expect(response.body.errors).toBeUndefined();

    const opportunityStage = response.body.data.objects.edges
      .find(
        ({ node }: { node: { nameSingular: string } }) =>
          node.nameSingular === 'opportunity',
      )
      ?.node.fieldsList.find(({ name }: { name: string }) => name === 'stage');

    expect(
      opportunityStage.options.find(
        ({ value }: { value: string }) => value === 'SCREENING',
      ).label,
    ).toBe('Présélection');
  });

  it('should resolve workspace option label translations per member locale', async () => {
    await updateWorkspaceMemberLocale('en');

    expect(await findOptionLabels(fieldMetadataId)).toEqual(['Week', 'Month']);

    await updateWorkspaceMemberLocale('fr-FR');

    expect(await findOptionLabels(fieldMetadataId)).toEqual([
      'Неделя',
      'Месяц',
    ]);
  });

  it('should list option label translations', async () => {
    const englishWeekTranslation = (
      await findMetadataTranslations(fieldMetadataId)
    ).find(
      ({ property, locale }) =>
        property === `options.${weekOptionId}.label` && locale === 'en',
    );

    expect(englishWeekTranslation).toMatchObject({
      value: 'Week',
      provenance: 'WORKSPACE',
    });
  });

  it('should keep source labels when translated options are saved back', async () => {
    await updateWorkspaceMemberLocale('en');

    const translatedOptions = await findFieldOptions(fieldMetadataId);

    const { errors } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: fieldMetadataId,
        updatePayload: {
          options: translatedOptions.map((option) => ({
            ...option,
            color: 'red',
          })),
        },
      },
    });

    expect(errors).toBeUndefined();
    expect(await findOptionLabels(fieldMetadataId)).toEqual(['Week', 'Month']);

    await updateWorkspaceMemberLocale('fr-FR');

    expect(await findOptionLabels(fieldMetadataId)).toEqual([
      'Неделя',
      'Месяц',
    ]);
  });

  it('should reject translations of unknown options', async () => {
    const { errors } = await updateOneFieldMetadata({
      expectToFail: true,
      input: {
        idToUpdate: fieldMetadataId,
        updatePayload: {
          translations: [
            {
              locale: 'en',
              property: 'options.20202020-0000-4000-8000-000000000000.label',
              value: 'Year',
            },
          ],
        },
      },
    });

    expect(errors).toBeDefined();
  });
});
