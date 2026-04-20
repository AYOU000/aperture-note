import express from 'express';

import * as dotenv from 'dotenv';
import authController from './controllers/authController';
import { prisma } from './lib/prisma';

dotenv.config();
const app = express();
app.use(express.json());

export const connectDB = async () => {
  try {
    // Attempt the "Heartbeat" check
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connected successfully via PrismaPg adapter.");
  } catch (error) {
    console.error("❌ Database connection failed!");
    console.error(error);
    // Exit the process so the server doesn't run in a broken state
    process.exit(1); 
  }
};

app.use("/auth",authController)

const bootstrap = async () => {
  try {
    // This MUST be awaited
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


