import React from 'react';
import { Metadata } from 'next';

import { Line } from '@/app/_components/releases/Line';
import { Release } from '@/app/_components/releases/Release';
import { Title } from '@/app/_components/releases/StyledTitle';
import { ContentContainer } from '@/app/_components/ui/layout/ContentContainer';
import {
  getMdxReleasesContent,
  getReleases,
} from '@/app/releases/get-releases';

export const metadata: Metadata = {
  title: 'Twenty - Releases',
  description:
    'Discover the newest features and improvements in Twenty, the #1 open-source CRM.',
};

const Home = async () => {
  const releases = await getReleases();
  const mdxReleasesContent = await getMdxReleasesContent(releases);

  return (
    <ContentContainer>
      <Title />

      {releases.map((note, index) => (
        <React.Fragment key={note.slug}>
          <Release
            release={note}
            mdxReleaseContent={mdxReleasesContent[index]}
          />
          {index != releases.length - 1 && <Line />}
        </React.Fragment>
      ))}
    </ContentContainer>
  );
};

export default Home;
