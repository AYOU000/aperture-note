import validateJWT from "../middleware/validationJWT";
import { ask_ai } from "../services/pythonClient";
import { extendRequest } from "../types/extendRequest";
import express from "express";


const router = express.Router();

router.post("/",validateJWT,async (req:extendRequest, res) => { 
try{
  const userId = req?.user;
  const {userPrompt} = req.body;
  const response = await ask_ai({userId,userPrompt});
  res.status(response.statusCode).send(response.data);
 }
 catch(err)
 {
  console.error("Error to send  prompt  to llm:", err);
  res.status(500).send({ error: "Internal server error" });
 }
})

export default  router;