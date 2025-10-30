import {
  VIEW_FIELD_GQL_FIELDS,
  VIEW_FILTER_GQL_FIELDS,
  VIEW_FILTER_GROUP_GQL_FIELDS,
  VIEW_GQL_FIELDS,
  VIEW_GROUP_GQL_FIELDS,
  VIEW_SORT_GQL_FIELDS,
} from 'test/integration/constants/view-gql-fields.constants';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { findCoreViews } from 'test/integration/metadata/suites/view/utils/find-core-views.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { ViewKey } from 'src/engine/metadata-modules/view/enums/view-key.enum';

describe('successful find view with all sub-relations (e2e)', () => {
  let companyObjectMetadataId: string;

  const COMPREHENSIVE_VIEW_GQL_FIELDS = `
    ${VIEW_GQL_FIELDS}
    viewFields {
      ${VIEW_FIELD_GQL_FIELDS}
    }
    viewFilters {
      ${VIEW_FILTER_GQL_FIELDS}
    }
    viewGroups {
      ${VIEW_GROUP_GQL_FIELDS}
    }
    viewSorts {
      ${VIEW_SORT_GQL_FIELDS}
    }
    viewFilterGroups {
      ${VIEW_FILTER_GROUP_GQL_FIELDS}
    }
  `;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: {},
        paging: {
          first: 1000,
        },
      },
      gqlFields: `
        id
        nameSingular
      `,
    });

    const companyObject = objects.find((obj) => obj.nameSingular === 'company');

    jestExpectToBeDefined(companyObject);
    companyObjectMetadataId = companyObject.id;
  });

  describe('Company View Structure Validation', () => {
    it('should successfully fetch complete view structure with all sub-relations in single GraphQL query', async () => {
      const { data: viewsData } = await findCoreViews({
        objectMetadataId: companyObjectMetadataId,
        gqlFields: COMPREHENSIVE_VIEW_GQL_FIELDS,
        expectToFail: false,
      });
      const testView = viewsData.getCoreViews.find(
        (view) => view.key === ViewKey.INDEX,
      );

      jestExpectToBeDefined(testView);

      expect(testView).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({ ...testView }),
      );
    });
  });
});
