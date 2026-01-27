import { Feather, Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
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
import { reviewService } from '../services/reviewService';

// --- Types ---
interface Review {
  _id?: string;
  user?: {
    name?: string;
  };
  rating: number;
  title?: string;
  comment: string;
  createdAt?: string;
}

const { width } = Dimensions.get('window');

export default function ReviewScreen({ navigation }: { navigation?: any }) {
  const route = useRoute();
  const boardingId = route?.params?.boardingId || 'demo-id';
  const boardingTitle = route?.params?.boardingTitle || 'Boarding House';

  const [userRating, setUserRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // --- Fetch Reviews ---
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getReviews(boardingId);
      console.log('Reviews response:', response);
      
      // Handle different response formats
      let reviewsData = [];
      if (response && response.data) {
        reviewsData = response.data;
      } else if (Array.isArray(response)) {
        reviewsData = response;
      }
      
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Use mock data as fallback
      setReviews([
        {
          _id: '1',
          user: { name: 'Kasun Bandara' },
          rating: 5,
          title: 'Excellent Place!',
          comment: 'Perfect location for Vavuniya uni students.',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          user: { name: 'Amara Perera' },
          rating: 4,
          title: 'Good Experience',
          comment: 'The room is spacious and clean.',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // --- Helper: Render Stars ---
  const renderStars = (rating: number, size: number = 14, interactive: boolean = false, onStarPress?: (star: number) => void) => {
    return (
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            disabled={!interactive}
            onPress={() => interactive && onStarPress && onStarPress(star)}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={size}
              color={interactive && star <= rating ? '#FFD700' : (star <= rating ? '#FFD700' : '#DDD')}
              style={{ marginRight: 2 }}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleSubmitReview = async () => {
    if (userRating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating');
      return;
    }
    
    if (reviewTitle.trim() === '') {
      Alert.alert('Title Required', 'Please add a review title');
      return;
    }
    
    if (reviewText.trim() === '') {
      Alert.alert('Review Required', 'Please write a review comment');
      return;
    }

    try {
      setSubmitting(true);
      
      const reviewData = {
        boardingHouse: boardingId,
        rating: userRating,
        title: reviewTitle,
        comment: reviewText,
      };

      console.log('Submitting review:', reviewData);
      const response = await reviewService.createReview(reviewData);
      console.log('Review submitted:', response);
      
      // Reset form
      setUserRating(0);
      setReviewTitle('');
      setReviewText('');
      
      // Refresh reviews
      await fetchReviews();
      
      Alert.alert('Success', 'Your review has been submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* --- Header --- */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* --- Boarding Info --- */}
          <View style={styles.boardingInfoCard}>
            <Text style={styles.boardingTitle}>{boardingTitle}</Text>
            <Text style={styles.boardingSubtitle}>Share your experience</Text>
          </View>

          {/* --- Write Review Section --- */}
          <View style={styles.writeReviewCard}>
            <Text style={styles.sectionTitle}>Write Your Review</Text>

            {/* Star Rating */}
            <View style={styles.ratingContainer}>
              <Text style={styles.inputLabel}>Overall Rating *</Text>
              {renderStars(userRating, 32, true, setUserRating)}
            </View>
            
            {/* Review Title */}
            <TextInput
              style={styles.titleInput}
              placeholder="Review Title *"
              placeholderTextColor="#999"
              value={reviewTitle}
              onChangeText={setReviewTitle}
              maxLength={100}
            />
            
            {/* Review Comment */}
            <TextInput
              style={styles.commentInput}
              placeholder="Share your experience... *"
              placeholderTextColor="#999"
              multiline
              value={reviewText}
              onChangeText={setReviewText}
              maxLength={500}
            />
            
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmitReview}
              disabled={submitting}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* --- Reviews List --- */}
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          
          {loading ? (
            <Text style={styles.loadingText}>Loading reviews...</Text>
          ) : (
            reviews.map((item) => (
              <View key={item._id || item.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {item.user?.name || 'Anonymous User'}
                    </Text>
                    <Text style={styles.reviewDate}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                    </Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.ratingBadgeText}>{item.rating}</Text>
                  </View>
                </View>
                <Text style={styles.reviewTitleText}>{item.title}</Text>
                <Text style={styles.commentText}>{item.comment}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Space for the bottom input
  },
  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  // --- Overview Card ---
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bigRating: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  totalReviews: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  breakdownContainer: {
    flex: 1,
    marginLeft: 20,
  },
  starRow: {
    flexDirection: 'row',
  },
  // --- Rating Bars ---
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingBarLabel: {
    width: 70,
    fontSize: 11,
    color: '#555',
    fontWeight: '500',
  },
  ratingBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#1A1A1A', // Dark theme accent
    borderRadius: 3,
  },
  // --- Section Title ---
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  // --- Review Card ---
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  reviewDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E5', // Light yellow bg
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginLeft: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  // --- Bottom Input Area ---
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  starInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  textInput: {
    flex: 1,
    height: 45,
    fontSize: 14,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#2A7FFF', // Matching the Blue Verified/Active color from dashboard
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  // --- New Styles for Simplified Review Page ---
  boardingInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  boardingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  boardingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  writeReviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titleInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  commentInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  submitButton: {
    backgroundColor: '#2A7FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    padding: 20,
  },
});