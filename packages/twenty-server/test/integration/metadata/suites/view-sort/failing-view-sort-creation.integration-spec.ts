import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneCoreViewSort } from 'test/integration/metadata/suites/view-sort/utils/create-one-core-view-sort.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { destroyOneCoreView } from 'test/integration/metadata/suites/view/utils/destroy-one-core-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { v4 } from 'uuid';

import { type CreateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/create-view-sort.input';
import { ViewSortDirection } from 'src/engine/metadata-modules/view-sort/enums/view-sort-direction';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';

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

    const { data: viewData } = await createOneCoreView({
      expectToFail: false,
      input: {
        name: 'Test View For Failing View Sort Creation',
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

  it.each(eachTestingContextFilter(failingViewSortCreationTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await createOneCoreViewSort({
        expectToFail: true,
        input: context.input({ createdViewId }),
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
