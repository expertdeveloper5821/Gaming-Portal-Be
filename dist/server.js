"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors = require('cors');
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use(body_parser_1.default.json());
app.use(cors());
// Connect to MongoDB
mongoose_1.default
    .connect("mongodb://localhost:27017/mydatabase", {})
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("MongoDB connection error:", error));
// Routes
app.get("/", (req, res) => {
    res.send("Hello, world!");
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
