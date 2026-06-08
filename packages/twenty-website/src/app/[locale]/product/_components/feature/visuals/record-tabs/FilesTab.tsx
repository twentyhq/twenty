'use client';

import { styled } from '@linaria/react';
import {
  IconCalendar,
  IconFileSpreadsheet,
  IconFileText,
  IconPhoto,
} from '@tabler/icons-react';

import { BG_DARK, CARD_TEXT, TEXT_LIGHT } from '../visual-tokens';

const FILE_TYPES = {
  pdf: { icon: IconFileText, color: '#5571f1' },
  sheet: { icon: IconFileSpreadsheet, color: '#3aab7c' },
  doc: { icon: IconFileText, color: '#5571f1' },
  image: { icon: IconPhoto, color: '#ecc94b' },
};

const Wrap = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const Head = styled.div`
  align-items: baseline;
  display: flex;
  flex-shrink: 0;
  gap: 6px;
  padding: 14px 16px 12px;
`;

const HeadTitle = styled.span`
  color: ${CARD_TEXT};
  font-size: 13px;
  font-weight: 600;
`;

const HeadCount = styled.span`
  color: ${TEXT_LIGHT};
  font-size: 13px;
`;

const List = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding: 0 8px;
`;

const Row = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  height: 44px;
  padding: 0 8px;
`;

const Left = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: 12px;
  min-width: 0;
`;

const FileIconBox = styled.span<{ $bg: string }>`
  align-items: center;
  background: ${({ $bg }) => $bg};
  border-radius: 4px;
  color: ${BG_DARK};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: 4px;

  svg {
    height: 13px;
    width: 13px;
  }
`;

const FileName = styled.span`
  color: ${CARD_TEXT};
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Right = styled.span`
  align-items: center;
  color: ${TEXT_LIGHT};
  display: flex;
  flex-shrink: 0;
  font-size: 11px;
  gap: 4px;

  svg {
    height: 13px;
    width: 13px;
  }
`;

const FILES: {
  name: string;
  type: keyof typeof FILE_TYPES;
  date: string;
}[] = [
  { name: 'NDA - Anthropic.pdf', type: 'pdf', date: 'Jul 1' },
  { name: 'Pricing Q4.xlsx', type: 'sheet', date: 'Jul 12' },
  { name: 'Onboarding deck.pdf', type: 'pdf', date: 'Jul 18' },
  { name: 'Brand assets.png', type: 'image', date: 'Jul 20' },
  { name: 'Security review.docx', type: 'doc', date: 'Jul 24' },
];

export function FilesTab() {
  return (
    <Wrap>
      <Head>
        <HeadTitle>All</HeadTitle>
        <HeadCount>{FILES.length}</HeadCount>
      </Head>
      <List>
        {FILES.map((file) => {
          const { icon: Icon, color } = FILE_TYPES[file.type];
          return (
            <Row key={file.name}>
              <Left>
                <FileIconBox $bg={color}>
                  <Icon />
                </FileIconBox>
                <FileName>{file.name}</FileName>
              </Left>
              <Right>
                <IconCalendar />
                {file.date}
              </Right>
            </Row>
          );
        })}
      </List>
    </Wrap>
  );
}
