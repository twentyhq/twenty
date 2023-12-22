import { GetStaticProps } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { compileMDX } from 'next-mdx-remote/rsc'
import gfm from 'remark-gfm';
import { ContentContainer } from '../components/ContentContainer';
import { visit } from 'unist-util-visit';
import remarkBehead from 'remark-behead';


interface Release {
    id: number;
    name: string;
    body: string;
  }
  

  const Home = async () => {
    const res = await fetch(`${process.env.BASE_URL}/api/github`);
    const data: Release[] = await res.json();
  
    const releases = await Promise.all(
      data.map(async (release) => {
        let mdxSource;
        try {
             mdxSource =  await compileMDX({
                source: release.body,
                options: {
                  mdxOptions: {
                    remarkPlugins: [
                        gfm,
                        [remarkBehead, { depth: 2 }],
                    ],
                  }
                },
              }); 
              mdxSource = mdxSource.content;     
        } catch(error) {
            console.error('An error occurred during MDX rendering:', error);
             mdxSource =  `<p>Oops! Something went wrong.</p> ${error}`;;
        }

        return {
          id: release.id,
          name: release.name,
          body: mdxSource,
        };
      })
    );
  
    return (
      <ContentContainer>
        <h1>Releases</h1>

        {releases.map(release => (
          <div key={release.id}
          style={{
            padding: '24px 0px 24px 0px',
            borderBottom: '1px solid #ccc',
          }}>
            <h2>{release.name}</h2>
            <div>{release.body}</div>
          </div>
        ))}
      </ContentContainer>
    )
  }
  
  export default Home;