import Sprite from '../base/sprite';
import Animation from '../base/animation';
import DataBus from '../databus';
import { GameObject, EnemyType, EnemyConfig } from '../types';
import { gameConfig } from '../config';

const databus = DataBus.getInstance();

/**
 * 敌机类
 */
export default class Enemy extends Sprite implements GameObject {
  private type: EnemyType;
  private health: number;
  private maxHealth: number;
  private speed: number;
  private score: number;
  private canShoot: boolean;
  private lastShootTime: number;
  private shootInterval: number;

  /**
   * 构造函数
   */
  constructor() {
    super('images/enemy.png');
    
    // 初始化为小型机的默认值
    const defaultConfig = gameConfig.enemy.types[EnemyType.SMALL];
    this.type = EnemyType.SMALL;
    this.health = defaultConfig.health;
    this.maxHealth = defaultConfig.health;
    this.speed = defaultConfig.speed;
    this.score = defaultConfig.score;
    
    // 射击相关
    this.canShoot = false;
    this.lastShootTime = 0;
    this.shootInterval = 1000; // 默认射击间隔1秒

    // 设置碰撞区域
    this.width = defaultConfig.width;
    this.height = defaultConfig.height;
  }

  /**
   * 初始化敌机
   * @param type 敌机类型
   */
  public init(type: EnemyType = EnemyType.SMALL): void {
    const config = gameConfig.enemy.types[type];
    this.type = type;
    this.health = config.health;
    this.maxHealth = config.health;
    this.speed = config.speed;
    this.score = config.score;
    this.width = config.width;
    this.height = config.height;
    
    // 根据类型决定是否可以射击
    this.canShoot = type !== EnemyType.SMALL;
    this.shootInterval = type === EnemyType.BOSS ? 800 : 1500;
    
    // 随机位置
    this.x = Math.random() * (gameConfig.canvas.width - this.width);
    this.y = -this.height;
    
    this.visible = true;
  }

  /**
   * 更新敌机状态
   */
  public update(): void {
    if (!this.visible) return;

    // 移动
    this.y += this.speed;

    // 超出屏幕范围后回收
    if (this.y > gameConfig.canvas.height + this.height) {
      databus.removeEnemy(this);
      // 敌机到达底部，游戏结束
      databus.gameOver();
      return;
    }

    // 处理射击
    if (this.canShoot) {
      this.tryShoot();
    }
  }

  /**
   * 尝试射击
   */
  private tryShoot(): void {
    const currentTime = Date.now();
    if (currentTime - this.lastShootTime < this.shootInterval) return;

    this.lastShootTime = currentTime;

    // 从对象池中获取子弹
    const bullet = databus.pool.getItemWithFactory(
      'enemyBullet',
      () => new Sprite('images/bullet.png')
    );

    // 设置子弹属性
    bullet.width = 4;
    bullet.height = 8;
    bullet.x = this.x + this.width / 2 - bullet.width / 2;
    bullet.y = this.y + this.height;
    bullet.visible = true;

    // 添加update方法
    (bullet as any).update = function() {
      this.y += 5;
      if (this.y > gameConfig.canvas.height + this.height) {
        databus.removeBullet(this);
      }
    };

    databus.bullets.push(bullet);
  }

  /**
   * 被击中处理
   * @returns 是否被击毁
   */
  public hit(): boolean {
    this.health--;
    
    if (this.health <= 0) {
      // 创建爆炸动画
      Animation.createExplosion(
        this.x,
        this.y,
        this.width,
        this.height
      );

      // 添加分数
      databus.addScore(this.score, true);
      
      // 回收敌机
      databus.removeEnemy(this);
      return true;
    }
    
    return false;
  }

  /**
   * 获取敌机类型
   */
  public getType(): EnemyType {
    return this.type;
  }

  /**
   * 获取敌机生命值
   */
  public getHealth(): number {
    return this.health;
  }

  /**
   * 获取敌机最大生命值
   */
  public getMaxHealth(): number {
    return this.maxHealth;
  }

  /**
   * 获取敌机分数
   */
  public getScore(): number {
    return this.score;
  }

  /**
   * 渲染敌机
   * 对于中型机和BOSS机，添加血条显示
   */
  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.visible) return;

    // 渲染敌机图片
    super.render(ctx);

    // 对于中型机和BOSS机，显示血条
    if (this.type !== EnemyType.SMALL) {
      const healthBarWidth = this.width;
      const healthBarHeight = 4;
      const healthPercentage = this.health / this.maxHealth;

      // 血条背景
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(
        this.x,
        this.y - healthBarHeight - 2,
        healthBarWidth,
        healthBarHeight
      );

      // 当前血量
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(
        this.x,
        this.y - healthBarHeight - 2,
        healthBarWidth * healthPercentage,
        healthBarHeight
      );
    }
  }
}