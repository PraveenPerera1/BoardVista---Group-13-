import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { boardingService } from '../services/boardingService';

// --- Types (Matching MongoDB Schema) ---
interface BoardingPlace {
  _id: string;
  title: string;
  address: {
    street: string;
    city: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  price: {
    monthly: number;
    deposit: number;
  };
  gender: string;
  facilities: string[];
  roomTypes: {
    name: string;
    capacity: number;
    available: number;
    price: number;
  }[];
  images: {
    url: string;
  }[];
  isVerified: boolean;
  averageRating: number;
  reviewCount: number;
  isAvailable: boolean;
}

const CATEGORIES = ['All', 'Male', 'Female'];

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

export default function BoardVistaDashboard() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [boardingData, setBoardingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  // Ref for smooth scrolling
  const scrollViewRef = useRef<ScrollView>(null);

  // Fetch boarding data from API
  useEffect(() => {
    fetchBoardingData();
  }, []);

  const fetchBoardingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await boardingService.getAllBoardings();
      setBoardingData(response.data || []);
    } catch (err) {
      console.error('Error fetching boarding data:', err);

      Alert.alert('Error', 'Failed to load boarding places. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleScrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleScrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleNavigateToReview = () => {
    // Logic to navigate to Review Page (e.g., navigation.navigate('Reviews'))
    navigation.navigate("ReviewPage");
    console.log("Navigate to Reviews");
  };

  // --- Components ---

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View>
        <Text style={styles.appTitle}>BoardVista</Text>
        <View style={styles.locationPill}>
          <Ionicons name="location-sharp" size={16} color="#444" />
          <Text style={styles.locationText}>Vavuniya, SL</Text>
        </View>
      </View>
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search boarding places..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <TouchableOpacity style={styles.filterButton}>
        <Ionicons name="options-outline" size={20} color="#000" />
      </TouchableOpacity>
    </View>
  );

  const renderCategories = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
      {CATEGORIES.map((cat, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.categoryChip,
            selectedCategory === cat && styles.categoryChipActive
          ]}
          onPress={() => setSelectedCategory(cat)}
        >
          <Text style={[
            styles.categoryText,
            selectedCategory === cat && styles.categoryTextActive
          ]}>
            {cat}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderBoardingCard = (item: any) => (
    <TouchableOpacity 
      key={item._id} 
      style={styles.card} 
      activeOpacity={0.9}
      onPress={() => (navigation as any).push('UserDashboard' as any, { boardingId: item._id } as any)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: item.images?.[0]?.url || 'https://picsum.photos/seed/boarding/400/300'
          }}
          style={styles.cardImage}
        />
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>LKR {item.price.monthly}/mo</Text>
        </View>
        {item.isVerified && (
          <View style={styles.verifiedBadge}>
            <MaterialIcons name="verified" size={16} color="#4285F4" />
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.cardLocation}>
          <Ionicons name="location-outline" size={14} color="#888" />
          <Text style={styles.cardLocationText} numberOfLines={1}>
            {item.address.street}, {item.address.city}
          </Text>
        </View>
        {item.averageRating > 0 && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFA500" />
            <Text style={styles.ratingText}>{item.averageRating.toFixed(1)}</Text>
            <Text style={styles.reviewCountText}>({item.reviewCount})</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Filter boarding data based on category and search
  const filteredBoardingData = boardingData.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.gender === selectedCategory.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.address.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#d61010ff" />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Section */}
        {renderHeader()}

        <Text style={styles.heroTitle}>Discover{'\n'}Your New Boarding</Text>

        {renderSearchBar()}
        {renderCategories()}

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2A7FFF" />
            <Text style={styles.loadingText}>Loading boarding places...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchBoardingData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Listings Grid */}
        {!loading && !error && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Nearby Boarding Places ({filteredBoardingData.length})
              </Text>
            </View>

            {filteredBoardingData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No boarding places found</Text>
                <Text style={styles.emptySubText}>Try adjusting your filters</Text>
              </View>
            ) : (
              <View style={styles.gridContainer}>
                {filteredBoardingData.map(renderBoardingCard)}
              </View>
            )}
          </>
        )}

        {/* --- Bottom Section (Target for Scroll) --- */}
        <View style={styles.bottomSection}>
          <View style={styles.divider} />

          <Text style={styles.bottomHeader}>About BoardVista</Text>
          <Text style={styles.bottomText}>
            BoardVista is dedicated to helping University of Vavuniya students find safe, affordable, and verified boarding places.
          </Text>

          <Text style={styles.bottomHeader}>Contact Us</Text>
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={20} color="#555" />
            <Text style={styles.contactText}>+94 77 123 4567</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={20} color="#555" />
            <Text style={styles.contactText}>support@boardvista.lk</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="location-outline" size={20} color="#555" />
            <Text style={styles.contactText}>Faculty of Applied Science, Vavuniya</Text>
          </View>
          
          {/* Spacer for Floating Nav Visibility */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* --- Floating Navigation Bar --- */}
      <View style={styles.floatingNavContainer}>
        <View style={styles.floatingNav}>
          <TouchableOpacity style={styles.navItem} onPress={handleScrollToTop}>
            <View style={[styles.navIconWrapper, styles.activeNavWrapper]}>
              <Ionicons name="home" size={24} color="#fff" />
            </View>
            <Text style={styles.navLabelActive}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={handleNavigateToReview}>
            <Ionicons name="chatbox-ellipses-outline" size={24} color="#888" />
            <Text style={styles.navLabel}>Review</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={handleScrollToBottom}>
            <Ionicons name="people-outline" size={24} color="#888" />
            <Text style={styles.navLabel}>Contact</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={handleScrollToBottom}>
            <Ionicons name="information-circle-outline" size={24} color="#888" />
            <Text style={styles.navLabel}>About</Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a8ccddff',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: 12,
    color: '#444',
    marginLeft: 4,
    fontWeight: '500',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 50,
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 20,
    marginBottom: 20,
    lineHeight: 36,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 16,
    paddingLeft: 45,
    paddingRight: 15,
    fontSize: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    color: '#333',
  },
  searchIcon: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: '#1A1A1A', // Dark theme for contrast
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  categoryList: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  categoryChipActive: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    height: 140,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  priceTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
  },
  cardContent: {
    padding: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333',
    marginLeft: 4,
  },
  reviewCountText: {
    fontSize: 10,
    color: '#888',
    marginLeft: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLocationText: {
    fontSize: 11,
    color: '#888',
    marginLeft: 4,
  },
  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2A7FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  // --- Bottom Section Styles ---
  bottomSection: {
    padding: 25,
    backgroundColor: '#fff',
    marginTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  divider: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    borderRadius: 2,
    marginBottom: 20,
  },
  bottomHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 20,
    marginBottom: 10,
  },
  bottomText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
  },
  // --- Floating Nav Styles ---
  floatingNavContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  floatingNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    width: width * 0.85,
    height: 70,
    borderRadius: 35,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    paddingHorizontal: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrapper: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  activeNavWrapper: {
    backgroundColor: '#2A7FFF', // Bright blue for active state
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
  },
  navLabelActive: {
    fontSize: 10,
    color: '#2A7FFF',
    fontWeight: '700',
    display: 'none', // Hide text for active item if you prefer just the icon
  },
});