import { FunctionComponent } from 'react';
import * as TablerIcons from '@tabler/icons-react';
import Link from 'next/link';

import { ContentContainer } from '@/app/components/ContentContainer';
import { Directory, FileContent, getPosts } from '@/app/get-posts';

function loadIcon(iconName?: string) {
  const name = iconName ? iconName : 'IconCategory';

  try {
    const icon = TablerIcons[
      name as keyof typeof TablerIcons
    ] as FunctionComponent;
    return icon as TablerIcons.Icon;
  } catch (error) {
    console.error('Icon not found:', iconName);
    return null;
  }
}

const DirectoryItem = ({
  name,
  item,
}: {
  name: string;
  item: Directory | FileContent;
}) => {
  if ('content' in item) {
    // If the item is a file, we render a link.
    const Icon = loadIcon(item.itemInfo.icon);

    return (
      <div key={name}>
        <Link
          style={{
            textDecoration: 'none',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          href={
            item.itemInfo.path != 'user-guide/home'
              ? `/user-guide/${item.itemInfo.path}`
              : '/user-guide'
          }
        >
          {Icon ? <Icon size={12} /> : ''}
          {item.itemInfo.title}
        </Link>
      </div>
    );
  } else {
    // If the item is a directory, we render the title and the items in the directory.
    return (
      <div key={name}>
        <h4 style={{ textTransform: 'uppercase', color: '#B3B3B3' }}>
          {item.itemInfo.title}
        </h4>
        {Object.entries(item).map(([childName, childItem]) => {
          if (childName !== 'itemInfo') {
            return (
              <DirectoryItem
                key={childName}
                name={childName}
                item={childItem as Directory | FileContent}
              />
            );
          }
        })}
      </div>
    );
  }
};

export default async function UserGuideHome({
  children,
}: {
  children: React.ReactNode;
}) {
  const basePath = '/src/content/user-guide';

  const posts = await getPosts(basePath);

  return (
    <ContentContainer>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div
          style={{
            borderRight: '1px solid rgba(20, 20, 20, 0.08)',
            paddingRight: '24px',
            minWidth: '200px',
            paddingTop: '48px',
          }}
        >
          {posts['home.mdx'] && (
            <DirectoryItem
              name="home"
              item={posts['home.mdx'] as FileContent}
            />
          )}
          {Object.entries(posts).map(([name, item]) => {
            if (name !== 'itemInfo' && name != 'home.mdx') {
              return (
                <DirectoryItem
                  key={name}
                  name={name}
                  item={item as Directory | FileContent}
                />
              );
            }
          })}
        </div>
        <div style={{ paddingLeft: '24px', paddingRight: '200px' }}>
          {children}
        </div>
      </div>
    </ContentContainer>
  );
}
