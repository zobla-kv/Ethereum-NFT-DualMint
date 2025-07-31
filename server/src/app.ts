// app
import http from 'http';
import express from 'express';
import rateLimit from 'express-rate-limit';

const app = express();

// cors
import cors from './middleware/cors';

// endpoints
import apiRouter from './api/index';

// rate limiter
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 10,
  message: {
    status: 429,
    error: 'Too many requests',
    message:
      'You have reached the maximum number of images today. Please try again after 24 hours.',
  },
});

// api handlers
app.use('/api', cors, limiter, apiRouter);

const SERVER_PORT = 4600;

// http server
http.createServer(app).listen(SERVER_PORT, () => {
  console.log(`server started on port ${SERVER_PORT}`);
});
