import { NotificationService } from './notificationService';

export interface PushNotificationPayload {
  orderId?: string;
  orderStatus?: string;
  title: string;
  message: string;
  type?: 'order_update' | 'promotion' | 'general';
}

export const handlePushNotification = (payload: PushNotificationPayload) => {
  if (payload.type === 'order_update' && payload.orderStatus && payload.orderId) {
    NotificationService.orderUpdate(payload.orderStatus, payload.orderId);
  } else {
    NotificationService.showInfo(payload.title, payload.message);
  }
};

// Simulate receiving push notifications (for demo purposes)
export const simulatePushNotifications = () => {
  const notifications: PushNotificationPayload[] = [
    {
      orderId: 'ORD123',
      orderStatus: 'accepted',
      title: 'Order Accepted',
      message: 'Your order has been accepted by the restaurant',
      type: 'order_update',
    },
    {
      orderId: 'ORD123',
      orderStatus: 'processing',
      title: 'Order Processing',
      message: 'Your order is being prepared',
      type: 'order_update',
    },
    {
      orderId: 'ORD123',
      orderStatus: 'ready',
      title: 'Order Ready',
      message: 'Your order is ready for delivery',
      type: 'order_update',
    },
    {
      orderId: 'ORD123',
      orderStatus: 'delivering',
      title: 'Out for Delivery',
      message: 'Your order is on the way',
      type: 'order_update',
    },
    {
      orderId: 'ORD123',
      orderStatus: 'completed',
      title: 'Order Delivered',
      message: 'Your order has been delivered successfully',
      type: 'order_update',
    },
  ];

  notifications.forEach((notification, index) => {
    setTimeout(() => {
      handlePushNotification(notification);
    }, (index + 1) * 3000);
  });
};
