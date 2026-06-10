import { styled } from '@linaria/react';

import { color, fontSize, mediaUp, spacing } from '@/tokens';

const ProofMain = styled.main`
  background-color: ${color('neutral')};
  display: grid;
  gap: ${spacing(4)};
  min-height: 100vh;
  min-height: 100dvh;
  padding: ${spacing(12)} ${spacing(4)};

  ${mediaUp('md')} {
    padding: ${spacing(16)} ${spacing(10)};
  }
`;

const ProofTitle = styled.h1`
  color: ${color('blue')};
  font-size: ${fontSize(8)};
  line-height: 1.1;

  ${mediaUp('md')} {
    font-size: ${fontSize(12)};
  }
`;

const ProofBody = styled.p`
  color: ${color('black-60')};
  font-size: ${fontSize(4)};
  max-width: 60ch;
`;

const ProofSwatchRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)};
`;

const ProofSwatch = styled.span`
  border-radius: 4px;
  display: inline-block;
  height: ${spacing(8)};
  width: ${spacing(8)};
`;

export default function ProofPage() {
  return (
    <ProofMain>
      <ProofTitle>Token pipeline proof</ProofTitle>
      <ProofBody>
        This page renders entirely from generated CSS variables: palette tokens
        and derived alpha scales come from one definition file, accessors derive
        the same variable names, and the media query comes from the same
        breakpoint number JS consumers import.
      </ProofBody>
      <ProofSwatchRow>
        <ProofSwatch style={{ backgroundColor: color('blue') }} />
        <ProofSwatch style={{ backgroundColor: color('pink') }} />
        <ProofSwatch style={{ backgroundColor: color('yellow') }} />
        <ProofSwatch style={{ backgroundColor: color('green') }} />
        <ProofSwatch style={{ backgroundColor: color('black-20') }} />
        <ProofSwatch style={{ backgroundColor: color('black-5') }} />
      </ProofSwatchRow>
    </ProofMain>
  );
}
