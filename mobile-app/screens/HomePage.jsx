import { useNavigation } from '@react-navigation/native';
import { Dimensions, Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Get screen width for responsive image sizing
const { width } = Dimensions.get('window');
// Calculate width for 3 images with 10px spacing
// Preserving your logic exactly
const imageWidth = (width - 48 - 20) / 3; // Adjusted padding slightly for modern layout

export default function HomePage()  {
  const navigation = useNavigation();
  
  const UserLoginHandler = ()=>{
      navigation.replace("UserLoginPage");
  }
  const OwnerloginHandler = ()=>{
    navigation.replace("OwnerLoginPage");
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* === HERO HEADER === */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerLogo}>BOARDVISTA</Text>
            <View style={styles.taglineContainer}>
              <Text style={styles.headerTagline}>Discover the Best Stays in Vavuniya</Text>
            </View>
          </View>
          {/* Decorative Circle for visual flair */}
          <View style={styles.decorativeCircle} />
        </View>

        {/* === MAIN CONTENT === */}
        <View style={styles.mainContent}>
          
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeLabel}>WELCOME</Text>
            <Text style={styles.mainHeading}>Find your space.{'\n'}Live your dream.</Text>
          </View>

          {/* === FEATURED GALLERY === */}
          <View style={styles.galleryCard}>
            <View style={styles.imageRow}>
              <View style={styles.imageWrapper}>
                <Image source={require("../assets/images/boardingimg1.jpg")} style={[styles.galleryImage, { width: imageWidth }]} />
              </View>
              <View style={styles.imageWrapper}>
                <Image source={require("../assets/images/boardingimg2.jpeg")} style={[styles.galleryImage, { width: imageWidth }]} />
              </View>
              <View style={styles.imageWrapper}>
                <Image source={require("../assets/images/boardingimg3.jpeg")} style={[styles.galleryImage, { width: imageWidth }]} />
              </View>
            </View>
            
            <View style={styles.quoteContainer}>
               <Text style={styles.quoteText}>
                 "From budget-friendly rooms to premium spaces, BoardVista makes boarding simple, smart, and stress-free."
               </Text>
            </View>
          </View>

          {/* === LOGIN SECTION === */}
          <View style={styles.loginSection}>
            <Text style={styles.sectionTitle}>Start Your Journey</Text>
            <Text style={styles.sectionSubtitle}>Select your role to continue</Text>

            <View style={styles.buttonGrid}>
              {/* Student Button */}
              <TouchableOpacity style={styles.roleCard} onPress={UserLoginHandler}>
                <View style={styles.iconCircle}>
                   <Text style={styles.iconText}>🎓</Text>
                </View>
                <Text style={styles.roleTitle}>Student / Staff</Text>
                <Text style={styles.roleDesc}>Find your perfect place</Text>
                <Text style={styles.arrowText}>→</Text>
              </TouchableOpacity>

              {/* Owner Button */}
              <TouchableOpacity style={[styles.roleCard, styles.ownerCard]} onPress={OwnerloginHandler}>
                 <View style={[styles.iconCircle, styles.ownerIconCircle]}>
                   <Text style={styles.iconText}>🏠</Text>
                </View>
                <Text style={styles.roleTitle}>House Owner</Text>
                <Text style={styles.roleDesc}>List your property</Text>
                <Text style={styles.arrowText}>→</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.registerLink} onPress={() => navigation.replace("RegistrationPage")}>
              <Text style={styles.registerText}>
                Don't have an account? <Text style={styles.registerHighlight}>Register Now</Text>
              </Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* === FOOTER === */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 BoardVista • All Rights Reserved</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// === MODERN STYLESHEET ===
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Slate 50 - Very light grey/white
  },
  scrollContainer: {
    flexGrow: 1,
  },
  
  // --- Header ---
  header: {
    backgroundColor: '#0F172A', // Slate 900 - Deep Navy
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  decorativeCircle: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerContent: {
    zIndex: 1,
  },
  headerLogo: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  taglineContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  headerTagline: {
    color: '#E2E8F0', // Slate 200
    fontSize: 14,
    fontWeight: '500',
  },

  // --- Main Content ---
  mainContent: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeLabel: {
    color: '#64748B', // Slate 500
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  mainHeading: {
    color: '#1E293B', // Slate 800
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
  },

  // --- Gallery Card ---
  galleryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 30,
    
    // Shadow
    elevation: 4,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  imageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    // Little shadow for each image
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  galleryImage: {
    height: 100,
    resizeMode: 'cover',
    backgroundColor: '#CBD5E1', // Placeholder color
  },
  quoteContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 15,
  },
  quoteText: {
    color: '#475569', // Slate 600
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },

  // --- Login Section ---
  loginSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0b377cff',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
  buttonGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleCard: {
    backgroundColor: '#a8e6e0ff',
    width: '48%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
    // Shadow
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ownerCard: {
     // Optional visual distinction
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF', // Light Blue
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  ownerIconCircle: {
    backgroundColor: '#F0FDF4', // Light Green
  },
  iconText: {
    fontSize: 20,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293bd2',
    marginBottom: 4,
  },
  roleDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 10,
  },
  arrowText: {
    fontSize: 18,
    color: '#3B82F6',
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    marginTop: 'auto',
  },

  // --- Registration Link ---
  registerLink: {
    marginTop: 25,
    alignItems: 'center',
    paddingVertical: 10,
  },
  registerText: {
    color: '#64748B',
    fontSize: 14,
  },
  registerHighlight: {
    color: '#2563EB', // Brand Blue
    fontWeight: '700',
  },

  // --- Footer ---
  footer: {
    marginTop: 'auto',
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F1F5F9', // Slightly darker than background
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
});