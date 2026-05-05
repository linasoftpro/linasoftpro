import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useThemeStore } from '../../src/store/themeStore';
import { useEventStore } from '../../src/store/eventStore';
import { useTaskStore } from '../../src/store/taskStore';
import { ThemeMode } from '../../src/types';

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const events = useEventStore((s) => s.events);
  const tasks = useTaskStore((s) => s.tasks);

  function confirmReset() {
    Alert.alert(
      'Tout effacer ?',
      `Cela supprimera ${events.length} événement(s) et ${tasks.length} tâche(s) de cet appareil. Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout effacer',
          style: 'destructive',
          onPress: async () => {
            // Clear via stores' delete loops
            for (const e of events) {
              await useEventStore.getState().deleteEvent(e.id);
            }
            for (const t of tasks) {
              await useTaskStore.getState().deleteTask(t.id);
            }
          },
        },
      ]
    );
  }

  const themeOptions: { id: ThemeMode; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
    { id: 'system', label: 'Système', icon: 'cellphone' },
    { id: 'light', label: 'Clair', icon: 'white-balance-sunny' },
    { id: 'dark', label: 'Sombre', icon: 'weather-night' },
  ];

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, letterSpacing: 0.5 }}>
          RÉGLAGES
        </Text>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
          Préférences
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle icon="palette" label="Apparence" />
        <Animated.View entering={FadeInUp.delay(60)}>
          <Surface
            elevation={1}
            style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
          >
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
              Choisissez le thème de l&apos;application
            </Text>
            <View style={styles.themeRow}>
              {themeOptions.map((opt) => {
                const active = opt.id === mode;
                return (
                  <Pressable
                    key={opt.id}
                    testID={`theme-${opt.id}`}
                    onPress={() => setMode(opt.id)}
                    style={[
                      styles.themeBtn,
                      {
                        backgroundColor: active ? theme.colors.primary : theme.colors.surfaceVariant,
                        borderColor: active ? theme.colors.primary : theme.colors.outline,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={opt.icon}
                      size={20}
                      color={active ? theme.colors.onPrimary : theme.colors.onSurface}
                    />
                    <Text
                      variant="labelMedium"
                      style={{
                        color: active ? theme.colors.onPrimary : theme.colors.onSurface,
                        marginTop: 6,
                        fontWeight: '700',
                      }}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Surface>
        </Animated.View>

        <SectionTitle icon="bell-outline" label="Notifications & rappels" />
        <Animated.View entering={FadeInUp.delay(120)}>
          <InfoRow
            icon="bell-ring-outline"
            title="Notifications locales"
            subtitle="Activées automatiquement à la création d'un événement avec rappels."
          />
          <InfoRow
            icon="alarm"
            title="Alarmes exactes"
            subtitle="Disponibles sur Android avec autorisation. Demandées au premier événement avec alarme."
          />
        </Animated.View>

        <SectionTitle icon="cloud-outline" label="Synchronisation" />
        <Animated.View entering={FadeInUp.delay(180)}>
          <InfoRow
            icon="harddisk"
            title="Stockage local"
            subtitle="Vos données sont enregistrées sur cet appareil."
          />
          <InfoRow
            icon="cloud-sync-outline"
            title="Sauvegarde cloud"
            subtitle="Bientôt disponible — synchronisez votre agenda entre vos appareils."
            badge="Bientôt"
          />
        </Animated.View>

        <SectionTitle icon="information-outline" label="À propos" />
        <Animated.View entering={FadeInUp.delay(240)}>
          <InfoRow icon="school" title="MaîtrAgenda" subtitle="Agenda professionnel pour les enseignants des écoles." />
          <InfoRow icon="counter" title="Statistiques" subtitle={`${events.length} événement(s) · ${tasks.length} tâche(s)`} />
          <InfoRow icon="tag-outline" title="Version" subtitle="1.0.0" />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)}>
          <Pressable
            testID="reset-data"
            onPress={confirmReset}
            style={({ pressed }) => [
              styles.dangerBtn,
              { borderColor: '#EF4444', transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            <MaterialCommunityIcons name="delete-outline" size={18} color="#EF4444" />
            <Text style={{ color: '#EF4444', fontWeight: '700', marginLeft: 8 }}>
              Effacer toutes les données
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const SectionTitle: React.FC<{ icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }> = ({
  icon,
  label,
}) => {
  const theme = useTheme();
  return (
    <View style={styles.sectionTitle}>
      <MaterialCommunityIcons name={icon} size={16} color={theme.colors.primary} />
      <Text
        variant="labelLarge"
        style={{ color: theme.colors.primary, marginLeft: 6, fontWeight: '700', letterSpacing: 0.4 }}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
};

const InfoRow: React.FC<{
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle?: string;
  badge?: string;
}> = ({ icon, title, subtitle, badge }) => {
  const theme = useTheme();
  return (
    <Surface
      elevation={1}
      style={[styles.infoRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
    >
      <View style={[styles.infoIcon, { backgroundColor: theme.colors.primaryContainer }]}>
        <MaterialCommunityIcons name={icon} size={20} color={theme.colors.onPrimaryContainer} />
      </View>
      <View style={styles.infoBody}>
        <View style={styles.infoTitleRow}>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '700', flex: 1 }}>
            {title}
          </Text>
          {badge ? (
            <View style={[styles.badge, { backgroundColor: theme.colors.secondaryContainer }]}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSecondaryContainer, fontWeight: '700' }}>
                {badge}
              </Text>
            </View>
          ) : null}
        </View>
        {subtitle ? (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontWeight: '800', letterSpacing: -0.5 },
  scroll: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoBody: { flex: 1 },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginLeft: 8,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 16,
  },
});
