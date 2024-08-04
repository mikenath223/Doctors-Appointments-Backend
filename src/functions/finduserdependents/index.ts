import * as functions from "@google-cloud/functions-framework";
import { Request, Response } from "express";
import { firestore } from "../../firebase";
import cors from "cors";
import { UserDependentInterface } from "../../interfaces/user-dependent.interface";
import { FindMany } from "../../interfaces/query.interface";
import { buildFirestoreQuery } from "../../helper/build-query";

const corsHandler = cors({ origin: true });

functions.http("findUserDependents", async (req: Request, res: Response) => {
  corsHandler(req, res, async () => {
    const { userId, limit, offset } = req.body;

    if (!userId) {
      res.status(400).json({
        msg: "The userId field is required",
      });
      return;
    }

    try {
      let query: FirebaseFirestore.Query = firestore
        .collection("user-dependents")
        .where("userId", "==", userId);

      const userDependentsSnapshot = await query.get();
      const userDependents: UserDependentInterface[] =
        userDependentsSnapshot.docs.map(
          (doc) => doc.data() as UserDependentInterface
        );

      res.status(200).json(userDependents);
    } catch (error) {
      res.status(500).json({ msg: "Internal Server Error" });
    }
  });
});
