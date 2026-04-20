import jwt from "jsonwebtoken";
export const generateAccessToken = (data: any) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRETKEY is not defined in environment variables");
  }
  return jwt.sign(data, secret, { expiresIn: "15m" });
};
export const generateRefreshToken = (data: any) => {
  const secret = process.env.REFRESH_SECRET;
  if (!secret) {
    throw new Error("REFRESH_SECRET is not defined in environment variables");
  }
  return jwt.sign(data, secret, { expiresIn: "7d" });
};