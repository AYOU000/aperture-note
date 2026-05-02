import { prisma } from "../lib/prisma";
import { TaskStatus, Priority } from "@prisma/client"; 

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