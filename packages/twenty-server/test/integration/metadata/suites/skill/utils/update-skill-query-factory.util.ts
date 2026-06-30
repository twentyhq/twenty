import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdateSkillInput } from 'src/engine/metadata-modules/skill/dtos/update-skill.input';

export type UpdateSkillFactoryInput = UpdateSkillInput;

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

export const updateSkillQueryFactory = ({
  gqlFields = DEFAULT_SKILL_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<UpdateSkillFactoryInput>) => ({
  query: gql`
    mutation UpdateSkill($input: UpdateSkillInput!) {
      updateSkill(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
