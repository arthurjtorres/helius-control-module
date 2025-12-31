import express, { NextFunction, Request, Response } from "express";
import cors from 'cors';
import router from "./routes";
import "dotenv/config";

const app = express();

// 1. O CORS DEVE VIR PRIMEIRO DE TUDO
app.use(cors({
  origin: 'http://localhost:1100',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth-User', 'X-Auth-Pass', 'Accept'],
  credentials: true,
}));

app.use(express.json());

app.use(router);
app.get('/', (req, res) => res.status(200).send('Rodando controle aqui!'));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  return res.status(500).json({ message: err.message});
  //next();
})

export default app;