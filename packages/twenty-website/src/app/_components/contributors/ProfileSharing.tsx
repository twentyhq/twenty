'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { IconDownload } from '@tabler/icons-react';

import { CardContainer } from '@/app/_components/contributors/CardContainer';
import Spinner from '@/app/_components/contributors/Spinner';
import { LinkedInIcon, XIcon } from '@/app/_components/ui/icons/SvgIcons';
import { Theme } from '@/app/_components/ui/theme/theme';

const Container = styled(CardContainer)`
  flex-direction: row;
  justify-content: center;
  align-items: baseline;
  gap: 32px;
  padding: 40px 0px;
  @media (min-width: 800px) and (max-width: 855px) {
    padding: 40px 24px;
    gap: 24px;
  }
  @media (max-width: 800px) {
    flex-direction: column;
    align-items: center;
  }
`;

const StyledButton = styled.a`
  display: flex;
  flex-direction: row;
  font-size: ${Theme.font.size.lg};
  font-weight: ${Theme.font.weight.medium};
  padding: 14px 24px;
  color: ${Theme.text.color.primary};
  font-family: var(--font-gabarito);
  background-color: #fafafa;
  border: 2px solid ${Theme.color.gray60};
  border-radius: 12px;
  gap: 12px;
  cursor: pointer;
  text-decoration: none;

  box-shadow:
    -6px 6px 0px 1px #fafafa,
    -6px 6px 0px 3px ${Theme.color.gray60};

  &:hover {
    box-shadow: -6px 6px 0px 1px ${Theme.color.gray60};
  }
`;

interface ProfileProps {
  username: string;
}

export const ProfileSharing = ({ username }: ProfileProps) => {
  const [loading, setLoading] = useState(false);
  const baseUrl = 'https://twenty.com';
  const contributorUrl = `${baseUrl}/contributors/${username}`;

  const handleDownload = async () => {
    setLoading(true);
    const imageSrc = `${baseUrl}/api/contributors/og-image/${username}`;
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `twenty-${username}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading the image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <StyledButton
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${contributorUrl}`}
        target="blank"
      >
        <LinkedInIcon color="black" size="24px" />
        Share on LinkedIn
      </StyledButton>
      <StyledButton onClick={handleDownload}>
        {loading ? (
          <>
            <Spinner /> Downloading
          </>
        ) : (
          <>
            <IconDownload /> Download Image
          </>
        )}
      </StyledButton>
      <StyledButton
        href={`https://www.twitter.com/share?url=${contributorUrl}`}
        target="blank"
      >
        <XIcon color="black" size="24px" /> Share on X
      </StyledButton>
    </Container>
  );
};
