import { Linking } from 'react-native';

class NativeShareBridge {
  async canOpenPlatformApp(platformKey) {
    let scheme = '';
    switch (platformKey) {
      case 'facebook': scheme = 'fb://'; break;
      case 'x': scheme = 'twitter://'; break;
      case 'whatsapp': scheme = 'whatsapp://'; break;
      case 'instagram': scheme = 'instagram://'; break;
      default: return false;
    }
    try {
      return await Linking.canOpenURL(scheme);
    } catch {
      return false;
    }
  }

  async shareToNativeApp(platformKey, url, caption = '') {
    const isInstalled = await this.canOpenPlatformApp(platformKey);
    if (!isInstalled) return false;

    const encodedUrl = url ? encodeURIComponent(url) : '';
    const encodedCombined = encodeURIComponent(caption && url ? `${caption}\n\n${url}` : (caption || url || ''));
    let deepLinkUrl = '';

    switch (platformKey) {
      case 'facebook':
        // Facebook MUST only receive the URL
        if (!encodedUrl) return false;
        deepLinkUrl = `fb://facewebmodal/f?href=${encodeURIComponent('https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl)}`;
        break;
      case 'x':
        // Twitter can take message string
        deepLinkUrl = `twitter://post?message=${encodedCombined}`;
        break;
      case 'whatsapp':
        deepLinkUrl = `whatsapp://send?text=${encodedCombined}`;
        break;
      // Instagram doesn't support web links via intent easily without native modules,
      // handled via WebView + clipboard fallback
      default:
        return false;
    }

    try {
      await Linking.openURL(deepLinkUrl);
      return true;
    } catch {
      return false;
    }
  }
}

export default new NativeShareBridge();
