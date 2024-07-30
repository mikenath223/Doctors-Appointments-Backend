"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
// Require express
const app = (0, express_1.default)();
// compressing api response
app.use((0, compression_1.default)());
// logger
app.use((0, morgan_1.default)("dev"));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Origin", "*");
    next();
});
// cors enable
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // Adjust the origin as necessary
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
}));
// security configs
app.use((0, helmet_1.default)());
//JSON and URL-encoded Parsers
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// app.use("/api/v1/quiz", campaignQuizRouter);
exports.default = app;
