import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();

// 1. Create a PostgreSQL connection pool
const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });

// 2. Wrap the pool in the Prisma PostgreSQL adapter
const adapter = new PrismaPg(pool);

// 3. Pass the adapter to the Prisma Client
const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());

app.post('/api/ask-ai', async (req, res) => {
  try {
const aiResponse = await axios.post('http://agent:8000/generate', req.body);
    const tasks = aiResponse.data; 
    const savedTasks = await Promise.all(
      tasks.map((task: any) => 
        prisma.task.create({
          data: { content: task.content, status: 'todo' }
        })
      )
    );

    res.json(savedTasks);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Failed to generate or save tasks" });
  }
});

app.listen(3001, () => {

  console.log("🚀 Orchestrator running on http://localhost:3001");
});