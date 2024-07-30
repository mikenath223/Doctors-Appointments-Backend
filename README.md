# Appointment Bookings Backend Application

This is the backend application for the Doctor's Appointment Booking system. The backend is built using Node.js and Firebase, and it includes several Google Cloud Functions for handling various operations like finding doctors, booking appointments, and fetching appointment details etc.

## Prerequisites

- Node.js (v18.x or later)
- npm (v10.2.x or later)
- Google Cloud SDK (optional, if deploying to Google Cloud Functions)
- Firebase Project and Service Account

## Getting Started

Follow these steps to set up and run the backend application locally.

### 1. Clone the Repository

```sh
git clone https://github.com/Emmybritt/doctors-appointment-booking-backend.git
cd doctors-appointment-booking-backend
```

### 2. Create a Config Folder and Add Firebase Config

- At the root of the project, create a new folder named config.

```sh
mkdir config
```

- Inside the config folder, paste fir-auth-311de-firebase-adminsdk-fydl1-322530e84e.json file inside the config folder
- The configuration should look like this:

```sh
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR-PRIVATE-KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "your-client-email@your-project-id.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-client-email@your-project-id.iam.gserviceaccount.com"
}
```

### 3. Install Dependencies

```sh
npm install
```

### 4. Start the Application

- You can start all functions simultaneously using the following command:

```sh
npm run start:all
```

This command will start all the cloud functions on different ports: - `findManyDoctors` on port 8080 - `getDoctorDetails` on port 8081 - `bookAppointment` on port 8082 - `getAppointments` on port 8083

### 5. Directory Structure

- This is the directory structure for the booking backend application:

```sh
bookings-backend/
├── build/
│   └── functions/
│       ├── finddoctors/
│       ├── getdoctorsdetails/
│       ├── bookappointment/
│       └── fetchappointments/
├── config/
│   └── fir-auth-311de-firebase-adminsdk-fydl1-322530e84e.json
├── src/
│   ├── functions/
│   │   ├── bookappointment/
│   │   ├── fetchappointments/
│   │   ├── finddoctors/
│   │   └── getdoctorsdetails/
│   ├── helper/
│   ├── factories/
│   └── interfaces/
├── .gitignore
├── .env
├── package-lock.json
├── package.json
├── README.md
├── runFactories.js
└── tsconfig.json
```

## Function Descriptions

### findManyDoctors

**Path:** `src/functions/finddoctors`

**Description:**

This function is responsible for fetching a list of doctors from the database. It can support various parameters to paginate, search and sort the list of doctors based on criteria such as name etc.

### getDoctorDetails

**Path:** `src/functions/getdoctorsdetails`

**Description:**

This function fetches detailed information about a specific doctor. It takes a doctor ID as input and returns comprehensive details about the doctor, including their profile, qualifications, specialties, available time slots, and patient reviews.

### bookAppointment

**Path:** `src/functions/bookappointment`

**Description:**

This function handles booking appointments with doctors. It accepts details such as the patient’s information, chosen time slot, and any specific requirements. It checks the availability of the doctor for the requested time slot and confirms the booking if the slot is available, otherwise, it returns an appropriate error message.

### getAppointments

**Path:** `src/functions/fetchappointments`

**Description:**

This function retrieves all appointments for a specific patient or doctor. It can be filtered status (upcoming, past, canceled), and other relevant criteria. This allows users to view their scheduled appointments and manage them accordingly.
