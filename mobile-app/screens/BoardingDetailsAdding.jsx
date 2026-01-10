import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  Alert,
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

// --- Helper Component: Reusable Form Input Row ---
const FormInput = ({ label, ...props }) => (
  <View style={styles.inputRow}>
    <Text style={styles.rowLabel}>{label}</Text>
    <TextInput style={styles.rowInput} placeholderTextColor="#999" {...props} />
  </View>
);

// --- Helper Component: Reusable Multiline Form Input ---
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

// --- Helper Component: Custom Checkbox (No icon library needed) ---
const CustomCheckbox = ({ label, value, onValueChange }) => (
  <TouchableOpacity
    style={styles.checkboxContainer}
    onPress={() => onValueChange(!value)}>
    <View style={[styles.checkbox, value && styles.checkboxChecked]}>
      {/* This is a simple text 'check' mark */}
      {value && <Text style={styles.checkboxCheck}>✓</Text>}
    </View>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

// --- Main Screen Component ---
export default function AddListingScreen() {

    const navigation = useNavigation();
    const LogoutHandler = ()=>{
    navigation.replace("HomePage");
  }
    const UserDashboardHandler = ()=>{
         navigation.replace("Dashboard");
     }
    const skipHandler=()=>{
        navigation.replace("Dashboard");
    }
  // State to manage which step we are on
  const [step, setStep] = useState(1);

  // State for form fields
  const [accommodationType, setAccommodationType] = useState('Male');
  const [agreed, setAgreed] = useState(false);

  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
    capacity: '',
    monthlyRent: '',
    description: '',
    nearbyServices: ''
  });

  // State for photos
  const [photos, setPhotos] = useState([]);

  // State for facilities checkboxes
  const [facilities, setFacilities] = useState({
    wifi: false,
    parking: false,
    laundry: false,
    kitchen: false,
    airConditioning: false,
    hotWater: false,
    studyRoom: false,
    security: false,
    cctv: false,
    backupPower: false,
    waterSupply: false,
  });

  // Handler to toggle facilities
  const toggleFacility = (key) => {
    setFacilities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Image picker handler
  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.6, allowsEditing: true });
    if (res.cancelled) return;
    setPhotos(prev => [...prev, res.uri]);
  };

  // Function to remove photo
  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!formData.name || !formData.address || !formData.monthlyRent) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!agreed) {
      Alert.alert('Error', 'Please agree to the policies');
      return;
    }

    try {
      // Convert facilities object to array
      const facilitiesArray = Object.entries(facilities)
        .filter(([key, value]) => value)
        .map(([key]) => {
          // Map to your backend's facility names
          const facilityMap = {
            wifi: 'WiFi',
            parking: 'Parking',
            laundry: 'Laundry',
            kitchen: 'Kitchen',
            airConditioning: 'Air Conditioning',
            hotWater: 'Hot Water',
            studyRoom: 'Study Room',
            security: 'Security',
            cctv: 'CCTV',
            backupPower: 'Backup Power',
            waterSupply: 'Water Supply'
          };
          return facilityMap[key];
        });

      const boardingData = {
        title: formData.name,
        address: {
          street: formData.address,
          city: 'Vavuniya'
        },
        coordinates: {
          latitude: 8.7548,
          longitude: 80.4979
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
        images: photos.map(uri => ({ url: uri })), // Include uploaded photos
        description: formData.description,
        isAvailable: true,
        isVerified: false
      };

      await boardingService.createBoarding(boardingData);
      Alert.alert('Success', 'Boarding listing created successfully!');
      navigation.replace('Dashboard');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create boarding listing');
    }
  };

  // --- Header Component ---
  const renderHeader = () => (
    <ImageBackground
      source={require("../assets/images/background.jpg")} // Placeholder
      style={styles.headerBackground}>
      <View style={styles.headerOverlay}>
        <Text style={styles.logo}>BOARDVISTA</Text>
        <Text style={styles.subtitle}>Discover the Best Stays in Vavuniya</Text>
        {/*<View style={styles.navLinks}>
          <Text style={styles.navLink}>Home</Text>
          <Text style={styles.navLink}>About Us</Text>
          <Text style={styles.navLink}>Reviews</Text>
          <Text style={styles.navLink}>Contact Us</Text>
        </View>*/}
        {/* Owner top bar */}
        <View style={styles.userContainer}>
          <Text style={styles.headerIconText}>[User]</Text>
          <Text style={styles.headerText}>Hi, Owner!</Text>
          <TouchableOpacity onPress={LogoutHandler}>
            <Text style={styles.headerIconText}>[Exit]</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );

  // --- Sub-Header (Back arrow and Chat) ---
  const renderSubHeader = () => (
    <View style={styles.subHeader}>
      <TouchableOpacity
        onPress={() => {
          if (step === 2) setStep(1); // Go back to step 1
          // else: add navigation.goBack() here for step 1
        }}>
        <Text style={styles.backArrow}>←back</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={skipHandler}>
        {/* Placeholder for chat icon */}
        <Text style={styles.skipIcon}>Skip</Text>
      </TouchableOpacity>
    </View>
  );

  // --- Renders the Form for Step 1 ---
  const renderStep1 = () => (
    <>
      {/* Accommodation Type Toggles */}
      <View style={styles.inputRow}>
        <Text style={styles.rowLabel}>Accommodation Type</Text>
        <View style={styles.toggleContainer}>
          {['Male', 'Female'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.toggleButton,
                accommodationType === type && styles.toggleActive,
              ]}
              onPress={() => setAccommodationType(type)}>
              <Text
                style={[
                  styles.toggleText,
                  accommodationType === type && styles.toggleTextActive,
                ]}>
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
      <FormInput 
        label="Address" 
        placeholder="Enter full address" 
        value={formData.address}
        onChangeText={(text) => setFormData(prev => ({...prev, address: text}))}
      />
      <FormInput
        label="E-mail address"
        placeholder="example@gmail.com"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={(text) => setFormData(prev => ({...prev, email: text}))}
      />
      <FormInput
        label="Contact Number"
        placeholder="077-XXXXXXX"
        keyboardType="phone-pad"
        value={formData.phone}
        onChangeText={(text) => setFormData(prev => ({...prev, phone: text}))}
      />

      {/* Facilities Checkboxes */}
      <View style={styles.inputRowMulti}>
        <Text style={styles.rowLabelMulti}>Facilities</Text>
        <View style={styles.facilitiesGrid}>
          {/* Column 1 */}
          <View style={styles.facilitiesColumn}>
            <CustomCheckbox
              label="WiFi"
              value={facilities.wifi}
              onValueChange={() => toggleFacility('wifi')}
            />
            <CustomCheckbox
              label="Parking"
              value={facilities.parking}
              onValueChange={() => toggleFacility('parking')}
            />
            <CustomCheckbox
              label="Laundry"
              value={facilities.laundry}
              onValueChange={() => toggleFacility('laundry')}
            />
            <CustomCheckbox
              label="Air Conditioning"
              value={facilities.airConditioning}
              onValueChange={() => toggleFacility('airConditioning')}
            />
          </View>
          {/* Column 2 */}
          <View style={styles.facilitiesColumn}>
            <CustomCheckbox
              label="Kitchen"
              value={facilities.kitchen}
              onValueChange={() => toggleFacility('kitchen')}
            />
            <CustomCheckbox
              label="Hot Water"
              value={facilities.hotWater}
              onValueChange={() => toggleFacility('hotWater')}
            />
            <CustomCheckbox
              label="Study Room"
              value={facilities.studyRoom}
              onValueChange={() => toggleFacility('studyRoom')}
            />
            <CustomCheckbox
              label="Security"
              value={facilities.security}
              onValueChange={() => toggleFacility('security')}
            />
          </View>
          {/* Column 3 */}
          <View style={styles.facilitiesColumn}>
            <CustomCheckbox
              label="CCTV"
              value={facilities.cctv}
              onValueChange={() => toggleFacility('cctv')}
            />
            <CustomCheckbox
              label="Backup Power"
              value={facilities.backupPower}
              onValueChange={() => toggleFacility('backupPower')}
            />
            <CustomCheckbox
              label="Water Supply"
              value={facilities.waterSupply}
              onValueChange={() => toggleFacility('waterSupply')}
            />
            <CustomCheckbox
              label="Study Area"
              value={facilities.studyArea}
              onValueChange={() => toggleFacility('studyArea')}
            />
          </View>
        </View>
      </View>

      <FormInput
        label="Capacity"
        placeholder="e.g., 8"
        keyboardType="number-pad"
        value={formData.capacity}
        onChangeText={(text) => setFormData(prev => ({...prev, capacity: text}))}
      />
      <FormInput
        label="Monthly Rent"
        placeholder="Rs. XXXXX"
        keyboardType="number-pad"
        value={formData.monthlyRent}
        onChangeText={(text) => setFormData(prev => ({...prev, monthlyRent: text}))}
      />

      {/* Next Button */}
      <View style={styles.nextButtonContainer}>
        <TouchableOpacity onPress={() => setStep(2)}>
          <Text style={styles.nextButtonText}>Next </Text>
        </TouchableOpacity>
      </View>
    </>
  )
  // --- Renders the Form for Step 2 ---
  const renderStep2 = () => (
    <>
      <FormInputMulti
        label="Description"
        placeholder="Add a description about the boarding..."
        value={formData.description}
        onChangeText={(text) => setFormData(prev => ({...prev, description: text}))}
      />
      <FormInputMulti
        label="Nearby Services"
        placeholder="e.g., Bus stop, Supermarket, Bank..."
        value={formData.nearbyServices}
        onChangeText={(text) => setFormData(prev => ({...prev, nearbyServices: text}))}
      />

      {/* Image Uploader */}
      <View style={styles.inputRowMulti}>
        <Text style={styles.rowLabelMulti}>Add images</Text>
        <View style={styles.imagePickerBox}>
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            <Text style={styles.imagePickerPlus}>+</Text>
          </TouchableOpacity>
          <Text style={styles.imagePickerLabel}>{photos.length} of 5 images</Text>
        </View>
        {/* Image Preview */}
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

      {/* Policy Agreement */}
      <CustomCheckbox
        label="Owner agreed to BoardVista policies"
        value={agreed}
        onValueChange={setAgreed}
      />

      {/* Form Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
          <Text style={styles.buttonText}>SUBMIT</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => setStep(1)} // Go back to step 1
        >
          <Text style={styles.buttonText}>CANCEL</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  // --- Final Render ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {renderHeader()}
        {renderSubHeader()}

        {/* Form Content: Renders Step 1 or Step 2 */}
        <View style={styles.formContainer}>
          {step === 1 ? renderStep1() : renderStep2()}
        </View>
      </ScrollView>

      {/* --- BOTTOM FOOTER --- */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 BoardVista</Text>
      </View>
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
    height: 180, // Shorter header for internal pages
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(58, 90, 120, 0.8)',
    alignItems: 'center',
    padding: 15,
    justifyContent: 'center',
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
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
  userContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
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
  },
  // Sub-Header
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
  },
  skipIcon: {
    fontSize: 20,
    color: '#111111ff',
  },
  // Form Container
  formContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f8', // Light gray background
  },
  // Input Rows
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  inputRowMulti: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  rowLabelMulti: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 10,
  },
  rowInput: {
    flex: 2,
    fontSize: 14,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  multilineInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    height: 100,
    textAlignVertical: 'top',
  },
  // Accommodation Toggles
  toggleContainer: {
    flex: 2,
    flexDirection: 'row',
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  toggleActive: {
    backgroundColor: '#007BFF',
  },
  toggleText: {
    fontSize: 12,
    color: '#333',
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Facilities Grid
  facilitiesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 10,
  },
  facilitiesColumn: {
    flex: 1,
  },
  // Custom Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#999',
    backgroundColor: '#fff',
    borderRadius: 3,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  checkboxCheck: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },
  // Image Picker
  imagePickerBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  imagePickerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imagePickerPlus: {
    fontSize: 30,
    color: '#999',
    lineHeight: 30, // Center the '+'
  },
  imagePickerLabel: {
    marginTop: 10,
    fontSize: 12,
    color: '#999',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  imagePreview: {
    width: 80,
    height: 80,
    marginRight: 10,
    marginBottom: 10,
    position: 'relative',
  },
  imageThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Buttons
  nextButtonContainer: {
    paddingVertical: 20,
    alignItems: 'flex-end',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#70a1c1', // Blue-gray from image
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#a9c8e0', // Lighter blue-gray from image
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
});