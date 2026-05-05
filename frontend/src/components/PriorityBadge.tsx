import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PriorityDef } from '../constants/categories';

interface Props {
  priority: PriorityDef;
  selected?: boolean;
}

export const PriorityBadge: React.FC<Props> = ({ priority, selected }) => {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: selected ? priority.color : `${priority.color}22`,
          borderColor: priority.color,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={priority.icon as any}
        size={14}
        color={selected ? '#FFFFFF' : priority.color}
      />
      <Text
        variant="labelMedium"
        style={{
          color: selected ? '#FFFFFF' : priority.color,
          marginLeft: 4,
          fontWeight: '600',
        }}
      >
        {priority.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
});
