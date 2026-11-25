/* @license Enterprise */

import { createRelatedRecordPath } from 'test/integration/metadata/suites/related-record-path/utils/create-related-record-path.util';
import { deleteRelatedRecordPath } from 'test/integration/metadata/suites/related-record-path/utils/delete-related-record-path.util';
import { findRelatedRecordPaths } from 'test/integration/metadata/suites/related-record-path/utils/find-related-record-paths.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';

describe('Related record paths without the RLS entitlement', () => {
  beforeAll(async () => {
    jest
      .spyOn(
        getAppProviderByClassName<EnterprisePlanService>(
          'EnterprisePlanService',
        ),
        'isValid',
      )
      .mockReturnValue(false);
  });

  afterAll(async () => {
    jest.restoreAllMocks();
  });

  it('should list paths but reject creating and deleting them', async () => {
    const [existingPath] = await findRelatedRecordPaths();

    expect(existingPath).toBeDefined();

    const createResponse = await createRelatedRecordPath({
      objectMetadataId: existingPath.objectMetadataId,
      firstFieldMetadataId: existingPath.firstFieldMetadataId,
    });

    expect(createResponse.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');

    const deleteResponse = await deleteRelatedRecordPath(existingPath.id);

    expect(deleteResponse.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');

    const remainingPathIds = (await findRelatedRecordPaths()).map(
      (relatedRecordPath) => relatedRecordPath.id,
    );

    expect(remainingPathIds).toContain(existingPath.id);
  });
});
