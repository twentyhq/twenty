import { styled } from '@linaria/react';

import { color, spacing } from '@/tokens';
import { Body, Button, Container, Eyebrow, Heading } from '@/ui';

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

const ProofButtonRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
`;

export default function ProofPage() {
  return (
    <ProofMain>
      <Container>
        <ProofStack>
          <Eyebrow>In production.</Eyebrow>
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
          <ProofButtonRow>
            <Button href="/" label="Get started" />
            <Button
              href="https://github.com/twentyhq/twenty"
              label="Star us"
              variant="outlined"
            />
            <Button label="Small filled" size="small" />
            <Button label="Small outlined" size="small" variant="outlined" />
          </ProofButtonRow>
        </ProofStack>
      </Container>
    </ProofMain>
  );
}
