import { api } from "../utils/apiCall";
import { prisma } from "../lib/prisma";
import { TaskStatus, Priority } from "@prisma/client"; 
import pgvector from 'pgvector';

interface creatProjectparms {
  userId: string;
  title: string;
  description: string;
}

export const creatProject = async ({ userId, title, description }: creatProjectparms) => {
  try {
    const newProject = await prisma.project.create({
      data: { description, title, userId },
    });
    return newProject;
  } catch (error: any) {
    console.error("❌ creatProject error message:", error.message); 
    throw error;
  }
};
interface saveGeneratedRoadmapParms {
  projectId: string;
  tasks: any[];
}

export const saveGeneratedRoadmap = async ({ projectId, tasks }: saveGeneratedRoadmapParms) => {
  try {
    return await prisma.task.createMany({
      data: tasks.map((task) => ({
        title: task.title,
        description: task.description,
        order: task.order,
        projectId: projectId,
        status: (task.status as TaskStatus) ?? TaskStatus.TODO,
        priority: (task.priority as Priority) ?? Priority.MEDIUM,
      })),
    });
  } catch (error) {
    console.error("❌ saveGeneratedRoadmap error:", JSON.stringify(error, null, 2)); 
    throw error;
  }
};
interface embednotePrams
{
  projectId: string;
  note: {
    content: string;
  };
}

export const SaveEmbedNote = async ({projectId,note}:embednotePrams) =>
{
  const content = note.content;
  if(!projectId || !note)
  {
    return { data: { message: "Project ID or note content is not provided"}, statusCode: 400 };
  }
  try
  {
    const response = await api.post("/embed/notes", {
      content: content
    });
    const embeddingVector = response.data.embedding;
    const newNote = await prisma.$queryRaw`
      INSERT INTO "Note" ("id", "content", "projectId", "embedding","createdAt","updatedAt")
      VALUES (
        gen_random_uuid(), 
        ${content}, 
        ${projectId}, 
        ${pgvector.toSql(embeddingVector)}::vector,
        CURRENT_TIMESTAMP,                          
        CURRENT_TIMESTAMP   
      )
      RETURNING *;
    `;
    return newNote;
    }
  catch (error) {
    console.error("❌ EmbedNote error:", JSON.stringify(error, null, 2)); 
    throw error;
  }

}