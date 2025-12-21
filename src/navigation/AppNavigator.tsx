import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import CreatePostScreen from '../screens/main/CreatePostScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

import CommentsScreen from '../screens/main/CommentsScreen';
import UserProfileScreen from '../screens/main/UserProfileScreen';

const HomeStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="Feed" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ title: 'Create Post' }} />
        <Stack.Screen name="Comments" component={CommentsScreen} options={{ title: 'Comments' }} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'Profile' }} />
    </Stack.Navigator>
);

const AppNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, size }) => {
                    let iconName = 'circle';

                    if (route.name === 'HomeStack') {
                        iconName = 'home';
                    } else if (route.name === 'Profile') {
                        iconName = 'user';
                    } else if (route.name === 'Settings') {
                        iconName = 'cog';
                    }

                    return <FontAwesome name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#6200ee',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="HomeStack" component={HomeStack} options={{ title: 'Home' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
};

export default AppNavigator;
