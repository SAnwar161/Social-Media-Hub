import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import PLATFORMS from '../config/platforms';

export default function ComposerModal({ visible, onClose, onPost, initialText = '', sourcePlatform = null }) {
  const [text, setText] = useState(initialText);
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    PLATFORMS.map(p => p.key)
  );
  const [mediaItems, setMediaItems] = useState([]);

  // Sync state when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      setText(initialText);
      setMediaItems([]);
      if (sourcePlatform) {
        setSelectedPlatforms([sourcePlatform]);
      } else {
        setSelectedPlatforms(PLATFORMS.map(p => p.key));
      }
    }
  }, [visible, initialText, sourcePlatform]);

  const requestPermission = async (type) => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    }
  };

  const pickFromGallery = async () => {
    const granted = await requestPermission('gallery');
    if (!granted) {
      Alert.alert('Permission Required', 'Please allow access to your media library in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // images & videos
      allowsMultipleSelection: true,
      quality: 0.85,
      videoMaxDuration: 60,
    });
    if (!result.canceled && result.assets) {
      setMediaItems(prev => [...prev, ...result.assets]);
    }
  };

  const pickFromCamera = async () => {
    const granted = await requestPermission('camera');
    if (!granted) {
      Alert.alert('Permission Required', 'Please allow camera access in Settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.85,
      videoMaxDuration: 60,
    });
    if (!result.canceled && result.assets) {
      setMediaItems(prev => [...prev, ...result.assets]);
    }
  };

  const removeMedia = (index) => {
    setMediaItems(prev => prev.filter((_, i) => i !== index));
  };

  const togglePlatform = (key) => {
    setSelectedPlatforms(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const handlePost = () => {
    if (text.trim().length === 0 && mediaItems.length === 0) return;
    onPost(text, selectedPlatforms, mediaItems);
    onClose();
    setText('');
    setMediaItems([]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Compose Post</Text>
          <TouchableOpacity 
            onPress={handlePost} 
            disabled={text.trim().length === 0 && mediaItems.length === 0}
            style={[styles.postButton, (text.trim().length === 0 && mediaItems.length === 0) && styles.disabledButton]}
          >
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Text Input */}
          <TextInput
            style={styles.input}
            placeholder="What's on your mind? (URLs work too!)"
            placeholderTextColor="#999"
            multiline
            autoFocus
            value={text}
            onChangeText={setText}
            textAlignVertical="top"
          />

          {/* Media Attachment Strip */}
          {mediaItems.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailStrip}>
              {mediaItems.map((item, index) => (
                <View key={index} style={styles.thumbnailContainer}>
                  <Image source={{ uri: item.uri }} style={styles.thumbnail} />
                  {item.type === 'video' && (
                    <View style={styles.videoOverlay}>
                      <MaterialCommunityIcons name="play-circle" size={28} color="#fff" />
                    </View>
                  )}
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeMedia(index)}>
                    <MaterialCommunityIcons name="close-circle" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Media Action Buttons */}
          <View style={styles.mediaBar}>
            <TouchableOpacity style={styles.mediaBtn} onPress={pickFromGallery}>
              <MaterialCommunityIcons name="image-multiple" size={22} color="#007AFF" />
              <Text style={styles.mediaBtnText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaBtn} onPress={pickFromCamera}>
              <MaterialCommunityIcons name="camera" size={22} color="#007AFF" />
              <Text style={styles.mediaBtnText}>Camera</Text>
            </TouchableOpacity>
            {mediaItems.length > 0 && (
              <Text style={styles.mediaCount}>{mediaItems.length} file{mediaItems.length > 1 ? 's' : ''} attached</Text>
            )}
          </View>

          {/* Platform Selection */}
          <Text style={styles.sectionTitle}>Select Platforms to Post/Forward</Text>
          <View style={styles.platformList}>
            {PLATFORMS.map((platform) => {
              const isSelected = selectedPlatforms.includes(platform.key);
              return (
                <TouchableOpacity
                  key={platform.key}
                  style={[
                    styles.platformCard,
                    isSelected && { borderColor: platform.color, backgroundColor: platform.color + '0C' }
                  ]}
                  onPress={() => togglePlatform(platform.key)}
                >
                  <View style={[styles.iconWrapper, isSelected && { backgroundColor: platform.color + '20' }]}>
                    {platform.iconLib === 'FontAwesome5' ? (
                      <FontAwesome5 name={platform.iconName} size={42} color={isSelected ? platform.color : '#999'} />
                    ) : (
                      <MaterialCommunityIcons name={platform.iconName} size={42} color={isSelected ? platform.color : '#999'} />
                    )}
                  </View>
                  <Text style={[styles.platformLabel, isSelected && { color: platform.color, fontWeight: '700' }]}>
                    {platform.label}
                  </Text>
                  <View style={styles.checkbox}>
                    {isSelected ? (
                      <MaterialCommunityIcons name="check-circle" size={28} color={platform.color} />
                    ) : (
                      <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={28} color="#ddd" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
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
  postButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    fontSize: 18,
    color: '#1c1c1e',
    minHeight: 120,
    marginBottom: 12,
  },
  // Media bar (Gallery / Camera buttons)
  mediaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  mediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    backgroundColor: '#F0F7FF',
  },
  mediaBtnText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  mediaCount: {
    marginLeft: 'auto',
    fontSize: 13,
    color: '#6c6c70',
    fontStyle: 'italic',
  },
  // Thumbnail strip
  thumbnailStrip: {
    marginBottom: 12,
  },
  thumbnailContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 10,
    position: 'relative',
    backgroundColor: '#eee',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10,
  },
  // Platform List
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  platformLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1c1c1e',
    flex: 1,
  },
  checkbox: {
    padding: 8,
  },
});
