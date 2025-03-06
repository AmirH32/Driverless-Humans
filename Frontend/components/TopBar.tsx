import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity, Image, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function TopBar({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);
  // const theme = useColorScheme() ?? 'light';

  return (
    <View style={styles.topbar_cont}>
      <Image source={require('@/assets/images/council_logo.png')} style={styles.logo}/>
      <ThemedView style={styles.icons_cont}>
        <Image source={require('@/assets/images/profile.png')} style={styles.icons}/>
        <Image source={require('@/assets/images/settings.png')} style={styles.icons}/>
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
