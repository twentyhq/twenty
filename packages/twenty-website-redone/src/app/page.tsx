import { styled } from '@linaria/react';

import { color, spacing } from '@/tokens';
import { Body, Container, Heading } from '@/ui';

const ProofMain = styled.main`
  background-color: ${color('neutral')};
  min-height: 100vh;
  min-height: 100dvh;
  padding-block: ${spacing(16)};
`;

const ProofStack = styled.div`
  display: grid;
  gap: ${spacing(6)};
  justify-items: start;
`;

export default function ProofPage() {
  return (
    <ProofMain>
      <Container>
        <ProofStack>
          <Heading as="h1" size="xl" weight="light">
            {'See how teams\nbuild *on Twenty*'}
          </Heading>
          <Body muted>
            One translated string per heading: the accent family comes from
            notation, not markup, so translation tools see natural text. Type
            scales fluidly from one clamp() mechanism, and this column sits in
            the only horizontal gutter on the site.
          </Body>
          <Heading size="xs" family="sans">
            {'Accent inverts per family: *serif inside sans*'}
          </Heading>
        </ProofStack>
      </Container>
    </ProofMain>
  );
}
