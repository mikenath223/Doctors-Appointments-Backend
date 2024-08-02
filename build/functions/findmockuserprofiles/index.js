"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = __importStar(require("@google-cloud/functions-framework"));
const cors_1 = __importDefault(require("cors"));
const firebase_1 = require("../../firebase");
const build_query_1 = require("../../helper/build-query");
const user_interface_1 = require("../../interfaces/user.interface");
const corsHandler = (0, cors_1.default)({ origin: true });
functions.http("findManyMockUserProfiles", async (req, res) => {
    corsHandler(req, res, async () => {
        const { userId, limit, offset } = req.body;
        const options = { limit, offset };
        try {
            let query = firebase_1.firestore
                .collection("users")
                .where("role", "==", user_interface_1.USER_TYPE.mockProfile);
            query = (0, build_query_1.buildFirestoreQuery)(query, options);
            const userDependentsSnapshot = await firebase_1.firestore
                .collection("user-dependents")
                .where("userId", "==", userId)
                .get();
            const userDependents = userDependentsSnapshot.docs.map((doc) => doc.data());
            const userDependentIds = new Set(userDependents.map((user) => user.id));
            const mockUsersProfileSnapshot = await query.get();
            const mockUsersProfiles = await Promise.all(mockUsersProfileSnapshot.docs.map(async (doc) => {
                const mockUserData = doc.data();
                const isUserDependentAdded = userDependentIds.has(mockUserData.id);
                return {
                    ...mockUserData,
                    isUserDependentAdded,
                };
            }));
            res.status(200).json(mockUsersProfiles);
        }
        catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");
        }
    });
});
