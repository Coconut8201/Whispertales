export const APP_CONFIG = {
  // 是否在回應中包含 timestamp
  INCLUDE_TIMESTAMP: process.env.INCLUDE_TIMESTAMP === 'true' || false,
} as const;