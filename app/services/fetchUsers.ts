import axios from 'axios'; // npm install axios
import AsyncStorage from '@react-native-async-storage/async-storage'; // npx expo install @react-native-async-storage/async-storage

import { User } from '../types/user'; 
import { BASE_URL } from '../(tabs)/domains';

export const fetchUsers = async (): Promise<User[]> => {
  const accessToken = await AsyncStorage.getItem('access_token');
  const myIdString = await AsyncStorage.getItem('myId');
  const myId = myIdString ? parseInt(myIdString, 10) : 0; // Default to 0 if myId is null

  try {
    const response = await axios.get(`${BASE_URL}/users/all_users`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`, 
      },
    });

    const filteredUsers = response.data.filter((user: User) => user.id !== myId);
    return filteredUsers;
  } catch (error: any) {
    throw new Error(error.message || 'Something went wrong.');
  }
};
