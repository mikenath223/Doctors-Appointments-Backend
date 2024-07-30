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
const generateSequentialTimes = (startHour, endHour, interval) => {
    const times = [];
    for (let hour = startHour; hour < endHour; hour += interval) {
        times.push({
            startTime: `${hour}:00`,
            available: true,
        });
    }
    return times;
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
        const currentDate = new Date();
        const startDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
        const endDate = new Date(currentDate.setMonth(currentDate.getMonth() + 5));
        for (let j = 0; j < faker_1.faker.number.int({ min: 15, max: 20 }); j++) {
            const randomDate = getRandomDateBetween(startDate, endDate)
                .toISOString()
                .split("T")[0];
            const availabilityData = {
                id: faker_1.faker.string.uuid(),
                doctorId: doctorId,
                date: randomDate, // Random future date in YYYY-MM-DD format
                availableTimes: generateSequentialTimes(8, 18, 1), // 8 AM to 5 PM
            };
            await firebase_1.firestore
                .collection("doctors-availabilities")
                .doc(availabilityData.id)
                .set(availabilityData);
        }
    }
};
createFakeDoctors(40)
    .then(() => {
    console.log("Fake doctors data generated and inserted into Firestore");
    process.exit();
})
    .catch((error) => {
    console.error("Error inserting fake doctors data:", error);
    process.exit(1);
});
