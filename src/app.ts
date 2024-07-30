import express from "express";

import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Require express
const app = express();

// compressing api response
app.use(compression());

// logger
app.use(morgan("dev"));

app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// cors enable
app.use(
  cors({
    origin: "http://localhost:5173", // Adjust the origin as necessary
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// security configs
app.use(helmet());

//JSON and URL-encoded Parsers
app.use(cookieParser());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use("/api/v1/quiz", campaignQuizRouter);

export default app;
