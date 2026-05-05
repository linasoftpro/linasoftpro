import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { CategoryDef } from '../constants/categories';

interface Props {
  category: CategoryDef;
  selected?: boolean;
  onPress?: () => void;
  size?: 'small' | 'medium';
}

export const CategoryChip: React.FC<Props> = ({ category, selected, size = 'medium' }) => {
  const isSmall = size === 'small';
  return (
    <View
      style={[
        styles.chip,
        isSmall && styles.chipSmall,
        {
          backgroundColor: selected ? category.color : `${category.color}22`,
          borderColor: category.color,
        },
      ]}
    >
      <Text
        style={[
          styles.emoji,
          isSmall && styles.emojiSmall,
        ]}
      >
        {category.emoji}
      </Text>
      <Text
        variant={isSmall ? 'labelSmall' : 'labelMedium'}
        style={{
          color: selected ? '#FFFFFF' : category.color,
          fontWeight: '600',
        }}
      >
        {category.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  emoji: {
    fontSize: 14,
    marginRight: 6,
  },
  emojiSmall: {
    fontSize: 12,
    marginRight: 4,
  },
});
