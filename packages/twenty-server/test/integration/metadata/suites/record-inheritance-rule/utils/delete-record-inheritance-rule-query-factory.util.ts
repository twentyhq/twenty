import gql from 'graphql-tag';

export const deleteRecordInheritanceRuleQueryFactory = (id: string) => ({
  query: gql`
    mutation DeleteRecordInheritanceRule($id: UUID!) {
      deleteRecordInheritanceRule(id: $id) {
        id
      }
    }
  `,
  variables: { id },
});
