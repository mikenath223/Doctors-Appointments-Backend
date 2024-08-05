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
const firebase_1 = require("../../firebase");
const firestore_1 = require("@google-cloud/firestore");
const cors_1 = __importDefault(require("cors"));
const user_interface_1 = require("../../interfaces/user.interface");
const corsHandler = (0, cors_1.default)({ origin: true });
functions.http("addUserDependent", async (req, res) => {
    corsHandler(req, res, async () => {
        const { userId, userDependentId } = req.body;
        if (!userId || !userDependentId) {
            res.status(400).json({
                msg: "The fields userId and userDependentId are required",
            });
            return;
        }
        try {
            const userDependentsSnapshot = await firebase_1.firestore
                .collection("user-dependents")
                .where("userId", "==", userId)
                .where("id", "==", userDependentId)
                .get();
            if (!userDependentsSnapshot.empty) {
                res.status(404).json({
                    msg: "Already added mock user, please select a different user",
                });
                return;
            }
            let mockUserProfileSnapshot = await firebase_1.firestore
                .collection("users")
                .where("role", "==", user_interface_1.USER_TYPE.mockProfile)
                .where("id", "==", userDependentId)
                .get();
            if (mockUserProfileSnapshot.empty) {
                res.status(404).json({
                    msg: "Unable to get mock user profile, please try again",
                });
                return;
            }
            const mockUserProfile = mockUserProfileSnapshot.docs[0].data();
            const userDependent = {
                ...mockUserProfile,
                userId,
                createdAt: firestore_1.Timestamp.now(),
                updatedAt: firestore_1.Timestamp.now(),
            };
            await firebase_1.firestore.collection("user-dependents").add(userDependent);
            res.status(200).json({
                msg: "User profile added successfully",
                userDependent,
            });
        }
        catch (error) {
            res.status(500).json({ msg: "Internal Server Error" });
        }
    });
});
