import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Alert,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import AdminProtectedRoute from '../components/AdminProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/adminService';

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
      <Text style={styles.subtitle}>Manage Boardings</Text>
    </View>
  </ImageBackground>
);

// --- Footer Component ---
const AppFooter = () => (
  <View style={styles.footer}>
    <Text style={styles.footerText}>© 2025 BoardVista • All Rights Reserved</Text>
  </View>
);

export default function AdminBoardingsScreen() {
  const navigation = useNavigation();
  const { isAdmin } = useAuth();
  const [boardings, setBoardings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBoardings();
  }, []);

  const loadBoardings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAllBoardings();
      setBoardings(data.boardings || data.data || []);
    } catch (err) {
      setError('Failed to load boardings');
      console.error('Error loading boardings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBoarding = (boardingId, boardingTitle) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${boardingTitle}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteBoarding(boardingId);
              setBoardings(prev => prev.filter(b => b._id !== boardingId));
              Alert.alert('Success', 'Boarding deleted successfully');
            } catch (error) {
              console.error('Error deleting boarding:', error);
              Alert.alert('Error', 'Failed to delete boarding');
            }
          },
        },
      ]
    );
  };

  const backToAdmin = () => {
    navigation.navigate("AdminLanding");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading boardings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBoardings}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          
          {/* --- Boardings List --- */}
          <View style={styles.formCard}>
            <Text style={styles.title}>All Boardings</Text>
            <Text style={styles.sectionSubtitle}>Manage boarding house listings</Text>

            {boardings.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No boardings found</Text>
              </View>
            ) : (
              boardings.map((boarding) => (
                <View key={boarding._id} style={styles.boardingItem}>
                  <View style={styles.boardingInfo}>
                    <Text style={styles.boardingTitle}>{boarding.title}</Text>
                    <Text style={styles.boardingEmail}> {boarding.contact?.email || 'N/A'}</Text>
                    <Text style={styles.boardingDate}> {new Date(boarding.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteBoarding(boarding._id, boarding.title)}
                  >
                    <Text style={styles.deleteButtonText}> Delete</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("AdminLanding")}>
            <Text style={styles.backButtonText}>← Back to Admin</Text>
          </TouchableOpacity>

          <AppFooter />
        </ScrollView>
      </SafeAreaView>
    </AdminProtectedRoute>
  );
}


