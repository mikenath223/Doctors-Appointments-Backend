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
const cors_1 = __importDefault(require("cors"));
const corsHandler = (0, cors_1.default)({ origin: true });
const getAllAvailableSlots = async (doctorId) => {
    const availabilitySnapshot = await firebase_1.firestore
        .collection("doctors-availabilities")
        .where("doctorId", "==", doctorId)
        .where("date", ">=", new Date().toISOString().split("T")[0])
        .orderBy("date")
        .get();
    const availableSlots = availabilitySnapshot.docs.map((doc) => {
        const availabilityData = doc.data();
        return {
            date: availabilityData.date,
            availableTimes: availabilityData.availableTimes,
        };
    });
    return availableSlots;
};
functions.http("getDoctorDetails", async (req, res) => {
    corsHandler(req, res, async () => {
        const doctorId = req.query.id;
        if (!doctorId) {
            res.status(400).json({ msg: "Doctor ID is required" });
            return;
        }
        try {
            const doctorDocPromise = firebase_1.firestore
                .collection("users")
                .doc(doctorId)
                .get();
            const availabilityPromise = getAllAvailableSlots(doctorId);
            const [doctorDoc, availability] = await Promise.all([
                doctorDocPromise,
                availabilityPromise,
            ]);
            if (!doctorDoc.exists) {
                res.status(404).send({ msg: "Doctor not found" });
                return;
            }
            const doctorData = doctorDoc.data();
            const doctorWithAvailability = {
                ...doctorData,
                availability,
            };
            res.status(200).json(doctorWithAvailability);
        }
        catch (error) {
            console.error("Error fetching doctor details with availability:", error);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    });
});
