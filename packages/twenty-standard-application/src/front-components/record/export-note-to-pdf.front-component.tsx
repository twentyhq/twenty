import { Action, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const ExportNoteToPdf = () => <Action execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: '980399e9-e530-4430-bf47-7f3f482434b4',
  name: 'Export note to PDF',
  component: ExportNoteToPdf,
  isHeadless: true,
});
