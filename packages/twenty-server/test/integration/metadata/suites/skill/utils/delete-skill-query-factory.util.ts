import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type DeleteSkillFactoryInput = {
  id: string;
};

const DEFAULT_SKILL_GQL_FIELDS = `
  id
  name
  label
`;

export const deleteSkillQueryFactory = ({
  input,
  gqlFields = DEFAULT_SKILL_GQL_FIELDS,
}: PerformMetadataQueryParams<DeleteSkillFactoryInput>) => ({
  query: gql`
    mutation DeleteSkill($id: UUID!) {
      deleteSkill(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
  },
});
