import gql from 'graphql-tag';

export const APPLICATION_GQL_FIELDS = `
  id
  name
  description
  version
`;

export const findManyApplicationsQueryFactory = (
  gqlFields: string = APPLICATION_GQL_FIELDS,
) => ({
  query: gql`
    query FindManyApplications {
      findManyApplications {
        ${gqlFields}
      }
    }
  `,
  variables: {},
});
