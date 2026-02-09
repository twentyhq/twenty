import fs from 'fs-extra';
import { BACKUP_PATH, PKG_PATH } from './constants';

const main = async () => {
  if (await fs.pathExists(BACKUP_PATH)) {
    const original = await fs.readJson(BACKUP_PATH);
    await fs.remove(PKG_PATH);
    await fs.writeJson(PKG_PATH, original, { spaces: 2 });
    await fs.remove(BACKUP_PATH);
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
