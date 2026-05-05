import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle?: string;
  testID?: string;
}

export const EmptyState: React.FC<Props> = ({
  icon = 'calendar-blank',
  title,
  subtitle,
  testID,
}) => {
  const theme = useTheme();
  return (
    <View testID={testID} style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryContainer }]}>
        <MaterialCommunityIcons name={icon} size={42} color={theme.colors.onPrimaryContainer} />
      </View>
      <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          variant="bodyMedium"
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
