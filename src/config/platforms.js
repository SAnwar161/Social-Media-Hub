// Mobile Android Chrome UA — works best for most social platforms
const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';

// Desktop UA — required for WhatsApp Web to work properly
const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const PLATFORMS = [
  {
    key: 'facebook',
    label: 'Facebook',
    url: 'https://m.facebook.com',
    color: '#1877F2',
    iconLib: 'FontAwesome5',
    iconName: 'facebook',
    customUserAgent: ANDROID_UA,
  },
  {
    key: 'instagram',
    label: 'Instagram',
    url: 'https://www.instagram.com',
    color: '#E1306C',
    iconLib: 'MaterialCommunityIcons',
    iconName: 'instagram',
    customUserAgent: ANDROID_UA,
  },
  {
    key: 'youtube',
    label: 'YouTube',
    url: 'https://m.youtube.com',
    color: '#FF0000',
    iconLib: 'MaterialCommunityIcons',
    iconName: 'youtube',
    customUserAgent: ANDROID_UA,
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    url: 'https://www.tiktok.com',
    color: '#EE1D52',
    iconLib: 'MaterialCommunityIcons',
    iconName: 'music-note',
    customUserAgent: ANDROID_UA,
  },
  {
    key: 'x',
    label: 'X',
    url: 'https://mobile.twitter.com',
    color: '#000000',
    iconLib: 'MaterialCommunityIcons',
    iconName: 'twitter',
    customUserAgent: ANDROID_UA,
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    url: 'https://web.whatsapp.com',
    color: '#25D366',
    iconLib: 'MaterialCommunityIcons',
    iconName: 'whatsapp',
    // WhatsApp Web requires desktop UA to show the proper interface
    customUserAgent: DESKTOP_UA,
  },
];

export default PLATFORMS;
