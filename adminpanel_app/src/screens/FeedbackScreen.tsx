import React from 'react';
import { View, Text, FlatList, ActivityIndicator, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchAllFeedback } from '../api/apiClient';
import Ionicons from '@expo/vector-icons/Ionicons';

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={size}
          color="#f59e0b"
        />
      ))}
    </View>
  );
}

const FeedbackScreen = () => {
  const { data: feedbacks, isLoading, isError } = useQuery({
    queryKey: ['adminFeedbacks'],
    queryFn: fetchAllFeedback,
  });

  const renderFeedbackItem = ({ item }: any) => {
    const userName = item.userId?.name || item.userId?.email || 'Unknown User';
    const productName = item.productId?.name || 'Unknown Product';
    const productImage = item.productId?.imageUrl;

    return (
      <View
        className="bg-white p-4 rounded-xl mb-3 border border-gray-100"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }}
      >
        {/* Product Info Row */}
        <View className="flex-row items-center mb-3">
          <View className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden mr-3">
            {productImage ? (
              <Image
                source={{ uri: productImage }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center bg-gray-200">
                <Text className="text-gray-400 font-bold text-[10px]">
                  {productName?.substring(0, 2)?.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-[14px] font-bold text-gray-900" numberOfLines={1}>
              {productName}
            </Text>
            {item.productId?.price !== undefined && (
              <Text className="text-[12px] text-gray-500">
                ${item.productId.price}
              </Text>
            )}
          </View>
        </View>

        {/* Divider */}
        <View className="h-[1px] bg-gray-100 mb-3" />

        {/* Review Content */}
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-center flex-1 mr-3">
            {/* Avatar */}
            <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2.5">
              <Text className="text-blue-700 font-bold text-[12px]">
                {userName.substring(0, 1).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-[13px] font-semibold text-gray-800">
                {userName}
              </Text>
              <Text className="text-[11px] text-gray-400">
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <StarRating rating={item.rating} />
        </View>

        {item.comment ? (
          <Text className="text-[13px] text-gray-600 leading-[20px] mt-2 ml-[42px]">
            {item.comment}
          </Text>
        ) : (
          <Text className="text-[12px] text-gray-400 italic mt-2 ml-[42px]">
            No comment
          </Text>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View
        className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-100 pb-4"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }}
      >
        <Text className="text-2xl font-bold pl-2 mt-4 text-gray-800">
          Feedback
        </Text>
        {feedbacks && (
          <Text className="text-[13px] text-gray-400 mt-4 pr-2">
            {feedbacks.length} review{feedbacks.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500">Error loading feedback</Text>
        </View>
      ) : feedbacks?.length === 0 ? (
        <View className="flex-1 items-center justify-center pt-24 pb-10 px-4">
          <Ionicons name="chatbubble-outline" size={48} color="#d1d5db" />
          <Text className="text-gray-500 mt-4 font-bold text-lg">No Feedback Yet</Text>
          <Text className="text-gray-400 text-[13px] mt-1 text-center">
            Customer reviews will appear here once they start sharing feedback.
          </Text>
        </View>
      ) : (
        <FlatList
          data={feedbacks}
          keyExtractor={(item) => item.id || item._id}
          renderItem={renderFeedbackItem}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default FeedbackScreen;
