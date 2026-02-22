/**
 * Application Constants
 * @module lib/constants
 */

import type { AssetTypeKey } from '@/types';

export const ASSET_TYPE_LABELS: Readonly<Record<AssetTypeKey, string>> = {
  isOffice: 'オフィス',
  isRetail: '商業施設',
  isHotel: 'ホテル',
  isParking: '駐車場',
  isIndustrial: '工場',
  isLogistic: '物流施設',
  isResidential: '住宅',
  isHealthCare: '医療施設',
  isOther: 'その他',
} as const;

export const ASSET_TYPE_KEYS: readonly AssetTypeKey[] = [
  'isOffice',
  'isRetail',
  'isHotel',
  'isParking',
  'isIndustrial',
  'isLogistic',
  'isResidential',
  'isHealthCare',
  'isOther',
] as const;

export const MAP_CONFIG = {
  DEFAULT_CENTER: [35.6762, 139.6503] as [number, number],
  DEFAULT_ZOOM: 11,
  MAX_FIT_ZOOM: 15,
  FIT_PADDING: [60, 60] as [number, number],
  TILE_URL: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  TILE_ATTRIBUTION:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
} as const;

export const MARKER_STYLES = {
  normal: {
    size: 24,
    color: '#3B82F6',
    borderWidth: 3,
    shadow: '0 2px 6px rgba(0,0,0,0.2)',
  },
  selected: {
    size: 32,
    color: '#2563EB',
    borderWidth: 4,
    shadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
  },
} as const;

export const LAYOUT = {
  SIDEBAR_WIDTH: 420,
  HEADER_HEIGHT: 64,
  MOBILE_SIDEBAR_WIDTH: '85vw',
  TABLET_SIDEBAR_WIDTH: 380,
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

export const ANIMATION = {
  FAST: 150,
  BASE: 200,
  SLOW: 300,
  EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const CHART_CONFIG = {
  HEIGHT: 160,
  MARGIN: { top: 5, right: 10, left: 0, bottom: 0 },
  CAP_RATE_COLOR: '#3B82F6',
  OCCUPANCY_COLOR: '#10B981',
  GRID_COLOR: '#f0f0f0',
  AXIS_COLOR: '#9CA3AF',
} as const;

export const VALIDATION = {
  KEYWORD_MAX_LENGTH: 100,
  MIN_SEARCH_LENGTH: 0,
} as const;

export const API_CONFIG = {
  SIMULATED_DELAY: 0,
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
} as const;

export const FORMAT = {
  DATE: 'YYYY-MM-DD',
  DISPLAY_DATE: 'YYYY/MM',
  JP_DATE: 'YYYY年MM月DD日',
  CURRENCY: 'JPY',
  CAP_RATE_DECIMALS: 2,
  OCCUPANCY_DECIMALS: 2,
} as const;

export const ERROR_MESSAGES = {
  GENERIC: '予期しないエラーが発生しました',
  NETWORK: 'ネットワークエラーが発生しました',
  FETCH_FAILED: 'データの取得に失敗しました',
  BUILDING_NOT_FOUND: '建物が見つかりませんでした',
  NO_RESULTS: '条件に一致する建物がありません',
  MAP_LOAD_FAILED: 'マップの読み込みに失敗しました',
} as const;

export const SUCCESS_MESSAGES = {
  SEARCH_COMPLETE: '検索が完了しました',
} as const;

export const A11Y_LABELS = {
  SEARCH_BUTTON: '建物を検索',
  CLEAR_BUTTON: '検索条件をクリア',
  CLOSE_BUTTON: '閉じる',
  MENU_BUTTON: 'メニューを開く',
  DETAIL_BUTTON: '詳細を見る',
  MAP: '建物の位置を示す地図',
  CHART: '推移グラフ',
} as const;
