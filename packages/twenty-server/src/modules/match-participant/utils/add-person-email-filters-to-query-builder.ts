import { type SelectQueryBuilder } from 'typeorm';

import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export interface AddPersonEmailFiltersToQueryBuilderOptions {
  queryBuilder: SelectQueryBuilder<PersonWorkspaceEntity>;
  emails: string[];
  excludePersonIds?: string[];
}

// A query builder rather than find(): matching additional emails needs the jsonb @> operator
export function addPersonEmailFiltersToQueryBuilder({
  queryBuilder,
  emails,
  excludePersonIds = [],
}: AddPersonEmailFiltersToQueryBuilderOptions): SelectQueryBuilder<PersonWorkspaceEntity> {
  const normalizedEmails = emails.map((email) => email.toLowerCase());

  queryBuilder = queryBuilder
    .select([
      'person.id',
      'person.emailsPrimaryEmail',
      'person.emailsAdditionalEmails',
      'person.deletedAt',
    ])
    .where('LOWER(person.emailsPrimaryEmail) IN (:...emails)', {
      emails: normalizedEmails,
    })
    .withDeleted();

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

  queryBuilder = queryBuilder.withDeleted();

  return queryBuilder;
}
