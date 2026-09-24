import { faker } from '@faker-js/faker';
import gql from 'graphql-tag';
import { createCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/create-command-menu-item.util';
import { deleteCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/delete-command-menu-item.util';
import { findCommandMenuItems } from 'test/integration/metadata/suites/command-menu-item/utils/find-command-menu-items.util';
import { updateCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/update-command-menu-item.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import {
  type BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

const expectPermissionDenied = (errors: BaseGraphQLError[] | undefined) => {
  expect(errors).toBeDefined();
  expect(errors?.[0].message).toBe(
    PermissionsExceptionMessage.PERMISSION_DENIED,
  );
  expect(errors?.[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
};

describe('CommandMenuItem mutations should fail without LAYOUTS permission', () => {
  let commandMenuItemId: string;

  beforeAll(async () => {
    const { data } = await createCommandMenuItem({
      expectToFail: false,
      input: {
        workflowVersionId: faker.string.uuid(),
        engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
        label: 'Permission Test Command Menu Item',
      },
    });

    commandMenuItemId = data.createCommandMenuItem.id;
  });

  afterAll(async () => {
    await deleteCommandMenuItem({
      expectToFail: false,
      input: { id: commandMenuItemId },
    });
  });

  it('should allow a member to read command menu items', async () => {
    const { data, errors } = await findCommandMenuItems({
      expectToFail: false,
      input: undefined,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(errors).toBeUndefined();
    expect(Array.isArray(data.commandMenuItems)).toBe(true);
  });

  it('should deny createCommandMenuItem to a member', async () => {
    const { data, errors } = await createCommandMenuItem({
      expectToFail: true,
      input: {
        workflowVersionId: faker.string.uuid(),
        engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
        label: 'Member Command Menu Item',
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(data).toBeNull();
    expectPermissionDenied(errors);
  });

  it('should deny updateCommandMenuItem to a member', async () => {
    const { data, errors } = await updateCommandMenuItem({
      expectToFail: true,
      input: { id: commandMenuItemId, label: 'Updated By Member' },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(data).toBeNull();
    expectPermissionDenied(errors);
  });

  it('should deny resetCommandMenuItem to a member', async () => {
    const response = await makeMetadataAPIRequest(
      {
        query: gql`
          mutation ResetCommandMenuItem($id: UUID!) {
            resetCommandMenuItem(id: $id) {
              id
            }
          }
        `,
        variables: { id: commandMenuItemId },
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.data).toBeNull();
    expectPermissionDenied(response.body.errors);
  });

  it('should deny deleteCommandMenuItem to a member', async () => {
    const { data, errors } = await deleteCommandMenuItem({
      expectToFail: true,
      input: { id: commandMenuItemId },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(data).toBeNull();
    expectPermissionDenied(errors);
  });
});
