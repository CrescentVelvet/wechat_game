import Player from './player/index';
import Enemy from './npc/enemy';
import BackGround from './runtime/background';
import GameInfo from './runtime/gameinfo';
import Music from './runtime/music';
import DataBus from './databus';
import Renderer from './render';
import { EnemyType, GameObject } from './types';
import { gameConfig } from './config';

const databus = DataBus.getInstance();

/**
 * 游戏主控制器
 */
export default class Main {
  private canvas: any; // wx.Canvas类型
  private ctx: CanvasRenderingContext2D;
  private renderer: Renderer;
  private player: Player;
  private music: Music;
  private gameinfo: GameInfo;
  private bindLoop: () => void;
  private aniId: number = 0;
  private lastEnemyGenTime: number = 0;

  constructor() {
    // 获取canvas和上下文
    this.canvas = wx.createCanvas();
    this.ctx = this.canvas.getContext('2d');

    // 初始化渲染器
    this.renderer = new Renderer(this.canvas, this.ctx);

    // 初始化游戏对象
    this.player = new Player();
    this.music = new Music();
    this.gameinfo = new GameInfo();

    // 将玩家对象存入全局数据总线
    databus.player = this.player;

    // 绑定游戏循环函数
    this.bindLoop = this.loop.bind(this);

    // 初始化事件监听
    this.initEvent();

    // 开始游戏
    this.restart();
  }

  /**
   * 初始化事件监听
   */
  private initEvent(): void {
    // 监听触摸事件
    this.canvas.addEventListener('touchstart', (e: WechatMiniprogram.TouchEvent) => {
      // 如果游戏已结束，检查是否点击了重新开始按钮
      if (databus.isGameOver) {
        this.renderer.handleTouch(e);
      }
    });

    // 监听游戏状态变化
    wx.onShow(() => {
      // 游戏恢复时，恢复音乐
      this.music.resumeAll();
    });

    wx.onHide(() => {
      // 游戏暂停时，停止音乐
      this.music.stopAll();
    });
  }

  /**
   * 重新开始游戏
   */
  public restart(): void {
    databus.reset();
    this.player.reset();
    this.music.playBGM();
    this.lastEnemyGenTime = Date.now();

    // 清除上一局的动画循环
    if (this.aniId) {
      window.cancelAnimationFrame(this.aniId);
    }

    // 开始新的动画循环
    this.aniId = window.requestAnimationFrame(this.bindLoop);
  }

  /**
   * 生成敌机
   */
  private generateEnemies(): void {
    const currentTime = Date.now();
    if (currentTime - this.lastEnemyGenTime < gameConfig.enemy.generateInterval) return;

    this.lastEnemyGenTime = currentTime;

    // 随机决定敌机类型
    let enemyType: EnemyType;
    const rand = Math.random();
    
    if (rand < 0.7) {
      enemyType = EnemyType.SMALL;
    } else if (rand < 0.9) {
      enemyType = EnemyType.MEDIUM;
    } else {
      enemyType = EnemyType.BOSS;
    }

    // 从对象池中获取敌机
    const enemy = databus.pool.getItemWithFactory(
      'enemy',
      () => new Enemy()
    );

    // 初始化敌机
    enemy.init(enemyType);

    // 添加到敌机数组
    databus.enemys.push(enemy);
  }

  /**
   * 碰撞检测
   */
  private collisionDetection(): void {
    // 玩家子弹和敌机的碰撞检测
    const bullets = databus.bullets.filter(bullet => {
      // 过滤出玩家子弹（从下往上飞的）
      return bullet.y < 0 || bullet.y > bullet.y + bullet.height;
    });

    // 敌机子弹（从上往下飞的）
    const enemyBullets = databus.bullets.filter(bullet => {
      return bullet.y > 0 && bullet.y <= bullet.y + bullet.height;
    });

    // 检测玩家子弹与敌机的碰撞
    for (let i = 0, il = bullets.length; i < il; i++) {
      const bullet = bullets[i];
      
      for (let j = 0, jl = databus.enemys.length; j < jl; j++) {
        const enemy = databus.enemys[j];

        if (bullet.isCollideWith(enemy)) {
          // 子弹和敌机发生碰撞
          bullet.visible = false;
          databus.removeBullet(bullet);

          // 敌机被击中
          const isDestroyed = enemy.hit();
          
          if (isDestroyed) {
            // 播放爆炸音效
            this.music.playExplosion();
          }

          break;
        }
      }
    }

    // 检测敌机子弹与玩家的碰撞
    for (let i = 0, il = enemyBullets.length; i < il; i++) {
      const bullet = enemyBullets[i];
      
      if (bullet.isCollideWith(this.player)) {
        // 子弹和玩家发生碰撞
        bullet.visible = false;
        databus.removeBullet(bullet);

        // 玩家被击中
        this.player.hit();
        
        // 播放爆炸音效
        this.music.playExplosion();
        
        break;
      }
    }

    // 检测敌机与玩家的碰撞
    for (let i = 0, il = databus.enemys.length; i < il; i++) {
      const enemy = databus.enemys[i];

      if (enemy.isCollideWith(this.player)) {
        // 敌机和玩家发生碰撞
        enemy.hit();
        this.player.hit();
        
        // 播放爆炸音效
        this.music.playExplosion();
      }
    }
  }

  /**
   * 更新游戏状态
   */
  private update(): void {
    if (databus.isGameOver) return;

    // 更新玩家
    this.player.update();

    // 更新所有子弹
    databus.bullets.forEach((bullet: GameObject) => {
      bullet.update();
    });

    // 更新所有敌机
    databus.enemys.forEach((enemy: GameObject) => {
      enemy.update();
    });

    // 更新所有动画
    databus.animations.forEach((animation: GameObject) => {
      animation.update();
    });

    // 生成敌机
    this.generateEnemies();

    // 碰撞检测
    this.collisionDetection();

    // 更新游戏帧数
    databus.frame++;
  }

  /**
   * 游戏循环
   */
  private loop(): void {
    // 更新游戏状态
    this.update();
    
    // 渲染游戏画面
    this.renderer.render();

    // 继续下一帧
    if (!databus.isGameOver) {
      this.aniId = window.requestAnimationFrame(this.bindLoop);
    }
  }
}