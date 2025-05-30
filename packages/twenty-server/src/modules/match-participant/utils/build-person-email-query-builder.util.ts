import { SelectQueryBuilder } from 'typeorm';

import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export interface BuildPersonEmailQueryBuilderOptions {
  queryBuilder: SelectQueryBuilder<PersonWorkspaceEntity>;
  emails: string[];
  excludePersonIds?: string[];
}

export function buildPersonEmailQueryBuilder({
  queryBuilder,
  emails,
  excludePersonIds = [],
}: BuildPersonEmailQueryBuilderOptions): SelectQueryBuilder<PersonWorkspaceEntity> {
  const normalizedEmails = emails.map((email) => email.toLowerCase());

  queryBuilder = queryBuilder
    .select([
      'person.id',
      'person.emailsPrimaryEmail',
      'person.emailsAdditionalEmails',
    ])
    .where('LOWER(person.emailsPrimaryEmail) IN (:...emails)', {
      emails: normalizedEmails,
    });

  if (excludePersonIds.length > 0) {
    queryBuilder = queryBuilder.andWhere(
      'person.id NOT IN (:...excludePersonIds)',
      {
        excludePersonIds,
      },
    );
  }

  for (const [index, email] of normalizedEmails.entries()) {
    const emailParamName = `email${index}`;
    const orWhereIsInAdditionalEmail =
      excludePersonIds.length > 0
        ? `person.id NOT IN (:...excludePersonIds) AND person.emailsAdditionalEmails @> :${emailParamName}::jsonb`
        : `person.emailsAdditionalEmails @> :${emailParamName}::jsonb`;

    queryBuilder = queryBuilder.orWhere(orWhereIsInAdditionalEmail, {
      ...(excludePersonIds.length > 0 && { excludePersonIds }),
      [emailParamName]: JSON.stringify([email]),
    });
  }

  return queryBuilder;
}
