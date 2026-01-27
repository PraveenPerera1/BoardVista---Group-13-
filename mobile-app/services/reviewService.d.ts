export interface ReviewData {
  _id?: string;
  user: {
    name: string;
  };
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

export interface ReviewResponse {
  success: boolean;
  data?: ReviewData | ReviewData[];
  message?: string;
}

export const reviewService: {
  getReviews: (boardingHouseId: string) => Promise<ReviewResponse>;
  createReview: (reviewData: {
    boardingHouse: string;
    rating: number;
    title: string;
    comment: string;
  }) => Promise<ReviewResponse>;
};
