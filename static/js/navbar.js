/**
 * 皓天动漫社 - 导航栏脚本
 * 创建于：2023年
 * 描述：原生JavaScript实现的导航栏功能，包括移动端菜单、滚动监听和主题切换
 */

class Navbar {
  /**
   * 初始化导航栏
   * @param {string} selector - 导航栏容器选择器
   */
  constructor(selector) {
    // 获取DOM元素
    this.header = document.querySelector(selector);
    if (!this.header) {
      console.error(`未找到导航栏容器: ${selector}`);
      return;
    }
    
    this.navToggle = this.header.querySelector('.nav-toggle');
    this.navMenu = this.header.querySelector('.nav-menu-wrapper');
    this.navLinks = Array.from(this.header.querySelectorAll('.nav-link[data-scroll]'));
    this.dropdownToggles = Array.from(this.header.querySelectorAll('.dropdown-toggle'));
    this.themeToggle = this.header.querySelector('.theme-toggle');
    
    // 初始化
    this.init();
  }
  
  /**
   * 初始化导航栏
   */
  init() {
    // 绑定事件
    this.bindEvents();
    
    // 初始化滚动监听
    this.initScrollSpy();
    
    // 初始化主题
    this.initTheme();
  }
  
  /**
   * 绑定事件处理程序
   */
  bindEvents() {
    // 移动端菜单切换
    if (this.navToggle) {
      this.navToggle.addEventListener('click', () => this.toggleMobileMenu());
    }
    
    // 下拉菜单切换
    this.dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => this.toggleDropdown(e));
    });
    
    // 平滑滚动
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => this.smoothScroll(e));
    });
    
    // 主题切换
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    
    // 滚动事件
    window.addEventListener('scroll', () => this.handleScroll());
    
    // 点击外部关闭菜单
    document.addEventListener('click', (e) => this.closeMenusOnClickOutside(e));
    
    // 窗口大小变化
    window.addEventListener('resize', () => this.handleResize());
  }
  
  /**
   * 切换移动端菜单
   */
  toggleMobileMenu() {
    const isExpanded = this.navToggle.getAttribute('aria-expanded') === 'true';
    this.navToggle.setAttribute('aria-expanded', !isExpanded);
    this.navMenu.classList.toggle('show');
    
    // 禁止/允许背景滚动
    document.body.style.overflow = !isExpanded ? 'hidden' : '';
  }
  
  /**
   * 切换下拉菜单
   * @param {Event} e - 点击事件对象
   */
  toggleDropdown(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const toggle = e.currentTarget;
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    const dropdown = toggle.parentElement;
    const dropdownMenu = dropdown.querySelector('.dropdown-menu');
    
    // 关闭其他下拉菜单
    this.dropdownToggles.forEach(otherToggle => {
      if (otherToggle !== toggle) {
        otherToggle.setAttribute('aria-expanded', 'false');
        const otherMenu = otherToggle.parentElement.querySelector('.dropdown-menu');
        if (otherMenu) otherMenu.classList.remove('show');
      }
    });
    
    // 切换当前下拉菜单
    toggle.setAttribute('aria-expanded', !isExpanded);
    dropdownMenu.classList.toggle('show');
  }
  
  /**
   * 平滑滚动到目标位置
   * @param {Event} e - 点击事件对象
   */
  smoothScroll(e) {
    e.preventDefault();
    
    const targetId = e.currentTarget.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      // 获取导航栏高度
      const navHeight = this.header.offsetHeight;
      
      // 计算目标位置
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
      
      // 平滑滚动
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // 如果是移动端，关闭菜单
      if (window.innerWidth < 992) {
        this.navToggle.setAttribute('aria-expanded', 'false');
        this.navMenu.classList.remove('show');
        document.body.style.overflow = '';
      }
      
      // 更新URL
      history.pushState(null, null, targetId);
    }
  }
  
  /**
   * 初始化滚动监听
   */
  initScrollSpy() {
    // 获取所有导航链接对应的目标元素
    this.scrollSpyTargets = this.navLinks.map(link => {
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      return { link, targetElement };
    }).filter(item => item.targetElement !== null);
    
    // 初始化滚动监听
    this.handleScroll();
  }
  
  /**
   * 处理滚动事件
   */
  handleScroll() {
    // 添加/移除滚动样式
    if (window.scrollY > 50) {
      this.header.classList.add('scrolled');
    } else {
      this.header.classList.remove('scrolled');
    }
    
    // 滚动监听
    if (this.scrollSpyTargets && this.scrollSpyTargets.length > 0) {
      // 获取导航栏高度
      const navHeight = this.header.offsetHeight;
      
      // 找到当前滚动位置对应的目标元素
      const currentTarget = this.scrollSpyTargets.find(item => {
        if (!item.targetElement) return false;
        
        const rect = item.targetElement.getBoundingClientRect();
        return rect.top <= navHeight + 5 && rect.bottom > navHeight;
      });
      
      // 更新活动链接
      this.navLinks.forEach(link => link.classList.remove('active'));
      if (currentTarget) {
        currentTarget.link.classList.add('active');
      } else if (window.scrollY < 100) {
        // 如果在页面顶部，激活第一个链接
        this.navLinks[0]?.classList.add('active');
      }
    }
  }
  
  /**
   * 初始化主题
   */
  initTheme() {
    // 获取保存的主题
    const savedTheme = localStorage.getItem('theme');
    
    // 如果有保存的主题，应用它
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
      this.updateThemeIcon(savedTheme);
    } else {
      // 检查系统主题偏好
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = prefersDarkMode ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      this.updateThemeIcon(theme);
    }
  }
  
  /**
   * 切换主题
   */
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // 设置新主题
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // 保存主题设置
    localStorage.setItem('theme', newTheme);
    
    // 更新主题图标
    this.updateThemeIcon(newTheme);
  }
  
  /**
   * 更新主题图标
   * @param {string} theme - 当前主题
   */
  updateThemeIcon(theme) {
    if (!this.themeToggle) return;
    
    const icon = this.themeToggle.querySelector('i');
    if (icon) {
      if (theme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
      }
    }
  }
  
  /**
   * 点击外部关闭菜单
   * @param {Event} e - 点击事件对象
   */
  closeMenusOnClickOutside(e) {
    // 检查是否点击了导航菜单或切换按钮之外的区域
    if (
      this.navMenu &&
      !this.navMenu.contains(e.target) &&
      !this.navToggle.contains(e.target)
    ) {
      // 关闭移动端菜单
      if (window.innerWidth < 992 && this.navMenu.classList.contains('show')) {
        this.navToggle.setAttribute('aria-expanded', 'false');
        this.navMenu.classList.remove('show');
        document.body.style.overflow = '';
      }
    }
    
    // 检查是否点击了下拉菜单之外的区域
    this.dropdownToggles.forEach(toggle => {
      const dropdown = toggle.parentElement;
      const dropdownMenu = dropdown.querySelector('.dropdown-menu');
      
      if (
        dropdownMenu &&
        dropdownMenu.classList.contains('show') &&
        !dropdown.contains(e.target)
      ) {
        toggle.setAttribute('aria-expanded', 'false');
        dropdownMenu.classList.remove('show');
      }
    });
  }
  
  /**
   * 处理窗口大小变化
   */
  handleResize() {
    // 如果窗口大于992px且移动菜单是打开的，关闭它
    if (window.innerWidth >= 992 && this.navMenu.classList.contains('show')) {
      this.navToggle.setAttribute('aria-expanded', 'false');
      this.navMenu.classList.remove('show');
      document.body.style.overflow = '';
    }
  }
}

// 页面加载完成后初始化导航栏
document.addEventListener('DOMContentLoaded', () => {
  const navbar = new Navbar('.site-header');
});