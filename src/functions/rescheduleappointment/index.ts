import * as functions from "@google-cloud/functions-framework";
import { Request, Response } from "express";
import { firestore } from "../../firebase";
import { DoctorsAvailability } from "../../interfaces/doctors-availability.interface";
import { Appointments } from "../../interfaces/bookings.interface";
import { Timestamp } from "@google-cloud/firestore";
import cors from "cors";

const corsHandler = cors({ origin: true });

functions.http("rescheduleAppointment", async (req: Request, res: Response) => {
  corsHandler(req, res, async () => {
    const { appointmentId, newDate, newTime } = req.body;

    if (!appointmentId || !newDate || !newTime) {
      res.status(400).json({
        msg: "appointmentId, newDate, and newTime are required",
      });
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
      const { doctorId, date, time } = appointment;

      const availabilitySnapshot = await firestore
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
      const availableTimesData =
        availableTimesDoc.data() as DoctorsAvailability;
      const availableTimes = availableTimesData.availableTimes;

      const selectedTimeSlot = availableTimes.find(
        (timeSlot) => timeSlot.startTime === newTime && timeSlot.available
      );

      if (!selectedTimeSlot) {
        res.status(400).json({
          msg: "The selected time slot is not available",
        });
        return;
      }

      const batch = firestore.batch();

      // Update the new time slot to be unavailable
      selectedTimeSlot.available = false;
      batch.update(availableTimesDoc.ref, { availableTimes });

      const oldAvailabilitySnapshot = await firestore
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
        const oldAvailableTimesData =
          oldAvailableTimesDoc.data() as DoctorsAvailability;
        const oldAvailableTimes = oldAvailableTimesData.availableTimes;

        const oldTimeSlot = oldAvailableTimes.find(
          (timeSlot) => timeSlot.startTime === time
        );

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
      } else {
        const oldTimeSlot = availableTimes.find(
          (timeSlot) => timeSlot.startTime === time
        );
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
        updatedAt: Timestamp.now(),
      });

      await batch.commit();

      const newAppointment = {
        ...appointment,
        date: newDate,
        time: newTime,
        updatedAt: Timestamp.now(),
        oldAvailableTimesId: oldAvailableTimesDoc.id,
      };

      res.status(200).json({
        msg: "Appointment rescheduled successfully",
        newAppointment,
      });
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      res.status(500).json({ msg: "Internal Server Error", error });
    }
  });
});
