import Sprite from './sprite';
import DataBus from '../databus';
import { AnimationConfig, AnimationFrame } from '../types';

const databus = DataBus.getInstance();

/**
 * 动画基类
 * 提供帧动画的基本实现
 */
export default class Animation extends Sprite {
  private frames: AnimationFrame[] = [];
  private index: number = 0;
  private count: number = 0;
  private isPlaying: boolean = false;
  private loop: boolean = false;
  private onComplete?: () => void;
  private frameWidth: number = 0;
  private frameHeight: number = 0;

  /**
   * 构造函数
   * @param config 动画配置
   */
  constructor(config?: AnimationConfig) {
    super();

    if (config) {
      this.frames = config.frames;
      this.loop = config.loop || false;
      this.onComplete = config.onComplete;
      
      if (this.frames.length > 0) {
        const firstFrame = this.frames[0].frame;
        this.frameWidth = firstFrame.width;
        this.frameHeight = firstFrame.height;
        this.width = this.frameWidth;
        this.height = this.frameHeight;
      }
    }
  }

  /**
   * 初始化动画
   * @param config 动画配置
   */
  public init(config: AnimationConfig): void {
    this.frames = config.frames;
    this.loop = config.loop || false;
    this.onComplete = config.onComplete;
    
    if (this.frames.length > 0) {
      const firstFrame = this.frames[0].frame;
      this.frameWidth = firstFrame.width;
      this.frameHeight = firstFrame.height;
      this.width = this.frameWidth;
      this.height = this.frameHeight;
    }

    this.index = 0;
    this.count = 0;
    this.isPlaying = false;
    this.visible = true;
  }

  /**
   * 播放动画
   * @param isLoop 是否循环播放
   */
  public play(isLoop: boolean = false): void {
    this.isPlaying = true;
    this.loop = isLoop;
    this.index = 0;
    this.count = 0;
  }

  /**
   * 停止动画
   */
  public stop(): void {
    this.isPlaying = false;
  }

  /**
   * 销毁动画
   */
  public destroy(): void {
    this.stop();
    this.frames = [];
    this.onComplete = undefined;
    this.visible = false;
  }

  /**
   * 更新动画
   * 根据帧计数更新当前显示的帧
   */
  public update(): void {
    if (!this.isPlaying || this.frames.length === 0) return;

    this.count++;

    if (this.count >= this.frames[this.index].duration) {
      this.count = 0;
      this.index++;

      if (this.index >= this.frames.length) {
        if (this.loop) {
          this.index = 0;
        } else {
          this.index--;
          this.isPlaying = false;

          if (this.onComplete) {
            this.onComplete();
          }

          // 从动画数组中移除
          const animIndex = databus.animations.indexOf(this);
          if (animIndex !== -1) {
            databus.animations.splice(animIndex, 1);
          }
        }
      }
    }
  }

  /**
   * 绘制动画
   * @param ctx Canvas上下文
   */
  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.visible || this.frames.length === 0) return;

    const currentFrame = this.frames[this.index].frame;
    
    ctx.drawImage(
      currentFrame,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }

  /**
   * 创建爆炸动画
   * @param x 爆炸位置x坐标
   * @param y 爆炸位置y坐标
   * @param width 爆炸宽度
   * @param height 爆炸高度
   */
  public static createExplosion(x: number, y: number, width: number, height: number): Animation {
    // 创建爆炸动画帧
    const frames: AnimationFrame[] = [];
    
    // 加载爆炸序列帧
    for (let i = 1; i <= 19; i++) {
      const frame = wx.createImage();
      frame.src = `images/explosion${i}.png`;
      frames.push({
        frame,
        duration: 2 // 每帧持续2个游戏帧
      });
    }

    // 创建动画实例
    const animation = new Animation({
      frames,
      loop: false,
      onComplete: () => {
        // 动画完成后自动从动画列表中移除
      }
    });

    // 设置位置和大小
    animation.x = x;
    animation.y = y;
    animation.width = width;
    animation.height = height;
    
    // 开始播放动画
    animation.play();
    
    // 将动画添加到全局动画列表
    databus.animations.push(animation);
    
    return animation;
  }

  /**
   * 检查动画是否正在播放
   */
  public isAnimationPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * 获取当前帧索引
   */
  public getCurrentFrameIndex(): number {
    return this.index;
  }

  /**
   * 获取总帧数
   */
  public getTotalFrames(): number {
    return this.frames.length;
  }

  /**
   * 设置动画播放速度
   * @param speed 速度因子，值越大播放越慢
   */
  public setSpeed(speed: number): void {
    for (let i = 0; i < this.frames.length; i++) {
      this.frames[i].duration = Math.max(1, Math.floor(this.frames[i].duration * speed));
    }
  }
}