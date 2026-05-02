import { View, Text, Image, ScrollView } from 'react-native';
import React from 'react';

const BannerCarousel = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-4"
      contentContainerClassName="px-4"
    >
      <View className="mr-4">
        <Image
          source={{
            uri: 'https://cdn.freshtohome.com/media/banner/075c8778cfeed0f6.jpg',
          }}
          className="w-80 h-44 rounded-xl"
          resizeMode="cover"
        />
      </View>

      <View>
        <Image
          source={{
            uri: 'https://cdn.freshtohome.com/media/banner/962d26724e8b1f8f.jpg',
          }}
          className="w-80 h-44 rounded-xl"
          resizeMode="cover"
        />
      </View>
    </ScrollView>
  );
};

export default BannerCarousel;
