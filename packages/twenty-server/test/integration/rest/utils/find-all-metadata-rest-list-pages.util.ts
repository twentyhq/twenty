import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { isDefined } from 'twenty-shared/utils';

type MetadataRestListPage = {
  data: Record<string, unknown>[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  totalCount: number;
};

export const findAllMetadataRestListPages = async ({
  path,
  bearer,
}: {
  path: string;
  bearer: string;
}): Promise<MetadataRestListPage[]> => {
  const pages: MetadataRestListPage[] = [];
  let startingAfter: string | null = null;

  do {
    const separator = path.includes('?') ? '&' : '?';
    const response = await makeRestApiRequest({
      method: 'get',
      path: isDefined(startingAfter)
        ? `${path}${separator}starting_after=${startingAfter}`
        : path,
      bearer,
    });

    if (response.status !== 200) {
      throw new Error(
        `GET ${path} answered ${response.status}: ${JSON.stringify(response.body)}`,
      );
    }

    pages.push(response.body);
    startingAfter = response.body.pageInfo.hasNextPage
      ? response.body.pageInfo.endCursor
      : null;
  } while (isDefined(startingAfter));

  return pages;
};
