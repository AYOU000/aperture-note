import express from "express";
import { authLimiter } from "../middleware/rateLimit";
import { validate } from "../middleware/validate";
import { LoginSchema, RegisterSchema } from "../schemas/authSchema";
import { login, logoutUser, refreshAccessToken, Register } from "../services/authService";

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  validate(RegisterSchema),
  async (request, response) => {
    try {
      const { statusCode, data, refreshToken } = await Register(request.body);
      if (refreshToken) {
        response.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/auth",
        });
      }
      return response.status(statusCode).json(data);
    } catch (err) {
      console.error("Error registering user:", err);
      return response.status(500).json({ error: "Internal server error" });
    }
  },
);
router.post(
  "/login",
  authLimiter,
  validate(LoginSchema),
  async (request, response) => {
    try {
      const { statusCode, data, refreshToken } = await login(request.body);
      if (statusCode === 200 && refreshToken) {
        response.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/auth",
        });
      }

      return response.status(statusCode).json(data);
    } catch (err) {
      console.error("Error registering user:", err);
      return response.status(500).json({ error: "Internal server error" });
    }
  },
);
router.post("/logout", async (request, response) => {
  try {
    const token = request.cookies.refreshToken;

    if (token) {
      await logoutUser(token);
    }
    response.clearCookie("refreshToken", {
      path: "/auth",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return response.status(500).json({ error: "Internal server error" });
  }
});
router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token provided" });
  }

  try {
    const { accessToken } = await refreshAccessToken(refreshToken);
    
    return res.status(200).json({ accessToken });
  } catch (error: any) {
    console.error("Refresh error:", error.message);    
    res.clearCookie("refreshToken", { path: "/auth" });
    return res.status(401).json({ error: "Session expired. Please log in again." });
  }
});
export default router;
