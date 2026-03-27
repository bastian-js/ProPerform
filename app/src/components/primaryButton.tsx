import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface PrimaryButtonProps {
  text: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  color?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  text,
  icon,
  onPress,
  color = '#1E3A8A',
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
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 6,
  },
});

export default PrimaryButton;
