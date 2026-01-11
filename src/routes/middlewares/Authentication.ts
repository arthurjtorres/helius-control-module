import  jwt, { SignOptions }  from "jsonwebtoken";
import 'dotenv/config';
import { NextFunction, Request, Response } from "express";
import Resp from "../../utils/Response";

const secret = process.env.JWT_SECRET as string

interface JwtPayload {
  userId: string;
  userName: string;
  email: string;
  userType: string;
  fkClearanceId: string;
}

const sign = (payload: JwtPayload) => {
  const jwtConfig: SignOptions = {
    algorithm: 'HS256',
    expiresIn: '25m',
  }
  return jwt.sign(payload, secret, jwtConfig);
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if(!token) {
      return Resp.unauthorized('Token não fornecido');
    }
    const decoded = jwt.verify(token, secret) as JwtPayload;
    res.locals.user = decoded
    next();
  } catch (error) {
    return Resp.unauthorized('Token inválido');
  }
}

export { sign, verifyToken};