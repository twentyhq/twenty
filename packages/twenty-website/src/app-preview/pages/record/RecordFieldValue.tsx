import { styled } from '@linaria/react';
import { THEME_LIGHT } from 'twenty-ui/theme';
import {
  IconBrandLinkedin,
  IconBrandX,
  IconCheck,
  IconCurrencyDollar,
  IconLink,
  IconMapPin,
  IconUser,
} from '@tabler/icons-react';

import { PersonAvatar } from '../../primitives/PersonAvatar';
import { PreviewRoundedLink } from '../../primitives/PreviewRoundedLink';
import { PreviewTag } from '../../primitives/PreviewTag';
import { type RecordField } from '../../types';

const FieldValueSlot = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  min-height: 24px;
  min-width: 0;
`;

const FieldValue = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-family: ${THEME_LIGHT.font.family};
  font-size: 13px;
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FieldValuePerson = styled.span`
  align-items: center;
  color: ${THEME_LIGHT.font.color.primary};
  display: flex;
  font-family: ${THEME_LIGHT.font.family};
  font-size: 13px;
  gap: 4px;
  line-height: 1.4;
  min-width: 0;
`;

const FieldValuePersonName = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

function FieldIconGlyph({ iconName }: { iconName: string }) {
  const stroke = THEME_LIGHT.icon.stroke.sm;
  switch (iconName) {
    case 'link':
      return <IconLink aria-hidden size={16} stroke={stroke} />;
    case 'user':
      return <IconUser aria-hidden size={16} stroke={stroke} />;
    case 'mapPin':
      return <IconMapPin aria-hidden size={16} stroke={stroke} />;
    case 'check':
      return <IconCheck aria-hidden size={16} stroke={stroke} />;
    case 'currency':
      return <IconCurrencyDollar aria-hidden size={16} stroke={stroke} />;
    case 'linkedin':
      return <IconBrandLinkedin aria-hidden size={16} stroke={stroke} />;
    case 'twitter':
      return <IconBrandX aria-hidden size={16} stroke={stroke} />;
    default:
      return null;
  }
}

function FieldValueRenderer({ field }: { field: RecordField }) {
  switch (field.value.type) {
    case 'text':
      return (
        <FieldValueSlot>
          <FieldValue>{field.value.value}</FieldValue>
        </FieldValueSlot>
      );
    case 'boolean':
      return (
        <FieldValueSlot>
          <FieldValue>{field.value.value ? 'True' : 'False'}</FieldValue>
        </FieldValueSlot>
      );
    case 'currency':
      return (
        <FieldValueSlot>
          <FieldValue>{field.value.value}</FieldValue>
        </FieldValueSlot>
      );
    case 'link':
      return (
        <FieldValueSlot>
          <PreviewRoundedLink label={field.value.label ?? field.value.value} />
        </FieldValueSlot>
      );
    case 'person':
      return (
        <FieldValueSlot>
          <FieldValuePerson>
            <PersonAvatar person={field.value} size={16} />
            <FieldValuePersonName>{field.value.name}</FieldValuePersonName>
          </FieldValuePerson>
        </FieldValueSlot>
      );
    case 'select':
      return (
        <FieldValueSlot>
          <PreviewTag color={field.value.color} label={field.value.value} />
        </FieldValueSlot>
      );
    default:
      return null;
  }
}

export const recordFieldValue = { FieldIconGlyph, FieldValueRenderer };
