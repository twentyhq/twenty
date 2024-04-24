import UserGuideMain from '@/app/_components/user-guide/UserGuideMain';

export const metadata = {
  title: 'Twenty - User Guide',
  description:
    'Discover how to use Twenty CRM effectively with our detailed user guide. Explore ways to customize features, manage tasks, integrate emails, and navigate the system with ease.',
  icons: '/images/core/logo.svg',
};

export default async function UserGuideHome() {
  return <UserGuideMain />;
}
