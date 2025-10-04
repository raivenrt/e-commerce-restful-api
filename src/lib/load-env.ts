import path from 'path';
import dotenv from 'dotenv';

export const envFilesPath = path.join(import.meta.dirname, '..', 'configs');

export default dotenv.config({
  override: true,
  path: path.join(envFilesPath, 'development.env'),
});
