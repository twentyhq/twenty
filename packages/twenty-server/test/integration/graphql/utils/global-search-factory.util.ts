import gql from 'graphql-tag';

import { ObjectRecordFilterInput } from 'src/engine/core-modules/global-search/dtos/object-record-filter-input';

export type GlobalSearchFactoryParams = {
  searchInput: string;
  excludedObjectNameSingulars?: string[];
  includedObjectNameSingulars?: string[];
  filter?: ObjectRecordFilterInput;
};

export const globalSearchFactory = ({
  searchInput,
  excludedObjectNameSingulars,
  includedObjectNameSingulars,
  filter,
}: GlobalSearchFactoryParams) => ({
  query: gql`
    query GlobalSearch(
      $searchInput: String!
      $limit: Int!
      $excludedObjectNameSingulars: [String!]
      $includedObjectNameSingulars: [String!]
      $filter: ObjectRecordFilterInput
    ) {
      globalSearch(
        searchInput: $searchInput
        limit: $limit
        excludedObjectNameSingulars: $excludedObjectNameSingulars
        includedObjectNameSingulars: $includedObjectNameSingulars
        filter: $filter
      ) {
        recordId
        objectSingularName
        label
        imageUrl
        tsRankCD
        tsRank
      }
    }
  `,
  variables: {
    searchInput,
    limit: 30,
    excludedObjectNameSingulars,
    includedObjectNameSingulars,
    filter,
  },
});
