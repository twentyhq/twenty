import { gql } from 'graphql-tag';
import {
  getSeededBillingWorkspaceId,
  insertCreditGrant,
  quitBillingFixtureRedis,
  resetBillingCreditState,
} from 'test/integration/billing/utils/billing-credit-fixtures.util';
import { sendInvitationsOperationFactory } from 'test/integration/graphql/utils/send-invitations-operation-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const GETTING_STARTED_REWARDS_QUERY = gql`
  query GettingStartedProgress {
    gettingStartedProgress {
      creditsEarned
      stepRewards {
        step
        creditsEach
        remainingCount
      }
    }
  }
`;

const GETTING_STARTED_COMPLETED_STEPS_QUERY = gql`
  query GettingStartedCompletedSteps {
    gettingStartedProgress {
      completedSteps
    }
  }
`;

const INVITED_EMAILS = ['getting-started-reward-first@apple.dev'];

const query = (sql: string, parameters: unknown[] = []) =>
  globalThis.testDataSource.query(sql, parameters);

type StepReward = {
  step: string;
  creditsEach: number;
  remainingCount: number;
};

const fetchRewards = async (): Promise<{
  creditsEarned: number;
  stepRewards: StepReward[];
}> => {
  const response = await makeMetadataApiRequest({
    query: GETTING_STARTED_REWARDS_QUERY,
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.gettingStartedProgress;
};

const fetchStepRewards = async () => (await fetchRewards()).stepRewards;

const deleteJaneOnboardingUserVars = () =>
  query(
    `DELETE FROM core."keyValuePair" WHERE "workspaceId" = $1 AND "userId" = $2 AND ("key" LIKE 'GETTING_STARTED_%' OR "key" IN ('ONBOARDING_CONNECT_ACCOUNT_PENDING', 'ONBOARDING_CONNECT_ACCOUNT_SKIPPED', 'ONBOARDING_INVITE_TEAM_PENDING'))`,
    [SEED_APPLE_WORKSPACE_ID, USER_DATA_SEED_IDS.JANE],
  );

const deleteInvitationTokens = () =>
  query(
    `DELETE FROM core."appToken" WHERE "workspaceId" = $1 AND "context"->>'email' = ANY($2)`,
    [SEED_APPLE_WORKSPACE_ID, INVITED_EMAILS],
  );

const insertInviteTeamGrants = (workspaceId: string, count: number) =>
  Promise.all(
    Array.from({ length: count }, (_, index) =>
      insertCreditGrant({
        workspaceId,
        amountMicro: 1,
        type: BillingCreditGrantType.ONBOARDING_REWARD,
        effectiveAt: new Date(),
        expiresAt: null,
        idempotencyKey: `onboarding-invite-team:${workspaceId}:${index}-${count}`,
      }),
    ),
  );

describe('Getting Started rewards (integration)', () => {
  let workspaceId: string;
  let twentyConfigService: TwentyConfigService;

  beforeAll(async () => {
    workspaceId = await getSeededBillingWorkspaceId();
    twentyConfigService = getAppProviderByClassName<TwentyConfigService>(
      'TwentyConfigService',
    );

    expect(workspaceId).toBe(SEED_APPLE_WORKSPACE_ID);
  });

  beforeEach(async () => {
    await resetBillingCreditState(workspaceId);
    await deleteJaneOnboardingUserVars();
    await deleteInvitationTokens();
  });

  afterAll(async () => {
    await resetBillingCreditState(workspaceId);
    await deleteJaneOnboardingUserVars();
    await deleteInvitationTokens();
    await quitBillingFixtureRedis();
  });

  describe('invite team step', () => {
    it('carries no reward, and its invites stay out of the credits earned', async () => {
      await insertInviteTeamGrants(workspaceId, 2);

      const { creditsEarned, stepRewards } = await fetchRewards();

      expect(creditsEarned).toBe(0);
      expect(stepRewards).not.toContainEqual(
        expect.objectContaining({ step: 'INVITE_TEAM' }),
      );
    });

    it('sends regular invitations once onboarding is over, and completes the step', async () => {
      const response = await makeMetadataApiRequest(
        sendInvitationsOperationFactory({ emails: [INVITED_EMAILS[0]] }),
      );

      expect(response.body.errors).toBeUndefined();

      const [appToken]: { type: string }[] = await query(
        `SELECT "type" FROM core."appToken" WHERE "workspaceId" = $1 AND "context"->>'email' = $2`,
        [workspaceId, INVITED_EMAILS[0]],
      );

      expect(appToken?.type).toBe('INVITATION_TOKEN');

      const progressResponse = await makeMetadataApiRequest({
        query: GETTING_STARTED_COMPLETED_STEPS_QUERY,
      });

      expect(
        progressResponse.body.data.gettingStartedProgress.completedSteps,
      ).toContain('INVITE_TEAM');
    });
  });

  describe('import contacts reward', () => {
    let activeMailboxIds: string[] = [];
    let janeUserWorkspaceCreatedAt: string;

    const setJaneUserWorkspaceCreatedAt = (createdAt: string) =>
      query(
        `UPDATE core."userWorkspace" SET "createdAt" = $2::timestamptz WHERE "id" = $1`,
        [USER_WORKSPACE_DATA_SEED_IDS.JANE, createdAt],
      );

    beforeAll(async () => {
      const activeMailboxes: { id: string }[] = await query(
        `SELECT "id" FROM core."connectedAccount" WHERE "userWorkspaceId" = $1 AND "archivedAt" IS NULL`,
        [USER_WORKSPACE_DATA_SEED_IDS.JANE],
      );

      activeMailboxIds = activeMailboxes.map(({ id }) => id);

      await query(
        `UPDATE core."connectedAccount" SET "archivedAt" = NOW() WHERE "id" = ANY($1)`,
        [activeMailboxIds],
      );

      const [janeUserWorkspace]: { createdAt: string }[] = await query(
        `SELECT "createdAt"::text AS "createdAt" FROM core."userWorkspace" WHERE "id" = $1`,
        [USER_WORKSPACE_DATA_SEED_IDS.JANE],
      );

      janeUserWorkspaceCreatedAt = janeUserWorkspace.createdAt;

      await setJaneUserWorkspaceCreatedAt('2000-01-01');
    });

    afterAll(async () => {
      await query(
        `UPDATE core."connectedAccount" SET "archivedAt" = NULL WHERE "id" = ANY($1)`,
        [activeMailboxIds],
      );
      await setJaneUserWorkspaceCreatedAt(janeUserWorkspaceCreatedAt);
    });

    const markConnectAccountSkipped = () =>
      query(
        `INSERT INTO core."keyValuePair" ("userId", "workspaceId", "key", "value", "type") VALUES ($1, $2, 'ONBOARDING_CONNECT_ACCOUNT_SKIPPED', 'true', 'USER_VARIABLE')`,
        [USER_DATA_SEED_IDS.JANE, workspaceId],
      );

    it('is not offered when the onboarding mailbox step was never skipped', async () => {
      expect(await fetchStepRewards()).not.toContainEqual(
        expect.objectContaining({ step: 'CONNECT_MAILBOX' }),
      );
    });

    it('is offered to the creator who skipped the onboarding mailbox step', async () => {
      await markConnectAccountSkipped();

      expect(await fetchStepRewards()).toContainEqual({
        step: 'CONNECT_MAILBOX',
        creditsEach: toDisplayCredits(
          twentyConfigService.get('ONBOARDING_IMPORT_CONTACTS_CREDITS_REWARD'),
        ),
        remainingCount: 1,
      });
    });

    it('is not offered to a member who is not the creator', async () => {
      await markConnectAccountSkipped();
      await setJaneUserWorkspaceCreatedAt('2100-01-01');

      try {
        expect(await fetchStepRewards()).not.toContainEqual(
          expect.objectContaining({ step: 'CONNECT_MAILBOX' }),
        );
      } finally {
        await setJaneUserWorkspaceCreatedAt('2000-01-01');
      }
    });

    it('is not offered once the workspace was granted it', async () => {
      await markConnectAccountSkipped();
      await insertCreditGrant({
        workspaceId,
        amountMicro: 1,
        type: BillingCreditGrantType.ONBOARDING_REWARD,
        effectiveAt: new Date(),
        expiresAt: null,
        idempotencyKey: `onboarding-import-contacts:${workspaceId}`,
      });

      expect(await fetchStepRewards()).not.toContainEqual(
        expect.objectContaining({ step: 'CONNECT_MAILBOX' }),
      );
    });
  });
});
