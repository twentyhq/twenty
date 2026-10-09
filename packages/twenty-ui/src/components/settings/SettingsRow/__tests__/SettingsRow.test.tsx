import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { SettingsRow } from '../SettingsRow';

runComponentConformance({
  name: 'SettingsRow',
  element: <SettingsRow>Notifications</SettingsRow>,
  refInstanceOf: HTMLLabelElement,
  skip: ['renderProp'],
});
