import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { boardingService } from '../services/boardingService';

// --- Types (Matching MongoDB Schema) ---
interface BoardingPlace {
  _id: string;
  title: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  contact: {
    email: string;
    phone: string;
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
  description: string;
  nearbyServices: string;
  isVerified: boolean;
  isAvailable: boolean;
  owner?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = ['All', 'Male', 'Female'];

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

export default function BoardVistaDashboard() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [boardingData, setBoardingData] = useState<BoardingPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
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
      console.log('Boarding data received:', response);
      
      // Extract the boarding array from the response
      let boardingArray = [];
      if (Array.isArray(response)) {
        boardingArray = response;
      } else if (response && response.boardingHouses) {
        boardingArray = response.boardingHouses;
      } else if (response && Array.isArray(response.data)) {
        boardingArray = response.data;
      } else if (response && response.data && response.data.boardingHouses) {
        boardingArray = response.data.boardingHouses;
      } else if (response && response.data && Array.isArray(response.data.data)) {
        boardingArray = response.data.data;
      }
      
      console.log('Extracted boarding array:', boardingArray);
      setBoardingData(boardingArray);
    } catch (err) {
      console.error('Error fetching boarding data:', err);
      setError('Failed to load boarding places. Please try again.');
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

  const handleLogout = () => {
    navigation.navigate("HomePage");
  };

  const handleFilter = () => {
    setShowPriceFilter(true);
  };

  const applyPriceFilter = (min: number, max: number) => {
    setPriceRange({ min, max });
    setShowPriceFilter(false);
  };

  const clearPriceFilter = () => {
    setPriceRange({ min: 0, max: 50000 });
    setShowPriceFilter(false);
  };

  // --- Components ---

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View>
        <Text style={styles.appTitle}>BOARDVISTA</Text>
        <View style={styles.locationPill}>
          <Ionicons name="location-sharp" size={12} color="#2563EB" />
          <Text style={styles.locationText}>Vavuniya, SL</Text>
        </View>
      </View>
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.iconButton} onPress={() => handleLogout()}>
          <Ionicons name="log-out-outline" size={20} color="#1E293B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={20} color="#1E293B" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchWrapper}>
        <Feather name="search" size={18} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search locations..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <TouchableOpacity style={styles.filterButton } onPress={handleFilter}>
        <Ionicons name="options-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderCategories = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList} contentContainerStyle={{paddingHorizontal: 20}}>
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
      onPress={() => {
        console.log('Navigating to UserDashboard with boardingId:', item._id);
        navigation.navigate("UserDashboard", { boardingId: item._id });
      }}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: item.images?.[0]?.url || 'https://picsum.photos/seed/boarding/400/300'
          }}
          style={styles.cardImage}
        />
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>LKR {item.price.monthly}</Text>
          <Text style={styles.priceSubText}>/mo</Text>
        </View>
        {item.isVerified && (
          <View style={styles.verifiedBadge}>
            <MaterialIcons name="verified" size={14} color="#2563EB" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <View style={styles.titleRow}>
             <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
             <View style={styles.ratingContainer}>
                 <Ionicons name="star" size={10} color="#F59E0B" />
                 <Text style={styles.ratingText}>4.5</Text>
             </View>
        </View>
        
        <View style={styles.cardLocation}>
          <Ionicons name="location-outline" size={12} color="#64748B" />
          <Text style={styles.cardLocationText} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
        
        <View style={styles.facilitiesRow}>
             <Text style={styles.facilityText}>
                 {item.gender === 'male' ? '♂ Male' : item.gender === 'female' ? '♀ Female' : '⚥ Mixed'}
             </Text>
             <Text style={styles.dotSeparator}>•</Text>
             <Text style={styles.facilityText}>
                {item.roomTypes?.[0]?.capacity || 'N/A'} ppl
             </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Price Filter Modal Component
  const renderPriceFilterModal = () => (
    <Modal
      visible={showPriceFilter}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPriceFilter(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Price Range Filter</Text>
            <TouchableOpacity onPress={() => setShowPriceFilter(false)}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.priceLabel}>Minimum Price (LKR)</Text>
            <View style={styles.priceInputContainer}>
              <TouchableOpacity 
                style={styles.priceButton}
                onPress={() => setPriceRange({...priceRange, min: Math.max(0, priceRange.min - 5000)})}
              >
                <Ionicons name="remove" size={20} color="#2563EB" />
              </TouchableOpacity>
              <Text style={styles.priceValue}>{priceRange.min.toLocaleString()}</Text>
              <TouchableOpacity 
                style={styles.priceButton}
                onPress={() => setPriceRange({...priceRange, min: Math.min(priceRange.max - 1000, priceRange.min + 5000)})}
              >
                <Ionicons name="add" size={20} color="#2563EB" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.priceLabel, {marginTop: 20}]}>Maximum Price (LKR)</Text>
            <View style={styles.priceInputContainer}>
              <TouchableOpacity 
                style={styles.priceButton}
                onPress={() => setPriceRange({...priceRange, max: Math.max(priceRange.min + 1000, priceRange.max - 5000)})}
              >
                <Ionicons name="remove" size={20} color="#2563EB" />
              </TouchableOpacity>
              <Text style={styles.priceValue}>{priceRange.max.toLocaleString()}</Text>
              <TouchableOpacity 
                style={styles.priceButton}
                onPress={() => setPriceRange({...priceRange, max: Math.min(100000, priceRange.max + 5000)})}
              >
                <Ionicons name="add" size={20} color="#2563EB" />
              </TouchableOpacity>
            </View>

            <View style={styles.quickSelectContainer}>
              <Text style={styles.quickSelectLabel}>Quick Select:</Text>
              <View style={styles.quickSelectButtons}>
                {[
                  { label: 'Under 10k', max: 10000 },
                  { label: '10k-20k', min: 10000, max: 20000 },
                  { label: '20k-30k', min: 20000, max: 30000 },
                  { label: '30k+', min: 30000, max: 50000 }
                ].map((range, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickSelectButton}
                    onPress={() => applyPriceFilter(range.min || 0, range.max)}
                  >
                    <Text style={styles.quickSelectText}>{range.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.clearButton]}
              onPress={clearPriceFilter}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.applyButton]}
              onPress={() => setShowPriceFilter(false)}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Filter boarding data based on category, search, and price
  const filteredBoardingData = boardingData.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.gender === selectedCategory.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = item.price.monthly >= priceRange.min && item.price.monthly <= priceRange.max;
    
    return matchesCategory && matchesSearch && matchesPrice;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Section */}
        {renderHeader()}

        <View style={styles.heroContainer}>
            <Text style={styles.heroTitle}>Find your perfect{'\n'}student home</Text>
        </View>

        {renderSearchBar()}
        {renderCategories()}

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Finding best stays...</Text>
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
                Nearby Places <Text style={styles.countText}>({filteredBoardingData.length})</Text>
              </Text>
            </View>

            {filteredBoardingData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBg}>
                    <Ionicons name="search" size={32} color="#94A3B8" />
                </View>
                <Text style={styles.emptyText}>No results found</Text>
                <Text style={styles.emptySubText}>Try changing your filters or search term</Text>
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
            The trusted platform for University of Vavuniya students to find safe, affordable, and verified accommodations.
          </Text>

          <Text style={styles.bottomHeader}>Contact Support</Text>
          <View style={styles.contactCard}>
              <View style={styles.contactRow}>
                <View style={styles.contactIcon}>
                    <Ionicons name="call" size={16} color="#2563EB" />
                </View>
                <Text style={styles.contactText}>+94 77 123 4567</Text>
              </View>
              <View style={styles.contactRow}>
                <View style={styles.contactIcon}>
                    <Ionicons name="mail" size={16} color="#2563EB" />
                </View>
                <Text style={styles.contactText}>support@boardvista.lk</Text>
              </View>
          </View>
          
          {/* Spacer for Floating Nav Visibility */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Price Filter Modal */}
      {renderPriceFilterModal()}

      {/* --- Floating Navigation Bar --- */}
      <View style={styles.floatingNavContainer}>
        <View style={styles.floatingNav}>
          <TouchableOpacity style={styles.navItem} onPress={handleScrollToTop}>
            <View style={[styles.navIconWrapper, styles.activeNavWrapper]}>
              <Ionicons name="home" size={20} color="#fff" />
            </View>
            <Text style={styles.navLabelActive}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={handleScrollToBottom}>
            <Ionicons name="people-outline" size={24} color="#64748B" />
            <Text style={styles.navLabel}>Contact</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={handleScrollToBottom}>
            <Ionicons name="information-circle-outline" size={24} color="#64748B" />
            <Text style={styles.navLabel}>About</Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
}

// --- MODERN STYLESHEET ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Slate 50
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A', // Navy
    letterSpacing: 1,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B', // Slate 500
    marginLeft: 4,
    fontWeight: '600',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444', // Red
    borderWidth: 1,
    borderColor: '#fff',
  },
  
  // Hero
  heroContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 34,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    // Shadow
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#1E293B',
  },
  searchIcon: {
    opacity: 0.7,
  },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: '#2563EB', // Royal Blue
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },

  // Categories
  categoryList: {
    marginBottom: 25,
    paddingLeft: 4, // Offset for padding inside scrollView
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#0F172A', // Navy
    borderColor: '#0F172A',
  },
  categoryText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },

  // Section Header
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  countText: {
      color: '#94A3B8',
      fontSize: 14,
      fontWeight: '500',
  },

  // Cards
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    // Modern shadow
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  imageContainer: {
    height: 130,
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
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.8)', // Navy transparent
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  priceSubText: {
    color: '#E2E8F0',
    fontSize: 10,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  verifiedText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#0F172A',
      marginLeft: 2,
  },
  cardContent: {
    padding: 12,
  },
  titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 4,
  },
  ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFBEB', // Light yellow
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
  },
  ratingText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#B45309',
      marginLeft: 2,
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLocationText: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 4,
    flex: 1,
  },
  facilitiesRow: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  facilityText: {
      fontSize: 11,
      color: '#94A3B8',
      fontWeight: '500',
  },
  dotSeparator: {
      marginHorizontal: 6,
      color: '#CBD5E1',
      fontSize: 10,
  },

  // States
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyIconBg: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#F1F5F9',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '700',
  },
  emptySubText: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },

  // Bottom Section
  bottomSection: {
    padding: 24,
    backgroundColor: '#fff',
    marginTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  divider: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    borderRadius: 2,
    marginBottom: 20,
  },
  bottomHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
    marginBottom: 8,
  },
  bottomText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 20,
  },
  contactCard: {
      backgroundColor: '#F8FAFC',
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#F1F5F9',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#DBEAFE', // Light Blue
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
  },
  contactText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },

  // Floating Nav
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
    height: 64,
    borderRadius: 32,
    justifyContent: 'space-around',
    alignItems: 'center',
    // Heavy Shadow
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  navIconWrapper: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  activeNavWrapper: {
    backgroundColor: '#2563EB', // Royal Blue
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  navLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  navLabelActive: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '700',
    marginTop: 4,
    display: 'none', 
  },

  // Price Filter Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  priceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    minWidth: 80,
    textAlign: 'center',
  },
  quickSelectContainer: {
    marginTop: 24,
  },
  quickSelectLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
  },
  quickSelectButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickSelectButton: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickSelectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  applyButton: {
    backgroundColor: '#2563EB',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});