import gql from 'graphql-tag';

import { ObjectRecordFilterInput } from 'src/engine/core-modules/search/dtos/object-record-filter-input';

export type SearchFactoryParams = {
  searchInput: string;
  excludedObjectNameSingulars?: string[];
  includedObjectNameSingulars?: string[];
  filter?: ObjectRecordFilterInput;
};

export const searchFactory = ({
  searchInput,
  excludedObjectNameSingulars,
  includedObjectNameSingulars,
  filter,
}: SearchFactoryParams) => ({
  query: gql`
    query Search(
      $searchInput: String!
      $limit: Int!
      $excludedObjectNameSingulars: [String!]
      $includedObjectNameSingulars: [String!]
      $filter: ObjectRecordFilterInput
    ) {
      search(
        searchInput: $searchInput
        limit: $limit
        excludedObjectNameSingulars: $excludedObjectNameSingulars
        includedObjectNameSingulars: $includedObjectNameSingulars
        filter: $filter
      ) {
        recordId
        objectNameSingular
        label
        imageUrl
        tsRankCD
        tsRank
      }
    }
  `,
  variables: {
    searchInput,
    limit: 50,
    excludedObjectNameSingulars,
    includedObjectNameSingulars,
    filter,
  },
});
