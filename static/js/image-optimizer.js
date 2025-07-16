/**
 * 皓天动漫社 - 图片优化脚本
 * 创建于：2023年
 * 描述：优化图片加载，减少页面卡顿
 */

class ImageOptimizer {
  constructor(options = {}) {
    // 默认配置
    this.config = {
      lazyLoadSelector: 'img:not(.no-lazy)',
      placeholderColor: '#f0f0f0',
      lowQualityPreview: true,
      transitionDuration: '0.3s',
      rootMargin: '200px 0px',
      ...options
    };
    
    this.init();
  }
  
  init() {
    // 将所有图片转换为懒加载模式
    this.setupLazyLoading();
    
    // 添加图片加载事件监听
    window.addEventListener('load', () => {
      this.prioritizeVisibleImages();
    });
    
    // 添加滚动节流
    this.setupScrollThrottle();
  }
  
  /**
   * 设置图片懒加载
   */
  setupLazyLoading() {
    // 获取所有图片
    const images = document.querySelectorAll(this.config.lazyLoadSelector);
    
    if (images.length === 0) return;
    
    // 为每个图片添加懒加载属性和占位符
    images.forEach(img => {
      // 跳过已处理的图片
      if (img.classList.contains('lazy-processed')) return;
      
      // 保存原始src
      const originalSrc = img.getAttribute('src');
      if (originalSrc && !img.getAttribute('data-src')) {
        // 移除src，添加data-src
        img.setAttribute('data-src', originalSrc);
        
        // 创建占位符
        this.createPlaceholder(img);
        
        // 移除原始src以防止立即加载
        img.removeAttribute('src');
      }
      
      // 标记为已处理
      img.classList.add('lazy-processed');
      
      // 添加加载过渡效果
      this.addLoadingTransition(img);
    });
    
    // 使用Intersection Observer进行懒加载
    if ('IntersectionObserver' in window) {
      this.setupIntersectionObserver();
    } else {
      // 回退方案
      this.loadImagesOnScroll();
    }
  }
  
  /**
   * 创建图片占位符
   * @param {HTMLImageElement} img - 图片元素
   */
  createPlaceholder(img) {
    // 获取图片尺寸
    const width = img.getAttribute('width') || img.width || 0;
    const height = img.getAttribute('height') || img.height || 0;
    
    // 如果有尺寸，创建SVG占位符
    if (width && height) {
      const placeholderSrc = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='100%25' height='100%25' fill='${this.config.placeholderColor.replace('#', '%23')}'/%3E%3C/svg%3E`;
      img.setAttribute('src', placeholderSrc);
    } else {
      // 如果没有尺寸，使用通用占位符
      img.setAttribute('src', 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E');
    }
    
    // 如果配置了低质量预览，尝试生成
    if (this.config.lowQualityPreview && img.getAttribute('data-src')) {
      this.generateLowQualityPreview(img);
    }
  }
  
  /**
   * 生成低质量图片预览
   * @param {HTMLImageElement} img - 图片元素
   */
  generateLowQualityPreview(img) {
    const originalSrc = img.getAttribute('data-src');
    
    // 检查是否是本地图片
    if (originalSrc && (originalSrc.startsWith('/') || originalSrc.startsWith('./') || originalSrc.startsWith('../'))) {
      // 为本地图片创建低质量预览
      // 这里可以添加服务器端生成缩略图的逻辑
      // 或者使用现有的缩略图服务
      
      // 示例：添加缩略图查询参数
      // const thumbnailSrc = `${originalSrc}?quality=10&width=30`;
      // img.setAttribute('src', thumbnailSrc);
    }
  }
  
  /**
   * 添加图片加载过渡效果
   * @param {HTMLImageElement} img - 图片元素
   */
  addLoadingTransition(img) {
    // 添加过渡样式
    img.style.transition = `opacity ${this.config.transitionDuration} ease-in-out`;
    img.style.opacity = '0';
    
    // 监听加载完成事件
    img.addEventListener('load', () => {
      // 检查是否是真实图片加载完成，而不是占位符
      if (img.getAttribute('src') === img.getAttribute('data-src')) {
        img.style.opacity = '1';
      }
    });
  }
  
  /**
   * 设置Intersection Observer
   */
  setupIntersectionObserver() {
    const options = {
      rootMargin: this.config.rootMargin,
      threshold: 0.01
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          this.loadImage(img);
          observer.unobserve(img);
        }
      });
    }, options);
    
    // 观察所有懒加载图片
    document.querySelectorAll('img[data-src]').forEach(img => {
      observer.observe(img);
    });
  }
  
  /**
   * 加载图片
   * @param {HTMLImageElement} img - 图片元素
   */
  loadImage(img) {
    const src = img.getAttribute('data-src');
    if (!src) return;
    
    // 预加载图片
    const preloadImg = new Image();
    preloadImg.onload = () => {
      img.setAttribute('src', src);
    };
    preloadImg.src = src;
  }
  
  /**
   * 回退方案：滚动时加载图片
   */
  loadImagesOnScroll() {
    const loadVisibleImages = () => {
      const images = document.querySelectorAll('img[data-src]');
      const viewportHeight = window.innerHeight;
      
      images.forEach(img => {
        const rect = img.getBoundingClientRect();
        
        // 检查图片是否在视口中或接近视口
        if (rect.top <= viewportHeight + 200 && rect.bottom >= -200) {
          this.loadImage(img);
        }
      });
    };
    
    // 初始加载
    loadVisibleImages();
    
    // 滚动时加载
    window.addEventListener('scroll', this.throttle(loadVisibleImages, 200));
  }
  
  /**
   * 优先加载可见区域的图片
   */
  prioritizeVisibleImages() {
    const images = document.querySelectorAll('img[data-src]');
    const viewportHeight = window.innerHeight;
    
    // 计算每个图片与视口的距离
    const imageDistances = Array.from(images).map(img => {
      const rect = img.getBoundingClientRect();
      const distance = Math.abs(rect.top);
      return { img, distance };
    });
    
    // 按距离排序
    imageDistances.sort((a, b) => a.distance - b.distance);
    
    // 分批加载图片
    this.loadImagesInBatches(imageDistances.map(item => item.img), 5, 100);
  }
  
  /**
   * 分批加载图片
   * @param {Array} images - 图片元素数组
   * @param {number} batchSize - 每批加载的图片数量
   * @param {number} delay - 批次之间的延迟(ms)
   */
  loadImagesInBatches(images, batchSize, delay) {
    let currentIndex = 0;
    
    const loadNextBatch = () => {
      const batch = images.slice(currentIndex, currentIndex + batchSize);
      currentIndex += batchSize;
      
      batch.forEach(img => this.loadImage(img));
      
      if (currentIndex < images.length) {
        setTimeout(loadNextBatch, delay);
      }
    };
    
    loadNextBatch();
  }
  
  /**
   * 设置滚动节流
   */
  setupScrollThrottle() {
    // 使用passive: true优化触摸事件
    window.addEventListener('scroll', this.throttle(() => {
      // 滚动时的处理逻辑
    }, 100), { passive: true });
  }
  
  /**
   * 节流函数
   * @param {Function} func - 要节流的函数
   * @param {number} limit - 节流时间间隔(ms)
   * @returns {Function} 节流后的函数
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// 页面加载完成后初始化图片优化器
document.addEventListener('DOMContentLoaded', () => {
  window.imageOptimizer = new ImageOptimizer();
});