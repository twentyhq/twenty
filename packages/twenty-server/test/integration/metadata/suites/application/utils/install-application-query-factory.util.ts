import gql from 'graphql-tag';

export type InstallApplicationFactoryInput = {
  workspaceMigration: {
    actions: {
      type: 'delete';
      metadataName: string;
      universalIdentifier: string;
    }[];
  };
};

export const installApplicationQueryFactory = ({
  input,
}: {
  input: InstallApplicationFactoryInput;
}) => ({
  query: gql`
    mutation InstallApplication($workspaceMigration: WorkspaceMigrationInput!) {
      installApplication(workspaceMigration: $workspaceMigration)
    }
  `,
  variables: {
    workspaceMigration: input.workspaceMigration,
  },
});
