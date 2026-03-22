import { useState } from "react";
import { User } from "@/pages/Index";
import { AVATARS } from "@/data/mockData";
import Icon from "@/components/ui/icon";

type Props = {
  user: User;
  onLogout: () => void;
};

type Section = { icon: string; label: string; desc?: string; danger?: boolean };

const sections: Section[] = [
  { icon: "Bell", label: "Уведомления", desc: "Звуки, вибрация" },
  { icon: "Shield", label: "Конфиденциальность", desc: "Блокировки, безопасность" },
  { icon: "Palette", label: "Оформление", desc: "Тема, шрифты" },
  { icon: "HelpCircle", label: "Помощь", desc: "FAQ, поддержка" },
  { icon: "Info", label: "О приложении", desc: "Не MAX v1.0" },
];

const ProfileScreen = ({ user, onLogout }: Props) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [avatar, setAvatar] = useState(user.avatar);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Profile card */}
      <div className="relative flex flex-col items-center pt-8 pb-6 px-4 bg-gradient-to-b from-nm-accent/10 to-transparent">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-nm-accent/5 to-transparent pointer-events-none" />

        {/* Avatar */}
        <button
          onClick={() => setShowAvatarPicker(!showAvatarPicker)}
          className="relative w-24 h-24 rounded-full bg-nm-surface border-2 border-nm-accent/50 flex items-center justify-center text-5xl mb-3 hover:border-nm-accent transition-colors"
        >
          {avatar}
          <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-nm-accent flex items-center justify-center">
            <Icon name="Camera" size={14} className="text-white" />
          </div>
        </button>

        {/* Avatar picker */}
        {showAvatarPicker && (
          <div className="flex flex-wrap gap-2 justify-center mb-4 bg-nm-surface rounded-2xl p-3 border border-nm-border/30 animate-fade-in">
            {AVATARS.map(av => (
              <button
                key={av}
                onClick={() => { setAvatar(av); setShowAvatarPicker(false); }}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${av === avatar ? "bg-nm-accent scale-110" : "hover:bg-nm-border"}`}
              >
                {av}
              </button>
            ))}
          </div>
        )}

        {editing ? (
          <div className="w-full space-y-2 px-4">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-nm-surface border border-nm-border rounded-xl px-3 py-2 text-white text-center font-semibold focus:outline-none focus:border-nm-accent"
            />
            <input
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="О себе..."
              className="w-full bg-nm-surface border border-nm-border rounded-xl px-3 py-2 text-nm-muted text-center text-sm focus:outline-none focus:border-nm-accent"
            />
            <button
              onClick={() => setEditing(false)}
              className="w-full bg-nm-accent text-white rounded-xl py-2 text-sm font-semibold"
            >
              Сохранить
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-white text-xl font-bold">{name}</h2>
            {bio && <p className="text-nm-muted text-sm mt-1 text-center">{bio}</p>}
            <p className="text-nm-accent text-sm mt-1">@{user.username}</p>
            <p className="text-nm-muted text-xs mt-0.5">{user.phone}</p>
            <button
              onClick={() => setEditing(true)}
              className="mt-3 flex items-center gap-1.5 text-nm-accent text-sm border border-nm-accent/30 rounded-xl px-4 py-1.5 hover:bg-nm-accent/10 transition-colors"
            >
              <Icon name="Pencil" size={14} />
              Редактировать
            </button>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-px bg-nm-border/20 mx-4 rounded-2xl overflow-hidden mb-4">
        {[
          { label: "Контакты", value: "8" },
          { label: "Группы", value: "2" },
          { label: "Каналы", value: "2" },
        ].map(stat => (
          <div key={stat.label} className="bg-nm-surface flex flex-col items-center py-3">
            <span className="text-white font-bold text-lg">{stat.value}</span>
            <span className="text-nm-muted text-xs">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Settings */}
      <div className="px-4 space-y-1 mb-4">
        {sections.map(s => (
          <button
            key={s.label}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-nm-surface rounded-xl hover:bg-nm-surface/80 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-nm-accent/20 flex items-center justify-center flex-shrink-0">
              <Icon name={s.icon} size={16} className="text-nm-accent" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-medium">{s.label}</p>
              {s.desc && <p className="text-nm-muted text-xs">{s.desc}</p>}
            </div>
            <Icon name="ChevronRight" size={16} className="text-nm-muted" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="px-4 pb-8">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-500/10 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors font-medium text-sm"
        >
          <Icon name="LogOut" size={16} />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;
