import { ForbiddenException } from '@nestjs/common';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { buildAgentChatCallerOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-caller-or-throw.util';

const APPLICATION = {
  id: 'application-id',
  sourceType: ApplicationRegistrationSourceType.LOCAL,
} as FlatApplication;

const OAUTH_ONLY_APPLICATION = {
  id: 'oauth-only-application-id',
  sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
} as FlatApplication;

describe('buildAgentChatCallerOrThrow', () => {
  it('acts as the member when the request carries one, even through an application', () => {
    expect(
      buildAgentChatCallerOrThrow({
        workspaceMemberId: 'workspace-member-id',
        callingApplication: APPLICATION,
      }),
    ).toEqual({ type: 'member', workspaceMemberId: 'workspace-member-id' });
  });

  it('acts as the application when no member is behind the request', () => {
    expect(
      buildAgentChatCallerOrThrow({
        workspaceMemberId: undefined,
        callingApplication: APPLICATION,
      }),
    ).toEqual({ type: 'application', application: APPLICATION });
  });

  it('refuses a request with neither a member nor an application of its own', () => {
    for (const callingApplication of [undefined, OAUTH_ONLY_APPLICATION]) {
      expect(() =>
        buildAgentChatCallerOrThrow({
          workspaceMemberId: undefined,
          callingApplication,
        }),
      ).toThrow(ForbiddenException);
    }
  });
});
