import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { useFontSize } from '@/contexts/FontSizeContext';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const {fontScale, setFontScale} = useFontSize();
  const styles = createStyles(fontScale);

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const createStyles = (fontScale:number) =>{
  return(
    StyleSheet.create({
      default: {
        fontSize: 16 * fontScale,
        lineHeight: 24 * fontScale,
      },
      defaultSemiBold: {
        fontSize: 16 * fontScale,
        lineHeight: 24 * fontScale,
        fontWeight: '600',
      },
      title: {
        fontSize: 32 * fontScale,
        fontWeight: 'bold',
        lineHeight: 32 * fontScale,
      },
      subtitle: {
        fontSize: 20 * fontScale,
        lineHeight: 20 * fontScale * 1.2,
        fontWeight: 'bold',
      },
      link: {
        lineHeight: 30 * fontScale,
        fontSize: 16 * fontScale,
        color: '#0a7ea4',
      },
    })
  )
};
