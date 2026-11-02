import request from 'supertest';
import { MAX_ALLOWED_IFRAME_ORIGINS } from 'twenty-shared/constants';
import { type IframeMediaPermission } from 'twenty-shared/types';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const client = request(`http://localhost:${APP_PORT}`);

const updatePermission = ({
  permission,
  token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
}: {
  permission: IframeMediaPermission;
  token?: string;
}) =>
  client
    .post('/metadata')
    .set('Authorization', `Bearer ${token}`)
    .send({
      query: `
        mutation UpdateIframeMediaPermissions($data: UpdateWorkspaceIframeMediaPermissionsInput!) {
          updateWorkspaceIframeMediaPermissions(data: $data) {
            iframeMediaPermissions { origin microphone camera }
          }
        }
      `,
      variables: { data: permission },
    });

const readPermissions = async (): Promise<IframeMediaPermission[]> => {
  const response = await client
    .post('/metadata')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({
      query: `
        {
          currentUser {
            currentWorkspace {
              iframeMediaPermissions { origin microphone camera }
            }
          }
        }
      `,
    })
    .expect(200);

  expect(response.body.errors).toBeUndefined();

  return response.body.data.currentUser.currentWorkspace.iframeMediaPermissions;
};

const removePermissions = async () => {
  for (const { origin } of await readPermissions()) {
    const response = await updatePermission({
      permission: { origin, microphone: false, camera: false },
    });

    expect(response.body.errors).toBeUndefined();
  }
};

describe('Iframe media security permissions', () => {
  let originalPermissions: IframeMediaPermission[];

  beforeAll(async () => {
    originalPermissions = await readPermissions();
  });

  beforeEach(removePermissions);

  afterAll(async () => {
    await removePermissions();

    for (const permission of originalPermissions) {
      const response = await updatePermission({ permission });

      expect(response.body.errors).toBeUndefined();
    }
  });

  it('upserts normalized capabilities and refreshes cached permissions after revocation', async () => {
    const created = await updatePermission({
      permission: {
        origin: 'https://PHONE.example.com:443/',
        microphone: true,
        camera: false,
      },
    });

    expect(created.body.errors).toBeUndefined();
    expect(await readPermissions()).toEqual([
      {
        origin: 'https://phone.example.com',
        microphone: true,
        camera: false,
      },
    ]);

    const updated = await updatePermission({
      permission: {
        origin: 'https://phone.example.com',
        microphone: false,
        camera: true,
      },
    });

    expect(updated.body.errors).toBeUndefined();
    expect(await readPermissions()).toEqual([
      {
        origin: 'https://phone.example.com',
        microphone: false,
        camera: true,
      },
    ]);

    await updatePermission({
      permission: {
        origin: 'https://phone.example.com',
        microphone: false,
        camera: false,
      },
    });

    expect(await readPermissions()).toEqual([]);
  });

  it('requires Security permission', async () => {
    const response = await updatePermission({
      permission: {
        origin: 'https://phone.example.com',
        microphone: true,
        camera: false,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    expect(await readPermissions()).toEqual([]);
  });

  it('rejects insecure origins before saving permissions', async () => {
    const response = await updatePermission({
      permission: {
        origin: 'http://phone.example.com',
        microphone: true,
        camera: false,
      },
    });

    expect(response.body.errors[0].extensions).toMatchObject({
      code: ErrorCode.BAD_USER_INPUT,
      userFriendlyMessage: 'Enter an HTTPS origin without a path or wildcard',
    });
    expect(await readPermissions()).toEqual([]);
  });

  it('preserves concurrent grants and enforces the origin limit', async () => {
    for (let index = 0; index < MAX_ALLOWED_IFRAME_ORIGINS - 2; index++) {
      const response = await updatePermission({
        permission: {
          origin: `https://phone-${index}.example.com`,
          microphone: true,
          camera: false,
        },
      });

      expect(response.body.errors).toBeUndefined();
    }

    const responses = await Promise.all(
      ['one', 'two', 'three'].map((name) =>
        updatePermission({
          permission: {
            origin: `https://${name}.example.com`,
            microphone: false,
            camera: true,
          },
        }),
      ),
    );

    expect(responses.filter((response) => response.body.errors)).toHaveLength(
      1,
    );
    expect(await readPermissions()).toHaveLength(MAX_ALLOWED_IFRAME_ORIGINS);
  });

  it('rejects origins that would overflow the Permissions-Policy header', async () => {
    const buildLongOriginPermission = (index: number) => ({
      origin: `https://${'a'.repeat(63)}.${'b'.repeat(63)}.${'c'.repeat(63)}.phone-${index}.example.com`,
      microphone: true,
      camera: true,
    });

    for (let index = 0; index < 4; index++) {
      const response = await updatePermission({
        permission: buildLongOriginPermission(index),
      });

      expect(response.body.errors).toBeUndefined();
    }

    const response = await updatePermission({
      permission: buildLongOriginPermission(4),
    });

    expect(response.body.errors[0].extensions).toMatchObject({
      code: ErrorCode.BAD_USER_INPUT,
      userFriendlyMessage:
        'These origins are too long to allow together. Remove one and try again.',
    });
    expect(await readPermissions()).toHaveLength(4);
  });
});
