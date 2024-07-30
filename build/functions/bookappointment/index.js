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
const bookings_interface_1 = require("../../interfaces/bookings.interface");
const firestore_1 = require("@google-cloud/firestore");
const cors_1 = __importDefault(require("cors"));
const corsHandler = (0, cors_1.default)({ origin: true });
functions.http("bookAppointment", async (req, res) => {
    corsHandler(req, res, async () => {
        const { doctorId, date, startTime, userId, purpose } = req.body;
        if (!doctorId || !date || !startTime || !userId || !purpose) {
            res.status(400).json({
                msg: "All fields (doctorId, date, startTime, userId, purpose) are required",
            });
            return;
        }
        try {
            const availabilitySnapshot = await firebase_1.firestore
                .collection("doctors-availabilities")
                .where("doctorId", "==", doctorId)
                .where("date", "==", date)
                .get();
            if (availabilitySnapshot.empty) {
                res.status(404).json({
                    msg: "No available slot found for the specified time",
                });
                return;
            }
            const availableTimesDoc = availabilitySnapshot.docs[0];
            const availableTimesData = availableTimesDoc.data();
            const availableTimes = availableTimesData.availableTimes;
            const selectedTimeSlot = availableTimes.find((timeSlot) => timeSlot.startTime === startTime && timeSlot.available);
            if (!selectedTimeSlot) {
                res.status(400).json({
                    msg: "The selected time slot is not available",
                });
                return;
            }
            selectedTimeSlot.available = false;
            const appointment = {
                doctorId,
                date,
                time: startTime,
                userId,
                purpose,
                status: bookings_interface_1.APPOINTMENT_STATUS.upcoming,
                createdAt: firestore_1.Timestamp.now(),
                updatedAt: firestore_1.Timestamp.now(),
            };
            await firebase_1.firestore.collection("appointments").add(appointment);
            await availableTimesDoc.ref.update({ availableTimes });
            res.status(200).json({
                msg: "Appointment booked successfully",
                appointment,
            });
        }
        catch (error) {
            res.status(500).json({ msg: "Internal Server Error" });
        }
    });
});
