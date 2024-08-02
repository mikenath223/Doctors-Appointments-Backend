import { faker } from "@faker-js/faker";
import { firestore } from "../firebase"; // Adjust the path as necessary
import { USER_TYPE, UserProfileInterface } from "../interfaces/user.interface";

const createFakeMockUsers = async (numUsers = 10) => {
  for (let i = 0; i < numUsers; i++) {
    const userId = faker.string.uuid();
    const userData: UserProfileInterface = {
      id: userId,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phoneNo: faker.phone.number(),
      photo: faker.image.avatar(),
      role: USER_TYPE.mockProfile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await firestore.collection("users").doc(userId).set(userData);
  }
};

createFakeMockUsers(50)
  .then(() => {
    console.log("Fake mockuser profiles generated and inserted into Firestore");
    process.exit();
  })
  .catch((error) => {
    console.error("Error inserting fake mockuser profiles:", error);
    process.exit(1);
  });
