import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';

import {
  Alert,
  Image,
  ImageBackground,
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
import MapPicker from '../components/MapPicker';
import { boardingService } from '../services/boardingService';

// --- Helper Components ---
// Updated to Vertical Layout for Modern Look
const FormInput = ({ label, ...props }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput 
        style={styles.modernInput} 
        placeholderTextColor="#94A3B8" 
        {...props} 
    />
  </View>
);

const FormInputMulti = ({ label, ...props }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.modernInput, styles.textArea]}
      placeholderTextColor="#94A3B8"
      multiline
      {...props}
    />
  </View>
);

const CustomCheckbox = ({ label, value, onValueChange }) => (
  <TouchableOpacity
    style={styles.checkboxContainer}
    onPress={() => onValueChange(!value)}
    activeOpacity={0.7}
  >
    <View style={[styles.checkbox, value && styles.checkboxChecked]}>
      {value && <Ionicons name="checkmark" size={12} color="#fff" />}
    </View>
    <Text style={[styles.checkboxLabel, value && styles.checkboxLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

// --- Helper Functions ---
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

const getCurrentUserId = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      const decoded = decodeJWT(token);
      return decoded.id;
    }
    return null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

const isOwnerAuthorized = (boarding, currentUserId) => {
  return boarding.owner && boarding.owner._id === currentUserId;
};

// --- Main Screen ---
export default function EditOrUpdateBoardingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const boardingId = route?.params?.boardingId;
  
  const LogoutHandler = async () => { 
    try {
      await AsyncStorage.removeItem('authToken'); 
      navigation.replace("HomePage"); 
    } catch (e) {
      console.error("Logout failed", e);
    }
  }

  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [boardingData, setBoardingData] = useState(null);
  const [userBoardings, setUserBoardings] = useState([]);
  const [showBoardingList, setShowBoardingList] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [manualImageUrl, setManualImageUrl] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: 8.7641, // Default: University of Vavuniya
    longitude: 80.4977, // Default: University of Vavuniya
    email: '',
    phone: '',
    capacity: '',
    monthlyRent: '',
    description: '',
    nearbyServices: ''
  });

  const [accommodationType, setAccommodationType] = useState('Male');
  const [facilities, setFacilities] = useState({
    beds: false,
    table: false,
    chairs: false,
    fans: false,
    kitchen: false,
    attachedBathroom: false,
    freeElectricity: false,
    freeWater: false,
    studyArea: false,
  });

  // Load existing boarding data or user boardings list
  useEffect(() => {
    if (boardingId) {
      loadBoardingData();
    } else {
      setShowBoardingList(true);
      loadUserBoardings();
    }
  }, [boardingId]);

  // Add navigation listener to handle screen focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (boardingId) {
        loadBoardingData();
      }
    });

    return unsubscribe;
  }, [navigation, boardingId]);

  const loadUserBoardings = async () => {
    try {
      setLoading(true);
      const currentUserId = await getCurrentUserId();
      
      if (!currentUserId) {
        Alert.alert('Error', 'You must be logged in to view your boardings');
        navigation.replace('OwnerLoginPage');
        return;
      }

      const response = await boardingService.getAllBoardings();
      let boardings = [];
      
      if (Array.isArray(response)) {
        boardings = response;
      } else if (response && response.boardingHouses) {
        boardings = response.boardingHouses;
      } else if (response && response.data) {
        boardings = response.data;
      }
      
      // Debug: Log all boardings and current user ID
      console.log('Current User ID:', currentUserId);
      console.log('All Boardings:', boardings);
      
      // Filter boardings to show only those owned by current user
      const userBoardings = boardings.filter(boarding => {
        const isAuthorized = isOwnerAuthorized(boarding, currentUserId);
        console.log(`Boarding "${boarding.title}" - Owner:`, boarding.owner, 'Authorized:', isAuthorized);
        return isAuthorized;
      });
      
      console.log('User Boardings:', userBoardings);
      setUserBoardings(userBoardings);
    } catch (error) {
      console.error('Error loading user boardings:', error);
      Alert.alert('Error', 'Failed to load your boarding listings');
    } finally {
      setLoading(false);
    }
  };

  const selectBoardingToEdit = (boarding) => {
    console.log('Edit button clicked for boarding:', boarding);
    console.log('Navigating with boardingId:', boarding._id);
    navigation.navigate("EditOrUpdateBoarding", { boardingId: boarding._id });
    console.log('Navigation call completed');
  };

  const handleDeleteBoarding = (boarding) => {
    console.log('Delete button clicked for boarding:', boarding);
    
    // Test if Alert works at all
    Alert.alert('Test', 'Delete button was clicked!');
    
    // Simple confirmation dialog
    if (window.confirm('Are you sure you want to delete this boarding listing? This action cannot be undone.')) {
      console.log('Delete confirmed for boarding ID:', boarding._id);
      performDelete(boarding._id);
    } else {
      console.log('Delete cancelled');
    }
  };

  const performDelete = async (boardingId) => {
    try {
      setLoading(true);
      console.log('Calling boardingService.deleteBoarding with ID:', boardingId);
      const response = await boardingService.deleteBoarding(boardingId);
      console.log('Delete API response:', response);
      Alert.alert('Success', 'Boarding listing deleted successfully!');
      // Refresh the list
      loadUserBoardings();
    } catch (error) {
      console.log("Delete Error:", error);
      console.log("Delete Error Response:", error.response);
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete listing');
    } finally {
      setLoading(false);
    }
  };

  const loadBoardingData = async () => {
    console.log('loadBoardingData called');
    try {
      setLoading(true);
      const currentUserId = await getCurrentUserId();
      console.log('loadBoardingData - currentUserId:', currentUserId);
      
      if (!currentUserId) {
        Alert.alert('Error', 'You must be logged in to edit boardings');
        navigation.replace('OwnerLoginPage');
        return;
      }

      console.log('Calling boardingService.getBoardingById with ID:', boardingId);
      const response = await boardingService.getBoardingById(boardingId);
      console.log('API Response:', response);
      
      let data = null;
      
      if (response && response.boardingHouse) {
        data = response.boardingHouse;
        console.log('Using response.boardingHouse');
      } else if (response && response.data) {
        data = response.data;
        console.log('Using response.data');
      } else {
        data = response;
        console.log('Using response directly');
      }

      console.log('Final data:', data);

      if (data) {
        // Check if current user is the owner
        const isAuthorized = isOwnerAuthorized(data, currentUserId);
        console.log('Ownership check - Boarding owner:', data.owner, 'Current user:', currentUserId, 'Authorized:', isAuthorized);
        
        if (!isAuthorized) {
          Alert.alert('Access Denied', 'You can only edit your own boarding listings');
          navigation.goBack();
          return;
        }

        console.log('Setting showBoardingList to false for edit mode');
        setShowBoardingList(false);
        setBoardingData(data);
        setFormData({
          name: data.title || '',
          address: data.address || '',
          latitude: data.coordinates?.coordinates?.[1] || 8.7641,
          longitude: data.coordinates?.coordinates?.[0] || 80.4977,
          email: data.contact?.email || '',
          phone: data.contact?.phone || '',
          capacity: data.roomTypes?.[0]?.capacity || '',
          monthlyRent: data.price?.monthly || '',
          description: data.description || '',
          nearbyServices: data.nearbyServices || ''
        });

        setAccommodationType(data.gender === 'male' ? 'Male' : 'Female');

        // Set facilities
        const facilityMap = {
          "Beds": "beds",
          "Table": "table", 
          "Chairs": "chairs",
          "Fans": "fans",
          "Kitchen": "kitchen",
          "Attached Bathroom": "attachedBathroom",
          "Free Electricity": "freeElectricity",
          "Free Water": "freeWater",
          "Study Area": "studyArea"
        };

        const updatedFacilities = { ...facilities };
        if (data.facilities && Array.isArray(data.facilities)) {
          data.facilities.forEach(facility => {
            const key = facilityMap[facility];
            if (key) {
              updatedFacilities[key] = true;
            }
          });
        }
        setFacilities(updatedFacilities);

        // Set photos
        if (data.images && Array.isArray(data.images)) {
          setPhotos(data.images.map(img => img.url || img));
        }
      }
    } catch (error) {
      console.error('Error loading boarding data:', error);
      Alert.alert('Error', 'Failed to load boarding data');
    } finally {
      setLoading(false);
    }
  };

  const toggleFacility = (key) => {
    setFacilities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const addManualPhoto = () => {
    if (!manualImageUrl.trim()) {
      Alert.alert("Empty", "Please enter a valid image URL");
      return;
    }
    setPhotos(prev => [...prev, manualImageUrl]);
    setManualImageUrl(''); 
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleLocationPicked = (result) => {
    setFormData(prev => ({
      ...prev,
      latitude: result.latitude,
      longitude: result.longitude
    }));
    setShowMap(false);
  };

  // --- Update Handler ---
  const handleUpdate = async () => {
    if (!formData.name || !formData.monthlyRent) {
      Alert.alert('Missing Info', 'Please fill in Name and Rent.');
      return;
    }

    try {
      setLoading(true);

      const facilitiesArray = Object.entries(facilities)
        .filter(([key, value]) => value)
        .map(([key]) => {
          const facilityMap = {
            beds: "Beds", table: "Table", chairs: "Chairs", fans: "Fans",
            kitchen: "Kitchen", attachedBathroom: "Attached Bathroom",
            freeElectricity: "Free Electricity", freeWater: "Free Water",
            studyArea: "Study Area"
          };
          return facilityMap[key];
        });

      const updatedData = {
        title: formData.name,
        address: formData.address,
        contact: {
          email: formData.email,
          phone: formData.phone
        },
        coordinates: {
          type: "Point",
          coordinates: [
            Number(formData.longitude),
            Number(formData.latitude)
          ]
        },
        price: {
          monthly: Number(formData.monthlyRent),
          deposit: Number(formData.monthlyRent) * 2
        },
        gender: accommodationType === 'Male' ? 'male' : 'female',
        facilities: facilitiesArray,
        roomTypes: [
          {
            name: "Single Room",
            capacity: Number(formData.capacity) || 1,
            available: Number(formData.capacity) || 1,
            price: Number(formData.monthlyRent)
          }
        ],
        images: photos.map(uri => ({ url: uri })),
        description: formData.description || "No description",
        nearbyServices: formData.nearbyServices || "",
        isAvailable: true,
        isVerified: boardingData?.isVerified || false
      };

      await boardingService.updateBoarding(boardingId, updatedData);
      Alert.alert('Success', 'Boarding listing updated successfully!');
      navigation.replace('BoardingDetailsAdding');
    
    } catch (error) {
      console.log("Update Error:", error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update listing');
    } finally {
      setLoading(false);
    }
  };


  // --- Components ---
  const renderHeader = () => (
    <ImageBackground
      source={require("../assets/images/background.jpg")}
      style={styles.headerBackground}
      imageStyle={styles.headerImage}
    >
      <View style={styles.headerOverlay}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.replace('BoardingDetailsAdding')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.logo}>BOARDVISTA</Text>
          <TouchableOpacity onPress={LogoutHandler} style={styles.exitButton}>
             <Ionicons name="log-out-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Manage Listings</Text>
        <View style={styles.userContainer}>
           <View style={styles.avatar}>
               <Text style={styles.avatarText}>O</Text>
           </View>
          <Text style={styles.headerText}>Hi, Owner!</Text>
        </View>
      </View>
    </ImageBackground>
  );

  if (loading && !boardingData && !showBoardingList) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render boarding list if no specific boarding is selected
  if (showBoardingList) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {renderHeader()}
          
          <View style={styles.mainContent}>
            <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionTitle}>Your Properties</Text>
                <Text style={styles.helperText}>Tap edit or delete to manage</Text>
            </View>
            
            {userBoardings.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                    <Ionicons name="home-outline" size={40} color="#94A3B8" />
                </View>
                <Text style={styles.emptyStateText}>No listings found</Text>
                <TouchableOpacity 
                  style={styles.createButton} 
                  onPress={() => navigation.navigate("BoardingDetailsAdding")}
                >
                  <Text style={styles.createButtonText}>+ Create New Listing</Text>
                </TouchableOpacity>
              </View>
            ) : (
              userBoardings.map((boarding) => (
                <View key={boarding._id} style={styles.listingCard}>
                   <View style={styles.listingHeader}>
                       <Text style={styles.boardingTitle}>{boarding.title}</Text>
                       <View style={[styles.statusBadge, { backgroundColor: boarding.isVerified ? '#DCFCE7' : '#F1F5F9' }]}>
                           <Text style={[styles.statusText, { color: boarding.isVerified ? '#166534' : '#64748B' }]}>
                               {boarding.isVerified ? 'Verified' : 'Pending'}
                           </Text>
                       </View>
                   </View>
                  
                  <View style={styles.listingBody}>
                     <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={14} color="#64748B" />
                        <Text style={styles.boardingAddress} numberOfLines={1}>{boarding.address}</Text>
                     </View>
                     <View style={styles.infoRow}>
                        <Ionicons name="cash-outline" size={14} color="#64748B" />
                        <Text style={styles.boardingPrice}>LKR {boarding.price?.monthly || 'N/A'}/mo</Text>
                     </View>
                     <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={14} color="#64748B" />
                        <Text style={styles.boardingGender}>{boarding.gender === 'male' ? 'Male Students' : 'Female Students'}</Text>
                     </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.listingActions}>
                    <TouchableOpacity
                      style={styles.editAction}
                      onPress={() => selectBoardingToEdit(boarding)}
                    >
                      <Ionicons name="create-outline" size={18} color="#2563EB" />
                      <Text style={styles.editActionText}>Edit</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.verticalDivider} />

                    <TouchableOpacity
                      style={styles.deleteAction}
                      onPress={() => handleDeleteBoarding(boarding)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      <Text style={styles.deleteActionText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 BoardVista</Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- EDIT FORM VIEW ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Simplified Header for Edit Mode */}
        <View style={styles.editHeader}>
             <TouchableOpacity onPress={() => navigation.replace('BoardingDetailsAdding')} style={styles.headerBackBtn}>
                <Ionicons name="close" size={24} color="#1E293B" />
             </TouchableOpacity>
             <Text style={styles.editHeaderTitle}>Update Listing</Text>
             <View style={{width: 24}} /> 
        </View>
        
        <View style={styles.mainContent}>
          
          {/* Card: Basic Info */}
          <View style={styles.formCard}>
              <Text style={styles.cardHeader}>Basic Information</Text>
              
              <FormInput 
                label="Property Name" 
                placeholder="e.g. Green Villa Boarding" 
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({...prev, name: text}))}
              />
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Gender Preference</Text>
                <View style={styles.toggleContainer}>
                  {['Male', 'Female'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.toggleButton, accommodationType === type && styles.toggleActive]}
                      onPress={() => setAccommodationType(type)}>
                      <Ionicons name={type === 'Male' ? "male" : "female"} size={14} color={accommodationType === type ? '#fff' : '#64748B'} style={{marginRight: 6}} />
                      <Text style={[styles.toggleText, accommodationType === type && styles.toggleTextActive]}>
                        {type} Only
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <FormInput 
                label="Address" 
                placeholder="Full street address" 
                value={formData.address}
                onChangeText={(text) => setFormData(prev => ({...prev, address: text}))}
              />
          </View>

          {/* Card: Contact */}
          <View style={styles.formCard}>
              <Text style={styles.cardHeader}>Contact Details</Text>
              <FormInput label="Email Address" placeholder="email@example.com" keyboardType="email-address" value={formData.email} onChangeText={(text) => setFormData(prev => ({...prev, email: text}))} />
              <FormInput label="Phone Number" placeholder="077-1234567" keyboardType="phone-pad" value={formData.phone} onChangeText={(text) => setFormData(prev => ({...prev, phone: text}))} />
          </View>

          {/* Card: Pricing & Capacity */}
          <View style={styles.formCard}>
              <Text style={styles.cardHeader}>Pricing & Capacity</Text>
              <View style={styles.rowInputs}>
                  <View style={{flex: 1, marginRight: 10}}>
                     <FormInput label="Capacity" placeholder="Total persons" keyboardType="number-pad" value={formData.capacity} onChangeText={(text) => setFormData(prev => ({...prev, capacity: text}))} />
                  </View>
                  <View style={{flex: 1}}>
                     <FormInput label="Monthly Rent (LKR)" placeholder="Amount" keyboardType="number-pad" value={formData.monthlyRent} onChangeText={(text) => setFormData(prev => ({...prev, monthlyRent: text}))} />
                  </View>
              </View>
          </View>

          {/* Card: Facilities */}
          <View style={styles.formCard}>
             <Text style={styles.cardHeader}>Facilities & Amenities</Text>
             <View style={styles.facilitiesContainer}>
                 {Object.keys(facilities).map((key) => {
                     // Nice formatting for labels
                     const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                     return (
                         <View style={styles.facilityItem} key={key}>
                             <CustomCheckbox label={label} value={facilities[key]} onValueChange={() => toggleFacility(key)} />
                         </View>
                     )
                 })}
             </View>
          </View>

          {/* Card: Location */}
          <View style={styles.formCard}>
            <Text style={styles.cardHeader}>Location</Text>
            <View style={styles.locationPreview}>
                <View style={styles.locationTextContainer}>
                    <Text style={styles.locationStatusLabel}>Coordinates:</Text>
                    <Text style={styles.locationCoords}>{formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</Text>
                    <Text style={[styles.locationStatus, { color: formData.latitude === 8.7641 ? '#F59E0B' : '#166534' }]}>
                        {formData.latitude === 8.7641 ? "⚠ Default Location" : "✓ Custom Location Set"}
                    </Text>
                </View>
                <TouchableOpacity style={styles.mapBtn} onPress={() => setShowMap(true)}>
                    <Ionicons name="map-outline" size={20} color="#fff" />
                    <Text style={styles.mapBtnText}>Set on Map</Text>
                </TouchableOpacity>
            </View>
          </View>

          {/* Card: Details */}
          <View style={styles.formCard}>
             <Text style={styles.cardHeader}>Description</Text>
             <FormInputMulti
                label="Property Description"
                placeholder="Tell students about your place..."
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({...prev, description: text}))}
              />
              <FormInputMulti
                label="Nearby Services"
                placeholder="Bus stops, shops, banks nearby..."
                value={formData.nearbyServices}
                onChangeText={(text) => setFormData(prev => ({...prev, nearbyServices: text}))}
              />
          </View>

          {/* Card: Images */}
          <View style={styles.formCard}>
            <Text style={styles.cardHeader}>Photos</Text>
            <View style={styles.urlInputContainer}>
              <TextInput
                style={styles.urlInput}
                placeholder="Paste image URL here..."
                value={manualImageUrl}
                onChangeText={setManualImageUrl}
              />
              <TouchableOpacity style={styles.addPhotoBtn} onPress={addManualPhoto}>
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>Add links to photos of your property</Text>

            <View style={styles.galleryGrid}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.thumbWrapper}>
                  <Image source={{ uri: photo }} style={styles.thumbnail} />
                  <TouchableOpacity 
                    style={styles.deletePhotoBtn} 
                    onPress={() => removePhoto(index)}
                  >
                    <Ionicons name="close" size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <View style={styles.warningBox}>
                <Ionicons name="alert-circle-outline" size={20} color="#B45309" style={{marginRight: 8}} />
                <Text style={styles.warningText}>Changes will be live immediately after updating.</Text>
            </View>
            
            <TouchableOpacity style={styles.primaryButton} onPress={handleUpdate} disabled={loading}>
              <Text style={styles.primaryButtonText}>
                {loading ? 'Processing...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showMap} animationType="slide">
        <MapPicker 
          onConfirm={handleLocationPicked} 
          onClose={() => setShowMap(false)} 
        />
      </Modal>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 BoardVista</Text>
      </View>
    </SafeAreaView>
  );
}

// === MODERN STYLESHEET ===
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  
  // Header (List View)
  headerBackground: { width: '100%', height: 200, marginBottom: -30, zIndex: 0 },
  headerImage: { borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.85)', padding: 20, justifyContent: 'center' },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  backButton: { backgroundColor: '#fff', padding: 8, borderRadius: 20 },
  logo: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  exitButton: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 20 },
  subtitle: { fontSize: 14, color: '#94A3B8', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 5 },
  userContainer: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  headerText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  // Header (Edit View)
  editHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerBackBtn: { padding: 4 },
  editHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },

  // Content Containers
  mainContent: { padding: 20 },
  formContainer: { flex: 1 },
  
  // List View Components
  sectionHeaderContainer: { marginBottom: 20,margin:20 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  helperText: { fontSize: 14, color: '#64748B', marginTop: 4 },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyStateText: { fontSize: 16, color: '#64748B', fontWeight: '500', marginBottom: 20 },
  createButton: { backgroundColor: '#2563EB', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30, shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  createButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Listing Cards (Dashboard Style)
  listingCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#F1F5F9' },
  listingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, paddingBottom: 10 },
  boardingTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', flex: 1, marginRight: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  listingBody: { paddingHorizontal: 16, paddingBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  boardingAddress: { fontSize: 13, color: '#64748B', marginLeft: 8, flex: 1 },
  boardingPrice: { fontSize: 13, color: '#2563EB', marginLeft: 8, fontWeight: '600' },
  boardingGender: { fontSize: 13, color: '#64748B', marginLeft: 8 },
  divider: { height: 1, backgroundColor: '#F1F5F9', width: '100%' },
  listingActions: { flexDirection: 'row', height: 48 },
  editAction: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  editActionText: { color: '#2563EB', fontWeight: '600', marginLeft: 6, fontSize: 14 },
  deleteAction: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  deleteActionText: { color: '#EF4444', fontWeight: '600', marginLeft: 6, fontSize: 14 },
  verticalDivider: { width: 1, backgroundColor: '#F1F5F9', height: '100%' },

  // Form Cards (Edit View)
  formCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  cardHeader: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 8 },
  
  // Modern Inputs
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8, marginLeft: 2 },
  modernInput: { backgroundColor: '#F8FAFC', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  textArea: { height: 100, textAlignVertical: 'top' },
  rowInputs: { flexDirection: 'row' },
  
  // Toggles
  toggleContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', padding: 4, borderRadius: 12 },
  toggleButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8 },
  toggleActive: { backgroundColor: '#2563EB', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  toggleText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  toggleTextActive: { color: '#fff' },

  // Facilities
  facilitiesContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  facilityItem: { width: '48%', marginBottom: 10 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, borderColor: '#CBD5E1', marginRight: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  checkboxChecked: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  checkboxLabel: { fontSize: 13, color: '#475569' },
  checkboxLabelActive: { color: '#1E293B', fontWeight: '600' },

  // Location Widget
  locationPreview: { backgroundColor: '#F0FDFA', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#CCFBF1', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locationTextContainer: { flex: 1 },
  locationStatusLabel: { fontSize: 11, color: '#0D9488', fontWeight: '700', textTransform: 'uppercase' },
  locationCoords: { fontSize: 13, color: '#334155', marginVertical: 4, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  locationStatus: { fontSize: 11, fontWeight: '600' },
  mapBtn: { backgroundColor: '#0D9488', flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  mapBtnText: { color: '#fff', fontSize: 12, fontWeight: '700', marginLeft: 6 },

  // Image Gallery
  urlInputContainer: { flexDirection: 'row', marginBottom: 8 },
  urlInput: { flex: 1, backgroundColor: '#F1F5F9', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, paddingHorizontal: 12, fontSize: 13 },
  addPhotoBtn: { backgroundColor: '#2563EB', width: 44, justifyContent: 'center', alignItems: 'center', borderTopRightRadius: 8, borderBottomRightRadius: 8 },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  thumbWrapper: { width: 80, height: 80, marginRight: 12, marginBottom: 12, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  thumbnail: { width: '100%', height: '100%' },
  deletePhotoBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(239, 68, 68, 0.9)', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  // Action Buttons
  actionContainer: { marginTop: 10, marginBottom: 40 },
  warningBox: { flexDirection: 'row', backgroundColor: '#FFFBEB', padding: 12, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#FEF3C7' },
  warningText: { flex: 1, color: '#92400E', fontSize: 12, lineHeight: 18 },
  primaryButton: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryButton: { marginTop: 12, paddingVertical: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
  secondaryButtonText: { color: '#64748B', fontSize: 16, fontWeight: '600' },

  // Footer
  footer: { backgroundColor: '#F1F5F9', padding: 20, alignItems: 'center' },
  footerText: { color: '#94A3B8', fontSize: 12, fontWeight: '500' },
  
  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#64748B' },
});