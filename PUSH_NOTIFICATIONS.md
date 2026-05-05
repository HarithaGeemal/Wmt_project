# Push Notifications Feature Documentation

## Overview
Push notifications have been added to your food delivery app to keep users informed about their orders, promotions, and important updates. The system uses an in-app notification center that displays toast-like notifications at the top of the screen.

## Files Created

### 1. **useNotificationStore.ts** (`src/store/useNotificationStore.ts`)
Zustand store for managing notification state globally.

**Features:**
- Add, remove, and clear notifications
- Store notification metadata (id, title, message, type, timestamp)
- Support for multiple notification types: `success`, `error`, `warning`, `info`

```typescript
// Usage:
const { addNotification } = useNotificationStore();
addNotification({
  title: 'Success',
  message: 'Order placed!',
  type: 'success',
  duration: 3000
});
```

### 2. **notificationService.ts** (`src/utils/notificationService.ts`)
High-level API for triggering notifications throughout the app.

**Available Methods:**
- `showSuccess(title, message, duration)`
- `showError(title, message, duration)`
- `showInfo(title, message, duration)`
- `showWarning(title, message, duration)`
- `orderUpdate(orderStatus, orderId)` - Special method for order status updates
- `remove(id)` - Remove a specific notification
- `clearAll()` - Clear all notifications

```typescript
// Example - Show order update:
NotificationService.orderUpdate('accepted', 'ORD123');

// Example - Show custom notification:
NotificationService.showSuccess('Payment Successful', 'Your payment has been processed');
```

### 3. **NotificationCenter.tsx** (`src/components/NotificationCenter.tsx`)
React component that displays the notification UI.

**Features:**
- Animated slide-in/out transitions
- Shows up to 3 notifications simultaneously
- Color-coded by type (green=success, red=error, blue=info, yellow=warning)
- Auto-dismiss based on duration
- Manual dismiss button

### 4. **pushNotificationListener.ts** (`src/utils/pushNotificationListener.ts`)
Handles incoming push notification payloads.

**Functions:**
- `handlePushNotification(payload)` - Process notification payload
- `simulatePushNotifications()` - Demo function to simulate order status updates

```typescript
// Example payload:
{
  orderId: 'ORD123',
  orderStatus: 'accepted',
  title: 'Order Accepted',
  message: 'Your order has been accepted',
  type: 'order_update'
}
```

## Integration Points

### App.tsx
- Imported `NotificationCenter` component
- Added `<NotificationCenter />` to the app layout for global notification display

### MyOrdersScreen.tsx
- Imported notification utilities
- Added notification when orders load
- Added test button (notification bell icon) to simulate notifications

### CheckoutScreen.tsx
- Shows success notification when order is placed
- Supports both card payment and cash on delivery methods

## Usage Examples

### 1. Show Success Notification
```typescript
import { NotificationService } from '../utils/notificationService';

NotificationService.showSuccess(
  'Order Confirmed',
  'Your order has been confirmed!'
);
```

### 2. Show Error Notification
```typescript
NotificationService.showError(
  'Payment Failed',
  'Please check your card details and try again'
);
```

### 3. Handle Order Status Update
```typescript
NotificationService.orderUpdate('delivering', 'ORD12345');
// Shows: "Your order #ORD12345 is on the way!"
```

### 4. Trigger Demo Notifications
In MyOrdersScreen, tap the notification bell icon in the header to see simulated order status updates.

## Notification Types

| Type | Color | Use Case |
|------|-------|----------|
| `success` | Green | Order confirmed, payment successful, delivery completed |
| `error` | Red | Order cancelled, payment failed, error occurred |
| `info` | Blue | Order update, new promotion, general info |
| `warning` | Yellow | Out of stock, address incomplete |

## Order Status Notifications

The app includes predefined messages for common order statuses:

- **accepted** → "Order has been accepted by the restaurant"
- **processing** → "Order is being prepared"
- **ready** → "Order is ready for delivery"
- **delivering** → "Order is on the way"
- **completed** → "Order has been delivered"
- **cancelled** → "Order has been cancelled"

## Customization

### Change Notification Duration
```typescript
NotificationService.showSuccess(
  'Title',
  'Message',
  5000 // 5 seconds (default: 3000ms)
);
```

### Change Notification Colors
Edit the colors object in `NotificationCenter.tsx`:
```typescript
const colors = {
  success: { bg: 'bg-green-500', icon: 'checkmark-circle' },
  error: { bg: 'bg-red-500', icon: 'close-circle' },
  warning: { bg: 'bg-yellow-500', icon: 'alert-circle' },
  info: { bg: 'bg-blue-500', icon: 'information-circle' },
};
```

### Add Custom Icons
Update the icon mapping in `NotificationCenter.tsx` using available Ionicons names.

## Testing the Feature

1. **Place an order** → See success notification in CheckoutScreen
2. **View My Orders** → See info notification about loaded orders
3. **Tap the bell icon** → Simulate realistic order status updates (notifications trigger sequentially every 3 seconds)

## Future Enhancements

Potential additions:
- Push notification service integration (Firebase Cloud Messaging, OneSignal)
- Sound and vibration effects
- Notification history/log screen
- Notification preferences/settings
- Deep linking from notifications to relevant screens
- Badge count on app icon
- Notification categorization and filtering

## Integration with Real Push Services

To integrate with Firebase Cloud Messaging or similar:

1. Install the push notification library:
   ```bash
   npm install @react-native-firebase/messaging
   ```

2. Set up listeners:
   ```typescript
   messaging().onMessage(async (remoteMessage) => {
     handlePushNotification({
       title: remoteMessage.notification?.title,
       message: remoteMessage.notification?.body,
       ...
     });
   });
   ```

3. Modify `pushNotificationListener.ts` to route real payloads to `handlePushNotification`

---

**Current Status:** ✅ Local in-app notifications fully functional
