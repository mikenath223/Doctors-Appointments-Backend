import { faker } from "@faker-js/faker";
import { firestore } from "../firebase"; // Adjust the path as necessary
import { USER_TYPE, UserInterface } from "../interfaces/user.interface";
import { DoctorsAvailability } from "../interfaces/doctors-availability.interface";

// Helper function to generate random dates between a range
const getRandomDateBetween = (startDate: Date, endDate: Date) => {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return new Date(start + Math.random() * (end - start));
};

// Helper function to generate a sequential list of available times for a day
const generateSequentialTimes = (times: number[]) => {
  return times.map((time) => ({
    startTime: `${time}:00`,
    available: true,
  }));
};

const createFakeDoctors = async (numDoctors = 10) => {
  for (let i = 0; i < numDoctors; i++) {
    const doctorId = faker.string.uuid();
    const doctorData: UserInterface = {
      id: doctorId,
      name: faker.person.fullName(),
      about: faker.lorem.paragraph(),
      email: faker.internet.email(),
      phoneNo: faker.phone.number(),
      photo: faker.image.avatar(),
      address: faker.location.streetAddress({ useFullAddress: true }),
      role: USER_TYPE.doctor,
      profileInfo: {
        experience: `${faker.number.int({ min: 1, max: 20 })} years`,
        reviews: Array.from(
          { length: faker.number.int({ min: 1, max: 10 }) },
          () => faker.lorem.sentence()
        ),
        qualification: faker.lorem.words(3),
        ratings: faker.number.float({ min: 1, max: 5 }),
        successRate: faker.number.int({ min: 1, max: 100 }),
        patientStories: faker.number.int({ min: 1, max: 100 }),
      },
      specialty: faker.lorem.word(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await firestore.collection("users").doc(doctorId).set(doctorData);

    // Generate availability data for the next 3 to 6 months
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 5);

    for (let j = 0; j < faker.number.int({ min: 15, max: 20 }); j++) {
      const randomDate = getRandomDateBetween(startDate, endDate)
        .toISOString()
        .split("T")[0];

      // Generate a random number of unique available times for the day
      const numTimes = faker.number.int({ min: 4, max: 10 });
      const uniqueTimesSet = new Set<number>();
      while (uniqueTimesSet.size < numTimes) {
        uniqueTimesSet.add(faker.number.int({ min: 8, max: 17 }));
      }
      const sortedTimes = Array.from(uniqueTimesSet).sort((a, b) => a - b);

      const availabilityData: DoctorsAvailability = {
        id: faker.string.uuid(),
        doctorId: doctorId,
        date: randomDate, // Random future date in YYYY-MM-DD format
        availableTimes: generateSequentialTimes(sortedTimes), // Random times
      };

      await firestore
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
