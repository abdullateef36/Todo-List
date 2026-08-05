/**
 * Floating Action Button — primary action button that triggers voice input.
 * Shows different icons/states based on the voice input state.
 */
import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  View,
} from 'react-native';
import { Mic, Circle, Loader2, AlertCircle } from 'lucide-react-native';
import { Theme } from '../constants/theme';
import { VoiceInputState } from '../hooks/useVoiceInput';

interface FABProps {
  theme: Theme;
  onPress: () => void;
  voiceState: VoiceInputState;
}

export const FAB: React.FC<FABProps> = ({ theme, onPress, voiceState }) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (voiceState === 'recording') {
      // Pulse animation while recording
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.ease,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.ease,
          }),
        ])
      ).start();

      // Rotate animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.linear,
        })
      ).start();
    } else {
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
    }
  }, [voiceState, pulseAnim, rotateAnim]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getIcon = () => {
    switch (voiceState) {
      case 'recording':
        return <Circle fill="#FFFFFF" size={20} />;
      case 'transcribing':
        return <Loader2 color="#FFFFFF" size={24} />;
      case 'processing':
        return <Loader2 color="#FFFFFF" size={24} />;
      case 'error':
        return <AlertCircle color="#FFFFFF" size={24} />;
      default:
        return <Mic color="#FFFFFF" size={24} />;
    }
  };

  const getBackgroundColor = () => {
    if (voiceState === 'recording') {
      return theme.colors.danger;
    }
    if (voiceState === 'error') {
      return theme.colors.danger;
    }
    return theme.colors.primary;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: pulseAnim }, { rotate: rotateInterpolate }],
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: getBackgroundColor(),
            opacity: voiceState === 'requesting-permission' ? 0.6 : 1,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={voiceState === 'requesting-permission'}
      >
        {getIcon()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 28,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
