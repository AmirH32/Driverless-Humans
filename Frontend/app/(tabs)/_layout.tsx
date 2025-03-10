import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
        // tabBarStyle: {
        //   display: 'none', // Hide the tab bar globally
        // },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          title: 'Login',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="signup"
        options={{
          title: 'Signup',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.badge.plus.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="volunteerSignup"
        options={{
          title: 'Volunteer Signup',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.badge.plus" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person" color={color} />,
        }}
      />
      <Tabs.Screen
        name="disability"
        options={{
          title: 'Disability',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="figure.roll" color={color} />,
        }}
      />
      <Tabs.Screen
        name="accessibility"
        options={{
          title: 'Accessibility',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="figure.stand" color={color} />,
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: 'Help',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="questionmark.circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="timetables"
        options={{
          title: 'Time Tables',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="confirmed"
        options={{
          title: 'Confirmed',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="checkmark" color={color} />,
        }}
      />
      <Tabs.Screen
        name="volunteerList"
        options={{
          title: 'Volunteer List',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="people" color={color} />,
        }}
      />
      <Tabs.Screen
        name="confirmed_v"
        options={{
          title: 'Confirmed_V',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="checkmark" color={color} />,
        }}
      />
    </Tabs>
  );
}