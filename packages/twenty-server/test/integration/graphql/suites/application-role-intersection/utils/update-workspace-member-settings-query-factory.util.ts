import gql from 'graphql-tag';

import { type UpdateWorkspaceMemberSettingsInput } from 'src/engine/core-modules/user/dtos/update-workspace-member-settings.input';

export const updateWorkspaceMemberSettingsQueryFactory = ({
  input,
}: {
  input: UpdateWorkspaceMemberSettingsInput;
}) => ({
  query: gql`
    mutation UpdateWorkspaceMemberSettings(
      $input: UpdateWorkspaceMemberSettingsInput!
    ) {
      updateWorkspaceMemberSettings(input: $input)
    }
  `,
  variables: { input },
});
