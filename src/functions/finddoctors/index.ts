import * as functions from "@google-cloud/functions-framework";
import cors from "cors";
import { Request, Response } from "express";
import { firestore } from "../../firebase";
import { buildFirestoreQuery } from "../../helper/build-query";
import { DoctorsAvailability } from "../../interfaces/doctors-availability.interface";
import { FindMany } from "../../interfaces/query.interface";
import { USER_TYPE, UserInterface } from "../../interfaces/user.interface";

const corsHandler = cors({ origin: true });

const getNextAvailableSlot = async (
  doctorId: string
): Promise<Record<string, any> | null> => {
  const availabilitySnapshot = await firestore
    .collection("doctors-availabilities")
    .where("doctorId", "==", doctorId)
    .where("date", ">=", new Date().toISOString().split("T")[0])
    .orderBy("date")
    .limit(1)
    .get();

  if (!availabilitySnapshot.empty) {
    const availabilityData: DoctorsAvailability =
      availabilitySnapshot.docs[0].data() as DoctorsAvailability;
    const nextAvailableSlot = availabilityData.availableTimes.find(
      (slot) => slot.available
    );

    if (nextAvailableSlot) {
      return {
        date: availabilityData.date,
        startTime: nextAvailableSlot.startTime,
      };
    }
  }

  return null;
};

functions.http("findManyDoctors", async (req: Request, res: Response) => {
  corsHandler(req, res, async () => {
    const options: FindMany = req.body;

    try {
      let query: FirebaseFirestore.Query = firestore
        .collection("users")
        .where("role", "==", USER_TYPE.doctor);

      query = buildFirestoreQuery(query, options);

      const doctorsSnapshot = await query.get();
      const doctorsWithAvailability = await Promise.all(
        doctorsSnapshot.docs.map(async (doc) => {
          const doctorData: UserInterface = doc.data() as UserInterface;
          const nextAvailableSlot = await getNextAvailableSlot(doctorData.id);

          return {
            ...doctorData,
            nextAvailableSlot,
          };
        })
      );

      res.status(200).json(doctorsWithAvailability);
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  });
});
