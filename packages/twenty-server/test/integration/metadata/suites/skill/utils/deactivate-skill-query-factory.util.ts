import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type DeactivateSkillFactoryInput = {
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

export const deactivateSkillQueryFactory = ({
  input,
  gqlFields = DEFAULT_SKILL_GQL_FIELDS,
}: PerformMetadataQueryParams<DeactivateSkillFactoryInput>) => ({
  query: gql`
    mutation DeactivateSkill($id: UUID!) {
      deactivateSkill(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
  },
});
