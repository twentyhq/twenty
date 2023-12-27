import { ContentContainer } from '@/app/components/ContentContainer';
import { getPosts, Directory, FileContent } from '@/app/user-guide/get-posts';
import Link from 'next/link';


const DirectoryItem = ({ name, item }: { name: string, item: Directory | FileContent }) => {
  if ('content' in item) {
    // If the item is a file, we render a link.
    return (
      <div key={name}>
        <Link href={`/user-guide/${item.itemInfo.path}`}>
          {item.itemInfo.title}
        </Link>
      </div>
    );
  } else {
    // If the item is a directory, we render the title and the items in the directory.
    return (
      <div key={name}>
        <h2>{item.itemInfo.title}</h2>
        {Object.entries(item).map(([childName, childItem]) => {
          if (childName !== 'itemInfo') {
            return <DirectoryItem key={childName} name={childName} item={childItem as Directory | FileContent} />;
          }
        })}
      </div>
    );
  }
};


export default async function BlogHome() {

    const posts = await getPosts();


    return <ContentContainer>
    <h1>User Guide</h1>
    <div>
    {Object.entries(posts).map(([name, item]) => {
      if (name !== 'itemInfo') {
        return <DirectoryItem key={name} name={name} item={item as Directory | FileContent} />;
      }
    })}
  </div>
  </ContentContainer>;
}