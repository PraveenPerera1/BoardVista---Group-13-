import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
    Alert,
    ImageBackground,
    Pressable,
    SafeAreaView,
    ScrollView,
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

// --- Header Component (Updated with ImageBackground) ---
const Header = () => {
  return (
    <ImageBackground
      source={require("../assets/images/background.jpg")} // Placeholder
      style={styles.headerBackground}
      imageStyle={styles.headerImage}
    >
      <View style={styles.headerOverlay}>
        <Text style={styles.headerWelcome}>WELCOME BACK</Text>
        <Text style={styles.headerTitle}>BOARDVISTA</Text>
        <Text style={styles.headerSubtitle}>Discover the Best Stays in Vavuniya</Text>
      </View>
    </ImageBackground>
  );
};

// --- Footer Component (Internal) ---
const Footer = () => {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>© 2025 BoardVista • All Rights Reserved</Text>
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

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    try {
      setLoading(true);
      const response = await userService.forgotPassword(email);
      
      if (response.success) {
        Alert.alert(
          'Password Reset Email Sent',
          'Please check your email for instructions to reset your password.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to send reset email. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

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
      
      console.log(" LOGIN RESPONSE STRUCTURE:", JSON.stringify(response, null, 2));
      console.log(" response.token exists:", !!response.token);
      console.log(" response.success:", response.success);
      console.log(" response.isAdmin:", !!response.isAdmin);
      
      // Check multiple possible token locations in response
      const token = response.token || response.data?.token || response.user?.token;
      const isAdmin = response.isAdmin || response.data?.isAdmin || response.user?.isAdmin;
      console.log(" EXTRACTED TOKEN:", !!token);
      console.log(" EXTRACTED ISADMIN:", !!isAdmin);
      
      if (token) {
        console.log(" STARTING TOKEN SAVE...");
        console.log(" Token to save:", token.substring(0, 20) + "...");

        // 1. WEB STORAGE (Primary for web platform)
        if (typeof window !== 'undefined' && window.localStorage) {
           try {
             window.localStorage.setItem('authToken', token);
             window.localStorage.setItem('userRole', isAdmin ? 'admin' : 'user');
             window.localStorage.setItem('isAdmin', isAdmin.toString());
             console.log(" SAVED TO BROWSER LOCAL STORAGE"); 
             
             // Verify immediately
             const verifyToken = window.localStorage.getItem('authToken');
             console.log(" Verification - LocalStorage now has:", verifyToken?.substring(0, 20) + "...");
             console.log(" Verification - Token length:", verifyToken?.length);
             if (!verifyToken) {
               console.error(" CRITICAL: Token not found in localStorage immediately after save!");
             }
           } catch (e) {
             console.error(" Browser localStorage save failed", e);
           }
        }

        // 2. FALLBACK: SessionStorage for web
        if (typeof window !== 'undefined' && window.sessionStorage) {
           try {
             window.sessionStorage.setItem('authToken', token);
             window.sessionStorage.setItem('userRole', isAdmin ? 'admin' : 'user');
             window.sessionStorage.setItem('isAdmin', isAdmin.toString());
             console.log(" SAVED TO SESSION STORAGE (fallback)"); 
           } catch (e) {
             console.error(" SessionStorage save failed", e);
           }
        }

        // 3. ASYNC STORAGE (For mobile platform)
        try {
          await AsyncStorage.setItem('authToken', token);
          await AsyncStorage.setItem('userRole', isAdmin ? 'admin' : 'user');
          await AsyncStorage.setItem('isAdmin', isAdmin.toString());
          console.log(" SAVED TO ASYNC STORAGE");
          
          // Verify it was saved
          const verifyToken = await AsyncStorage.getItem('authToken');
          console.log(" Verification - AsyncStorage now has:", verifyToken?.substring(0, 20) + "...");
        } catch (e) {
          console.error(" AsyncStorage failed", e);
        }
      }
      
      // Add a longer delay to ensure token is properly saved across all storage mechanisms
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Final verification - check if token is actually stored
      let finalVerification = false;
      if (typeof window !== 'undefined' && window.localStorage) {
        const finalToken = window.localStorage.getItem('authToken');
        const finalIsAdmin = window.localStorage.getItem('isAdmin') === 'true';
        finalVerification = !!finalToken;
        console.log(" FINAL VERIFICATION - Token in localStorage:", finalVerification);
        console.log(" FINAL VERIFICATION - IsAdmin in localStorage:", finalIsAdmin);
      }
      
      if (!finalVerification && typeof window !== 'undefined' && window.sessionStorage) {
        const finalToken = window.sessionStorage.getItem('authToken');
        const finalIsAdmin = window.sessionStorage.getItem('isAdmin') === 'true';
        finalVerification = !!finalToken;
        console.log(" FINAL VERIFICATION - Token in sessionStorage:", finalVerification);
        console.log(" FINAL VERIFICATION - IsAdmin in sessionStorage:", finalIsAdmin);
      }
      
      if (!finalVerification) {
        const asyncToken = await AsyncStorage.getItem('authToken');
        const asyncIsAdmin = await AsyncStorage.getItem('isAdmin') === 'true';
        finalVerification = !!asyncToken;
        console.log(" FINAL VERIFICATION - Token in AsyncStorage:", finalVerification);
        console.log(" FINAL VERIFICATION - IsAdmin in AsyncStorage:", asyncIsAdmin);
      }
      
      if (!finalVerification) {
        console.error(" CRITICAL: Token verification failed after all storage attempts!");
        Alert.alert('Error', 'Login succeeded but token storage failed. Please try again.');
        return;
      }
      
      console.log('Login successful:', response);
      Alert.alert('Success', 'Login successful!');
      
      // Redirect based on admin status
      if (isAdmin) {
        console.log(" REDIRECTING TO ADMIN AREA");
        navigation.replace("AdminLanding");
      } else {
        console.log(" REDIRECTING TO DASHBOARD");
        navigation.replace("Dashboard");
      }

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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Header />

        {/* Form Card */}
        <View style={styles.formCard}>
          
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={back}>
            <Icon name="arrow-back" size={20} color="#475569" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>User Login</Text>
            <Text style={styles.subtitle}>Sign in to find your perfect stay</Text>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>University Email</Text>
            <TextInput
              style={styles.input}
              placeholder="abc@vau.ac.lk"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable 
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.eyeIcon}
              >
                <Icon
                  name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#64748B"
                />
              </Pressable>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

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

        </View>

        {/* Footer Section */}
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
};

// --- MODERN STYLESHEET ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Slate 50
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  
  // Header
  headerBackground: {
    width: '100%',
    height: 260,
    justifyContent: 'center',
    marginBottom: -50, // Pull card up into header
    zIndex: 0,
  },
  headerImage: {
    opacity: 0.8,
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)', // Dark Slate Overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 60,
  },
  headerWelcome: {
    color: '#94A3B8', // Slate 400
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E2E8F0',
    marginTop: 6,
    fontWeight: '500',
  },

  // Form Card
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 24,
    // Soft Shadow
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
  },
  
  // Back Button
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 20,
  },
  backText: {
    marginLeft: 4,
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },

  // Titles
  headerTextContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B', // Slate 800
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B', // Slate 500
  },

  // Inputs
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155', // Slate 700
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F8FAFC', // Very light grey
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  
  // Password Specific
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1E293B',
  },
  eyeIcon: {
    padding: 14,
  },

  // Actions
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    paddingVertical: 5,
  },
  forgotPasswordText: {
    color: '#2563EB', // Brand Blue
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#2563EB', // Brand Blue
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  loginButtonDisabled: {
    backgroundColor: '#94A3B8',
    elevation: 0,
    shadowOpacity: 0,
  },

  // Footer
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default UserLoginPage;