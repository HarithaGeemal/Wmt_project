
import {NavigatorScreenParams} from '@react-navigation/native';



export enum RootRoutes {
    AuthStack = 'AuthStack',
    MainStack = 'MainStack',
}

export enum AuthRoutes {
    Login = 'Login',
    SignUp = 'SignUp',
}

export enum MainRoutes {
    Home = 'Home',
    Store = 'Store',
    ProductDetails = 'ProductDetails',
    Checkout = 'Checkout',
    Profile = 'Profile',
    Category = 'Category',
    Cart = 'Cart',
    AddressListScreen = 'AddressListScreen',
    MyOrders = 'MyOrders',
    Deliveries = 'Deliveries',
    DeliveryDetail = 'DeliveryDetail',
    MyDeliveries = 'MyDeliveries',
}

export type RootStackParamList = {
    [RootRoutes.AuthStack]: undefined;
    [RootRoutes.MainStack]: undefined;
};

export type AuthStackParamList = {
    [AuthRoutes.Login]: undefined;
    [AuthRoutes.SignUp]: undefined;
};

export type MainTabParamList = {
    [MainRoutes.Home]: undefined;
    [MainRoutes.Store]: undefined;
    [MainRoutes.Cart]: undefined;
};


export type MainStackParamList = {
    MainTabs : NavigatorScreenParams<MainTabParamList>;
    [MainRoutes.ProductDetails]: { productId: string };
    [MainRoutes.Checkout]: undefined;
    [MainRoutes.Profile]: undefined;
    [MainRoutes.Category]: { categoryName?: string };
    [MainRoutes.AddressListScreen]: undefined;
    [MainRoutes.MyOrders]: undefined;
    [MainRoutes.DeliveryDetail]: { orderId: string };
    [MainRoutes.MyDeliveries]: undefined;
}

