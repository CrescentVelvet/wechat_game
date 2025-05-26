import Sprite from '../base/sprite';
import { GameObject } from '../types';
import { gameConfig } from '../config';

/**
 * 子弹类
 * 玩家飞机发射的子弹
 */
export default class Bullet extends Sprite implements GameObject {
  private speed: number;

  /**
   * 构造函数
   */
  constructor() {
    super('images/bullet.png');
    
    this.speed = gameConfig.player.bulletSpeed;
    this.visible = false;
  }

  /**
   * 初始化子弹
   * @param x 初始x坐标
   * @param y 初始y坐标
   */
  public init(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.visible = true;
  }

  /**
   * 更新子弹位置
   */
  public update(): void {
    if (!this.visible) return;

    this.y -= this.speed;

    // 超出屏幕范围后回收子弹
    if (this.y < -this.height) {
      this.visible = false;
    }
  }

  /**
   * 设置子弹速度
   * @param speed 新的速度值
   */
  public setSpeed(speed: number): void {
    this.speed = speed;
  }
}