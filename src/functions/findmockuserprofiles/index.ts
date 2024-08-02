import * as functions from "@google-cloud/functions-framework";
import cors from "cors";
import { Request, Response } from "express";
import { firestore } from "../../firebase";
import { buildFirestoreQuery } from "../../helper/build-query";
import { FindMany } from "../../interfaces/query.interface";
import {
  USER_TYPE,
  UserProfileInterface,
} from "../../interfaces/user.interface";

const corsHandler = cors({ origin: true });

functions.http(
  "findManyMockUserProfiles",
  async (req: Request, res: Response) => {
    corsHandler(req, res, async () => {
      const { userId, limit, offset } = req.body;
      const options: FindMany = { limit, offset };

      try {
        let query: FirebaseFirestore.Query = firestore
          .collection("users")
          .where("role", "==", USER_TYPE.mockProfile);

        query = buildFirestoreQuery(query, options);

        const userDependentsSnapshot = await firestore
          .collection("user-dependents")
          .where("userId", "==", userId)
          .get();
        const userDependents = userDependentsSnapshot.docs.map((doc) =>
          doc.data()
        );

        const userDependentIds = new Set(userDependents.map((user) => user.id));

        const mockUsersProfileSnapshot = await query.get();
        const mockUsersProfiles = await Promise.all(
          mockUsersProfileSnapshot.docs.map(async (doc) => {
            const mockUserData: UserProfileInterface =
              doc.data() as UserProfileInterface;
            const isUserDependentAdded = userDependentIds.has(mockUserData.id);

            return {
              ...mockUserData,
              isUserDependentAdded,
            };
          })
        );

        res.status(200).json(mockUsersProfiles);
      } catch (error: any) {
        console.log(error);
        res.status(500).send("Internal Server Error");
      }
    });
  }
);
