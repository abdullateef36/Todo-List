/**
 * ThemeToggle — button to switch between light and dark modes.
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Theme } from '../constants/theme';
import { ThemeMode } from '../constants/theme';

interface ThemeToggleProps {
  theme: Theme;
  mode: ThemeMode;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, mode, onToggle }) => {
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();
  }, [mode, rotateAnim]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <Animated.Text style={{ fontSize: 20, transform: [{ rotate: rotateInterpolate }] }}>
        {mode === 'light' ? '🌙' : '☀️'}
      </Animated.Text>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        {mode === 'light' ? 'Dark' : 'Light'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
});
