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

export enum PlayMode {
  Bounce = 'bounce',
  Normal = 'normal',
}

export type RenderConfig = {
  enableDevicePixelRatio?: boolean;
  renderer?: Renderer;
};

export interface PlayerInstanceState {
  currentState: PlayerState;
  currentFrame: number;
  totalFrame: number;
  speed: number;
  loop: boolean;
  direction: number;
  backgroundColor: string;
  count?: number;
  mode: PlayMode;
  intermission: number;
  size: [number, number];
  src?: string;
  fileType: FileType;
  renderConfig?: RenderConfig;
  autoPlay: boolean;
}

export enum InitStatus {
  IDLE = 'idle',
  FAILED = 'failed',
  REQUESTED = 'requested',
  INITIALIZED = 'initialized',
}