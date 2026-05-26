import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { randomUUID } from 'crypto';

import { DataSource } from 'typeorm';
import { validate as uuidValidate } from 'uuid';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

type LinkValue = string | null | undefined;

interface AdditionalPhoneValue {
  number: string;
  countryCode: string;
  callingCode: string;
}

export interface OpenNetworkPersonPayload {
  id?: string | null;
  name?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  emails?: {
    primaryEmail?: string | null;
    additionalEmails?: string[] | null;
  } | null;
  phones?: {
    primaryPhoneNumber?: string | null;
    additionalPhones?: string[] | null;
  } | null;
  jobTitle?: string | null;
  companyName?: string | null;
  linkedinLink?: LinkValue;
  openNetworkId?: string | null;
}

interface WorkspaceRow {
  id: string;
  databaseSchema: string;
}

@Injectable()
export class OpenNetworkService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async upsertPerson(payload: OpenNetworkPersonPayload) {
    const workspace = await this.getWorkspace();
    const schema = quoteIdentifier(workspace.databaseSchema);
    const requestedId = clean(payload.id);

    assertUuidOrThrow(requestedId, 'Open Network person id');

    const firstName = clean(payload.name?.firstName);
    const lastName = clean(payload.name?.lastName);
    const primaryEmail = clean(payload.emails?.primaryEmail)?.toLowerCase();
    const additionalEmails = cleanList(payload.emails?.additionalEmails)
      .map((email) => email.toLowerCase())
      .filter((email) => email !== primaryEmail);
    const primaryPhone = clean(payload.phones?.primaryPhoneNumber);
    const additionalPhones = cleanList(payload.phones?.additionalPhones)
      .filter((phone) => phone !== primaryPhone)
      .map(toAdditionalPhoneValue);

    if (!firstName && !lastName && !primaryEmail) {
      throw new BadRequestException(
        'Open Network person requires a name or primary email.',
      );
    }

    const companyId = await this.upsertCompany(
      schema,
      clean(payload.companyName),
    );
    const existingId = await this.findExistingPersonId(
      schema,
      requestedId,
      primaryEmail,
    );
    const linkedinLink = clean(payload.linkedinLink);

    if (existingId) {
      await this.dataSource.query(
        `UPDATE ${schema}."person"
         SET "nameFirstName" = $1,
             "nameLastName" = $2,
             "emailsPrimaryEmail" = $3,
             "emailsAdditionalEmails" = $4::jsonb,
             "phonesPrimaryPhoneNumber" = $5,
             "phonesAdditionalPhones" = $6::jsonb,
             "jobTitle" = $7,
             "companyId" = $8,
             "linkedinLinkPrimaryLinkLabel" = $9,
             "linkedinLinkPrimaryLinkUrl" = $10,
             "updatedBySource" = 'API',
             "updatedByName" = 'Open Network',
             "updatedAt" = now()
         WHERE id = $11`,
        [
          firstName,
          lastName,
          primaryEmail,
          JSON.stringify(additionalEmails),
          primaryPhone,
          JSON.stringify(additionalPhones),
          clean(payload.jobTitle),
          companyId,
          linkedinLink ? 'LinkedIn' : null,
          linkedinLink,
          existingId,
        ],
      );

      return { id: existingId, action: 'updated' };
    }

    const personId = requestedId || randomUUID();

    await this.dataSource.query(
      `INSERT INTO ${schema}."person" (
        id,
        "nameFirstName",
        "nameLastName",
        "emailsPrimaryEmail",
        "emailsAdditionalEmails",
        "phonesPrimaryPhoneNumber",
        "phonesAdditionalPhones",
        "jobTitle",
        "companyId",
        "linkedinLinkPrimaryLinkLabel",
        "linkedinLinkPrimaryLinkUrl",
        "createdBySource",
        "createdByName",
        "updatedBySource",
        "updatedByName"
      ) VALUES (
        $1, $2, $3, $4, $5::jsonb, $6, $7::jsonb, $8, $9, $10, $11, 'API', 'Open Network', 'API', 'Open Network'
      )`,
      [
        personId,
        firstName,
        lastName,
        primaryEmail,
        JSON.stringify(additionalEmails),
        primaryPhone,
        JSON.stringify(additionalPhones),
        clean(payload.jobTitle),
        companyId,
        linkedinLink ? 'LinkedIn' : null,
        linkedinLink,
      ],
    );

    return { id: personId, action: 'created' };
  }

  private async getWorkspace(): Promise<WorkspaceRow> {
    const workspaceId = clean(
      this.twentyConfigService.get('OPEN_NETWORK_WORKSPACE_ID'),
    );

    assertUuidOrThrow(workspaceId, 'OPEN_NETWORK_WORKSPACE_ID');

    const rows = await this.dataSource.query(
      `SELECT id, "databaseSchema"
       FROM core.workspace
       WHERE "deletedAt" IS NULL
       ${workspaceId ? 'AND id = $1' : ''}
       ORDER BY "createdAt" ASC
       LIMIT 1`,
      workspaceId ? [workspaceId] : [],
    );
    const workspace = rows[0] as WorkspaceRow | undefined;

    if (!workspace?.databaseSchema) {
      throw new BadRequestException(
        'Open Network workspace is not configured.',
      );
    }

    return workspace;
  }

  private async upsertCompany(
    schema: string,
    companyName: string | null,
  ): Promise<string | null> {
    if (!companyName) return null;

    const existingRows = await this.dataSource.query(
      `SELECT id FROM ${schema}."company" WHERE "deletedAt" IS NULL AND name = $1 LIMIT 1`,
      [companyName],
    );
    const existingId = existingRows[0]?.id as string | undefined;

    if (existingId) return existingId;

    const companyId = randomUUID();

    await this.dataSource.query(
      `INSERT INTO ${schema}."company" (
        id,
        name,
        "createdBySource",
        "createdByName",
        "updatedBySource",
        "updatedByName"
      ) VALUES ($1, $2, 'API', 'Open Network', 'API', 'Open Network')`,
      [companyId, companyName],
    );

    return companyId;
  }

  private async findExistingPersonId(
    schema: string,
    requestedId: string | null,
    primaryEmail: string | null | undefined,
  ): Promise<string | null> {
    if (requestedId) {
      const rows = await this.dataSource.query(
        `SELECT id FROM ${schema}."person" WHERE id = $1 AND "deletedAt" IS NULL LIMIT 1`,
        [requestedId],
      );
      const id = rows[0]?.id as string | undefined;

      if (id) return id;
    }

    if (!primaryEmail) return null;

    const rows = await this.dataSource.query(
      `SELECT id FROM ${schema}."person" WHERE "emailsPrimaryEmail" = $1 AND "deletedAt" IS NULL LIMIT 1`,
      [primaryEmail],
    );

    return (rows[0]?.id as string | undefined) ?? null;
  }
}

function clean(value: string | null | undefined): string | null {
  const trimmed = value?.replace(/\s+/g, ' ').trim();

  return trimmed || null;
}

function cleanList(values: string[] | null | undefined): string[] {
  if (!Array.isArray(values)) return [];

  return values
    .map((value) => clean(value))
    .filter((value): value is string => Boolean(value));
}

function assertUuidOrThrow(value: string | null, label: string) {
  if (!value) return;

  if (!uuidValidate(value)) {
    throw new BadRequestException(`${label} must be a valid UUID.`);
  }
}

function toAdditionalPhoneValue(phoneNumber: string): AdditionalPhoneValue {
  return {
    number: phoneNumber,
    countryCode: '',
    callingCode: '',
  };
}

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}
