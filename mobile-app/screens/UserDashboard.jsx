import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { boardingService } from '../services/boardingService';

// Get screen dimensions
const { width } = Dimensions.get('window');

// A helper component for the info grid
const InfoBlock = ({ iconName, title, value }) => (
  <View style={styles.infoBlock}>
    <View style={styles.iconContainer}>
      {/* Styled placeholder to look like an icon badge */}
      <Text style={styles.iconPlaceholder}>{iconName.substring(0, 2).toUpperCase()}</Text>
    </View>
    <View style={styles.infoTextContainer}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

// Helper component for star rating
const StarRating = ({ rating }) => {
  return (
    <View style={styles.starsContainer}>
      <Text style={styles.starText}>★ {rating.toFixed(1)}</Text>
      <Text style={styles.starLabel}>Average Rating</Text>
    </View>
  );
};

export default function UserDashboard() {
  
  const navigation = useNavigation();
  const [boarding, setBoarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const route = useRoute();
  const boardingId = route?.params?.boardingId;

  const loginpageHandler = () => {
    navigation.navigate("Dashboard");
  }

  useEffect(() => {
    console.log('UserDashboard useEffect - boardingId:', boardingId);
    if (boardingId) {
      fetchBoardingDetails(boardingId);
    } else {
      console.error('No boarding ID provided in route params');
      setError('No boarding ID provided');
      setLoading(false);
    }
  }, [boardingId]);

  const fetchBoardingDetails = async (id) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching boarding details for ID:', id);
      const data = await boardingService.getBoardingById(id);
      console.log('Received boarding data:', data);
      
      // Handle different response formats
      let boardingData = null;
      if (data && data.boardingHouse) {
        boardingData = data.boardingHouse;
      } else if (data && data.data) {
        boardingData = data.data;
      } else {
        boardingData = data;
      }
      
      console.log('Processed boarding data:', boardingData);
      setBoarding(boardingData);
    } catch (err) {
      setError('Failed to load boarding details');
      console.error('Error fetching boarding details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading BoardVista...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchBoardingDetails(boardingId)}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentBoarding = boarding;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* === HEADER === */}
        <ImageBackground
          source={require("../assets/images/background.jpg")} // Placeholder
          style={styles.headerBackground}
          imageStyle={styles.headerBackgroundImage}
        >
          <View style={styles.headerOverlay}>
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.glassButton}>
                <Text style={styles.headerIconText}>☰</Text>
              </TouchableOpacity>
              
              <View style={styles.userPill}>
                 <Text style={styles.userAvatarText}>U</Text>
                <Text style={styles.headerText}>Hi, User!</Text>
              </View>

              <TouchableOpacity style={styles.glassButton}>
                <Text style={styles.headerIconText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.headerContent}>
              <Text style={styles.logo}>BOARDVISTA</Text>
              <Text style={styles.subtitle}>Discover the Best Stays in Vavuniya</Text>
            </View>
          </View>
        </ImageBackground>

        {/* === MAIN CONTENT === */}
        <View style={styles.mainContent}>
          
          {/* --- DETAILS SECTION (Formerly Left Column) --- */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity style={styles.backButton} onPress={loginpageHandler}>
               <Text style={styles.backButtonText}>← Back to Dashboard</Text>
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={styles.listingTitle}>
                {currentBoarding?.title || 'Luxury Boarding'}
              </Text>
              <Text style={styles.listingAddress}>
                📍 {currentBoarding?.address || 'Address not available'}
              </Text>
            </View>

            {/* Image Carousel */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContent}
              style={styles.carousel}
            >
              {currentBoarding?.images?.map((image, index) => {
                // Check if image is a blob URL (problematic) or valid URL
                const isBlobUrl = image.url?.startsWith('blob:');
                const isValidUrl = image.url && (image.url.startsWith('data:') || image.url.startsWith('http'));
                
                // Only show valid images (data URLs from file picker or HTTP URLs)
                if (isValidUrl && !isBlobUrl) {
                  return (
                    <Image 
                      key={index} 
                      source={{ uri: image.url }} 
                      style={styles.carouselImage}
                      onError={(error) => {
                        console.log('Image load error:', error.nativeEvent.error);
                      }}
                    />
                  );
                }
                
                // Skip invalid images (blob URLs, etc.) - don't show placeholders
                return null;
              }).filter(Boolean)} 
              
              {/* Show message if no valid images */}
              {(!currentBoarding?.images?.filter(img => 
                img.url && 
                !img.url.startsWith('blob:') && 
                (img.url.startsWith('data:') )
              ).length) && (
                <View style={styles.noImagesContainer}>
                  <Text style={styles.noImagesText}>No images available</Text>
                </View>
              )}
            </ScrollView>

            {/* Info Grid - Modernized */}
            <View style={styles.detailsCard}>
              <Text style={styles.sectionHeader}>Property Details</Text>
              <View style={styles.infoGrid}>
                <InfoBlock 
                  iconName="Rent" 
                  title="Monthly Rent" 
                  value={currentBoarding?.price?.monthly ? `Rs. ${currentBoarding.price.monthly}` : 'N/A'} 
                />
                <InfoBlock
                  iconName="Cap"
                  title="Capacity"
                  value={currentBoarding?.roomTypes?.[0]?.capacity ? `${currentBoarding.roomTypes[0].capacity} People` : 'N/A'}
                />
                <InfoBlock
                  iconName="Gen"
                  title="Gender"
                  value={currentBoarding?.gender || 'Unspecified'}
                />
                <InfoBlock
                  iconName="Fac"
                  title="Facilities"
                  value={currentBoarding?.facilities?.slice(0, 2).join(', ') + (currentBoarding?.facilities?.length > 2 ? '...' : '') || 'None'}
                />
                <InfoBlock
                  iconName="Avl"
                  title="Status"
                  value={currentBoarding?.isAvailable ? 'Available' : 'Full'}
                />
                <InfoBlock 
                  iconName="Ver" 
                  title="Verification" 
                  value={currentBoarding?.isVerified ? 'Verified' : 'Pending'} 
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtonsContainer}>
               {/*} <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
                  <Text style={styles.secondaryButtonText}>♥ Save</Text>
                </TouchableOpacity>*/}
              </View>
            </View>
          </View>

          {/* --- REVIEWS & INTERACTION SECTION (Formerly Right Column) --- */}
          <View style={styles.sectionContainer}>
            
            {/* Ratings Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Ratings & Reviews</Text>
                <TouchableOpacity>
                   <Text style={styles.linkText}>View All →</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.ratingHero}>
                <Text style={styles.ratingValue}>4.0</Text>
                <StarRating rating={4} />
              </View>

              <TouchableOpacity 
                onPress={() => navigation.navigate("ReviewPage", { 
                  boardingId: boardingId, 
                  boardingTitle: currentBoarding?.title || 'Boarding House' 
                })}
                style={styles.reviewInput}
              >
                <Text style={styles.reviewInputPlaceholder}>Write a review</Text>
              </TouchableOpacity>
            </View>

            

            
          </View>

        </View>

        {/* === BOTTOM FOOTER === */}
        <View style={styles.footer}>
          <Text style={styles.footerText}> BoardVista</Text>
          <Text style={styles.footerSubText}>All Rights Reserved</Text>
        </View>
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
  
  // === HEADER STYLES ===
  headerBackground: {
    width: '100%',
    height: 280,
    justifyContent: 'flex-end',
  },
  headerBackgroundImage: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)', // Dark Slate overlay
    padding: 20,
    justifyContent: 'space-between',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 30 : 0,
  },
  glassButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  userAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
    backgroundColor: '#2563EB',
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
    borderRadius: 12,
    marginRight: 8,
    fontSize: 12,
    overflow: 'hidden',
  },
  headerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerIconText: {
    color: '#fff',
    fontSize: 18,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#E2E8F0', // Slate 200
    marginTop: 5,
    fontWeight: '500',
  },

  // === MAIN LAYOUT ===
  mainContent: {
    flex: 1,
    flexDirection: 'column', // Changed from row to column for mobile
    marginTop: -30, // Pull up to overlap header slightly
    paddingHorizontal: 16,
  },
  sectionContainer: {
    marginBottom: 10,
  },

  // === DETAILS SECTION ===
  backButton: {
    marginBottom: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButtonText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  titleContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  listingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B', // Slate 800
    marginBottom: 4,
  },
  listingAddress: {
    fontSize: 15,
    color: '#64748B', // Slate 500
  },
  
  // Carousel
  carousel: {
    marginBottom: 20,
  },
  carouselContent: {
    paddingRight: 20,
  },
  carouselImage: {
    width: 280,
    height: 180,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: '#CBD5E1',
  },

  // Details Card
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    // Shadow
    elevation: 4,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoBlock: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#DBEAFE', // Light Blue
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconPlaceholder: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },

  // Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    width: '30%',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryButtonText: {
    color: '#475569',
    fontWeight: '700',
  },
  primaryButton: {
    width: '66%',
    backgroundColor: '#2563EB', // Brand Blue
    elevation: 2,
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  // === CARDS (Reviews, FAQ) ===
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: -4,
    marginBottom: 12,
  },
  linkText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Ratings Specific
  ratingHero: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 15,
  },
  ratingValue: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 48,
  },
  starsContainer: {
    alignItems: 'center',
  },
  starText: {
    fontSize: 18,
    color: '#F59E0B', // Amber
    fontWeight: 'bold',
  },
  starLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },

  // Review Input
  reviewInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  reviewInputPlaceholder: {
    color: '#94A3B8',
    fontSize: 14,
  },

  // Inputs & Form
  textInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#334155',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#0F172A', // Dark
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
 

  // FAQ Skeleton
  faqContainer: {
    marginTop: 15,
  },
  faqItem: {
    marginBottom: 12,
  },
  skeletonLineLong: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    marginBottom: 6,
    width: '90%',
  },
  skeletonLineShort: {
    height: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    width: '60%',
  },

  // No Images Container
  noImagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  noImagesText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '500',
  },

  // === FOOTER ===
  footer: {
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  footerSubText: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 4,
  },

  // Loading/Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});