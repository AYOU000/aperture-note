import express from "express";
import { authLimiter } from "../middleware/rateLimit";
import { validate } from "../middleware/validate";
import { LoginSchema, RegisterSchema } from "../schemas/authSchema";
import { login, Register } from "../services/authService";

const router = express.Router(); 

router.post(
  "/register",
  authLimiter,
  validate(RegisterSchema), 
  async (request, response) => { 
    try {
      // request.body is already validated and cleaned by the middleware!
      const { statusCode, data } = await Register(request.body);
      return response.status(statusCode).json(data);
    } catch (err) {
      console.error("Error registering user:", err);
      return response.status(500).json({ error: "Internal server error" });
    }
  }
);
router.post(
  "/login",
  authLimiter,
  validate(LoginSchema), 
  async (request, response) => { 
    try {
      const { statusCode, data } = await login(request.body);
      return response.status(statusCode).json(data);
    } catch (err) {
      console.error("Error registering user:", err);
      return response.status(500).json({ error: "Internal server error" });
    }
  }
);


export default router;