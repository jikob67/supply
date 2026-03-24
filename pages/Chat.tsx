
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  Mic, 
  MapPin, 
  Paperclip, 
  Video, 
  FileText, 
  Play, 
  Pause, 
  MoreVertical, 
  Search, 
  Phone, 
  Video as VideoIcon,
  X,
  Download,
  MessageSquare,
  StopCircle,
  PhoneOff,
  MicOff,
  VideoOff,
  User,
  Trash2,
  Info,
  Bell,
  BellOff,
  Users
} from 'lucide-react';
import { ChatMessage, MessageType, Project, User as UserType } from '../types';

const AudioPlayer: React.FC<{ src: string; duration?: string }> = ({ src, duration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateProgress = () => { if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100); };
    const handleEnded = () => { setIsPlaying(false); setProgress(0); };
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    return () => { audio.removeEventListener('timeupdate', updateProgress); audio.removeEventListener('ended', handleEnded); };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-3 min-w-[200px] p-2">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors shrink-0">
        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
      </button>
      <div className="flex-1 flex flex-col justify-center gap-1">
        <div className="h-1 bg-current/30 rounded-full w-full relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full bg-current rounded-full transition-all duration-100" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="text-[10px] opacity-80 text-right font-mono" dir="ltr">
          {isPlaying && audioRef.current ? formatDuration(audioRef.current.currentTime) : (duration || '0:00')}
        </span>
      </div>
    </div>
  );
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

interface ChatProps {
  initialProject?: Project | null;
  currentUser?: UserType | null;
}

interface Contact {
  id: string;
  name: string;
  lastMsg: string;
  time: string;
  avatar: string | null;
  isGroup: boolean;
  projectContext?: {
    title: string;
    image: string;
  };
}

const Chat: React.FC<ChatProps> = ({ initialProject, currentUser }) => {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: 'community-main', name: 'مجتمع supply العام', lastMsg: '', time: '', avatar: null, isGroup: true },
  ]);
  const [activeChat, setActiveChat] = useState<string>('community-main'); 
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected'>('idle');
  const [callType, setCallType] = useState<'audio' | 'video' | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const callStreamRef = useRef<MediaStream | null>(null);
  const callTimerRef = useRef<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCommunityInfo, setShowCommunityInfo] = useState(false);
  const [isNotificationsMuted, setIsNotificationsMuted] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [allMessages, setAllMessages] = useState<Record<string, ChatMessage[]>>({});

  useEffect(() => {
    if (initialProject) {
      const existingContact = contacts.find(c => c.id === initialProject.ownerId);
      if (!existingContact) {
        const newContact: Contact = {
          id: initialProject.ownerId,
          name: initialProject.ownerName,
          lastMsg: 'بدء محادثة جديدة',
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          avatar: initialProject.image || `https://ui-avatars.com/api/?name=${initialProject.ownerName}&background=random`,
          isGroup: false,
          projectContext: { title: initialProject.title, image: initialProject.image || '' }
        };
        setContacts(prev => [newContact, ...prev]);
        setActiveChat(initialProject.ownerId);
        if (!allMessages[initialProject.ownerId]) {
          const welcomeMsg: ChatMessage = { id: 'sys-1', senderId: 'system', senderName: 'النظام', senderAvatar: '', type: 'text', content: `مرحباً بك! أنت الآن تتحدث مع صاحب مشروع "${initialProject.title}".`, timestamp: new Date().toLocaleTimeString(), isMe: false };
          setAllMessages(prev => ({ ...prev, [initialProject.ownerId]: [welcomeMsg] }));
        }
      } else {
        setActiveChat(initialProject.ownerId);
      }
    }
  }, [initialProject]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [allMessages, activeChat]);

  const addMessage = (type: MessageType, content: string, metadata?: any) => {
    const newMessage: ChatMessage = { id: Date.now().toString(), senderId: currentUser?.id || 'me', senderName: currentUser?.fullName || 'أنا', senderAvatar: currentUser?.avatar || '', type, content, metadata, timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }), isMe: true };
    setAllMessages(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), newMessage] }));
    setContacts(prev => prev.map(c => c.id === activeChat ? { ...c, lastMsg: type === 'text' ? content : `تم إرسال ${type}`, time: newMessage.timestamp } : c ));
  };

  const handleSendMessage = () => { if (!inputText.trim()) return; addMessage('text', inputText); setInputText(''); };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        addMessage('audio', audioUrl, { duration: formatDuration(recordingTime) });
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerIntervalRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (e) { alert('لا يمكن الوصول للميكروفون'); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const startCall = async (type: 'audio' | 'video') => {
    try {
      setCallType(type); setCallStatus('calling');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === 'video' });
      callStreamRef.current = stream;
      setTimeout(() => { if (localVideoRef.current) localVideoRef.current.srcObject = stream; }, 100);
      setTimeout(() => {
        setCallStatus('connected'); setCallDuration(0);
        callTimerRef.current = window.setInterval(() => setCallDuration(prev => prev + 1), 1000);
      }, 2000);
    } catch (e) { alert("تعذر الوصول للكاميرا/الميكروفون"); setCallStatus('idle'); }
  };

  const endCall = () => {
    if (callStreamRef.current) callStreamRef.current.getTracks().forEach(track => track.stop());
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    addMessage('text', `انتهت مكالمة ${callType === 'video' ? 'فيديو' : 'صوتية'} - المدة: ${formatDuration(callDuration)}`);
    setCallStatus('idle'); setCallType(null); setCallDuration(0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: MessageType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    addMessage(type, url, type === 'file' ? { fileName: file.name, fileSize: `${(file.size/1024/1024).toFixed(1)}MB` } : {});
    e.target.value = '';
  };

  const currentMessages = allMessages[activeChat] || [];
  const currentContact = contacts.find(c => c.id === activeChat);

  const renderMessageContent = (msg: ChatMessage) => {
    switch (msg.type) {
      case 'image': return <img src={msg.content} className="max-w-xs rounded-lg" />;
      case 'video': return <video src={msg.content} controls className="max-w-xs rounded-lg" />;
      case 'audio': return <AudioPlayer src={msg.content} duration={msg.metadata?.duration} />;
      case 'file': return <div className="p-2 bg-black/5 rounded flex gap-2"><FileText size={18} /><span>{msg.metadata?.fileName}</span></div>;
      case 'location': return <div className="text-xs">موقع جغرافي مشترك</div>;
      default: return <p>{msg.content}</p>;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-8rem)] flex overflow-hidden relative">
      {showCommunityInfo && currentContact?.isGroup && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCommunityInfo(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-primary mb-4">معلومات المجتمع</h3>
            <p className="text-sm text-gray-600 mb-6">المكان الرسمي لتبادل الخبرات والنقاش حول المشاريع على منصة supply.</p>
            <button onClick={() => setShowCommunityInfo(false)} className="w-full bg-primary text-white py-3 rounded-xl font-bold">إغلاق</button>
          </div>
        </div>
      )}

      {callStatus !== 'idle' && (
        <div className="absolute inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center text-white">
          <h2 className="text-2xl font-bold mb-4">{currentContact?.name}</h2>
          <p className="mb-10">{callStatus === 'calling' ? 'جاري الاتصال...' : formatDuration(callDuration)}</p>
          <button onClick={endCall} className="p-6 bg-red-600 rounded-full"><PhoneOff size={32} /></button>
        </div>
      )}

      <div className={`w-full md:w-80 border-l border-gray-100 flex flex-col bg-gray-50 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b bg-white"><h2 className="text-xl font-bold text-primary">المحادثات</h2></div>
        <div className="flex-1 overflow-y-auto">
          {contacts.map(c => (
            <div key={c.id} onClick={() => setActiveChat(c.id)} className={`p-4 flex gap-3 cursor-pointer hover:bg-white border-b ${activeChat === c.id ? 'bg-white border-l-4 border-l-primary' : ''}`}>
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">{c.avatar ? <img src={c.avatar} className="w-full h-full object-cover rounded-full" /> : '#'}</div>
              <div className="flex-1 min-w-0"><h3 className="font-bold truncate">{c.name}</h3><p className="text-sm text-gray-500 truncate">{c.lastMsg}</p></div>
            </div>
          ))}
        </div>
      </div>

      <div className={`flex-1 flex flex-col bg-gray-100 ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-3 border-b bg-white flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setActiveChat('')}><X size={20} /></button>
            <h3 className="font-bold">{currentContact?.name}</h3>
          </div>
          <div className="flex gap-2">
            <button onClick={() => startCall('audio')} className="p-2 text-primary hover:bg-gray-50 rounded-full"><Phone size={20} /></button>
            <button onClick={() => startCall('video')} className="p-2 text-primary hover:bg-gray-50 rounded-full"><VideoIcon size={20} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentMessages.map(m => (
            <div key={m.id} className={`flex ${m.isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${m.isMe ? 'bg-primary text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                {renderMessageContent(m)}
                <span className="text-[10px] block text-right mt-1 opacity-60">{m.timestamp}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-white border-t flex gap-2 items-end">
          {isRecording ? (
            <div className="flex-1 bg-red-50 rounded-full px-4 py-3 flex justify-between items-center">
              <span className="text-red-600 font-bold">{formatDuration(recordingTime)}</span>
              <button onClick={stopRecording} className="bg-red-600 text-white px-4 py-1 rounded-full">إرسال</button>
            </div>
          ) : (
            <>
              <label className="p-2 cursor-pointer"><input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'image')} /><ImageIcon size={22} /></label>
              <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="اكتب رسالة..." className="flex-1 bg-gray-100 px-4 py-2 rounded-2xl focus:outline-none" />
              {inputText.trim() ? <button onClick={handleSendMessage} className="p-3 bg-primary text-white rounded-full"><Send size={20} className="rtl:-rotate-90" /></button> : <button onClick={startRecording} className="p-3 bg-gray-200 rounded-full"><Mic size={20} /></button>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
