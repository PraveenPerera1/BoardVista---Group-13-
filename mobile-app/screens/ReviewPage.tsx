import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
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

// --- Types ---
interface Review {
  id: string;
  userName: string;
  date: string;
  rating: number;
  comment: string;
}

// --- Mock Data ---
const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    userName: 'Kasun Bandara',
    date: '2 days ago',
    rating: 5,
    comment: 'Perfect location for Vavuniya uni students. Just 5 mins walking distance to the faculty. The owner is very helpful!',
  },
  {
    id: '2',
    userName: 'Amara Perera',
    date: '1 week ago',
    rating: 4,
    comment: 'The room is spacious and clean. The only issue was the wifi speed, but manageable for studies.',
  },
  {
    id: '3',
    userName: 'S. Kumar',
    date: '2 weeks ago',
    rating: 5,
    comment: 'Highly verified place. Security is good. Worth the price.',
  },
];

const { width } = Dimensions.get('window');

export default function ReviewScreen({ navigation }: { navigation?: any }) {
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState(MOCK_REVIEWS);

  // --- Helper: Render Stars ---
  const renderStars = (rating: number, size: number = 14) => {
    return (
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color="#FFD700"
            style={{ marginRight: 2 }}
          />
        ))}
      </View>
    );
  };

  // --- Helper: Rating Breakdown Bar ---
  const renderRatingBar = (label: string, value: number) => (
    <View style={styles.ratingBarContainer}>
      <Text style={styles.ratingBarLabel}>{label}</Text>
      <View style={styles.ratingBarBackground}>
        <View style={[styles.ratingBarFill, { width: `${value}%` }]} />
      </View>
    </View>
  );

  const handleSubmitReview = () => {
    if (reviewText.trim() === '') return;
    
    const newReview: Review = {
      id: Math.random().toString(),
      userName: 'Me', // Replace with logged in user
      date: 'Just now',
      rating: userRating || 5,
      comment: reviewText,
    };

    setReviews([newReview, ...reviews]);
    setReviewText('');
    setUserRating(0);
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
        <View style={{ width: 40 }} /> {/* Spacer for balance */}
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* --- Overall Rating Card --- */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <View>
                <Text style={styles.bigRating}>4.8</Text>
                <Text style={styles.totalReviews}>Based on 124 reviews</Text>
                {renderStars(5, 18)}
              </View>
              <View style={styles.breakdownContainer}>
                {renderRatingBar('Cleanliness', 90)}
                {renderRatingBar('Location', 85)}
                {renderRatingBar('Value', 95)}
                {renderRatingBar('Safety', 100)}
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>User Reviews</Text>

          {/* --- Review List --- */}
          {reviews.map((item) => (
            <View key={item.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.userName}</Text>
                  <Text style={styles.reviewDate}>{item.date}</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text style={styles.ratingBadgeText}>{item.rating}</Text>
                </View>
              </View>
              <Text style={styles.commentText}>{item.comment}</Text>
            </View>
          ))}
        </ScrollView>

        {/* --- Write Review Input --- */}
        <View style={styles.inputContainer}>
          <View style={styles.starInputRow}>
            <Text style={styles.inputLabel}>Rate your stay:</Text>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                <Ionicons
                  name={star <= userRating ? 'star' : 'star-outline'}
                  size={24}
                  color={star <= userRating ? '#FFD700' : '#DDD'}
                  style={{ marginLeft: 5 }}
                />
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Write a review..."
              placeholderTextColor="#999"
              multiline
              value={reviewText}
              onChangeText={setReviewText}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSubmitReview}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

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
});