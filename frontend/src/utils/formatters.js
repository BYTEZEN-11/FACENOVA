import {
  CLASSIFICATION_META,
  CLASSIFICATIONS,
  TRUST_SCORE_THRESHOLDS,
  bandForScore,
} from './constants';

const LEGACY_COLORS = {
  [CLASSIFICATIONS.REAL]: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  [CLASSIFICATIONS.FAKE]: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    dot: 'bg-rose-500',
  },
  [CLASSIFICATIONS.SUSPICIOUS]: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
  },
};

export function formatDate(date, options = {}) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

export function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(date) {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function formatNumber(num, options = {}) {
  if (num == null) return '0';
  return new Intl.NumberFormat('en-US', options).format(num);
}

export function formatPercentage(value, decimals = 1) {
  if (value == null) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
}

export function truncate(text, max = 100) {
  if (!text) return '';
  if (text.length <= max) return text;
  return `${text.substring(0, max).trim()}...`;
}

export function getClassificationColor(classification) {
  const meta = CLASSIFICATION_META[classification];
  if (!meta) {
    return {
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      border: 'border-slate-500/30',
      dot: 'bg-slate-500',
    };
  }
  return {
    bg: meta.bgClass,
    text: meta.textClass,
    border: meta.ringClass,
    dot: meta.barClass,
  };
}

export function getClassificationLabel(classification) {
  const meta = CLASSIFICATION_META[classification];
  return meta ? meta.label : 'Unknown';
}

export function classificationFromScore(score) {
  if (score >= TRUST_SCORE_THRESHOLDS.REAL) return CLASSIFICATIONS.REAL;
  if (score <= TRUST_SCORE_THRESHOLDS.FAKE) return CLASSIFICATIONS.FAKE;
  return CLASSIFICATIONS.SUSPICIOUS;
}

export function bandLabelForScore(score) {
  return bandForScore(score).label;
}
