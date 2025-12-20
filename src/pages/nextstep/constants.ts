import { ActionContext } from './types';

export const CONTEXT_LABELS: Record<ActionContext, string> = {
  DEEP_WORK: 'Deep Work',
  QUICK: 'Quick',
  PHONE: 'Phone',
  ERRANDS: 'Errands',
};

export const CONTEXT_COLORS: Record<ActionContext, string> = {
  DEEP_WORK: 'bg-[#0051d5] text-white',
  QUICK: 'bg-[#e2e7ff] text-[#4d556a]',
  PHONE: 'bg-[#e2e7ff] text-[#4d556a]',
  ERRANDS: 'bg-[#e2e7ff] text-[#4d556a]',
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  } catch {
    return dateString;
  }
};