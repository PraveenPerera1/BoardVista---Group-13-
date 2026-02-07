// import { useNavigation } from '@react-navigation/native';
// import { useEffect, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   FlatList,
//   ImageBackground,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View
// } from 'react-native'; // This imports from 'react-native'
// import { boardingService } from '../services/boardingService';

// // --- (Optional) Reusable Header ---
// // You can replace this with your existing AppHeader component
// const AppHeader = () => (
//   <ImageBackground
//     source={require("../assets/images/background.jpg")} // Placeholder
//     style={styles.headerBackground}>
//     <View style={styles.headerOverlay}>
//       <Text style={styles.welcomeText}>WELCOME TO</Text>
//       <Text style={styles.logo}>BOARDVISTA</Text>
//       <Text style={styles.subtitle}>Discover the Best Stays in Vavuniya</Text>
//     </View>
//   </ImageBackground>
// );

// // --- (Optional) Reusable Footer ---
// // You can replace this with your existing AppFooter component
// const AppFooter = () => (
//   <View style={styles.footer}>
//     <Text style={styles.footerText}>© 2025 BoardVista</Text>
//   </View>
// );

// // --- Main ChatBot Screen Component ---
// export default function ChatBotScreen() {
//   const [messages, setMessages] = useState([
//     {
//       id: '1',
//       text: 'Hello! I am BoardVistaBot. Please select a boarding house and choose what information you need:',
//       sender: 'bot',
//     },
//   ]);
//   const [selectedBoarding, setSelectedBoarding] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [boardingList, setBoardingList] = useState([]);
//   const flatListRef = useRef(null);
//   const navigation = useNavigation();

//   //back to the dashboard
//   const  goback=()=> {
//     navigation.replace("Dashboard");
//   }
    
  
//   // Load boarding houses on component mount
//   useEffect(() => {
//     loadBoardingHouses();
//   }, []);

//   // Automatically scroll to the bottom when new messages are added
//   useEffect(() => {
//     if (flatListRef.current) {
//       flatListRef.current.scrollToEnd({ animated: true });
//     }
//   }, [messages]);

//   const loadBoardingHouses = async () => {
//     try {
//       const allBoardings = await boardingService.getAllBoardings();
//       let boardingData = [];
      
//       // Handle different response formats
//       if (Array.isArray(allBoardings)) {
//         boardingData = allBoardings;
//       } else if (allBoardings && allBoardings.boardingHouses) {
//         boardingData = allBoardings.boardingHouses;
//       } else if (allBoardings && allBoardings.data) {
//         boardingData = allBoardings.data;
//       } else if (allBoardings && allBoardings.data && allBoardings.data.data) {
//         boardingData = allBoardings.data.data;
//       }
      
//       setBoardingList(boardingData);
//     } catch (error) {
//       console.error('Error loading boarding houses:', error);
//     }
//   };

//   /**
//    * Handles question selection with switch case
//    */
//   const handleQuestionSelect = async (questionType) => {
//     if (!selectedBoarding) {
//       const errorMessage = {
//         id: Date.now().toString(),
//         text: 'Please select a boarding house first!',
//         sender: 'bot',
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//       return;
//     }

//     setIsLoading(true);
    
//     try {
//       const foundBoarding = boardingList.find(boarding => 
//         boarding._id === selectedBoarding || boarding.title === selectedBoarding
//       );
      
//       let response = '';
      
//       if (!foundBoarding) {
//         response = `❌ **Boarding House Not Found**\n\nPlease contact the owner for more information:\n\n📞 **Phone:** +94 77 123 4567\n📧 **Email:** support@boardvista.lk`;
//       } else {
//         // Switch case for different question types
//         switch (questionType) {
//           case 'price':
//             response = `💰 **Price Information for ${foundBoarding.title}**\n\n` +
//                      `Monthly Rent: LKR ${foundBoarding.price?.monthly || 'N/A'}\n` +
//                      `Deposit: LKR ${foundBoarding.price?.deposit || 'N/A'}`;
//             break;
            
//           case 'location':
//             response = `📍 **Location Information for ${foundBoarding.title}**\n\n` +
//                      `Address: ${foundBoarding.address || 'N/A'}\n` +
//                      `Coordinates: ${foundBoarding.coordinates ? 
//                        `Lat: ${foundBoarding.coordinates.latitude}, Lng: ${foundBoarding.coordinates.longitude}` : 
//                        'N/A'}`;
//             break;
            
//           case 'occupants':
//             response = `👥 **Occupancy Information for ${foundBoarding.title}**\n\n` +
//                      `Gender: ${foundBoarding.gender ? foundBoarding.gender.charAt(0).toUpperCase() + foundBoarding.gender.slice(1) : 'N/A'}\n` +
//                      `Total Capacity: ${foundBoarding.totalCapacity || 'N/A'} people\n` +
//                      `Available Rooms: ${foundBoarding.availableRooms || 'N/A'}`;
//             break;
            
//           case 'services':
//             const facilities = foundBoarding.facilities && foundBoarding.facilities.length > 0 ? 
//               foundBoarding.facilities.map(facility => `• ${facility}`).join('\n') : 'No facilities listed';
//             response = `🏠 **Services & Facilities for ${foundBoarding.title}**\n\n${facilities}`;
//             break;
            
//           case 'contact':
//             response = `📞 **Contact Information for ${foundBoarding.title}**\n\n` +
//                      `Phone: ${foundBoarding.contact?.phone || 'N/A'}\n` +
//                      `Email: ${foundBoarding.contact?.email || 'N/A'}\n` +
//                      `Owner: ${foundBoarding.owner?.name || 'N/A'}`;
//             break;
            
//           default:
//             // For any other question, return owner's contact
//             response = `❓ **Additional Information Required**\n\n` +
//                      `For this specific information, please contact the owner directly:\n\n` +
//                      `📞 **Phone:** ${foundBoarding.contact?.phone || '+94 77 123 4567'}\n` +
//                      `📧 **Email:** ${foundBoarding.contact?.email || 'support@boardvista.lk'}\n` +
//                      `👤 **Owner:** ${foundBoarding.owner?.name || 'Boarding Owner'}`;
//             break;
//         }
//       }
      
//       const botMessage = {
//         id: Date.now().toString(),
//         text: response,
//         sender: 'bot',
//       };
//       setMessages((prev) => [...prev, botMessage]);
      
//     } catch (error) {
//       console.error('Error in handleQuestionSelect:', error);
//       const errorMessage = {
//         id: Date.now().toString(),
//         text: `❌ **Error**\n\nSomething went wrong. Please contact the owner:\n\n📞 **Phone:** +94 77 123 4567\n📧 **Email:** support@boardvista.lk`,
//         sender: 'bot',
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//     } finally {
//       setIsLoading(false);
//     }
//   };


//   // No handleSend function needed anymore - using button-based interaction

  
//    // Renders a single chat bubble
   
//   const renderMessage = ({ item }) => {
//     const isUser = item.sender === 'user';
//     return (
//       <View
//         style={[
//           styles.messageContainer,
//           isUser ? styles.userMessageContainer : styles.botMessageContainer,
//         ]}>
          
//         <View 
//           style={[
//             styles.messageBubble,
//             isUser ? styles.userMessageBubble : styles.botMessageBubble,
//           ]}>
//           <Text style={isUser ? styles.userMessageText : styles.botMessageText}>
//             {item.text}
//           </Text>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <AppHeader />

//       {/* This is a simple header for the chat page itself */}
//       <View style={styles.chatHeader}>
//         <TouchableOpacity onPress={goback}>
//           <Text style={styles.backArrow}>←</Text>
//         </TouchableOpacity>
//         <Text style={styles.chatTitle}>BoardVistaBot</Text>
//         <View style={{ width: 30 }} />{/* Spacer */}
//       </View>

//       {/* --- Chat Messages --- */}
//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         renderItem={renderMessage}
//         keyExtractor={(item) => item.id}
//         style={styles.chatList}
//         contentContainerStyle={{ paddingVertical: 10 }}
//       />

//       {/* --- "Bot is typing..." Indicator --- */}
//       {isLoading && (
//         <View style={styles.typingIndicator}>
//           <ActivityIndicator size="small" color="#555" />
//           <Text style={styles.typingText}>Getting information...</Text>
//         </View>
//       )}

//       {/* --- Boarding Selection --- */}
//       <View style={styles.selectionContainer}>
//         <Text style={styles.sectionTitle}>Select Boarding House:</Text>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.boardingScroll}>
//           {boardingList.map((boarding) => (
//             <TouchableOpacity
//               key={boarding._id}
//               style={[
//                 styles.boardingButton,
//                 selectedBoarding === boarding._id && styles.selectedBoardingButton
//               ]}
//               onPress={() => setSelectedBoarding(boarding._id)}
//             >
//               <Text style={[
//                 styles.boardingButtonText,
//                 selectedBoarding === boarding._id && styles.selectedBoardingButtonText
//               ]}>
//                 {boarding.title}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>

//       {/* --- Question Buttons --- */}
//       <View style={styles.questionsContainer}>
//         <Text style={styles.sectionTitle}>Select Information:</Text>
//         <View style={styles.questionButtonsGrid}>
//           <TouchableOpacity
//             style={styles.questionButton}
//             onPress={() => handleQuestionSelect('price')}
//             disabled={isLoading}
//           >
//             <Text style={styles.questionButtonText}>💰 Price</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity
//             style={styles.questionButton}
//             onPress={() => handleQuestionSelect('location')}
//             disabled={isLoading}
//           >
//             <Text style={styles.questionButtonText}>📍 Location</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity
//             style={styles.questionButton}
//             onPress={() => handleQuestionSelect('occupants')}
//             disabled={isLoading}
//           >
//             <Text style={styles.questionButtonText}>👥 Occupants</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity
//             style={styles.questionButton}
//             onPress={() => handleQuestionSelect('services')}
//             disabled={isLoading}
//           >
//             <Text style={styles.questionButtonText}>🏠 Services</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity
//             style={styles.questionButton}
//             onPress={() => handleQuestionSelect('contact')}
//             disabled={isLoading}
//           >
//             <Text style={styles.questionButtonText}>📞 Contact</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity
//             style={styles.questionButton}
//             onPress={() => handleQuestionSelect('other')}
//             disabled={isLoading}
//           >
//             <Text style={styles.questionButtonText}>❓ Other</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       <AppFooter />
//     </SafeAreaView>
//   );
// }

// // === STYLESHEET ===
// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   // Header
//   headerBackground: {
//     width: '100%',
//     height: 180, // Shorter header
//   },
//   headerOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(58, 90, 120, 0.8)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 15,
//   },
//   welcomeText: {
//     color: '#fff',
//     fontSize: 14,
//   },
//   logo: {
//     fontSize: 36,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#fff',
//     marginTop: 5,
//   },
//   // Chat Header
//   chatHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 15,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//   },
//   backArrow: {
//     fontSize: 24,
//     color: '#333',
//   },
//   chatTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   // Chat List
//   chatList: {
//     flex: 1,
//     backgroundColor: '#f4f4f8', // Light gray background
//   },
//   messageContainer: {
//     flexDirection: 'row',
//     marginVertical: 5,
//     paddingHorizontal: 10,
//   },
//   userMessageContainer: {
//     justifyContent: 'flex-end',
//   },
//   botMessageContainer: {
//     justifyContent: 'flex-start',
//   },
//   messageBubble: {
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//     maxWidth: '80%',
//   },
//   userMessageBubble: {
//     backgroundColor: '#007BFF', // Blue for user
//   },
//   botMessageBubble: {
//     backgroundColor: '#e0e0e0', // Gray for bot
//   },
//   userMessageText: {
//     fontSize: 16,
//     color: '#fff', // User text
//   },
//   botMessageText: {
//     fontSize: 16,
//     color: '#000', // Bot text
//   },
//   // Typing Indicator
//   typingIndicator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//     backgroundColor: '#f4f4f8',
//   },
//   typingText: {
//     marginLeft: 10,
//     fontSize: 14,
//     color: '#555',
//     fontStyle: 'italic',
//   },
//   // Input Area
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     borderTopWidth: 1,
//     borderTopColor: '#ddd',
//     backgroundColor: '#fff',
//   },
//   textInput: {
//     flex: 1,
//     minHeight: 40,
//     backgroundColor: '#f9f9f9',
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 20,
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     fontSize: 16,
//     marginRight: 10,
//   },
//   sendButton: {
//     padding: 10,
//     backgroundColor: '#007BFF',
//     borderRadius: 20,
//   },
//   sendButtonDisabled: {
//     backgroundColor: '#aaa',
//   },
//   sendButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   // Footer
//   footer: {
//     backgroundColor: '#90b4ce',
//     padding: 20,
//     alignItems: 'center',
//   },
//   footerText: {
//     color: '#fff',
//     fontSize: 14,
//   },
//   // Boarding Selection
//   selectionContainer: {
//     backgroundColor: '#fff',
//     padding: 15,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 10,
//   },
//   boardingScroll: {
//     marginBottom: 10,
//   },
//   boardingButton: {
//     backgroundColor: '#f0f0f0',
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderRadius: 20,
//     marginRight: 10,
//     minWidth: 120,
//     alignItems: 'center',
//   },
//   selectedBoardingButton: {
//     backgroundColor: '#3a5a78',
//   },
//   boardingButtonText: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '500',
//   },
//   selectedBoardingButtonText: {
//     color: '#fff',
//   },
//   // Question Buttons
//   questionsContainer: {
//     backgroundColor: '#fff',
//     padding: 15,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   questionButtonsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   questionButton: {
//     backgroundColor: '#f8f9fa',
//     borderWidth: 1,
//     borderColor: '#dee2e6',
//     borderRadius: 12,
//     padding: 12,
//     width: '30%',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   questionButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#495057',
//   },
// });
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { boardingService } from '../services/boardingService';

// --- Header ---
const AppHeader = () => (
  <ImageBackground
    source={require("../assets/images/background.jpg")}
    style={styles.headerBackground}>
    <View style={styles.headerOverlay}>
      <Text style={styles.welcomeText}>WELCOME TO</Text>
      <Text style={styles.logo}>BOARDVISTA</Text>
      <Text style={styles.subtitle}>Discover the Best Stays in Vavuniya</Text>
    </View>
  </ImageBackground>
);

// --- Footer ---
const AppFooter = () => (
  <View style={styles.footer}>
    <Text style={styles.footerText}>© 2025 BoardVista</Text>
  </View>
);

export default function ChatBotScreen() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! I am BoardVistaBot. Please select a boarding house and choose what information you need:',
      sender: 'bot',
    },
  ]);
  const [selectedBoarding, setSelectedBoarding] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [boardingList, setBoardingList] = useState([]);
  const flatListRef = useRef(null);
  const navigation = useNavigation();

  // Back to Dashboard
  const goback = () => navigation.replace("Dashboard");

  useEffect(() => {
    loadBoardingHouses();
  }, []);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const loadBoardingHouses = async () => {
    try {
      const allBoardings = await boardingService.getAllBoardings();
      let boardingData = [];

      if (Array.isArray(allBoardings)) boardingData = allBoardings;
      else if (allBoardings?.boardingHouses) boardingData = allBoardings.boardingHouses;
      else if (allBoardings?.data) boardingData = allBoardings.data;
      else if (allBoardings?.data?.data) boardingData = allBoardings.data.data;

      setBoardingList(boardingData);
    } catch (error) {
      console.error('Error loading boarding houses:', error);
    }
  };

  const handleQuestionSelect = async (questionType) => {
    if (!selectedBoarding) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Please select a boarding house first!',
        sender: 'bot',
      }]);
      return;
    }

    setIsLoading(true);

    try {
      const foundBoarding = boardingList.find(
        b => b._id === selectedBoarding || b.title === selectedBoarding
      );

      let response = '';
      if (!foundBoarding) {
        response = `❌ Boarding House Not Found. Please contact the owner directly.`;
      } else {
        switch (questionType) {
          case 'price':
            response = `💰 Price Information for ${foundBoarding.title}\nMonthly Rent: LKR ${foundBoarding.price?.monthly || 'N/A'}\nDeposit: LKR ${foundBoarding.price?.deposit || 'N/A'}`;
            break;
          case 'location':
            response = `📍 Location for ${foundBoarding.title}\nAddress: ${foundBoarding.address || 'N/A'}`;
            break;
          case 'occupants':
            response = `👥 Occupants at ${foundBoarding.title}\nGender: ${foundBoarding.gender || 'N/A'}\nAvailable Rooms: ${foundBoarding.availableRooms || 'N/A'}`;
            break;
          case 'services':
            const facilities = foundBoarding.facilities?.length > 0
              ? foundBoarding.facilities.map(f => `• ${f}`).join('\n')
              : 'No facilities listed';
            response = `🏠 Services & Facilities:\n${facilities}`;
            break;
          case 'contact':
            response = `📞 Contact Information:\nPhone: ${foundBoarding.contact?.phone || 'N/A'}\nEmail: ${foundBoarding.contact?.email || 'N/A'}`;
            break;
          default:
            response = `❓ For more info, contact owner:\nPhone: ${foundBoarding.contact?.phone || 'N/A'}\nEmail: ${foundBoarding.contact?.email || 'support@boardvista.lk'}`;
            break;
        }
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), text: response, sender: 'bot' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), text: '❌ Error retrieving info', sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Open WhatsApp
  const openWhatsApp = (phoneNumber) => {
    const url = `https://wa.me/${phoneNumber.replace(/\D/g, '')}`;
    Linking.canOpenURL(url)
      .then(supported => supported ? Linking.openURL(url) : alert('WhatsApp not installed'))
      .catch(err => console.error(err));
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.botMessageContainer]}>
        <View style={[styles.messageBubble, isUser ? styles.userMessageBubble : styles.botMessageBubble]}>
          <Text style={isUser ? styles.userMessageText : styles.botMessageText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader />

      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={goback}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.chatTitle}>BoardVistaBot</Text>
        <View style={{ width: 30 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.chatList}
        contentContainerStyle={{ paddingVertical: 10 }}
      />

      {isLoading && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color="#555" />
          <Text style={styles.typingText}>Getting information...</Text>
        </View>
      )}

      <View style={styles.selectionContainer}>
        <Text style={styles.sectionTitle}>Select Boarding House:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.boardingScroll}>
          {boardingList.map(boarding => (
            <TouchableOpacity
              key={boarding._id}
              style={[styles.boardingButton, selectedBoarding === boarding._id && styles.selectedBoardingButton]}
              onPress={() => setSelectedBoarding(boarding._id)}
            >
              <Text style={[styles.boardingButtonText, selectedBoarding === boarding._id && styles.selectedBoardingButtonText]}>
                {boarding.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.questionsContainer}>
        <Text style={styles.sectionTitle}>Select Information:</Text>
        <View style={styles.questionButtonsGrid}>
          <TouchableOpacity style={styles.questionButton} onPress={() => handleQuestionSelect('price')} disabled={isLoading}>
            <Text style={styles.questionButtonText}>💰 Price</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.questionButton} onPress={() => handleQuestionSelect('location')} disabled={isLoading}>
            <Text style={styles.questionButtonText}>📍 Location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.questionButton} onPress={() => handleQuestionSelect('occupants')} disabled={isLoading}>
            <Text style={styles.questionButtonText}>👥 Occupants</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.questionButton} onPress={() => handleQuestionSelect('services')} disabled={isLoading}>
            <Text style={styles.questionButtonText}>🏠 Services</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.questionButton} onPress={() => handleQuestionSelect('contact')} disabled={isLoading}>
            <Text style={styles.questionButtonText}>📞 Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.questionButton, { backgroundColor: '#25D366', borderColor: '#25D366' }]}
            onPress={() => {
              const ownerPhone = boardingList.find(b => b._id === selectedBoarding)?.contact?.phone || '+94771234567';
              openWhatsApp(ownerPhone);
            }}
            disabled={isLoading}>
            <Text style={[styles.questionButtonText, { color: '#fff' }]}>💬 WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.questionButton} onPress={() => handleQuestionSelect('other')} disabled={isLoading}>
            <Text style={styles.questionButtonText}>❓ Other</Text>
          </TouchableOpacity>
        </View>
      </View>

      <AppFooter />
    </SafeAreaView>
  );
}

// === Styles ===
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  headerBackground: { width: '100%', height: 180 },
  headerOverlay: { flex: 1, backgroundColor: 'rgba(58, 90, 120, 0.8)', justifyContent: 'center', alignItems: 'center', padding: 15 },
  welcomeText: { color: '#fff', fontSize: 14 },
  logo: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#fff', marginTop: 5 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  backArrow: { fontSize: 24, color: '#333' },
  chatTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  chatList: { flex: 1, backgroundColor: '#f4f4f8' },
  messageContainer: { flexDirection: 'row', marginVertical: 5, paddingHorizontal: 10 },
  userMessageContainer: { justifyContent: 'flex-end' },
  botMessageContainer: { justifyContent: 'flex-start' },
  messageBubble: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, maxWidth: '80%' },
  userMessageBubble: { backgroundColor: '#007BFF' },
  botMessageBubble: { backgroundColor: '#e0e0e0' },
  userMessageText: { fontSize: 16, color: '#fff' },
  botMessageText: { fontSize: 16, color: '#000' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#f4f4f8' },
  typingText: { marginLeft: 10, fontSize: 14, color: '#555', fontStyle: 'italic' },
  selectionContainer: { backgroundColor: '#fff', padding: 15, borderTopWidth: 1, borderTopColor: '#eee' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
  boardingScroll: { marginBottom: 10 },
  boardingButton: { backgroundColor: '#f0f0f0', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, minWidth: 120, alignItems: 'center' },
  selectedBoardingButton: { backgroundColor: '#3a5a78' },
  boardingButtonText: { fontSize: 14, color: '#666', fontWeight: '500' },
  selectedBoardingButtonText: { color: '#fff' },
  questionsContainer: { backgroundColor: '#fff', padding: 15, borderTopWidth: 1, borderTopColor: '#eee' },
  questionButtonsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  questionButton: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#dee2e6', borderRadius: 12, padding: 12, width: '30%', alignItems: 'center', marginBottom: 10 },
  questionButtonText: { fontSize: 14, fontWeight: '600', color: '#495057' },
  footer: { backgroundColor: '#90b4ce', padding: 20, alignItems: 'center' },
  footerText: { color: '#fff', fontSize: 14 },
});
