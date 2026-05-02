import { api } from "../utils/apiCall";
import { creatProject, SaveEmbedNote, saveGeneratedRoadmap } from "./projectServices";

export const checkAgentStatus = async () => {
  try {
    const response = await api.get("/health", { timeout: 3000 });
    console.log("🤖 AI Agent Status:", response.data.status);
    return true;
  } catch (error) {
    console.error("⚠️ AI Agent is DOWN or unreachable.");
    return false;
  }
};
interface ask_ai_parms {
  userId: string;
  userPrompt: string;
}
export const ask_ai = async ({ userId, userPrompt }: ask_ai_parms) => {
  if (!userId || !userPrompt.trim()) {
    return { data: { message: "Please enter your goal" }, statusCode: 400 };
  }
  try {
    const response = await api.post("/ai/generate", {
      userid: userId,
      prompt: userPrompt,
    });
    const projectData = response.data;
    const project = await creatProject({
      userId: userId,
      title: projectData.project.main_goal,
      description: projectData.project.summary,
    });
    await saveGeneratedRoadmap({
     projectId: project.id ,
     tasks: projectData.project.tasks
     })
     await SaveEmbedNote({
      projectId: project.id ,
      note: projectData.note
     }) 
    return {
      data: project,
      statusCode: response.status,
    };
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || "failed to generate";

    return {
      data: { message },
      statusCode: status,
    };
  }
};
