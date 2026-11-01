import { FieldActorSource } from 'twenty-shared/types';

import { isAgentTurnOpenedByOtherMember } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-agent-turn-opened-by-other-member.util';

const RUN_AS_JONY_BY_APPLICATION = {
  source: FieldActorSource.AGENT,
  workspaceMemberId: 'jony-member-id',
  name: 'Jony Ive',
  context: { applicationId: 'application-id' },
};

describe('isAgentTurnOpenedByOtherMember', () => {
  it('lets the application read on its own a turn it ran as a member', () => {
    expect(
      isAgentTurnOpenedByOtherMember({
        createdBy: RUN_AS_JONY_BY_APPLICATION,
        workspaceMemberId: undefined,
        applicationId: 'application-id',
      }),
    ).toBe(false);
  });

  it('keeps that turn from another application', () => {
    expect(
      isAgentTurnOpenedByOtherMember({
        createdBy: RUN_AS_JONY_BY_APPLICATION,
        workspaceMemberId: undefined,
        applicationId: 'other-application-id',
      }),
    ).toBe(true);
  });

  it('keeps that turn from another member, even through the same application', () => {
    expect(
      isAgentTurnOpenedByOtherMember({
        createdBy: RUN_AS_JONY_BY_APPLICATION,
        workspaceMemberId: 'jane-member-id',
        applicationId: 'application-id',
      }),
    ).toBe(true);
  });

  it('lets the member the turn ran as read it', () => {
    expect(
      isAgentTurnOpenedByOtherMember({
        createdBy: RUN_AS_JONY_BY_APPLICATION,
        workspaceMemberId: 'jony-member-id',
      }),
    ).toBe(false);
  });
});
