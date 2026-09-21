import { DEFAULT_SETTING_PAGE_POSITION } from '@/application/constants/DefaultSettingPagePosition';

type SortableSettingPage = {
  universalIdentifier: string;
  position?: number | null;
};

export const sortSettingPages = <TSettingPage extends SortableSettingPage>(
  settingPages: TSettingPage[],
): TSettingPage[] =>
  [...settingPages].sort((firstPage, secondPage) => {
    const firstPosition = firstPage.position ?? DEFAULT_SETTING_PAGE_POSITION;
    const secondPosition = secondPage.position ?? DEFAULT_SETTING_PAGE_POSITION;

    if (firstPosition !== secondPosition) {
      return firstPosition - secondPosition;
    }

    return firstPage.universalIdentifier.localeCompare(
      secondPage.universalIdentifier,
    );
  });
