import { Request, Response, NextFunction } from 'express';

const cors = (req: Request, res: Response, next: NextFunction): void => {
  const origin = req.header('origin');

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST');

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
  }

  next();
};

export default cors;
