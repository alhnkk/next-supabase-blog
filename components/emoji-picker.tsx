"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Smile, Search } from "lucide-react";

const EMOJI_CATEGORIES = {
  smileys: {
    name: "Yüzler",
    emojis: [
      "😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊",
      "😋", "😎", "😍", "😘", "🥰", "😗", "😙", "😚", "🙂", "🤗",
      "🤔", "😐", "😑", "😶", "🙄", "😏", "😣", "😥", "😮", "🤐",
      "😯", "😪", "😫", "🥱", "😴", "😌", "😛", "😜", "😝", "🤤",
      "😒", "😓", "😔", "😕", "🙃", "🤑", "😲", "🙁", "😖", "😞",
      "😟", "😤", "😢", "😭", "😦", "😧", "😨", "😩", "🤯", "😬",
      "😰", "😱", "🥵", "🥶", "😳", "🤪", "😵", "🥴", "😠", "😡"
    ]
  },
  hearts: {
    name: "Kalpler",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️",
      "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐"
    ]
  },
  gestures: {
    name: "El İşaretleri",
    emojis: [
      "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉",
      "👆", "🖕", "👇", "☝️", "👋", "🤚", "🖐️", "✋", "🖖", "👏",
      "🙌", "🤲", "🤝", "🙏", "✍️", "💪", "🦾", "🦿", "🦵", "🦶"
    ]
  },
  animals: {
    name: "Hayvanlar",
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
      "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒",
      "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇"
    ]
  },
  food: {
    name: "Yemek",
    emojis: [
      "🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒",
      "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬",
      "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠"
    ]
  },
  activities: {
    name: "Aktiviteler",
    emojis: [
      "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱",
      "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳",
      "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛷", "⛸️"
    ]
  },
  travel: {
    name: "Seyahat",
    emojis: [
      "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐",
      "🛻", "🚚", "🚛", "🚜", "🏍️", "🛴", "🚲", "🛵", "🏺", "🚁",
      "🛸", "🚀", "✈️", "🛫", "🛬", "🪂", "💺", "🛶", "⛵", "🚤"
    ]
  }
};

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  trigger?: React.ReactNode;
}

export function EmojiPicker({ onEmojiSelect, trigger }: EmojiPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState("recent");
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentEmojis, setRecentEmojis] = useState<string[]>([
    "😀", "👍", "❤️", "😂", "🔥", "✨", "💯", "🎉"
  ]);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    
    // Add to recent emojis (keep only last 16)
    setRecentEmojis(prev => {
      const filtered = prev.filter(e => e !== emoji);
      return [emoji, ...filtered].slice(0, 16);
    });
    
    setOpen(false);
    setSearchQuery(""); // Clear search when closing
  };

  // Filter emojis based on search query
  const filteredEmojis = useMemo(() => {
    if (!searchQuery.trim()) {
      if (selectedCategory === "recent") {
        return recentEmojis;
      }
      return EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES].emojis;
    }

    // Simple search - could be enhanced with emoji names/keywords
    const allEmojis = Object.values(EMOJI_CATEGORIES).flatMap(cat => cat.emojis);
    return allEmojis;
  }, [selectedCategory, searchQuery, recentEmojis]);

  const allCategories = {
    recent: { name: "Son Kullanılan", emojis: recentEmojis },
    ...EMOJI_CATEGORIES
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Smile className="w-4 h-4" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="flex flex-col h-96">
          {/* Search Bar */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Emoji ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
          </div>

          {/* Category Tabs - Hide when searching */}
          {!searchQuery.trim() && (
            <div className="flex border-b p-2 space-x-1 overflow-x-auto">
              {Object.entries(allCategories).map(([key, category]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "ghost"}
                  size="sm"
                  className="flex-shrink-0 text-xs px-2 py-1 h-8"
                  onClick={() => setSelectedCategory(key)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}

          {/* Emoji Grid */}
          <div className="flex-1 p-3 overflow-y-auto">
            {filteredEmojis.length > 0 ? (
              <div className="grid grid-cols-8 gap-1">
                {filteredEmojis.map((emoji, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="h-8 w-8 p-0 text-lg hover:bg-muted hover:scale-110 transition-transform"
                    onClick={() => handleEmojiClick(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Smile className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Emoji bulunamadı</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-2 text-xs text-muted-foreground text-center">
            {searchQuery.trim() ? `${filteredEmojis.length} emoji bulundu` : "Emoji seçmek için tıklayın"}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
