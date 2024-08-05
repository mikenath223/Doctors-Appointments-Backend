import { UserInterface } from "./user.interface";

export interface UserDependentInterface extends Partial<UserInterface> {
  userId: string;
}
