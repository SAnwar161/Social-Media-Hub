import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, DeviceEventEmitter, ActivityIndicator } from 'react-native';
import PLATFORMS from '../config/platforms';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ShareQueueIndicator() {
  const [queue, setQueue] = useState([]);
  const slideAnim = React.useRef(new Animated.Value(100)).current;

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('share-queue-updated', (newQueue) => {
      setQueue([...newQueue]);
    });
    return () => sub.remove();
  }, []);

  const activeItems = queue.filter(item => item.status !== 'completed' && item.status !== 'failed');
  const totalInBatch = queue.length;
  const completedCount = queue.filter(item => item.status === 'completed' || item.status === 'failed').length;

  useEffect(() => {
    if (activeItems.length > 0) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 150,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [activeItems.length, slideAnim]);

  if (queue.length === 0) return null;

  const currentItem = activeItems[0];
  if (!currentItem) return null; // All done being removed

  const platform = PLATFORMS.find(p => p.key === currentItem.platform);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.indicatorBox}>
        <ActivityIndicator size="small" color="#fff" style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.textPrimary}>
            Sharing to {platform?.label || 'Platform'}...
          </Text>
          <Text style={styles.textSecondary}>
            Item {completedCount + 1} of {totalInBatch}
          </Text>
        </View>
        <MaterialCommunityIcons name="check-circle-outline" size={24} color="rgba(255,255,255,0.5)" />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 150, // Above the FAB
    left: 20,
    right: 20,
    zIndex: 1000,
    alignItems: 'center',
  },
  indicatorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    width: '100%',
  },
  textPrimary: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  textSecondary: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
});
