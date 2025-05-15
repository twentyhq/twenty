import { RAW } from './ts-errors';

const tmp = RAW;
const buffer = tmp.split('\n');

type Occurence = { position: string; rule: string };

type ReportRecord = Record<string, Occurence[]>;

const reportRecord: ReportRecord = {};

const filePathstart = ['src/', 'test/'];

buffer.forEach((line) => {
  if (filePathstart.some((basePath) => line.startsWith(basePath))) {
    const splitedLine = line.split(' - error');
    const filePath = splitedLine[0];
    const file = filePath.split(':')[0];
    const position = filePath.split('.ts:').pop();
    const error = splitedLine[1].split(':')[0];

    if (!position) {
      throw new Error('Position is not defined');
    }

    const occurrence = { position, rule: error };
    const alreadyExist = reportRecord[file];

    if (alreadyExist) {
      reportRecord[file].push(occurrence);

      return;
    }

    reportRecord[file] = [occurrence];
  }
});

console.log(reportRecord);

const total = Object.entries(reportRecord).reduce((acc, [_, occurrences]) => {
  return acc + occurrences.length;
}, 0);

console.log(total);
