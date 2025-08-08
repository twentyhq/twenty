import { Background } from '@/app/_components/oss-friends/Background';
import { Card, type OssData } from '@/app/_components/oss-friends/Card';
import { CardContainer } from '@/app/_components/oss-friends/CardContainer';
import { ContentContainer } from '@/app/_components/oss-friends/ContentContainer';
import { Header } from '@/app/_components/oss-friends/Header';

export const metadata = {
  title: 'Twenty - OSS friends',
  description:
    'At Twenty, we are proud to be part of a global open-source movement. Here are some of our fellow open source friends.',
  icons: '/images/core/logo.svg',
};

export const dynamic = 'force-dynamic';

export default async function OssFriends() {
  const ossList = await fetch('https://formbricks.com/api/oss-friends');

  const listJson = await ossList.json();

  return (
    <Background>
      <ContentContainer>
        <Header />
        <CardContainer>
          {listJson.data.map((data: OssData, index: number) => (
            <Card key={index} data={data} />
          ))}
        </CardContainer>
      </ContentContainer>
    </Background>
  );
}
