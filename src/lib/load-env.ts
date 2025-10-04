import path from 'path';

import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

export const envFilesPath = path.join(import.meta.dirname, '..', 'configs');

export const unparsedEnv = dotenv.config({
  override: true,
  path: path.join(envFilesPath, 'development.env'),
});

export default dotenvExpand.expand(unparsedEnv).parsed;
