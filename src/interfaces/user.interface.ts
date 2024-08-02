export enum USER_TYPE {
  superAdmin = "SUPER_ADMIN",
  user = "USER",
  doctor = "DOCTOR",
  mockProfile = "MOCK_PROFILE",
}

export interface ProfileInfoInterface {
  experience: string;
  reviews: string[];
  qualification: string;
  ratings: number;
  successRate: number; // Success rate percentage
  patientStories: number; // Count of patient stories
}

export interface UserInterface {
  id: string;
  name: string;
  photo: string;
  about: string;
  email: string;
  phoneNo: string;
  role: USER_TYPE;
  profileInfo: ProfileInfoInterface;
  specialty: string;
  address: string;
  createdAt: any;
  updatedAt: any;
}

export interface UserProfileInterface extends Partial<UserInterface> {
  isUserDependentAdded?: boolean;
}
