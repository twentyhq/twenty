import gql from 'graphql-tag';
import { makeGraphqlAPIRequest } from 'test/utils/api-requests';
import { TEST_NAME_PREFIX } from 'test/utils/generate-record-name';
import 'tsconfig-paths/register';

// eslint-disable-next-line no-restricted-imports
import jestConfig from '../../jest-integration.config';

const query = gql`
  mutation DestroyObjects(
    $nameFilter: CompanyFilterInput
    $personFilter: PersonFilterInput
  ) {
    destroyCompanies(filter: $nameFilter) {
      id
    }
    destroyPeople(filter: $personFilter) {
      id
    }
  }
`;
const nameFilter = {
  name: {
    ilike: `%${TEST_NAME_PREFIX}%`,
  },
};

const personFilter = {
  name: {
    firstName: {
      ilike: `%${TEST_NAME_PREFIX}%`,
    },
  },
};

export default async () => {
  // @ts-expect-error in the teardown this env is not present in the global object anymore
  global.APP_PORT = jestConfig.globals?.APP_PORT;
  // @ts-expect-error in the teardown this env is not present in the global object anymore
  global.ACCESS_TOKEN = jestConfig.globals?.ACCESS_TOKEN;
  makeGraphqlAPIRequest({
    query,
    variables: {
      nameFilter,
      personFilter,
    },
  }).then((res) => {
    if (res.body.errors) throw new Error(JSON.stringify(res.body.errors));
    global.app.close();
  });
};
