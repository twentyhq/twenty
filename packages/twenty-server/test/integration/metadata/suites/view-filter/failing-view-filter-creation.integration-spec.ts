import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneCoreViewFilter } from 'test/integration/metadata/suites/view-filter/utils/create-one-core-view-filter.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { destroyOneCoreView } from 'test/integration/metadata/suites/view/utils/destroy-one-core-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { ViewFilterOperand } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type CreateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/create-view-filter.input';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';

type TestSetup = {
  createdViewId: string;
};

type TestContext = {
  input: (testSetup: TestSetup) => CreateViewFilterInput;
};

const failingViewFilterCreationTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'when viewId does not exist',
    context: {
      input: () => ({
        viewId: v4(),
        fieldMetadataId: v4(),
        value: 'test',
        operand: ViewFilterOperand.CONTAINS,
      }),
    },
  },
  {
    title: 'when fieldMetadataId does not exist',
    context: {
      input: (testSetup) => ({
        viewId: testSetup.createdViewId,
        fieldMetadataId: v4(),
        value: 'test',
        operand: ViewFilterOperand.CONTAINS,
      }),
    },
  },
  {
    title: 'when viewFilterGroupId does not exist',
    context: {
      input: (testSetup) => ({
        viewId: testSetup.createdViewId,
        fieldMetadataId: v4(),
        value: 'test',
        operand: ViewFilterOperand.CONTAINS,
        viewFilterGroupId: v4(),
      }),
    },
  },
];

describe('View Filter creation should fail', () => {
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

    const { data: viewData } = await createOneCoreView({
      expectToFail: false,
      input: {
        name: 'Test View For Failing Filter Creation',
        objectMetadataId: companyObjectMetadata.id,
        type: ViewType.TABLE,
        icon: 'IconBuildingSkyscraper',
      },
    });

    createdViewId = viewData?.createCoreView?.id;
    jestExpectToBeDefined(createdViewId);
  });

  afterAll(async () => {
    if (createdViewId) {
      await destroyOneCoreView({
        expectToFail: false,
        viewId: createdViewId,
      });
    }
  });

  it.each(eachTestingContextFilter(failingViewFilterCreationTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await createOneCoreViewFilter({
        expectToFail: true,
        input: context.input({ createdViewId }),
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
