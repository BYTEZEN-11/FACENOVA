export const APP_NAME = import.meta.env.VITE_APP_NAME || 'TruthGuard AI';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
export const APP_TAGLINE = 'Detect misinformation before you share it';
export const APP_DESCRIPTION =
  'AI-powered fake news detection, claim extraction, and source credibility scoring.';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
export const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 30000;

export const CLASSIFICATIONS = {
  REAL: 'real',
  FAKE: 'fake',
  SUSPICIOUS: 'suspicious',
};

export const CLASSIFICATION_META = {
  [CLASSIFICATIONS.REAL]: {
    label: 'Likely Real',
    tone: 'success',
    color: 'emerald',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    ringClass: 'ring-emerald-500/30',
    barClass: 'bg-emerald-500',
  },
  [CLASSIFICATIONS.SUSPICIOUS]: {
    label: 'Suspicious',
    tone: 'warning',
    color: 'amber',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-400',
    ringClass: 'ring-amber-500/30',
    barClass: 'bg-amber-500',
  },
  [CLASSIFICATIONS.FAKE]: {
    label: 'Likely Fake',
    tone: 'danger',
    color: 'rose',
    bgClass: 'bg-rose-500/10',
    textClass: 'text-rose-400',
    ringClass: 'ring-rose-500/30',
    barClass: 'bg-rose-500',
  },
};

export const TRUST_SCORE_THRESHOLDS = {
  REAL: 65,
  FAKE: 35,
  HIGH: 70,
  MEDIUM: 40,
  LOW: 0,
};

export const TRUST_SCORE_BANDS = [
  { min: 80, label: 'Highly credible', color: 'emerald' },
  { min: 65, label: 'Likely credible', color: 'emerald' },
  { min: 50, label: 'Mixed signals', color: 'amber' },
  { min: 35, label: 'Likely unreliable', color: 'amber' },
  { min: 0, label: 'Highly unreliable', color: 'rose' },
];

export function bandForScore(score) {
  return (
    TRUST_SCORE_BANDS.find((b) => score >= b.min) || TRUST_SCORE_BANDS[TRUST_SCORE_BANDS.length - 1]
  );
}

export const INPUT_TYPES = {
  TEXT: 'text',
  URL: 'url',
  IMAGE: 'image',
};

export const INPUT_TYPE_LABELS = {
  [INPUT_TYPES.TEXT]: 'Text',
  [INPUT_TYPES.URL]: 'URL',
  [INPUT_TYPES.IMAGE]: 'Image',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ANALYZE: '/analyze',
  HISTORY: '/history',
  PROFILE: '/profile',
  REPORT_DETAIL: (id) => `/reports/${id}`,
  NOT_FOUND: '/404',
};

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const ROLE_LABELS = {
  [ROLES.USER]: 'User',
  [ROLES.ADMIN]: 'Administrator',
};

export const LIMITS = {
  TEXT_MIN: 10,
  TEXT_MAX: 50000,
  URL_MAX: 2048,
  IMAGE_MAX_BYTES: 10 * 1024 * 1024,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  NAME_MAX: 100,
  EMAIL_MAX: 254,
};

export const HISTORY_PAGE_SIZE = 10;
export const HISTORY_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const COPY = {
  ANALYZE_TITLE: 'Analyze Content',
  ANALYZE_SUBTITLE: 'Paste text, drop a URL, or upload an image to begin',
  ANALYZE_EMPTY: 'Choose an analysis mode to get started.',
  ANALYZE_LOADING: 'Analyzing content...',
  ANALYZE_ERROR_DEFAULT: 'Something went wrong while analyzing. Please try again.',
  LOGIN_TITLE: 'Welcome back',
  LOGIN_SUBTITLE: 'Sign in to continue verifying content.',
  LOGIN_SUBMIT: 'Sign in',
  LOGIN_NO_ACCOUNT: "Don't have an account?",
  LOGIN_SIGNUP: 'Create one',
  REGISTER_TITLE: 'Create your account',
  REGISTER_SUBTITLE: 'Start verifying content in seconds.',
  REGISTER_SUBMIT: 'Create account',
  REGISTER_HAVE_ACCOUNT: 'Already have an account?',
  REGISTER_SIGNIN: 'Sign in',
  DASHBOARD_WELCOME: 'Welcome back',
  DASHBOARD_SUBTITLE: 'Your verification activity at a glance',
  HISTORY_TITLE: 'Analysis History',
  HISTORY_SUBTITLE: 'All your past analyses in one place',
  HISTORY_EMPTY: 'No analyses yet. Run your first one from the Analyze page.',
  PROFILE_TITLE: 'Profile',
  PROFILE_SUBTITLE: 'Manage your account information',
  NOT_FOUND_TITLE: 'Page not found',
  NOT_FOUND_SUBTITLE: 'The page you are looking for does not exist.',
  NOT_FOUND_HOME: 'Go home',
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const DEFAULT_THEME = THEMES.DARK;
export const THEME_STORAGE_KEY = 'truthguard:theme';
