import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Dynamic import for react-native-maps (native only)
let MapView: any = null;
let PROVIDER_GOOGLE: any = null;

const loadMaps = async () => {
  if (Platform.OS !== 'web') {
    try {
      const mapsModule = await import('react-native-maps');
      MapView = mapsModule.default;
      PROVIDER_GOOGLE = mapsModule.PROVIDER_GOOGLE;
    } catch (error) {
      console.log('Maps not available');
    }
  }
};

// ⚠️ Replace with your actual Google Maps API Key
//const GOOGLE_API_KEY = 'YOUR_ACTUAL_GOOGLE_API_KEY_HERE';

interface LocationResult {
  latitude: number;
  longitude: number;
  address: string;
}

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface Props {
  onConfirm: (result: LocationResult) => void;
  onClose: () => void;
}

export default function MapPicker({ onConfirm, onClose }: Props) {
  const [mapsLoaded, setMapsLoaded] = useState(false);
  
  // Load maps on component mount
  useEffect(() => {
    loadMaps().then(() => setMapsLoaded(true));
  }, []);
  
  // Web fallback - show message instead of map
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webFallback}>
          <Ionicons name="map-outline" size={64} color="#2A7FFF" />
          <Text style={styles.webFallbackText}>Map not available on web</Text>
          <Text style={styles.webFallbackSubtext}>Please use mobile app to select location</Text>
          <TouchableOpacity onPress={onClose} style={styles.webCloseBtn}>
            <Text style={styles.webCloseBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  // Show loading while maps are being loaded
  if (!mapsLoaded) {
    return (
      <View style={styles.container}>
        <View style={styles.webFallback}>
          <ActivityIndicator size="large" color="#2A7FFF" />
          <Text style={styles.webFallbackText}>Loading map...</Text>
        </View>
      </View>
    );
  }

  const [region, setRegion] = useState<Region>({
    latitude: 8.7542, // Default: Vavuniya
    longitude: 80.4982,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  
  const [address, setAddress] = useState('Locating...');
  const [isDragging, setIsDragging] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);
  
  // Timer to prevent too many API calls while dragging
  const debounceTimer = useRef<number | null>(null);

  // 1. Get User's Real Location on Start
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow location access to find your house.');
        setLoadingLocation(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const userRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setRegion(userRegion);
      fetchAddress(userRegion.latitude, userRegion.longitude);
      setLoadingLocation(false);
    })();
  }, []);

  // 2. Convert Coordinates to Address (Reverse Geocoding)
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      // Temporarily disabled to prevent API errors
      setAddress('Location selected');
      return;
      
      // Uncomment below when you have a real API key
      /*
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      if (data.status === 'OK' && data.results[0]) {
        setAddress(data.results[0].formatted_address);
      } else {
        setAddress('Unknown Location');
      }
      */
    } catch (error) {
      setAddress('Could not fetch address');
    }
  };

  // 3. Handle Map Dragging
  const onRegionChange = () => {
    setIsDragging(true);
  };

  const onRegionChangeComplete = (newRegion: Region) => {
    setIsDragging(false);
    setRegion(newRegion);
    
    // Clear previous timer
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    // Wait 0.8 seconds after stopping before checking Google (Saves money!)
    debounceTimer.current = setTimeout(() => {
      fetchAddress(newRegion.latitude, newRegion.longitude);
    }, 800);
  };

  const handleConfirm = () => {
    onConfirm({
      latitude: region.latitude,
      longitude: region.longitude,
      address: address,
    });
    onClose();
  };

  return (
    <View style={styles.container}>
      {/* MAP */}
      {MapView && (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={region}
          onRegionChange={onRegionChange}
          onRegionChangeComplete={onRegionChangeComplete}
          showsUserLocation={true}
        />
      )}
      
      {!MapView && (
        <View style={styles.mapFallback}>
          <Text style={styles.mapFallbackText}>Map unavailable</Text>
        </View>
      )}

      {/* FIXED CENTER PIN (The "Scope") */}
      <View style={styles.fixedMarker}>
        <Ionicons name="location" size={48} color="#E63946" style={{ marginBottom: 48 }} />
      </View>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pin Location</Text>
      </View>

      {/* BOTTOM PANEL */}
      <View style={styles.footer}>
        <Text style={styles.label}>SELECTED ADDRESS</Text>
        <View style={styles.addressBox}>
          <Ionicons name="map-outline" size={20} color="#2A7FFF" />
          <Text style={styles.addressText} numberOfLines={2}>
            {isDragging ? 'Locating...' : address}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.confirmBtn, isDragging && styles.disabledBtn]} 
          onPress={handleConfirm}
          disabled={isDragging}
        >
          <Text style={styles.confirmText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>

      {loadingLocation && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2A7FFF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { width: '100%', height: '100%' },
  
  // Centers the pin exactly
  fixedMarker: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: 'center', 
    alignItems: 'center',
    pointerEvents: 'none', // Allows touch to pass through to map
  },
  
  header: {
    position: 'absolute', 
    top: 50, left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center',
  },
  closeBtn: {
    backgroundColor: '#fff', padding: 10, borderRadius: 20,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4
  },
  headerTitle: {
    marginLeft: 15, fontSize: 18, fontWeight: '700', 
    color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4
  },
  
  footer: {
    position: 'absolute', bottom: 0, width: '100%',
    backgroundColor: '#fff', 
    padding: 25, paddingBottom: 40,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10
  },
  label: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 8 },
  addressBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F7FA', padding: 16, borderRadius: 12, marginBottom: 20
  },
  addressText: { flex: 1, marginLeft: 10, fontSize: 14, color: '#1A1A1A', fontWeight: '500' },
  confirmBtn: {
    backgroundColor: '#1A1A1A', padding: 18, borderRadius: 14, alignItems: 'center'
  },
  disabledBtn: { backgroundColor: '#999' },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center', alignItems: 'center'
  },
  
  // Web fallback styles
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa'
  },
  webFallbackText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 20,
    marginBottom: 8
  },
  webFallbackSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30
  },
  webCloseBtn: {
    backgroundColor: '#2A7FFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8
  },
  webCloseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  
  mapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0'
  },
  mapFallbackText: {
    fontSize: 16,
    color: '#666'
  }
});