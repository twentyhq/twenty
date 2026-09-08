import {
  Body,
  Controller,
  HttpCode,
  Logger,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { timingSafeEqual } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { IngestCallEventJob } from 'src/modules/enso/telephony/jobs/ingest-call-event.job';
import { EnsoInboundRawEventService } from 'src/modules/enso/inbound-raw-event/services/enso-inbound-raw-event.service';
import { TelephonyContactService } from 'src/modules/enso/telephony/services/telephony-contact.service';
import {
  type IngestCallEventJobData,
  serializeCallEvent,
} from 'src/modules/enso/telephony/jobs/telephony-job.types';
import {
  CONTACT_RESPONSE_BUDGET_MS,
  MOLDCELL_CRM_TOKEN,
  ROISTAT_WEBHOOK_SECRET,
  TELEPHONY_WORKSPACE_ID,
} from 'src/modules/enso/telephony/telephony.constants';
import {
  type MoldcellContactPush,
  type MoldcellContactResponse,
  type MoldcellEventPush,
  type MoldcellHistoryPush,
  type MoldcellPush,
  type NormalizedCallEvent,
  type RoistatCallWebhook,
} from 'src/modules/enso/telephony/types/telephony.types';
import {
  normalizeMoldcellContact,
  normalizeMoldcellEvent,
  normalizeMoldcellHistory,
  normalizeRoistatCall,
} from 'src/modules/enso/telephony/utils/normalize-call-event.util';

// Public (no-JWT) telephony receivers. Same convention as the marketing
// callback: a root @Controller() with a webhooks/* path, because /rest/* is
// owned by the authenticated REST catch-all and would reject these regardless of
// guards. Form-encoded bodies (which the PBX sends) are already handled by the
// global urlencoded body parser in main.ts.
//
//   POST /webhooks/enso/telephony/moldcell          — one url for all three cmds
//   POST /webhooks/enso/telephony/roistat/:secret   — Roistat has no signing
//
// Moldcell authenticates with `crm_token` in the body; Roistat cannot sign at
// all, so its secret rides in the path.
@Controller()
export class TelephonyController {
  private readonly logger = new Logger(TelephonyController.name);

  constructor(
    @InjectMessageQueue(MessageQueue.ensoTelephonyQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly contactService: TelephonyContactService,
    private readonly rawEventService: EnsoInboundRawEventService,
  ) {}

  // Writes the body down before anything interprets it, and hands back the id
  // so the handler can stamp what became of it. Best-effort by contract: a
  // failure here returns undefined and the call proceeds untouched.
  private async recordRaw(
    channel: 'PBX' | 'ROISTAT',
    source: string,
    body: unknown,
  ): Promise<string | undefined> {
    if (!isNonEmptyString(TELEPHONY_WORKSPACE_ID)) {
      return undefined;
    }

    return this.rawEventService.record({
      workspaceId: TELEPHONY_WORKSPACE_ID,
      channel,
      source,
      externalId: (body as { callid?: string } | undefined)?.callid,
      payload: body,
    });
  }

  private async stampRaw(
    rawEventId: string | undefined,
    status: 'ENQUEUED' | 'IGNORED' | 'FAILED',
    note?: string,
  ): Promise<void> {
    if (!isNonEmptyString(TELEPHONY_WORKSPACE_ID)) {
      return;
    }

    await this.rawEventService.markOutcome({
      workspaceId: TELEPHONY_WORKSPACE_ID,
      id: rawEventId,
      status,
      ...(note ? { note } : {}),
    });
  }

  // The PBX posts `event`, `history` and `contact` to this single address and
  // distinguishes them by `cmd`. Everything returns 200 quickly; the ingest work
  // happens on the queue.
  @Post('webhooks/enso/telephony/moldcell')
  @HttpCode(200)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async moldcell(
    @Body() body: MoldcellPush,
  ): Promise<MoldcellContactResponse | { ok: true }> {
    this.assertMoldcellToken(body?.crm_token);

    const cmd = String(body?.cmd ?? '').toLowerCase();

    if (cmd === 'contact') {
      // Fires while the phone is ringing. Record it — it is the earliest signal
      // for a call, and its real payload shape is undocumented — but never let
      // that affect the response: a slow or failed answer here delays a live
      // call. So recording is best-effort and the reply is always the same.
      // Logged WITHOUT awaiting, deliberately. This branch answers the PBX
      // with the routing decision while the phone is ringing, under a hard
      // budget — two extra round trips in front of that would delay a live
      // call. The contact push is also the least interesting one to
      // reconcile: every call it precedes arrives again as `event`/`history`,
      // which are logged synchronously below.
      void this.recordRaw('PBX', 'moldcell:contact', body);

      try {
        await this.enqueue(
          normalizeMoldcellContact(body as MoldcellContactPush),
        );
      } catch (error) {
        this.logger.warn(
          `Could not record contact push: ${(error as Error).message}`,
        );
      }

      // Route-to-owner. Bounded by a hard budget and wrapped: any failure or
      // overrun answers with no `responsible`, which makes the PBX fall back to
      // its own dial plan. A ringing caller must never wait on us.
      return this.resolveContactWithinBudget(body as MoldcellContactPush);
    }

    // `event` and `history` are fire-and-forget acks from the PBX's side —
    // nothing is waiting on the response — so these are recorded and stamped
    // synchronously, which is what makes them reconcilable.
    if (cmd === 'event') {
      const rawEventId = await this.recordRaw('PBX', 'moldcell:event', body);
      const event = normalizeMoldcellEvent(body as MoldcellEventPush);

      await this.enqueue(event);
      await this.stampRaw(
        rawEventId,
        isDefined(event) ? 'ENQUEUED' : 'IGNORED',
        isDefined(event) ? undefined : 'event push did not normalize',
      );

      return { ok: true };
    }

    if (cmd === 'history') {
      const rawEventId = await this.recordRaw('PBX', 'moldcell:history', body);
      const event = normalizeMoldcellHistory(body as MoldcellHistoryPush);

      await this.enqueue(event);
      await this.stampRaw(
        rawEventId,
        isDefined(event) ? 'ENQUEUED' : 'IGNORED',
        isDefined(event) ? undefined : 'history push did not normalize',
      );

      return { ok: true };
    }

    // Unknown cmd: ack rather than error, so an unrecognised push never makes
    // the PBX retry against us in a loop. It is no longer forgotten though —
    // the raw row records that something arrived that we did not understand.
    const unknownRawEventId = await this.recordRaw(
      'PBX',
      `moldcell:${cmd || 'unknown'}`,
      body,
    );

    await this.stampRaw(
      unknownRawEventId,
      'IGNORED',
      `unrecognised cmd "${cmd}"`,
    );

    return { ok: true };
  }

  // Roistat posts here from both scenario slots — `webhook_start` (at-call) and
  // `webhook` (after-call). Both carry attribution; only the second carries the
  // outcome. The same handler serves both; the payload shape tells them apart.
  @Post('webhooks/enso/telephony/roistat/:secret')
  @HttpCode(200)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async roistat(
    @Param('secret') secret: string,
    @Body() body: RoistatCallWebhook,
  ): Promise<{ ok: true }> {
    this.assertRoistatSecret(secret);

    const rawEventId = await this.recordRaw('ROISTAT', 'roistat:webhook', body);

    const event = normalizeRoistatCall(body ?? {});

    await this.enqueue(event);
    await this.stampRaw(
      rawEventId,
      isDefined(event) ? 'ENQUEUED' : 'IGNORED',
      isDefined(event) ? undefined : 'roistat payload did not normalize',
    );

    return { ok: true };
  }

  private async resolveContactWithinBudget(
    body: MoldcellContactPush,
  ): Promise<MoldcellContactResponse> {
    if (!isNonEmptyString(TELEPHONY_WORKSPACE_ID)) {
      return {};
    }

    const diversion = (body as { diversion?: unknown }).diversion;

    // Deliberately not Promise.all: the lookup keeps running if it loses the
    // race, but its result is discarded — we simply stop waiting.
    const timeout = new Promise<MoldcellContactResponse>((resolve) =>
      setTimeout(() => resolve({}), CONTACT_RESPONSE_BUDGET_MS),
    );

    try {
      return await Promise.race([
        this.contactService.resolveContact(
          TELEPHONY_WORKSPACE_ID,
          body.phone,
          diversion,
        ),
        timeout,
      ]);
    } catch (error) {
      this.logger.warn(
        `contact lookup failed, deferring to the PBX dial plan: ${(error as Error).message}`,
      );

      return {};
    }
  }

  private async enqueue(event: NormalizedCallEvent | undefined): Promise<void> {
    if (!isDefined(event)) {
      return;
    }

    if (!isNonEmptyString(TELEPHONY_WORKSPACE_ID)) {
      throw new UnauthorizedException(
        'Telephony workspace is not configured (ENSO_TELEPHONY_WORKSPACE_ID)',
      );
    }

    await this.messageQueueService.add<IngestCallEventJobData>(
      IngestCallEventJob.name,
      {
        workspaceId: TELEPHONY_WORKSPACE_ID,
        event: serializeCallEvent(event),
      },
      // One job per (call, specific push) so a redelivered push collapses
      // instead of racing itself through the correlation lookup. Keyed on
      // eventKey rather than the call id alone: an `event COMPLETED` and a
      // `history` push share the same `callid`, and collapsing those two would
      // silently discard the history record that carries duration and recording.
      { id: `enso-telephony-ingest:${event.externalId}:${event.eventKey}` },
    );
  }

  private assertMoldcellToken(token: string | undefined): void {
    this.assertSharedSecret(
      token,
      MOLDCELL_CRM_TOKEN,
      'Moldcell CRM token is not configured',
      'Invalid Moldcell CRM token',
    );
  }

  private assertRoistatSecret(secret: string | undefined): void {
    this.assertSharedSecret(
      secret,
      ROISTAT_WEBHOOK_SECRET,
      'Roistat webhook secret is not configured',
      'Invalid Roistat webhook secret',
    );
  }

  private assertSharedSecret(
    provided: string | undefined,
    expected: string | undefined,
    missingMessage: string,
    invalidMessage: string,
  ): void {
    // Refuse rather than silently accept unauthenticated writes when the secret
    // isn't configured.
    if (!isNonEmptyString(expected)) {
      throw new UnauthorizedException(missingMessage);
    }

    const expectedBuffer = Buffer.from(expected);
    const providedBuffer = Buffer.from(provided ?? '');

    // timingSafeEqual throws on length mismatch, so compare lengths first.
    if (
      expectedBuffer.length !== providedBuffer.length ||
      !timingSafeEqual(expectedBuffer, providedBuffer)
    ) {
      throw new UnauthorizedException(invalidMessage);
    }
  }
}
