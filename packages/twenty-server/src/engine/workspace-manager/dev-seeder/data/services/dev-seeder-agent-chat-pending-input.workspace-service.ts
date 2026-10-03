import { Injectable } from '@nestjs/common';

import {
  ASK_QUESTIONS_TOOL_NAME,
  type AskQuestionItem,
  PROPOSE_TOOL_CALL_TOOL_NAME,
  type ProposedEmail,
  REQUEST_FORM_TOOL_NAME,
  type RequestFormField,
} from 'twenty-shared/ai';
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
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';
import { mapAiStepsToUiMessageParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-ai-steps-to-ui-message-parts.util';
import { createAskQuestionsTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/ask-questions.tool';
import { buildProposeToolCallPendingOutput } from 'src/engine/metadata-modules/ai/ai-chat/tools/propose-tool-call.tool';
import { buildEmailToolCallProposal } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-email-tool-call-proposal.util';
import { createRequestFormTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/request-form.tool';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { AGENT_CHAT_PENDING_INPUT_THREAD_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/agent-chat-seeds.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

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

const AIRBNB_FOLLOW_UP_EMAIL: ProposedEmail = {
  recipients: {
    to: 'partnerships@airbnb.com',
    cc: 'tim@apple.dev',
    bcc: '',
  },
  subject: 'Next steps after our demo',
  body: 'Hi Airbnb team,\n\nThanks for your time on Tuesday. As promised, here is a summary of what we covered: shared inboxes for your host support team, and workflows that route requests by region.\n\nWould next Thursday work for a technical deep dive with your IT team?\n\nBest,\nJony',
};

const STRIPE_QUOTE_EMAIL: ProposedEmail = {
  recipients: { to: 'procurement@stripe.com', cc: '', bcc: '' },
  subject: 'Your renewal quote for 2027',
  body: 'Hi Stripe team,\n\nPlease find your renewal quote for 2027 below: 120 seats on the Organization plan, with the 10% multi-year discount we discussed.\n\nLet me know if anything needs to change before you sign.\n\nBest,\nTim',
};

export type SeededToolCall = {
  toolName: string;
  input: Record<string, unknown>;
  buildPendingOutput: () => Promise<Record<string, unknown>>;
};

export const proposeEmailCall = (email: ProposedEmail): SeededToolCall => {
  const { input, proposal } = buildEmailToolCallProposal(email);

  return {
    toolName: PROPOSE_TOOL_CALL_TOOL_NAME,
    input,
    buildPendingOutput: async () => buildProposeToolCallPendingOutput(proposal),
  };
};

export const askQuestionsCall = (
  questions: AskQuestionItem[],
): SeededToolCall => ({
  toolName: ASK_QUESTIONS_TOOL_NAME,
  input: { questions },
  buildPendingOutput: () =>
    createAskQuestionsTool({ isWorkspaceSetupThread: false }).execute({
      questions,
    }),
});

export const requestFormCall = (
  fields: RequestFormField[],
): SeededToolCall => ({
  toolName: REQUEST_FORM_TOOL_NAME,
  input: { fields },
  buildPendingOutput: () => createRequestFormTool().execute({ fields }),
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

const LINEAR_WELCOME_EMAIL: ProposedEmail = {
  recipients: { to: 'ops@linear.app', cc: '', bcc: '' },
  subject: 'Welcome to Twenty, Linear',
  body: 'Hi Linear team,\n\nWelcome aboard! Phil will run your onboarding: expect a kickoff invite from him this week, with SSO and your data import on the agenda.\n\nBest,\nTim',
};

const FIGMA_WELCOME_EMAIL: ProposedEmail = {
  recipients: { to: 'it@figma.com', cc: '', bcc: '' },
  subject: 'Welcome to Twenty, Figma',
  body: 'Hi Figma team,\n\nWelcome aboard! Your workspace is ready, and we will start with the pipeline import you asked about on our last call.\n\nBest,\nTim',
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
    calls: [askQuestionsCall(WEBINAR_QUESTIONS)],
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
        arguments: {
          ...buildEmailToolCallProposal(STRIPE_QUOTE_EMAIL).input.arguments,
          recipients: {
            ...STRIPE_QUOTE_EMAIL.recipients,
            cc: 'phil.schiler@apple.dev',
          },
        },
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
    calls: [askQuestionsCall(ONBOARDING_OWNER_QUESTIONS)],
    answer: {
      response: {
        answers: [{ questionIndex: 0, selectedOptionIndices: [1] }],
      },
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
        const pausingToolCall = PAUSING_TOOLS.get(call.toolName)?.parseCall(
          call.input,
        );

        if (!isDefined(pausingToolCall)) {
          throw new Error(`Seeded ${call.toolName} call does not parse`);
        }

        return {
          ...call,
          pausingToolCall,
          pendingOutput: await call.buildPendingOutput(),
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
      parts: mapAiStepsToUiMessageParts([
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
