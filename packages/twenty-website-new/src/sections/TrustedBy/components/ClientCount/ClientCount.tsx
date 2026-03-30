import { UsersIcon } from '@/icons';
import { theme } from "@/theme";
import { styled } from "@linaria/react";
import { ClientCountShape } from "./ClientCountShape";

const StyledBlock = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing(2)};
  padding-top: ${theme.spacing(1)};
  padding-right: ${theme.spacing(3.75)};
  padding-bottom: ${theme.spacing(1)};
  padding-left: ${theme.spacing(1)};
  border-radius: ${theme.radius(2)};
  position: relative;
  overflow: clip;
  flex-shrink: 0;
`;

const ShapeWrapper = styled.div`
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  height: 48px;
  width: 234px;
  z-index: 0;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: ${theme.colors.primary.text[5]};
  border-radius: ${theme.radius(1)};
  position: relative;
  overflow: clip;
`;

const StyledText = styled.p`
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
        <ClientCountShape strokeColor={theme.colors.highlight[70]} />
      </ShapeWrapper>
      <IconWrapper>
        <UsersIcon size={22} fillColor={theme.colors.highlight[100]} />
      </IconWrapper>
      <StyledText>{label}</StyledText>
    </StyledBlock>
  );
}
