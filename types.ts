
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum ProjectType {
  DIGITAL = 'DIGITAL',
  PHYSICAL = 'PHYSICAL',
  SERVICE = 'SERVICE',
  OTHER = 'OTHER'
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatar: string;
  gender: 'Male' | 'Female';
  birthDate: string;
  location: string;
  role: UserRole;
  points: number;
  isPremium: boolean;
  adsCount: number; // Max 3 for free
}

export interface Project {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  description: string;
  type: ProjectType;
  image?: string;
  video?: string;
  link?: string;     // New: Direct project link
  fileUrl?: string;  // New: Uploaded project file URL
  stats: {
    views: number;
    interested: number;
    audience: number;
  };
  comments: Comment[];
  createdAt: string;
  isPinned?: boolean;
  isLiked?: boolean; // New: Track if current user liked it
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'location' | 'file';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: MessageType;
  content: string; // Text content or URL
  metadata?: {
    fileName?: string;
    fileSize?: string;
    duration?: string;
    lat?: number;
    lng?: number;
  };
  timestamp: string;
  isMe: boolean;
}

export interface CryptoWallet {
  currency: string;
  address: string;
  icon: string;
}

export enum View {
  HOME = 'HOME',
  PROFILE = 'PROFILE',
  UPLOAD = 'UPLOAD',
  CHAT = 'CHAT',
  SUBSCRIPTION = 'SUBSCRIPTION',
  SUPPORT = 'SUPPORT',
  AUTH = 'AUTH',
  SETTINGS = 'SETTINGS',
  TERMS = 'TERMS',
  PRIVACY = 'PRIVACY'
}
