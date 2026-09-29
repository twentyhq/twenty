import { Injectable } from '@nestjs/common';

import {
  ASK_QUESTIONS_TOOL_NAME,
  type AskQuestionItem,
  type ExtendedUIMessagePart,
  PROPOSE_EMAIL_TOOL_NAME,
  type ProposedEmail,
} from 'twenty-shared/ai';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { v5 } from 'uuid';

import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { type AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';
import { mapAiStepsToUiMessageParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-ai-steps-to-ui-message-parts.util';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapUIMessagePartsToDBParts';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { AGENT_CHAT_INPUT_ASK_THREAD_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/agent-chat-seeds.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { InputAskWorkspaceService } from 'src/modules/input-ask/workspace-services/input-ask.workspace-service';

const AGENT_CHAT_INPUT_ASK_SEED_NAMESPACE =
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
      { label: 'Open opportunities', isRecommended: true },
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

type ConversationToSeed = {
  threadId: string;
  title: string;
  askedBy: Member;
  prompt: string;
  intro: string;
  toolName: string;
  input: Record<string, unknown>;
  pendingOutput: Record<string, unknown>;
  answer?: {
    response: Record<string, unknown>;
    reply: string;
  };
  sharedWith?: { member: Member; accessLevel: RecordShareAccessLevel };
};

const CONVERSATIONS_TO_SEED: ConversationToSeed[] = [
  {
    threadId: AGENT_CHAT_INPUT_ASK_THREAD_DATA_SEED_IDS.PENDING_QUESTIONS,
    title: 'Plan the Q3 customer webinar',
    askedBy: 'TIM',
    prompt: 'Help me plan the Q3 customer webinar and draft the invitation.',
    intro: 'Two choices before I draft the invitation:',
    toolName: ASK_QUESTIONS_TOOL_NAME,
    input: { questions: WEBINAR_QUESTIONS },
    pendingOutput: {
      success: true,
      message: 'Questions presented to the user; awaiting their answer.',
      result: { questions: WEBINAR_QUESTIONS, status: 'pending' },
    },
  },
  {
    threadId: AGENT_CHAT_INPUT_ASK_THREAD_DATA_SEED_IDS.PENDING_EMAIL_APPROVAL,
    title: 'Follow up with Airbnb after the demo',
    askedBy: 'JONY',
    prompt: 'Draft the follow-up to Airbnb after Tuesday’s demo.',
    intro: 'Here is a draft. Review it before it goes out:',
    toolName: PROPOSE_EMAIL_TOOL_NAME,
    input: AIRBNB_FOLLOW_UP_EMAIL,
    pendingOutput: {
      success: true,
      message: 'Email proposed to the user; awaiting their decision.',
      result: { status: 'pending', email: AIRBNB_FOLLOW_UP_EMAIL },
    },
    sharedWith: {
      member: 'JONY',
      accessLevel: RecordShareAccessLevel.READ_WRITE,
    },
  },
  {
    threadId: AGENT_CHAT_INPUT_ASK_THREAD_DATA_SEED_IDS.SENT_EMAIL_APPROVAL,
    title: 'Send the renewal quote to Stripe',
    askedBy: 'TIM',
    prompt: 'Send Stripe their renewal quote for 2027.',
    intro: 'I drafted the quote email. Review it before it goes out:',
    toolName: PROPOSE_EMAIL_TOOL_NAME,
    input: STRIPE_QUOTE_EMAIL,
    pendingOutput: {
      success: true,
      message: 'Email proposed to the user; awaiting their decision.',
      result: { status: 'pending', email: STRIPE_QUOTE_EMAIL },
    },
    answer: {
      response: {
        decision: 'send',
        email: {
          ...STRIPE_QUOTE_EMAIL,
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
    threadId: AGENT_CHAT_INPUT_ASK_THREAD_DATA_SEED_IDS.ANSWERED_QUESTION,
    title: 'Assign the Linear onboarding',
    askedBy: 'TIM',
    prompt: 'Linear signed. Set up their onboarding.',
    intro: 'One question before I create the onboarding tasks:',
    toolName: ASK_QUESTIONS_TOOL_NAME,
    input: { questions: ONBOARDING_OWNER_QUESTIONS },
    pendingOutput: {
      success: true,
      message: 'Questions presented to the user; awaiting their answer.',
      result: { questions: ONBOARDING_OWNER_QUESTIONS, status: 'pending' },
    },
    answer: {
      response: {
        answers: [{ questionIndex: 0, selectedOptionIndices: [1] }],
      },
      reply:
        'Phil owns the Linear onboarding. I will create the kickoff, the SSO setup and the data import tasks for him.',
    },
    sharedWith: { member: 'PHIL', accessLevel: RecordShareAccessLevel.READ },
  },
];

// Seeds Tim's conversations that wait on a question or an email, or have
// just been answered, so each card and each answered state renders without
// calling a model. An Ask is assigned to whoever sent the message it
// answers.
@Injectable()
export class DevSeederAgentChatInputAskWorkspaceService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartEntity>,
    private readonly inputAskWorkspaceService: InputAskWorkspaceService,
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
        AGENT_CHAT_INPUT_ASK_SEED_NAMESPACE,
      );
    const { threadId } = conversation;
    const toolCallId = `call_${seedId('toolCall').replace(/-/g, '')}`;
    const askedBy = MEMBERS[conversation.askedBy];

    await this.threadRepository.insert(workspaceId, {
      id: threadId,
      title: conversation.title,
      workspaceMemberId: MEMBERS.TIM.workspaceMemberId,
      userWorkspaceId: MEMBERS.TIM.userWorkspaceId,
    });

    const questionTurnId = seedId('questionTurn');

    await this.turnRepository.insert(workspaceId, {
      id: questionTurnId,
      threadId,
    });

    await this.insertMessage({
      workspaceId,
      id: seedId('promptMessage'),
      threadId,
      turnId: questionTurnId,
      role: AgentMessageRole.USER,
      senderUserWorkspaceId: askedBy.userWorkspaceId,
      parts: [{ type: 'text', text: conversation.prompt }],
    });

    const pausingToolCall = PAUSING_TOOLS.get(conversation.toolName)?.parseCall(
      conversation.input,
    );

    if (!isDefined(pausingToolCall)) {
      throw new Error(`Seeded ${conversation.toolName} call does not parse`);
    }

    const completion = isDefined(conversation.answer)
      ? await pausingToolCall.complete(conversation.answer.response, {
          // Seeds never send anything: the email reads as sent, as it would
          // once the person's own send_email succeeded.
          executeTool: async () => ({
            success: true,
            message: 'Email sent successfully',
          }),
        })
      : undefined;

    await this.insertMessage({
      workspaceId,
      id: seedId('assistantMessage'),
      threadId,
      turnId: questionTurnId,
      role: AgentMessageRole.ASSISTANT,
      senderUserWorkspaceId: null,
      parts: mapAiStepsToUiMessageParts([
        {
          content: [
            { type: 'text', text: conversation.intro },
            {
              type: 'tool-call',
              toolCallId,
              toolName: conversation.toolName,
              input: conversation.input,
            },
            {
              type: 'tool-result',
              toolCallId,
              toolName: conversation.toolName,
              input: conversation.input,
              output: completion?.toolResult ?? conversation.pendingOutput,
            },
          ],
        },
      ]),
    });

    await this.inputAskWorkspaceService.open({
      workspaceId,
      inputAsk: {
        ...pausingToolCall.buildAsk(),
        threadId,
        toolCallId,
        assigneeId: askedBy.workspaceMemberId,
      },
    });

    if (!isDefined(conversation.answer) || !isDefined(completion)) {
      return;
    }

    await this.inputAskWorkspaceService.answer({
      workspaceId,
      key: { threadId, toolCallId },
      response: conversation.answer.response,
    });

    const answerTurnId = seedId('answerTurn');

    await this.turnRepository.insert(workspaceId, {
      id: answerTurnId,
      threadId,
    });

    await this.insertMessage({
      workspaceId,
      id: seedId('answerMessage'),
      threadId,
      turnId: answerTurnId,
      role: AgentMessageRole.USER,
      senderUserWorkspaceId: askedBy.userWorkspaceId,
      parts: [{ type: 'text', text: completion.answerText }],
    });

    await this.insertMessage({
      workspaceId,
      id: seedId('replyMessage'),
      threadId,
      turnId: answerTurnId,
      role: AgentMessageRole.ASSISTANT,
      senderUserWorkspaceId: null,
      parts: [{ type: 'text', text: conversation.answer.reply }],
    });
  }

  private async insertMessage({
    workspaceId,
    id,
    threadId,
    turnId,
    role,
    senderUserWorkspaceId,
    parts,
  }: {
    workspaceId: string;
    id: string;
    threadId: string;
    turnId: string;
    role: AgentMessageRole;
    senderUserWorkspaceId: string | null;
    parts: ExtendedUIMessagePart[];
  }): Promise<void> {
    await this.messageRepository.insert(workspaceId, {
      id,
      threadId,
      turnId,
      role,
      processedAt: new Date().toISOString(),
      ...(isDefined(senderUserWorkspaceId) ? { senderUserWorkspaceId } : {}),
    });

    await this.messagePartRepository.insert(
      workspaceId,
      mapUIMessagePartsToDBParts(
        parts,
        id,
        workspaceId,
      ) as QueryDeepPartialEntity<AgentMessagePartEntity>[],
    );
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
