import { Cocobase } from "cocobase";

console.log("COCOBASE ENV:", {
  apiKeyPresent: !!import.meta.env.VITE_COCOBASE_API_KEY,
  projectId: import.meta.env.VITE_COCOBASE_PROJECT_ID,
});

const db = new Cocobase({
  apiKey: import.meta.env.VITE_COCOBASE_API_KEY,
  projectId: import.meta.env.VITE_COCOBASE_PROJECT_ID,
});

export default db;
