/**
 * 音效管理器
 * 负责管理游戏中的所有音频效果
 */
export default class Music {
  private bgmAudio: HTMLAudioElement;
  private shootAudio: HTMLAudioElement;
  private boomAudio: HTMLAudioElement;
  private isMuted: boolean;

  constructor() {
    this.bgmAudio = new Audio();
    this.shootAudio = new Audio();
    this.boomAudio = new Audio();
    this.isMuted = false;

    this.initAudios();
  }

  /**
   * 初始化音频
   */
  private initAudios(): void {
    this.bgmAudio.src = 'audio/bgm.mp3';
    this.bgmAudio.loop = true;
    
    this.shootAudio.src = 'audio/bullet.mp3';
    this.boomAudio.src = 'audio/boom.mp3';

    // 预加载音效
    this.preloadAudios();
  }

  /**
   * 预加载所有音频
   */
  private preloadAudios(): void {
    const audios = [this.bgmAudio, this.shootAudio, this.boomAudio];
    
    audios.forEach(audio => {
      audio.volume = 0;
      audio.play().then(() => {
        audio.pause();
        audio.volume = 1;
      }).catch(err => {
        console.log('Audio preload failed:', err);
      });
    });
  }

  /**
   * 播放背景音乐
   */
  public playBGM(): void {
    if (this.isMuted) return;
    
    this.bgmAudio.play().catch(err => {
      console.log('BGM play failed:', err);
    });
  }

  /**
   * 暂停背景音乐
   */
  public pauseBGM(): void {
    this.bgmAudio.pause();
  }

  /**
   * 播放射击音效
   */
  public playShoot(): void {
    if (this.isMuted) return;

    // 克隆音频节点以支持重叠播放
    const shootSound = this.shootAudio.cloneNode() as HTMLAudioElement;
    shootSound.volume = 0.3; // 降低射击音效音量
    shootSound.play().catch(err => {
      console.log('Shoot sound play failed:', err);
    });
  }

  /**
   * 播放爆炸音效
   */
  public playExplosion(): void {
    if (this.isMuted) return;

    // 克隆音频节点以支持重叠播放
    const boomSound = this.boomAudio.cloneNode() as HTMLAudioElement;
    boomSound.play().catch(err => {
      console.log('Explosion sound play failed:', err);
    });
  }

  /**
   * 设置所有音频的音量
   * @param volume 音量值（0-1）
   */
  public setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    this.bgmAudio.volume = clampedVolume;
    this.shootAudio.volume = clampedVolume;
    this.boomAudio.volume = clampedVolume;
  }

  /**
   * 静音/取消静音
   * @param muted 是否静音
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    
    if (muted) {
      this.pauseBGM();
    } else {
      this.playBGM();
    }
  }

  /**
   * 获取静音状态
   */
  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * 停止所有音频
   */
  public stopAll(): void {
    this.pauseBGM();
    // 由于射击和爆炸音效使用克隆节点，不需要特别处理
  }

  /**
   * 恢复所有音频
   */
  public resumeAll(): void {
    if (!this.isMuted) {
      this.playBGM();
    }
  }
}