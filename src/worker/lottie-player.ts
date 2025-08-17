import { html, PropertyValueMap, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { v4 as uuidv4 } from 'uuid';
import { WorkerManager } from './worker-manager';
import { 
  RpcRequest, 
  RpcResponse, 
  MethodParamsMap, 
  MethodResultMap,
  WorkerConfig
} from './types';
import { FileType, PlayerInstanceState, PlayerState, Renderer, PlayMode } from '../types';
import { EventListener, EventManager, EventType } from '../event-manager.js';

function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

@customElement('lottie-player-worker')
export class LottiePlayerWorker extends LitElement {
  @property({ type: String })
  public src: string | undefined;

  private static _wasmUrl: string = '';

  @property({ type: String })
  public get wasmUrl(): string {
    return LottiePlayerWorker._wasmUrl;
  }

  public set wasmUrl(value: string) {
    LottiePlayerWorker._wasmUrl = value;
  }

  @property({ type: String })
  public get fileType(): FileType {
    return this._instanceState.fileType;
  }
  public set fileType(value: FileType) {
    this._instanceState.fileType = value;
  }

  @property({ type: Object })
  public get renderConfig(): {
    enableDevicePixelRatio?: boolean;
    renderer?: Renderer;
  } | undefined {
    return this._instanceState.renderConfig;
  }

  public set renderConfig(value: {
    enableDevicePixelRatio?: boolean;
    renderer?: Renderer;
  } | undefined) {
    this._instanceState.renderConfig = value;
  }
  
  @property({ type: Number })
  public get speed(): number {
    return this._instanceState.speed;
  }

  public set speed(value: number) {
    this._instanceState.speed = value;
    if (this._created) {
      this._sendMessage('setSpeed', { instanceId: this._id, speed: value });
    }
  }


  @property({ type: Boolean })
  public get autoPlay(): boolean {
    return this._instanceState.autoPlay;
  }

  public set autoPlay(value: boolean) {
    this._instanceState.autoPlay = value;
  }

  @property({ type: Number })
  public get count(): number | undefined {
    return this._instanceState.count;
  }

  public set count(value: number | undefined) {
    this._instanceState.count = value;
  }



  @property({ type: Boolean })
  public get loop(): boolean {
    return this._instanceState.loop;
  }

  public set loop(value: boolean) {
    this._instanceState.loop = value;
    if (this._created) {
      this._sendMessage('setLooping', { instanceId: this._id, value });
    }
  }

  @property({ type: Number })
  public get direction(): number {
    return this._instanceState.direction;
  }

  public set direction(value: number) {
    this._instanceState.direction = value;
    if (this._created) {
      this._sendMessage('setDirection', { instanceId: this._id, direction: value });
    }
  }

  @property()
  public get mode(): PlayMode {
    return this._instanceState.mode;
  }

  public set mode(value: PlayMode) {
    this._instanceState.mode = value;
  }

  @property()
  public get intermission(): number {
    return this._instanceState.intermission;
  }

  public set intermission(value: number) {
    this._instanceState.intermission = value;
  }

  @property({ type: Number })
  public get totalFrame(): number {
    return this._instanceState.totalFrame;
  }

  @property({ type: Number })
  public get currentFrame(): number {
    return this._instanceState.currentFrame;
  }

  @property({ type: Number })
  public get currentState(): PlayerState {
    return this._instanceState.currentState;
  }

  public get backgroundColor(): string {
    return this._instanceState.backgroundColor;
  }

  public set backgroundColor(value: string) {
    this._instanceState.backgroundColor = value;
    if (this._created) {
      this._sendMessage('setBgColor', { instanceId: this._id, color: value });
    }
  }

  public get size(): Float32Array {
    return Float32Array.from(this._instanceState.size || [0, 0]);
  }
  private static readonly _workerManager = new WorkerManager();
  private readonly _eventManager = new EventManager();
  private readonly _id: string;
  private _worker?: Worker;
  private _canvas?: HTMLCanvasElement;
  private _created: boolean = false;
  private _observer?: IntersectionObserver;

  private _instanceState: PlayerInstanceState = {
    currentState: PlayerState.Loading,
    currentFrame: 0,
    totalFrame: 0,
    speed: 1,
    loop: false,
    direction: 1,
    backgroundColor: '',
    count: undefined,
    mode: PlayMode.Normal,
    intermission: 1,
    size: [0, 0],
    src: undefined,
    fileType: FileType.JSON,
    renderConfig: undefined,
    autoPlay: false,
  };

  public constructor() {
    super();
    this._id = `thorvg-${generateUniqueId()}`;
    const workerId = 'defaultWorker';
    this._worker = LottiePlayerWorker._workerManager.getWorker(workerId);
    LottiePlayerWorker._workerManager.assignAnimationToWorker(this._id, workerId);

    this._worker.addEventListener('message', this._handleWorkerEvent.bind(this));
  }

  public static setWasmUrl(url: string): void {
    LottiePlayerWorker._workerManager.getWorker('defaultWorker').postMessage({
      id: `set-wasm-url-${generateUniqueId()}`,
      method: 'setWasmUrl',
      params: { url }
    });
  }

  private async _handleWorkerEvent(event: MessageEvent): Promise<void> {
    const rpcResponse: RpcResponse<any> = event.data;

    if (!rpcResponse.id) {
      const result = rpcResponse.result as any;
      if (rpcResponse.method === 'onReady' && result?.instanceId === this._id) {
        this._created = true;
        await this._updateInstanceState();
        this._eventManager.dispatch(result.event);
      }
      
      if (rpcResponse.method === 'onLoad' && result?.instanceId === this._id) {
        await this._updateInstanceState();
        this._eventManager.dispatch(result.event);
      }

      if (rpcResponse.method === 'onPlay' && result?.instanceId === this._id) {
        await this._updateInstanceState();
        this._eventManager.dispatch(result.event);
      }

      if (rpcResponse.method === 'onPause' && result?.instanceId === this._id) {
        await this._updateInstanceState();
        this._eventManager.dispatch(result.event);
      }

      if (rpcResponse.method === 'onStop' && result?.instanceId === this._id) {
        await this._updateInstanceState();
        this._eventManager.dispatch(result.event);
      }

      if (rpcResponse.method === 'onComplete' && result?.instanceId === this._id) {
        await this._updateInstanceState();
        this._eventManager.dispatch(result.event);
      }

      if (rpcResponse.method === 'onFrame' && result?.instanceId === this._id) {
        this._instanceState.currentFrame = result.event.currentFrame;
        this._eventManager.dispatch(result.event);
      }

      if (rpcResponse.method === 'onError' && result?.instanceId === this._id) {
        await this._updateInstanceState();
        this._eventManager.dispatch(result.event);
      }

      if (rpcResponse.method === 'onFreeze' && result?.instanceId === this._id) {
        await this._updateInstanceState();
        this._eventManager.dispatch(result.event);
      }
    }
  }

  private async _create(config: WorkerConfig): Promise<void> {
    if (!this._canvas) {
      throw new Error('Canvas not found');
    }

    let offscreen: OffscreenCanvas;

    if (this._canvas instanceof HTMLCanvasElement) {
      offscreen = this._canvas.transferControlToOffscreen();
    } else {
      offscreen = this._canvas;
    }
    console.log("before sendMessage",{
      instanceId: this._id,
      config: {
        ...config,
        canvas: offscreen,
      },
      width: this._canvas.width,
      height: this._canvas.height,
    });
    const { instanceId } = await this._sendMessage('create', {
      instanceId: this._id,
      config: {
        ...config,
        canvas: offscreen,
      },
      width: this._canvas.width,
      height: this._canvas.height,
    }, [offscreen]);

    if (instanceId !== this._id) {
      throw new Error('Instance ID mismatch');
    }

    this._created = true;
    await this._updateInstanceState();
  }

  private async _sendMessage<T extends keyof MethodParamsMap>(
    method: T,
    params: MethodParamsMap[T],
    transfer?: Transferable[],
  ): Promise<MethodResultMap[T]> {
    const rpcRequest: RpcRequest<T> = {
      id: `thorvg-request-${generateUniqueId()}`,
      method,
      params,
    };

    if (!this._worker) {
      throw new Error('Worker not initialized');
    }

    this._worker.postMessage(rpcRequest, transfer || []);

    return new Promise((resolve, reject) => {
      const onMessage = (event: MessageEvent): void => {
        const rpcResponse: RpcResponse<T> = event.data;
        if (rpcResponse.id === rpcRequest.id) {
          if (this._worker) {
            this._worker.removeEventListener('message', onMessage);
          }

          if (rpcResponse.error) {
            reject(new Error(`Failed to execute method ${method}: ${rpcResponse.error}`));
          } else {
            resolve(rpcResponse.result!);
          }
        }
      };

      if (this._worker) {
        this._worker.addEventListener('message', onMessage);
      }
    });
  }

  private async _updateInstanceState(): Promise<void> {
    if (!this._created) return;

    const result = await this._sendMessage('getInstanceState', { instanceId: this._id });
    this._instanceState = result.state;
  }

  public async load(src: string | object | ArrayBuffer, fileType: FileType): Promise<void> {
    if (!this._created) return;

    await this._sendMessage('load', { 
      instanceId: this._id, 
      src, 
      fileType 
    });
    await this._updateInstanceState();
  }

  public async play(): Promise<void> {
    if (!this._created) return;

    await this._sendMessage('play', { instanceId: this._id });
    await this._updateInstanceState();
  }

  public async pause(): Promise<void> {
    if (!this._created) return;

    await this._sendMessage('pause', { instanceId: this._id });
    await this._updateInstanceState();
  }

  public async stop(): Promise<void> {
    if (!this._created) return;

    await this._sendMessage('stop', { instanceId: this._id });
    await this._updateInstanceState();
  }

  public async seek(frame: number): Promise<void> {
    if (!this._created) return;

    await this._sendMessage('seek', { instanceId: this._id, frame });
    await this._updateInstanceState();
  }

  public async resize(width: number, height: number): Promise<void> {
    if (!this._created) return;

    await this._sendMessage('resize', { instanceId: this._id, width, height });
    await this._updateInstanceState();
  }

  public async setSpeed(speed: number): Promise<void> {
    if (!this._created) return;

    await this._sendMessage('setSpeed', { instanceId: this._id, speed });
    await this._updateInstanceState();
  }

  public async setDirection(direction: number): Promise<void> {
    if (!this._created) return;

    await this._sendMessage('setDirection', { instanceId: this._id, direction });
    await this._updateInstanceState();
  }

  public async setBgColor(color: string): Promise<void> {
    if (!this._created) return;

    await this._sendMessage('setBgColor', { instanceId: this._id, color });
    await this._updateInstanceState();
  }

  public setLooping(value: boolean): void {
    if(!this._created) return;
    this._sendMessage('setLooping', { instanceId: this._id, value });
  }

  public async freeze(): Promise<void> {
    if (!this._created) return;

    await this._sendMessage('freeze', { instanceId: this._id });
    await this._updateInstanceState();
  }

  public async destroy(): Promise<void> {
    if (!this._created) return;

    this._created = false;
    await this._sendMessage('destroy', { instanceId: this._id });

    LottiePlayerWorker._workerManager.unassignAnimationFromWorker(this._id);
    this._eventManager.removeAllEventListeners();
  }

  public addEventListener<T extends EventType>(type: T, listener: EventListener<T>): void {
    this._eventManager.addEventListener(type, listener);
  }

  public removeCustomEventListener<T extends EventType>(type: T, listener?: EventListener<T>): void {
    this._eventManager.removeEventListener(type, listener);
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    console.log("firstUpdated");
    this._canvas = this.querySelector('.thorvg') as HTMLCanvasElement;
    
    this._canvas.id = `thorvg-${uuidv4().replaceAll('-', '').substring(0, 6)}`;
    this._canvas.width = this._canvas.offsetWidth;
    this._canvas.height = this._canvas.offsetHeight;

    this._observer = new IntersectionObserver(this._observerCallback.bind(this));
    this._observer.observe(this);

    this._init();
  }

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  private _observerCallback(entries: IntersectionObserverEntry[]) {
    const entry = entries[0];
    const target = entry.target as LottiePlayerWorker;

    if (entry.isIntersecting) {
      if (target.currentState === PlayerState.Frozen) {
        target.play();
      }
    } else if (target.currentState === PlayerState.Playing) {
      target.freeze();
    }
  }

  private async _init(): Promise<void> {
    if (!this._canvas) {
      return;
    }

    try {
      if (!this._canvas) {
        throw new Error('Canvas not found');
      }
      LottiePlayerWorker.setWasmUrl(this.wasmUrl || '');
      console.log('before create 11',{
        canvas: this._canvas,
        renderConfig: {
          ...this.renderConfig,
        },
        autoPlay: this.autoPlay,
        loop: this.loop,
        speed: this.speed,
        direction: this.direction,
        backgroundColor: this.backgroundColor || '',
        wasmUrl: this.wasmUrl,
      });
      await this._create({
        canvas: this._canvas,
        renderConfig: {
          ...this.renderConfig,
        },
        autoPlay: this.autoPlay,
        loop: this.loop,
        speed: this.speed,
        direction: this.direction,
        backgroundColor: this.backgroundColor || '',
        wasmUrl: this.wasmUrl,
      });

      if (this.src) {
        await this.load(this.src, this.fileType);
      }

      if(this.autoPlay) {
        this.play();
      }
    } catch (error) {
      this._instanceState.currentState = PlayerState.Error;
    }
  }

  public render(): TemplateResult {
    return html`
      <canvas class="thorvg" style="width: 100%; height: 100%;"></canvas>
    `;
  }
} 