import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
// Import icon library for React Native
import Icon from 'react-native-vector-icons/Ionicons';
import { userService } from '../services/userService';

// Detect if running in web or native
const isWeb = typeof window !== 'undefined';

// --- Header Component (Internal) ---
const Header = () => {

    
  return (
    <View style={styles.header}>
      <Text style={styles.headerWelcome}>WELCOME TO</Text>
      <Text style={styles.headerTitle}>BOARDVISTA</Text>
      <Text style={styles.headerSubtitle}>Discover the Best Stays in Vavuniya</Text>
    </View>
  );
};

// --- Footer Component (Internal) ---
const Footer = () => {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}> 2025 BoardVista</Text>
    </View>
  );
};

// --- Main LoginScreen Component (React Native) ---
const UserLoginPage = () => {
  
  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // State for the password visibility toggle
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const navigation = useNavigation();
  const back = ()=>{
    navigation.replace("HomePage");
  }

 const handleUserLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await userService.login({ email, password, role: 'owner' });
      
      console.log("🔍 LOGIN RESPONSE STRUCTURE:", JSON.stringify(response, null, 2));
      console.log("🔍 response.token exists:", !!response.token);
      console.log("🔍 response.success:", response.success);
      
      // Check multiple possible token locations in response
      const token = response.token || response.data?.token || response.user?.token;
      console.log("🔍 EXTRACTED TOKEN:", !!token);
      
      if (token) {
        console.log("👉 STARTING TOKEN SAVE...");
        console.log("🔑 Token to save:", token.substring(0, 20) + "...");

        // 1. WEB STORAGE (Primary for web platform)
        if (typeof window !== 'undefined' && window.localStorage) {
           try {
             window.localStorage.setItem('authToken', token);
             window.localStorage.setItem('userRole', 'owner');
             console.log("✅ SAVED TO BROWSER LOCAL STORAGE"); 
             
             // Verify immediately
             const verifyToken = window.localStorage.getItem('authToken');
             console.log("🔍 Verification - LocalStorage now has:", verifyToken?.substring(0, 20) + "...");
             console.log("🔍 Verification - Token length:", verifyToken?.length);
             if (!verifyToken) {
               console.error("❌ CRITICAL: Token not found in localStorage immediately after save!");
             }
           } catch (e) {
             console.error("❌ Browser localStorage save failed", e);
           }
        }

        // 2. FALLBACK: SessionStorage for web
        if (typeof window !== 'undefined' && window.sessionStorage) {
           try {
             window.sessionStorage.setItem('authToken', token);
             window.sessionStorage.setItem('userRole', 'owner');
             console.log("✅ SAVED TO SESSION STORAGE (fallback)"); 
           } catch (e) {
             console.error("❌ SessionStorage save failed", e);
           }
        }

        // 3. ASYNC STORAGE (For mobile platform)
        try {
          await AsyncStorage.setItem('authToken', token);
          await AsyncStorage.setItem('userRole', 'owner');
          console.log("✅ SAVED TO ASYNC STORAGE");
          
          // Verify it was saved
          const verifyToken = await AsyncStorage.getItem('authToken');
          console.log("🔍 Verification - AsyncStorage now has:", verifyToken?.substring(0, 20) + "...");
        } catch (e) {
          console.error("❌ AsyncStorage failed", e);
        }
      }
      
      // Add a longer delay to ensure token is properly saved across all storage mechanisms
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Final verification - check if token is actually stored
      let finalVerification = false;
      if (typeof window !== 'undefined' && window.localStorage) {
        const finalToken = window.localStorage.getItem('authToken');
        finalVerification = !!finalToken;
        console.log("🔍 FINAL VERIFICATION - Token in localStorage:", finalVerification);
      }
      
      if (!finalVerification && typeof window !== 'undefined' && window.sessionStorage) {
        const finalToken = window.sessionStorage.getItem('authToken');
        finalVerification = !!finalToken;
        console.log("🔍 FINAL VERIFICATION - Token in sessionStorage:", finalVerification);
      }
      
      if (!finalVerification) {
        const asyncToken = await AsyncStorage.getItem('authToken');
        finalVerification = !!asyncToken;
        console.log("🔍 FINAL VERIFICATION - Token in AsyncStorage:", finalVerification);
      }
      
      if (!finalVerification) {
        console.error("❌ CRITICAL: Token verification failed after all storage attempts!");
        Alert.alert('Error', 'Login succeeded but token storage failed. Please try again.');
        return;
      }
      
      console.log('Login successful:', response);
      Alert.alert('Success', 'Login successful!');
      navigation.replace("Dashboard");

    } catch (error) {
      console.log("Login Error:", error);
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const UserDashboardHandler = ()=>{
    navigation.replace("Dashboard");
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Set status bar text to light for the dark header */}
      <StatusBar barStyle="light-content" />

      {/* Header Section */}
      <Header />

      {/* Form Area Section */}
      <View style={styles.formArea}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={back}>
          {/* Use Icon component */}
          <Icon name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>

        {/* Form Content */}
        <View style={styles.formContent}>
          <Text style={styles.title}>Login as user</Text>
          

          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder="abc@vau.ac.lk"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* Password Input */}
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="password"
              placeholderTextColor="#888"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
            />
            {/* Toggle Visibility Icon */}
            <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              {/* Use Icon component */}
              <Icon
                name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                size={24}
                color="#555"
                style={styles.eyeIcon}
              />
            </Pressable>
          </View>

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleUserLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity>
            <Text style={styles.forgotPasswordText}>Forgot password</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer Section */}
      <Footer />
    </SafeAreaView>
  );
};

// --- Stylesheet (React Native) ---
// Use StyleSheet.create for performance optimizations
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAEAEA', // Main light-gray background
  },
  // Header
  header: {
    backgroundColor: '#000033', // Dark navy blue
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerWelcome: {
    color: '#FFF',
    fontSize: 16,
    opacity: 0.9,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: '#FFF',
    fontSize: 16,
    opacity: 0.9,
    marginTop: 4,
  },
  // Form
  formArea: {
    flex: 1, // Takes up the remaining space
    backgroundColor: '#EAEAEA', // Light gray background
    position: 'relative', // Needed for absolute positioning of back button
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1, // Make sure it's clickable
  },
  formContent: {
    padding: 30,
    marginTop: 40, // Give space for the back button
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  // Password Input Row
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 24,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 14,
  },
  // Buttons
  loginButton: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 30, // Pill shape
    alignItems: 'center',
    marginBottom: 20,
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  forgotPasswordText: {
    color: '#007AFF', // Standard link blue
    fontSize: 16,
    textAlign: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  // Footer
  footer: {
    backgroundColor: '#50A8D8', // Light blue
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#FFF',
    fontSize: 14,
  },
});

export default UserLoginPage;