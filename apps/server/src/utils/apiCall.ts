import axios from "axios";

export const api = axios.create({
  baseURL: `${process.env.PYTHON_AGENT_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});
