import { useState } from "react";

const CHAR_LIMIT = 300;

export const useMessageCollapse = () => {
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());

  const toggleMessageExpansion = (index: number) => {
    const newExpandedMessages = new Set(expandedMessages);
    if (expandedMessages.has(index)) {
      newExpandedMessages.delete(index);
    } else {
      newExpandedMessages.add(index);
    }
    setExpandedMessages(newExpandedMessages);
  };

  const isMessageExpanded = (index: number) => expandedMessages.has(index);

  const shouldShowExpandButton = (content: string, role: string) => {
    return role === 'user' && content.length > CHAR_LIMIT;
  };

  const getDisplayContent = (content: string, index: number, role: string) => {
    if (role === 'assistant' || !shouldShowExpandButton(content, role) || isMessageExpanded(index)) {
      return content;
    }
    return content.slice(0, CHAR_LIMIT) + "...";
  };

  return {
    isMessageExpanded,
    shouldShowExpandButton,
    getDisplayContent,
    toggleMessageExpansion,
  };
};
