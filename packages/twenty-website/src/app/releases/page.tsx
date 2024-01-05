import { Metadata } from 'next';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkBehead from 'remark-behead';
import gfm from 'remark-gfm';

import { ContentContainer } from '../components/ContentContainer';

interface Release {
  id: number;
  name: string;
  body: string;
}

export const metadata: Metadata = {
  title: 'Twenty - Releases',
  description: 'Latest releases of Twenty',
};

const Home = async () => {
  const response = await fetch(
    'https://api.github.com/repos/twentyhq/twenty/releases',
  );
  const data: Release[] = await response.json();

  const releases = await Promise.all(
    data.map(async (release) => {
      let mdxSource;
      try {
        mdxSource = await compileMDX({
          source: release.body,
          options: {
            mdxOptions: {
              remarkPlugins: [gfm, [remarkBehead, { depth: 2 }]],
            },
          },
        });
        mdxSource = mdxSource.content;
      } catch (error) {
        console.error('An error occurred during MDX rendering:', error);
        mdxSource = `<p>Oops! Something went wrong.</p> ${error}`;
      }

      return {
        id: release.id,
        name: release.name,
        body: mdxSource,
      };
    }),
  );

  return (
    <ContentContainer>
      <h1>Releases</h1>

      {releases.map((release, index) => (
        <div
          key={release.id}
          style={{
            padding: '24px 0px 24px 0px',
            borderBottom:
              index === releases.length - 1 ? 'none' : '1px solid #ccc',
          }}
        >
          <h2>{release.name}</h2>
          <div>{release.body}</div>
        </div>
      ))}
    </ContentContainer>
  );
};

export default Home;
