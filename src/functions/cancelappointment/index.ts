import * as functions from "@google-cloud/functions-framework";
import { Request, Response } from "express";
import { firestore } from "../../firebase";
import { DoctorsAvailability } from "../../interfaces/doctors-availability.interface";
import {
  APPOINTMENT_STATUS,
  Appointments,
  CURRENCY,
} from "../../interfaces/bookings.interface";
import { Timestamp } from "@google-cloud/firestore";
import cors from "cors";

const corsHandler = cors({ origin: true });

functions.http("cancelAppointment", async (req: Request, res: Response) => {
  corsHandler(req, res, async () => {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      res.status(400).json({ msg: "appointmentId is required" });
      return;
    }

    try {
      const appointmentDoc = await firestore
        .collection("appointments")
        .doc(appointmentId)
        .get();

      if (!appointmentDoc.exists) {
        res.status(404).json({ msg: "Appointment not found" });
        return;
      }

      const appointment = appointmentDoc.data() as Appointments;
      const appointmentDate = new Date(
        appointment.date + "T" + appointment.time
      );
      const currentDate = new Date();
      const timeDiff = appointmentDate.getTime() - currentDate.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      let refundAmount = 0;
      const amountPaid = parseFloat(
        appointment?.amountPaid?.replace(/[^0-9.-]+/g, "") || "0"
      );

      if (hoursDiff < 3) {
        refundAmount = 0;
      } else if (hoursDiff < 24) {
        refundAmount = amountPaid * 0.5;
      } else {
        refundAmount = amountPaid;
      }

      await appointmentDoc.ref.update({
        status: APPOINTMENT_STATUS.cancelled,
        refundAmount: `${refundAmount} ${CURRENCY.NGN}`,
        updatedAt: Timestamp.now(),
      });

      // Make the time slot available again
      const availabilitySnapshot = await firestore
        .collection("doctors-availabilities")
        .where("doctorId", "==", appointment.doctorId)
        .where("date", "==", appointment.date)
        .get();

      if (!availabilitySnapshot.empty) {
        const availableTimesDoc = availabilitySnapshot.docs[0];
        const availableTimesData =
          availableTimesDoc.data() as DoctorsAvailability;
        const availableTimes = availableTimesData.availableTimes;

        const selectedTimeSlot = availableTimes.find(
          (timeSlot) => timeSlot.startTime === appointment.time
        );

        if (selectedTimeSlot) {
          selectedTimeSlot.available = true;
          await availableTimesDoc.ref.update({ availableTimes });
        }
      }

      res.status(200).json({
        msg: "Appointment cancelled successfully",
        refundAmount: `${refundAmount} ${CURRENCY.NGN}`,
      });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  });
});
