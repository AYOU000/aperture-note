import express from "express";
import corsMiddleware from "cors";
import morgan from "morgan";
import * as dotenv from "dotenv";
import authController from "./controllers/authController";
import { prisma } from "./lib/prisma";
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();
//  Type-safe CORS origin filtering
const corsOrigins = [
  process.env.CLIENT_URL,
  process.env.PYTHON_AGENT_URL,
].filter((origin): origin is string => Boolean(origin));

app.use(
  corsMiddleware({
    origin: corsOrigins.length > 0 ? corsOrigins : true, // Fallback to allow all if no origins set
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
export const connectDB = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connected successfully via PrismaPg adapter.");
  } catch (error) {
    console.error("❌ Database connection failed!");
    console.error(error);
    process.exit(1);
  }
};
// Health check endpoint for Docker/load balancers
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/auth", authController);

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("❌ Error caught by Orchestrator:", err.message);

    const status = err.status || 500;
    res.status(status).json({
      success: false,
      message: err.message || "Internal Server Error",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  },
);

const bootstrap = async () => {
  try {
    await connectDB();

    app.listen(3001, () => {
      console.log("🚀 Orchestrator running on http://localhost:3001");
    });
  } catch (error) {
    console.error("FAILED TO START SERVER:", error);
    process.exit(1);
  }
};

bootstrap();

// app.post('/api/ask-ai', async (req, res) => {
//   try {
// const aiResponse = await axios.post('http://agent:8000/generate', req.body);
//     const tasks = aiResponse.data;
//     const savedTasks = await Promise.all(
//       tasks.map((task: any) =>
//         prisma.task.create({
//           data: { content: task.content, status: 'todo' }
//         })
//       )
//     );

//     res.json(savedTasks);
//   } catch (error) {
//     console.error("Server Error:", error);
//     res.status(500).json({ error: "Failed to generate or save tasks" });
//   }
// });
