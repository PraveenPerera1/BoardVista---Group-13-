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
  View,
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

  // Login function with API integration
  const handleUserLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await userService.login({ email, password, role: 'owner' });
      
      // Store token in AsyncStorage (native) or localStorage (web)
      if (response.token) {
        if (isWeb) {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('userRole', 'owner');
          console.log('Token stored in localStorage successfully');
        } else {
          await AsyncStorage.setItem('authToken', response.token);
          await AsyncStorage.setItem('userRole', 'owner');
          console.log('Token stored in AsyncStorage successfully');
        }
      }
      
      console.log('Login successful:', response);
      
      Alert.alert('Success', 'Login successful!');
      navigation.replace("Dashboard");
    } catch (error) {
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
          <Text style={styles.title}>Login as Owner</Text>
          <Text style={styles.subtitle}>(Boarding House Owner)</Text>

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