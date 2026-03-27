import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface SecondaryButtonProps {
  text: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  color?: string;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  text,
  icon,
  onPress,
  color = '#F97316',
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, { backgroundColor: color }]}
      activeOpacity={0.8}
    >
      {icon && <>{icon}</>}
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 15,
  } as ViewStyle,
  text: {
    color: '#1E3A8A',
    fontWeight: 'bold',
    fontSize: 24,
    marginLeft: 6,
  },
});

export default SecondaryButton;
