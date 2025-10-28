import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });
    const token = authHeader.split(" ")[1]; // Bearer <token>
    if (!token) return res.status(401).json({ error: "Token missing" });
    jwt.verify(token, process.env.JWT_SECRET as string);
    next();
  } catch (err: any) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
