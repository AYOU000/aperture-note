import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import {generateRefreshToken,generateAccessToken} from "../utils/tokenUtils"
import jwt from "jsonwebtoken";
const SALT_ROUNDS = 10;
interface RegisterPrams {
  name: string;
  email: string;
  password: string;
}
export const Register = async ({ name, email, password }: RegisterPrams) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { data: "Email already in use", statusCode: 400 };
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hashedPassword,
    },
  });
  const accessToken = generateAccessToken({ id: newUser.id });
  const tokenString = generateRefreshToken({ id: newUser.id });
 await prisma.refreshToken.create({
    data: {
      token: tokenString,
      userId: newUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  return {
    data: {
      accessToken,
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
    },
    refreshToken: tokenString,
    statusCode: 201,
  };
};
interface loginPrams {
  email: string;
  password: string;
}
export const login = async ({ email, password }: loginPrams) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (!existingUser) {
    return { data: "incorrect email or password", statusCode: 401 };
  }

  const passwordMatch = await bcrypt.compare(
    password,
    existingUser.passwordHash,
  );
  if (passwordMatch) {
    const accessToken = generateAccessToken({
      id: existingUser.id,
    });
    const tokenString = generateRefreshToken({
      id: existingUser.id,
    });
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        refreshToken: {
          create: {
            token: tokenString,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
    });
    return {
      data: {
        accessToken,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
        },
      },
      refreshToken: tokenString,
      statusCode: 200,
    };
  }
  return { data: "Incorrect email or password", statusCode: 401 };
};

export const logoutUser = async (token: string) => {

  await prisma.refreshToken.updateMany({
    where: { 
      token: token 
    },
    data: { 
      revoked: true 
    },
  });
};
export const refreshAccessToken = async (tokenString: string) => {
  let decoded: { id: string };
  try {
    decoded = jwt.verify(tokenString, process.env.REFRESH_SECRET!) as { id: string };
  } catch (err) {
    throw new Error("Invalid refresh token");
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: tokenString },
  });

  if (!storedToken || storedToken.revoked) {
    throw new Error("Token revoked");
  }

  if (storedToken.expiresAt < new Date()) {

    await prisma.refreshToken.delete({ where: { token: tokenString } }).catch(() => {});
    throw new Error("Token expired");
  }

  const accessToken = generateAccessToken({ id: decoded.id });
  
  return { accessToken };
};
