import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneViewSort } from 'test/integration/metadata/suites/view-sort/utils/create-one-view-sort.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { v4 } from 'uuid';
import { ViewType } from 'twenty-shared/types';

import { type CreateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/create-view-sort.input';
import { ViewSortDirection } from 'twenty-shared/types';

type TestSetup = {
  createdViewId: string;
};

type TestContext = {
  input: (testSetup: TestSetup) => CreateViewSortInput;
};

const failingViewSortCreationTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'when viewId does not exist',
    context: {
      input: () => ({
        viewId: v4(),
        fieldMetadataId: v4(),
        direction: ViewSortDirection.ASC,
      }),
    },
  },
  {
    title: 'when fieldMetadataId does not exist',
    context: {
      input: (testSetup) => ({
        viewId: testSetup.createdViewId,
        fieldMetadataId: v4(),
        direction: ViewSortDirection.ASC,
      }),
    },
  },
];

describe('View Sort creation should fail', () => {
  let createdViewId: string;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: {},
        paging: { first: 1000 },
      },
      gqlFields: `
        id
        nameSingular
      `,
    });

    jestExpectToBeDefined(objects);

    const companyObjectMetadata = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'company',
    );

    jestExpectToBeDefined(companyObjectMetadata);

    const { data: viewData } = await createOneView({
      expectToFail: false,
      input: {
        name: 'Test View For Failing View Sort Creation',
        objectMetadataId: companyObjectMetadata.id,
        type: ViewType.TABLE,
        icon: 'IconBuildingSkyscraper',
      },
    });

    createdViewId = viewData?.createView?.id;
    jestExpectToBeDefined(createdViewId);
  });

  afterAll(async () => {
    if (createdViewId) {
      await destroyOneView({
        expectToFail: false,
        viewId: createdViewId,
      });
    }
  });

  it.each(eachTestingContextFilter(failingViewSortCreationTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await createOneViewSort({
        expectToFail: true,
        input: context.input({ createdViewId }),
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
