import { theme } from '@/theme';
import { styled } from '@linaria/react';
import NextImage from 'next/image';

const StyledBlock = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing(2)};
  height: 48px;
  padding: ${theme.spacing(1)} ${theme.spacing(3.75)} ${theme.spacing(1)}
    ${theme.spacing(1)};
  position: relative;
  overflow: clip;
  flex-shrink: 0;
  width: 157px;
`;

const ShapeWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: ${theme.colors.primary.text[5]};
  border-radius: 2px;
  position: relative;
  overflow: clip;
  z-index: 1;
`;

const StyledText = styled.p`
  font-family: ${theme.font.family.sans};
  font-weight: ${theme.font.weight.medium};
  font-size: ${theme.font.size(4)};
  line-height: ${theme.lineHeight(5.5)};
  color: ${theme.colors.primary.text[100]};
  white-space: nowrap;
  position: relative;
  z-index: 1;
`;

type ClientCountProps = {
  label: string;
};

export function ClientCount({ label }: ClientCountProps) {
  return (
    <StyledBlock>
      <ShapeWrapper>
        <NextImage
          alt=""
          fill
          sizes="157px"
          src="/images/home/logo-bar/others-shape.svg"
          unoptimized
          style={{ objectFit: 'fill' }}
        />
      </ShapeWrapper>
      <IconWrapper>
        <NextImage
          alt=""
          height={21}
          src="/images/home/logo-bar/others-icon.svg"
          unoptimized
          width={22}
        />
      </IconWrapper>
      <StyledText>{label}</StyledText>
    </StyledBlock>
  );
}
