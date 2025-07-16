/**
 * 皓天动漫社 - 图片懒加载脚本
 * 创建于：2023年
 * 描述：使用Intersection Observer API实现图片懒加载
 */

document.addEventListener('DOMContentLoaded', function() {
  // 检查浏览器是否支持Intersection Observer API
  if ('IntersectionObserver' in window) {
    // 获取所有需要懒加载的图片
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    // 创建观察者实例
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        // 当图片进入视口时
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // 设置src属性为data-src的值
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          // 如果有data-srcset，也设置srcset
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
          }
          
          // 图片加载完成后，停止观察该元素
          img.onload = function() {
            img.classList.add('loaded');
          };
          
          observer.unobserve(img);
        }
      });
    }, {
      // 图片进入视口前100px就开始加载
      rootMargin: '100px 0px',
      threshold: 0.01
    });
    
    // 开始观察所有图片
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // 如果浏览器不支持Intersection Observer，则立即加载所有图片
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
    });
  }
});