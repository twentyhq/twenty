import gql from 'graphql-tag';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import {
  type FieldMetadataFormula,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';
import { getFieldMetadataFormulaEvaluation } from 'twenty-shared/utils';

describe('Formula field evaluation', () => {
  let accountObjectMetadataId: string;
  let dealObjectMetadataId: string;
  let accountId: string;
  let dealTotalFieldMetadataId: string;

  const runGraphqlOperation = async ({
    query,
    variables = {},
  }: {
    query: string;
    variables?: Record<string, unknown>;
  }) => {
    const response = await makeGraphqlApiRequest({
      query: gql(query),
      variables,
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data;
  };

  const createObject = async (nameSingular: string): Promise<string> =>
    (
      await createOneObjectMetadata({
        expectToFail: false,
        input: {
          nameSingular,
          namePlural: `${nameSingular}s`,
          labelSingular: nameSingular,
          labelPlural: `${nameSingular}s`,
          icon: 'IconBox',
          isLabelSyncedWithName: false,
        },
      })
    ).data.createOneObject.id;

  const createAccountFormula = async ({
    name,
    formula,
  }: {
    name: string;
    formula: FieldMetadataFormula;
  }) =>
    (
      await createOneFieldMetadata({
        expectToFail: false,
        input: {
          name,
          label: name,
          type: FieldMetadataType.NUMBER,
          objectMetadataId: accountObjectMetadataId,
          isLabelSyncedWithName: false,
          formula,
        },
        gqlFields: 'id formula',
      })
    ).data.createOneField;

  const findAccount = async () => {
    await waitForAllJobsToFinish();

    return (
      await runGraphqlOperation({
        query: `query FindAccount($id: UUID!) {
          evaluationAccount(filter: { id: { eq: $id } }) {
            dealTotal chainedTotal storedChainedTotal
          }
        }`,
        variables: { id: accountId },
      })
    ).evaluationAccount;
  };

  beforeAll(async () => {
    accountObjectMetadataId = await createObject('evaluationAccount');
    dealObjectMetadataId = await createObject('evaluationDeal');

    await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'amount',
        label: 'amount',
        type: FieldMetadataType.NUMBER,
        objectMetadataId: dealObjectMetadataId,
        isLabelSyncedWithName: false,
      },
    });
    await createRelationBetweenObjects({
      objectMetadataId: dealObjectMetadataId,
      targetObjectMetadataId: accountObjectMetadataId,
      type: FieldMetadataType.RELATION,
      relationType: RelationType.MANY_TO_ONE,
      name: 'account',
      label: 'Account',
      targetFieldLabel: 'Deals',
    });

    accountId = (
      await runGraphqlOperation({
        query: `mutation CreateAccount($data: EvaluationAccountCreateInput!) {
          createEvaluationAccount(data: $data) { id }
        }`,
        variables: { data: { name: 'Acme' } },
      })
    ).createEvaluationAccount.id;

    for (const amount of [3, 4]) {
      await runGraphqlOperation({
        query: `mutation CreateDeal($data: EvaluationDealCreateInput!) {
          createEvaluationDeal(data: $data) { id }
        }`,
        variables: { data: { amount, accountId } },
      });
    }

    const dealTotalField = await createAccountFormula({
      name: 'dealTotal',
      formula: { expression: 'sum(deals.amount)' },
    });

    dealTotalFieldMetadataId = dealTotalField.id;

    expect(getFieldMetadataFormulaEvaluation(dealTotalField)).toBe('STORED');

    const chainedTotalField = await createAccountFormula({
      name: 'chainedTotal',
      formula: { expression: 'dealTotal * 2' },
    });

    expect(getFieldMetadataFormulaEvaluation(chainedTotalField)).toBe(
      'QUERY_TIME',
    );

    const storedChainedTotalField = await createAccountFormula({
      name: 'storedChainedTotal',
      formula: { expression: 'dealTotal + 1', evaluation: 'STORED' },
    });

    expect(getFieldMetadataFormulaEvaluation(storedChainedTotalField)).toBe(
      'STORED',
    );
  });

  afterAll(async () => {
    for (const objectMetadataId of [
      dealObjectMetadataId,
      accountObjectMetadataId,
    ]) {
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
    }
  });

  it('should compute formulas reading a stored formula, live or stored', async () => {
    expect(await findAccount()).toEqual({
      dealTotal: 7,
      chainedTotal: 14,
      storedChainedTotal: 8,
    });
  });

  it('should keep a stored formula stored when its expression no longer aggregates', async () => {
    const {
      data: { updateOneField },
    } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: dealTotalFieldMetadataId,
        updatePayload: { formula: { expression: '5' } },
      },
      gqlFields: 'id formula',
    });

    expect(getFieldMetadataFormulaEvaluation(updateOneField)).toBe('STORED');
    expect(await findAccount()).toEqual({
      dealTotal: 5,
      chainedTotal: 10,
      storedChainedTotal: 6,
    });
  });

  it('should refuse to make a stored formula live while other formulas read it', async () => {
    const { errors } = await updateOneFieldMetadata({
      expectToFail: true,
      input: {
        idToUpdate: dealTotalFieldMetadataId,
        updatePayload: {
          formula: { expression: '5', evaluation: 'QUERY_TIME' },
        },
      },
      gqlFields: 'id',
    });

    const errorsText = JSON.stringify(errors);

    expect(errorsText).toContain(
      'Other formulas read this one, so it must stay stored',
    );
    expect(errorsText).toContain('chainedTotal');
    expect(errorsText).toContain('storedChainedTotal');
  });

  it('should refuse a live formula that aggregates related records', async () => {
    const { errors } = await createOneFieldMetadata({
      expectToFail: true,
      input: {
        name: 'liveDealCount',
        label: 'liveDealCount',
        type: FieldMetadataType.NUMBER,
        objectMetadataId: accountObjectMetadataId,
        isLabelSyncedWithName: false,
        formula: { expression: 'count(deals)', evaluation: 'QUERY_TIME' },
      },
      gqlFields: 'id',
    });

    expect(JSON.stringify(errors)).toContain(
      'A formula that aggregates related records must be stored',
    );
  });
});
