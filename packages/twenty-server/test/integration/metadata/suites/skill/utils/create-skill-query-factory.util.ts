import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateSkillInput } from 'src/engine/metadata-modules/skill/dtos/create-skill.input';

export type CreateSkillFactoryInput = CreateSkillInput;

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

export const createSkillQueryFactory = ({
  input,
  gqlFields = DEFAULT_SKILL_GQL_FIELDS,
}: PerformMetadataQueryParams<CreateSkillFactoryInput>) => ({
  query: gql`
    mutation CreateSkill($input: CreateSkillInput!) {
      createSkill(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
