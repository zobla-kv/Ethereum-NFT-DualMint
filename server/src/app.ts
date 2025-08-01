// app
import http from 'http';
import express from 'express';

const app = express();
const SERVER_PORT = 4600;

// cors
import cors from './middleware/cors';

// endpoints
import apiRouter from './api/index';

// api handlers
app.use('/api', cors, apiRouter);

// http server
http.createServer(app).listen(SERVER_PORT, () => {
  console.log(`server started on port ${SERVER_PORT}`);
});
