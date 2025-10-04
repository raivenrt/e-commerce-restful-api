import express from 'express';
import morgan from 'morgan';

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

app.get('/hello', (req, res) => {
  res.send({
    welcome: 'You are welcome!',
    at: Intl.DateTimeFormat(req.acceptsLanguages(), {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(Date.now()),
  });
});

export default app;
