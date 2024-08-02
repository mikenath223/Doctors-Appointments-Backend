"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const firebase_1 = require("../firebase"); // Adjust the path as necessary
const user_interface_1 = require("../interfaces/user.interface");
const createFakeMockUsers = async (numUsers = 10) => {
    for (let i = 0; i < numUsers; i++) {
        const userId = faker_1.faker.string.uuid();
        const userData = {
            id: userId,
            name: faker_1.faker.person.fullName(),
            email: faker_1.faker.internet.email(),
            phoneNo: faker_1.faker.phone.number(),
            photo: faker_1.faker.image.avatar(),
            role: user_interface_1.USER_TYPE.mockProfile,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await firebase_1.firestore.collection("users").doc(userId).set(userData);
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
