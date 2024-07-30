import app from "./app";
import * as http from "http";
import dotenv from "dotenv";
dotenv.config();

const server = http.createServer(app);

server.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
