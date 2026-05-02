import { StyleSheet } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CategoriesScreen from '../screens/CategoriesScreen';
import AddCategoryScreen from '../screens/AddCategoryScreen';
import EditCategoryScreen from '../screens/EditCategoryScreen';
import ProductScreen from '../screens/ProductScreen';
import AddProductScreen from '../screens/AddProductScreen';
import EditProductScreen from '../screens/EditProductScreen';
import UserScreen from '../screens/UserScreen';

const Stack = createNativeStackNavigator();

const CategoriesStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor:"tomato"},
        headerTintColor:"white",
        headerTitleStyle:{fontWeight:"bold"},
        headerTitleAlign:"center",
        headerShadowVisible:false
      }}
    >
        <Stack.Screen name="Categories" component={CategoriesScreen} options={{title:"Categories"}}/>
        <Stack.Screen name="AddCategory" component={AddCategoryScreen} options={{title:"Add Category"}}/>
        <Stack.Screen name="EditCategory" component={EditCategoryScreen} options={{title:"Edit Category"}}/>
        <Stack.Screen name="Product" component={ProductScreen} options={({route}) => ({title : `Products in ${(route.params as any)?.categoryName}`})}/>
        <Stack.Screen name="AddProduct" component={AddProductScreen} options={{title:"Add Product"}}/>
        <Stack.Screen name="EditProduct" component={EditProductScreen} options={{title:"Edit Product"}}/>
        <Stack.Screen name="Users" component={UserScreen} options={{title:"Users"}}/>
    </Stack.Navigator>
  )
}

export default CategoriesStack

const styles = StyleSheet.create({})