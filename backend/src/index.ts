import cors from "cors";
import express from "express";
import helmet from "helmet";
import prisma from "./config/prisma.js";
import rootRouter from "./routes/index.js";

const app = express();
const port = process.env.PORT ?? 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/", rootRouter);

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("Database connection established");

    app.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to database");
    console.error(error);
    process.exit(1);
  }
};

void startServer();