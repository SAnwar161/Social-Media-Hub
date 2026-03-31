import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PLATFORMS from '../config/platforms';

export const HOME_PLATFORM_KEY = '@smhub_home_platform';
export const ONBOARDED_KEY = '@smhub_onboarded';

export default function OnboardingScreen({ onDone }) {
  const [selected, setSelected] = useState(PLATFORMS[0].key);

  const handleStart = async () => {
    try {
      await AsyncStorage.multiSet([
        [HOME_PLATFORM_KEY, selected],
        [ONBOARDED_KEY, 'true'],
      ]);
    } catch (e) {}
    onDone(selected);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor="#0f0f1a" barStyle="light-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to{'\n'}Social Media Hub 👋</Text>
          <Text style={styles.subtitle}>
            Pick your <Text style={styles.highlight}>Home Platform</Text>.{'\n'}
            It loads instantly when you open the app.
          </Text>
        </View>

        {/* Platform Grid */}
        <View style={styles.grid}>
          {PLATFORMS.map((platform) => {
            const isSelected = selected === platform.key;
            const IconComponent =
              platform.iconLib === 'FontAwesome5' ? FontAwesome5 : MaterialCommunityIcons;

            return (
              <TouchableOpacity
                key={platform.key}
                style={[
                  styles.card,
                  isSelected && { borderColor: platform.color, borderWidth: 2.5, backgroundColor: platform.color + '18' },
                ]}
                onPress={() => setSelected(platform.key)}
                activeOpacity={0.8}
              >
                <IconComponent
                  name={platform.iconName}
                  size={36}
                  color={isSelected ? platform.color : '#aaa'}
                />
                <Text style={[styles.cardLabel, isSelected && { color: platform.color, fontWeight: '700' }]}>
                  {platform.label}
                </Text>
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: platform.color }]}>
                    <MaterialCommunityIcons name="check" size={11} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Note */}
        <Text style={styles.note}>
          💡 All other platforms load when you tap them.{'\n'}
          You can change this anytime from the tab bar.
        </Text>

        {/* CTA Button */}
        {(() => {
          const activePlatform = PLATFORMS.find(p => p.key === selected);
          return (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: activePlatform?.color || '#1877F2' }]}
              onPress={handleStart}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>
                Start with {activePlatform?.label} →
              </Text>
            </TouchableOpacity>
          );
        })()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    justifyContent: 'space-between',
    paddingBottom: 28,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 38,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#aaa',
    lineHeight: 22,
  },
  highlight: {
    color: '#fff',
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    flex: 1,
    alignContent: 'center',
  },
  card: {
    width: '47%',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#2a2a3e',
    position: 'relative',
  },
  cardLabel: {
    color: '#888',
    fontSize: 13,
    marginTop: 8,
    fontWeight: '500',
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12.5,
    lineHeight: 19,
    marginVertical: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
