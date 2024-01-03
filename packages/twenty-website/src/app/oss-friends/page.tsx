import { Background } from '@/app/components/oss-friends/Background';
import { Card, OssData } from '@/app/components/oss-friends/Card';
import { CardContainer } from '@/app/components/oss-friends/CardContainer';
import { ContentContainer } from '@/app/components/oss-friends/ContentContainer';
import { Header } from '@/app/components/oss-friends/Header';

export default async function OssFriends() {
  const ossList = await fetch('https://formbricks.com/api/oss-friends');

  const listJson = await ossList.json();

  return (
    <>
      <Background />
      <ContentContainer>
        <Header />
        <CardContainer>
          {listJson.data.map((data: OssData, index: number) => (
            <Card key={index} data={data} />
          ))}
        </CardContainer>
      </ContentContainer>
    </>
  );
}
