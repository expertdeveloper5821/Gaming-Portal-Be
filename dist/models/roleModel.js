"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
let roleSchema = new mongoose_1.default.Schema({
    role: [{ type: String, enum: ['admin', 'user', 'spectator'], default: 'user', require: 'false' }]
});
exports.Role = mongoose_1.default.model("Role", roleSchema);
