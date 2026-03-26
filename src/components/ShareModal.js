import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import PLATFORMS from '../config/platforms';

function PlatformIcon({ platform, size = 28 }) {
  if (platform.iconLib === 'FontAwesome5') {
    return <FontAwesome5 name={platform.iconName} size={size} color={platform.color} />;
  }
  return <MaterialCommunityIcons name={platform.iconName} size={size} color={platform.color} />;
}

export default function ShareModal({ visible, onClose, sourceUrl, onShareTo }) {
  const [caption, setCaption] = useState('');

  const isObject = typeof sourceUrl === 'object' && sourceUrl !== null;
  const linkUrl = isObject ? sourceUrl.url : (sourceUrl || '');
  const linkTitle = isObject ? sourceUrl.title : '';
  const linkImage = isObject ? sourceUrl.image : '';

  useEffect(() => {
    if (visible) setCaption('');
  }, [visible]);

  const handleShare = (platform) => {
    onShareTo(platform, linkUrl, caption.trim());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={28} color="#1c1c1e" />
          </TouchableOpacity>
          <Text style={styles.title}>Forward Link</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          
          {/* Rich Link Preview */}
          {linkUrl ? (
            <View style={styles.previewCard}>
              {linkImage ? (
                <Image source={{ uri: linkImage }} style={styles.previewImage} />
              ) : (
                <View style={styles.previewImagePlaceholder}>
                  <MaterialCommunityIcons name="link-variant" size={24} color="#999" />
                </View>
              )}
              <View style={styles.previewTextContainer}>
                {linkTitle ? <Text style={styles.previewTitle} numberOfLines={2}>{linkTitle}</Text> : null}
                <Text style={styles.previewUrl} numberOfLines={1}>{linkUrl}</Text>
              </View>
            </View>
          ) : null}

          {/* Caption Input */}
          <TextInput
            style={styles.captionInput}
            placeholder="Add a message... (optional)"
            placeholderTextColor="#999"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={280}
          />

          <Text style={styles.sectionTitle}>Select Platform to Send To</Text>

          <View style={styles.platformList}>
            {PLATFORMS.map((platform) => (
              <TouchableOpacity
                key={platform.key}
                style={styles.platformCard}
                activeOpacity={0.7}
                onPress={() => handleShare(platform)}
              >
                <View style={[styles.iconWrapper, { backgroundColor: platform.color + '18' }]}>
                  <PlatformIcon platform={platform} size={36} />
                </View>
                
                <Text style={styles.platformLabel}>{platform.label}</Text>
                
                {/* Badge: shows whether it uses native share URL or clipboard */}
                <View style={[styles.badge, platform.shareUrl ? styles.badgeShare : styles.badgeClip]}>
                  <Text style={styles.badgeText}>
                    {platform.shareUrl ? '🔗 Share' : '📋 Paste'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  previewCard: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  previewImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#e5e5ea',
  },
  previewImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#e5e5ea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewTextContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 2,
  },
  previewUrl: {
    fontSize: 12,
    color: '#8e8e93',
  },
  captionInput: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1c1c1e',
    minHeight: 100,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c6c70',
    marginBottom: 16,
  },
  platformList: {
    flexDirection: 'column',
    paddingBottom: 20,
  },
  platformCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#eee',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  platformLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeShare: {
    backgroundColor: '#E8F5E9',
  },
  badgeClip: {
    backgroundColor: '#FFF3E0',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
});
