import * as admin from "firebase-admin";
import serviceAccount from "../config/fir-auth-311de-firebase-adminsdk-fydl1-322530e84e.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: "https://fir-auth-311de.firebaseio.com",
});

const firestore = admin.firestore();
export { firestore };
