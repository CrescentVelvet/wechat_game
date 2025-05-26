import Sprite from '../base/sprite';
import { gameConfig } from '../config';

/**
 * 游戏背景类
 * 提供滚动的背景效果
 */
export default class BackGround extends Sprite {
  private top: number;
  private speed: number;

  constructor() {
    super('images/bg.jpg');

    this.top = 0;
    this.speed = 2;
    this.width = gameConfig.canvas.width;
    this.height = gameConfig.canvas.height;
  }

  /**
   * 更新背景位置，实现滚动效果
   */
  public update(): void {
    this.top += this.speed;

    if (this.top >= this.height) {
      this.top = 0;
    }
  }

  /**
   * 渲染背景
   * 通过绘制两张图片实现无缝滚动
   */
  public render(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(
      this.img!,
      0,
      0,
      this.width,
      this.height,
      0,
      -this.height + this.top,
      this.width,
      this.height
    );

    ctx.drawImage(
      this.img!,
      0,
      0,
      this.width,
      this.height,
      0,
      this.top,
      this.width,
      this.height
    );
  }
}