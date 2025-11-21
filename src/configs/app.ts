import express from 'express';
import morgan from 'morgan';
import qs from 'qs';

import apiV1Route from '@routes/router.js';
import globalErrorHandler, { e404Handler } from '@base/src/controllers/error-handlers.js';

const NODE_ENV = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const app = express();

app.set(
  'query parser',
  (queryString: string): Record<string, any> => qs.parse(queryString),
);

app.use(express.json({ limit: '2mb' }), express.urlencoded({ limit: '2mb' }));

if (NODE_ENV === 'development') {
  // Development Effect

  app.use(morgan('dev'));
} else {
  // Production Effect

  app.use(morgan('short'));
}

// APIv1 root route
app.use('/api/v1', apiV1Route);

// Catch Errors
app.use(e404Handler); // 404 NOT FONUD
app.use(globalErrorHandler); // Global Error Handler

export default app;
