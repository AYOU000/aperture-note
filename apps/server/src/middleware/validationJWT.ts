import { prisma } from "../lib/prisma";
import { extendRequest } from "../types/extendRequest";
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const validateJWT = (req: extendRequest, res: Response, next: NextFunction) => {
  const authorizationheader = req.get("authorization");

  if (!authorizationheader) {
    return res
      .status(403)
      .json({ message: "Authorization header was not provided" });
  }

  const token = authorizationheader.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Bearer token not found" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "",
    async (err: any, payload: any) => {
      if (err?.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "Access token expired",
          code: "TOKEN_EXPIRED",
        });
      }

      if (err) {
        res.status(403).json({ message: "Invalid token" });
        return;
      }

      if (!payload) {
        res.status(403).json({ message: "Invalid token payload" });
        return;
      }

      const payloadUser = payload as { id: string };

      try {
        const user = await prisma.user.findUnique({
          where: { id: payloadUser.id },
        });

        if (!user) {
          return res.status(403).json({ message: "User not found" });
        }

        req.user = user.id;
        next();
      } catch (dbError) {
        return res
          .status(500)
          .json({ message: "Internal server error during validation" });
      }
    },
  );
};

export default validateJWT;
