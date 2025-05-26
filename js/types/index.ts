/**
 * 游戏实体基础接口
 */
export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  
  update(): void;
  render(ctx: CanvasRenderingContext2D): void;
  destroy(): void;
}

/**
 * 敌机类型枚举
 */
export enum EnemyType {
  SMALL = 'small',   // 小型机
  MEDIUM = 'medium', // 中型机
  BOSS = 'boss'      // BOSS机
}

/**
 * 敌机配置接口
 */
export interface EnemyConfig {
  type: EnemyType;
  health: number;
  speed: number;
  score: number;
  width: number;
  height: number;
}

/**
 * 游戏状态接口
 */
export interface GameState {
  score: number;
  highScore: number;
  lives: number;
  combo: number;
  isGameOver: boolean;
}

/**
 * 可碰撞对象接口
 */
export interface Collidable {
  isCollideWith(other: GameObject): boolean;
}

/**
 * 动画帧接口
 */
export interface AnimationFrame {
  frame: HTMLImageElement;
  duration: number;
}

/**
 * 动画配置接口
 */
export interface AnimationConfig {
  frames: AnimationFrame[];
  loop?: boolean;
  onComplete?: () => void;
}

/**
 * 对象池项目接口
 */
export interface PoolItem {
  destroy(): void;
  init(...args: any[]): void;
}

/**
 * 游戏配置接口
 */
export interface GameConfig {
  canvas: {
    width: number;
    height: number;
  };
  player: {
    speed: number;
    bulletSpeed: number;
    shootInterval: number;
    lives: number;
  };
  enemy: {
    generateInterval: number;
    types: {
      [key in EnemyType]: EnemyConfig;
    };
  };
  scoring: {
    comboThreshold: number;
    comboBonus: number;
  };
}