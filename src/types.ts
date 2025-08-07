// 기존 타입들 재사용
export enum PlayerState {
  Destroyed = 'destroyed',
  Error = 'error',
  Loading = 'loading',
  Paused = 'paused',
  Playing = 'playing',
  Stopped = 'stopped',
  Frozen = 'frozen',
}

export enum FileType {
  JSON = 'json',
  LOT = 'lot',
  JPG = 'jpg',
  PNG = 'png',
  SVG = 'svg',
}

export enum Renderer {
  SW = 'sw',
  WG = 'wg',
  GL = 'gl',
}

export type RenderConfig = {
  enableDevicePixelRatio?: boolean;
  renderer?: Renderer;
  devicePixelRatio?: number;
  freezeOnOffscreen?: boolean;
  autoResize?: boolean;
};

// 워커에서 필요한 기본 타입들
export interface PlayerInstanceState {
  currentState: PlayerState;
  currentFrame: number;
  totalFrame: number;
  speed: number;
  loop: boolean;
  direction: number;
  backgroundColor: string;
  isLoaded: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isStopped: boolean;
  isFrozen: boolean;
}

export enum InitStatus {
  IDLE = 'idle',
  FAILED = 'failed',
  REQUESTED = 'requested',
  INITIALIZED = 'initialized',
}