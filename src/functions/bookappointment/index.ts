import * as functions from "@google-cloud/functions-framework";
import { Request, Response } from "express";
import { firestore } from "../../firebase";
import { DoctorsAvailability } from "../../interfaces/doctors-availability.interface";
import {
  APPOINTMENT_STATUS,
  Appointments,
} from "../../interfaces/bookings.interface";
import { Timestamp } from "@google-cloud/firestore";
import cors from "cors";

const corsHandler = cors({ origin: true });

functions.http("bookAppointment", async (req: Request, res: Response) => {
  corsHandler(req, res, async () => {
    const { doctorId, date, startTime, userId, purpose } = req.body;

    if (!doctorId || !date || !startTime || !userId || !purpose) {
      res.status(400).json({
        msg: "All fields (doctorId, date, startTime, userId, purpose) are required",
      });
      return;
    }

    try {
      const availabilitySnapshot = await firestore
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
      const availableTimesData =
        availableTimesDoc.data() as DoctorsAvailability;
      const availableTimes = availableTimesData.availableTimes;

      const selectedTimeSlot = availableTimes.find(
        (timeSlot) => timeSlot.startTime === startTime && timeSlot.available
      );

      if (!selectedTimeSlot) {
        res.status(400).json({
          msg: "The selected time slot is not available",
        });
        return;
      }

      selectedTimeSlot.available = false;

      const appointment: Appointments = {
        doctorId,
        date,
        time: startTime,
        userId,
        purpose,
        status: APPOINTMENT_STATUS.upcoming,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await firestore.collection("appointments").add(appointment);
      await availableTimesDoc.ref.update({ availableTimes });

      res.status(200).json({
        msg: "Appointment booked successfully",
        appointment,
      });
    } catch (error) {
      res.status(500).json({ msg: "Internal Server Error" });
    }
  });
});
