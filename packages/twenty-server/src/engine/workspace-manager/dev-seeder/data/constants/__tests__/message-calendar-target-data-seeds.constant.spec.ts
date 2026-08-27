import { isDefined } from 'twenty-shared/utils';

import { getCalendarEventParticipantDataSeeds } from 'src/engine/workspace-manager/dev-seeder/data/constants/calendar-event-participant-data-seeds.constant';
import { COMPANY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';
import {
  getCalendarEventTargetDataSeeds,
  getMessageThreadTargetDataSeeds,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/message-calendar-target-data-seeds.constant';
import { getMessageParticipantDataSeeds } from 'src/engine/workspace-manager/dev-seeder/data/constants/message-participant-data-seeds.constant';
import { OPPORTUNITY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/opportunity-data-seeds.constant';
import { PERSON_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

// Guards the QA regression where the timeline read cutover met empty target
// junctions in seeded workspaces. Person 1 (Mark Young at company 1, point of
// contact of opportunity 1) is referenced by seeded message participants
// hundreds of times across the generated arrays, so these anchors are stable
// across the participant generator's randomness.
describe('message and calendar target data seeds', () => {
  const messageParticipantSeeds = getMessageParticipantDataSeeds(
    SEED_APPLE_WORKSPACE_ID,
  );
  const calendarEventParticipantSeeds = getCalendarEventParticipantDataSeeds(
    SEED_APPLE_WORKSPACE_ID,
  );
  const messageThreadTargetSeeds = getMessageThreadTargetDataSeeds(
    messageParticipantSeeds,
  );
  const calendarEventTargetSeeds = getCalendarEventTargetDataSeeds(
    calendarEventParticipantSeeds,
  );

  it('derives message thread targets from the participant seeds', () => {
    expect(messageThreadTargetSeeds.length).toBeGreaterThan(0);
  });

  it('derives calendar event targets from the participant seeds', () => {
    expect(calendarEventTargetSeeds.length).toBeGreaterThan(0);
    expect(
      calendarEventTargetSeeds.some((target) =>
        isDefined(target.targetPersonId),
      ),
    ).toBe(true);
  });

  it('targets person 1 email threads', () => {
    expect(
      messageThreadTargetSeeds.some(
        (target) => target.targetPersonId === PERSON_DATA_SEED_IDS.ID_1,
      ),
    ).toBe(true);
  });

  it('targets company 1 email threads through its people', () => {
    expect(
      messageThreadTargetSeeds.some(
        (target) => target.targetCompanyId === COMPANY_DATA_SEED_IDS.ID_1,
      ),
    ).toBe(true);
  });

  it('targets opportunity 1 email threads through its point of contact', () => {
    expect(
      messageThreadTargetSeeds.some(
        (target) =>
          target.targetOpportunityId === OPPORTUNITY_DATA_SEED_IDS.ID_1,
      ),
    ).toBe(true);
  });

  it('sets exactly one target column per row with automatic provenance', () => {
    for (const target of [
      ...messageThreadTargetSeeds,
      ...calendarEventTargetSeeds,
    ]) {
      const targetColumnCount = [
        target.targetPersonId,
        target.targetCompanyId,
        target.targetOpportunityId,
      ].filter(isDefined).length;

      expect(targetColumnCount).toBe(1);
      expect(target.isAutomaticallyAssigned).toBe(true);
      expect(target.isManuallyAssigned).toBe(false);
    }
  });
});
