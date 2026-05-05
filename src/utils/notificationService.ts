import { useNotificationStore } from '../store/useNotificationStore';

export class NotificationService {
  static showSuccess(title: string, message: string, duration = 3000) {
    useNotificationStore.getState().addNotification({
      title,
      message,
      type: 'success',
      duration,
    });
  }

  static showError(title: string, message: string, duration = 4000) {
    useNotificationStore.getState().addNotification({
      title,
      message,
      type: 'error',
      duration,
    });
  }

  static showInfo(title: string, message: string, duration = 3000) {
    useNotificationStore.getState().addNotification({
      title,
      message,
      type: 'info',
      duration,
    });
  }

  static showWarning(title: string, message: string, duration = 3500) {
    useNotificationStore.getState().addNotification({
      title,
      message,
      type: 'warning',
      duration,
    });
  }

  static orderUpdate(orderStatus: string, orderId: string) {
    const messages: { [key: string]: string } = {
      accepted: `Your order #${orderId} has been accepted!`,
      processing: `Your order #${orderId} is being prepared`,
      ready: `Your order #${orderId} is ready for pickup!`,
      delivering: `Your order #${orderId} is on the way!`,
      completed: `Your order #${orderId} has been delivered. Thank you!`,
      cancelled: `Your order #${orderId} has been cancelled`,
    };

    const titles: { [key: string]: string } = {
      accepted: 'Order Accepted',
      processing: 'Order Preparing',
      ready: 'Order Ready',
      delivering: 'Order On The Way',
      completed: 'Order Delivered',
      cancelled: 'Order Cancelled',
    };

    const types: { [key: string]: 'success' | 'info' | 'warning' | 'error' } = {
      accepted: 'success',
      processing: 'info',
      ready: 'success',
      delivering: 'info',
      completed: 'success',
      cancelled: 'error',
    };

    this.showSuccess(
      titles[orderStatus] || 'Order Update',
      messages[orderStatus] || `Order status updated to ${orderStatus}`,
      3500
    );
  }

  static remove(id: string) {
    useNotificationStore.getState().removeNotification(id);
  }

  static clearAll() {
    useNotificationStore.getState().clearAll();
  }
}
