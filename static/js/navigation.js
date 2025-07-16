/**
 * 皓天动漫社 - 导航栏交互脚本
 * 创建于：2023年
 * 描述：使用原生JavaScript实现导航栏的交互功能
 */

document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // 移动端菜单切换
  if (navToggle) {
    navToggle.addEventListener('click', function() {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !expanded);
      navMenu.classList.toggle('show');
      
      // 禁止/允许页面滚动
      document.body.style.overflow = expanded ? '' : 'hidden';
    });
  }
  
  // 下拉菜单切换
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      // 在移动端视图下才阻止默认行为
      if (window.innerWidth <= 991) {
        e.preventDefault();
        
        const expanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !expanded);
        
        // 找到对应的下拉菜单
        const dropdown = this.closest('.nav-dropdown');
        const dropdownMenu = dropdown.querySelector('.dropdown-menu');
        dropdownMenu.classList.toggle('show');
      }
    });
  });
  
  // 点击导航链接关闭移动端菜单
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 991 && navMenu.classList.contains('show')) {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
  });
  
  // 点击页面其他区域关闭移动端菜单
  document.addEventListener('click', function(e) {
    if (
      window.innerWidth <= 991 &&
      navMenu.classList.contains('show') &&
      !navMenu.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      navToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('show');
      document.body.style.overflow = '';
    }
  });
  
  // 滚动时导航栏样式变化
  function handleScroll() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  
  // 初始检查滚动位置
  handleScroll();
  
  // 监听滚动事件
  window.addEventListener('scroll', handleScroll);
  
  // 处理窗口大小变化
  window.addEventListener('resize', function() {
    // 如果从移动视图切换到桌面视图，重置菜单状态
    if (window.innerWidth > 991) {
      navToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('show');
      document.body.style.overflow = '';
      
      // 重置所有下拉菜单
      dropdownToggles.forEach(toggle => {
        toggle.setAttribute('aria-expanded', 'false');
      });
      
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
      });
    }
  });
  
  // 处理页面内锚点平滑滚动
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      
      // 确保目标存在且不是空锚点
      if (targetId !== '#' && document.querySelector(targetId)) {
        e.preventDefault();
        
        const targetElement = document.querySelector(targetId);
        const headerHeight = header.offsetHeight;
        
        window.scrollTo({
          top: targetElement.offsetTop - headerHeight,
          behavior: 'smooth'
        });
      }
    });
  });
});