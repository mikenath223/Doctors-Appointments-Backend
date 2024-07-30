import * as functions from "@google-cloud/functions-framework";
import { Request, Response } from "express";
import { firestore } from "../../firebase";
import { Appointments } from "../../interfaces/bookings.interface";
import { UserInterface } from "../../interfaces/user.interface";
import cors from "cors";

const corsHandler = cors({ origin: true });

functions.http("getAppointments", async (req: Request, res: Response) => {
  corsHandler(req, res, async () => {
    const { status, userId } = req.query;

    try {
      if (!userId) {
        return res.status(400).json({ msg: "User ID is missing." });
      }

      let appointmentsRef = firestore
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

      const appointments: Appointments[] = [];
      const doctorIds: Set<string> = new Set();

      appointmentsSnapshot.forEach((doc) => {
        const appointment = doc.data() as Appointments;
        appointments.push(appointment);
        doctorIds.add(appointment.doctorId);
      });

      const doctorPromises = Array.from(doctorIds).map((doctorId) =>
        firestore.collection("users").doc(doctorId).get()
      );

      const doctorSnapshots = await Promise.all(doctorPromises);
      const doctors: { [key: string]: UserInterface } = {};

      doctorSnapshots.forEach((doc) => {
        if (doc.exists) {
          doctors[doc.id] = doc.data() as UserInterface;
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
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  });
});
