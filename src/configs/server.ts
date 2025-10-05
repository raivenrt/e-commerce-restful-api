import http from 'http';

import env from '@lib/load-env.js';
import app from '@configs/app.js';
import initHttpServer from './init-http-server.js';

const server = http.createServer(app);

initHttpServer(server);

// Catch Unhandled Rejections
process.on('unhandledRejection', (err) => {
  console.log(`Unhandled Rejection Error: ${err}`);

  server.close(() => {
    console.log('Server is down...');
    process.exit(1);
  });
});
