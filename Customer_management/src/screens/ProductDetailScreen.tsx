import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import React, { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Ionicons from '@react-native-vector-icons/ionicons';
import {
  fetchProductById,
  fetchProductFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  Feedback,
} from '../api/apiClient';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

type RouteParams = RouteProp<{ params: { productId: string } }, 'params'>;

// ─── Star Rating Component ──────────────────────────────────
function StarRating({
  rating,
  size = 16,
  onPress,
}: {
  rating: number;
  size?: number;
  onPress?: (star: number) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onPress?.(star)} disabled={!onPress}>
          <Ionicons
            name={star <= rating ? 'star' : star - rating < 1 ? 'star-half' : 'star-outline'}
            size={size}
            color="#f59e0b"
          />
        </Pressable>
      ))}
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────
const ProductDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const productId = route.params.productId;
  const queryClient = useQueryClient();

  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?.id || null;

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProductById(productId),
  });

  const { data: feedbacks, isLoading: feedbackLoading } = useQuery({
    queryKey: ['feedbacks', productId],
    queryFn: () => fetchProductFeedback(productId),
  });

  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const qty = useCartStore((s) => s.getItemQty(productId));

  const price = product
    ? typeof product.price === 'string'
      ? parseFloat(product.price)
      : product.price
    : 0;

  // ─── Stats ──────────────────────────────────────
  const avgRating = useMemo(() => {
    if (!feedbacks || feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    return Math.round((sum / feedbacks.length) * 10) / 10;
  }, [feedbacks]);

  const myFeedback = useMemo(() => {
    if (!feedbacks || !currentUserId) return null;
    return feedbacks.find((f) => {
      const uid = typeof f.userId === 'object' ? f.userId.id : f.userId;
      return uid === currentUserId;
    });
  }, [feedbacks, currentUserId]);

  // ─── Mutations ──────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: { productId: string; rating: number; comment?: string }) =>
      createFeedback(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks', productId] });
      setReviewModalVisible(false);
      resetForm();
      Alert.alert('Success', 'Your review has been posted!');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to post review');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { rating?: number; comment?: string } }) =>
      updateFeedback(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks', productId] });
      setReviewModalVisible(false);
      setEditingFeedback(null);
      resetForm();
      Alert.alert('Success', 'Your review has been updated!');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update review');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFeedback(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks', productId] });
      Alert.alert('Deleted', 'Your review has been removed');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to delete review');
    },
  });

  const resetForm = () => {
    setReviewRating(5);
    setReviewComment('');
  };

  const handleOpenReviewModal = (feedback?: Feedback) => {
    if (feedback) {
      setEditingFeedback(feedback);
      setReviewRating(feedback.rating);
      setReviewComment(feedback.comment || '');
    } else {
      setEditingFeedback(null);
      resetForm();
    }
    setReviewModalVisible(true);
  };

  const handleSubmitReview = () => {
    if (editingFeedback) {
      updateMutation.mutate({
        id: editingFeedback.id,
        data: { rating: reviewRating, comment: reviewComment },
      });
    } else {
      createMutation.mutate({
        productId,
        rating: reviewRating,
        comment: reviewComment,
      });
    }
  };

  const handleDeleteReview = (id: string) => {
    Alert.alert('Delete Review', 'Are you sure you want to delete your review?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  if (productLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#16a34a" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500 text-[16px]">Product not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Back Button */}
      <View className="absolute top-12 left-4 z-10">
        <Pressable
          className="w-10 h-10 rounded-full bg-white/90 items-center justify-center"
          style={{ shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#111" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View className="h-[280px] bg-gray-100">
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-gray-200">
              <Text className="text-gray-400 font-extrabold text-4xl">
                {product.name?.substring(0, 2)?.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="px-5 pt-5 pb-3">
          <Text className="text-[24px] font-extrabold text-gray-900 leading-8">
            {product.name}
          </Text>

          {/* Rating Row */}
          <View className="flex-row items-center mt-2">
            <StarRating rating={avgRating} size={18} />
            <Text className="text-[14px] font-bold text-gray-700 ml-2">
              {avgRating > 0 ? avgRating.toFixed(1) : '—'}
            </Text>
            <Text className="text-[13px] text-gray-400 ml-1">
              ({feedbacks?.length || 0} {feedbacks?.length === 1 ? 'review' : 'reviews'})
            </Text>
          </View>

          <Text className="text-[28px] font-extrabold text-green-600 mt-3">
            ${price}
          </Text>

          {product.description ? (
            <Text className="text-[14px] text-gray-500 leading-[22px] mt-3">
              {product.description}
            </Text>
          ) : null}

          {/* Add to Cart */}
          <View className="mt-5">
            {qty === 0 ? (
              <Pressable
                className="bg-green-600 rounded-2xl py-4 items-center"
                onPress={() =>
                  addItem({
                    id: product.id,
                    name: product.name,
                    price,
                    imageUrl: product.imageUrl,
                  })
                }
              >
                <Text className="text-white font-extrabold text-[15px] tracking-wider">
                  ADD TO CART
                </Text>
              </Pressable>
            ) : (
              <View className="flex-row items-center justify-center bg-green-600 rounded-2xl py-3">
                <Pressable className="px-6 py-1" onPress={() => removeItem(product.id)}>
                  <Text className="text-white font-extrabold text-[20px]">−</Text>
                </Pressable>
                <Text className="text-white font-extrabold text-[18px] mx-4">{qty}</Text>
                <Pressable
                  className="px-6 py-1"
                  onPress={() =>
                    addItem({
                      id: product.id,
                      name: product.name,
                      price,
                      imageUrl: product.imageUrl,
                    })
                  }
                >
                  <Text className="text-white font-extrabold text-[20px]">+</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* ─── Reviews Section ──────────────────────────── */}
        <View className="px-5 pt-4 pb-8">
          <View className="h-[1px] bg-gray-100 mb-5" />

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[18px] font-extrabold text-gray-900">
              Reviews
            </Text>

            {myFeedback ? (
              <Pressable
                className="bg-gray-100 rounded-xl px-4 py-2"
                onPress={() => handleOpenReviewModal(myFeedback)}
              >
                <Text className="text-gray-700 font-bold text-[12px]">Edit Your Review</Text>
              </Pressable>
            ) : (
              <Pressable
                className="bg-green-600 rounded-xl px-4 py-2"
                onPress={() => handleOpenReviewModal()}
              >
                <Text className="text-white font-bold text-[12px]">Write a Review</Text>
              </Pressable>
            )}
          </View>

          {feedbackLoading ? (
            <ActivityIndicator size="small" color="#16a34a" />
          ) : feedbacks && feedbacks.length > 0 ? (
            feedbacks.map((fb) => {
              const userName =
                typeof fb.userId === 'object'
                  ? fb.userId.name || fb.userId.email || 'User'
                  : 'User';
              const isOwn =
                currentUserId &&
                (typeof fb.userId === 'object' ? fb.userId.id : fb.userId) === currentUserId;

              return (
                <View
                  key={fb.id}
                  className="bg-gray-50 rounded-2xl p-4 mb-3"
                  style={{
                    borderWidth: isOwn ? 1.5 : 0,
                    borderColor: isOwn ? '#16a34a' : 'transparent',
                  }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      {/* Avatar */}
                      <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-2.5">
                        <Text className="text-green-700 font-bold text-[12px]">
                          {userName.substring(0, 1).toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-[13px] font-bold text-gray-900">
                          {userName}
                          {isOwn ? ' (You)' : ''}
                        </Text>
                        <Text className="text-[11px] text-gray-400">
                          {new Date(fb.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <StarRating rating={fb.rating} size={14} />
                  </View>

                  {fb.comment ? (
                    <Text className="text-[13px] text-gray-600 leading-[20px] ml-[42px]">
                      {fb.comment}
                    </Text>
                  ) : null}

                  {isOwn && (
                    <View className="flex-row justify-end gap-3 mt-2">
                      <Pressable onPress={() => handleOpenReviewModal(fb)}>
                        <Text className="text-blue-600 font-semibold text-[12px]">Edit</Text>
                      </Pressable>
                      <Pressable onPress={() => handleDeleteReview(fb.id)}>
                        <Text className="text-red-500 font-semibold text-[12px]">Delete</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <View className="items-center py-8">
              <Ionicons name="chatbubble-outline" size={36} color="#d1d5db" />
              <Text className="text-gray-400 font-semibold text-[14px] mt-3">
                No reviews yet. Be the first!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ─── Review Modal ────────────────────────────── */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setReviewModalVisible(false)}
        />
        <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-[20px] font-extrabold text-gray-900">
              {editingFeedback ? 'Edit Review' : 'Write a Review'}
            </Text>
            <Pressable onPress={() => setReviewModalVisible(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </Pressable>
          </View>

          {/* Star Selector */}
          <Text className="text-[14px] font-bold text-gray-700 mb-2">
            Your Rating
          </Text>
          <View className="flex-row gap-2 mb-5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setReviewRating(star)}>
                <Ionicons
                  name={star <= reviewRating ? 'star' : 'star-outline'}
                  size={36}
                  color="#f59e0b"
                />
              </Pressable>
            ))}
          </View>

          {/* Comment */}
          <Text className="text-[14px] font-bold text-gray-700 mb-2">
            Comment (optional)
          </Text>
          <View className="bg-gray-50 rounded-xl p-3 mb-6 min-h-[100px]">
            <TextInput
              className="text-[14px] text-gray-800 p-0"
              placeholder="Share your experience with this product..."
              placeholderTextColor="#9ca3af"
              multiline
              value={reviewComment}
              onChangeText={setReviewComment}
            />
          </View>

          {/* Submit */}
          <Pressable
            className={`bg-green-600 rounded-2xl py-4 items-center ${
              createMutation.isPending || updateMutation.isPending ? 'opacity-70' : ''
            }`}
            disabled={createMutation.isPending || updateMutation.isPending}
            onPress={handleSubmitReview}
          >
            <Text className="text-white font-extrabold text-[15px] tracking-wider">
              {createMutation.isPending || updateMutation.isPending
                ? 'SUBMITTING...'
                : editingFeedback
                ? 'UPDATE REVIEW'
                : 'POST REVIEW'}
            </Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;
