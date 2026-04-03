import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: "Vetter API Online", 
    system: "TypeScript + Node.js",
    model: "Gemini 1.5 Flash"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend zooming on http://localhost:${PORT}`);
});
