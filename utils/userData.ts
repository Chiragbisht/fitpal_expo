import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserData {
  name: string;
  height: string;
  weight: string;
  age: string;
  gender?: string;
  birthday?: string;
  heightUnit?: string;
  weightUnit?: string;
  workoutLevel: string;
  fitnessGoal: string;
}

const USER_DATA_KEY = 'userData';

export const saveUserData = async (userData: UserData): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

export const getUserData = async (): Promise<UserData | null> => {
  try {
    const data = await AsyncStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const clearUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error('Error clearing user data:', error);
    throw error;
  }
};