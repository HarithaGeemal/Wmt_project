import { Text, View, Image, Pressable } from 'react-native';
import React from 'react';

type CategoryCardProps = {
  name?: string;
  image?: string;
    onPress?: () => void;
};

const CategoryCard = ({ name, image, onPress }: CategoryCardProps) => {
  return (
    <Pressable className='mr-3' onPress={onPress}>
      <View className="items-center w-[85px]">
        <View
          className="w-[75px] h-[75px] rounded-lg items-center justify-center p-3"
          style={{ backgroundColor: '#E0D4E8' }}
        >
          {image ? (
            <Image
              source={{ uri: image }}
              className="w-full h-full rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-purple-800 font-bold text-lg tracking-wider">
              {name ? name.substring(0, 2).toUpperCase() : 'Ct'}
            </Text>
          )}
        </View>
        <Text
          className="mt-2 text-[12px] font-semibold text-gray-800 text-center"
          numberOfLines={2}
        >
          {name}
        </Text>
      </View>
    </Pressable>
  );
};

export default CategoryCard;
