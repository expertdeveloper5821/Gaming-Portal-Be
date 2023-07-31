"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
let userRegisterSchema = new mongoose_1.default.Schema({
    fullName: { type: String, required: true },
    userName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: false },
    provider: { type: String, required: false },
    role: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Role', require: 'false' }]
});
exports.user = mongoose_1.default.model("user", userRegisterSchema);
