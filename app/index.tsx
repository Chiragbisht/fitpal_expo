import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { getUserData } from '@/utils/userData';

export default function App() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUserData();
  }, []);

  const checkUserData = async () => {
    try {
      const userData = await getUserData();
      if (userData) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    } catch (error) {
      console.error('Error checking user data:', error);
      router.replace('/onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <View style={styles.container} />;
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});