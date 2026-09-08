// Job payloads for the lead pipeline. Every job carries workspaceId — jobs run
// in the worker with a system auth context built from it.

// What the activity establishes about the PERSON — first touch, timeline,
// consent. Separate from deal resolution on purpose: it is true whether or not
// the activity ever becomes a deal. Enqueue with a stable per-activity job id;
// the timeline insert it drives has no dedup of its own.
export type RecordActivityAttributionJobData = {
  workspaceId: string;
  activityId: string;
};

export type ResolveOpportunityFromActivityJobData = {
  workspaceId: string;
  activityId: string;
  // Set when the inbound event itself already proves two-way engagement — an
  // inbound call a manager picked up. ROUTING exists to find someone to make
  // first contact; on an answered call that has already happened, so the deal
  // opens straight in CONNECTED and skips routing entirely. Unanswered calls,
  // forms and chat leads still route normally.
  alreadyConnected?: {
    // Whoever engaged, when we can identify them.
    ownerMemberId?: string;
  };
};

export type RouteOpportunityJobData = {
  workspaceId: string;
  opportunityId: string;
  // Managers already tried in prior attempts (excluded from round-robin).
  excludedManagerIds: string[];
  // 0-based routing attempt; mirrored onto opportunity.routingCount.
  attempt: number;
};

export type NotifyManagerAssignmentJobData = {
  workspaceId: string;
  opportunityId: string;
  managerId: string;
  // true = sticky owner auto-claimed (returning client); no claim countdown.
  autoClaimed: boolean;
};

// Phase 2 manager notifications. Server-side listeners detect the change and
// enqueue one of these; the worker posts via ManagerNotificationService (which
// applies the per-event toggle + resolves the manager's personal webhook).
export type ManagerNotifyJobData =
  | {
      workspaceId: string;
      kind: 'lost_reassigned';
      opportunityId: string;
      managerId: string;
    }
  | {
      workspaceId: string;
      kind: 'deal_state_changed';
      opportunityId: string;
      managerId: string;
      transition: 'stalled' | 'deferred' | 'active' | 'stage';
      newStage?: string;
    }
  | {
      workspaceId: string;
      kind: 'task_assigned';
      taskId: string;
      managerId: string;
    }
  | {
      workspaceId: string;
      kind: 'task_due';
      taskId: string;
      managerId: string;
    }
  | {
      workspaceId: string;
      kind: 'consent_changed';
      personId: string;
      projectId: string;
      managerId: string;
    };

export type ClaimCheckJobData = {
  workspaceId: string;
  opportunityId: string;
  // The attempt this claim window belongs to (for idempotent job ids + reroute).
  attempt: number;
  excludedManagerIds: string[];
};
