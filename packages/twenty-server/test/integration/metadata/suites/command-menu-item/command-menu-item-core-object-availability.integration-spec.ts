import { createCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/create-command-menu-item.util';
import { deleteCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/delete-command-menu-item.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { type CommandMenuCoreObjectName } from 'twenty-shared/types';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';

describe('CommandMenuItem core object availability', () => {
  let companyObjectMetadataId: string;

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

    companyObjectMetadataId = companyObjectMetadata.id;
  });

  it('should create a command menu item scoped to the workflow core object', async () => {
    const { data } = await createCommandMenuItem({
      expectToFail: false,
      input: {
        engineComponentKey: EngineComponentKey.GO_TO_WORKFLOWS,
        label: 'Core workflow command',
        availabilityCoreObjectName: 'workflow',
      },
    });

    expect(data.createCommandMenuItem.availabilityCoreObjectName).toBe(
      'workflow',
    );
    expect(data.createCommandMenuItem.availabilityObjectMetadataId).toBeNull();

    await deleteCommandMenuItem({
      expectToFail: false,
      input: { id: data.createCommandMenuItem.id },
    });
  });

  it('should fail when targeting both an object and a core object', async () => {
    const { errors } = await createCommandMenuItem({
      expectToFail: true,
      input: {
        engineComponentKey: EngineComponentKey.GO_TO_WORKFLOWS,
        label: 'Ambiguous command',
        availabilityObjectMetadataId: companyObjectMetadataId,
        availabilityCoreObjectName: 'workflow',
      },
    });

    jestExpectToBeDefined(errors);
    expect(JSON.stringify(errors)).toContain(
      'A command menu item cannot target both an object and a core object',
    );
  });

  it('should fail for an unknown core object', async () => {
    const { errors } = await createCommandMenuItem({
      expectToFail: true,
      input: {
        engineComponentKey: EngineComponentKey.GO_TO_WORKFLOWS,
        label: 'Unknown core object command',
        availabilityCoreObjectName: 'agent' as CommandMenuCoreObjectName,
      },
    });

    jestExpectToBeDefined(errors);
    expect(errors).toHaveLength(1);
  });
});
