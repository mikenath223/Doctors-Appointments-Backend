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
   git clone https://github.com/mikenath223/doctors-appointments-backend-extended.git
   cd doctors-appointments-backend-extended
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
│       └── findmockuserprofiles/
│       └── finduserdependents/
│       └── adduserdependent/
│       └── cancelappointment/
│       └── rescheduleappointment/
├── config/
│   └── fir-auth-311de-firebase-adminsdk-fydl1-322530e84e.json
├── src/
│   ├── functions/
│   │   ├── bookappointment/
│   │   ├── fetchappointments/
│   │   ├── finddoctors/
│   │   └── getdoctorsdetails/
│   |   └── findmockuserprofiles/
│   │   └── finduserdependents/
│   │   └── adduserdependent/
│   |   └── cancelappointment/
│   |   └── rescheduleappointment/
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

### findManyMockUserProfiles

**Path:** `src/functions/findmockuserprofiles`

**Description:**

This function is used to fetch a list of mock user profiles from a database. It can be used to create fake profiles for testing purposes. This allows users to easily create mock user profiles to be able to manage appointments for these profiles.

### findUserDependents

**Path:** `src/functions/finduserdependents`

**Description:**

This function is used to fetch a list of dependents for a specific user. It takes the user ID as input and fetches a list of profiles created by the user.

### addUserDependent

**Path:** `src/functions/adduserdependent`

**Description:**

This function is used to add a new dependent for a specific user. It recieves the user ID and the dependent ID. It can be used to add a profile for a user, enabling users to create profiles for their kids or other dependents.

### cancelAppointment

**Path:** `src/functions/cancelappointment`

**Description:**

This function is used to cancel an appointment for both the user and the user's added profiles. It takes details such as the appointment time slot and user ID and then frees up the appointment time slot for the doctor. It also enables users to receive refunds for appointments canceled. Appointments canceled can be refunded based on the following criteria:

- The appointment was canceled more than 24 hours from the appointment then the user gets refunded 100% of the amount paid.
- The appointment was canceled less than 24 hours from the appointment then the user gets refunded 50% of the amount paid.
- The appointment was canceled less than 3 hours from the appointment then no refund is issued to the user.

### rescheduleAppointment

**Path:** `src/functions/rescheduleappointment`

**Description:**

This function is used to reschedule an appointment. It accepts details such as the patient’s information, new reschedule time slot, old appointment time slot and any specific requirements. It checks the availability of the doctor for the requested time slot, confirms the booking if the slot is available and then frees up the old appointment time slot for the doctor; otherwise, it returns an appropriate error message.

