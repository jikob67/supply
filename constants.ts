import { CryptoWallet, Project, ProjectType, User, UserRole } from './types';

export const WALLETS: CryptoWallet[] = [
  { currency: 'Solana', address: 'F2UJS1wNzsfcQTknPsxBk7B25qWbU9JtiRW1eRgdwLJY', icon: 'sol' },
  { currency: 'Ethereum', address: '0xC5BC11e19D3De81a1365259A99AF4D88c62a8C50', icon: 'eth' },
  { currency: 'Monad', address: '0xC5BC11e19D3De81a1365259A99AF4D88c62a8C50', icon: 'mon' },
  { currency: 'Base', address: '0xC5BC11e19D3De81a1365259A99AF4D88c62a8C50', icon: 'base' },
  { currency: 'Sui', address: '0x41629e22deff6965100a4c28567dea45036d0360e6126a9c7f9c8fb1860a36c4', icon: 'sui' },
  { currency: 'Polygon', address: '0xC5BC11e19D3De81a1365259A99AF4D88c62a8C50', icon: 'poly' },
  { currency: 'Bitcoin', address: 'bc1q9s855ehn959s5t2g6kjt9q7pt5t55n9gq7gpd7', icon: 'btc' },
];

export const SUPPORT_EMAIL = 'jikob67@gmail.com';
export const SUPPORT_LINKS = [
  'https://jacobalcadiapps.wordpress.com',
  'https://jacobalcadiapps.blogspot.com'
];

export const SHARE_URL = 'https://ai.studio/apps/drive/1KluQWsBM5X0jPjPdzaU-LhfHYC7a9oPj?fullscreenApplet=true';

export const MOCK_USER: User = {
  id: 'u1',
  username: '@NewUser',
  fullName: 'مستخدم جديد',
  email: 'user@example.com',
  avatar: 'https://ui-avatars.com/api/?name=User&background=random',
  gender: 'Male',
  birthDate: '',
  location: '',
  role: UserRole.USER,
  points: 0,
  isPremium: false,
  adsCount: 0,
};

export const MOCK_PROJECTS: Project[] = [];