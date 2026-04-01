import { Injectable } from '@nestjs/common';

interface SequenceStepInput {
  id: string;
  delayDays: number;
  subject: string;
  body: string;
}

interface SequenceContactInput {
  contactId: string;
  email: string;
  timezone?: string;
  replied: boolean;
  unsubscribed: boolean;
}

interface SequenceSimulationRequest {
  sequenceId: string;
  startDate: string;
  steps: SequenceStepInput[];
  contacts: SequenceContactInput[];
}

interface SchedulerTeamMemberInput {
  memberId: string;
  memberName: string;
  load: number;
  slots: Array<{ startAt: string; endAt: string }>;
}

interface MeetingSchedulerRequest {
  durationMinutes: number;
  teamMembers: SchedulerTeamMemberInput[];
}

@Injectable()
export class EngagementAutomationService {
  simulateEmailSequence(request: SequenceSimulationRequest) {
    const startDate = new Date(request.startDate);

    const plannedMessages = request.contacts.map((contact) => {
      if (contact.replied || contact.unsubscribed) {
        return {
          contactId: contact.contactId,
          stopped: true,
          reason: contact.replied ? 'reply-detected' : 'unsubscribed',
          steps: [],
        };
      }

      const steps = request.steps.map((step) => {
        const sendDate = new Date(startDate);
        sendDate.setDate(sendDate.getDate() + step.delayDays);

        return {
          stepId: step.id,
          subject: step.subject,
          body: step.body,
          sendDate: sendDate.toISOString(),
        };
      });

      return {
        contactId: contact.contactId,
        stopped: false,
        reason: null,
        steps,
      };
    });

    return {
      sequenceId: request.sequenceId,
      totalContacts: request.contacts.length,
      plannedMessages,
    };
  }

  buildMeetingSlots(request: MeetingSchedulerRequest) {
    const candidateSlots = request.teamMembers.flatMap((member) =>
      member.slots.map((slot) => {
        const start = new Date(slot.startAt);
        const end = new Date(slot.endAt);
        const availableMinutes = Math.max(
          0,
          Math.floor((end.getTime() - start.getTime()) / (1000 * 60)),
        );

        const fitsRequestedDuration = availableMinutes >= request.durationMinutes;

        return {
          memberId: member.memberId,
          memberName: member.memberName,
          memberLoad: member.load,
          startAt: start.toISOString(),
          endAt: end.toISOString(),
          availableMinutes,
          fitsRequestedDuration,
        };
      }),
    );

    const validSlots = candidateSlots
      .filter((slot) => slot.fitsRequestedDuration)
      .sort((left, right) => {
        if (left.memberLoad !== right.memberLoad) {
          return left.memberLoad - right.memberLoad;
        }

        return (
          new Date(left.startAt).getTime() - new Date(right.startAt).getTime()
        );
      });

    return {
      durationMinutes: request.durationMinutes,
      totalSlotsEvaluated: candidateSlots.length,
      totalValidSlots: validSlots.length,
      recommendedSlot: validSlots[0] ?? null,
      validSlots,
    };
  }
}
