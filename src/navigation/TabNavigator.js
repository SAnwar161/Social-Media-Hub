import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Text, 
  Dimensions,
  DeviceEventEmitter
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import PLATFORMS from '../config/platforms';
import SocialScreen from '../screens/SocialScreen';

const { width } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        decelerationRate="fast"
        snapToAlignment="center"
        scrollEventThrottle={16}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const platform = PLATFORMS.find(p => p.key === route.name);
          const brandColor = platform ? platform.color : '#007AFF';

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

          let IconComponent = MaterialCommunityIcons;
          if (platform?.iconLib === 'FontAwesome5') IconComponent = FontAwesome5;
          if (platform?.iconLib === 'Ionicons') IconComponent = Ionicons;

          const iconSize = isFocused ? 44 : 38;

          return (
            <TouchableOpacity
              key={route.name}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconWrapper,
                isFocused && { transform: [{ scale: 1.15 }] }
              ]}>
                <IconComponent 
                  name={platform?.iconName || 'apps'} 
                  size={iconSize} 
                  color={brandColor} 
                />
                
                {options.tabBarBadge && (
                  <View style={styles.badge} />
                )}
              </View>
              {isFocused && (
                <View style={[styles.activeIndicator, { backgroundColor: brandColor }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default function TabNavigator() {
  const [badges, setBadges] = useState({});

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('PLATFORM_BADGE_UPDATE', ({ platformKey, count }) => {
      setBadges(prev => ({ ...prev, [platformKey]: count > 0 }));
    });
    return () => sub.remove();
  }, []);

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {PLATFORMS.map((platform) => (
        <Tab.Screen
          key={platform.key}
          name={platform.key}
          options={{
            tabBarBadge: badges[platform.key] || false,
          }}
        >
          {() => (
            <SocialScreen
              url={platform.url}
              themeColor={platform.color}
              label={platform.label}
              platformKey={platform.key}
              customUserAgent={platform.customUserAgent}
            />
          )}
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    height: 85,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scrollContent: {
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    minWidth: 85,
    height: '100%',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#fff',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 8,
    width: 28,
    height: 4,
    borderRadius: 2,
  },
});
