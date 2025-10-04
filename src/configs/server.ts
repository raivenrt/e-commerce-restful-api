import http from 'http';

import env from '@lib/load-env.js';
import app from '@configs/app.js';
import initHttpServer from './init-http-server.js';

const server = http.createServer(app);

initHttpServer(server);
