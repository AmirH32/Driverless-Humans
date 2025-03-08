import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity, Image, View } from 'react-native';
import { useRouter } from 'expo-router'; // Import the useRouter hook

import { ThemedView } from '@/components/ThemedView';

export function TopBar({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Navigation for icons
  const handleProfilePress = () => {
    router.push('/profile');
  };
  const handleSettingsPress = () => {
    router.push('/settings');
  };

  return (
    <View style={styles.topbar_cont}>
      <Image source={require('@/assets/images/council_logo.png')} style={styles.logo} />
      <ThemedView style={styles.icons_cont}>
        <TouchableOpacity onPress={handleProfilePress}>
          <Image source={require('@/assets/images/profile.png')} style={styles.icons} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSettingsPress}>
          <Image source={require('@/assets/images/settings.png')} style={styles.icons} />
        </TouchableOpacity>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar_cont: {
    top: 0,
    maxHeight: 80,
    minHeight: 80,
    width: '100vw',
    backgroundColor: '#FFFFFF',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'end',
    justifyContent: 'space-between',
    paddingBottom: 5,
    marginTop: 40,
  },
  logo: {
    resizeMode: 'contain',
    height: 70,
    width: 200,
  },
  icons_cont: {
    borderRadius: 3,
    width: 200,
    height: 70,
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-end',
  },
  icons: {
    height: 70,
    width: 70,
    borderRadius: 3,
    marginRight: 10,
  },
});
