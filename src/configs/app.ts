import express from 'express';
import morgan from 'morgan';
import qs from 'qs';
import cookieParser from 'cookie-parser';

import apiV1Route from '@routes/router.js';
import globalErrorHandler, { e404Handler } from '@base/src/controllers/error-handlers.js';
import { SERV } from './config.js';

const NODE_ENV = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const app = express();

app.set(
  'query parser',
  (queryString: string): Record<string, any> => qs.parse(queryString),
);

app.use(
  express.json({ limit: '2mb' }),
  express.urlencoded({ limit: '2mb' }),
  cookieParser(),
);

if (NODE_ENV === 'development') {
  // Development Effect

  app.use(morgan('dev'));
} else {
  // Production Effect

  app.use(morgan('short'));
}
/**
 * Serving Static Files
 * When the user requests a specific image, it will be sent and the request will be
 * terminated, and no other item in the Middleware Stack will be accessed
 *
 * if you want to use morgan middleware before serving static files
 * must be before app.use('/api/v1', apiV1Route);
 */
for (const { path, root } of SERV) app.use(path, express.static(root));

// APIv1 root route
app.use('/api/v1', apiV1Route);

// Catch Errors
app.use(e404Handler); // 404 NOT FONUD
app.use(globalErrorHandler); // Global Error Handler

export default app;
