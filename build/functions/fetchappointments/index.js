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
functions.http("getAppointments", async (req, res) => {
    corsHandler(req, res, async () => {
        const { status, userId } = req.query;
        try {
            if (!userId) {
                return res.status(400).json({ msg: "User ID is missing." });
            }
            let appointmentsRef = firebase_1.firestore
                .collection("appointments")
                .where("userId", "==", userId);
            if (status) {
                appointmentsRef = appointmentsRef.where("status", "==", status);
            }
            const appointmentsSnapshot = await appointmentsRef.get();
            if (appointmentsSnapshot.empty) {
                return res.status(404).json({
                    msg: "No appointments found",
                });
            }
            const appointments = [];
            const doctorIds = new Set();
            appointmentsSnapshot.forEach((doc) => {
                const appointment = doc.data();
                appointments.push(appointment);
                doctorIds.add(appointment.doctorId);
            });
            const doctorPromises = Array.from(doctorIds).map((doctorId) => firebase_1.firestore.collection("users").doc(doctorId).get());
            const doctorSnapshots = await Promise.all(doctorPromises);
            const doctors = {};
            doctorSnapshots.forEach((doc) => {
                if (doc.exists) {
                    doctors[doc.id] = doc.data();
                }
            });
            const appointmentsWithDoctors = appointments.map((appointment) => ({
                ...appointment,
                doctor: doctors[appointment.doctorId],
            }));
            return res.status(200).json({
                msg: "Appointments fetched successfully",
                appointments: appointmentsWithDoctors,
            });
        }
        catch (error) {
            console.error("Error fetching appointments:", error);
            return res.status(500).json({ msg: "Internal Server Error" });
        }
    });
});
