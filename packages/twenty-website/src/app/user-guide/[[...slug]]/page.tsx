import { ContentContainer } from '@/app/components/ContentContainer';
import { getPosts, Directory, FileContent, getPost } from '@/app/user-guide/get-posts';
import Link from 'next/link';


const DirectoryItem = ({ name, item }: { name: string, item: Directory | FileContent }) => {

  if ('content' in item) {
    // If the item is a file, we render a link.
    return (
      <div key={name}>
        <Link style={{textDecoration: 'none', color: '#333'}} href={item.itemInfo.path != 'user-guide/home' ? `/user-guide/${item.itemInfo.path}` : '/user-guide'}>
          {item.itemInfo.title}
        </Link>
      </div>
    );
  } else {
    // If the item is a directory, we render the title and the items in the directory.
    return (
      <div key={name}>
        <h4 style={{textTransform: 'uppercase', color: '#B3B3B3'}}>{item.itemInfo.title}</h4>
        {Object.entries(item).map(([childName, childItem]) => {
          if (childName !== 'itemInfo') {
            return <DirectoryItem key={childName} name={childName} item={childItem as Directory | FileContent} />;
          }
        })}
      </div>
    );
  }
};


export default async function UserGuideHome({ params }: { params: { slug: string[] } }) {

    const posts = await getPosts();

    const mainPost = await getPost(params.slug && params.slug.length ? params.slug : ['home']);

    return <ContentContainer>
    <div style={{display: 'flex', flexDirection: 'row'}}>
      <div style={{borderRight: '1px solid rgba(20, 20, 20, 0.08)', paddingRight: '24px', minWidth: '200px', paddingTop: '48px'}}>
      {posts['home.mdx'] && <DirectoryItem name="home" item={posts['home.mdx'] as FileContent} />}
      {Object.entries(posts).map(([name, item]) => {
        if (name !== 'itemInfo' && name != "home.mdx") {
          return <DirectoryItem key={name} name={name} item={item as Directory | FileContent} />;
        }
      })}
    </div>
    <div style={{padding: '24px'}}>
      <h2>{mainPost?.itemInfo.title}</h2>
      <div>{mainPost?.content}</div>
    </div>
  </div>
  </ContentContainer>;
}