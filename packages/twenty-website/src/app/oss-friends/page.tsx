import { Background } from '@/app/components/oss-friends/Background';
import {
  CardContainer,
  OssData,
} from '@/app/components/oss-friends/CardContainer';
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
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '32px',
            justifyContent: 'center',
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          {listJson.data.map((data: OssData, index: number) => (
            <CardContainer key={index} data={data} />
          ))}
        </div>
      </ContentContainer>
    </>
  );
}
