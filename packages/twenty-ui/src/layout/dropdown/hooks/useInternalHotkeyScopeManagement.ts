import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { HotkeyScope } from '../../../utilities/hotkey/types/HotkeyScope';
import { isDeeplyEqual } from '../../../utils/isDeeplyEqual';
import { useDropdownStates } from '../hooks/internal/useDropdownStates';

export const useInternalHotkeyScopeManagement = ({
  dropdownScopeId,
  dropdownHotkeyScopeFromParent,
}: {
  dropdownScopeId: string;
  dropdownHotkeyScopeFromParent?: HotkeyScope;
}) => {
  const { dropdownHotkeyScopeState } = useDropdownStates({ dropdownScopeId });

  const [dropdownHotkeyScope, setDropdownHotkeyScope] = useRecoilState(
    dropdownHotkeyScopeState(),
  );

  useEffect(() => {
    if (!isDeeplyEqual(dropdownHotkeyScopeFromParent, dropdownHotkeyScope)) {
      setDropdownHotkeyScope(dropdownHotkeyScopeFromParent);
    }
  }, [
    dropdownHotkeyScope,
    dropdownHotkeyScopeFromParent,
    setDropdownHotkeyScope,
  ]);
};
