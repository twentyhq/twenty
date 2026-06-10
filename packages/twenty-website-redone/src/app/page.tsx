import { styled } from '@linaria/react';

import { spacing } from '@/tokens';
import { Body, Button, Eyebrow, Heading, SectionShell } from '@/ui';
import { TrustedBy } from '@/sections/trusted-by';

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
    <main>
      <SectionShell scheme="muted">
        <ProofStack>
          <Eyebrow>In production.</Eyebrow>
          <Heading as="h1" size="xl" weight="light">
            {'See how teams\nbuild *on Twenty*'}
          </Heading>
          <Body muted>
            Every section sits in the same shell: identical vertical rhythm from
            tokens, semantic colors resolved by the surface scheme, and the only
            horizontal gutter on the site.
          </Body>
          <ProofButtonRow>
            <Button href="/" label="Get started" />
            <Button
              href="https://github.com/twentyhq/twenty"
              label="Star us"
              variant="outlined"
            />
          </ProofButtonRow>
        </ProofStack>
      </SectionShell>
      <SectionShell ariaLabel="Trusted by leading organizations">
        <TrustedBy />
      </SectionShell>
      <SectionShell scheme="dark">
        <ProofStack>
          <Heading size="lg" weight="light">
            {'Dark surfaces invert *semantically*'}
          </Heading>
          <Body muted>
            Same Body component, same muted prop — the ink variables flipped
            because the scheme owns color, not the call site.
          </Body>
        </ProofStack>
      </SectionShell>
    </main>
  );
}
