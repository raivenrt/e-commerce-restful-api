import path from 'path';
import fs from 'fs';

export default async function deleteFile(filePath: string) {
  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);

    fs.unlink(filePath, (err) => false);

    return true;
  } catch (err: any) {
    if (err.code && err.code !== 'ENOENT') return false;
  }
}
