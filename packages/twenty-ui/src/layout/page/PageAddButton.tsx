import { IconPlus } from 'src/display';
import { IconButton } from 'src/input';

type PageAddButtonProps = {
  onClick: () => void;
};

export const PageAddButton = ({ onClick }: PageAddButtonProps) => (
  <IconButton
    Icon={IconPlus}
    dataTestId="add-button"
    size="medium"
    variant="secondary"
    accent="default"
    onClick={onClick}
    ariaLabel="Add"
  />
);
