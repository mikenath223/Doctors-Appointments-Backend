"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const firebase_1 = require("../firebase"); // Adjust the path as necessary
const user_interface_1 = require("../interfaces/user.interface");
// Helper function to generate random dates between a range
const getRandomDateBetween = (startDate, endDate) => {
    const start = startDate.getTime();
    const end = endDate.getTime();
    return new Date(start + Math.random() * (end - start));
};
// Helper function to generate a sequential list of available times for a day
const generateSequentialTimes = (times) => {
    return times.map((time) => ({
        startTime: `${time}:00`,
        available: true,
    }));
};
const createFakeDoctors = async (numDoctors = 10) => {
    for (let i = 0; i < numDoctors; i++) {
        const doctorId = faker_1.faker.string.uuid();
        const doctorData = {
            id: doctorId,
            name: faker_1.faker.person.fullName(),
            about: faker_1.faker.lorem.paragraph(),
            email: faker_1.faker.internet.email(),
            phoneNo: faker_1.faker.phone.number(),
            photo: faker_1.faker.image.avatar(),
            address: faker_1.faker.location.streetAddress({ useFullAddress: true }),
            role: user_interface_1.USER_TYPE.doctor,
            profileInfo: {
                experience: `${faker_1.faker.number.int({ min: 1, max: 20 })} years`,
                reviews: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 10 }) }, () => faker_1.faker.lorem.sentence()),
                qualification: faker_1.faker.lorem.words(3),
                ratings: faker_1.faker.number.float({ min: 1, max: 5 }),
                successRate: faker_1.faker.number.int({ min: 1, max: 100 }),
                patientStories: faker_1.faker.number.int({ min: 1, max: 100 }),
            },
            specialty: faker_1.faker.lorem.word(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await firebase_1.firestore.collection("users").doc(doctorId).set(doctorData);
        // Generate availability data for the next 3 to 6 months
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 5);
        for (let j = 0; j < faker_1.faker.number.int({ min: 15, max: 20 }); j++) {
            const randomDate = getRandomDateBetween(startDate, endDate)
                .toISOString()
                .split("T")[0];
            // Generate a random number of unique available times for the day
            const numTimes = faker_1.faker.number.int({ min: 4, max: 10 });
            const uniqueTimesSet = new Set();
            while (uniqueTimesSet.size < numTimes) {
                uniqueTimesSet.add(faker_1.faker.number.int({ min: 8, max: 17 }));
            }
            const sortedTimes = Array.from(uniqueTimesSet).sort((a, b) => a - b);
            const availabilityData = {
                id: faker_1.faker.string.uuid(),
                doctorId: doctorId,
                date: randomDate, // Random future date in YYYY-MM-DD format
                availableTimes: generateSequentialTimes(sortedTimes), // Random times
            };
            await firebase_1.firestore
                .collection("doctors-availabilities")
                .doc(availabilityData.id)
                .set(availabilityData);
        }
    }
};
createFakeDoctors(100)
    .then(() => {
    console.log("Fake doctors data generated and inserted into Firestore");
    process.exit();
})
    .catch((error) => {
    console.error("Error inserting fake doctors data:", error);
    process.exit(1);
});
