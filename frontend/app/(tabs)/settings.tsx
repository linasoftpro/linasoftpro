import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert, Linking } from 'react-native';
import { Text, useTheme, Surface, Button } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useThemeStore } from '../../src/store/themeStore';
import { useEventStore } from '../../src/store/eventStore';
import { useTaskStore } from '../../src/store/taskStore';
import { ThemeMode } from '../../src/types';
import { exportBackup, importBackup, ImportMode } from '../../src/utils/backup';

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const events = useEventStore((s) => s.events);
  const tasks = useTaskStore((s) => s.tasks);
  const loadEvents = useEventStore((s) => s.load);
  const loadTasks = useTaskStore((s) => s.load);

  const [busy, setBusy] = useState(false);

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

  async function handleExport() {
    setBusy(true);
    const res = await exportBackup();
    setBusy(false);
    Alert.alert(res.ok ? 'Sauvegarde' : 'Erreur', res.message);
  }

  function chooseImportMode() {
    Alert.alert(
      'Importer une sauvegarde',
      'Comment souhaitez-vous gérer vos données actuelles ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Fusionner', onPress: () => doImport('merge') },
        { text: 'Tout remplacer', style: 'destructive', onPress: () => confirmReplaceImport() },
      ]
    );
  }

  function confirmReplaceImport() {
    Alert.alert(
      'Remplacer toutes les données ?',
      "Vos événements et tâches actuels seront définitivement écrasés par le contenu du fichier.",
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Remplacer', style: 'destructive', onPress: () => doImport('replace') },
      ]
    );
  }

  async function doImport(im: ImportMode) {
    setBusy(true);
    const res = await importBackup(im);
    if (res.ok) {
      await Promise.all([loadEvents(), loadTasks()]);
    }
    setBusy(false);
    if (res.cancelled) return;
    Alert.alert(
      res.ok ? 'Import réussi' : 'Erreur',
      res.ok
        ? `${res.importedEvents ?? 0} événement(s) et ${res.importedTasks ?? 0} tâche(s) traitées.`
        : res.message
    );
  }

  function openMail() {
    Linking.openURL('mailto:lemaitreazzoug@gmail.com').catch(() => {});
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
        {/* Apparence */}
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

        {/* Données — Export / Import */}
        <SectionTitle icon="database-cog-outline" label="Données" />
        <Animated.View entering={FadeInUp.delay(120)}>
          <Surface
            elevation={1}
            style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
          >
            <View style={styles.dataRow}>
              <View style={[styles.dataIcon, { backgroundColor: '#DCFCE7' }]}>
                <MaterialCommunityIcons name="file-export-outline" size={22} color="#16A34A" />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                  Exporter la base
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                  {events.length} événement(s) · {tasks.length} tâche(s) — fichier JSON
                </Text>
              </View>
              <Button
                mode="contained"
                compact
                onPress={handleExport}
                disabled={busy || (events.length === 0 && tasks.length === 0)}
                testID="export-data"
                icon="download"
              >
                Exporter
              </Button>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

            <View style={styles.dataRow}>
              <View style={[styles.dataIcon, { backgroundColor: '#E0E7FF' }]}>
                <MaterialCommunityIcons name="file-import-outline" size={22} color="#4F46E5" />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                  Importer / Ouvrir
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                  Fusionner ou remplacer depuis un fichier .json
                </Text>
              </View>
              <Button
                mode="contained-tonal"
                compact
                onPress={chooseImportMode}
                disabled={busy}
                testID="import-data"
                icon="upload"
              >
                Ouvrir
              </Button>
            </View>
          </Surface>
        </Animated.View>

        {/* À propos */}
        <SectionTitle icon="information-outline" label="À propos" />
        <Animated.View entering={FadeInUp.delay(200)}>
          <InfoRow
            icon="school"
            title="MaîtrAgenda"
            subtitle="Agenda professionnel pour les enseignants des écoles."
          />
          <InfoRow
            icon="counter"
            title="Statistiques"
            subtitle={`${events.length} événement(s) · ${tasks.length} tâche(s)`}
          />
          <InfoRow icon="tag-outline" title="Version" subtitle="1.0.0" />
        </Animated.View>

        {/* Danger zone */}
        <Animated.View entering={FadeInUp.delay(260)}>
          <Pressable
            testID="reset-data"
            onPress={confirmReset}
            disabled={events.length === 0 && tasks.length === 0}
            style={({ pressed }) => [
              styles.dangerBtn,
              {
                borderColor: '#EF4444',
                opacity: events.length === 0 && tasks.length === 0 ? 0.5 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <MaterialCommunityIcons name="delete-outline" size={18} color="#EF4444" />
            <Text style={{ color: '#EF4444', fontWeight: '700', marginLeft: 8 }}>
              Effacer toutes les données
            </Text>
          </Pressable>
        </Animated.View>

        {/* Copyright */}
        <Animated.View entering={FadeInUp.delay(320)}>
          <View style={[styles.copyright, { borderTopColor: theme.colors.outline }]}>
            <MaterialCommunityIcons
              name="copyright"
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              variant="bodySmall"
              style={[styles.copyrightText, { color: theme.colors.onSurfaceVariant }]}
            >
              Zoubir AZZOUG — Professeur des écoles — 2026
            </Text>
            <Pressable
              testID="contact-mail"
              onPress={openMail}
              style={styles.mailRow}
              hitSlop={8}
            >
              <MaterialCommunityIcons
                name="email-outline"
                size={14}
                color={theme.colors.primary}
              />
              <Text
                variant="bodySmall"
                style={{
                  color: theme.colors.primary,
                  marginLeft: 4,
                  fontWeight: '600',
                  textDecorationLine: 'underline',
                }}
              >
                lemaitreazzoug@gmail.com
              </Text>
            </Pressable>
          </View>
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
}> = ({ icon, title, subtitle }) => {
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
        <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
          {title}
        </Text>
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
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  divider: {
    height: 1,
    marginVertical: 14,
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
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 16,
  },
  copyright: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    paddingBottom: 8,
    marginTop: 24,
    borderTopWidth: 1,
  },
  copyrightText: {
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  mailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingVertical: 4,
  },
});
