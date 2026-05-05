# MaîtrAgenda — Product Requirements Document (PRD)

## 1. Vue d'ensemble

**MaîtrAgenda** est une application mobile (React Native + Expo) destinée aux **professeurs des écoles en France**. Elle offre une expérience d'agenda professionnel premium, hors-ligne par défaut, avec gestion avancée d'événements scolaires, tâches, rappels et alarmes locales.

> Note : l'application a été initialement spécifiée en Kotlin / Jetpack Compose ; l'implémentation actuelle est en React Native (Expo) avec react-native-paper (Material 3) — toutes les fonctionnalités demandées sont livrées.

## 2. Objectifs produit

- Permettre à un enseignant de planifier conseils, sorties, APC, réunions parents, formations, évaluations, etc.
- Détecter automatiquement les conflits horaires.
- Notifier l'utilisateur via rappels multiples + alarme exacte.
- Fonctionner intégralement hors-ligne (AsyncStorage).
- Offrir une UX mobile premium : Material 3, animations spring/tween, thème clair/sombre.

## 3. Fonctionnalités principales (MVP)

### 3.1 Dashboard (Accueil)
- En-tête : date longue en français + nom de l'app
- 4 KPI cards (touchables, navigables) :
  - 📅 **Événements actifs** (non annulés ni terminés)
  - ✅ **Tâches en cours**
  - 🚨 **Urgences** (priorité haute/urgente, non terminées)
  - 📆 **Cette semaine**
- Carte « Actions rapides » : boutons Événement / Agenda
- Liste « À venir » (5 prochains événements)
- État vide avec illustration

### 3.2 Agenda (Mois / Semaine / Jour)
- Switcher 3 modes
- Navigation flèches précédent / suivant + bouton « Aujourd'hui »
- Vue **Mois** : grille 6×7, points colorés par catégorie, jour sélectionné en pastille primaire
- Vue **Semaine** : 7 cellules avec compteur d'événements
- Vue **Jour** : timeline 7h-19h avec blocs colorés
- Liste des événements du jour sélectionné en bas

### 3.3 Création / Édition d'événement
Formulaire complet avec icône dédiée par champ :
- Titre (requis), Description, Catégorie (14 choix avec emoji + couleur)
- Dates début/fin avec picker custom (-7j / -1j / +1j / +7j + heure/minute)
- Toute la journée (switch)
- Lieu, Priorité (4 niveaux), Statut (5 niveaux), Récurrence (4 modes)
- Rappels multiples (8 presets : à l'heure → 2 jours avant)
- Alarme sonore (switch)
- Classe concernée (16 presets PS → CM1/CM2)
- Participants, Notes
- Bouton « Créer / Enregistrer » coloré selon catégorie

### 3.4 Détail d'événement
- Hero coloré (catégorie + emoji + titre)
- Menu de changement de statut (5 options)
- Bandeau rouge si conflits détectés
- Lignes détail : début, fin, lieu, priorité, récurrence, classe, participants
- Section rappels & alarme
- Section notes
- Liste des événements en conflit
- Boutons Modifier / Supprimer (avec confirmation)

### 3.5 Tâches
- Liste avec checkbox (toggle done) + dot priorité
- Filtres avec compteurs : Toutes / À faire / Terminées
- Modal d'ajout / édition (titre + 4 priorités)
- Long press → confirmation suppression
- Animations FadeInUp en cascade

### 3.6 Réglages
- Thème : Système / Clair / Sombre (live)
- Sections informatives : Notifications, Synchronisation (cloud à venir), À propos, Stats
- « Effacer toutes les données » (confirmation requise)

## 4. Architecture technique

| Concept Kotlin demandé | Équivalent React Native Expo |
|---|---|
| Jetpack Compose | React Native + react-native-paper v5 (Material 3) |
| Room | AsyncStorage (clé/valeur, JSON) — migration future vers expo-sqlite |
| Hilt + ViewModel | Zustand stores (eventStore, taskStore, themeStore) |
| Navigation Compose | Expo Router (file-based) avec animations slide/fade/modal |
| WorkManager + AlarmManager | expo-notifications (canaux `reminders` + `alarms`) |
| BootReceiver | Géré par Expo automatiquement |
| Animations spring/tween | react-native-reanimated v3 (FadeIn, FadeInUp, Layout, springify) |
| Material Icons Extended | @expo/vector-icons (MaterialCommunityIcons) |
| TypeConverters epoch ↔ LocalDateTime | ISO strings + date-fns |

### Structure
```
/app/frontend/
├── app/
│   ├── _layout.tsx              # Root: PaperProvider + Theme + load stores
│   ├── index.tsx                # Redirect → /(tabs)
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Bottom Tabs + central FAB
│   │   ├── index.tsx            # Dashboard
│   │   ├── agenda.tsx           # Calendar (Mois/Semaine/Jour)
│   │   ├── tasks.tsx            # Tasks
│   │   ├── settings.tsx         # Settings
│   │   └── new-placeholder.tsx  # FAB tab placeholder
│   └── event/
│       ├── new.tsx              # Form (create + edit ?id=)
│       └── [id].tsx             # Event detail
└── src/
    ├── types/index.ts
    ├── constants/categories.ts
    ├── store/{eventStore,taskStore,themeStore}.ts
    ├── components/{EventCard,CategoryChip,PriorityBadge,TaskItem,EmptyState}.tsx
    ├── theme/paperTheme.ts
    └── utils/{dateUtils,notifications}.ts
```

## 5. Données métier

### 5.1 Catégories (14)
Conseil des maîtres 👩‍🏫 #6366F1 · Conseil d'école 🏫 #8B5CF6 · Réunion parents 👨‍👩‍👧 #EC4899 · Formation 📚 #F59E0B · Animation pédagogique 🎨 #10B981 · Sortie scolaire 🚌 #3B82F6 · EPS ⚽ #22C55E · APC 🔬 #14B8A6 · Évaluation 📊 #F97316 · Tâche admin 📋 #6B7280 · Projet de classe 🌟 #EAB308 · RDV institutionnel 🏛️ #DC2626 · Personnel 🏠 #0EA5E9 · Autre 📌 #A78BFA

### 5.2 Priorités (4)
🟢 Faible · 🟡 Normale · 🟠 Haute · 🔴 Urgente

### 5.3 Statuts (5)
Prévu · Confirmé (vert) · Annulé (rouge + strikethrough) · Terminé (gris 50% opacity) · Reporté (ambre)

### 5.4 Récurrences (4)
Aucune · Quotidienne · Hebdomadaire · Mensuelle

## 6. Roadmap

### v1.1 (à venir)
- Sauvegarde cloud (FastAPI + MongoDB) avec sync multi-appareils
- Recherche & filtres dans l'agenda
- Modèles d'événements (templates pré-remplis)
- Export PDF / iCal
- Migration AsyncStorage → expo-sqlite (Room-like)

### v1.2 (futur)
- Reprogrammation automatique des alarmes après redémarrage (nécessite EAS build)
- Widget Android (cadrans de la journée)
- Authentification optionnelle (Emergent Google Auth ou JWT)
- Notifications push (en plus des locales)

## 7. Tests

- Lint : ✅ ESLint pass (0 issue)
- Testing agent (iteration 1) : ✅ tous les flux principaux validés (Dashboard, Agenda, FAB, Création d'événement, Tâches, Réglages, persistence AsyncStorage, switch de thème)
- Persistance task `done` après reload : corrigée (persist now awaited before set)

## 8. Déploiement

- Web preview live : utilise le tunnel ngrok Expo
- Android APK / iOS IPA : via le bouton **Publish** d'Emergent (recommandé) ou EAS build après export
