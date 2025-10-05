import express from 'express';
import morgan from 'morgan';

import apiV1Route from '@routes/router.js';

const NODE_ENV = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const app = express();

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

export default app;
