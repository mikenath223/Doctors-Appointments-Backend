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
const generateSequentialTimes = (
  startHour: number,
  endHour: number,
  interval: number
) => {
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
    const doctorId = faker.string.uuid();
    const doctorData: UserInterface = {
      id: doctorId,
      name: faker.person.fullName(),
      about: faker.lorem.paragraph(),
      email: faker.internet.email(),
      phoneNo: faker.phone.number(),
      photo: faker.image.avatar(),
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
    const currentDate = new Date();
    const startDate = new Date(
      currentDate.setMonth(currentDate.getMonth() + 1)
    );
    const endDate = new Date(currentDate.setMonth(currentDate.getMonth() + 5));

    for (let j = 0; j < faker.number.int({ min: 15, max: 20 }); j++) {
      const randomDate = getRandomDateBetween(startDate, endDate)
        .toISOString()
        .split("T")[0];

      const availabilityData: DoctorsAvailability = {
        id: faker.string.uuid(),
        doctorId: doctorId,
        date: randomDate, // Random future date in YYYY-MM-DD format
        availableTimes: generateSequentialTimes(8, 18, 1), // 8 AM to 5 PM
      };

      await firestore
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
