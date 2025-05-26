import { GameObject } from '../types';

/**
 * 游戏基础的精灵类
 */
export default class Sprite implements GameObject {
  public x: number = 0;
  public y: number = 0;
  public width: number = 0;
  public height: number = 0;
  public visible: boolean = true;
  
  protected img: HTMLImageElement | null = null;
  protected isLoaded: boolean = false;

  /**
   * 构造函数
   * @param imgSrc 图片路径，可选
   * @param width 宽度，可选
   * @param height 高度，可选
   */
  constructor(imgSrc?: string, width?: number, height?: number) {
    if (imgSrc) {
      this.img = wx.createImage();
      this.img.src = imgSrc;
      this.img.onload = () => {
        this.isLoaded = true;
        
        // 如果没有指定宽高，则使用图片的实际宽高
        if (!width || !height) {
          this.width = this.img!.width;
          this.height = this.img!.height;
        }
      };
    }

    if (width) this.width = width;
    if (height) this.height = height;
  }

  /**
   * 绘制精灵
   * @param ctx Canvas上下文
   */
  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.visible || !this.img || !this.isLoaded) return;

    ctx.drawImage(
      this.img,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }

  /**
   * 更新精灵状态
   * 子类可以重写此方法来实现自定义的更新逻辑
   */
  public update(): void {
    // 基类中的update为空实现
    // 具体的更新逻辑由子类实现
  }

  /**
   * 销毁精灵
   * 清理资源，准备被对象池回收
   */
  public destroy(): void {
    this.visible = false;
    this.isLoaded = false;
    this.img = null;
  }

  /**
   * 检查是否与其他精灵碰撞
   * 使用简单的矩形碰撞检测
   * @param other 要检测碰撞的其他精灵
   */
  public isCollideWith(other: GameObject): boolean {
    if (!other.visible || !this.visible) return false;

    return !(
      this.x + this.width < other.x ||
      other.x + other.width < this.x ||
      this.y + this.height < other.y ||
      other.y + other.height < this.y
    );
  }

  /**
   * 设置精灵位置
   * @param x X坐标
   * @param y Y坐标
   */
  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  /**
   * 设置精灵尺寸
   * @param width 宽度
   * @param height 高度
   */
  public setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  /**
   * 获取精灵的矩形边界
   * 用于碰撞检测等
   */
  public getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
}