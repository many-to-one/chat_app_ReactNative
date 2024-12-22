import React, { useEffect, useState } from 'react';
import { SafeAreaView, FlatList, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';

import  { User }  from '../types/user';
import { fetchUsers } from '../services/fetchUsers';


const HomeScreen = () => {

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
      }, []);

    
      const loadUsers = async () => {
        try {
          setLoading(true);
          const filteredUsers = await fetchUsers(); 
          setUsers(filteredUsers);
        } catch (error: any) {
          router.push("./screens/LoginScreen", { relativeToDirectory: true })
        } finally {
          setLoading(false);
        }
      };
      

      if (loading) {
        return (
          <View style={styles.container}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        );
      }
    
      if (error) {
        return (
          <View style={styles.container}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        );
      }
    

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        style={styles.list}
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link href={`/user/${item.id}`}>
            <View style={styles.listItem}>
              {item.username}
            </View>
          </Link>
        )}
        scrollEnabled={true}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure the parent container fills the whole screen
  },
  list: {
    flex: 1, // Let the FlatList use the full height
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontSize: 24,
  },
  // listTitle: {
  //   fontSize: 24,
  // },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
  },
});

export default HomeScreen;