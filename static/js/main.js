/**
 * 皓天动漫社 - 主脚本
 * 创建于：2023年
 * 描述：全局JavaScript功能，包括滚动动画、图片懒加载等
 */

/**
 * 动画元素类
 * 处理页面滚动时的元素动画
 */
class AnimateOnScroll {
  constructor() {
    this.animateElements = document.querySelectorAll('.animate-on-scroll');
    this.init();
  }
  
  init() {
    if (this.animateElements.length === 0) return;
    
    // 初始检查
    this.checkElements();
    
    // 绑定滚动事件
    window.addEventListener('scroll', () => this.checkElements());
    window.addEventListener('resize', () => this.checkElements());
  }
  
  checkElements() {
    const windowHeight = window.innerHeight;
    const triggerPoint = windowHeight * 0.8;
    
    this.animateElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      
      if (elementTop < triggerPoint) {
        element.classList.add('visible');
      }
    });
  }
}

/**
 * 图片懒加载类
 * 延迟加载图片，提高页面加载性能
 */
class LazyLoad {
  constructor() {
    this.lazyImages = document.querySelectorAll('img[data-src]');
    this.init();
  }
  
  init() {
    if (this.lazyImages.length === 0) return;
    
    // 检查是否支持IntersectionObserver
    if ('IntersectionObserver' in window) {
      this.setupIntersectionObserver();
    } else {
      this.loadAllImages();
    }
  }
  
  setupIntersectionObserver() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          this.loadImage(image);
          observer.unobserve(image);
        }
      });
    });
    
    this.lazyImages.forEach(image => {
      imageObserver.observe(image);
    });
  }
  
  loadImage(image) {
    const src = image.getAttribute('data-src');
    if (!src) return;
    
    image.src = src;
    image.removeAttribute('data-src');
    
    image.addEventListener('load', () => {
      image.classList.add('loaded');
    });
  }
  
  loadAllImages() {
    this.lazyImages.forEach(image => {
      this.loadImage(image);
    });
  }
}

/**
 * 平滑滚动类
 * 处理页面内锚点链接的平滑滚动
 */
class SmoothScroll {
  constructor() {
    this.scrollLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    this.init();
  }
  
  init() {
    if (this.scrollLinks.length === 0) return;
    
    this.scrollLinks.forEach(link => {
      link.addEventListener('click', (e) => this.handleClick(e));
    });
  }
  
  handleClick(e) {
    const link = e.currentTarget;
    const targetId = link.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      e.preventDefault();
      
      // 获取导航栏高度
      const navHeight = document.querySelector('.site-header')?.offsetHeight || 0;
      
      // 计算目标位置
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
      
      // 平滑滚动
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // 更新URL
      history.pushState(null, null, targetId);
    }
  }
}

/**
 * 返回顶部按钮类
 * 当页面滚动到一定距离时显示返回顶部按钮
 */
class BackToTop {
  constructor() {
    this.createButton();
    this.init();
  }
  
  createButton() {
    // 创建返回顶部按钮
    this.button = document.createElement('button');
    this.button.className = 'back-to-top';
    this.button.setAttribute('aria-label', '返回顶部');
    this.button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      .back-to-top {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        background-color: var(--primary-color);
        color: var(--white-color);
        border: none;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all var(--transition-normal);
        z-index: 999;
      }
      
      .back-to-top:hover,
      .back-to-top:focus {
        background-color: var(--primary-color-dark);
        transform: translateY(-5px);
      }
      
      .back-to-top.show {
        opacity: 1;
        visibility: visible;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(this.button);
  }
  
  init() {
    // 绑定滚动事件
    window.addEventListener('scroll', () => this.toggleButton());
    
    // 绑定点击事件
    this.button.addEventListener('click', () => this.scrollToTop());
  }
  
  toggleButton() {
    if (window.scrollY > 300) {
      this.button.classList.add('show');
    } else {
      this.button.classList.remove('show');
    }
  }
  
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

/**
 * 页面加载完成后初始化所有功能
 */
document.addEventListener('DOMContentLoaded', () => {
  // 初始化动画元素
  new AnimateOnScroll();
  
  // 初始化图片懒加载
  new LazyLoad();
  
  // 初始化平滑滚动
  new SmoothScroll();
  
  // 初始化返回顶部按钮
  new BackToTop();
  
  // 为卡片添加动画类
  document.querySelectorAll('.card').forEach(card => {
    card.classList.add('animate-on-scroll');
  });
  
  // 为部分标题添加动画类
  document.querySelectorAll('.section-title, .section-subtitle').forEach(title => {
    title.classList.add('animate-on-scroll');
  });
  
  // 检测浏览器是否支持WebP格式
  checkWebpSupport();
});

/**
 * 检测浏览器是否支持WebP格式
 */
function checkWebpSupport() {
  const webpTest = new Image();
  webpTest.onload = function() {
    const isSupported = (webpTest.width > 0) && (webpTest.height > 0);
    document.documentElement.classList.toggle('webp', isSupported);
  };
  webpTest.onerror = function() {
    document.documentElement.classList.toggle('webp', false);
  };
  webpTest.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
}

/**
 * 添加页面加载完成动画
 */
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
  
  // 添加页面加载完成样式
  const style = document.createElement('style');
  style.textContent = `
    body {
      opacity: 0;
      transition: opacity 0.5s ease;
    }
    
    body.loaded {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);
});