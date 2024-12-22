import { useState } from 'react';
import { Button, TextInput, View, Text, Alert, StyleSheet }  from 'react-native';

import { login } from '../../services/loginService';
import { router } from 'expo-router';

const LoginScreen = () => {

    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);


    const handleLogin = async () => {

        if (!username || !password) {
          Alert.alert('Error', 'Please fill in all fields');
          return;
        }
    
        try {
            setLoading(true);
            const resp = await login({ username, password })
            // console.log('***response***', resp)
            if ( resp.status === 200 ) {
                router.push("/", { relativeToDirectory: true })
            } else {
                Alert.alert('Invalid Credentionals');
            }
    
        } catch (error: any) {
          Alert.alert('Error', error.response?.data?.detail || 'Something went wrong');
        } finally {
          setLoading(false);
        }
    };
    

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        
        <TextInput 
          style={styles.input} 
          placeholder="Username" 
          value={username} 
          onChangeText={setUsername} 
          // keyboardType="email-address" 
        />
        
        <TextInput 
          style={styles.input} 
          placeholder="Password" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
        />
        
        <Button title={loading ? 'Loading...' : 'Login'} onPress={handleLogin} />
        
        {/* <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
          Don't have an account? Register
        </Text> */}
      </View>
    )

}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    input: {
      width: '100%',
      height: 50,
      borderColor: '#ddd',
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 10,
      marginBottom: 12,
    },
    link: {
      color: 'blue',
      marginTop: 12,
    },
  });

export default LoginScreen;