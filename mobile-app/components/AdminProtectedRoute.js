import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const navigation = useNavigation();

  // If still loading or user not found, show loading state
  if (loading || !user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If user is not admin, redirect to home
  if (!isAdmin) {
    navigation.replace('HomePage');
    return null;
  }

  // User is admin, render the protected content
  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
});

export default AdminProtectedRoute;
