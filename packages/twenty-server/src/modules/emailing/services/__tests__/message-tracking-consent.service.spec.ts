import { Test } from '@nestjs/testing';

import { QueryFailedError } from 'typeorm';

import { MessageTrackingConsentEntity } from 'src/engine/core-modules/emailing-domain/message-tracking-consent.entity';
import { MessageTrackingConsentDecision } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-decision.type';
import { MessageTrackingConsentSource } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-source.type';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { MessageTrackingConsentService } from 'src/modules/emailing/services/message-tracking-consent.service';

const WORKSPACE_ID = 'b9e9279f-18ef-4577-80ca-3a7fffece868';
const EMAIL_ADDRESS = 'recipient@example.com';

describe('MessageTrackingConsentService', () => {
  const findOneBy = jest.fn();
  const insert = jest.fn();
  const update = jest.fn();
  let service: MessageTrackingConsentService;

  beforeEach(async () => {
    jest.clearAllMocks();
    findOneBy.mockResolvedValue(null);
    update.mockResolvedValue({ affected: 0 });

    const module = await Test.createTestingModule({
      providers: [
        MessageTrackingConsentService,
        {
          provide: getWorkspaceScopedRepositoryToken(
            MessageTrackingConsentEntity,
          ),
          useValue: { findOneBy, insert, update },
        },
      ],
    }).compile();

    service = module.get(MessageTrackingConsentService);
  });

  it('ignores blank email addresses', async () => {
    await service.recordDecision({
      workspaceId: WORKSPACE_ID,
      emailAddress: '  ',
      decision: MessageTrackingConsentDecision.DENIED,
      source: MessageTrackingConsentSource.PREFERENCES_PAGE,
    });

    expect(findOneBy).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it('offers an opt-out choice even before tracking is enabled', async () => {
    await expect(
      service.findTrackingPreference({
        workspaceId: WORKSPACE_ID,
        emailAddress: EMAIL_ADDRESS,
      }),
    ).resolves.toEqual({ decision: null });
  });

  it('stores a normalized recipient opt-out', async () => {
    await service.recordDecision({
      workspaceId: WORKSPACE_ID,
      emailAddress: '  Recipient@Example.com  ',
      decision: MessageTrackingConsentDecision.DENIED,
      source: MessageTrackingConsentSource.PREFERENCES_PAGE,
    });

    expect(insert).toHaveBeenCalledWith(WORKSPACE_ID, {
      emailAddress: EMAIL_ADDRESS,
      decision: MessageTrackingConsentDecision.DENIED,
      source: MessageTrackingConsentSource.PREFERENCES_PAGE,
    });
  });

  it('never turns a concurrent recipient denial into a member grant', async () => {
    findOneBy.mockResolvedValue({
      id: 'consent-id',
      emailAddress: EMAIL_ADDRESS,
      decision: MessageTrackingConsentDecision.GRANTED,
      source: MessageTrackingConsentSource.WORKSPACE_MEMBER,
    });

    await expect(
      service.recordDecision({
        workspaceId: WORKSPACE_ID,
        emailAddress: EMAIL_ADDRESS,
        decision: MessageTrackingConsentDecision.GRANTED,
        source: MessageTrackingConsentSource.WORKSPACE_MEMBER,
      }),
    ).rejects.toThrow('A recipient opted out');

    expect(update).toHaveBeenCalledTimes(2);
    expect(insert).not.toHaveBeenCalled();
  });

  it('leaves a recipient-owned denial unchanged when a member repeats it', async () => {
    findOneBy.mockResolvedValue({
      id: 'consent-id',
      emailAddress: EMAIL_ADDRESS,
      decision: MessageTrackingConsentDecision.DENIED,
      source: MessageTrackingConsentSource.PREFERENCES_PAGE,
    });

    await service.recordDecision({
      workspaceId: WORKSPACE_ID,
      emailAddress: EMAIL_ADDRESS,
      decision: MessageTrackingConsentDecision.DENIED,
      source: MessageTrackingConsentSource.WORKSPACE_MEMBER,
    });

    expect(update).toHaveBeenCalledTimes(2);
    expect(insert).not.toHaveBeenCalled();
  });

  it('lets the preferences page override a member decision', async () => {
    findOneBy.mockResolvedValue({
      id: 'consent-id',
      emailAddress: EMAIL_ADDRESS,
      decision: MessageTrackingConsentDecision.GRANTED,
      source: MessageTrackingConsentSource.WORKSPACE_MEMBER,
    });

    await service.recordDecision({
      workspaceId: WORKSPACE_ID,
      emailAddress: EMAIL_ADDRESS,
      decision: MessageTrackingConsentDecision.DENIED,
      source: MessageTrackingConsentSource.PREFERENCES_PAGE,
    });

    expect(update).toHaveBeenCalledWith(
      WORKSPACE_ID,
      { id: 'consent-id' },
      {
        decision: MessageTrackingConsentDecision.DENIED,
        source: MessageTrackingConsentSource.PREFERENCES_PAGE,
      },
    );
  });

  it('preserves a recipient opt-out on a concurrent insert retry', async () => {
    findOneBy.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: 'consent-id',
      emailAddress: EMAIL_ADDRESS,
      decision: MessageTrackingConsentDecision.DENIED,
      source: MessageTrackingConsentSource.PREFERENCES_PAGE,
    });
    insert.mockRejectedValueOnce(
      new QueryFailedError(
        'INSERT',
        [],
        Object.assign(new Error('unique violation'), { code: '23505' }),
      ),
    );

    await expect(
      service.recordDecision({
        workspaceId: WORKSPACE_ID,
        emailAddress: EMAIL_ADDRESS,
        decision: MessageTrackingConsentDecision.GRANTED,
        source: MessageTrackingConsentSource.WORKSPACE_MEMBER,
      }),
    ).rejects.toThrow('A recipient opted out');

    expect(update).toHaveBeenCalledTimes(2);
  });
});
