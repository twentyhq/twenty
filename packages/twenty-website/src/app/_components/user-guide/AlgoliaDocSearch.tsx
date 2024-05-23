import { DocSearch } from '@docsearch/react';
import { StoredDocSearchHit } from '@docsearch/react/dist/esm/types';

interface AlgoliaHit extends StoredDocSearchHit {
  _snippetResult?: {
    content: { value: string };
  };
}

export const AlgoliaDocSearch = () => {
  return (
    <DocSearch
      hitComponent={({ hit }: { hit: AlgoliaHit }) => (
        <section className="DocSearch-Hits">
          <a href={hit.url}>
            <div className="DocSearch-Hit-Container">
              <div className="DocSearch-Hit-icon">
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path
                    d="M13 13h4-4V8H7v5h6v4-4H7V8H3h4V3v5h6V3v5h4-4v5zm-6 0v4-4H3h4z"
                    stroke="currentColor"
                    fill="none"
                    fillRule="evenodd"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </div>
              <div className="DocSearch-Hit-action">
                <h2>
                  {hit.hierarchy.lvl1 ? hit.hierarchy.lvl1 : hit.hierarchy.lvl0}
                </h2>
                <p
                  dangerouslySetInnerHTML={{
                    __html: hit?._snippetResult?.content?.value || '',
                  }}
                ></p>
              </div>
            </div>
          </a>
        </section>
      )}
      appId={process.env.NEXT_PUBLIC_ALGOLIA_APP_ID as string}
      apiKey={process.env.NEXT_PUBLIC_ALGOLIA_API_KEY as string}
      indexName="twenty-user-guide"
    />
  );
};
