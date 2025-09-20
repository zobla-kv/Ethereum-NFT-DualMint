import path from 'path';
import http from 'http';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(process.cwd(), `env/.${process.env.ENV}.env`),
});

const app = express();

// endpoints
import apiRouter from './api/index';

// middlewares
import errorHandler from './middleware/errorHandler/errorHandler';
import cors from './middleware/cors';

// api handlers
app.use('/api', cors, express.json(), apiRouter);

// must be used as a last middleware
app.use(errorHandler);

// serve frontend app
app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('/*splat', (_, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// http server
http.createServer(app).listen(process.env.PORT, () => {
  console.log(`server started on port ${process.env.PORT}`);
});
