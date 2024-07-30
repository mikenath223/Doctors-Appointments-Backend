import * as functions from "@google-cloud/functions-framework";
import { Request, Response } from "express";
import { firestore } from "../../firebase";
import { DoctorsAvailability } from "../../interfaces/doctors-availability.interface";
import { UserInterface } from "../../interfaces/user.interface";
import cors from "cors";

const corsHandler = cors({ origin: true });

const getAllAvailableSlots = async (doctorId: string) => {
  const availabilitySnapshot = await firestore
    .collection("doctors-availabilities")
    .where("doctorId", "==", doctorId)
    .where("date", ">=", new Date().toISOString().split("T")[0])
    .orderBy("date")
    .get();

  const availableSlots = availabilitySnapshot.docs.map((doc) => {
    const availabilityData: DoctorsAvailability =
      doc.data() as DoctorsAvailability;
    return {
      date: availabilityData.date,
      availableTimes: availabilityData.availableTimes,
    };
  });

  return availableSlots;
};

functions.http("getDoctorDetails", async (req: Request, res: Response) => {
  corsHandler(req, res, async () => {
    const doctorId: string = req.query.id as string;

    if (!doctorId) {
      res.status(400).json({ msg: "Doctor ID is required" });
      return;
    }

    try {
      const doctorDocPromise = firestore
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

      const doctorData: UserInterface = doctorDoc.data() as UserInterface;

      const doctorWithAvailability = {
        ...doctorData,
        availability,
      };

      res.status(200).json(doctorWithAvailability);
    } catch (error) {
      console.error("Error fetching doctor details with availability:", error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  });
});
