import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from '../lib/prisma';
const SALT_ROUNDS = 10;
interface RegisterPrams {
  name:  string
  email: string;
  password: string;
}
const generateJWT = (data: any) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRETKEY is not defined in environment variables");
  }
  return jwt.sign(data, secret, { expiresIn: "7d" });
};
export const Register = async ({
  name,
  email,
  password,
}: RegisterPrams) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { data: "Email already in use", statusCode: 400 };
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword,
    },
  });

  const token = generateJWT({ id: newUser.id, name, email });

  return { data: token, statusCode: 201 }; 
};
 interface loginPrams
 {
  email: string,
  password:string
 }
export const login = async ({ email, password }: loginPrams) => {
const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (!existingUser) {
    return { data: "incorrect email or password", statusCode: 401 };
  }

  const passwordMatch = await bcrypt.compare(password, existingUser.passwordHash);
  if (passwordMatch) {
    const token = generateJWT({ id: existingUser.id, name:existingUser.name, email });
    return { data: token, statusCode: 200 }; 
    };
    return { data: "Incorrect email or password", statusCode: 401 };
  }

//   return { data: "incorrect email or password", statusCode: 400 };
// };
// // export const updateEmailforuser = async ({
// //   Useremail,
// //   Newemail,
// // }: updateEmailforuserPrams) => {
// //   if (!Useremail || !Newemail) {
// //     return { statusCode: 400, data: { message: "Missing email fields" } };
// //   }

// //   const finduser = await userModel.findOne({ email: Useremail });
// //   if (!finduser) {
// //     return { statusCode: 404, data: { message: "Current email not found" } };
// //   }

// //   const checkEmail = await userModel.findOne({ email: Newemail });
// //   if (checkEmail) {
// //     return { statusCode: 409, data: { message: "Email already exists" } };
// //   }

// //   const updated = await userModel.findOneAndUpdate(
// //     { email: Useremail },
// //     { email: Newemail },
// //     { new: true },
// //   );

// //   if (!updated) {
// //     return { statusCode: 500, data: { message: "Failed to update email" } };
// //   }

// //   return {
// //     statusCode: 200,
// //     data: {
// //       message: "Email updated successfully",
// //       token: generateJWT({
// //         firstname: updated.firstname,
// //         lastname: updated.lastname,
// //         email: updated.email,
// //       }),
// //     },
// //   };
// // };
// // export const updatePasswordforuser = async ({
// //   userId,
// //   currentPassword,
// //   newPassword,
// // }: updatePasswordforuserPrams) => {

// //   const finduser = await userModel.findById(userId);  
// //   if (!finduser) {
// //     return { statusCode: 404, data: { message: "User not found" } };
// //   }

// //   const passwordMatch = await bcrypt.compare(currentPassword, finduser.password);
// //   if (!passwordMatch) {                               
// //     return { statusCode: 400, data: { message: "Current password is incorrect" } };
// //   }

// //   const hashedPassword = await bcrypt.hash(newPassword, 10);
// //   finduser.password = hashedPassword;
// //   await finduser.save();

// //   return { statusCode: 200, data: { message: "Password updated successfully" } };
// // };