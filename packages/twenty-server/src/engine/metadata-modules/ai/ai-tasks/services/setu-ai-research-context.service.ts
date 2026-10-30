import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { OrderByDirection } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { type SetuAiActionActor } from 'src/engine/metadata-modules/ai/ai-actions/types/setu-ai-action-actor.type';
import {
  type SetuAiResearchCrmContext,
  type SetuAiResearchCrmSource,
} from 'src/engine/metadata-modules/ai/ai-tasks/types/setu-ai-research-crm-context.type';

const MAX_RELATED_RECORDS = 12;
const MAX_BODY_LENGTH = 1_500;
const NEWEST_FIRST: ObjectRecordOrderBy = [
  { updatedAt: OrderByDirection.DescNullsLast },
];

// Business fields worth showing a researcher. Anything else on the record,
// including system and custom fields, stays out of the model's context.
const COMPANY_FIELD_NAMES = [
  'name',
  'domainName',
  'linkedinLink',
  'xLink',
  'employees',
  'annualRecurringRevenue',
  'address',
  'idealCustomerProfile',
  'tagline',
];

type RecordRow = Record<string, unknown> & { id: string };

const clip = (text: string) =>
  text.length > MAX_BODY_LENGTH ? `${text.slice(0, MAX_BODY_LENGTH)}…` : text;

const toPlainValue = (value: unknown): unknown => {
  if (!isPlainObject(value)) {
    return value;
  }

  if ('primaryLinkUrl' in value) {
    return isNonEmptyString(value.primaryLinkUrl) ? value.primaryLinkUrl : null;
  }

  if ('amountMicros' in value) {
    return isDefined(value.amountMicros)
      ? `${Number(value.amountMicros) / 1_000_000} ${String(value.currencyCode ?? '')}`.trim()
      : null;
  }

  if ('addressCity' in value) {
    return (
      [value.addressCity, value.addressState, value.addressCountry]
        .filter(isNonEmptyString)
        .join(', ') || null
    );
  }

  if ('firstName' in value) {
    return [value.firstName, value.lastName].filter(isNonEmptyString).join(' ');
  }

  if ('markdown' in value) {
    return isNonEmptyString(value.markdown) ? clip(value.markdown) : null;
  }

  return null;
};

const pickFields = (
  record: RecordRow,
  fieldNames: string[],
): Record<string, unknown> =>
  Object.fromEntries(
    fieldNames
      .filter((fieldName) => fieldName in record)
      .map((fieldName) => [fieldName, toPlainValue(record[fieldName])])
      .filter(([, value]) => isDefined(value) && value !== ''),
  );

// Reads one account's CRM context as the initiating person, through the
// same record API the chat tools use, so object and field permissions apply
// exactly as they do in the app. A section the person may not read is left
// out and named, never fetched with elevated access.
@Injectable()
export class SetuAiResearchContextService {
  constructor(private readonly findRecordsService: FindRecordsService) {}

  async findCompanyNames({
    actor,
    companyIds,
  }: {
    actor: SetuAiActionActor;
    companyIds: string[];
  }): Promise<{ id: string; name: string }[]> {
    const companies = await this.findRecords(actor, 'company', {
      filter: { id: { in: companyIds } },
      limit: companyIds.length,
    });

    return companies.map((company) => ({
      id: company.id,
      name: isNonEmptyString(company.name) ? company.name : 'Untitled company',
    }));
  }

  async load({
    actor,
    companyId,
  }: {
    actor: SetuAiActionActor;
    companyId: string;
  }): Promise<SetuAiResearchCrmContext | null> {
    const company = await this.findRecords(actor, 'company', {
      filter: { id: { eq: companyId } },
      limit: 1,
    });

    if (company.length === 0) {
      return null;
    }

    const unavailableSections: string[] = [];
    const readSection = async (
      sectionName: string,
      read: () => Promise<SetuAiResearchCrmSource[]>,
    ) => {
      try {
        return await read();
      } catch {
        unavailableSections.push(sectionName);

        return [];
      }
    };

    const [people, opportunities, notes, tasks] = await Promise.all([
      readSection('people', () => this.readPeople(actor, companyId)),
      readSection('opportunities', () =>
        this.readOpportunities(actor, companyId),
      ),
      readSection('notes', () => this.readNotes(actor, companyId)),
      readSection('tasks', () => this.readTasks(actor, companyId)),
    ]);

    const [companyRecord] = company;

    return {
      company: this.toSource('company', companyRecord, {
        label: isNonEmptyString(companyRecord.name)
          ? companyRecord.name
          : 'Company',
        data: pickFields(companyRecord, COMPANY_FIELD_NAMES),
      }),
      people,
      opportunities,
      notes,
      tasks,
      unavailableSections,
    };
  }

  private async readPeople(actor: SetuAiActionActor, companyId: string) {
    const people = await this.findRecords(actor, 'person', {
      filter: { companyId: { eq: companyId } },
      orderBy: NEWEST_FIRST,
      limit: MAX_RELATED_RECORDS,
    });

    return people.map((person) => {
      const name = toPlainValue(person.name);

      return this.toSource('person', person, {
        label: isNonEmptyString(name) ? name : 'Person',
        data: pickFields(person, ['name', 'jobTitle', 'city']),
      });
    });
  }

  private async readOpportunities(actor: SetuAiActionActor, companyId: string) {
    const opportunities = await this.findRecords(actor, 'opportunity', {
      filter: { companyId: { eq: companyId } },
      orderBy: NEWEST_FIRST,
      limit: MAX_RELATED_RECORDS,
    });

    return opportunities.map((opportunity) =>
      this.toSource('opportunity', opportunity, {
        label: isNonEmptyString(opportunity.name)
          ? opportunity.name
          : 'Opportunity',
        data: {
          ...pickFields(opportunity, ['name', 'stage', 'amount', 'closeDate']),
          lastUpdated: opportunity.updatedAt,
        },
      }),
    );
  }

  private async readNotes(actor: SetuAiActionActor, companyId: string) {
    const targets = await this.findRecords(actor, 'noteTarget', {
      filter: { targetCompanyId: { eq: companyId } },
      limit: MAX_RELATED_RECORDS,
    });
    const noteIds = targets
      .map((target) => target.noteId)
      .filter(isNonEmptyString);

    if (noteIds.length === 0) {
      return [];
    }

    const notes = await this.findRecords(actor, 'note', {
      filter: { id: { in: noteIds } },
      orderBy: NEWEST_FIRST,
      limit: noteIds.length,
    });

    return notes.map((note) =>
      this.toSource('note', note, {
        label: isNonEmptyString(note.title) ? note.title : 'Note',
        data: {
          ...pickFields(note, ['title', 'bodyV2']),
          createdAt: note.createdAt,
        },
      }),
    );
  }

  private async readTasks(actor: SetuAiActionActor, companyId: string) {
    const targets = await this.findRecords(actor, 'taskTarget', {
      filter: { targetCompanyId: { eq: companyId } },
      limit: MAX_RELATED_RECORDS,
    });
    const taskIds = targets
      .map((target) => target.taskId)
      .filter(isNonEmptyString);

    if (taskIds.length === 0) {
      return [];
    }

    const tasks = await this.findRecords(actor, 'task', {
      filter: { id: { in: taskIds } },
      orderBy: NEWEST_FIRST,
      limit: taskIds.length,
    });

    return tasks.map((task) =>
      this.toSource('task', task, {
        label: isNonEmptyString(task.title) ? task.title : 'Task',
        data: pickFields(task, ['title', 'status', 'dueAt', 'bodyV2']),
      }),
    );
  }

  private async findRecords(
    actor: SetuAiActionActor,
    objectNameSingular: string,
    {
      filter,
      orderBy,
      limit,
    }: {
      filter: Record<string, unknown>;
      orderBy?: ObjectRecordOrderBy;
      limit: number;
    },
  ): Promise<RecordRow[]> {
    const output = await this.findRecordsService.execute({
      objectName: objectNameSingular,
      filter,
      orderBy,
      limit,
      authContext: actor.authContext,
      rolePermissionConfig: actor.rolePermissionConfig,
      shouldBuildEffectiveSelectFields: false,
    });

    if (!output.success || !isDefined(output.result)) {
      throw new Error(`Could not read ${objectNameSingular}`);
    }

    return output.result.records as RecordRow[];
  }

  private toSource(
    objectNameSingular: string,
    record: RecordRow,
    { label, data }: { label: string; data: Record<string, unknown> },
  ): SetuAiResearchCrmSource {
    return {
      sourceId: `record:${objectNameSingular}:${record.id}`,
      objectNameSingular,
      recordId: record.id,
      label,
      data,
    };
  }
}
