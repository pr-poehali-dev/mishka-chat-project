import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';

type Contact = {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  lastMsg: string;
  time: string;
  unread: number;
  isGroup: boolean;
  members?: number;
  phone?: string;
};

type Message = {
  id: number;
  text: string;
  out: boolean;
  time: string;
  type?: 'file' | 'image' | 'video';
  fileName?: string;
  fileSize?: string;
  mediaUrl?: string;
};

const INITIAL_CONTACTS: Contact[] = [
  { id: 1, name: 'Алекс Громов', avatar: '🦁', status: 'online', lastMsg: 'Окей, увидимся завтра!', time: '14:32', unread: 2, isGroup: false, phone: '+7 (900) 111-22-33' },
  { id: 2, name: 'Команда Дизайн', avatar: '🎨', status: 'online', lastMsg: 'Новые макеты готовы 🔥', time: '13:15', unread: 5, isGroup: true, members: 8 },
  { id: 3, name: 'Маша Светлова', avatar: '🌸', status: 'online', lastMsg: 'Ты видел этот фильм?', time: '12:40', unread: 0, isGroup: false, phone: '+7 (900) 444-55-66' },
  { id: 4, name: 'Игровой Клан', avatar: '🎮', status: 'online', lastMsg: 'Рейд в 21:00, все готовы?', time: '11:55', unread: 12, isGroup: true, members: 24 },
  { id: 5, name: 'Дима Козлов', avatar: '🚀', status: 'away', lastMsg: 'Буду через час', time: '10:20', unread: 0, isGroup: false, phone: '+7 (900) 777-88-99' },
  { id: 6, name: 'Семья', avatar: '🏠', status: 'online', lastMsg: 'Мама: Ужин в 19:00!', time: 'вчера', unread: 3, isGroup: true, members: 5 },
  { id: 7, name: 'Катя Миронова', avatar: '⭐', status: 'offline', lastMsg: 'Спасибо за помощь!', time: 'вчера', unread: 0, isGroup: false, phone: '+7 (900) 000-11-22' },
];

const INIT_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, text: 'Привет! Как дела?', out: false, time: '14:10' },
    { id: 2, text: 'Всё отлично! Работаю над новым проектом 🚀', out: true, time: '14:12' },
    { id: 3, text: 'О круто! Расскажи подробнее', out: false, time: '14:15' },
    { id: 4, text: 'Делаю мессенджер на React, выглядит огонь!', out: true, time: '14:20' },
    { id: 5, text: 'Окей, увидимся завтра!', out: false, time: '14:32' },
  ],
  2: [
    { id: 1, text: 'Ребята, загружаю новые макеты', out: false, time: '13:00' },
    { id: 2, text: 'design_v3_final.fig', out: false, time: '13:01', type: 'file', fileName: 'design_v3_final.fig', fileSize: '24.5 МБ' },
    { id: 3, text: 'Смотрю сейчас!', out: true, time: '13:10' },
    { id: 4, text: 'Новые макеты готовы 🔥', out: false, time: '13:15' },
  ],
  3: [
    { id: 1, text: 'Привет Маша! Давно не виделись 🌸', out: true, time: '12:30' },
    { id: 2, text: 'Привет! Да, скучала! Ты видел этот фильм?', out: false, time: '12:40' },
  ],
};

const AVATAR_OPTIONS = ['😊','🦁','🌸','🚀','🎨','🎮','🏠','⭐','🐻','🦊','💎','🌊','🌙','🔥','💡','😎','🌺','🦋','🎯','🧊'];

const EMOJIS = [
  '😀','😂','🥹','😍','🥰','😎','🤩','😏','😢','😭','😤','😡','🤯','🥳','😴',
  '👍','👎','❤️','🔥','⭐','💯','🎉','🙏','👏','✌️','🤝','💪','🫶','🤘','👀',
  '🚀','💡','🎮','🎨','🎵','🍕','☕','🌟','💎','🏆','🌈','⚡','💥','🎯','🛸',
  '😻','🐻','🦁','🐯','🦊','🐺','🐸','🐧','🦄','🐉','🍀','🌸','🌊','🌙','☀️',
];

export default function MishkaChat() {
  const [activeTab, setActiveTab] = useState<'chats' | 'profile' | 'settings'>('chats');
  const [activeChat, setActiveChat] = useState<number | null>(1);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Record<number, Message[]>>(INIT_MESSAGES);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);

  // Медиа-превью перед отправкой
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: 'image' | 'video'; file: File } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Поиск по сообщениям в чате
  const [chatSearchOpen, setChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');

  // Контекстное меню чата (удаление, очистка)
  const [chatMenuId, setChatMenuId] = useState<number | null>(null);

  // Модалки создания
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showNewContact, setShowNewContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactAvatar, setNewContactAvatar] = useState('😊');

  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupAvatar, setNewGroupAvatar] = useState('👥');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

  // Профиль пользователя
  const [profile, setProfile] = useState({
    name: 'Иван Петров',
    username: 'ivan_petrov',
    phone: '+7 (999) 123-45-67',
    email: 'ivan@example.com',
    status: '🚀 Запускаю ракеты',
    birthday: '15 мая 1995',
    avatar: '😎',
  });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // Настройки — toggles
  const [settings, setSettings] = useState({
    darkTheme: true,
    doubleCheck: true,
    autoGif: false,
    soundNotif: true,
    showLastSeen: true,
    sendOnEnter: true,
  });
  const [activeSettingsSection, setActiveSettingsSection] = useState<string | null>(null);

  // Подсчёт реальной статистики
  const contactsCount = contacts.filter(c => !c.isGroup).length;
  const groupsCount = contacts.filter(c => c.isGroup).length;
  const totalMessages = Object.values(messages).reduce((acc, arr) => acc + arr.filter(m => m.out).length, 0);

  const startEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditingValue(value);
  };

  const saveEdit = () => {
    if (!editingField) return;
    setProfile(p => ({ ...p, [editingField]: editingValue.trim() || p[editingField as keyof typeof p] }));
    setEditingField(null);
  };

  const createContact = () => {
    if (!newContactName.trim()) return;
    const newC: Contact = {
      id: Date.now(),
      name: newContactName.trim(),
      avatar: newContactAvatar,
      status: 'offline',
      lastMsg: 'Новый контакт',
      time: 'сейчас',
      unread: 0,
      isGroup: false,
      phone: newContactPhone.trim() || undefined,
    };
    setContacts(prev => [newC, ...prev]);
    setActiveChat(newC.id);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactAvatar('😊');
    setShowNewContact(false);
  };

  const createGroup = () => {
    if (!newGroupName.trim()) return;
    const newG: Contact = {
      id: Date.now(),
      name: newGroupName.trim(),
      avatar: newGroupAvatar,
      status: 'online',
      lastMsg: 'Группа создана',
      time: 'сейчас',
      unread: 0,
      isGroup: true,
      members: selectedMembers.length + 1,
    };
    setContacts(prev => [newG, ...prev]);
    setActiveChat(newG.id);
    setNewGroupName('');
    setNewGroupAvatar('👥');
    setSelectedMembers([]);
    setShowNewGroup(false);
  };

  const deleteChat = (id: number) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    setMessages(prev => { const n = { ...prev }; delete n[id]; return n; });
    if (activeChat === id) setActiveChat(null);
    setChatMenuId(null);
  };

  const clearChat = (id: number) => {
    setMessages(prev => ({ ...prev, [id]: [] }));
    setContacts(prev => prev.map(c => c.id === id ? { ...c, lastMsg: 'Чат очищен', time: 'сейчас', unread: 0 } : c));
    setChatMenuId(null);
  };

  const toggleMember = (id: number) => {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const sendMessage = () => {
    if (!message.trim() || !activeChat) return;
    const newMsg: Message = {
      id: Date.now(),
      text: message.trim(),
      out: true,
      time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), newMsg] }));
    setContacts(prev => prev.map(c => c.id === activeChat ? { ...c, lastMsg: message.trim(), time: 'сейчас' } : c));
    setMessage('');
  };

  const sendMedia = () => {
    if (!mediaPreview || !activeChat) return;
    const newMsg: Message = {
      id: Date.now(),
      text: '',
      out: true,
      time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      type: mediaPreview.type,
      mediaUrl: mediaPreview.url,
      fileName: mediaPreview.file.name,
      fileSize: (mediaPreview.file.size / 1024 / 1024).toFixed(1) + ' МБ',
    };
    setMessages(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), newMsg] }));
    setContacts(prev => prev.map(c => c.id === activeChat ? {
      ...c,
      lastMsg: mediaPreview.type === 'image' ? '📷 Фото' : '🎥 Видео',
      time: 'сейчас',
    } : c));
    setMediaPreview(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) return;
    const url = URL.createObjectURL(file);
    setMediaPreview({ url, type: isImage ? 'image' : 'video', file });
    e.target.value = '';
  };

  const insertEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const currentContact = contacts.find(c => c.id === activeChat);
  const rawMessages = activeChat ? (messages[activeChat] || []) : [];
  const currentMessages = chatSearchQuery.trim()
    ? rawMessages.filter(m => m.text.toLowerCase().includes(chatSearchQuery.toLowerCase()))
    : rawMessages;

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const nonGroupContacts = contacts.filter(c => !c.isGroup);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!chatSearchQuery) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat, chatSearchQuery]);

  const tabs = [
    { id: 'chats', icon: 'MessageCircle', label: 'Чаты' },
    { id: 'profile', icon: 'User', label: 'Профиль' },
    { id: 'settings', icon: 'Settings', label: 'Настройки' },
  ] as const;

  return (
    <div className="flex h-screen w-full overflow-hidden mesh-bg font-rubik">

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Modal: Media Preview */}
      {mediaPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setMediaPreview(null)}>
          <div className="relative w-full max-w-md glass-strong border border-white/15 rounded-3xl overflow-hidden animate-scale-in shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <p className="font-golos font-bold text-foreground">
                {mediaPreview.type === 'image' ? '📷 Отправить фото' : '🎥 Отправить видео'}
              </p>
              <button onClick={() => setMediaPreview(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="p-4">
              {mediaPreview.type === 'image' ? (
                <img src={mediaPreview.url} alt="preview" className="w-full max-h-80 object-contain rounded-2xl" />
              ) : (
                <video src={mediaPreview.url} controls className="w-full max-h-80 rounded-2xl" />
              )}
              <p className="text-xs text-muted-foreground mt-3 text-center truncate">{mediaPreview.file.name} • {(mediaPreview.file.size / 1024 / 1024).toFixed(1)} МБ</p>
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button onClick={() => setMediaPreview(null)} className="flex-1 py-3 rounded-2xl glass border border-white/10 text-muted-foreground hover:text-foreground transition-all text-sm font-medium">
                Отмена
              </button>
              <button onClick={sendMedia} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold hover:opacity-90 transition-all neon-purple text-sm">
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Contact */}
      {showNewContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowNewContact(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm glass-strong border border-white/15 rounded-3xl p-6 animate-scale-in shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-golos font-bold text-lg gradient-text">Новый контакт</h3>
              <button onClick={() => setShowNewContact(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="mb-5">
              <p className="text-xs text-muted-foreground mb-2">Аватар</p>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.map(em => (
                  <button key={em} onClick={() => setNewContactAvatar(em)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-all hover:scale-110 ${newContactAvatar === em ? 'bg-primary/30 border border-primary/60 scale-110' : 'bg-muted hover:bg-muted/80'}`}>
                    {em}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3 mb-5">
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Имя *</p>
                <input autoFocus value={newContactName} onChange={e => setNewContactName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createContact()} placeholder="Введите имя"
                  className="w-full bg-muted/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Телефон</p>
                <input value={newContactPhone} onChange={e => setNewContactPhone(e.target.value)}
                  placeholder="+7 (000) 000-00-00"
                  className="w-full bg-muted/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all" />
              </div>
            </div>
            <button onClick={createContact} disabled={!newContactName.trim()}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold disabled:opacity-40 hover:opacity-90 transition-all hover-lift neon-purple">
              Добавить контакт
            </button>
          </div>
        </div>
      )}

      {/* Modal: New Group */}
      {showNewGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowNewGroup(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm glass-strong border border-white/15 rounded-3xl p-6 animate-scale-in shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-golos font-bold text-lg gradient-text">Новая группа</h3>
              <button onClick={() => setShowNewGroup(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Аватар группы</p>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.map(em => (
                  <button key={em} onClick={() => setNewGroupAvatar(em)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-all hover:scale-110 ${newGroupAvatar === em ? 'bg-primary/30 border border-primary/60 scale-110' : 'bg-muted hover:bg-muted/80'}`}>
                    {em}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-1.5">Название группы *</p>
              <input autoFocus value={newGroupName} onChange={e => setNewGroupName(e.target.value)}
                placeholder="Например: Рабочие ребята"
                className="w-full bg-muted/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all" />
            </div>
            <div className="mb-5">
              <p className="text-xs text-muted-foreground mb-2">
                Участники {selectedMembers.length > 0 && <span className="text-primary">• {selectedMembers.length} выбрано</span>}
              </p>
              <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                {nonGroupContacts.map(c => (
                  <button key={c.id} onClick={() => toggleMember(c.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${selectedMembers.includes(c.id) ? 'bg-primary/15 border border-primary/30' : 'hover:bg-white/5'}`}>
                    <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-lg flex-shrink-0">{c.avatar}</div>
                    <span className="text-sm text-foreground flex-1">{c.name}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selectedMembers.includes(c.id) ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                      {selectedMembers.includes(c.id) && <Icon name="Check" size={11} className="text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={createGroup} disabled={!newGroupName.trim()}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold disabled:opacity-40 hover:opacity-90 transition-all hover-lift neon-purple">
              Создать группу {selectedMembers.length > 0 && `• ${selectedMembers.length + 1} участников`}
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="flex flex-col w-16 border-r border-white/5 glass flex-shrink-0 items-center py-4 gap-3">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${activeTab === tab.id ? 'bg-gradient-to-br from-purple-500 to-cyan-400 neon-purple text-white' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
            title={tab.label}>
            <Icon name={tab.icon} size={19} />
          </button>
        ))}
      </div>

      {/* Chats tab */}
      {activeTab === 'chats' && (
        <>
          <div className="flex flex-col w-72 lg:w-80 border-r border-white/5 overflow-hidden flex-shrink-0">
            {/* Header */}
            <div className="px-4 pt-6 pb-3 space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-golos font-bold gradient-text">Сообщения</h1>
                <div className="relative">
                  <button onClick={() => setShowAddMenu(v => !v)}
                    className={`w-8 h-8 rounded-xl glass border flex items-center justify-center transition-all ${showAddMenu ? 'border-primary/50 text-primary bg-primary/10' : 'border-white/10 text-muted-foreground hover:text-primary'}`}>
                    <Icon name={showAddMenu ? 'X' : 'Plus'} size={16} />
                  </button>
                  {showAddMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowAddMenu(false)} />
                      <div className="absolute right-0 top-10 z-20 glass-strong border border-white/15 rounded-2xl p-1.5 w-44 animate-scale-in shadow-2xl">
                        <button onClick={() => { setShowAddMenu(false); setShowNewContact(true); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 transition-colors text-left">
                          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                            <Icon name="UserPlus" size={14} className="text-primary" />
                          </div>
                          <span className="text-sm text-foreground">Новый контакт</span>
                        </button>
                        <button onClick={() => { setShowAddMenu(false); setShowNewGroup(true); setSelectedMembers([]); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 transition-colors text-left">
                          <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
                            <Icon name="Users" size={14} className="text-accent" />
                          </div>
                          <span className="text-sm text-foreground">Новая группа</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="relative">
                <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Поиск чатов..."
                  className="w-full bg-muted/50 border border-white/8 rounded-xl pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-all" />
              </div>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
              {filteredContacts.map(contact => (
                <div key={contact.id} className="relative group/item">
                  <button onClick={() => { setActiveChat(contact.id); setChatSearchOpen(false); setChatSearchQuery(''); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all hover:bg-white/5 text-left ${activeChat === contact.id ? 'bg-white/8 border border-white/8' : ''}`}>
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center text-2xl">
                        {contact.avatar}
                      </div>
                      {contact.status === 'online' && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-background animate-online" />
                      )}
                      {contact.status === 'away' && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-400 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-golos font-semibold text-sm text-foreground truncate">{contact.name}</p>
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                          <span className="text-xs text-muted-foreground">{contact.time}</span>
                          {contact.unread > 0 && (
                            <span className="min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                              {contact.unread > 99 ? '99+' : contact.unread}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{contact.lastMsg}</p>
                    </div>
                  </button>
                  {/* Context menu button */}
                  <button
                    onClick={e => { e.stopPropagation(); setChatMenuId(chatMenuId === contact.id ? null : contact.id); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-muted flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity z-10"
                  >
                    <Icon name="MoreVertical" size={13} className="text-muted-foreground" />
                  </button>
                  {chatMenuId === contact.id && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setChatMenuId(null)} />
                      <div className="absolute right-2 top-10 z-30 glass-strong border border-white/15 rounded-xl p-1 w-40 animate-scale-in shadow-xl">
                        <button onClick={() => clearChat(contact.id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/8 transition-colors text-sm text-foreground text-left">
                          <Icon name="Eraser" size={13} className="text-muted-foreground" />
                          Очистить чат
                        </button>
                        <button onClick={() => deleteChat(contact.id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-sm text-red-400 text-left">
                          <Icon name="Trash2" size={13} />
                          {contact.isGroup ? 'Удалить группу' : 'Удалить чат'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat window */}
          <div className="flex flex-1 min-w-0 overflow-hidden">
            {activeChat && currentContact ? (
              <>
                <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                  {/* Chat header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 glass">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center text-xl">
                          {currentContact.avatar}
                        </div>
                        {currentContact.status === 'online' && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-background animate-online" />
                        )}
                      </div>
                      <button onClick={() => setShowInfoPanel(v => !v)} className="text-left group">
                        <p className="font-golos font-semibold text-foreground group-hover:text-primary transition-colors">{currentContact.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          {currentContact.status === 'online' ? (
                            <><span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" /> в сети</>
                          ) : currentContact.status === 'away' ? (
                            <><span className="w-1.5 h-1.5 bg-yellow-400 rounded-full inline-block" /> не беспокоить</>
                          ) : 'не в сети'}
                          {currentContact.isGroup && ` • ${currentContact.members} участников`}
                        </p>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setChatSearchOpen(v => !v); setChatSearchQuery(''); }}
                        className={`w-9 h-9 rounded-xl glass border flex items-center justify-center transition-all ${chatSearchOpen ? 'border-primary/50 text-primary bg-primary/10' : 'border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
                        title="Поиск в чате"
                      >
                        <Icon name="Search" size={17} />
                      </button>
                    </div>
                  </div>

                  {/* Chat search bar */}
                  {chatSearchOpen && (
                    <div className="px-6 py-2.5 border-b border-white/5 glass flex items-center gap-3 animate-fade-in">
                      <Icon name="Search" size={15} className="text-muted-foreground flex-shrink-0" />
                      <input
                        autoFocus
                        value={chatSearchQuery}
                        onChange={e => setChatSearchQuery(e.target.value)}
                        placeholder="Поиск в сообщениях..."
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                      {chatSearchQuery && (
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {currentMessages.length} {currentMessages.length === 1 ? 'совпадение' : 'совпадений'}
                        </span>
                      )}
                      <button onClick={() => { setChatSearchOpen(false); setChatSearchQuery(''); }} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                        <Icon name="X" size={15} />
                      </button>
                    </div>
                  )}

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                    {currentMessages.length === 0 && chatSearchQuery ? (
                      <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
                        <div className="text-4xl mb-3">🔍</div>
                        <p className="text-muted-foreground text-sm">Ничего не найдено по запросу «{chatSearchQuery}»</p>
                      </div>
                    ) : currentMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
                        <div className="text-4xl mb-3">💬</div>
                        <p className="text-muted-foreground text-sm">Нет сообщений. Напиши первым!</p>
                      </div>
                    ) : currentMessages.map((msg, i) => (
                      <div key={msg.id} style={{ animationDelay: `${i * 0.04}s` }}
                        className={`flex animate-fade-in ${msg.out ? 'justify-end' : 'justify-start'}`}>
                        {msg.type === 'image' ? (
                          <div className={`max-w-xs rounded-2xl overflow-hidden ${msg.out ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                            <img src={msg.mediaUrl} alt="фото" className="w-full max-h-60 object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                            <div className={`px-3 py-1.5 ${msg.out ? 'msg-out rounded-t-none' : 'msg-in rounded-t-none'}`}>
                              <p className={`text-xs text-right ${msg.out ? 'text-white/60' : 'text-muted-foreground'}`}>{msg.time}</p>
                            </div>
                          </div>
                        ) : msg.type === 'video' ? (
                          <div className={`max-w-xs rounded-2xl overflow-hidden ${msg.out ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                            <video src={msg.mediaUrl} controls className="w-full max-h-48 object-cover" />
                            <div className={`px-3 py-1.5 ${msg.out ? 'msg-out rounded-t-none' : 'msg-in rounded-t-none'}`}>
                              <p className={`text-xs text-right ${msg.out ? 'text-white/60' : 'text-muted-foreground'}`}>{msg.time}</p>
                            </div>
                          </div>
                        ) : msg.type === 'file' ? (
                          <div className={`max-w-xs ${msg.out ? 'msg-out' : 'msg-in'} px-4 py-3`}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                <Icon name="File" size={20} className={msg.out ? 'text-white' : 'text-primary'} />
                              </div>
                              <div className="min-w-0">
                                <p className={`text-sm font-medium truncate ${msg.out ? 'text-white' : 'text-foreground'}`}>{msg.fileName}</p>
                                <p className={`text-xs ${msg.out ? 'text-white/70' : 'text-muted-foreground'}`}>{msg.fileSize}</p>
                              </div>
                              <Icon name="Download" size={16} className={msg.out ? 'text-white/70' : 'text-muted-foreground'} />
                            </div>
                            <p className={`text-xs mt-2 text-right ${msg.out ? 'text-white/60' : 'text-muted-foreground'}`}>{msg.time}</p>
                          </div>
                        ) : (
                          <div className={`max-w-sm lg:max-w-md px-4 py-2.5 ${msg.out ? 'msg-out' : 'msg-in'}`}>
                            {chatSearchQuery && msg.text.toLowerCase().includes(chatSearchQuery.toLowerCase()) ? (
                              <p className={`text-sm leading-relaxed ${msg.out ? 'text-white' : 'text-foreground'}`}>
                                {msg.text.split(new RegExp(`(${chatSearchQuery})`, 'gi')).map((part, idx) =>
                                  part.toLowerCase() === chatSearchQuery.toLowerCase()
                                    ? <mark key={idx} className="bg-yellow-400/40 text-inherit rounded px-0.5">{part}</mark>
                                    : part
                                )}
                              </p>
                            ) : (
                              <p className={`text-sm leading-relaxed ${msg.out ? 'text-white' : 'text-foreground'}`}>{msg.text}</p>
                            )}
                            <p className={`text-xs mt-1 text-right ${msg.out ? 'text-white/60' : 'text-muted-foreground'}`}>{msg.time}</p>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Typing indicator */}
                    {currentContact.status === 'online' && !chatSearchQuery && (
                      <div className="flex justify-start animate-fade-in">
                        <div className="msg-in px-4 py-3 flex items-center gap-1.5">
                          {[0, 1, 2].map(i => (
                            <span key={i} className="w-2 h-2 bg-muted-foreground rounded-full" style={{ animation: `typing 1.4s ease-in-out ${i * 0.2}s infinite` }} />
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="px-6 py-4 border-t border-white/5 relative">
                    {showEmojiPicker && (
                      <div className="absolute bottom-20 left-6 z-30 glass-strong border border-white/15 rounded-2xl p-3 w-72 animate-scale-in shadow-2xl">
                        <div className="grid grid-cols-10 gap-1">
                          {EMOJIS.map((emoji, i) => (
                            <button key={i} onClick={() => insertEmoji(emoji)}
                              className="w-7 h-7 flex items-center justify-center text-lg rounded-lg hover:bg-white/10 transition-all hover:scale-110">
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {showEmojiPicker && <div className="fixed inset-0 z-20" onClick={() => setShowEmojiPicker(false)} />}
                    <div className="flex items-center gap-3 glass border border-white/10 rounded-2xl px-4 py-2 relative z-10">
                      <button onClick={() => setShowEmojiPicker(v => !v)}
                        className={`transition-colors flex-shrink-0 ${showEmojiPicker ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
                        <Icon name="Smile" size={20} />
                      </button>
                      <button onClick={() => fileInputRef.current?.click()}
                        className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0" title="Прикрепить фото или видео">
                        <Icon name="ImagePlus" size={20} />
                      </button>
                      <input value={message} onChange={e => setMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        placeholder="Написать сообщение..."
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                      <button onClick={sendMessage} disabled={!message.trim()}
                        className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white transition-all disabled:opacity-30 hover:scale-105 neon-purple flex-shrink-0">
                        <Icon name="Send" size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info panel */}
                {showInfoPanel && currentContact && (
                  <div className="w-72 flex-shrink-0 border-l border-white/5 overflow-y-auto animate-slide-in-right glass">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                      <p className="font-golos font-semibold text-sm text-foreground">
                        {currentContact.isGroup ? 'Участники группы' : 'Профиль'}
                      </p>
                      <button onClick={() => setShowInfoPanel(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                        <Icon name="X" size={16} />
                      </button>
                    </div>
                    {currentContact.isGroup ? (
                      <div className="p-4 space-y-4">
                        <div className="flex flex-col items-center gap-3 py-4">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/30 to-cyan-500/20 flex items-center justify-center text-3xl">
                            {currentContact.avatar}
                          </div>
                          <div className="text-center">
                            <p className="font-golos font-bold text-foreground">{currentContact.name}</p>
                            <p className="text-xs text-muted-foreground">{currentContact.members} участников</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {[
                            { emoji: profile.avatar, name: profile.name, role: 'Создатель', status: 'online' },
                            { emoji: '🦁', name: 'Алекс Громов', role: 'Администратор', status: 'online' },
                            { emoji: '🌸', name: 'Маша Светлова', role: 'Участник', status: 'online' },
                            { emoji: '🚀', name: 'Дима Козлов', role: 'Участник', status: 'away' },
                            { emoji: '⭐', name: 'Катя Миронова', role: 'Участник', status: 'offline' },
                          ].map((m, i) => (
                            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                              <div className="relative flex-shrink-0">
                                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-lg">{m.emoji}</div>
                                {m.status === 'online' && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-background" />}
                                {m.status === 'away' && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-background" />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                                <p className="text-xs text-muted-foreground">{m.role}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button className="w-full py-2.5 rounded-xl glass border border-white/10 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2">
                          <Icon name="UserPlus" size={15} />
                          Добавить участника
                        </button>
                        <button onClick={() => deleteChat(currentContact.id)}
                          className="w-full py-2.5 rounded-xl glass border border-red-500/20 text-red-400 text-sm hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2">
                          <Icon name="Trash2" size={14} />
                          Удалить группу
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 space-y-4">
                        <div className="flex flex-col items-center gap-3 py-4">
                          <div className="avatar-ring">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/40 to-cyan-500/30 flex items-center justify-center text-3xl">
                              {currentContact.avatar}
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="font-golos font-bold text-foreground">{currentContact.name}</p>
                            <p className="text-xs flex items-center justify-center gap-1 mt-1">
                              {currentContact.status === 'online'
                                ? <><span className="w-1.5 h-1.5 bg-green-400 rounded-full" /><span className="text-green-400">В сети</span></>
                                : currentContact.status === 'away'
                                ? <><span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" /><span className="text-yellow-400">Не беспокоить</span></>
                                : <span className="text-muted-foreground">Не в сети</span>
                              }
                            </p>
                          </div>
                        </div>
                        <div className="glass rounded-2xl border border-white/8 overflow-hidden divide-y divide-white/5">
                          {[
                            { icon: 'Phone', label: 'Телефон', value: currentContact.phone || '—' },
                            { icon: 'MessageSquare', label: 'Статус', value: '🚀 Всегда на связи' },
                          ].map((f, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3">
                              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Icon name={f.icon} size={14} className="text-primary" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">{f.label}</p>
                                <p className="text-sm text-foreground">{f.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button className="w-full py-2.5 rounded-xl glass border border-red-500/20 text-red-400 text-sm hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2">
                          <Icon name="UserX" size={14} />
                          Заблокировать
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4 animate-fade-in">
                  <div className="text-6xl animate-float">🐻</div>
                  <p className="text-xl font-golos font-bold gradient-text">MishkaChat</p>
                  <p className="text-muted-foreground text-sm">Выбери чат, чтобы начать общение</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="flex-1 overflow-y-auto p-8 animate-fade-in">
          <div className="max-w-lg mx-auto space-y-6">
            <h2 className="text-2xl font-golos font-bold gradient-text">Мой профиль</h2>

            {/* Avatar + name card */}
            <div className="glass-strong rounded-3xl p-8 flex flex-col items-center gap-4 text-center border border-white/10 neon-purple">
              {/* Avatar picker */}
              <div className="relative group/avatar">
                <div className="avatar-ring cursor-pointer hover-lift" onClick={() => startEdit('avatar', profile.avatar)} title="Изменить аватар">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-5xl">
                    {profile.avatar}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:scale-110 transition-all" onClick={() => startEdit('avatar', profile.avatar)}>
                  <Icon name="Pencil" size={12} className="text-white" />
                </div>
              </div>

              {editingField === 'avatar' && (
                <div className="w-full glass border border-white/10 rounded-2xl p-3 animate-scale-in">
                  <p className="text-xs text-muted-foreground mb-2">Выберите аватар</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {AVATAR_OPTIONS.map(em => (
                      <button key={em} onClick={() => { setProfile(p => ({ ...p, avatar: em })); setEditingField(null); }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl transition-all hover:scale-110 ${profile.avatar === em ? 'bg-primary/30 border border-primary/60 scale-110' : 'hover:bg-white/10'}`}>
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                {editingField === 'name' ? (
                  <div className="flex items-center gap-2">
                    <input autoFocus value={editingValue} onChange={e => setEditingValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingField(null); }}
                      className="bg-muted/60 border border-primary/40 rounded-xl px-3 py-1.5 text-lg font-golos font-bold text-foreground text-center focus:outline-none focus:border-primary/80 w-48" />
                    <button onClick={saveEdit} className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center hover:bg-primary/40 transition-colors">
                      <Icon name="Check" size={13} className="text-primary" />
                    </button>
                    <button onClick={() => setEditingField(null)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                      <Icon name="X" size={13} className="text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group/name cursor-pointer" onClick={() => startEdit('name', profile.name)}>
                    <h3 className="text-xl font-golos font-bold text-foreground">{profile.name}</h3>
                    <Icon name="Pencil" size={13} className="text-muted-foreground opacity-0 group-hover/name:opacity-100 transition-opacity" />
                  </div>
                )}

                {/* Tag / username */}
                {editingField === 'username' ? (
                  <div className="flex items-center gap-1.5 mt-1 justify-center">
                    <span className="text-muted-foreground text-sm">@</span>
                    <input autoFocus value={editingValue} onChange={e => setEditingValue(e.target.value.replace(/\s/g, '_').toLowerCase())}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingField(null); }}
                      className="bg-muted/60 border border-primary/40 rounded-lg px-2 py-1 text-sm text-foreground text-center focus:outline-none focus:border-primary/80 w-32" />
                    <button onClick={saveEdit} className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center hover:bg-primary/40 transition-colors">
                      <Icon name="Check" size={11} className="text-primary" />
                    </button>
                    <button onClick={() => setEditingField(null)} className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                      <Icon name="X" size={11} className="text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mt-1 justify-center group/tag cursor-pointer" onClick={() => startEdit('username', profile.username)}>
                    <p className="text-muted-foreground text-sm">@{profile.username}</p>
                    <Icon name="Pencil" size={11} className="text-muted-foreground opacity-0 group-hover/tag:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-online" />
                <span className="text-sm text-green-400">В сети</span>
              </div>

              {/* Real stats */}
              <div className="flex gap-4 text-center mt-2">
                <div>
                  <p className="text-lg font-golos font-bold text-foreground">{contactsCount}</p>
                  <p className="text-xs text-muted-foreground">Контактов</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="text-lg font-golos font-bold text-foreground">{groupsCount}</p>
                  <p className="text-xs text-muted-foreground">Групп</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="text-lg font-golos font-bold text-foreground">{totalMessages}</p>
                  <p className="text-xs text-muted-foreground">Сообщений</p>
                </div>
              </div>
            </div>

            {/* Info fields */}
            <div className="glass rounded-2xl border border-white/8 overflow-hidden divide-y divide-white/5">
              {([
                { label: 'Имя', key: 'name', value: profile.name, icon: 'User' },
                { label: 'Телефон', key: 'phone', value: profile.phone, icon: 'Phone' },
                { label: 'Email', key: 'email', value: profile.email, icon: 'Mail' },
                { label: 'Статус', key: 'status', value: profile.status, icon: 'MessageSquare' },
                { label: 'Дата рождения', key: 'birthday', value: profile.birthday, icon: 'Calendar' },
              ] as const).map((field) => (
                <div key={field.key} className="flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors group">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name={field.icon} size={15} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{field.label}</p>
                      {editingField === field.key ? (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <input autoFocus value={editingValue} onChange={e => setEditingValue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingField(null); }}
                            className="bg-muted/60 border border-primary/40 rounded-lg px-2 py-1 text-sm text-foreground focus:outline-none focus:border-primary/80 w-full" />
                          <button onClick={saveEdit} className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center hover:bg-primary/40 transition-colors flex-shrink-0">
                            <Icon name="Check" size={11} className="text-primary" />
                          </button>
                          <button onClick={() => setEditingField(null)} className="w-6 h-6 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                            <Icon name="X" size={11} className="text-muted-foreground" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-foreground truncate">{field.value}</p>
                      )}
                    </div>
                  </div>
                  {editingField !== field.key && (
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" onClick={() => startEdit(field.key, field.value)}>
                      <Icon name="Pencil" size={14} className="text-muted-foreground hover:text-primary transition-colors" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings tab */}
      {activeTab === 'settings' && (
        <div className="flex-1 overflow-y-auto p-8 animate-fade-in">
          <div className="max-w-lg mx-auto space-y-6">

            {/* Section detail view */}
            {activeSettingsSection ? (
              <>
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveSettingsSection(null)} className="w-9 h-9 rounded-xl glass border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
                    <Icon name="ChevronLeft" size={18} />
                  </button>
                  <h2 className="text-2xl font-golos font-bold gradient-text">{activeSettingsSection}</h2>
                </div>

                {activeSettingsSection === 'Уведомления' && (
                  <div className="glass rounded-2xl border border-white/8 overflow-hidden divide-y divide-white/5">
                    {[
                      { label: 'Звук уведомлений', desc: 'Воспроизводить звук', key: 'soundNotif' as const },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <button onClick={() => setSettings(s => ({ ...s, [item.key]: !s[item.key] }))}
                          className={`w-11 h-6 rounded-full transition-all relative ${settings[item.key] ? 'bg-gradient-to-r from-purple-500 to-cyan-400' : 'bg-muted'}`}>
                          <span className={`absolute top-0.5 transition-all w-5 h-5 bg-white rounded-full shadow ${settings[item.key] ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </div>
                    ))}
                    <div className="px-5 py-4">
                      <p className="text-sm font-medium text-foreground mb-3">Тип уведомлений</p>
                      {['Все сообщения', 'Только упоминания', 'Выключены'].map(opt => (
                        <button key={opt} className="w-full flex items-center justify-between py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <span>{opt}</span>
                          {opt === 'Все сообщения' && <Icon name="Check" size={15} className="text-primary" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeSettingsSection === 'Приватность' && (
                  <div className="glass rounded-2xl border border-white/8 overflow-hidden divide-y divide-white/5">
                    {[
                      { label: 'Показывать время в сети', desc: 'Другие видят когда вы онлайн', key: 'showLastSeen' as const },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <button onClick={() => setSettings(s => ({ ...s, [item.key]: !s[item.key] }))}
                          className={`w-11 h-6 rounded-full transition-all relative ${settings[item.key] ? 'bg-gradient-to-r from-purple-500 to-cyan-400' : 'bg-muted'}`}>
                          <span className={`absolute top-0.5 transition-all w-5 h-5 bg-white rounded-full shadow ${settings[item.key] ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </div>
                    ))}
                    <div className="px-5 py-4">
                      <p className="text-sm font-medium text-foreground mb-1">Кто видит мой профиль</p>
                      <p className="text-xs text-muted-foreground mb-3">Настройте видимость вашей страницы</p>
                      {['Все пользователи', 'Только контакты', 'Никто'].map((opt, i) => (
                        <button key={opt} className="w-full flex items-center justify-between py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <span>{opt}</span>
                          {i === 0 && <Icon name="Check" size={15} className="text-primary" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeSettingsSection === 'Оформление' && (
                  <div className="space-y-4">
                    <div className="glass rounded-2xl border border-white/8 overflow-hidden divide-y divide-white/5">
                      {[
                        { label: 'Тёмная тема', desc: 'Тёмный фон интерфейса', key: 'darkTheme' as const },
                        { label: 'Двойная галочка', desc: 'Показывать прочтение', key: 'doubleCheck' as const },
                        { label: 'Автовоспроизведение GIF', desc: 'В сообщениях', key: 'autoGif' as const },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between px-5 py-4">
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                          <button onClick={() => setSettings(s => ({ ...s, [item.key]: !s[item.key] }))}
                            className={`w-11 h-6 rounded-full transition-all relative ${settings[item.key] ? 'bg-gradient-to-r from-purple-500 to-cyan-400' : 'bg-muted'}`}>
                            <span className={`absolute top-0.5 transition-all w-5 h-5 bg-white rounded-full shadow ${settings[item.key] ? 'left-5' : 'left-0.5'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="glass rounded-2xl border border-white/8 p-5">
                      <p className="text-sm font-medium text-foreground mb-3">Отправка сообщений</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-foreground">Enter для отправки</p>
                          <p className="text-xs text-muted-foreground">Shift+Enter — новая строка</p>
                        </div>
                        <button onClick={() => setSettings(s => ({ ...s, sendOnEnter: !s.sendOnEnter }))}
                          className={`w-11 h-6 rounded-full transition-all relative ${settings.sendOnEnter ? 'bg-gradient-to-r from-purple-500 to-cyan-400' : 'bg-muted'}`}>
                          <span className={`absolute top-0.5 transition-all w-5 h-5 bg-white rounded-full shadow ${settings.sendOnEnter ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsSection === 'Устройства' && (
                  <div className="glass rounded-2xl border border-white/8 overflow-hidden divide-y divide-white/5">
                    {[
                      { name: 'MacBook Pro 16"', browser: 'Safari 17 • текущая сессия', icon: '💻', current: true },
                      { name: 'iPhone 15 Pro', browser: 'MishkaChat iOS • вчера', icon: '📱', current: false },
                    ].map((d, i) => (
                      <div key={i} className="flex items-center justify-between px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{d.icon}</span>
                          <div>
                            <p className="text-sm font-medium text-foreground">{d.name}</p>
                            <p className="text-xs text-muted-foreground">{d.browser}</p>
                          </div>
                        </div>
                        {!d.current && (
                          <button className="text-xs text-red-400 hover:text-red-300 transition-colors">Завершить</button>
                        )}
                        {d.current && <span className="text-xs text-green-400">Активна</span>}
                      </div>
                    ))}
                    <div className="px-5 py-4">
                      <button className="w-full py-2.5 rounded-xl glass border border-red-500/20 text-red-400 text-sm hover:bg-red-500/10 transition-colors">
                        Завершить все другие сессии
                      </button>
                    </div>
                  </div>
                )}

                {activeSettingsSection === 'Данные и хранилище' && (
                  <div className="space-y-4">
                    <div className="glass rounded-2xl border border-white/8 p-5 space-y-3">
                      <p className="text-sm font-medium text-foreground">Использование памяти</p>
                      <div className="space-y-2">
                        {[
                          { label: 'Медиафайлы', size: '89 МБ', pct: 70 },
                          { label: 'Кэш приложения', size: '24 МБ', pct: 18 },
                          { label: 'Голосовые', size: '15 МБ', pct: 12 },
                        ].map(item => (
                          <div key={item.label}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">{item.label}</span>
                              <span className="text-foreground">{item.size}</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" style={{ width: `${item.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button className="w-full py-3 rounded-2xl glass border border-white/10 text-sm text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2">
                      <Icon name="Trash2" size={15} />
                      Очистить кэш (24 МБ)
                    </button>
                  </div>
                )}

                {activeSettingsSection === 'Помощь' && (
                  <div className="glass rounded-2xl border border-white/8 overflow-hidden divide-y divide-white/5">
                    {['Часто задаваемые вопросы', 'Написать в поддержку', 'Политика конфиденциальности', 'Условия использования', 'О приложении'].map((item, i) => (
                      <button key={i} className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-all text-left group">
                        <span className="text-sm text-foreground">{item}</span>
                        <Icon name="ChevronRight" size={15} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-2xl font-golos font-bold gradient-text">Настройки</h2>

                {/* App info */}
                <div className="glass-strong rounded-3xl p-6 flex items-center gap-4 border border-primary/20 neon-purple">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-3xl animate-float">
                    🐻
                  </div>
                  <div>
                    <p className="font-golos font-bold text-foreground text-lg">MishkaChat</p>
                    <p className="text-muted-foreground text-sm">Версия 1.0.0 • Последнее обновление сегодня</p>
                  </div>
                </div>

                {/* Settings list */}
                <div className="glass rounded-2xl border border-white/8 overflow-hidden divide-y divide-white/5">
                  {[
                    { icon: 'Bell', label: 'Уведомления', desc: 'Звук, вибрация, баннеры' },
                    { icon: 'Shield', label: 'Приватность', desc: 'Кто видит мой профиль' },
                    { icon: 'Palette', label: 'Оформление', desc: 'Тема, цвета, шрифт' },
                    { icon: 'Smartphone', label: 'Устройства', desc: '2 активных сессии' },
                    { icon: 'Database', label: 'Данные и хранилище', desc: 'Кэш: 128 МБ' },
                    { icon: 'HelpCircle', label: 'Помощь', desc: 'FAQ и поддержка' },
                  ].map((section, i) => (
                    <button key={i} onClick={() => setActiveSettingsSection(section.label)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-all group text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
                          <Icon name={section.icon} size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{section.label}</p>
                          <p className="text-xs text-muted-foreground">{section.desc}</p>
                        </div>
                      </div>
                      <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                  ))}
                  <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-all group text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-red-500/10 flex items-center justify-center">
                        <Icon name="LogOut" size={18} className="text-red-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-red-400">Выйти</p>
                        <p className="text-xs text-muted-foreground">Завершить сессию</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Toggles */}
                <div className="glass rounded-2xl border border-white/8 overflow-hidden divide-y divide-white/5">
                  {([
                    { label: 'Тёмная тема', desc: settings.darkTheme ? 'Включена' : 'Выключена', icon: 'Moon', key: 'darkTheme' as const },
                    { label: 'Двойная галочка', desc: 'Показывать прочтение', icon: 'CheckCheck', key: 'doubleCheck' as const },
                    { label: 'Автовоспроизведение GIF', desc: 'В сообщениях', icon: 'Play', key: 'autoGif' as const },
                  ]).map((item) => (
                    <div key={item.key} className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <Icon name={item.icon} size={17} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <button onClick={() => setSettings(s => ({ ...s, [item.key]: !s[item.key] }))}
                        className={`w-11 h-6 rounded-full transition-all relative ${settings[item.key] ? 'bg-gradient-to-r from-purple-500 to-cyan-400' : 'bg-muted'}`}>
                        <span className={`absolute top-0.5 transition-all w-5 h-5 bg-white rounded-full shadow ${settings[item.key] ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
