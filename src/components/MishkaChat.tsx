import { useState } from 'react';
import Icon from '@/components/ui/icon';

const CONTACTS = [
  { id: 1, name: 'Алекс Громов', avatar: '🦁', status: 'online', lastMsg: 'Окей, созвонимся в 8!', time: '14:32', unread: 2, isGroup: false },
  { id: 2, name: 'Команда Дизайн', avatar: '🎨', status: 'online', lastMsg: 'Новые макеты готовы 🔥', time: '13:15', unread: 5, isGroup: true, members: 8 },
  { id: 3, name: 'Маша Светлова', avatar: '🌸', status: 'online', lastMsg: 'Ты видел этот фильм?', time: '12:40', unread: 0, isGroup: false },
  { id: 4, name: 'Игровой Клан', avatar: '🎮', status: 'online', lastMsg: 'Рейд в 21:00, все готовы?', time: '11:55', unread: 12, isGroup: true, members: 24 },
  { id: 5, name: 'Дима Козлов', avatar: '🚀', status: 'away', lastMsg: 'Буду через час', time: '10:20', unread: 0, isGroup: false },
  { id: 6, name: 'Семья', avatar: '🏠', status: 'online', lastMsg: 'Мама: Ужин в 19:00!', time: 'вчера', unread: 3, isGroup: true, members: 5 },
  { id: 7, name: 'Катя Миронова', avatar: '⭐', status: 'offline', lastMsg: 'Спасибо за помощь!', time: 'вчера', unread: 0, isGroup: false },
];

const MESSAGES: Record<number, Array<{id: number; text: string; out: boolean; time: string; type?: string; fileName?: string; fileSize?: string}>> = {
  1: [
    { id: 1, text: 'Привет! Как дела?', out: false, time: '14:10' },
    { id: 2, text: 'Всё отлично! Работаю над новым проектом 🚀', out: true, time: '14:12' },
    { id: 3, text: 'О круто! Расскажи подробнее', out: false, time: '14:15' },
    { id: 4, text: 'Делаю мессенджер на React, выглядит огонь!', out: true, time: '14:20' },
    { id: 5, text: 'Окей, созвонимся в 8!', out: false, time: '14:32' },
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

const SETTINGS_SECTIONS = [
  { icon: 'Bell', label: 'Уведомления', desc: 'Звук, вибрация, баннеры' },
  { icon: 'Shield', label: 'Приватность', desc: 'Кто видит мой профиль' },
  { icon: 'Palette', label: 'Оформление', desc: 'Тема, цвета, шрифт' },
  { icon: 'Smartphone', label: 'Устройства', desc: '2 активных сессии' },
  { icon: 'Database', label: 'Данные и хранилище', desc: 'Кэш: 128 МБ' },
  { icon: 'HelpCircle', label: 'Помощь', desc: 'FAQ и поддержка' },
  { icon: 'LogOut', label: 'Выйти', desc: 'Завершить сессию' },
];

export default function MishkaChat() {
  const [activeTab, setActiveTab] = useState<'chats' | 'profile' | 'settings'>('chats');
  const [activeChat, setActiveChat] = useState<number | null>(1);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(MESSAGES);
  const [videoCall, setVideoCall] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const EMOJIS = [
    '😀','😂','🥹','😍','🥰','😎','🤩','😏','😢','😭','😤','😡','🤯','🥳','😴',
    '👍','👎','❤️','🔥','⭐','💯','🎉','🙏','👏','✌️','🤝','💪','🫶','🤘','👀',
    '🚀','💡','🎮','🎨','🎵','🍕','☕','🌟','💎','🏆','🌈','⚡','💥','🎯','🛸',
    '😻','🐻','🦁','🐯','🦊','🐺','🐸','🐧','🦄','🐉','🍀','🌸','🌊','🌙','☀️',
  ];

  const insertEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const currentContact = CONTACTS.find(c => c.id === activeChat);
  const currentMessages = activeChat ? (messages[activeChat] || []) : [];

  const filteredContacts = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sendMessage = () => {
    if (!message.trim() || !activeChat) return;
    const newMsg = { id: Date.now(), text: message.trim(), out: true, time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), newMsg] }));
    setMessage('');
  };

  const tabs = [
    { id: 'chats', icon: 'MessageCircle', label: 'Чаты' },
    { id: 'profile', icon: 'User', label: 'Профиль' },
    { id: 'settings', icon: 'Settings', label: 'Настройки' },
  ] as const;

  return (
    <div className="flex h-screen w-full overflow-hidden mesh-bg font-rubik">

      {/* Video Call Overlay */}
      {videoCall && currentContact && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-scale-in">
          <div className="flex-1 relative bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
            {/* Remote video placeholder */}
            <div className="flex flex-col items-center gap-4 animate-fade-in">
              <div className="avatar-ring animate-pulse-glow">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-6xl">
                  {currentContact.avatar}
                </div>
              </div>
              <p className="text-white text-2xl font-golos font-bold">{currentContact.name}</p>
              <p className="text-white/60 text-sm">Видеозвонок • 02:34</p>
            </div>

            {/* Self preview */}
            <div className="absolute bottom-6 right-6 w-32 h-48 rounded-2xl glass-strong border border-white/20 overflow-hidden flex items-center justify-center">
              <div className="text-4xl">🙂</div>
            </div>

            {/* Mesh overlays */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          </div>

          {/* Call controls */}
          <div className="flex items-center justify-center gap-6 py-8 bg-black/80 backdrop-blur-xl">
            <button className="w-14 h-14 rounded-full glass border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all">
              <Icon name="Mic" size={22} />
            </button>
            <button className="w-14 h-14 rounded-full glass border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all">
              <Icon name="Video" size={22} />
            </button>
            <button onClick={() => setVideoCall(false)} className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-all neon-cyan hover:scale-105">
              <Icon name="PhoneOff" size={24} />
            </button>
            <button className="w-14 h-14 rounded-full glass border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all">
              <Icon name="Monitor" size={22} />
            </button>
            <button className="w-14 h-14 rounded-full glass border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all">
              <Icon name="Users" size={22} />
            </button>
          </div>
        </div>
      )}

      {/* Left sidebar — nav */}
      <div className="flex flex-col w-16 md:w-20 border-r border-white/5 py-6 items-center gap-3 glass" style={{ minWidth: '64px' }}>
        <div className="mb-4 animate-float">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-xl neon-purple">
            🐻
          </div>
        </div>

        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ animationDelay: `${i * 0.08}s` }}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 animate-fade-in hover-lift ${
              activeTab === tab.id
                ? 'nav-active neon-purple'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
            title={tab.label}
          >
            <Icon name={tab.icon} size={20} />
          </button>
        ))}

        <div className="flex-1" />

        <div className="avatar-ring cursor-pointer hover-lift">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg">
            😎
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-w-0 overflow-hidden">

        {/* Chats panel */}
        {activeTab === 'chats' && (
          <>
            {/* Contacts list */}
            <div className="flex flex-col w-72 lg:w-80 border-r border-white/5 overflow-hidden flex-shrink-0">
              {/* Header */}
              <div className="px-4 pt-6 pb-3 space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-golos font-bold gradient-text">Сообщения</h1>
                  <button className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-all">
                    <Icon name="Plus" size={16} />
                  </button>
                </div>
                {/* Search */}
                <div className="relative">
                  <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Поиск..."
                    className="w-full bg-muted/60 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:bg-muted transition-all"
                  />
                </div>
              </div>

              {/* Contacts */}
              <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
                {filteredContacts.map((contact, i) => (
                  <button
                    key={contact.id}
                    onClick={() => setActiveChat(contact.id)}
                    style={{ animationDelay: `${i * 0.05}s` }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 animate-fade-in text-left hover:bg-white/5 ${
                      activeChat === contact.id ? 'bg-primary/10 border border-primary/20' : ''
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl ${
                        activeChat === contact.id ? 'bg-gradient-to-br from-purple-500/30 to-cyan-500/20' : 'bg-muted'
                      }`}>
                        {contact.avatar}
                      </div>
                      {contact.status === 'online' && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-background animate-online" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-foreground flex items-center gap-1">
                          {contact.name}
                          {contact.isGroup && <Icon name="Users" size={11} className="text-muted-foreground" />}
                        </span>
                        <span className="text-xs text-muted-foreground">{contact.time}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-muted-foreground truncate">{contact.lastMsg}</p>
                        {contact.unread > 0 && (
                          <span className="flex-shrink-0 ml-2 min-w-5 h-5 rounded-full bg-primary flex items-center justify-center text-xs text-white font-bold px-1">
                            {contact.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat window */}
            <div className="flex flex-col flex-1 min-w-0">
              {activeChat && currentContact ? (
                <>
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
                      <div>
                        <p className="font-golos font-semibold text-foreground">{currentContact.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          {currentContact.status === 'online' ? (
                            <><span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" /> в сети</>
                          ) : currentContact.status === 'away' ? (
                            <><span className="w-1.5 h-1.5 bg-yellow-400 rounded-full inline-block" /> не беспокоить</>
                          ) : (
                            'не в сети'
                          )}
                          {currentContact.isGroup && ` • ${currentContact.members} участников`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setVideoCall(true)}
                        className="w-9 h-9 rounded-xl glass border border-primary/30 flex items-center justify-center text-primary hover:neon-purple transition-all hover:bg-primary/10"
                        title="Видеозвонок"
                      >
                        <Icon name="Video" size={17} />
                      </button>
                      <button className="w-9 h-9 rounded-xl glass border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:bg-white/5">
                        <Icon name="Phone" size={17} />
                      </button>
                      <button className="w-9 h-9 rounded-xl glass border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:bg-white/5">
                        <Icon name="Search" size={17} />
                      </button>
                      <button className="w-9 h-9 rounded-xl glass border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:bg-white/5">
                        <Icon name="MoreVertical" size={17} />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                    {currentMessages.map((msg, i) => (
                      <div
                        key={msg.id}
                        style={{ animationDelay: `${i * 0.04}s` }}
                        className={`flex animate-fade-in ${msg.out ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.type === 'file' ? (
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
                            <p className={`text-sm leading-relaxed ${msg.out ? 'text-white' : 'text-foreground'}`}>{msg.text}</p>
                            <p className={`text-xs mt-1 text-right ${msg.out ? 'text-white/60' : 'text-muted-foreground'}`}>{msg.time}</p>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Typing indicator */}
                    {currentContact.status === 'online' && (
                      <div className="flex justify-start animate-fade-in">
                        <div className="msg-in px-4 py-3 flex items-center gap-1.5">
                          {[0, 1, 2].map(i => (
                            <span key={i} className="w-2 h-2 bg-muted-foreground rounded-full" style={{ animation: `typing 1.4s ease-in-out ${i * 0.2}s infinite` }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="px-6 py-4 border-t border-white/5 relative">
                    {/* Emoji picker */}
                    {showEmojiPicker && (
                      <div className="absolute bottom-20 left-6 z-30 glass-strong border border-white/15 rounded-2xl p-3 w-72 animate-scale-in shadow-2xl">
                        <div className="grid grid-cols-10 gap-1">
                          {EMOJIS.map((emoji, i) => (
                            <button
                              key={i}
                              onClick={() => insertEmoji(emoji)}
                              className="w-7 h-7 flex items-center justify-center text-lg rounded-lg hover:bg-white/10 transition-all hover:scale-110"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {showEmojiPicker && (
                      <div className="fixed inset-0 z-20" onClick={() => setShowEmojiPicker(false)} />
                    )}
                    <div className="flex items-center gap-3 glass border border-white/10 rounded-2xl px-4 py-2 relative z-10">
                      <button
                        onClick={() => setShowEmojiPicker(v => !v)}
                        className={`transition-colors flex-shrink-0 ${showEmojiPicker ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                      >
                        <Icon name="Smile" size={20} />
                      </button>
                      <button className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
                        <Icon name="Paperclip" size={20} />
                      </button>
                      <input
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        placeholder="Написать сообщение..."
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!message.trim()}
                        className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white transition-all disabled:opacity-30 hover:scale-105 neon-purple flex-shrink-0"
                      >
                        <Icon name="Send" size={15} />
                      </button>
                    </div>
                  </div>
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

              {/* Avatar section */}
              <div className="glass-strong rounded-3xl p-8 flex flex-col items-center gap-4 text-center border border-white/10 neon-purple">
                <div className="avatar-ring cursor-pointer hover-lift" title="Изменить фото">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-5xl">
                    😎
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-golos font-bold text-foreground">Иван Петров</h3>
                  <p className="text-muted-foreground text-sm mt-1">@ivan_petrov</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-online" />
                  <span className="text-sm text-green-400">В сети</span>
                </div>
                <div className="flex gap-4 text-center mt-2">
                  <div>
                    <p className="text-lg font-golos font-bold text-foreground">247</p>
                    <p className="text-xs text-muted-foreground">Контактов</p>
                  </div>
                  <div className="w-px bg-border" />
                  <div>
                    <p className="text-lg font-golos font-bold text-foreground">12</p>
                    <p className="text-xs text-muted-foreground">Групп</p>
                  </div>
                  <div className="w-px bg-border" />
                  <div>
                    <p className="text-lg font-golos font-bold text-foreground">4.8К</p>
                    <p className="text-xs text-muted-foreground">Сообщений</p>
                  </div>
                </div>
              </div>

              {/* Info fields */}
              <div className="glass rounded-2xl border border-white/8 overflow-hidden divide-y divide-white/5">
                {[
                  { label: 'Имя', value: 'Иван Петров', icon: 'User' },
                  { label: 'Телефон', value: '+7 (999) 123-45-67', icon: 'Phone' },
                  { label: 'Email', value: 'ivan@example.com', icon: 'Mail' },
                  { label: 'Статус', value: '🚀 Запускаю ракеты', icon: 'MessageSquare' },
                  { label: 'Дата рождения', value: '15 мая 1995', icon: 'Calendar' },
                ].map((field, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon name={field.icon} size={15} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{field.label}</p>
                        <p className="text-sm font-medium text-foreground">{field.value}</p>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icon name="Pencil" size={14} className="text-muted-foreground hover:text-primary transition-colors" />
                    </button>
                  </div>
                ))}
              </div>

              <button className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold hover:opacity-90 transition-all hover-lift neon-purple">
                Редактировать профиль
              </button>
            </div>
          </div>
        )}

        {/* Settings tab */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-8 animate-fade-in">
            <div className="max-w-lg mx-auto space-y-6">
              <h2 className="text-2xl font-golos font-bold gradient-text">Настройки</h2>

              {/* App info card */}
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
                {SETTINGS_SECTIONS.map((section, i) => (
                  <button
                    key={i}
                    className={`w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-all group text-left ${
                      section.label === 'Выйти' ? 'text-red-400' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                        section.label === 'Выйти'
                          ? 'bg-red-500/10'
                          : 'bg-primary/10 group-hover:bg-primary/20'
                      } transition-colors`}>
                        <Icon
                          name={section.icon}
                          size={18}
                          className={section.label === 'Выйти' ? 'text-red-400' : 'text-primary'}
                        />
                      </div>
                      <div>
                        <p className={`font-medium text-sm ${section.label === 'Выйти' ? 'text-red-400' : 'text-foreground'}`}>
                          {section.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{section.desc}</p>
                      </div>
                    </div>
                    {section.label !== 'Выйти' && (
                      <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                    )}
                  </button>
                ))}
              </div>

              {/* Toggle switches */}
              <div className="glass rounded-2xl border border-white/8 overflow-hidden divide-y divide-white/5">
                {[
                  { label: 'Тёмная тема', desc: 'Включена', icon: 'Moon', on: true },
                  { label: 'Двойная галочка', desc: 'Показывать прочтение', icon: 'CheckCheck', on: true },
                  { label: 'Автовоспроизведение GIF', desc: 'В сообщениях', icon: 'Play', on: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Icon name={item.icon} size={17} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <button className={`w-11 h-6 rounded-full transition-all relative ${item.on ? 'bg-gradient-to-r from-purple-500 to-cyan-400' : 'bg-muted'}`}>
                      <span className={`absolute top-0.5 transition-all w-5 h-5 bg-white rounded-full shadow ${item.on ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}