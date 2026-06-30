import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type ActivateSkillFactoryInput = {
  id: string;
};

const DEFAULT_SKILL_GQL_FIELDS = `
  id
  name
  label
  icon
  description
  content
  isCustom
  isActive
  applicationId
  createdAt
  updatedAt
`;

export const activateSkillQueryFactory = ({
  input,
  gqlFields = DEFAULT_SKILL_GQL_FIELDS,
}: PerformMetadataQueryParams<ActivateSkillFactoryInput>) => ({
  query: gql`
    mutation ActivateSkill($id: UUID!) {
      activateSkill(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
  },
});
