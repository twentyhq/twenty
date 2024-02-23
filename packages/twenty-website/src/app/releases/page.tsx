import React from 'react';
import { Metadata } from 'next';

import { ContentContainer } from '@/app/_components/ui/layout/ContentContainer';
import { getReleases } from '@/app/get-releases';
import { Line } from '@/app/releases/components/Line';
import { Release } from '@/app/releases/components/Release';
import { Title } from '@/app/releases/components/StyledTitle';

export const metadata: Metadata = {
  title: 'Twenty - Releases',
  description: 'Latest releases of Twenty',
};

const Home = async () => {
  const releases = await getReleases();

  return (
    <ContentContainer>
      <Title />

      {releases.map((note, index) => (
        <React.Fragment key={note.slug}>
          <Release release={note} />
          {index != releases.length - 1 && <Line />}
        </React.Fragment>
      ))}
    </ContentContainer>
  );
};

export default Home;
