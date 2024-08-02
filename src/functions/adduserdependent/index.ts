import * as functions from "@google-cloud/functions-framework";
import { Request, Response } from "express";
import { firestore } from "../../firebase";
import { Timestamp } from "@google-cloud/firestore";
import cors from "cors";
import {
  USER_TYPE,
  UserProfileInterface,
} from "../../interfaces/user.interface";
import { UserDependentInterface } from "../../interfaces/user-dependent.interface";

const corsHandler = cors({ origin: true });

functions.http("addUserDependent", async (req: Request, res: Response) => {
  corsHandler(req, res, async () => {
    const { userId, userDependentId } = req.body;

    if (!userId || !userDependentId) {
      res.status(400).json({
        msg: "The fields userId and userDependentId are required",
      });
      return;
    }

    try {
      const userDependentsSnapshot = await firestore
        .collection("user-dependents")
        .where("userId", "==", userId)
        .where("id", "==", userDependentId)
        .get();

      if (!userDependentsSnapshot.empty) {
        res.status(404).json({
          msg: "Already added mock user, please select a different user",
        });
        return;
      }

      let mockUserProfileSnapshot = await firestore
        .collection("users")
        .where("role", "==", USER_TYPE.mockProfile)
        .where("id", "==", userDependentId)
        .get();

      if (mockUserProfileSnapshot.empty) {
        res.status(404).json({
          msg: "Unable to get mock user profile, please try again",
        });
        return;
      }

      const mockUserProfile =
        mockUserProfileSnapshot.docs[0].data() as UserProfileInterface;
      const userDependent: UserDependentInterface = {
        ...mockUserProfile,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await firestore.collection("user-dependents").add(userDependent);

      res.status(200).json({
        msg: "User profile added successfully",
        userDependent,
      });
    } catch (error) {
      res.status(500).json({ msg: "Internal Server Error" });
    }
  });
});
