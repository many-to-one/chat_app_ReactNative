import axios from 'axios'; // npm install axios
import AsyncStorage from '@react-native-async-storage/async-storage'; // npx expo install @react-native-async-storage/async-storage

import { BASE_URL } from '../(tabs)/domains';
import { LoginParams } from '../types/loginParams';

export const login = async ({ username, password }: LoginParams) => {


  try {
    const response = await axios.post(
        `${BASE_URL}/auth/login`,
        `username=${username}&password=${password}`,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      console.log('***response***', response)

      await AsyncStorage.setItem('myId', String(response.data.id));
      await AsyncStorage.setItem('myName', response.data.username);
      await AsyncStorage.setItem('access_token', response.data.access_token);
      await AsyncStorage.setItem('refresh_token', response.data.refresh_token);

      return response;

  } catch (error: any) {
    throw new Error(error.message || 'Something went wrong.');
  }
};
