import crypto from 'crypto';

import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { updateAdminApplicationRegistration } from 'test/integration/metadata/suites/application/utils/update-admin-application-registration.util';
import { updateApplicationRegistration } from 'test/integration/metadata/suites/application/utils/update-application-registration.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const INITIAL_NAME = 'Instance flags integration test app';
const RENAMED = 'Instance flags integration test app renamed';
const INITIAL_REDIRECT_URIS = ['https://example.com/oauth/callback'];
const REPLACEMENT_REDIRECT_URIS = ['https://attacker.example/oauth/callback'];

type InstanceFlag = 'isListed' | 'isPreInstalled' | 'isVetted';

const INSTANCE_FLAG_TEST_CASES: EachTestingContext<{ flag: InstanceFlag }>[] = [
  {
    title: 'when the payload carries isListed',
    context: { flag: 'isListed' },
  },
  {
    title: 'when the payload carries isPreInstalled',
    context: { flag: 'isPreInstalled' },
  },
  {
    title: 'when the payload carries isVetted',
    context: { flag: 'isVetted' },
  },
];

// The caller's workspace owns 'owned'; the two others must be out of its reach.
type RegistrationOwnership = 'owned' | 'foreign' | 'unclaimed';

const NOT_OWNED_TEST_CASES: EachTestingContext<{
  ownership: Exclude<RegistrationOwnership, 'owned'>;
}>[] = [
  {
    title: 'when another workspace owns the registration',
    context: { ownership: 'foreign' },
  },
  {
    title: 'when no workspace has claimed the registration',
    context: { ownership: 'unclaimed' },
  },
];

const OWNER_WORKSPACE_ID_BY_OWNERSHIP: Record<
  RegistrationOwnership,
  string | null
> = {
  owned: SEED_APPLE_WORKSPACE_ID,
  foreign: SEED_YCOMBINATOR_WORKSPACE_ID,
  unclaimed: null,
};

type RegistrationRow = {
  name: string;
  oAuthRedirectUris: string[];
  isListed: boolean;
  isPreInstalled: boolean;
  isVetted: boolean;
};

const INITIAL_ROW: RegistrationRow = {
  name: INITIAL_NAME,
  oAuthRedirectUris: INITIAL_REDIRECT_URIS,
  isListed: false,
  isPreInstalled: false,
  isVetted: false,
};

describe('Application registration instance flags (integration)', () => {
  const registrationIdByOwnership = {} as Record<RegistrationOwnership, string>;

  const readRegistrationRow = async (
    registrationId: string,
  ): Promise<RegistrationRow> => {
    const [row] = await globalThis.testDataSource.query(
      `SELECT name, "oAuthRedirectUris", "isListed", "isPreInstalled", "isVetted"
       FROM core."applicationRegistration" WHERE id = $1`,
      [registrationId],
    );

    return row;
  };

  beforeAll(async () => {
    for (const [ownership, ownerWorkspaceId] of Object.entries(
      OWNER_WORKSPACE_ID_BY_OWNERSHIP,
    )) {
      const registrationId = crypto.randomUUID();

      await globalThis.testDataSource.query(
        `INSERT INTO core."applicationRegistration"
          (id, "universalIdentifier", name, "oAuthClientId",
           "oAuthRedirectUris", "oAuthScopes", "sourceType", "workspaceId")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          registrationId,
          crypto.randomUUID(),
          INITIAL_NAME,
          crypto.randomUUID(),
          INITIAL_REDIRECT_URIS,
          [],
          ApplicationRegistrationSourceType.TARBALL,
          ownerWorkspaceId,
        ],
      );

      registrationIdByOwnership[ownership as RegistrationOwnership] =
        registrationId;
    }
  });

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."applicationRegistration" WHERE id = ANY($1)`,
      [Object.values(registrationIdByOwnership)],
    );
  });

  describe('updateApplicationRegistration', () => {
    it.each(eachTestingContextFilter(NOT_OWNED_TEST_CASES))(
      'should fail $title',
      async ({ context: { ownership } }) => {
        const registrationId = registrationIdByOwnership[ownership];

        const { errors } = await updateApplicationRegistration({
          id: registrationId,
          update: {
            name: RENAMED,
            oAuthRedirectUris: REPLACEMENT_REDIRECT_URIS,
          },
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({
          errors,
          normalizeMessage: (message) =>
            message.replace(registrationId, '<applicationRegistrationId>'),
        });

        expect(await readRegistrationRow(registrationId)).toEqual(INITIAL_ROW);
      },
    );

    it.each(eachTestingContextFilter(INSTANCE_FLAG_TEST_CASES))(
      'should fail $title',
      async ({ context: { flag } }) => {
        const registrationId = registrationIdByOwnership.owned;

        const { errors } = await updateApplicationRegistration({
          id: registrationId,
          update: { name: RENAMED, [flag]: true },
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });

        // The name travelled in the same payload, so a row still carrying its
        // initial name proves nothing was written.
        expect(await readRegistrationRow(registrationId)).toEqual(INITIAL_ROW);
      },
    );

    it('should update the fields the tenant input declares', async () => {
      const registrationId = registrationIdByOwnership.owned;

      const { data } = await updateApplicationRegistration({
        id: registrationId,
        update: { name: RENAMED },
        expectToFail: false,
      });

      expect(data.updateApplicationRegistration).toMatchObject({
        id: registrationId,
        name: RENAMED,
        isListed: false,
        isPreInstalled: false,
        isVetted: false,
      });

      expect(await readRegistrationRow(registrationId)).toEqual({
        ...INITIAL_ROW,
        name: RENAMED,
      });
    });
  });

  describe('updateAdminApplicationRegistration', () => {
    it('should fail for a caller without the SECURITY permission flag', async () => {
      const registrationId = registrationIdByOwnership.owned;

      const { errors } = await updateAdminApplicationRegistration({
        id: registrationId,
        update: { isListed: true, isPreInstalled: true, isVetted: true },
        withGuestRole: true,
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });

      expect(await readRegistrationRow(registrationId)).toMatchObject({
        isListed: false,
        isPreInstalled: false,
        isVetted: false,
      });
    });

    it('should set the instance flags', async () => {
      const registrationId = registrationIdByOwnership.owned;

      const { data } = await updateAdminApplicationRegistration({
        id: registrationId,
        update: { isListed: true, isPreInstalled: true, isVetted: true },
        expectToFail: false,
      });

      expect(data.updateAdminApplicationRegistration).toMatchObject({
        id: registrationId,
        isListed: true,
        isPreInstalled: true,
        isVetted: true,
      });

      expect(await readRegistrationRow(registrationId)).toMatchObject({
        isListed: true,
        isPreInstalled: true,
        isVetted: true,
      });
    });
  });
});
