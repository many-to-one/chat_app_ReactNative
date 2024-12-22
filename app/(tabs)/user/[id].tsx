import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, KeyboardAvoidingView, FlatList, TextInput, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons'; //npm i --save-dev @types/react-native-vector-icons

import { BASE_URL, WS_URL } from '../domains';


const UsersScreen = () => {

  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [authUserId, setAuthUserId] = useState<number>(0);
  const [accessToken, setAccessToken] = useState<string | null >(null);
  const [messages, setMessages] = useState<MessageBase[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const clientId = Date.now();

  const flatListRef = useRef<FlatList>(null);
  
  const ws = new WebSocket(`ws://${WS_URL}/${clientId}`); 

  useEffect(() => {
    getAuthUserId()
  }, [])

  useEffect(() => {
    getAccessToken()
  }, [])

  useEffect(() => {
    getChat()
  }, [authUserId, accessToken, id])

  const getAuthUserId = async () => {
    try {
        const myIdString = await AsyncStorage.getItem('myId');
        setAuthUserId(Number(myIdString));
    } catch (error) {
        router.push("/", { relativeToDirectory: true })
    }
  }

  const getAccessToken = async () => {
    try {
        const myAccessToken = await AsyncStorage.getItem('accessToken');
        setAccessToken(myAccessToken);
    } catch (error) {
        router.push("/", { relativeToDirectory: true })
    }
  }

  const getChat = async () => {

    if (!authUserId || !id) {
        console.error("Sender ID or Receiver ID is missing.");
        return;
    };

    const params = {
        sender_id: Number(authUserId),
        receiver_id: Number(id),
    };
    

    try {
        const response = await axios.get(
            `${BASE_URL}/chat/get_chat`, 
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`, 
                  },
                params: params,
            },
        );
        // console.log('chat_response', response.data);
        const chatData: ChatBase[] = response.data;

        const loadedMessages: MessageBase[] = chatData.flatMap(chat => chat.messages);
        console.log('loadedMessages', loadedMessages);
        setMessages((prevMessages) => [...prevMessages, ...loadedMessages]);

      } catch (error: any) {
        console.error('Error fetching chat:', error.message || 'Something went wrong.');
        throw new Error(error.message || 'Something went wrong.');
      }
  }


  // Scroll to the bottom when the component is mounted or messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  
  useEffect(() => {
    ws.onmessage = (event) => {
        console.log('onmessage', event.data)
    };

    return () => ws.close(); // Clean up the WebSocket connection on unmount
  }, []);

  const sendMessage = () => {
    if (messageText.trim() === '') return;

    // Create a ChatBase message to send to the server
    const messageData: ChatBase = {
    //   id: Date.now(), // Unique ID
      sender_id: authUserId, // Current user ID (make this dynamic as needed)
      receiver_id: Number(id), // Receiver ID (can be dynamic)
      message: messageText,
      messages: [{
        user_id: authUserId,
        message: messageText, 
        read: false,
      }], // Message list
    };

    // Send message to the WebSocket server
    ws.send(JSON.stringify(messageData));

    // Add to local state as a sent message
    const newMessage: MessageBase = {
      user_id: authUserId,
      message: messageText,
      read: false,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessageText('');
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <Text>User ID: {id}</Text>
      <Text>MY ID: {authUserId}</Text>
      <FlatList
        // ref={flatListRef}
        inverted
        data={[...messages].reverse()}
        // data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
              <View style={
                item.user_id === authUserId ? styles.myMessageContainer : styles.receiverMessageContainer
                }>
                <Text style={styles.messageText}>{item.message}</Text>
                { item.user_id === authUserId && 
                  <View>
                    <Icon
                    name={item.read ? 'check' : 'check'}
                    size={14}
                    color={item.read ? 'green' : 'gray'}
                    style={styles.messageIcon}
                    />
                    <Icon
                      name={item.read ? 'check' : 'check'}
                      size={14}
                      color={item.read ? 'green' : 'gray'}
                      style={styles.messageIconDouble}
                    />
                  </View>
                }
              </View>
            )}
            contentContainerStyle={{ flexGrow: 1 }} 
            keyboardShouldPersistTaps="handled"
      />

      <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={messageText}
              onChangeText={setMessageText}
            />
            <TouchableOpacity 
              // onPress={sendMessage} 
              onPress={() => {
                sendMessage();
                // scrollToBottom();
              }}
              style={styles.sendButton}>
              <Text style={styles.sendButtonText}>
                <Icon
                    name={'send'}
                    size={20}
                    color={'white'}
                    // style={styles.messageIcon}
                />
              </Text>
            </TouchableOpacity>
          </View>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        // marginTop: StatusBar.currentHeight || 0,
        padding: 5,
      },
      contentContainer: {
        flexGrow: 1, // Ensures that FlatList grows and allows scrolling
        paddingBottom: 10,
      },
      myMessageContainer: {
        padding: 10,
        marginVertical: 5,
        borderRadius: 8,
        backgroundColor: '#DCF8C6',
        alignSelf: 'flex-end',
        maxWidth: '80%',
      },
      receiverMessageContainer: {
        padding: 10,
        marginVertical: 5,
        borderRadius: 8,
        backgroundColor: '#E1E1E1',
        alignSelf: 'flex-start',
        maxWidth: '80%',
      },
      messageText: {
        fontSize: 16,
      },
      messageIcon: {
        alignSelf: 'flex-end',
      },
      messageIconDouble: {
        alignSelf: 'flex-end',
        marginRight: -4,
        marginTop: -14
      },
      inputContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
      },
      input: {
        flex: 1,
        height: 40,
        borderColor: '#CCCCCC',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
        backgroundColor: '#FFFFFF',
      },
      sendButton: {
        backgroundColor: '#075E54',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginLeft: 10,
      },
      sendButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
      },
    });

export default UsersScreen;
