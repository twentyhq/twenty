import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, 'responseTime.json');

export const readPreviousResponseTime = (): number | null => {
  if (fs.existsSync(filePath)) {
    const testName = expect.getState().currentTestName;
    const data = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(data);

    if (!testName) {
      return null;
    }

    return parsed[testName] || null;
  }

  return null;
};

export const storeResponseTime = (responseTime: number): void => {
  const testName = expect.getState().currentTestName;
  let data = {};

  if (!testName) {
    return;
  }

  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  data[testName] = responseTime;
  fs.writeFileSync(filePath, JSON.stringify(data), 'utf-8');
};
