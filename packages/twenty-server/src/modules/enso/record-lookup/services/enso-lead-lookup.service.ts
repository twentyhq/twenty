import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { In } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import {
  type EnsoLeadLookupMatchDTO,
  type EnsoLeadLookupProjectDTO,
  type EnsoLeadLookupResultDTO,
} from 'src/modules/enso/record-lookup/dtos/enso-lead-lookup-match.dto';
import {
  ENSO_LEAD_LOOKUP_DAILY_ALLOWANCE,
  ENSO_LEAD_LOOKUP_MAX_MATCHES,
  ENSO_LEAD_LOOKUP_MIN_TERM_LENGTH,
} from 'src/modules/enso/record-lookup/enso-lead-lookup.constants';
import {
  maskEmail,
  maskPhone,
} from 'src/modules/enso/record-lookup/utils/mask-identity.util';
import { EnsoViewerScopeService } from 'src/modules/enso/record-visibility/services/enso-viewer-scope.service';
import { EnsoPostHogService } from 'src/modules/enso/routing-availability/services/enso-posthog.service';

type PersonRow = {
  id: string;
  name?: { firstName?: string | null; lastName?: string | null } | null;
  phones?: {
    primaryPhoneNumber?: string | null;
    primaryPhoneCallingCode?: string | null;
  } | null;
  emails?: { primaryEmail?: string | null } | null;
  firstTouchAt?: Date | null;
};

type AssignmentRow = {
  personId: string;
  projectId: string | null;
  managerId: string | null;
  assignedAt?: Date | null;
  lastContactAt?: Date | null;
};

type OpportunityRow = {
  // Non-null by construction: rows only reach us because this column matched a
  // set of person ids, so widening it to null would only break the In() filter.
  pointOfContactId: string;
  projectId: string | null;
  ownerId: string | null;
  stage?: string | null;
  firstContactAt?: Date | null;
  lastTouchAt?: Date | null;
};

type ProjectRow = { id: string; name?: string | null; code?: string | null };

type WorkspaceMemberRow = {
  id: string;
  name?: { firstName?: string | null; lastName?: string | null } | null;
};

type MatchMode = 'PHONE' | 'EMAIL' | 'NAME';

const WON_STAGES = new Set(['CLOSED_WON']);
const LOST_STAGES = new Set(['CLOSED_LOST']);

// Cross-book contact lookup.
//
// Sales managers only see the records they own, which also removes everyone
// else's records from normal search. That is correct for working a book and
// wrong for the one question a manager legitimately needs answered before they
// touch a lead: "is somebody already on this, and who?".
//
// So this deliberately reads past record visibility, and pays for that by
// returning a purpose-built projection instead of records — identity confirmed,
// ownership named, contact details withheld. Every call is counted and
// reported, because a lookup that cannot be audited is just a slower way to
// browse the whole database.
@Injectable()
export class EnsoLeadLookupService {
  private readonly logger = new Logger(EnsoLeadLookupService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly ensoPostHogService: EnsoPostHogService,
    private readonly ensoViewerScopeService: EnsoViewerScopeService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleEnsoLookup)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  async lookup(params: {
    workspaceId: string;
    workspaceMemberId: string;
    userWorkspaceId: string;
    searchTerm: string;
  }): Promise<EnsoLeadLookupResultDTO> {
    const { workspaceId, workspaceMemberId, userWorkspaceId } = params;
    const searchTerm = params.searchTerm.trim();

    // Someone who already sees every record has nothing to learn here, and the
    // audit trail should not fill up with admins searching their own CRM.
    const isViewerScoped = await this.ensoViewerScopeService.isViewerScoped({
      workspaceId,
      userWorkspaceId,
    });

    if (!isViewerScoped) {
      return {
        matches: [],
        isRateLimited: false,
        remainingLookupsToday: 0,
        isViewerScoped: false,
      };
    }

    if (searchTerm.length < ENSO_LEAD_LOOKUP_MIN_TERM_LENGTH) {
      return {
        matches: [],
        isRateLimited: false,
        remainingLookupsToday:
          await this.getRemainingAllowance(workspaceMemberId),
        isViewerScoped: true,
      };
    }

    const remainingBefore = await this.consumeAllowance(workspaceMemberId);

    if (remainingBefore < 0) {
      return {
        matches: [],
        isRateLimited: true,
        remainingLookupsToday: 0,
        isViewerScoped: true,
      };
    }

    const matchMode = this.resolveMatchMode(searchTerm);

    const matches = await this.findMatches({
      workspaceId,
      workspaceMemberId,
      searchTerm,
      matchMode,
    });

    this.reportLookup({
      workspaceId,
      workspaceMemberId,
      matchMode,
      matches,
    });

    return {
      matches,
      isRateLimited: false,
      remainingLookupsToday: remainingBefore,
      isViewerScoped: true,
    };
  }

  private resolveMatchMode(searchTerm: string): MatchMode {
    if (searchTerm.includes('@')) {
      return 'EMAIL';
    }

    const digits = searchTerm.replace(/\D/g, '');

    // A term that is mostly digits is a phone number, however it was pasted.
    return digits.length >= 5 && digits.length >= searchTerm.length - 4
      ? 'PHONE'
      : 'NAME';
  }

  private async findMatches({
    workspaceId,
    workspaceMemberId,
    searchTerm,
    matchMode,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
    searchTerm: string;
    matchMode: MatchMode;
  }): Promise<EnsoLeadLookupMatchDTO[]> {
    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const people = await this.findPeople({
          workspaceId,
          searchTerm,
          matchMode,
        });

        if (people.length === 0) {
          return [];
        }

        const personIds = people.map((person) => person.id);

        const [assignments, opportunities] = await Promise.all([
          this.findAssignments(workspaceId, personIds),
          this.findOpportunities(workspaceId, personIds),
        ]);

        const projectIds = [
          ...new Set(
            [...assignments, ...opportunities]
              .map((row) => row.projectId)
              .filter(isNonEmptyString),
          ),
        ];
        const ownerIds = [
          ...new Set(
            [
              ...assignments.map((row) => row.managerId),
              ...opportunities.map((row) => row.ownerId),
            ].filter(isNonEmptyString),
          ),
        ];

        const [projectsById, ownersById] = await Promise.all([
          this.findProjectsById(workspaceId, projectIds),
          this.findOwnersById(workspaceId, ownerIds),
        ]);

        return people.map((person) =>
          this.buildMatch({
            person,
            matchMode,
            workspaceMemberId,
            assignments: assignments.filter(
              (row) => row.personId === person.id,
            ),
            opportunities: opportunities.filter(
              (row) => row.pointOfContactId === person.id,
            ),
            projectsById,
            ownersById,
          }),
        );
      },
    );
  }

  private async findPeople({
    workspaceId,
    searchTerm,
    matchMode,
  }: {
    workspaceId: string;
    searchTerm: string;
    matchMode: MatchMode;
  }): Promise<PersonRow[]> {
    const repository =
      await this.globalWorkspaceOrmManager.getRepository<PersonRow>(
        workspaceId,
        'person',
        { shouldBypassPermissionChecks: true },
      );

    const queryBuilder = repository
      .createQueryBuilder('person')
      .where('"person"."deletedAt" IS NULL');

    if (matchMode === 'EMAIL') {
      queryBuilder.andWhere('"person"."emailsPrimaryEmail" ILIKE :term', {
        term: `%${searchTerm}%`,
      });
    } else if (matchMode === 'PHONE') {
      // Match on the trailing digits so a local number finds an E.164 record
      // and the other way round.
      queryBuilder.andWhere('"person"."phonesPrimaryPhoneNumber" LIKE :term', {
        term: `%${searchTerm.replace(/\D/g, '').slice(-7)}`,
      });
    } else {
      // COALESCE, not plain concatenation: half the intake contacts arrive with
      // only a first name, and `'Ana' || NULL` is NULL, which would silently
      // make them unfindable.
      queryBuilder.andWhere(
        `(COALESCE("person"."nameFirstName", '') || ' ' || COALESCE("person"."nameLastName", '')) ILIKE :term`,
        { term: `%${searchTerm}%` },
      );
    }

    return queryBuilder.take(ENSO_LEAD_LOOKUP_MAX_MATCHES).getMany();
  }

  private async findAssignments(
    workspaceId: string,
    personIds: string[],
  ): Promise<AssignmentRow[]> {
    const repository =
      await this.globalWorkspaceOrmManager.getRepository<AssignmentRow>(
        workspaceId,
        'personProjectAssignment',
        { shouldBypassPermissionChecks: true },
      );

    return repository.find({ where: { personId: In(personIds) } });
  }

  private async findOpportunities(
    workspaceId: string,
    personIds: string[],
  ): Promise<OpportunityRow[]> {
    const repository =
      await this.globalWorkspaceOrmManager.getRepository<OpportunityRow>(
        workspaceId,
        'opportunity',
        { shouldBypassPermissionChecks: true },
      );

    return repository.find({ where: { pointOfContactId: In(personIds) } });
  }

  private async findProjectsById(
    workspaceId: string,
    projectIds: string[],
  ): Promise<Map<string, ProjectRow>> {
    if (projectIds.length === 0) {
      return new Map();
    }

    const repository =
      await this.globalWorkspaceOrmManager.getRepository<ProjectRow>(
        workspaceId,
        'project',
        { shouldBypassPermissionChecks: true },
      );

    const projects = await repository.find({ where: { id: In(projectIds) } });

    return new Map(projects.map((project) => [project.id, project]));
  }

  private async findOwnersById(
    workspaceId: string,
    ownerIds: string[],
  ): Promise<Map<string, WorkspaceMemberRow>> {
    if (ownerIds.length === 0) {
      return new Map();
    }

    const repository =
      await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberRow>(
        workspaceId,
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    const owners = await repository.find({ where: { id: In(ownerIds) } });

    return new Map(owners.map((owner) => [owner.id, owner]));
  }

  private buildMatch({
    person,
    matchMode,
    workspaceMemberId,
    assignments,
    opportunities,
    projectsById,
    ownersById,
  }: {
    person: PersonRow;
    matchMode: MatchMode;
    workspaceMemberId: string;
    assignments: AssignmentRow[];
    opportunities: OpportunityRow[];
    projectsById: Map<string, ProjectRow>;
    ownersById: Map<string, WorkspaceMemberRow>;
  }): EnsoLeadLookupMatchDTO {
    const projectIds = [
      ...new Set(
        [...assignments, ...opportunities]
          .map((row) => row.projectId)
          .filter(isNonEmptyString),
      ),
    ];

    const projects = projectIds.map((projectId) =>
      this.buildProject({
        projectId,
        workspaceMemberId,
        assignment: assignments.find((row) => row.projectId === projectId),
        projectOpportunities: opportunities.filter(
          (row) => row.projectId === projectId,
        ),
        projectsById,
        ownersById,
      }),
    );

    return {
      personId: person.id,
      displayName:
        [person.name?.firstName, person.name?.lastName]
          .filter(isNonEmptyString)
          .join(' ') || 'Unnamed contact',
      matchedOn: matchMode,
      maskedPhone: maskPhone(
        person.phones?.primaryPhoneCallingCode,
        person.phones?.primaryPhoneNumber,
      ),
      maskedEmail: maskEmail(person.emails?.primaryEmail),
      firstTouchAt: person.firstTouchAt ?? null,
      isMine: projects.some((project) => project.isMine),
      projects,
    };
  }

  private buildProject({
    projectId,
    workspaceMemberId,
    assignment,
    projectOpportunities,
    projectsById,
    ownersById,
  }: {
    projectId: string;
    workspaceMemberId: string;
    assignment: AssignmentRow | undefined;
    projectOpportunities: OpportunityRow[];
    projectsById: Map<string, ProjectRow>;
    ownersById: Map<string, WorkspaceMemberRow>;
  }): EnsoLeadLookupProjectDTO {
    const project = projectsById.get(projectId);
    // The assignment manager is the standing owner of the contact for this
    // project; a deal owner only stands in when there is no assignment yet.
    const ownerId =
      assignment?.managerId ??
      projectOpportunities.find((row) => isNonEmptyString(row.ownerId))
        ?.ownerId ??
      null;
    const owner = isNonEmptyString(ownerId) ? ownersById.get(ownerId) : null;

    return {
      projectId,
      projectName: project?.name ?? null,
      projectCode: project?.code ?? null,
      ownerName: isDefined(owner)
        ? [owner.name?.firstName, owner.name?.lastName]
            .filter(isNonEmptyString)
            .join(' ') || null
        : null,
      ownerWorkspaceMemberId: ownerId,
      isMine: ownerId === workspaceMemberId,
      firstContactAt: this.earliest([
        assignment?.assignedAt ?? null,
        ...projectOpportunities.map((row) => row.firstContactAt ?? null),
      ]),
      lastTouchAt: this.latest([
        assignment?.lastContactAt ?? null,
        ...projectOpportunities.map((row) => row.lastTouchAt ?? null),
      ]),
      dealStatus: this.resolveDealStatus(projectOpportunities),
    };
  }

  private resolveDealStatus(opportunities: OpportunityRow[]): string {
    if (opportunities.length === 0) {
      return 'NONE';
    }

    const stages = opportunities.map((row) => row.stage ?? '');

    if (
      stages.some((stage) => !WON_STAGES.has(stage) && !LOST_STAGES.has(stage))
    ) {
      return 'OPEN';
    }

    return stages.some((stage) => WON_STAGES.has(stage)) ? 'WON' : 'LOST';
  }

  private earliest(dates: (Date | null)[]): Date | null {
    const defined = dates.filter(isDefined);

    return defined.length === 0
      ? null
      : defined.reduce((a, b) => (a < b ? a : b));
  }

  private latest(dates: (Date | null)[]): Date | null {
    const defined = dates.filter(isDefined);

    return defined.length === 0
      ? null
      : defined.reduce((a, b) => (a > b ? a : b));
  }

  private getAllowanceKey(workspaceMemberId: string): string {
    const day = new Date().toISOString().slice(0, 10);

    return `lookups:${day}:${workspaceMemberId}`;
  }

  private async getRemainingAllowance(
    workspaceMemberId: string,
  ): Promise<number> {
    const used =
      (await this.cacheStorage.get<number>(
        this.getAllowanceKey(workspaceMemberId),
      )) ?? 0;

    return Math.max(ENSO_LEAD_LOOKUP_DAILY_ALLOWANCE - used, 0);
  }

  // Returns what is left AFTER this lookup, or -1 when the allowance is spent.
  private async consumeAllowance(workspaceMemberId: string): Promise<number> {
    const key = this.getAllowanceKey(workspaceMemberId);
    const used = (await this.cacheStorage.get<number>(key)) ?? 0;

    if (used >= ENSO_LEAD_LOOKUP_DAILY_ALLOWANCE) {
      return -1;
    }

    // Two days of TTL so a lookup just before midnight cannot leave a counter
    // behind that suppresses the next day.
    await this.cacheStorage.set(key, used + 1, 2 * 24 * 60 * 60 * 1000);

    return ENSO_LEAD_LOOKUP_DAILY_ALLOWANCE - (used + 1);
  }

  private reportLookup({
    workspaceId,
    workspaceMemberId,
    matchMode,
    matches,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
    matchMode: MatchMode;
    matches: EnsoLeadLookupMatchDTO[];
  }): void {
    const foreignMatches = matches.filter((match) => !match.isMine);

    // The search term itself is never recorded: it is somebody's phone number
    // or name, and the audit question is who looked at whose book, not what was
    // typed.
    this.logger.log(
      `lead lookup by member ${workspaceMemberId}: ${matchMode}, ${matches.length} match(es), ${foreignMatches.length} owned by others`,
    );

    this.ensoPostHogService.capture({
      event: 'lead_lookup_performed',
      distinctId: workspaceMemberId,
      properties: {
        workspaceId,
        matchMode,
        matchCount: matches.length,
        foreignMatchCount: foreignMatches.length,
        ownerWorkspaceMemberIds: [
          ...new Set(
            foreignMatches.flatMap((match) =>
              match.projects
                .map((project) => project.ownerWorkspaceMemberId)
                .filter(isNonEmptyString),
            ),
          ),
        ],
      },
    });
  }
}
