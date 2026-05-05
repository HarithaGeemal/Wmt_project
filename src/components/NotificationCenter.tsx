import React, { useEffect } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import { useNotificationStore, Notification } from '../store/useNotificationStore';
import Ionicons from '@react-native-vector-icons/ionicons';

const NotificationItem = ({ notification, onRemove }: { notification: Notification; onRemove: () => void }) => {
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (notification.duration) {
      const timer = setTimeout(onRemove, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration, slideAnim]);

  const handleRemove = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onRemove());
  };

  const colors = {
    success: { bg: 'bg-green-500', icon: 'checkmark-circle' },
    error: { bg: 'bg-red-500', icon: 'close-circle' },
    warning: { bg: 'bg-yellow-500', icon: 'alert-circle' },
    info: { bg: 'bg-blue-500', icon: 'information-circle' },
  };

  const color = colors[notification.type];

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        marginHorizontal: 12,
        marginBottom: 12,
      }}
    >
      <View className={`${color.bg} rounded-lg p-4 flex-row items-center justify-between shadow-lg`}>
        <View className="flex-row items-center flex-1">
          <Ionicons name={color.icon} size={24} color="white" style={{ marginRight: 12 }} />
          <View className="flex-1">
            <Text className="text-white font-bold text-sm">{notification.title}</Text>
            <Text className="text-white text-xs opacity-90 mt-1">{notification.message}</Text>
          </View>
        </View>
        <Pressable onPress={handleRemove} className="ml-3">
          <Ionicons name="close" size={20} color="white" />
        </Pressable>
      </View>
    </Animated.View>
  );
};

export const NotificationCenter = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <View className="absolute top-0 left-0 right-0 z-50 pt-4">
      {notifications.slice(-3).map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </View>
  );
};
