/**
 * 皓天动漫社 - 轮播图脚本
 * 创建于：2023年
 * 描述：原生JavaScript实现的轮播图功能，支持自动播放、手动切换和触摸滑动
 */

class Carousel {
  /**
   * 初始化轮播图
   * @param {string} selector - 轮播图容器选择器
   * @param {Object} options - 配置选项
   */
  constructor(selector, options = {}) {
    // 默认配置
    this.config = {
      autoplay: true,
      interval: 5000,
      duration: 300,
      pauseOnHover: true,
      ...options
    };
    
    // 获取DOM元素
    this.carousel = document.querySelector(selector);
    if (!this.carousel) {
      console.error(`未找到轮播图容器: ${selector}`);
      return;
    }
    
    this.track = this.carousel.querySelector('.carousel-track');
    this.slides = Array.from(this.carousel.querySelectorAll('.carousel-slide'));
    this.prevBtn = this.carousel.querySelector('.carousel-prev');
    this.nextBtn = this.carousel.querySelector('.carousel-next');
    this.indicators = Array.from(this.carousel.querySelectorAll('.carousel-indicator'));
    
    // 初始化状态
    this.slideCount = this.slides.length;
    this.currentIndex = 0;
    this.isAnimating = false;
    this.autoplayInterval = null;
    this.touchStartX = 0;
    this.touchEndX = 0;
    
    // 初始化
    this.init();
  }
  
  /**
   * 初始化轮播图
   */
  init() {
    if (this.slideCount <= 0) return;
    
    // 设置初始位置
    this.goToSlide(0);
    
    // 绑定事件
    this.bindEvents();
    
    // 启动自动播放
    if (this.config.autoplay) {
      this.startAutoplay();
    }
  }
  
  /**
   * 绑定事件处理程序
   */
  bindEvents() {
    // 上一张/下一张按钮
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prevSlide());
    }
    
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextSlide());
    }
    
    // 指示器点击
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });
    
    // 鼠标悬停暂停
    if (this.config.pauseOnHover) {
      this.carousel.addEventListener('mouseenter', () => this.pauseAutoplay());
      this.carousel.addEventListener('mouseleave', () => this.startAutoplay());
    }
    
    // 触摸事件
    this.carousel.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    this.carousel.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
    this.carousel.addEventListener('touchend', () => this.handleTouchEnd());
    
    // 键盘导航
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    
    // 可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAutoplay();
      } else {
        this.startAutoplay();
      }
    });
    
    // 窗口大小变化
    window.addEventListener('resize', () => this.handleResize());
  }
  
  /**
   * 切换到指定幻灯片
   * @param {number} index - 幻灯片索引
   */
  goToSlide(index) {
    if (this.isAnimating || index === this.currentIndex) return;
    
    // 边界检查
    if (index < 0) {
      index = this.slideCount - 1;
    } else if (index >= this.slideCount) {
      index = 0;
    }
    
    // 设置动画状态
    this.isAnimating = true;
    
    // 计算位移
    const offset = -index * 100;
    
    // 应用过渡
    this.track.style.transition = `transform ${this.config.duration}ms ease`;
    this.track.style.transform = `translateX(${offset}%)`;
    
    // 更新指示器
    this.updateIndicators(index);
    
    // 更新当前索引
    this.currentIndex = index;
    
    // 动画结束后重置状态
    setTimeout(() => {
      this.isAnimating = false;
    }, this.config.duration);
  }
  
  /**
   * 切换到上一张幻灯片
   */
  prevSlide() {
    this.goToSlide(this.currentIndex - 1);
  }
  
  /**
   * 切换到下一张幻灯片
   */
  nextSlide() {
    this.goToSlide(this.currentIndex + 1);
  }
  
  /**
   * 更新指示器状态
   * @param {number} activeIndex - 活动幻灯片索引
   */
  updateIndicators(activeIndex) {
    this.indicators.forEach((indicator, index) => {
      if (index === activeIndex) {
        indicator.classList.add('active');
        indicator.setAttribute('aria-current', 'true');
      } else {
        indicator.classList.remove('active');
        indicator.setAttribute('aria-current', 'false');
      }
    });
  }
  
  /**
   * 启动自动播放
   */
  startAutoplay() {
    if (!this.config.autoplay || this.autoplayInterval) return;
    
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, this.config.interval);
  }
  
  /**
   * 暂停自动播放
   */
  pauseAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
  
  /**
   * 处理触摸开始事件
   * @param {TouchEvent} e - 触摸事件对象
   */
  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX;
    this.pauseAutoplay();
  }
  
  /**
   * 处理触摸移动事件
   * @param {TouchEvent} e - 触摸事件对象
   */
  handleTouchMove(e) {
    if (!this.touchStartX) return;
    
    this.touchEndX = e.touches[0].clientX;
    
    // 计算滑动距离
    const diff = this.touchStartX - this.touchEndX;
    const threshold = this.carousel.offsetWidth * 0.2;
    
    // 如果滑动距离足够大，应用拖动效果
    if (Math.abs(diff) > 20) {
      const dragOffset = -this.currentIndex * 100 - (diff / this.carousel.offsetWidth) * 100;
      this.track.style.transition = 'none';
      this.track.style.transform = `translateX(${dragOffset}%)`;
    }
  }
  
  /**
   * 处理触摸结束事件
   */
  handleTouchEnd() {
    if (!this.touchStartX || !this.touchEndX) return;
    
    // 计算滑动距离
    const diff = this.touchStartX - this.touchEndX;
    const threshold = this.carousel.offsetWidth * 0.2;
    
    // 根据滑动方向和距离决定是否切换幻灯片
    if (diff > threshold) {
      this.nextSlide();
    } else if (diff < -threshold) {
      this.prevSlide();
    } else {
      // 如果滑动距离不够，恢复到当前幻灯片
      this.goToSlide(this.currentIndex);
    }
    
    // 重置触摸状态
    this.touchStartX = 0;
    this.touchEndX = 0;
    
    // 恢复自动播放
    this.startAutoplay();
  }
  
  /**
   * 处理键盘事件
   * @param {KeyboardEvent} e - 键盘事件对象
   */
  handleKeyDown(e) {
    // 只有当轮播图在视口中时才响应键盘事件
    if (!this.isInViewport()) return;
    
    if (e.key === 'ArrowLeft') {
      this.prevSlide();
    } else if (e.key === 'ArrowRight') {
      this.nextSlide();
    }
  }
  
  /**
   * 检查轮播图是否在视口中
   * @returns {boolean} 是否在视口中
   */
  isInViewport() {
    const rect = this.carousel.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  
  /**
   * 处理窗口大小变化
   */
  handleResize() {
    // 重新应用当前幻灯片位置
    this.track.style.transition = 'none';
    this.track.style.transform = `translateX(${-this.currentIndex * 100}%)`;
  }
}

// 页面加载完成后初始化轮播图
document.addEventListener('DOMContentLoaded', () => {
  const mainCarousel = new Carousel('#main-carousel', {
    autoplay: true,
    interval: 5000,
    duration: 500,
    pauseOnHover: true
  });
});