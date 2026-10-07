import { Injectable } from '@nestjs/common';

import { type AskQuestionItem, type RequestFormField } from 'twenty-shared/ai';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v5 } from 'uuid';

import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';
import { mapAiStepsToUIMessageParts } from 'src/engine/metadata-modules/ai/ai-history/utils/map-ai-steps-to-ui-message-parts.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { AGENT_CHAT_PENDING_INPUT_THREAD_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/agent-chat-seeds.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { COMPANY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';
import { OPPORTUNITY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/opportunity-data-seeds.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { askQuestionCall } from 'src/engine/workspace-manager/dev-seeder/data/utils/ask-question-call.util';
import { buildSendEmailArguments } from 'src/engine/workspace-manager/dev-seeder/data/utils/build-send-email-arguments.util';
import { proposeEmailCall } from 'src/engine/workspace-manager/dev-seeder/data/utils/propose-email-call.util';
import { proposeRecordCall } from 'src/engine/workspace-manager/dev-seeder/data/utils/propose-record-call.util';
import { requestFormCall } from 'src/engine/workspace-manager/dev-seeder/data/utils/request-form-call.util';
import { type SeededEmail } from 'src/engine/workspace-manager/dev-seeder/data/utils/seeded-email.type';
import { type SeededToolCall } from 'src/engine/workspace-manager/dev-seeder/data/utils/seeded-tool-call.type';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

const AGENT_CHAT_PENDING_INPUT_SEED_NAMESPACE =
  '3c7e1f52-8a4d-4b0e-9d61-2f5a7c9e0b14';

const MEMBERS = {
  TIM: {
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
  },
  JONY: {
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
  },
  PHIL: {
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
    userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.PHIL,
  },
} as const;

type Member = keyof typeof MEMBERS;

const WEBINAR_QUESTIONS: AskQuestionItem[] = [
  {
    header: 'Format',
    question: 'Which format should the Q3 customer webinar use?',
    options: [
      {
        label: 'Live demo',
        description: 'Forty minutes of product, then questions',
        isRecommended: true,
      },
      { label: 'Customer panel', description: 'Three customers, moderated' },
      { label: 'Fireside chat', description: 'One guest, one host' },
    ],
  },
  {
    header: 'Audience',
    question: 'Who should we invite?',
    allowMultiSelect: true,
    options: [
      { label: 'Customers', isRecommended: true },
      { label: 'Open opportunities' },
      { label: 'Churned accounts' },
      { label: 'Partners' },
    ],
  },
];

const ONBOARDING_OWNER_QUESTIONS: AskQuestionItem[] = [
  {
    header: 'Owner',
    question: 'Who should own the Linear onboarding?',
    options: [
      { label: 'Jony', description: 'Designs the rollout with their team' },
      { label: 'Phil', description: 'Runs the technical setup' },
    ],
  },
];

const AIRBNB_FOLLOW_UP_EMAIL: SeededEmail = {
  to: 'partnerships@airbnb.com',
  cc: 'tim@apple.dev',
  subject: 'Next steps after our demo',
  body: '<p>Hi Airbnb team,</p><p>Thanks for your time on Tuesday. As promised, here is a summary of what we covered: shared inboxes for your host support team, and workflows that route requests by region.</p><p>Would next Thursday work for a technical deep dive with your IT team?</p><p>Best,<br>Jony</p>',
};

const STRIPE_QUOTE_EMAIL: SeededEmail = {
  to: 'procurement@stripe.com',
  subject: 'Your renewal quote for 2027',
  body: '<p>Hi Stripe team,</p><p>Please find your renewal quote for 2027 below: 120 seats on the Organization plan, with the 10% multi-year discount we discussed.</p><p>Let me know if anything needs to change before you sign.</p><p>Best,<br>Tim</p>',
};

// the snapshot holds the seeded values, so approving the update runs instead of reporting a conflict
const IPAD_DEAL_HANDOVER_CALL = proposeRecordCall({
  toolName: 'update_one_opportunity',
  toolLabel: 'Update opportunity',
  summary: 'Mark the iPad deployment deal as won and hand it to Phil',
  template: 'recordUpdate',
  objectNameSingular: 'opportunity',
  recordId: OPPORTUNITY_DATA_SEED_IDS.ID_1,
  arguments: {
    id: OPPORTUNITY_DATA_SEED_IDS.ID_1,
    stage: 'CUSTOMER',
    ownerId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
  },
  currentValues: {
    stage: 'PROPOSAL',
    ownerId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
  },
});

const GOOGLE_CONTACT_CALL = proposeRecordCall({
  toolName: 'create_one_person',
  toolLabel: 'Create person',
  summary: 'Add Priya Raman, Google’s new IT director',
  template: 'recordCreate',
  objectNameSingular: 'person',
  arguments: {
    name: { firstName: 'Priya', lastName: 'Raman' },
    emails: { primaryEmail: 'priya.raman@google.com' },
    jobTitle: 'IT Director',
    companyId: COMPANY_DATA_SEED_IDS.ID_1,
  },
});

const STALE_DEAL_DELETION_CALL = proposeRecordCall({
  toolName: 'delete_one_opportunity',
  toolLabel: 'Delete opportunity',
  summary: 'Delete the Apple Watch wellness deal, idle since March',
  template: 'recordDelete',
  objectNameSingular: 'opportunity',
  recordId: OPPORTUNITY_DATA_SEED_IDS.ID_7,
  arguments: { id: OPPORTUNITY_DATA_SEED_IDS.ID_7 },
});

const AIRBNB_EXPANSION_FIELDS: RequestFormField[] = [
  {
    name: 'company',
    label: 'Company',
    type: 'RECORD',
    settings: { objectName: 'company' },
  },
  {
    name: 'amount',
    label: 'Amount (USD)',
    type: FieldMetadataType.NUMBER,
    placeholder: '50000',
  },
  { name: 'closeDate', label: 'Expected close', type: FieldMetadataType.DATE },
  {
    name: 'nextStep',
    label: 'Next step',
    type: FieldMetadataType.TEXT,
    placeholder: 'Security review with their IT team',
  },
];

const FIGMA_CALL_FIELDS: RequestFormField[] = [
  { name: 'callDate', label: 'Call date', type: FieldMetadataType.DATE },
  {
    name: 'attendees',
    label: 'Attendees on their side',
    type: FieldMetadataType.NUMBER,
  },
  {
    name: 'summary',
    label: 'Summary',
    type: FieldMetadataType.TEXT,
    placeholder: 'What was decided',
  },
];

const LINEAR_WELCOME_EMAIL: SeededEmail = {
  to: 'ops@linear.app',
  subject: 'Welcome to Twenty, Linear',
  body: '<p>Hi Linear team,</p><p>Welcome aboard! Phil will run your onboarding: expect a kickoff invite from him this week, with SSO and your data import on the agenda.</p><p>Best,<br>Tim</p>',
};

const FIGMA_WELCOME_EMAIL: SeededEmail = {
  to: 'it@figma.com',
  subject: 'Welcome to Twenty, Figma',
  body: '<p>Hi Figma team,</p><p>Welcome aboard! Your workspace is ready, and we will start with the pipeline import you asked about on our last call.</p><p>Best,<br>Tim</p>',
};

type ConversationToSeed = {
  threadId: string;
  title: string;
  askedBy: Member;
  prompt: string;
  intro: string;
  calls: SeededToolCall[];
  // Only answers the first call
  answer?: {
    response: Record<string, unknown>;
    reply: string;
  };
  sharedWith?: { member: Member; accessLevel: RecordShareAccessLevel };
};

const CONVERSATIONS_TO_SEED: ConversationToSeed[] = [
  {
    threadId: AGENT_CHAT_PENDING_INPUT_THREAD_DATA_SEED_IDS.PENDING_QUESTIONS,
    title: 'Plan the Q3 customer webinar',
    askedBy: 'TIM',
    prompt: 'Help me plan the Q3 customer webinar and draft the invitation.',
    intro: 'Two choices before I draft the invitation:',
    calls: WEBINAR_QUESTIONS.map(askQuestionCall),
  },
  {
    threadId:
      AGENT_CHAT_PENDING_INPUT_THREAD_DATA_SEED_IDS.PENDING_EMAIL_APPROVAL,
    title: 'Follow up with Airbnb after the demo',
    askedBy: 'JONY',
    prompt: 'Draft the follow-up to Airbnb after Tuesday’s demo.',
    intro: 'Here is a draft. Review it before it goes out:',
    calls: [proposeEmailCall(AIRBNB_FOLLOW_UP_EMAIL)],
    sharedWith: {
      member: 'JONY',
      accessLevel: RecordShareAccessLevel.READ_WRITE,
    },
  },
  {
    threadId: AGENT_CHAT_PENDING_INPUT_THREAD_DATA_SEED_IDS.SENT_EMAIL_APPROVAL,
    title: 'Send the renewal quote to Stripe',
    askedBy: 'TIM',
    prompt: 'Send Stripe their renewal quote for 2027.',
    intro: 'I drafted the quote email. Review it before it goes out:',
    calls: [proposeEmailCall(STRIPE_QUOTE_EMAIL)],
    answer: {
      response: {
        decision: 'approve',
        toolName: 'send_email',
        arguments: buildSendEmailArguments({
          ...STRIPE_QUOTE_EMAIL,
          cc: 'phil.schiler@apple.dev',
        }),
      },
      reply:
        'Sent. I copied Phil so he can follow up on the signature. Want me to set a reminder for Friday if Stripe hasn’t signed?',
    },
    sharedWith: { member: 'PHIL', accessLevel: RecordShareAccessLevel.READ },
  },
  {
    threadId: AGENT_CHAT_PENDING_INPUT_THREAD_DATA_SEED_IDS.ANSWERED_QUESTION,
    title: 'Assign the Linear onboarding',
    askedBy: 'TIM',
    prompt: 'Linear signed. Set up their onboarding.',
    intro: 'One question before I create the onboarding tasks:',
    calls: ONBOARDING_OWNER_QUESTIONS.map(askQuestionCall),
    answer: {
      response: { selectedOptionIndices: [1] },
      reply:
        'Phil owns the Linear onboarding. I will create the kickoff, the SSO setup and the data import tasks for him.',
    },
    sharedWith: { member: 'PHIL', accessLevel: RecordShareAccessLevel.READ },
  },
  {
    threadId:
      AGENT_CHAT_PENDING_INPUT_THREAD_DATA_SEED_IDS.PENDING_EMAIL_APPROVALS,
    title: 'Welcome this week’s new customers',
    askedBy: 'TIM',
    prompt: 'Linear and Figma signed this week. Send them a welcome email.',
    intro: 'I drafted one email for each. Review them before they go out:',
    calls: [
      proposeEmailCall(LINEAR_WELCOME_EMAIL),
      proposeEmailCall(FIGMA_WELCOME_EMAIL),
    ],
  },
  {
    threadId:
      AGENT_CHAT_PENDING_INPUT_THREAD_DATA_SEED_IDS.PENDING_RECORD_UPDATE,
    title: 'Close the iPad deployment deal',
    askedBy: 'TIM',
    prompt:
      'Google signed the iPad deployment. Update the deal and hand it to Phil for onboarding.',
    intro: 'Here is the change. Approve it and I will update the deal:',
    calls: [IPAD_DEAL_HANDOVER_CALL],
    sharedWith: { member: 'PHIL', accessLevel: RecordShareAccessLevel.READ },
  },
  {
    threadId:
      AGENT_CHAT_PENDING_INPUT_THREAD_DATA_SEED_IDS.PENDING_RECORD_CREATE,
    title: 'Add Google’s new IT director',
    askedBy: 'TIM',
    prompt:
      'Priya Raman is Google’s new IT director, priya.raman@google.com. Add her to the CRM.',
    intro: 'Check the contact before I create it:',
    calls: [GOOGLE_CONTACT_CALL],
  },
  {
    threadId:
      AGENT_CHAT_PENDING_INPUT_THREAD_DATA_SEED_IDS.REJECTED_RECORD_DELETE,
    title: 'Clean up stale deals',
    askedBy: 'TIM',
    prompt: 'Clean up the deals nobody has touched in months.',
    intro: 'This deal has been idle since March. Delete it?',
    calls: [STALE_DEAL_DELETION_CALL],
    answer: {
      response: {
        decision: 'reject',
        feedback: 'Keep it, they are revisiting budgets in January.',
      },
      reply:
        'I left the deal as is. Want me to set a reminder to check in with them in January?',
    },
  },
  {
    threadId: AGENT_CHAT_PENDING_INPUT_THREAD_DATA_SEED_IDS.PENDING_FORM,
    title: 'Open the Airbnb expansion deal',
    askedBy: 'TIM',
    prompt: 'Airbnb wants to roll Twenty out to their EMEA team. Log the deal.',
    intro: 'Fill in the deal details and I will create the opportunity:',
    calls: [requestFormCall(AIRBNB_EXPANSION_FIELDS)],
  },
  {
    threadId: AGENT_CHAT_PENDING_INPUT_THREAD_DATA_SEED_IDS.ANSWERED_FORM,
    title: 'Log the Figma kickoff call',
    askedBy: 'TIM',
    prompt: 'Log my kickoff call with Figma.',
    intro: 'A few details about the call:',
    calls: [requestFormCall(FIGMA_CALL_FIELDS)],
    answer: {
      response: {
        callDate: '2026-09-29',
        attendees: 4,
        summary: 'Pipeline import first, SSO the week after.',
      },
      reply:
        'Logged the call on Figma with a note. I also created a task for Phil to schedule the SSO setup next week.',
    },
  },
];

@Injectable()
export class DevSeederAgentChatPendingInputWorkspaceService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async seed({ workspaceId }: { workspaceId: string }): Promise<void> {
    if (workspaceId !== SEED_APPLE_WORKSPACE_ID) {
      return;
    }

    for (const conversation of CONVERSATIONS_TO_SEED) {
      await this.seedConversation({ workspaceId, conversation });
    }

    await this.shareConversations(workspaceId);
  }

  private async seedConversation({
    workspaceId,
    conversation,
  }: {
    workspaceId: string;
    conversation: ConversationToSeed;
  }): Promise<void> {
    const seedId = (name: string) =>
      v5(
        `${conversation.threadId}:${name}`,
        AGENT_CHAT_PENDING_INPUT_SEED_NAMESPACE,
      );
    const { threadId } = conversation;
    const askedBy = MEMBERS[conversation.askedBy];
    const calls = await Promise.all(
      conversation.calls.map(async (call, callIndex) => {
        const pendingOutput = await call.buildPendingOutput();
        const pausingToolCall = PAUSING_TOOLS.get(call.toolName)?.parseCall(
          call.input,
          pendingOutput,
        );

        if (!isDefined(pausingToolCall)) {
          throw new Error(`Seeded ${call.toolName} call does not parse`);
        }

        return {
          ...call,
          pausingToolCall,
          pendingOutput,
          // The first call keeps its original seed id
          toolCallId: `call_${seedId(callIndex === 0 ? 'toolCall' : `toolCall${callIndex}`).replace(/-/g, '')}`,
        };
      }),
    );
    const [firstCall] = calls;

    await this.threadRepository.insert(workspaceId, {
      id: threadId,
      title: conversation.title,
      workspaceMemberId: MEMBERS.TIM.workspaceMemberId,
      userWorkspaceId: MEMBERS.TIM.userWorkspaceId,
      pendingQuestionMessageId: isDefined(conversation.answer)
        ? null
        : seedId('assistantMessage'),
    });

    const questionTurnId = seedId('questionTurn');

    await this.conversationWriterService.insertTurn({
      workspaceId,
      id: questionTurnId,
      threadId,
      agentId: null,
      status: isDefined(conversation.answer)
        ? AgentTurnStatus.COMPLETED
        : AgentTurnStatus.WAITING_FOR_INPUT,
    });

    await this.conversationWriterService.insertMessage({
      workspaceId,
      id: seedId('promptMessage'),
      threadId,
      turnId: questionTurnId,
      role: AgentMessageRole.USER,
      agentId: null,
      senderUserWorkspaceId: askedBy.userWorkspaceId,
      parts: [{ type: 'text', text: conversation.prompt }],
    });

    const completion = isDefined(conversation.answer)
      ? await firstCall.pausingToolCall.complete({
          output: conversation.answer.response,
          context: {
            // Seeds never send anything; the email reads as sent
            executeTool: async () => ({
              success: true,
              message: 'Email sent successfully',
            }),
          },
        })
      : undefined;

    await this.conversationWriterService.insertMessage({
      workspaceId,
      id: seedId('assistantMessage'),
      threadId,
      turnId: questionTurnId,
      role: AgentMessageRole.ASSISTANT,
      agentId: null,
      senderUserWorkspaceId: null,
      parts: mapAiStepsToUIMessageParts([
        {
          content: [
            { type: 'text', text: conversation.intro },
            ...calls.flatMap((call) => [
              {
                type: 'tool-call' as const,
                toolCallId: call.toolCallId,
                toolName: call.toolName,
                input: call.input,
              },
              {
                type: 'tool-result' as const,
                toolCallId: call.toolCallId,
                toolName: call.toolName,
                input: call.input,
                output:
                  call === firstCall && isDefined(completion)
                    ? completion.toolResult
                    : call.pendingOutput,
              },
            ]),
          ],
        },
      ]),
    });

    if (!isDefined(conversation.answer) || !isDefined(completion)) {
      return;
    }

    const answerTurnId = seedId('answerTurn');

    await this.conversationWriterService.insertTurn({
      workspaceId,
      id: answerTurnId,
      threadId,
      agentId: null,
      status: AgentTurnStatus.COMPLETED,
    });

    await this.conversationWriterService.insertMessage({
      workspaceId,
      id: seedId('answerMessage'),
      threadId,
      turnId: answerTurnId,
      role: AgentMessageRole.USER,
      agentId: null,
      senderUserWorkspaceId: askedBy.userWorkspaceId,
      parts: [{ type: 'text', text: completion.answerText }],
    });

    await this.conversationWriterService.insertMessage({
      workspaceId,
      id: seedId('replyMessage'),
      threadId,
      turnId: answerTurnId,
      role: AgentMessageRole.ASSISTANT,
      agentId: null,
      senderUserWorkspaceId: null,
      parts: [{ type: 'text', text: conversation.answer.reply }],
    });
  }

  private async shareConversations(workspaceId: string): Promise<void> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);
    const threadObjectMetadataId =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ]?.id;

    if (!isDefined(threadObjectMetadataId)) {
      return;
    }

    await this.recordShareStorageService.insertMany({
      workspaceId,
      recordShares: CONVERSATIONS_TO_SEED.flatMap(({ threadId, sharedWith }) =>
        isDefined(sharedWith)
          ? [
              {
                recordId: threadId,
                objectMetadataId: threadObjectMetadataId,
                principalId: MEMBERS[sharedWith.member].workspaceMemberId,
                principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
                accessLevel: sharedWith.accessLevel,
                rowCause: RecordShareRowCause.MANUAL,
                sourceId: threadId,
              },
            ]
          : [],
      ),
    });
  }
}
