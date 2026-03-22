import { useState } from "react";
import { mockContacts, Contact } from "@/data/mockData";
import { User } from "@/pages/Index";
import Icon from "@/components/ui/icon";

type Props = {
  currentUser: User;
  onChat: (contact: Contact) => void;
};

const ContactsScreen = ({ onChat }: Props) => {
  const [search, setSearch] = useState("");

  const filtered = mockContacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, Contact[]>>((acc, c) => {
    const letter = c.name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(c);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-4 py-3 border-b border-nm-border/20">
        <div className="flex items-center gap-2 bg-nm-surface rounded-2xl px-3 py-2.5">
          <Icon name="Search" size={16} className="text-nm-muted flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск контактов..."
            className="flex-1 bg-transparent text-white text-sm placeholder:text-nm-muted focus:outline-none"
          />
        </div>
      </div>

      {/* Online count */}
      <div className="px-4 py-2 border-b border-nm-border/10">
        <p className="text-nm-muted text-xs">
          Онлайн: <span className="text-green-400 font-medium">{mockContacts.filter(c => c.online).length}</span> из {mockContacts.length}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {letters.map(letter => (
          <div key={letter}>
            <div className="px-4 py-1.5 bg-nm-bg/80 sticky top-0">
              <span className="text-nm-accent text-xs font-bold">{letter}</span>
            </div>
            {grouped[letter].map(contact => (
              <div
                key={contact.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-nm-surface/40 transition-colors border-b border-nm-border/10"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-nm-surface flex items-center justify-center text-2xl border border-nm-border/30">
                    {contact.avatar}
                  </div>
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-nm-bg" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold">{contact.name}</p>
                  <p className="text-nm-muted text-xs truncate">
                    {contact.online ? (
                      <span className="text-green-400">онлайн</span>
                    ) : (
                      contact.bio || `@${contact.username}`
                    )}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onChat(contact)}
                    className="w-8 h-8 rounded-full bg-nm-accent/20 flex items-center justify-center text-nm-accent transition-all hover:bg-nm-accent hover:text-white"
                  >
                    <Icon name="MessageCircle" size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactsScreen;
