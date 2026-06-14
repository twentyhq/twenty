import { styled } from '@linaria/react';
import { PreviewLoader } from './PreviewLoader';

const StyledPagePreviewLoader = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  min-height: 100%;
  min-width: 0;
  padding: 24px;
  width: 100%;
`;

type PagePreviewLoaderProps = {
  ariaLabel: string;
};

export function PagePreviewLoader({ ariaLabel }: PagePreviewLoaderProps) {
  return (
    <StyledPagePreviewLoader aria-label={ariaLabel}>
      <PreviewLoader />
    </StyledPagePreviewLoader>
  );
}
