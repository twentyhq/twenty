import { type CrowdinContext } from '../types/crowdin-context.type';
import { crowdinRequest } from './crowdin-request.util';

const PAGE_SIZE = 500;

export async function fetchAllPages<TItem>(
  context: CrowdinContext,
  buildEndpoint: (pagination: string) => string,
): Promise<TItem[]> {
  const items: TItem[] = [];
  let offset = 0;

  while (true) {
    type PagedResponse = { data: Array<{ data: TItem }> };

    const response = await crowdinRequest<PagedResponse>(
      context,
      buildEndpoint(`limit=${PAGE_SIZE}&offset=${offset}`),
    );

    if (!response || response.data.length === 0) break;

    items.push(...response.data.map((item) => item.data));

    if (response.data.length < PAGE_SIZE) break;

    offset += PAGE_SIZE;
  }

  return items;
}
