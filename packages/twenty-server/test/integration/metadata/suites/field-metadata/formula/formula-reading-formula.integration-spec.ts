import gql from 'graphql-tag';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
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
import { printFieldMetadataFormula } from 'twenty-shared/utils';

describe('Formula fields reading other formula fields', () => {
  let regionObjectMetadataId: string;
  let accountObjectMetadataId: string;
  let dealObjectMetadataId: string;
  let dealTotalFieldMetadataId: string;
  let accountId: string;

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

  const createFormulaField = (
    objectMetadataId: string,
    name: string,
    expression: string,
  ) =>
    createOneFieldMetadata({
      expectToFail: false,
      input: {
        name,
        label: name,
        type: FieldMetadataType.NUMBER,
        objectMetadataId,
        isLabelSyncedWithName: false,
        formula: { expression },
      },
      gqlFields: 'id',
    });

  const findAccount = async () => {
    await waitForAllJobsToFinish();

    return (
      await runGraphqlOperation({
        query: `query FindAccount($id: UUID!) {
          chainFormulaAccount(filter: { id: { eq: $id } }) {
            dealTotal
            chainedTotal
            regionDoubleRate
          }
        }`,
        variables: { id: accountId },
      })
    ).chainFormulaAccount;
  };

  const printAccountFormula = async (fieldName: string) => {
    const { fields } = await findManyFieldsMetadata({
      expectToFail: false,
      input: {
        filter: { objectMetadataId: { eq: accountObjectMetadataId } },
        paging: { first: 100 },
      },
      gqlFields: 'id name type universalIdentifier formula',
    });
    const descriptors = fields.map(
      ({
        node,
      }: {
        node: {
          name: string;
          type: FieldMetadataType;
          universalIdentifier: string;
          formula: FieldMetadataFormula | null;
        };
      }) => node,
    );

    return printFieldMetadataFormula({
      formula: descriptors.find(
        ({ name }: { name: string }) => name === fieldName,
      )?.formula,
      fields: descriptors,
    }).expression;
  };

  beforeAll(async () => {
    regionObjectMetadataId = await createObject('chainFormulaRegion');
    accountObjectMetadataId = await createObject('chainFormulaAccount');
    dealObjectMetadataId = await createObject('chainFormulaDeal');

    for (const [objectMetadataId, name] of [
      [regionObjectMetadataId, 'rate'],
      [dealObjectMetadataId, 'amount'],
    ]) {
      await createOneFieldMetadata({
        expectToFail: false,
        input: {
          name,
          label: name,
          type: FieldMetadataType.NUMBER,
          objectMetadataId,
          isLabelSyncedWithName: false,
        },
      });
    }

    await createRelationBetweenObjects({
      objectMetadataId: dealObjectMetadataId,
      targetObjectMetadataId: accountObjectMetadataId,
      type: FieldMetadataType.RELATION,
      relationType: RelationType.MANY_TO_ONE,
      name: 'account',
      label: 'Account',
      targetFieldLabel: 'Deals',
    });
    await createRelationBetweenObjects({
      objectMetadataId: accountObjectMetadataId,
      targetObjectMetadataId: regionObjectMetadataId,
      type: FieldMetadataType.RELATION,
      relationType: RelationType.MANY_TO_ONE,
      name: 'region',
      label: 'Region',
      targetFieldLabel: 'Accounts',
    });

    const regionId = (
      await runGraphqlOperation({
        query: `mutation CreateRegion($data: ChainFormulaRegionCreateInput!) {
          createChainFormulaRegion(data: $data) { id }
        }`,
        variables: { data: { rate: 3 } },
      })
    ).createChainFormulaRegion.id;

    accountId = (
      await runGraphqlOperation({
        query: `mutation CreateAccount($data: ChainFormulaAccountCreateInput!) {
          createChainFormulaAccount(data: $data) { id }
        }`,
        variables: { data: { name: 'Acme', regionId } },
      })
    ).createChainFormulaAccount.id;

    for (const amount of [3, 4]) {
      await runGraphqlOperation({
        query: `mutation CreateDeal($data: ChainFormulaDealCreateInput!) {
          createChainFormulaDeal(data: $data) { id }
        }`,
        variables: { data: { amount, accountId } },
      });
    }

    await createFormulaField(regionObjectMetadataId, 'doubleRate', 'rate * 2');
    dealTotalFieldMetadataId = (
      await createFormulaField(
        accountObjectMetadataId,
        'dealTotal',
        'sum(deals.amount)',
      )
    ).data.createOneField.id;
    await createFormulaField(
      accountObjectMetadataId,
      'chainedTotal',
      'dealTotal * 2',
    );
    await createFormulaField(
      accountObjectMetadataId,
      'regionDoubleRate',
      'region.doubleRate + 1',
    );
  });

  afterAll(async () => {
    for (const objectMetadataId of [
      dealObjectMetadataId,
      accountObjectMetadataId,
      regionObjectMetadataId,
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

  it('should read a stored formula through its column', async () => {
    expect(await findAccount()).toMatchObject({
      dealTotal: 7,
      chainedTotal: 14,
    });
  });

  it('should read a looked-up query-time formula as its expression', async () => {
    expect(await findAccount()).toMatchObject({ regionDoubleRate: 7 });
  });

  it('should keep reading a formula whose edit makes it query-time', async () => {
    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: dealTotalFieldMetadataId,
        updatePayload: { formula: { expression: '5' } },
      },
      gqlFields: 'id',
    });

    expect(await findAccount()).toMatchObject({
      dealTotal: 5,
      chainedTotal: 10,
    });
    expect(await printAccountFormula('chainedTotal')).toBe('dealTotal * 2');
  });
});
