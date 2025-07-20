/**
 * 背景音乐控制脚本 - 支持自动轮播、点播、音量调节和跨页面同步播放
 */
document.addEventListener('DOMContentLoaded', function() {
    // 获取音频元素和控制按钮
    const backgroundMusic = document.getElementById('background-music');
    const musicControl = document.getElementById('music-control');
    const musicPlayerPanel = document.getElementById('music-player-panel');
    const musicList = document.querySelector('.music-list');
    const currentSongTitle = document.querySelector('.current-song-title');
    const closeMusicPanel = document.getElementById('close-music-panel');
    const volumeSlider = document.getElementById('volume-slider');
    
    // 音乐列表 - 包含所有检测到的音频文件
    const musicFiles = [
        {
            title: '春日影 - MyGO',
            path: 'static/audio/春日影-MyGO-official.mp3',
            volumeNormalization: 1.0 // 基准音量
        },
        {
            title: '育空河 - 咩栗',
            path: 'static/audio/育空河.wav',
            volumeNormalization: 0.8 // 如果这首歌原本音量较大，设置较小的系数
        },
        {
            title: '致你的骑士 - 呜米',
            path: 'static/audio/致你的骑士.wav',
            volumeNormalization: 1.2 // 如果这首歌原本音量较小，设置较大的系数
        },
        {
            title: '空の箱 - 井芹仁菜.河原木桃香',
            path: 'static/audio/空の箱.井芹仁菜.河原木桃香.mp3',
            volumeNormalization: 1.2 // 如果这首歌原本音量较小，设置较大的系数
        },
        // 如果有更多音频文件，可以继续添加，并为每首歌设置适当的音量标准化系数
    ];
    
    // 初始状态设置
    let isPlaying = false;
    let currentMusicIndex = 0;
    let isAutoPlay = true; // 是否自动播放下一首
    
    // 本地存储键名
    const STORAGE_KEYS = {
        CURRENT_INDEX: 'music_current_index',
        CURRENT_TIME: 'music_current_time',
        IS_PLAYING: 'music_is_playing',
        VOLUME: 'music_volume'
    };
    
    // 检查鼠标是否在元素上
    function isMouseOverElement(element) {
        const rect = element.getBoundingClientRect();
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        
        return (
            mouseX >= rect.left &&
            mouseX <= rect.right &&
            mouseY >= rect.top &&
            mouseY <= rect.bottom
        );
    }
    
    // 初始化音乐播放器
    function initMusicPlayer() {
        // 确保音乐列表不为空
        if (musicFiles.length === 0) {
            console.error('没有可播放的音乐文件');
            return;
        }
        
        // 从本地存储加载播放状态
        loadPlaybackState();
        
        // 加载音乐
        loadMusic(currentMusicIndex);
        
        // 生成音乐列表
        renderMusicList();
        
        // 添加事件监听器
        setupEventListeners();
        
        // 设置音量
        setVolume();
        
        // 尝试自动播放
        tryAutoPlay();
        
        console.log('音乐播放器初始化完成');
    }
    
    // 从本地存储加载播放状态
    function loadPlaybackState() {
        // 加载当前音乐索引
        const savedIndex = localStorage.getItem(STORAGE_KEYS.CURRENT_INDEX);
        if (savedIndex !== null) {
            currentMusicIndex = parseInt(savedIndex);
            // 确保索引在有效范围内
            if (currentMusicIndex < 0 || currentMusicIndex >= musicFiles.length) {
                currentMusicIndex = 0;
            }
        }
        
        // 加载是否正在播放
        const savedIsPlaying = localStorage.getItem(STORAGE_KEYS.IS_PLAYING);
        if (savedIsPlaying !== null) {
            isPlaying = savedIsPlaying === 'true';
        }
        
        // 加载音量设置
        const savedVolume = localStorage.getItem(STORAGE_KEYS.VOLUME);
        if (savedVolume !== null) {
            volumeSlider.value = savedVolume;
        }
        
        console.log('从本地存储加载播放状态:', { currentMusicIndex, isPlaying });
    }
    
    // 保存播放状态到本地存储
    function savePlaybackState() {
        localStorage.setItem(STORAGE_KEYS.CURRENT_INDEX, currentMusicIndex.toString());
        localStorage.setItem(STORAGE_KEYS.CURRENT_TIME, backgroundMusic.currentTime.toString());
        localStorage.setItem(STORAGE_KEYS.IS_PLAYING, isPlaying.toString());
        localStorage.setItem(STORAGE_KEYS.VOLUME, volumeSlider.value);
        
        console.log('保存播放状态到本地存储:', { 
            currentMusicIndex, 
            currentTime: backgroundMusic.currentTime,
            isPlaying,
            volume: volumeSlider.value
        });
    }
    
    // 加载指定索引的音乐
    function loadMusic(index) {
        if (musicFiles.length === 0) {
            currentSongTitle.textContent = '没有可播放的音乐';
            return;
        }
        
        // 确保索引在有效范围内
        if (index < 0) index = musicFiles.length - 1;
        if (index >= musicFiles.length) index = 0;
        
        currentMusicIndex = index;
        const music = musicFiles[currentMusicIndex];
        
        console.log('加载音乐:', music.title, music.path);
        
        // 更新音频源
        backgroundMusic.src = music.path;
        backgroundMusic.load();
        
        // 更新当前播放歌曲标题
        currentSongTitle.textContent = music.title;
        
        // 更新音乐列表中的活动项
        updateActiveItem();
        
        // 总是从头开始播放新歌曲
        backgroundMusic.currentTime = 0;
        
        // 应用音量标准化
        applyVolumeNormalization();
        
        // 保存当前索引到本地存储
        savePlaybackState();
    }
    
    // 应用音量标准化
    function applyVolumeNormalization() {
        const music = musicFiles[currentMusicIndex];
        const baseVolume = parseFloat(volumeSlider.value) / 100;
        
        // 如果定义了音量标准化系数，则应用它
        if (music.volumeNormalization !== undefined) {
            const normalizedVolume = baseVolume * music.volumeNormalization;
            // 确保音量在0-1范围内
            backgroundMusic.volume = Math.min(Math.max(normalizedVolume, 0), 1);
            console.log('应用音量标准化:', music.title, '原始音量:', baseVolume, '标准化系数:', music.volumeNormalization, '最终音量:', backgroundMusic.volume);
        } else {
            backgroundMusic.volume = baseVolume;
        }
    }
    
    // 尝试自动播放
    function tryAutoPlay() {
        // 检查是否应该自动播放
        const savedIsPlaying = localStorage.getItem(STORAGE_KEYS.IS_PLAYING);
        if (savedIsPlaying === 'true') {
            console.log('尝试自动播放');
            
            // 检查浏览器是否允许自动播放
            const autoPlayAllowed = checkAutoPlayPolicy();
            
            if (autoPlayAllowed) {
                // 如果浏览器可能允许自动播放，直接尝试
                playMusic();
            } else {
                // 如果浏览器可能不允许自动播放，设置状态但不播放
                console.log('浏览器可能阻止自动播放，等待用户交互');
                isPlaying = true; // 设置为播放状态，但实际上还没有播放
                updatePlayButton();
                
                // 添加一次性点击事件监听器，在用户首次交互时开始播放
                const startPlayback = function() {
                    if (isPlaying) { // 只有当状态为播放时才尝试播放
                        playMusic();
                    }
                    document.removeEventListener('click', startPlayback);
                    document.removeEventListener('keydown', startPlayback);
                    document.removeEventListener('touchstart', startPlayback);
                };
                
                document.addEventListener('click', startPlayback, { once: true });
                document.addEventListener('keydown', startPlayback, { once: true });
                document.addEventListener('touchstart', startPlayback, { once: true });
                
                // 显示提示，告知用户需要交互才能播放音乐
                const notification = document.createElement('div');
                notification.style.position = 'fixed';
                notification.style.bottom = '70px';
                notification.style.right = '20px';
                notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                notification.style.color = 'white';
                notification.style.padding = '10px';
                notification.style.borderRadius = '5px';
                notification.style.zIndex = '1001';
                notification.style.fontSize = '14px';
                notification.style.maxWidth = '300px';
                notification.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
                notification.style.animation = 'fadeIn 0.5s, fadeOut 0.5s 5s forwards';
                notification.textContent = '点击页面任意位置开始播放背景音乐';
                
                // 添加动画样式
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes fadeOut {
                        from { opacity: 1; }
                        to { opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
                
                document.body.appendChild(notification);
                
                // 5秒后自动移除提示
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 5500);
            }
        }
    }
    
    // 检查浏览器的自动播放策略
    function checkAutoPlayPolicy() {
        // 检测浏览器是否可能允许自动播放
        // 这只是一个启发式方法，不能100%准确
        const isChrome = navigator.userAgent.indexOf('Chrome') > -1;
        const isSafari = navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') === -1;
        const isFirefox = navigator.userAgent.indexOf('Firefox') > -1;
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        // iOS和Safari通常阻止自动播放
        if (isIOS || isSafari) {
            return false;
        }
        
        // 其他浏览器可能允许静音自动播放
        return true;
    }
    
    // 播放音乐
    function playMusic() {
        // 确保已经设置了音频源
        if (!backgroundMusic.src) {
            loadMusic(currentMusicIndex);
        }
        
        console.log('尝试播放音乐');
        
        // 尝试先静音播放，然后恢复音量（绕过某些浏览器的自动播放限制）
        const originalVolume = backgroundMusic.volume;
        backgroundMusic.volume = 0;
        
        // 直接尝试播放
        const playPromise = backgroundMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // 播放成功，恢复音量
                setTimeout(() => {
                    backgroundMusic.volume = originalVolume;
                }, 100);
                
                console.log('音乐播放成功');
                isPlaying = true;
                updatePlayButton();
                savePlaybackState();
            }).catch(error => {
                // 播放失败
                console.error('音乐播放失败:', error);
                
                // 恢复原始音量设置
                backgroundMusic.volume = originalVolume;
                
                // 添加多种用户交互事件监听器，在用户下次交互时尝试播放
                const playOnInteraction = function() {
                    backgroundMusic.play()
                        .then(() => {
                            console.log('用户交互后音乐播放成功');
                            isPlaying = true;
                            updatePlayButton();
                            savePlaybackState();
                        })
                        .catch(e => console.error('即使在用户交互后也无法播放音乐:', e));
                    
                    // 移除所有事件监听器
                    document.removeEventListener('click', playOnInteraction);
                    document.removeEventListener('keydown', playOnInteraction);
                    document.removeEventListener('touchstart', playOnInteraction);
                };
                
                document.addEventListener('click', playOnInteraction);
                document.addEventListener('keydown', playOnInteraction);
                document.addEventListener('touchstart', playOnInteraction);
                
                isPlaying = false;
                updatePlayButton();
                savePlaybackState();
            });
        }
    }
    
    // 暂停音乐
    function pauseMusic() {
        backgroundMusic.pause();
        isPlaying = false;
        updatePlayButton();
        savePlaybackState();
        console.log('音乐已暂停');
    }
    
    // 更新播放按钮状态
    function updatePlayButton() {
        if (isPlaying) {
            musicControl.classList.add('playing');
            musicControl.title = '暂停背景音乐';
        } else {
            musicControl.classList.remove('playing');
            musicControl.title = '播放背景音乐';
        }
    }
    
    // 播放下一首
    function playNext() {
        loadMusic(currentMusicIndex + 1);
        playMusic();
    }
    
    // 播放上一首
    function playPrev() {
        loadMusic(currentMusicIndex - 1);
        playMusic();
    }
    
    // 设置音量
    function setVolume() {
        // 应用音量标准化
        applyVolumeNormalization();
        console.log('设置音量:', volumeSlider.value / 100, '标准化后音量:', backgroundMusic.volume);
        savePlaybackState();
    }
    
    // 渲染音乐列表
    function renderMusicList() {
        musicList.innerHTML = '';
        
        musicFiles.forEach((music, index) => {
            const musicItem = document.createElement('div');
            musicItem.className = 'music-item';
            musicItem.dataset.index = index;
            
            const icon = document.createElement('span');
            icon.className = 'music-item-icon';
            icon.innerHTML = index === currentMusicIndex ? '<i class="fas fa-music"></i>' : '';
            
            const title = document.createElement('span');
            title.className = 'music-item-title';
            title.textContent = music.title;
            
            musicItem.appendChild(icon);
            musicItem.appendChild(title);
            
            // 点击播放指定音乐
            musicItem.addEventListener('click', function() {
                const selectedIndex = parseInt(this.dataset.index);
                loadMusic(selectedIndex);
                playMusic();
            });
            
            musicList.appendChild(musicItem);
        });
        
        console.log('音乐列表已渲染');
    }
    
    // 更新活动项
    function updateActiveItem() {
        const items = musicList.querySelectorAll('.music-item');
        items.forEach((item, index) => {
            const icon = item.querySelector('.music-item-icon');
            
            if (index === currentMusicIndex) {
                item.classList.add('active');
                icon.innerHTML = isPlaying ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-music"></i>';
            } else {
                item.classList.remove('active');
                icon.innerHTML = '';
            }
        });
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        // 全局变量用于跟踪鼠标状态
        let isMouseOverControl = false;
        let isMouseOverPanel = false;
        let hideTimeout = null;
        
        // 检查是否应该显示或隐藏面板
        function updatePanelVisibility() {
            if (isMouseOverControl || isMouseOverPanel) {
                musicPlayerPanel.style.display = 'block';
                if (hideTimeout) {
                    clearTimeout(hideTimeout);
                    hideTimeout = null;
                }
            } else {
                // 设置延迟，避免鼠标移动过程中的闪烁
                hideTimeout = setTimeout(function() {
                    musicPlayerPanel.style.display = 'none';
                }, 300); // 增加延迟时间
            }
        }
        
        // 鼠标悬停在音乐控制按钮上时显示音乐播放器面板
        musicControl.addEventListener('mouseenter', function() {
            isMouseOverControl = true;
            updatePanelVisibility();
        });
        
        // 鼠标离开音乐控制按钮
        musicControl.addEventListener('mouseleave', function() {
            isMouseOverControl = false;
            updatePanelVisibility();
        });
        
        // 鼠标点击音乐控制按钮时切换播放/暂停
        musicControl.addEventListener('click', function(event) {
            event.stopPropagation(); // 防止事件冒泡
            
            console.log('音乐控制按钮被点击', isPlaying ? '暂停' : '播放');
            
            if (isPlaying) {
                pauseMusic();
            } else {
                playMusic();
            }
        });
        
        // 鼠标进入音乐播放器面板时保持显示
        musicPlayerPanel.addEventListener('mouseenter', function() {
            isMouseOverPanel = true;
            updatePanelVisibility();
        });
        
        // 鼠标离开音乐播放器面板时可能隐藏
        musicPlayerPanel.addEventListener('mouseleave', function() {
            isMouseOverPanel = false;
            updatePanelVisibility();
        });
        
        // 关闭音乐播放器面板
        closeMusicPanel.addEventListener('click', function(event) {
            event.stopPropagation(); // 防止事件冒泡
            musicPlayerPanel.style.display = 'none';
        });
        
        // 音乐结束时播放下一首
        backgroundMusic.addEventListener('ended', function() {
            console.log('当前音乐播放结束');
            if (isAutoPlay) {
                console.log('自动播放下一首');
                playNext();
            } else {
                isPlaying = false;
                updatePlayButton();
                savePlaybackState();
            }
        });
        
        // 音量滑块变化时更新音量
        volumeSlider.addEventListener('input', setVolume);
        
        // 定期保存当前播放进度
        setInterval(function() {
            if (isPlaying) {
                savePlaybackState();
            }
        }, 5000); // 每5秒保存一次
        
        // 音频播放时间更新时更新活动项
        backgroundMusic.addEventListener('timeupdate', function() {
            // 只在播放状态下更新活动项
            if (isPlaying) {
                updateActiveItem();
            }
        });
        
        // 添加键盘快捷键控制
        document.addEventListener('keydown', function(event) {
            // 检查是否在输入框中
            const isInputActive = document.activeElement.tagName === 'INPUT' || 
                                document.activeElement.tagName === 'TEXTAREA';
            
            if (!isInputActive) {
                switch (event.code) {
                    case 'Space': // 空格键：播放/暂停
                        event.preventDefault();
                        if (isPlaying) {
                            pauseMusic();
                        } else {
                            playMusic();
                        }
                        break;
                    case 'ArrowRight': // 右箭头：下一首
                        event.preventDefault();
                        playNext();
                        break;
                    case 'ArrowLeft': // 左箭头：上一首
                        event.preventDefault();
                        playPrev();
                        break;
                    case 'ArrowUp': // 上箭头：增加音量
                        event.preventDefault();
                        volumeSlider.value = Math.min(parseInt(volumeSlider.value) + 10, 100);
                        setVolume();
                        break;
                    case 'ArrowDown': // 下箭头：减小音量
                        event.preventDefault();
                        volumeSlider.value = Math.max(parseInt(volumeSlider.value) - 10, 0);
                        setVolume();
                        break;
                }
            }
        });
        
        // 监听音频加载错误
        backgroundMusic.addEventListener('error', function(e) {
            console.error('音频加载错误:', e);
            alert('音频文件加载失败，请检查文件路径是否正确');
        });
        
        // 页面卸载前保存播放状态
        window.addEventListener('beforeunload', function() {
            savePlaybackState();
        });
        
        // 添加页面可见性变化监听器，当页面从隐藏变为可见时尝试恢复播放
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden && isPlaying) {
                console.log('页面变为可见，尝试恢复播放');
                backgroundMusic.play().catch(function(error) {
                    console.error('恢复播放失败:', error);
                });
            } else if (document.hidden && isPlaying) {
                // 可选：当页面隐藏时暂停播放，取消注释以启用
                // console.log('页面隐藏，暂停播放');
                // backgroundMusic.pause();
                // 注意：我们不改变isPlaying状态，这样当页面再次可见时会尝试恢复播放
            }
        });
    }
    
    // 初始化音乐播放器
    initMusicPlayer();
    
    // 导出到全局，方便调试
    window.musicPlayer = {
        play: playMusic,
        pause: pauseMusic,
        next: playNext,
        prev: playPrev,
        setVolume: function(value) {
            volumeSlider.value = value;
            setVolume();
        }
    };
});