import http from 'http';

import env from '@lib/load-env.js';
import app from '@configs/app.js';

const server = http.createServer(app);

const { HOST, PORT } = process.env;
server.listen(+PORT!, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
