import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Text,
  DeviceEventEmitter,
  Alert,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PLATFORMS from '../config/platforms';
import SocialScreen from '../screens/SocialScreen';
import { HOME_PLATFORM_KEY } from '../screens/OnboardingScreen';

const Tab = createBottomTabNavigator();

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
const CustomTabBar = ({ state, descriptors, navigation, badges, onChangeHome, homePlatform }) => {
  return (
    <View style={styles.tabBarContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        decelerationRate="fast"
        scrollEventThrottle={32}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const platform = PLATFORMS.find(p => p.key === route.name);
          if (!platform) return null;

          const isHome = platform.key === homePlatform;
          const IconComponent = platform.iconLib === 'FontAwesome5' ? FontAwesome5 : MaterialCommunityIcons;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            Alert.alert(
              `Set ${platform.label} as Home`,
              `${platform.label} will load instantly when you open the app.`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: '⭐ Set as Home',
                  onPress: () => onChangeHome(platform.key),
                },
              ]
            );
          };

          return (
            <TouchableOpacity
              key={route.name}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
              activeOpacity={0.75}
            >
              <View style={[
                styles.iconWrapper,
                isFocused && styles.iconWrapperActive,
                isFocused && { backgroundColor: platform.color + '18' },
              ]}>
                <IconComponent
                  name={platform.iconName}
                  size={isFocused ? 30 : 26}
                  color={isFocused ? platform.color : '#aaa'}
                />
                {/* Notification badge */}
                {badges[platform.key] && (
                  <View style={styles.badge} />
                )}
                {/* Home star indicator */}
                {isHome && (
                  <View style={[styles.homeStar, { backgroundColor: platform.color }]}>
                    <MaterialCommunityIcons name="star" size={8} color="#fff" />
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, isFocused && { color: platform.color, fontWeight: '700' }]}>
                {platform.label}
              </Text>
              {isFocused && (
                <View style={[styles.activeIndicator, { backgroundColor: platform.color }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// ─── Main Navigator ───────────────────────────────────────────────────────────
export default function TabNavigator({ initialPlatform }) {
  const [badges, setBadges] = useState({});
  const [homePlatform, setHomePlatform] = useState(initialPlatform || PLATFORMS[0].key);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      'PLATFORM_BADGE_UPDATE',
      ({ platformKey, count }) => {
        setBadges(prev => ({ ...prev, [platformKey]: count > 0 }));
      }
    );
    return () => sub.remove();
  }, []);

  const handleChangeHome = async (newKey) => {
    try {
      await AsyncStorage.setItem(HOME_PLATFORM_KEY, newKey);
      setHomePlatform(newKey);
      Alert.alert('✅ Home updated!', `${PLATFORMS.find(p => p.key === newKey)?.label} will load first next time you open the app.`);
    } catch (e) {}
  };

  return (
    <Tab.Navigator
      initialRouteName={homePlatform}
      // lazy=true (default) — tabs only mount when first visited
      screenOptions={{ headerShown: false, lazy: true }}
      tabBar={(props) => (
        <CustomTabBar
          {...props}
          badges={badges}
          onChangeHome={handleChangeHome}
          homePlatform={homePlatform}
        />
      )}
    >
      {PLATFORMS.map((platform) => (
        <Tab.Screen
          key={platform.key}
          name={platform.key}
        >
          {() => (
            <SocialScreen
              url={platform.url}
              themeColor={platform.color}
              label={platform.label}
              platformKey={platform.key}
              customUserAgent={platform.customUserAgent}
              iconName={platform.iconName}
              iconLib={platform.iconLib}
            />
          )}
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBarContainer: {
    height: 72,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  scrollContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    minWidth: 72,
    height: '100%',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 42,
    borderRadius: 12,
    position: 'relative',
  },
  iconWrapperActive: {
    borderRadius: 12,
  },
  tabLabel: {
    fontSize: 10,
    color: '#aaa',
    marginTop: 3,
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  homeStar: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  activeIndicator: {
    width: 20,
    height: 3,
    borderRadius: 2,
    marginTop: 2,
  },
});
