import http from 'http';
import express from 'express';

const app = express();
const SERVER_PORT = 4600;

// endpoints
import apiRouter from './api/index';

// middlewares
import errorHandler from './middleware/errorHandler';
import cors from './middleware/cors';

// api handlers
app.use('/api', cors, express.json(), apiRouter);

// must be used as a last middleware
app.use(errorHandler);

// http server
http.createServer(app).listen(SERVER_PORT, () => {
  console.log(`server started on port ${SERVER_PORT}`);
});
