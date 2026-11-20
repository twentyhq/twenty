import { findAllMetadataRestListPages } from 'test/integration/rest/utils/find-all-metadata-rest-list-pages.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { type EachTestingContext } from 'twenty-shared/testing';

type ViewChildRestRow = Record<string, unknown>;

export type ViewChildRestReadTestContext = {
  findRows: (args: {
    id: string;
    viewId: string;
    bearer: string;
  }) => Promise<ViewChildRestRow[]>;
};

const findAllRows = async ({
  path,
  bearer,
}: {
  path: string;
  bearer: string;
}): Promise<ViewChildRestRow[]> => {
  const pages = await findAllMetadataRestListPages({ path, bearer });

  return pages.flatMap(({ data }) => data);
};

export const buildViewChildRestReadTestCases = (
  restPath: string,
): EachTestingContext<ViewChildRestReadTestContext>[] => [
  {
    title: `GET /metadata/${restPath}/:id`,
    context: {
      findRows: async ({ id, bearer }) => {
        const response = await makeRestApiRequest({
          method: 'get',
          path: `/metadata/${restPath}/${id}`,
          bearer,
        });

        expect(response.status).toBe(200);

        return [response.body];
      },
    },
  },
  {
    title: `GET /metadata/${restPath}?viewId=`,
    context: {
      findRows: ({ viewId, bearer }) =>
        findAllRows({ path: `/metadata/${restPath}?viewId=${viewId}`, bearer }),
    },
  },
  {
    title: `GET /metadata/${restPath}`,
    context: {
      findRows: ({ bearer }) =>
        findAllRows({ path: `/metadata/${restPath}`, bearer }),
    },
  },
];
