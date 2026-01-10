import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { boardingService } from '../services/boardingService';

// Get screen dimensions
const { width } = Dimensions.get('window');

// A helper component for the info grid (Icon component removed)
const InfoBlock = ({ iconName, title, value }) => (
  <View style={styles.infoBlock}>
    {/* Icon replaced with text placeholder */}
    <Text style={styles.iconPlaceholder}>[{iconName}]</Text>
    <View style={styles.infoTextContainer}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

// Helper component for star rating (Icon components removed)
const StarRating = ({ rating }) => {
  return (
    <View style={styles.starsContainer}>
      {/* Replaced star icons with simple text */}
      <Text style={styles.starText}>{rating.toFixed(1)} Stars</Text>
    </View>
  );
};

export default function UserDashboard() {
  const [boarding, setBoarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { boardingId } = useLocalSearchParams();

  useEffect(() => {
    if (boardingId) {
      fetchBoardingDetails(boardingId);
    } else {
      setError('No boarding ID provided');
      setLoading(false);
    }
  }, [boardingId]);

  const fetchBoardingDetails = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await boardingService.getBoardingById(id);
      setBoarding(data);
    } catch (err) {
      setError('Failed to load boarding details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
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
      <ScrollView style={styles.container}>
        {/* === HEADER === */}
        <ImageBackground
          source={require("../assets/images/background.jpg")} // Placeholder
          style={styles.headerBackground}>
          <View style={styles.headerOverlay}>
            <View style={styles.topBar}>
              <TouchableOpacity>
                {/* Icon removed */}
                <Text style={styles.headerIconText}>[Menu]</Text>
              </TouchableOpacity>
              <View style={styles.userContainer}>
                {/* Icon removed */}
                <Text style={styles.headerIconText}>[User]</Text>
                <Text style={styles.headerText}>Hi, User!</Text>
                <TouchableOpacity>
                  {/* Icon removed */}
                  <Text style={styles.headerIconText}>[Exit]</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.logo}>BOARDVISTA</Text>
            <Text style={styles.subtitle}>
              Discover the Best Stays in Vavuniya
            </Text>
            <View style={styles.navLinks}>
              <Text style={styles.navLink}>Home</Text>
              <Text style={styles.navLink}>About Us</Text>
              <Text style={styles.navLink}>Reviews</Text>
              <Text style={styles.navLink}>Contact Us</Text>
            </View>
          </View>
        </ImageBackground>

        {/* === FILTER BAR === */}
        <View style={styles.filterBar}>
          {/* Icon removed */}
          <Text style={styles.filterIconText}>[Filter]</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Text>By Distance</Text>
            {/* Icon removed */}
            <Text style={styles.filterIconText}>[v]</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text>By Price</Text>
            {/* Icon removed */}
            <Text style={styles.filterIconText}>[v]</Text>
          </TouchableOpacity>
        </View>

        {/* === MAIN CONTENT (2-Column) === */}
        <View style={styles.mainContent}>
          {/* --- LEFT COLUMN --- */}
          <ScrollView style={styles.leftColumn}>
            <TouchableOpacity style={styles.backButton}>
              {/* Icon removed */}
              <Text style={styles.backButtonText}>[← Back]</Text>
            </TouchableOpacity>

            {/* Image Carousel */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}>
              <Image
                source={{ uri: 'https://picsum.photos/seed/room1/200/150' }}
                style={styles.carouselImage}
              />
              <Image
                source={{ uri: 'https://picsum.photos/seed/room2/200/150' }}
                style={styles.carouselImage}
              />
              <Image
                source={{ uri: 'https://picsum.photos/seed/room3/200/150' }}
                style={styles.carouselImage}
              />
            </ScrollView>

            {/* Listing Details */}
            <View style={styles.detailsContainer}>
              <Text style={styles.listingTitle}>
                {currentBoarding?.title || 'Boarding Name'}
              </Text>
              <Text style={styles.listingAddress}>
                {currentBoarding?.address?.street ? `${currentBoarding.address.street}, ${currentBoarding.address.city}` : 'Address not available'}
              </Text>

              {/* Info Grid */}
              <View style={styles.infoGrid}>
                <InfoBlock 
                  iconName="Rent" 
                  title="Rent" 
                  value={currentBoarding?.price?.monthly ? `Rs. ${currentBoarding.price.monthly} / mo` : 'Rent not specified'} 
                />
                <InfoBlock
                  iconName="Cap"
                  title="Capacity"
                  value={currentBoarding?.roomTypes?.[0]?.capacity ? `${currentBoarding.roomTypes[0].capacity} persons` : 'Capacity not specified'}
                />
                <InfoBlock
                  iconName="Owner"
                  title="Gender"
                  value={currentBoarding?.gender || 'Gender not specified'}
                />
                <InfoBlock
                  iconName="Fac"
                  title="Facilities"
                  value={currentBoarding?.facilities?.join(', ') || 'Facilities not specified'}
                />
                <InfoBlock
                  iconName="Avail"
                  title="Availability"
                  value={currentBoarding?.isAvailable ? 'Available' : 'Not Available'}
                />
                <InfoBlock 
                  iconName="Type" 
                  title="Verified" 
                  value={currentBoarding?.isVerified ? 'Verified' : 'Not Verified'} 
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={styles.actionButton}>
                  {/* Icon removed */}
                  <Text style={styles.actionButtonText}>[♥] Save to Favorites</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  {/* Icon removed */}
                  <Text style={styles.actionButtonText}>[📞] Contact Owner</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.innerFooter}>
                © 2025 Boardvista | All Rights Reserved
              </Text>
            </View>
          </ScrollView>

          {/* --- RIGHT COLUMN --- */}
          <ScrollView style={styles.rightColumn}>
            {/* Ratings Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Ratings & Review</Text>
                {/* Icon removed */}
                <Text style={styles.filterIconText}>[→]</Text>
              </View>
              <Text style={styles.ratingValue}>4.0</Text>
              <StarRating rating={4} />
              <TextInput
                style={styles.textInput}
                placeholder="Write a review"
                placeholderTextColor="#999"
              />
            </View>

            {/* Complains Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Complains</Text>
              <TextInput
                style={[styles.textInput, { height: 80 }]}
                placeholder="Write here!"
                placeholderTextColor="#999"
                multiline
              />
              <TouchableOpacity style={styles.submitButton}>
                <Text style={styles.submitButtonText}>SUBMIT</Text>
              </TouchableOpacity>
            </View>

            {/* FAQ Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>FAQ</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Write here!"
                placeholderTextColor="#999"
              />
              {/* FAQ Placeholders */}
              <View style={styles.faqPlaceholder}>
                <View style={styles.faqTextLineLong} />
                <View style={styles.faqTextLineShort} />
              </View>
              <View style={styles.faqPlaceholder}>
                <View style={styles.faqTextLineLong} />
                <View style={styles.faqTextLineShort} />
              </View>
            </View>
          </ScrollView>
        </View>

        {/* === BOTTOM FOOTER === */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 BoardVista</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// === STYLESHEET ===
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  // Header
  headerBackground: {
    width: '100%',
    height: 220,
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(58, 90, 120, 0.8)',
    alignItems: 'center',
    padding: 15,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  headerText: {
    color: '#fff',
    marginHorizontal: 8,
    fontSize: 14,
  },
  headerIconText: {
    color: '#fff',
    fontSize: 16,
    marginHorizontal: 5,
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  navLinks: {
    flexDirection: 'row',
    marginTop: 20,
  },
  navLink: {
    color: '#fff',
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  // Filter Bar
  filterBar: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  filterIconText: {
    color: '#333',
    marginLeft: 5,
  },
  // Main Content
  mainContent: {
    flexDirection: 'row',
    flex: 1,
  },
  leftColumn: {
    flex: 2,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  rightColumn: {
    flex: 1,
    backgroundColor: '#f4f4f8',
    padding: 10,
  },
  backButton: {
    padding: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007BFF',
  },
  // Left Column: Listing Details
  carousel: {
    paddingLeft: 15,
    marginBottom: 15,
  },
  carouselImage: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginRight: 10,
  },
  detailsContainer: {
    paddingHorizontal: 15,
  },
  listingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  listingAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginBottom: 20,
  },
  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoBlock: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconPlaceholder: {
    fontSize: 16,
    color: '#333',
    marginRight: 10, // Replaced icon's space
  },
  infoTextContainer: {
    flex: 1, // Allow text to wrap
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  infoValue: {
    fontSize: 14,
    color: '#555',
  },
  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  actionButtonText: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  innerFooter: {
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
    color: '#aaa',
    fontSize: 12,
  },
  // Right Column: Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  starText: {
    fontSize: 16,
    color: '#666',
  },
  textInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  faqPlaceholder: {
    marginTop: 15,
  },
  faqTextLineLong: {
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginBottom: 8,
    width: '90%',
  },
  faqTextLineShort: {
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    width: '60%',
  },
  // Footer
  footer: {
    backgroundColor: '#90b4ce',
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
  },
  // Loading and Error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});