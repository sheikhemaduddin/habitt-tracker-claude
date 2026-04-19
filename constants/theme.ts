import { Platform } from 'react-native';

export const Colors = {
  background: '#FFFFFF',
  surface: '#F7F7F7',
  border: '#E8E8E8',
  text: '#000000',
  textSecondary: '#666666',
  textMuted: '#AAAAAA',
  heatmap0: '#F0F0F0',
  heatmap1: '#C8C8C8',
  heatmap2: '#909090',
  heatmap3: '#484848',
  heatmap4: '#000000',
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
