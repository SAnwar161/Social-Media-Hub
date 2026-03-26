const PLATFORMS = [
  {
    key: 'facebook',
    label: 'Facebook',
    url: 'https://m.facebook.com',
    composerUrl: 'https://m.facebook.com/composer',
    shareUrl: 'https://m.facebook.com/sharer.php?u=',
    color: '#1877F2',
    iconLib: 'FontAwesome5',
    iconName: 'facebook'
  },
  {
    key: 'instagram',
    label: 'Instagram',
    url: 'https://www.instagram.com',
    composerUrl: 'https://www.instagram.com/create/style/',
    shareUrl: null,
    color: '#E1306C',
    iconLib: 'MaterialCommunityIcons',
    iconName: 'instagram'
  },
  {
    key: 'youtube',
    label: 'Youtube',
    url: 'https://m.youtube.com',
    composerUrl: 'https://m.youtube.com/upload',
    shareUrl: 'https://www.youtube.com/results?search_query=',
    color: '#FF0000',
    iconLib: 'MaterialCommunityIcons',
    iconName: 'youtube'
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    url: 'https://www.tiktok.com',
    composerUrl: 'https://www.tiktok.com/upload',
    shareUrl: null,
    color: '#EE1D52',
    iconLib: 'MaterialCommunityIcons',
    iconName: 'music-note',
    customUserAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  },
  {
    key: 'x',
    label: 'X',
    url: 'https://twitter.com', // Using twitter.com for better redirect stability
    composerUrl: 'https://twitter.com/intent/tweet',
    shareUrl: 'https://twitter.com/intent/tweet?url=',
    color: '#1DA1F2',
    iconLib: 'MaterialCommunityIcons',
    iconName: 'twitter',
    customUserAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    url: 'https://web.whatsapp.com',
    composerUrl: null,
    shareUrl: 'https://api.whatsapp.com/send?text=',
    color: '#25D366',
    iconLib: 'MaterialCommunityIcons',
    iconName: 'whatsapp',
    customUserAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  }
];

export default PLATFORMS;
