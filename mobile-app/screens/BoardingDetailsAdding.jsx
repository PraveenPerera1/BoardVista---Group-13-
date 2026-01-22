import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapPicker from '../components/MapPicker';
import { boardingService } from '../services/boardingService';

// --- Helper Components ---
const FormInput = ({ label, ...props }) => (
  <View style={styles.inputRow}>
    <Text style={styles.rowLabel}>{label}</Text>
    <TextInput style={styles.rowInput} placeholderTextColor="#999" {...props} />
  </View>
);

const FormInputMulti = ({ label, ...props }) => (
  <View style={styles.inputRowMulti}>
    <Text style={styles.rowLabelMulti}>{label}</Text>
    <TextInput
      style={styles.multilineInput}
      placeholderTextColor="#999"
      multiline
      {...props}
    />
  </View>
);

const CustomCheckbox = ({ label, value, onValueChange }) => (
  <TouchableOpacity
    style={styles.checkboxContainer}
    onPress={() => onValueChange(!value)}>
    <View style={[styles.checkbox, value && styles.checkboxChecked]}>
      {value && <Text style={styles.checkboxCheck}>✓</Text>}
    </View>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

// --- Main Screen ---
export default function AddListingScreen() {
  const navigation = useNavigation();
  
  const LogoutHandler = async () => { 
    try {
      // Clear the authentication token from AsyncStorage
      await AsyncStorage.removeItem('authToken'); 
      navigation.replace("HomePage"); 
    } catch (e) {
      console.error("Logout failed", e);
    }
  }
  const skipHandler = () => { navigation.replace("Dashboard"); }

  const [showMap, setShowMap] = useState(false);
  const [step, setStep] = useState(1);
  const [accommodationType, setAccommodationType] = useState('Male');
  const [agreed, setAgreed] = useState(false);
  const [photos, setPhotos] = useState([]);
  
  // State for Manual Image URL
  const [manualImageUrl, setManualImageUrl] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    address: '', // Manually typed text ONLY
    latitude: 0, 
    longitude: 0, 
    email: '',
    phone: '',
    capacity: '',
    monthlyRent: '',
    description: '',
    nearbyServices: '' // Added missing field
  });

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

  const toggleFacility = (key) => {
    setFacilities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // --- Image Handlers ---
  
  // 1. Manual Image Add
  const addManualPhoto = () => {
    if (!manualImageUrl.trim()) {
      Alert.alert("Empty", "Please enter a valid image URL");
      return;
    }
    setPhotos(prev => [...prev, manualImageUrl]);
    setManualImageUrl(''); 
  };

  // 2. Remove Photo
  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // --- Map Handler (UPDATED) ---
  const handleLocationPicked = (result) => {
    setFormData(prev => ({
      ...prev,
      // address: result.address, <--- REMOVED: Map no longer touches address text
      latitude: result.latitude,
      longitude: result.longitude
    }));
    setShowMap(false);
  };

  // --- Submit Handler ---
  const handleSubmit = async () => {
    // 1. Validation
    if (!formData.name || !formData.monthlyRent) {
      Alert.alert('Missing Info', 'Please fill in Name and Rent.');
      return;
    }
    if (photos.length === 0) {
      Alert.alert('Images Required', 'Please add at least one image URL.');
     //return;
    }
    if (!agreed) {
      Alert.alert('Policy', 'Please agree to the policies.');
      return;
    }

    try {
      // 2. Map facilities
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

      // 3. Construct Data
      const boardingData = {
        title: formData.name,
        address: formData.address,
        email: formData.email,
        phone: formData.phone,
        coordinates: {
          latitude: formData.latitude || 8.7548,
          longitude: formData.longitude || 80.4979 
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
        // Send Manual URLs
        images: photos.map(uri => ({ url: uri })),
        description: formData.description || "No description",
        nearbyServices: formData.nearbyServices || "",
        isAvailable: true,
        isVerified: false
      };

      await boardingService.createBoarding(boardingData);
      Alert.alert('Success', 'Boarding listing created successfully!');
      navigation.replace('Dashboard');
    
    } catch (error) {
      console.log("Submit Error:", error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create listing');
    }
  };

  // --- Components ---
  const renderHeader = () => (
    <ImageBackground
      source={require("../assets/images/background.jpg")}
      style={styles.headerBackground}>
      <View style={styles.headerOverlay}>
        <Text style={styles.logo}>BOARDVISTA</Text>
        <Text style={styles.subtitle}>Discover the Best Stays in Vavuniya</Text>
        <View style={styles.userContainer}>
          <Text style={styles.headerText}>Hi, Owner!</Text>
          <TouchableOpacity onPress={LogoutHandler}>
            <Text style={styles.headerIconText}>Exit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );

  const renderSubHeader = () => (
    <View style={styles.subHeader}>
      <TouchableOpacity onPress={() => { if (step === 2) setStep(1); }}>
        <Text style={styles.backArrow}>←back</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={skipHandler}>
        <Text style={styles.skipIcon}>Skip</Text>
      </TouchableOpacity>
    </View>
  );

  // --- Step 1 ---
  const renderStep1 = () => (
    <>
      {/* Accommodation Type */}
      <View style={styles.inputRow}>
        <Text style={styles.rowLabel}>Accommodation Type</Text>
        <View style={styles.toggleContainer}>
          {['Male', 'Female'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.toggleButton, accommodationType === type && styles.toggleActive]}
              onPress={() => setAccommodationType(type)}>
              <Text style={[styles.toggleText, accommodationType === type && styles.toggleTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FormInput 
        label="Name" 
        placeholder="Enter boarding name" 
        value={formData.name}
        onChangeText={(text) => setFormData(prev => ({...prev, name: text}))}
      />
      {/* Manual Address Input */}
      <FormInput 
        label="Address" 
        placeholder="Enter boarding Address (Text only)" 
        value={formData.address}
        onChangeText={(text) => setFormData(prev => ({...prev, address: text}))}
      />
      
      <FormInput label="E-mail" placeholder="example@gmail.com" keyboardType="email-address" value={formData.email} onChangeText={(text) => setFormData(prev => ({...prev, email: text}))} />
      <FormInput label="Phone" placeholder="077-XXXXXXX" keyboardType="phone-pad" value={formData.phone} onChangeText={(text) => setFormData(prev => ({...prev, phone: text}))} />

      {/* Facilities */}
      <View style={styles.inputRowMulti}>
        <Text style={styles.rowLabelMulti}>Facilities</Text>
        <View style={styles.facilitiesGrid}>
          <View style={styles.facilitiesColumn}>
            <CustomCheckbox label="Beds" value={facilities.beds} onValueChange={() => toggleFacility('beds')} />
            <CustomCheckbox label="Table" value={facilities.table} onValueChange={() => toggleFacility('table')} />
            <CustomCheckbox label="Chairs" value={facilities.chairs} onValueChange={() => toggleFacility('chairs')} />
          </View>
          <View style={styles.facilitiesColumn}>
            <CustomCheckbox label="Kitchen" value={facilities.kitchen} onValueChange={() => toggleFacility('kitchen')} />
            <CustomCheckbox label="Bath" value={facilities.attachedBathroom} onValueChange={() => toggleFacility('attachedBathroom')} />
            <CustomCheckbox label="Power" value={facilities.freeElectricity} onValueChange={() => toggleFacility('freeElectricity')} />
          </View>
          <View style={styles.facilitiesColumn}>
             <CustomCheckbox label="Study" value={facilities.studyArea} onValueChange={() => toggleFacility('studyArea')} />
             <CustomCheckbox label="Water" value={facilities.freeWater} onValueChange={() => toggleFacility('freeWater')} />
             <CustomCheckbox label="Fans" value={facilities.fans} onValueChange={() => toggleFacility('fans')} />
          </View>
        </View>
      </View>

      <FormInput label="Capacity" placeholder="e.g., 8" keyboardType="number-pad" value={formData.capacity} onChangeText={(text) => setFormData(prev => ({...prev, capacity: text}))} />
      <FormInput label="Rent (LKR)" placeholder="Rs. XXXXX" keyboardType="number-pad" value={formData.monthlyRent} onChangeText={(text) => setFormData(prev => ({...prev, monthlyRent: text}))} />

      <View style={styles.nextButtonContainer}>
        <TouchableOpacity onPress={() => setStep(2)}>
          <Text style={styles.nextButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  // --- Step 2 ---
  const renderStep2 = () => (
    <>
      {/* Map Section - Decoupled from Address Text */}
      <View style={styles.mapSectionContainer}>
        <Text style={styles.sectionHeader}>Boarding Location (Map Pin)</Text>
        <View style={styles.locationCard}>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Location Status:</Text>
            {/* Displaying Pin Status instead of Address */}
            <Text style={[styles.addressText, { color: formData.latitude !== 0 ? 'green' : 'orange' }]}>
              {formData.latitude !== 0 ? "✅ Location Pinned" : "⚠️ No Pin Dropped"}
            </Text>
            {formData.latitude !== 0 && (
               <Text style={styles.coordText}>
                 GPS: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
               </Text>
            )}
          </View>

          <TouchableOpacity 
            style={styles.mapButton} 
            onPress={() => setShowMap(true)}
          >
            <Ionicons name="map" size={20} color="#fff" />
            <Text style={styles.mapButtonText}>
              {formData.latitude !== 0 ? "Change Pin" : "Pick on Map"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FormInputMulti
        label="Description"
        placeholder="Add a description..."
        value={formData.description}
        onChangeText={(text) => setFormData(prev => ({...prev, description: text}))}
      />
      
      {/* Added Missing Field */}
      <FormInputMulti
        label="Nearby Services"
        placeholder="Bus stop, Bank..."
        value={formData.nearbyServices}
        onChangeText={(text) => setFormData(prev => ({...prev, nearbyServices: text}))}
      />

      {/* Manual Image Input (Replaces ImagePicker) */}
      <View style={styles.inputRowMulti}>
        <Text style={styles.rowLabelMulti}>Boarding Images (URL)</Text>
        <View style={styles.manualInputContainer}>
          <TextInput
            style={styles.manualInput}
            placeholder="Paste https:// image link..."
            value={manualImageUrl}
            onChangeText={setManualImageUrl}
          />
          <TouchableOpacity style={styles.addButton} onPress={addManualPhoto}>
            <Text style={styles.addButtonText}>ADD</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.helperText}>*Paste image links for testing (Unsplash etc.)</Text>

        <View style={styles.imagePreviewContainer}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.imagePreview}>
              <Image source={{ uri: photo }} style={styles.imageThumbnail} />
              <TouchableOpacity 
                style={styles.removeImageButton} 
                onPress={() => removePhoto(index)}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <CustomCheckbox label="Owner agreed to BoardVista policies" value={agreed} onValueChange={setAgreed}/>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
          <Text style={styles.buttonText}>SUBMIT LISTING</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setStep(1)}>
          <Text style={styles.buttonText}>BACK</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {renderHeader()}
        {renderSubHeader()}
        <View style={styles.formContainer}>
          {step === 1 ? renderStep1() : renderStep2()}
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

// === STYLESHEET ===
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  headerBackground: { width: '100%', height: 180 },
  headerOverlay: { flex: 1, backgroundColor: 'rgba(58, 90, 120, 0.8)', alignItems: 'center', padding: 15, justifyContent: 'center' },
  logo: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#fff', marginTop: 5 },
  userContainer: { position: 'absolute', top: 15, right: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20 },
  headerText: { color: '#fff', marginHorizontal: 8, fontSize: 14 },
  headerIconText: { color: '#fff', fontSize: 16 },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  backArrow: { fontSize: 18, color: '#333' },
  skipIcon: { fontSize: 16, color: '#111' },
  formContainer: { flex: 1, padding: 20, backgroundColor: '#f4f4f8' },
  
  // Inputs
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  inputRowMulti: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  rowLabel: { flex: 1, fontSize: 14, color: '#333', fontWeight: '500' },
  rowLabelMulti: { fontSize: 14, color: '#333', fontWeight: '500', marginBottom: 10 },
  rowInput: { flex: 2, fontSize: 14, backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 5, borderWidth: 1, borderColor: '#ccc' },
  multilineInput: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 5, borderWidth: 1, borderColor: '#ccc', height: 80, textAlignVertical: 'top' },

  // Manual Image Input Styles
  manualInputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  manualInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 10, height: 45, marginRight: 10 },
  addButton: { backgroundColor: '#2A7FFF', paddingHorizontal: 15, height: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  helperText: { fontSize: 12, color: '#888', marginBottom: 10, fontStyle: 'italic' },

  // Map Section
  mapSectionContainer: { marginBottom: 20 },
  sectionHeader: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 10 },
  locationCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, borderWidth: 1, borderColor: '#ddd', elevation: 2 },
  locationInfo: { marginBottom: 12 },
  locationLabel: { fontSize: 12, color: '#888', fontWeight: '700', marginBottom: 4 },
  addressText: { fontSize: 15, color: '#1A1A1A', lineHeight: 20, fontWeight: '500' },
  coordText: { fontSize: 12, color: '#2A7FFF', marginTop: 4 },
  mapButton: { flexDirection: 'row', backgroundColor: '#1A1A1A', padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  mapButtonText: { color: '#fff', fontWeight: '600', marginLeft: 8 },

  // Toggle & Checkbox
  toggleContainer: { flex: 2, flexDirection: 'row' },
  toggleButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#e0e0e0', marginRight: 10 },
  toggleActive: { backgroundColor: '#007BFF' },
  toggleText: { fontSize: 12, color: '#333' },
  toggleTextActive: { color: '#fff', fontWeight: 'bold' },
  facilitiesGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  facilitiesColumn: { flex: 1 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  checkbox: { width: 18, height: 18, borderWidth: 1, borderColor: '#999', backgroundColor: '#fff', borderRadius: 3, marginRight: 8, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#007BFF', borderColor: '#007BFF' },
  checkboxCheck: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  checkboxLabel: { fontSize: 13, color: '#333' },

  // Image Preview
  imagePreviewContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  imagePreview: { width: 70, height: 70, marginRight: 10, marginBottom: 10, position: 'relative' },
  imageThumbnail: { width: '100%', height: '100%', borderRadius: 8 },
  removeImageButton: { position: 'absolute', top: -5, right: -5, backgroundColor: '#FF4444', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fff' },
  removeImageText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  // Buttons
  nextButtonContainer: { paddingVertical: 20, alignItems: 'flex-end' },
  nextButtonText: { fontSize: 16, color: '#007BFF', fontWeight: 'bold' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  button: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center' },
  submitButton: { backgroundColor: '#70a1c1', marginRight: 10 },
  cancelButton: { backgroundColor: '#a9c8e0', marginLeft: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footer: { backgroundColor: '#90b4ce', padding: 20, alignItems: 'center' },
  footerText: { color: '#fff', fontSize: 14 },
});