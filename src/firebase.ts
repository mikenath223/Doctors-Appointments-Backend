import * as admin from "firebase-admin";
import serviceAccount from "../config/doctors-appointments-5c875-firebase-adminsdk-tkla1-9715807370.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const firestore = admin.firestore();
export { firestore };
