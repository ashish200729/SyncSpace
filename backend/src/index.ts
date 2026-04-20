import cors from "cors";
import express from "express";
import helmet from "helmet";
import rootRouter from "./routes/index.js";

const app = express();
const port = process.env.PORT ?? 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/", rootRouter);

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});