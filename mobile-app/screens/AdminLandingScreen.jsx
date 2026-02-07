import { useNavigation } from '@react-navigation/native';
import {
    ImageBackground,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import AdminProtectedRoute from '../components/AdminProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

// --- Header Component ---
const AppHeader = () => (
  <ImageBackground
    source={require("../assets/images/background.jpg")}
    style={styles.headerBackground}
    imageStyle={styles.headerImage}
  >
    <View style={styles.headerOverlay}>
      <Text style={styles.welcomeText}>ADMIN PANEL</Text>
      <Text style={styles.logo}>BOARDVISTA</Text>
      <Text style={styles.subtitle}>Manage your platform</Text>
    </View>
  </ImageBackground>
);

// --- Footer Component ---
const AppFooter = () => (
  <View style={styles.footer}>
    <Text style={styles.footerText}>© 2025 BoardVista • All Rights Reserved</Text>
  </View>
);

export default function AdminLandingScreen() {
  const navigation = useNavigation();
  const { isAdmin } = useAuth();

  const backToHome = () => {
    navigation.replace("HomePage");
  };

  return (
    <AdminProtectedRoute>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AppHeader />
          
          {/* --- Admin Options Card --- */}
          <View style={styles.formCard}>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.sectionSubtitle}>Choose an administrative action</Text>

            {/* Admin Options */}
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={styles.optionButton}
                onPress={() => navigation.navigate("AdminBoardings")}
              >
                <Text style={styles.optionText}> Manage Boardings</Text>
                <Text style={styles.optionDescription}>View and delete all boarding listings</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.optionButton}
                onPress={() => navigation.navigate("AdminUsers")}
              >
                <Text style={styles.optionText}> Manage Users</Text>
                <Text style={styles.optionDescription}>Block/unblock user accounts</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={backToHome}>
            <Text style={styles.backButtonText}>← Back to Home</Text>
          </TouchableOpacity>

          <AppFooter />
        </ScrollView>
      </SafeAreaView>
    </AdminProtectedRoute>
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
    marginTop: 5,
    fontWeight: '500',
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

  // Admin Options
  optionsContainer: {
    marginTop: 20,
  },
  optionButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },

  // Navigation
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 10,
  },
  backButtonText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
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
