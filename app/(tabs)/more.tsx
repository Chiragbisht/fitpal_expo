import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function MoreScreen() {
  const router = useRouter();

  const menuItems = [
    { id: 1, title: 'Profile', subtitle: 'Edit your personal information', icon: 'user', route: '/profile' },
    { id: 2, title: 'Settings', subtitle: 'App preferences and notifications', icon: 'settings', route: '/settings' },
    { id: 3, title: 'Progress', subtitle: 'View your fitness journey', icon: 'trending-up', route: '/progress' },
    { id: 4, title: 'Help & Support', subtitle: 'Get help and contact support', icon: 'help-circle', route: '/help' },
    { id: 5, title: 'About', subtitle: 'App version and information', icon: 'info', route: '/about' },
  ];

  return (
    <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>More</Text>
        </View>

        <ScrollView style={styles.content}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => router.push(item.route)}
          >
            <View style={styles.menuIcon}>
              <Feather name={item.icon as any} size={20} color="#007AFF" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#C6C6C8" />
          </TouchableOpacity>
        ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  menuItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  menuSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
});