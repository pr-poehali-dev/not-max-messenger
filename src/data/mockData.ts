export type Message = {
  id: string;
  senderId: string;
  text: string;
  time: string;
  read: boolean;
};

export type Chat = {
  id: string;
  type: "chat" | "group" | "channel";
  name: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online?: boolean;
  members?: number;
  subscribers?: number;
  messages: Message[];
  description?: string;
  username?: string;
};

export type Contact = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  phone: string;
  online: boolean;
  bio?: string;
};

export const AVATARS = [
  "🦁", "🐯", "🐺", "🦊", "🐻", "🐼", "🦝", "🐸",
  "🦋", "🦄", "🐲", "🦅", "🦉", "🐬", "🦈", "🐙"
];

export const mockContacts: Contact[] = [
  { id: "u1", name: "Алексей Петров", username: "alex_p", avatar: "🦁", phone: "+7 999 111 22 33", online: true, bio: "Разработчик, люблю кофе ☕" },
  { id: "u2", name: "Мария Иванова", username: "masha_iv", avatar: "🦋", phone: "+7 999 222 33 44", online: false, bio: "Дизайнер интерфейсов" },
  { id: "u3", name: "Дмитрий Сидоров", username: "dima_s", avatar: "🐯", phone: "+7 999 333 44 55", online: true, bio: "Предприниматель" },
  { id: "u4", name: "Анна Козлова", username: "anya_k", avatar: "🌸", phone: "+7 999 444 55 66", online: false, bio: "Маркетолог" },
  { id: "u5", name: "Сергей Новиков", username: "sergey_n", avatar: "🐺", phone: "+7 999 555 66 77", online: true, bio: "Трейдер" },
  { id: "u6", name: "Екатерина Морозова", username: "katya_m", avatar: "🌺", phone: "+7 999 666 77 88", online: false, bio: "Врач" },
  { id: "u7", name: "Николай Лебедев", username: "kolya_l", avatar: "🦊", phone: "+7 999 777 88 99", online: true, bio: "Архитектор" },
  { id: "u8", name: "Ольга Смирнова", username: "olga_s", avatar: "🦄", phone: "+7 999 888 99 00", online: false, bio: "Учитель" },
];

export const mockChats: Chat[] = [
  {
    id: "c1", type: "chat", name: "Алексей Петров", avatar: "🦁",
    lastMessage: "Окей, договорились на завтра!", lastTime: "14:32", unread: 2, online: true,
    messages: [
      { id: "m1", senderId: "u1", text: "Привет! Как дела?", time: "14:20", read: true },
      { id: "m2", senderId: "me", text: "Отлично! Работаю над новым проектом", time: "14:25", read: true },
      { id: "m3", senderId: "u1", text: "Окей, договорились на завтра!", time: "14:32", read: false },
    ]
  },
  {
    id: "c2", type: "chat", name: "Мария Иванова", avatar: "🦋",
    lastMessage: "Посмотри макеты, я отправила", lastTime: "12:15", unread: 0, online: false,
    messages: [
      { id: "m4", senderId: "u2", text: "Юра, посмотри макеты, я отправила", time: "12:15", read: true },
      { id: "m5", senderId: "me", text: "Сейчас посмотрю 👍", time: "12:17", read: true },
    ]
  },
  {
    id: "g1", type: "group", name: "Команда разработки", avatar: "💻",
    lastMessage: "Дмитрий: Деплой прошёл успешно!", lastTime: "11:48", unread: 5, members: 12,
    description: "Основная группа команды разработчиков",
    messages: [
      { id: "m6", senderId: "u3", text: "Всем привет! Начинаем митинг?", time: "11:30", read: true },
      { id: "m7", senderId: "u1", text: "Готов!", time: "11:31", read: true },
      { id: "m8", senderId: "me", text: "Да, погнали", time: "11:32", read: true },
      { id: "m9", senderId: "u3", text: "Деплой прошёл успешно!", time: "11:48", read: false },
    ]
  },
  {
    id: "g2", type: "group", name: "Семья ❤️", avatar: "👨‍👩‍👧‍👦",
    lastMessage: "Мама: Приходи на ужин!", lastTime: "вчера", unread: 3, members: 5,
    description: "Наша семейная группа",
    messages: [
      { id: "m10", senderId: "u4", text: "Приходи на ужин!", time: "18:00", read: false },
    ]
  },
  {
    id: "ch1", type: "channel", name: "Не MAX Новости", avatar: "📢",
    lastMessage: "Обновление 2.0 уже доступно!", lastTime: "09:00", unread: 1, subscribers: 15420,
    description: "Официальный канал мессенджера Не MAX",
    username: "nemax_news",
    messages: [
      { id: "m11", senderId: "channel", text: "🎉 Обновление 2.0 уже доступно! Новые функции: каналы, группы, улучшенный поиск.", time: "09:00", read: false },
    ]
  },
  {
    id: "ch2", type: "channel", name: "Tech Digest", avatar: "⚡",
    lastMessage: "Apple анонсировала новый чип", lastTime: "08:30", unread: 7, subscribers: 89340,
    description: "Самые свежие новости мира технологий",
    username: "tech_digest",
    messages: [
      { id: "m12", senderId: "channel", text: "Apple анонсировала новый чип M4 Ultra с рекордной производительностью", time: "08:30", read: false },
    ]
  },
];
