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
const getNextAvailableSlot = async (doctorId) => {
    const availabilitySnapshot = await firebase_1.firestore
        .collection("doctors-availabilities")
        .where("doctorId", "==", doctorId)
        .where("date", ">=", new Date().toISOString().split("T")[0])
        .orderBy("date")
        .limit(1)
        .get();
    if (!availabilitySnapshot.empty) {
        const availabilityData = availabilitySnapshot.docs[0].data();
        const nextAvailableSlot = availabilityData.availableTimes.find((slot) => slot.available);
        if (nextAvailableSlot) {
            return {
                date: availabilityData.date,
                startTime: nextAvailableSlot.startTime,
            };
        }
    }
    return null;
};
functions.http("findManyDoctors", async (req, res) => {
    corsHandler(req, res, async () => {
        const options = req.body;
        try {
            let query = firebase_1.firestore
                .collection("users")
                .where("role", "==", user_interface_1.USER_TYPE.doctor);
            query = (0, build_query_1.buildFirestoreQuery)(query, options);
            const doctorsSnapshot = await query.get();
            const doctorsWithAvailability = await Promise.all(doctorsSnapshot.docs.map(async (doc) => {
                const doctorData = doc.data();
                const nextAvailableSlot = await getNextAvailableSlot(doctorData.id);
                return {
                    ...doctorData,
                    nextAvailableSlot,
                };
            }));
            res.status(200).json(doctorsWithAvailability);
        }
        catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");
        }
    });
});
