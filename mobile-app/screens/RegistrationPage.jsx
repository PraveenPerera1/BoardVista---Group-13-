import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
    Alert,
    ImageBackground,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { userService } from '../services/userService';

// --- Header Component ---
const AppHeader = () => (
  <ImageBackground
    source={require("../assets/images/background.jpg")}
    style={styles.headerBackground}
    imageStyle={styles.headerImage}
  >
    <View style={styles.headerOverlay}>
      <Text style={styles.welcomeText}>JOIN THE COMMUNITY</Text>
      <Text style={styles.logo}>BOARDVISTA</Text>
      <Text style={styles.subtitle}>Create your account today</Text>
    </View>
  </ImageBackground>
);

// --- Footer Component ---
const AppFooter = () => (
  <View style={styles.footer}>
    <Text style={styles.footerText}> 2025 BoardVista • All Rights Reserved</Text>
    <Text style={styles.footerText}>© 2025 BoardVista • All Rights Reserved</Text>
  </View>
);

// --- Main Registration Screen ---
export default function RegistrationPage() {
  const navigation = useNavigation();

  const loginpageHandler = () => {
    navigation.replace("HomePage");
  }

  // State for form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); //added newly
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // State for password visibility
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  // State for custom dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userType, setUserType] = useState('Select user type...');
  const [isAdmin, setIsAdmin] = useState(false);
  const userTypes = ['User', 'Owner'];

  // Handler for selecting a user type from the custom dropdown
  const selectUserType = (type) => {
    setUserType(type);
    setDropdownOpen(false); // Close the dropdown after selection
  };

  // Registration function with API integration
  const handleRegistration = async () => {
    console.log('=== REGISTER BUTTON CLICKED ===');
    console.log('Form validation starting...');

    if (!name || !email || !phone || !password || !confirmPassword) {
      console.log('Validation failed: Missing fields');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      console.log('Validation failed: Passwords do not match');
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (userType === 'Select user type...' && !isAdmin) {
      console.log('Validation failed: No user type selected');
      Alert.alert('Error', 'Please select a user type');
      return;
    }

    console.log('Validation passed, proceeding with registration...');

    try {
      setLoading(true);
      console.log('=== REGISTRATION DEBUG ===');
      console.log('userType:', userType);
      console.log('isAdmin:', isAdmin);
      
      // Map user types to backend roles
      let role = 'user'; // default
      if (isAdmin) {
        role = 'admin';
        console.log('Setting role to admin due to isAdmin flag');
      } else if (userType === 'Owner') {
        role = 'owner';
        console.log('Setting role to owner');
      } else if (userType === 'User') {
        role = 'user';
        console.log('Setting role to user');
      }
      
      console.log('Final role being sent:', role);
      
      const registrationData = {
        name,
        email,
        password,
        role,
        phone,
        isAdmin
      };
      
      console.log('Registration data being sent:', registrationData);
      
      const response = await userService.register(registrationData);

      console.log('Registration successful:', response);
      Alert.alert('Success', 'Registration successful! Please login.');
      navigation.replace("HomePage");
    } catch (error) {
      const backendErrors = error?.response?.data?.errors;
      console.error('Registration failed response:', error?.response?.data);
      if (backendErrors && backendErrors.length > 0) {
        console.error('First validation error:', backendErrors[0]);
      }
      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        const message = backendErrors
          .map((e) => e?.msg)
          .filter(Boolean)
          .join('\n');
        Alert.alert('Registration Failed', message || 'Registration failed');
      } else {
        Alert.alert('Registration Failed', error?.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader />
        
        {/* --- Form Card --- */}
        <View style={styles.formCard}>
          
          <TouchableOpacity style={styles.backButton} onPress={loginpageHandler}>
            <Text style={styles.backArrow}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Get Started</Text>
          <Text style={styles.sectionSubtitle}>Fill in your details to continue</Text>

          {/* --- Form Fields --- */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. example"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.textInput}
              placeholder="example@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="+94 7X XXX XXXX"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* --- Password Input --- */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={securePassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setSecurePassword(!securePassword)}>
                <Text style={styles.toggleText}>
                  {securePassword ? 'Show' : 'Hide'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* --- Confirm Password Input --- */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={secureConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setSecureConfirm(!secureConfirm)}>
                <Text style={styles.toggleText}>
                  {secureConfirm ? 'Show' : 'Hide'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* --- Custom User Type Dropdown --- */}
          <View style={styles.dropdownWrapper}>
            <Text style={styles.inputLabel}>I am a:</Text>
            <TouchableOpacity
              style={[styles.dropdownButton, dropdownOpen && styles.dropdownButtonActive]}
              onPress={() => setDropdownOpen(!dropdownOpen)}>
              <Text style={[
                styles.dropdownButtonText, 
                userType === 'Select user type...' && styles.placeholderText
              ]}>
                {userType}
              </Text>
              <Text style={styles.dropdownArrow}>{dropdownOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <View style={styles.dropdownMenu}>
                {userTypes.map((type, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      index < userTypes.length - 1 && styles.itemSeparator,
                    ]}
                    onPress={() => selectUserType(type)}>
                    <Text style={styles.dropdownItemText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          {/* --- End Dropdown --- */}

          {/* --- Admin Registration Checkbox --- */}
          <View style={styles.checkboxGroup}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsAdmin(!isAdmin)}
            >
              <View style={[styles.checkbox, isAdmin && styles.checkboxChecked]}>
                {isAdmin && <Text style={styles.checkboxCheck}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Register as admin</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegistration}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => navigation.replace("HomePage")}>
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginLinkHighlight}>Log In</Text>
            </Text>
          </TouchableOpacity>

        </View>

        <AppFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

// === MODERN STYLESHEET ===
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
  },
  
  // Header
  headerBackground: {
    width: '100%',
    height: 240,
    justifyContent: 'center',
    marginBottom: -40, // Pull card up into header
    zIndex: 0,
  },
  headerImage: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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
  welcomeText: {
    color: '#94A3B8', // Slate 400
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 5,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#E2E8F0',
    marginTop: 4,
  },

  // Form Card
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 24,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  
  // Navigation
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  backArrow: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  
  // Text Styles
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B', // Slate 800
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 25,
  },

  // Inputs
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155', // Slate 700
    marginBottom: 6,
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC', // Very light grey
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0', // Slate 200
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1E293B',
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toggleText: {
    color: '#2563EB', // Brand Blue
    fontSize: 13,
    fontWeight: '600',
  },

  // Custom Dropdown
  dropdownWrapper: {
    marginTop: 5,
    marginBottom: 25,
  },
  dropdownButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dropdownButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  dropdownButtonText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#94A3B8',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#64748B',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 6,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#334155',
  },

  // Checkbox Styles
  checkboxGroup: {
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxCheck: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },

  // Action Buttons
  registerButton: {
    backgroundColor: '#2563EB', // Brand Blue
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  registerButtonDisabled: {
    backgroundColor: '#94A3B8',
    elevation: 0,
    shadowOpacity: 0,
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  loginLinkText: {
    color: '#64748B',
    fontSize: 14,
  },
  loginLinkHighlight: {
    color: '#2563EB',
    fontWeight: '700',
  },

  // Footer
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
});