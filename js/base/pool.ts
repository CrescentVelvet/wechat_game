import { PoolItem } from '../types';

/**
 * 对象池类
 * 用于管理和复用游戏对象，避免频繁创建和销毁对象带来的性能开销
 */
export default class Pool {
  private pool: Map<string, PoolItem[]>;
  
  constructor() {
    this.pool = new Map();
  }

  /**
   * 根据对象类型标识符获取一个对象
   * 如果对象池中存在对象，则复用对象池中的对象
   * 如果对象池为空，则返回null
   * @param type 对象类型标识符
   */
  public getItem(type: string): PoolItem | null {
    if (this.pool.has(type)) {
      const items = this.pool.get(type)!;
      if (items.length > 0) {
        return items.shift()!;
      }
    }
    return null;
  }

  /**
   * 将对象回收到对象池
   * @param type 对象类型标识符
   * @param item 要回收的对象
   */
  public recover(type: string, item: PoolItem): void {
    item.destroy();

    if (!this.pool.has(type)) {
      this.pool.set(type, []);
    }

    this.pool.get(type)!.push(item);
  }

  /**
   * 获取指定类型的对象池大小
   * @param type 对象类型标识符
   */
  public getPoolSize(type: string): number {
    if (!this.pool.has(type)) return 0;
    return this.pool.get(type)!.length;
  }

  /**
   * 清空指定类型的对象池
   * @param type 对象类型标识符
   */
  public clearPool(type: string): void {
    if (this.pool.has(type)) {
      this.pool.get(type)!.length = 0;
    }
  }

  /**
   * 清空所有对象池
   */
  public clearAllPools(): void {
    this.pool.clear();
  }

  /**
   * 预热对象池
   * 预先创建一定数量的对象放入对象池，避免游戏开始时的性能抖动
   * @param type 对象类型标识符
   * @param factory 对象工厂函数，用于创建新对象
   * @param count 预创建的对象数量
   */
  public preWarm(type: string, factory: () => PoolItem, count: number): void {
    if (!this.pool.has(type)) {
      this.pool.set(type, []);
    }

    const items = this.pool.get(type)!;
    for (let i = 0; i < count; i++) {
      const item = factory();
      item.destroy(); // 确保对象处于初始状态
      items.push(item);
    }
  }

  /**
   * 获取或创建对象
   * 如果对象池中有可用对象则返回，否则使用工厂函数创建新对象
   * @param type 对象类型标识符
   * @param factory 对象工厂函数，用于创建新对象
   * @param args 初始化参数
   */
  public getItemWithFactory<T extends PoolItem>(
    type: string,
    factory: () => T,
    ...args: any[]
  ): T {
    let item = this.getItem(type) as T;
    
    if (!item) {
      item = factory();
    }

    item.init(...args);
    return item;
  }

  /**
   * 获取所有已注册的对象类型
   */
  public getRegisteredTypes(): string[] {
    return Array.from(this.pool.keys());
  }

  /**
   * 获取对象池统计信息
   */
  public getPoolStats(): { [key: string]: number } {
    const stats: { [key: string]: number } = {};
    this.pool.forEach((items, type) => {
      stats[type] = items.length;
    });
    return stats;
  }
}