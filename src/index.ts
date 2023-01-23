import express from "express";
import cookieParser from "cookie-parser";
import { userRouter } from "./routes/userRoutes";
import { noteRouter } from "./routes/noteRoutes";
import { config } from "dotenv"
import cors from "cors";
import "./config/dbConnect";
config()

const port = process.env.PORT || 5000;
const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true, }));

//Middlewares
app.use(express.json());
app.use(cookieParser());

//Routes
app.use("/api/notes", noteRouter);
app.use("/api/users", userRouter);
app.get("/", (req, res) => res.status(200).json({ message: "Server is running and up!" }));

app.listen(port, () => console.log("server is running at port " + port));
