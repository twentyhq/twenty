import { styled } from '@linaria/react';

import { RichText } from './RichText';

const About = styled(RichText)`
  max-width: 64ch;
`;

export function PartnerProfileAbout({ description }: { description: string }) {
  if (!description) return null;

  return <About markdown={description} />;
}
