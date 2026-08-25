import { type WorkspaceSelectQueryBuilderV2 } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';

export interface AddPersonEmailFiltersToQueryBuilderOptions {
  queryBuilder: WorkspaceSelectQueryBuilderV2;
  emails: string[];
  excludePersonIds?: string[];
}

// A query builder rather than find(): matching additional emails needs the jsonb @> operator
export function addPersonEmailFiltersToQueryBuilder({
  queryBuilder,
  emails,
  excludePersonIds = [],
}: AddPersonEmailFiltersToQueryBuilderOptions): WorkspaceSelectQueryBuilderV2 {
  const normalizedEmails = emails.map((email) => email.toLowerCase());

  queryBuilder = queryBuilder
    .where('LOWER("person"."emailsPrimaryEmail") IN (:...emails)', {
      emails: normalizedEmails,
    })
    .withDeleted();

  if (excludePersonIds.length > 0) {
    queryBuilder = queryBuilder.andWhere(
      '"person"."id" NOT IN (:...excludePersonIds)',
      {
        excludePersonIds,
      },
    );
  }

  for (const [index, email] of normalizedEmails.entries()) {
    const emailParamName = `email${index}`;
    const orWhereIsInAdditionalEmail =
      excludePersonIds.length > 0
        ? `"person"."id" NOT IN (:...excludePersonIds) AND "person"."emailsAdditionalEmails" @> :${emailParamName}::jsonb`
        : `"person"."emailsAdditionalEmails" @> :${emailParamName}::jsonb`;

    queryBuilder = queryBuilder.orWhere(orWhereIsInAdditionalEmail, {
      ...(excludePersonIds.length > 0 && { excludePersonIds }),
      [emailParamName]: JSON.stringify([email]),
    });
  }

  queryBuilder = queryBuilder.withDeleted();

  return queryBuilder;
}
