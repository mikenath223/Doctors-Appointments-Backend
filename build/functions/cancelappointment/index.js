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
functions.http("cancelAppointment", async (req, res) => {
    corsHandler(req, res, async () => {
        const { appointmentId } = req.body;
        if (!appointmentId) {
            res.status(400).json({ msg: "appointmentId is required" });
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
            const appointmentDate = new Date(appointment.date + "T" + appointment.time);
            const currentDate = new Date();
            const timeDiff = appointmentDate.getTime() - currentDate.getTime();
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            let refundAmount = 0;
            const amountPaid = parseFloat(appointment?.amountPaid?.replace(/[^0-9.-]+/g, "") || "0");
            if (hoursDiff < 3) {
                refundAmount = 0;
            }
            else if (hoursDiff < 24) {
                refundAmount = amountPaid * 0.5;
            }
            else {
                refundAmount = amountPaid;
            }
            await appointmentDoc.ref.update({
                status: bookings_interface_1.APPOINTMENT_STATUS.cancelled,
                refundAmount: `${refundAmount} ${bookings_interface_1.CURRENCY.NGN}`,
                updatedAt: firestore_1.Timestamp.now(),
            });
            // Make the time slot available again
            const availabilitySnapshot = await firebase_1.firestore
                .collection("doctors-availabilities")
                .where("doctorId", "==", appointment.doctorId)
                .where("date", "==", appointment.date)
                .get();
            if (!availabilitySnapshot.empty) {
                const availableTimesDoc = availabilitySnapshot.docs[0];
                const availableTimesData = availableTimesDoc.data();
                const availableTimes = availableTimesData.availableTimes;
                const selectedTimeSlot = availableTimes.find((timeSlot) => timeSlot.startTime === appointment.time);
                if (selectedTimeSlot) {
                    selectedTimeSlot.available = true;
                    await availableTimesDoc.ref.update({ availableTimes });
                }
            }
            res.status(200).json({
                msg: "Appointment cancelled successfully",
                refundAmount: `${refundAmount} ${bookings_interface_1.CURRENCY.NGN}`,
            });
        }
        catch (error) {
            console.error("Error cancelling appointment:", error);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    });
});
