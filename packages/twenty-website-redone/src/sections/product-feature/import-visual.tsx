import { styled } from '@linaria/react';

import { PRODUCT_FEATURE_PALETTE } from '@/tokens/feature-scenes/product-feature-palette';

const palette = PRODUCT_FEATURE_PALETTE;

const Root = styled.div`
  background-color: ${palette.background};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: ${palette.font};
  height: 100%;
  overflow: hidden;
  padding: 16px;
  width: 100%;
`;

const DropZone = styled.div`
  align-items: center;
  border: 1.5px dashed ${palette.borderStrong};
  border-radius: 4px;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  position: relative;
`;

const Headline = styled.span`
  color: ${palette.textPrimary};
  font-size: 13px;
  font-weight: 500;
  padding: 16px;
  text-align: center;
`;

const Buttons = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  max-width: 200px;
  width: 100%;

  & > * + * {
    margin-top: 8px;
  }
`;

const PrimaryButton = styled.span`
  align-items: center;
  background-color: ${palette.textPrimary};
  border-radius: 8px;
  box-shadow: ${palette.shadow.light};
  box-sizing: border-box;
  color: ${palette.background};
  display: flex;
  font-size: 13px;
  font-weight: 600;
  justify-content: center;
  padding: 7px 12px;
  width: 100%;
`;

const SecondaryButton = styled.span`
  align-items: center;
  background-color: ${palette.background};
  border: 1px solid ${palette.border};
  border-radius: 8px;
  box-sizing: border-box;
  color: ${palette.textPrimary};
  display: flex;
  font-size: 13px;
  font-weight: 600;
  justify-content: center;
  padding: 7px 12px;
  width: 100%;
`;

const FooterNote = styled.span`
  bottom: 16px;
  color: ${palette.textTertiary};
  font-size: 11px;
  left: 50%;
  padding: 0 16px;
  position: absolute;
  text-align: center;
  transform: translateX(-50%);
  width: 100%;
`;

// The product's spreadsheet-import upload step. The previous redone visual for
// this tile was wrong — it rendered a permissions table, not the upload flow.
export function ImportVisual() {
  return (
    <Root>
      <DropZone>
        <Headline>Upload .xlsx, .xls or .csv file</Headline>
        <Buttons>
          <PrimaryButton>Select file</PrimaryButton>
          <SecondaryButton>Download sample</SecondaryButton>
        </Buttons>
        <FooterNote>
          Max import capacity: 100,000 records. Otherwise, consider splitting
          your file or using the API.
        </FooterNote>
      </DropZone>
    </Root>
  );
}
