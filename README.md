# 皓天动漫社网站组件库

这是为皓天动漫社开发的网站组件库，包含了构建现代、响应式网站所需的基本组件和样式。

## 项目结构

```
static/
├── css/
│   ├── variables.css  - CSS变量定义
│   ├── main.css       - 主样式文件
│   ├── navbar.css     - 导航栏样式
│   ├── carousel.css   - 轮播图样式
│   └── footer.css     - 页脚样式
├── js/
│   ├── navbar.js      - 导航栏脚本
│   ├── carousel.js    - 轮播图脚本
│   └── main.js        - 主脚本文件
├── examples/
│   └── integrated-page.html - 集成示例页面
└── picture/           - 图片资源目录
```

## 特性

- 响应式设计，适配各种屏幕尺寸
- 深色/浅色主题切换
- 现代化的导航栏，支持移动端菜单
- 功能丰富的轮播图组件
- 美观的页脚设计
- 基于CSS变量的主题系统
- 纯原生JavaScript实现，无需外部依赖
- 丰富的工具类，便于快速开发

## 使用方法

### 基本设置

1. 在HTML文件的`<head>`中引入样式文件：

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
<link rel="stylesheet" href="static/css/main.css">
```

2. 在HTML文件的`</body>`前引入脚本文件：

```html
<script src="static/js/navbar.js"></script>
<script src="static/js/carousel.js"></script>
<script src="static/js/main.js"></script>
```

### 导航栏组件

```html
<header class="site-header">
  <div class="container">
    <nav class="main-nav" aria-label="主导航">
      <!-- 网站Logo -->
      <a href="index.html" class="nav-logo">
        <img src="static/picture/皓天.png" alt="皓天动漫社" width="120">
      </a>
      
      <!-- 移动端菜单按钮 -->
      <button class="nav-toggle" aria-expanded="false" aria-controls="main-menu" aria-label="切换菜单">
        <span class="nav-toggle-icon"></span>
        <span class="sr-only">菜单</span>
      </button>
      
      <!-- 主菜单 -->
      <div class="nav-menu-wrapper" id="main-menu">
        <ul class="nav-menu">
          <li class="nav-item">
            <a href="#" class="nav-link active">首页</a>
          </li>
          <!-- 更多菜单项 -->
        </ul>
      </div>
      
      <!-- 导航栏右侧功能区 -->
      <div class="nav-actions">
        <button class="theme-toggle" aria-label="切换主题">
          <i class="fas fa-moon"></i>
        </button>
        <a href="#" class="btn-nav">加入我们</a>
      </div>
    </nav>
  </div>
</header>
```

### 轮播图组件

```html
<div class="carousel" id="main-carousel">
  <div class="carousel-container">
    <div class="carousel-track">
      <div class="carousel-slide">
        <img src="static/picture/1.jpg" alt="轮播图1" class="carousel-image">
        <div class="carousel-caption">
          <h2>标题文本</h2>
          <p>描述文本</p>
          <a href="#" class="btn btn-primary">按钮</a>
        </div>
      </div>
      <!-- 更多轮播图幻灯片 -->
    </div>
  </div>
  
  <!-- 轮播图控制按钮 -->
  <button class="carousel-prev" aria-label="上一张">
    <i class="fas fa-chevron-left"></i>
  </button>
  <button class="carousel-next" aria-label="下一张">
    <i class="fas fa-chevron-right"></i>
  </button>
  
  <!-- 轮播图指示器 -->
  <div class="carousel-indicators">
    <button class="carousel-indicator active" aria-label="转到第1张幻灯片" aria-current="true"></button>
    <!-- 更多指示器 -->
  </div>
</div>
```

### 页脚组件

```html
<footer class="site-footer">
  <div class="container">
    <div class="footer-content">
      <!-- 社团信息 -->
      <div class="footer-info">
        <img src="static/picture/皓天.png" alt="皓天动漫社" class="footer-logo">
        <p>描述文本</p>
        <div class="social-links">
          <!-- 社交媒体链接 -->
        </div>
      </div>
      
      <!-- 快速链接 -->
      <div class="footer-links">
        <h3>快速链接</h3>
        <ul>
          <!-- 链接列表 -->
        </ul>
      </div>
      
      <!-- 更多页脚部分 -->
    </div>
    
    <!-- 版权信息 -->
    <div class="footer-bottom">
      <p>&copy; <span id="current-year">2023</span> 皓天动漫社 版权所有</p>
    </div>
  </div>
</footer>
```

## 主题定制

通过修改`variables.css`文件中的CSS变量，可以轻松定制网站的颜色、字体、间距等样式。

## 浏览器兼容性

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)
- Opera (最新版)

## 示例

查看`static/examples/integrated-page.html`文件，了解如何集成所有组件构建完整页面。

## 许可证

版权所有 © 2023 皓天动漫社