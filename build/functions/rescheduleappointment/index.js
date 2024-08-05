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
const corsHandler = (0, cors_1.default)({ origin: true });
functions.http("rescheduleAppointment", async (req, res) => {
    corsHandler(req, res, async () => {
        const { appointmentId, newDate, newTime } = req.body;
        if (!appointmentId || !newDate || !newTime) {
            res.status(400).json({
                msg: "appointmentId, newDate, and newTime are required",
            });
            return;
        }
        try {
            const appointmentDoc = await firebase_1.firestore
                .collection("appointments")
                .doc(appointmentId)
                .get();
            if (!appointmentDoc.exists) {
                res.status(404).json({ msg: "Appointment not found" });
                return;
            }
            const appointment = appointmentDoc.data();
            const { doctorId, date, time } = appointment;
            const availabilitySnapshot = await firebase_1.firestore
                .collection("doctors-availabilities")
                .where("doctorId", "==", doctorId)
                .where("date", "==", newDate)
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
            const selectedTimeSlot = availableTimes.find((timeSlot) => timeSlot.startTime === newTime && timeSlot.available);
            if (!selectedTimeSlot) {
                res.status(400).json({
                    msg: "The selected time slot is not available",
                });
                return;
            }
            const batch = firebase_1.firestore.batch();
            // Update the new time slot to be unavailable
            selectedTimeSlot.available = false;
            batch.update(availableTimesDoc.ref, { availableTimes });
            const oldAvailabilitySnapshot = await firebase_1.firestore
                .collection("doctors-availabilities")
                .where("doctorId", "==", doctorId)
                .where("date", "==", date)
                .get();
            if (oldAvailabilitySnapshot.empty) {
                res.status(404).json({
                    msg: "oldAvailabilitydata is empty",
                });
            }
            const oldAvailableTimesDoc = oldAvailabilitySnapshot.docs[0];
            // Check to prevent multiple ref updates
            if (oldAvailableTimesDoc.id !== availableTimesDoc.id) {
                const oldAvailableTimesData = oldAvailableTimesDoc.data();
                const oldAvailableTimes = oldAvailableTimesData.availableTimes;
                const oldTimeSlot = oldAvailableTimes.find((timeSlot) => timeSlot.startTime === time);
                if (!oldTimeSlot) {
                    res.status(404).json({
                        msg: "Old time slot not found",
                    });
                    return;
                }
                // Update the old time slot to be available again
                oldTimeSlot.available = true;
                batch.update(oldAvailableTimesDoc.ref, {
                    availableTimes: oldAvailableTimes,
                });
            }
            else {
                const oldTimeSlot = availableTimes.find((timeSlot) => timeSlot.startTime === time);
                if (!oldTimeSlot) {
                    res.status(404).json({
                        msg: "Old time slot not found",
                    });
                    return;
                }
                oldTimeSlot.available = true;
            }
            // Update the appointment with the new date and time
            batch.update(appointmentDoc.ref, {
                date: newDate,
                time: newTime,
                updatedAt: firestore_1.Timestamp.now(),
            });
            await batch.commit();
            const newAppointment = {
                ...appointment,
                date: newDate,
                time: newTime,
                updatedAt: firestore_1.Timestamp.now(),
                oldAvailableTimesId: oldAvailableTimesDoc.id,
            };
            res.status(200).json({
                msg: "Appointment rescheduled successfully",
                newAppointment,
            });
        }
        catch (error) {
            console.error("Error rescheduling appointment:", error);
            res.status(500).json({ msg: "Internal Server Error", error });
        }
    });
});
