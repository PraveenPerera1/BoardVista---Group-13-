import AsyncStorage from '@react-native-async-storage/async-storage';
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
      <Text style={styles.subtitle}>Manage Users</Text>
    </View>
  </ImageBackground>
);

// --- Footer Component ---
const AppFooter = () => (
  <View style={styles.footer}>
    <Text style={styles.footerText}>© 2025 BoardVista • All Rights Reserved</Text>
  </View>
);

export default function AdminUsersScreen() {
  const navigation = useNavigation();
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentAdminId, setCurrentAdminId] = useState(null); // To prevent admin from blocking themselves

  useEffect(() => {
    // Get current admin ID from storage (this would be set during login)
    const getCurrentAdminId = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          // In a real app, you'd decode the token to get user ID
          // For now, we'll use a placeholder or get it from login response
          const adminId = await AsyncStorage.getItem('currentAdminId');
          setCurrentAdminId(adminId);
        }
      } catch (error) {
        console.error('Error getting admin ID:', error);
      }
    };
    
    getCurrentAdminId();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAllUsers();
      setUsers(data.users || data.data || []);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId, userName, currentBlocked) => {
    if (userId === currentAdminId) {
      Alert.alert('Error', 'You cannot block yourself');
      return;
    }

    const action = currentBlocked ? 'unblock' : 'block';
    const message = currentBlocked 
      ? `Are you sure you want to unblock "${userName}"?`
      : `Are you sure you want to block "${userName}"?`;

    Alert.alert(
      `Confirm ${action}`,
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: currentBlocked ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await adminService.toggleUserBlock(userId, !currentBlocked);
              setUsers(prev => 
                prev.map(user => 
                  user._id === userId 
                    ? { ...user, blocked: !currentBlocked }
                    : user
                )
              );
              Alert.alert(
                'Success', 
                `User ${currentBlocked ? 'unblocked' : 'blocked'} successfully`
              );
            } catch (error) {
              console.error('Error toggling user block:', error);
              Alert.alert('Error', `Failed to ${action} user`);
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
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUsers}>
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
          
          {/* --- Users List --- */}
          <View style={styles.formCard}>
            <Text style={styles.title}>All Users</Text>
            <Text style={styles.sectionSubtitle}>Manage user accounts</Text>

            {users.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            ) : (
              users.map((user) => (
                <View key={user._id} style={styles.userItem}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}> {user.email}</Text>
                    <Text style={styles.userStatus}>
                      Status: {user.blocked ? ' Blocked' : ' Active'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.blockButton,
                      user._id === currentAdminId && styles.disabledButton
                    ]}
                    onPress={() => handleToggleBlock(user._id, user.name, user.blocked)}
                    disabled={user._id === currentAdminId}
                  >
                    <Text style={[
                      styles.blockButtonText,
                      user._id === currentAdminId && styles.disabledButtonText
                    ]}>
                      {user.blocked ? ' Unblock' : ' Block'}
                    </Text>
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


