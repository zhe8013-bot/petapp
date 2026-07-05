// PetStory App Core Logic

const app = {
  // 全局状态数据
  state: {
    pet: {
      name: "奶盖",
      breed: "马尔济斯",
      age: "2岁",
      weight: 6.20,
      birth: "2023-05-12",
      color: "奶油白色",
      gender: "男孩子",
      chip: "981000987654321",
      blood: "纯种 (CKU)",
      days: 428
    },
    // 保存前一个激活的Tab，以便返回
    previousTab: 'home',
    activeTab: 'home',
    // 模拟的回忆列表
    memories: [
      {
        id: 1,
        title: "午后的慵懒时光",
        date: "2025.10.24",
        weather: "☀️",
        location: "阳光公园",
        mood: "开心",
        desc: "阳光透过树叶洒在身上，奶盖在落叶间追逐着飘动的小影子，那一刻，时间都变得温柔了。",
        moodText: "心情美美",
        image: "dog_run.png",
        likes: 128,
        liked: true,
        comments: 16,
        month: "10"
      },
      {
        id: 2,
        title: "睡成一团的小奶盖",
        date: "2025.10.05",
        weather: "☁️",
        location: "客厅沙发",
        mood: "慵懒",
        desc: "玩了一下午，终于累到睡成一团。呼吸轻轻的，毛茸茸的狗肚子一起一伏，好想时间在这一刻静止呀。",
        moodText: "暖乎乎的",
        image: "dog_sit.png",
        likes: 96,
        liked: false,
        comments: 10,
        month: "10"
      }
    ]
  },

  // 初始化
  init() {
    this.updateTime();
    setInterval(() => this.updateTime(), 60000); // 每一分钟更新时间

    // 初始化 Lucide 图标
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // 渲染图表
    this.renderCharts();

    // 同步初始化界面数据
    this.syncDOMData();

    // 绑定表单提交事件，防止默认刷新
    document.getElementById('edit-profile-form').addEventListener('submit', (e) => this.saveProfile(e));
    document.getElementById('new-memory-form').addEventListener('submit', (e) => this.saveMemory(e));

    // 初始化看板娘小猫对话
    this.initPetWidget();
  },

  // 状态栏时间更新
  updateTime() {
    const timeEl = document.getElementById('status-time');
    if (timeEl) {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      hours = hours < 10 ? '0' + hours : hours;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      timeEl.textContent = `${hours}:${minutes}`;
    }
  },

  // 切换选项卡
  switchTab(tabId) {
    if (this.state.activeTab === tabId) return;

    // 记录前一个页面
    this.state.previousTab = this.state.activeTab;
    this.state.activeTab = tabId;

    // 获取所有页面元素
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
      page.classList.remove('active');
    });

    // 激活对应页面
    const targetPage = document.getElementById(`${tabId}-page`);
    if (targetPage) {
      targetPage.classList.add('active');
      // 如果进入的页面是可滚动的，滚动回顶部
      const scrollable = targetPage.querySelector('.scrollable-content');
      if (scrollable) scrollable.scrollTop = 0;
    }

    // 更新底部导航栏样式
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.classList.remove('active');
    });

    // 根据切换的ID激活底部Tab按钮
    let tabIndex = 0;
    if (tabId === 'home') tabIndex = 0;
    else if (tabId === 'health') tabIndex = 1;
    else if (tabId === 'life') tabIndex = 2;
    else if (tabId === 'memories') tabIndex = 3;
    else if (tabId === 'profile') tabIndex = 4;

    navItems[tabIndex].classList.add('active');

    // 重新渲染该页面的 SVG 图表，触发动画
    this.renderCharts();
  },

  // 档案页面的返回按钮逻辑
  goBackFromProfile() {
    // 返回切换前的页面
    this.switchTab(this.state.previousTab);
  },

  // 完成提醒
  completeReminder(btn) {
    btn.innerHTML = `<i data-lucide="check" style="width: 12px; height: 12px; stroke-width: 3px;"></i> 已完成`;
    btn.classList.add('done');
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // 寻找父级卡片并添加盖章类，触发猫爪章印章动画
    const cardEl = btn.closest('.reminder-card');
    if (cardEl) {
      cardEl.classList.add('completed-with-stamp');
    }

    // 播放微小点击缩放动画
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => {
      btn.style.transform = 'none';
    }, 150);
  },

  // 补货逻辑
  refillSupplies() {
    const list = [
      { id: 'supply-food', label: '猫粮', restDays: 30, val: 100, barColor: '#64a354' },
      { id: 'supply-shampoo', label: '沐浴露', restDays: 60, val: 100, barColor: '#64a354' },
      { id: 'supply-can', label: '主食罐头', restDays: 45, val: 100, barColor: '#64a354' }
    ];

    list.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) {
        const daysEl = el.querySelector('.days');
        const subEl = el.querySelector('.item-sub');
        const progressEl = el.querySelector('.progress-bar');

        if (daysEl) {
          daysEl.textContent = `预计剩余 ${item.restDays} 天`;
          daysEl.style.color = '#64a354';
        }
        if (subEl) {
          subEl.textContent = `当前余量 ${item.val}%`;
        }
        if (progressEl) {
          progressEl.style.width = `${item.val}%`;
          progressEl.style.background = item.barColor;
        }
      }
    });

    alert('补货完成！用品状态已恢复满格 🛒');
  },

  // 点赞逻辑
  toggleLike(btn, defaultCount) {
    const icon = btn.querySelector('i');
    const label = btn.querySelector('.count');
    let currentCount = parseInt(label.textContent);

    btn.classList.toggle('liked');
    const isLiked = btn.classList.contains('liked');

    if (isLiked) {
      currentCount++;
      btn.style.color = '#c97951';
      icon.style.fill = '#c97951';
      icon.setAttribute('data-lucide', 'heart');
    } else {
      currentCount--;
      btn.style.color = 'var(--text-secondary)';
      icon.style.fill = 'none';
    }
    label.textContent = currentCount;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  // 弹窗控制
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  },

  // 打开编辑资料
  openEditProfileModal() {
    document.getElementById('input-name').value = this.state.pet.name;
    document.getElementById('input-breed').value = this.state.pet.breed;
    document.getElementById('input-age').value = this.state.pet.age;
    document.getElementById('input-weight').value = this.state.pet.weight;
    document.getElementById('input-birth').value = this.state.pet.birth;
    document.getElementById('input-color').value = this.state.pet.color;
    document.getElementById('input-gender').value = this.state.pet.gender;
    document.getElementById('input-chip').value = this.state.pet.chip;
    document.getElementById('input-blood').value = this.state.pet.blood;
    this.openModal('edit-profile-modal');
  },

  // 保存资料
  saveProfile(e) {
    e.preventDefault();
    this.state.pet.name = document.getElementById('input-name').value;
    this.state.pet.breed = document.getElementById('input-breed').value;
    this.state.pet.age = document.getElementById('input-age').value;
    this.state.pet.weight = parseFloat(document.getElementById('input-weight').value);
    this.state.pet.birth = document.getElementById('input-birth').value;
    this.state.pet.color = document.getElementById('input-color').value;
    this.state.pet.gender = document.getElementById('input-gender').value;
    this.state.pet.chip = document.getElementById('input-chip').value;
    this.state.pet.blood = document.getElementById('input-blood').value;

    this.syncDOMData();
    this.closeModal('edit-profile-modal');
    this.renderCharts(); // 重新绘制图表（可能有体重变化）

    // 提示
    alert('宠物资料保存成功！🐾');
  },

  // 同步状态数据到页面
  syncDOMData() {
    // 同步名字
    document.querySelectorAll('.pet-name-text').forEach(el => el.textContent = this.state.pet.name);
    // 同步年龄
    document.querySelectorAll('.pet-age-text').forEach(el => el.textContent = this.state.pet.age);
    // 同步品种
    document.querySelectorAll('.pet-breed-text').forEach(el => el.textContent = this.state.pet.breed);
    // 同步陪伴天数
    document.querySelectorAll('.pet-days-text').forEach(el => el.textContent = this.state.pet.days);
    // 同步体重
    document.querySelectorAll('.pet-weight-text').forEach(el => el.textContent = this.state.pet.weight.toFixed(2));

    // 同步档案详情项
    const birthEl = document.querySelector('.pet-birth-text');
    if (birthEl) birthEl.textContent = this.state.pet.birth;

    const colorEl = document.querySelector('.pet-color-text');
    if (colorEl) colorEl.textContent = this.state.pet.color;

    const genderEl = document.querySelector('.pet-gender-text');
    if (genderEl) genderEl.textContent = this.state.pet.gender;

    const chipEl = document.querySelector('.pet-chip-text');
    if (chipEl) chipEl.textContent = this.state.pet.chip;

    const bloodEl = document.querySelector('.pet-blood-text');
    if (bloodEl) bloodEl.textContent = this.state.pet.blood;
  },

  // 打开新回忆弹窗
  openNewMemoryModal() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('input-mem-date').value = today;
    document.getElementById('input-mem-title').value = '';
    document.getElementById('input-mem-loc').value = '';
    document.getElementById('input-mem-mood').value = '';
    document.getElementById('input-mem-desc').value = '';
    this.openModal('new-memory-modal');
  },

  // 保存回忆
  saveMemory(e) {
    e.preventDefault();
    const title = document.getElementById('input-mem-title').value;
    const dateInput = document.getElementById('input-mem-date').value; // yyyy-mm-dd
    const weather = document.getElementById('input-mem-weather').value;
    const location = document.getElementById('input-mem-loc').value;
    const mood = document.getElementById('input-mem-mood').value;
    const desc = document.getElementById('input-mem-desc').value;
    const imgSelect = document.getElementById('input-mem-img').value;

    // 格式化日期：yyyy.mm.dd
    const dateParts = dateInput.split('-');
    const formattedDate = `${dateParts[0]}.${dateParts[1]}.${dateParts[2]}`;
    const month = dateParts[1];

    const newMemory = {
      id: Date.now(),
      title: title,
      date: `${formattedDate} ${weather}`,
      weather: weather,
      location: location,
      mood: mood,
      desc: desc,
      moodText: `心情${mood}`,
      image: imgSelect,
      likes: 0,
      liked: false,
      comments: 0,
      month: month
    };

    // 插入到列表最前
    this.state.memories.unshift(newMemory);

    // 渲染回忆卡片
    this.renderMemoriesList();

    this.closeModal('new-memory-modal');

    // 滚动到顶部并激活全部过滤
    const filterAll = document.querySelector('.month-filter-scroll .filter-pill');
    if (filterAll) {
      filterAll.click();
    }

    alert('新回忆发布成功！📸');
  },

  // 渲染回忆列表
  renderMemoriesList() {
    const container = document.getElementById('memories-list-container');
    if (!container) return;

    let html = '';
    this.state.memories.forEach((mem, index) => {
      // 样式交替使用（曲别针或双面胶）
      const decorHtml = index % 2 === 0
        ? '<div class="paperclip"></div>'
        : '<div class="tape-deco"></div>';

      // 拍立得索引角标或爱心角标
      const indexBadge = index % 2 === 0
        ? `<div class="love-badge"><i data-lucide="heart" style="width: 10px; height: 10px; fill: #c97951;"></i> 最爱回忆</div>`
        : `<div class="index-badge">3</div><span class="age-badge">yrs</span>`;

      html += `
        <div class="polaroid-card memory-item" data-month="${mem.month}">
          ${decorHtml}
          <div class="polaroid-photo-frame">
            <img src="${mem.image}" alt="照片">
            ${indexBadge}
            ${index % 2 !== 0 ? '' : `<span class="age-badge">奶球 ${this.state.pet.age}</span>`}
          </div>
          <div class="polaroid-content-card">
            <div class="meta-row">
              <span class="date">${mem.date}</span>
            </div>
            <h3 class="title">${mem.title}</h3>
            <div class="tag-chips">
              <span class="chip">📍 ${mem.location}</span>
              <span class="chip">😀 ${mem.mood}</span>
            </div>
            <p class="desc">${mem.desc}</p>
            <div class="mood-row">
              <span class="mood-left">❤️ ${mem.moodText}</span>
              <span class="mood-right">奶球 ${this.state.pet.age}</span>
            </div>
            <div class="stats-footer">
              <div class="stats-left">
                <span class="stat-btn ${mem.liked ? 'liked' : ''}" onclick="app.toggleLike(this, ${mem.likes})">
                  <i data-lucide="heart" style="width: 14px; height: 14px; ${mem.liked ? 'fill: #c97951;' : ''}"></i> <span class="count">${mem.likes}</span>
                </span>
                <span class="stat-btn" onclick="alert('评论功能开发中~')">
                  <i data-lucide="message-square" style="width: 14px; height: 14px;"></i> ${mem.comments}
                </span>
              </div>
              <i data-lucide="share-2" class="btn-share" style="width: 14px; height: 14px;" onclick="alert('分享成功！')"></i>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  // 过滤回忆
  filterMemories(month, pillElement) {
    // 切换 active Pill
    const pills = document.querySelectorAll('.month-filter-scroll .filter-pill');
    pills.forEach(pill => pill.classList.remove('active'));
    pillElement.classList.add('active');

    // 过滤卡片
    const cards = document.querySelectorAll('#memories-list-container .memory-item');
    cards.forEach(card => {
      const cardMonth = card.getAttribute('data-month');
      if (month === 'all' || cardMonth === month) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  },

  // === 绘制所有 SVG 图表 ===
  renderCharts() {
    // 1. 首页：活动时长 Sparkline (绿线)
    this.drawSparkline('chart-activity', [30, 35, 32, 45, 38, 42], '#598b4c', true);

    // 2. 首页：体重趋势 Mini Sparkline (橙线)
    this.drawSparkline('chart-weight-mini', [3.9, 3.88, 3.84, 3.87, 3.82, 3.85], '#e08f65', false);

    // 3. 首页：本月消耗 Mini 柱状图 (橙色渐变条)
    this.drawBarChart('chart-spend', [20, 25, 18, 35, 45, 32, 50, 40, 55, 60], '#f5bda5');

    // 4. 生活页：体重趋势 30天 交互折线图 (平滑曲线带阴影与高亮圈点)
    this.drawSmoothWeightCurve('life-weight-chart');

    // 5. 档案页：体重趋势 Mini 曲线 (棕色线)
    this.drawSparkline('archive-weight-spark', [3.9, 3.88, 3.84, 3.87, 3.82, 3.85], '#5c4436', false);
  },

  // 绘制迷你曲线图
  drawSparkline(containerId, dataPoints, strokeColor, fill = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = container.clientWidth || 100;
    const height = container.clientHeight || 28;

    const max = Math.max(...dataPoints) * 1.05;
    const min = Math.min(...dataPoints) * 0.95;
    const range = max - min;

    const stepX = width / (dataPoints.length - 1);

    // 生成折线点
    const points = dataPoints.map((val, idx) => {
      const x = idx * stepX;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return { x, y };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    // 使用贝塞尔平滑曲线连接
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX1 = prev.x + stepX / 2;
      const cpY1 = prev.y;
      const cpX2 = curr.x - stepX / 2;
      const cpY2 = curr.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }

    let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow:visible;">`;

    // 填充渐变底色
    if (fill) {
      const gradientId = `grad-${containerId}`;
      svgContent += `
        <defs>
          <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path d="${pathD} L ${points[points.length-1].x} ${height} L 0 ${height} Z" fill="url(#${gradientId})" />
      `;
    }

    // 绘制曲线
    svgContent += `<path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" />`;

    // 绘制最后一个交点的小圆点
    const lastPoint = points[points.length - 1];
    svgContent += `<circle cx="${lastPoint.x}" cy="${lastPoint.y}" r="3" fill="${strokeColor}" />`;

    svgContent += `</svg>`;
    container.innerHTML = svgContent;
  },

  // 绘制迷你柱状图
  drawBarChart(containerId, dataValues, barColor) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = container.clientWidth || 100;
    const height = container.clientHeight || 28;

    const max = Math.max(...dataValues);
    const stepX = width / dataValues.length;
    const barWidth = Math.max(stepX * 0.5, 3);

    let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

    dataValues.forEach((val, idx) => {
      const barHeight = (val / max) * (height - 4);
      const x = idx * stepX + (stepX - barWidth) / 2;
      const y = height - barHeight;
      // 用圆角柱子
      svgContent += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="${barWidth/2}" fill="${barColor}" opacity="${0.4 + (idx / dataValues.length) * 0.6}" />`;
    });

    svgContent += `</svg>`;
    container.innerHTML = svgContent;
  },

  // 绘制生活页大体重图（平滑大曲线，还原截图 2：带渐变、4.2 kg 高亮标记、网格线和X轴刻度）
  drawSmoothWeightCurve(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = container.clientWidth || 200;
    const height = container.clientHeight || 90;

    // 刻度设置
    const yMaxVal = 4.5;
    const yMinVal = 3.0;
    const yRange = yMaxVal - yMinVal;

    // 网格线绘制（Y轴：3.0, 3.5, 4.0, 4.5）
    let gridHtml = '';
    const gridVals = [3.0, 3.5, 4.0, 4.5];
    gridVals.forEach(v => {
      const y = height - 20 - ((v - yMinVal) / yRange) * (height - 35);
      // 网格横线（虚线）
      gridHtml += `<line x1="30" y1="${y}" x2="${width - 15}" y2="${y}" stroke="#f1ede4" stroke-width="1" stroke-dasharray="2,2" />`;
      // Y轴刻度字
      gridHtml += `<text x="8" y="${y + 4}" fill="var(--text-tertiary)" font-size="9.5" font-family="Outfit" font-weight="600">${v.toFixed(1)}</text>`;
    });

    // 数据点：9月28日 (3.5kg), 10月13日 (4.2kg), 10月28日 (4.1kg)
    const pointsData = [
      { date: '9月28日', weight: 3.5, x: 45 },
      { date: '10月13日', weight: 4.2, x: width / 2 },
      { date: '10月28日', weight: 4.05, x: width - 35 } // 对应 4.1 左右，折线稍降
    ];

    // 将物理坐标转化为画布坐标
    const points = pointsData.map(pt => {
      const y = height - 20 - ((pt.weight - yMinVal) / yRange) * (height - 35);
      return { x: pt.x, y, weight: pt.weight, date: pt.date };
    });

    // 绘制三次贝塞尔曲线
    let pathD = `M ${points[0].x} ${points[0].y}`;

    // 平滑曲线核心：计算控制点
    const cpX1 = points[0].x + (points[1].x - points[0].x) * 0.45;
    const cpY1 = points[0].y - 5;
    const cpX2 = points[1].x - (points[1].x - points[0].x) * 0.45;
    const cpY2 = points[1].y - 8;

    const cpX3 = points[1].x + (points[2].x - points[1].x) * 0.45;
    const cpY3 = points[1].y + 8;
    const cpX4 = points[2].x - (points[2].x - points[1].x) * 0.45;
    const cpY4 = points[2].y;

    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[1].x} ${points[1].y}`;
    pathD += ` C ${cpX3} ${cpY3}, ${cpX4} ${cpY4}, ${points[2].x} ${points[2].y}`;

    // 阴影面积填充
    const fillPathD = `${pathD} L ${points[2].x} ${height - 15} L ${points[0].x} ${height - 15} Z`;

    let svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow:visible;">
        <defs>
          <!-- 面积渐变 -->
          <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#e08f65" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#e08f65" stop-opacity="0"/>
          </linearGradient>
        </defs>

        <!-- 网格线 -->
        ${gridHtml}

        <!-- 填充色 -->
        <path d="${fillPathD}" fill="url(#area-grad)" />

        <!-- 曲线 -->
        <path d="${pathD}" fill="none" stroke="#e08f65" stroke-width="2.5" stroke-linecap="round" />
    `;

    // 绘制数据点与X轴刻度
    points.forEach((pt, idx) => {
      // X轴文字刻度
      svg += `<text x="${pt.x}" y="${height - 2}" fill="var(--text-tertiary)" font-size="9" font-weight="600" text-anchor="middle">${pt.date}</text>`;

      // 普通圆点
      if (idx !== 1) {
        svg += `
          <circle cx="${pt.x}" cy="${pt.y}" r="4" fill="#ffffff" stroke="#e08f65" stroke-width="2" />
        `;
      } else {
        // 高亮的数据点 (4.2 kg)
        svg += `
          <!-- 选中高亮的双重圆圈 -->
          <circle cx="${pt.x}" cy="${pt.y}" r="6" fill="#e08f65" />
          <circle cx="${pt.x}" cy="${pt.y}" r="3" fill="#ffffff" />

          <!-- 黑色圆角气泡 -->
          <g transform="translate(${pt.x - 22}, ${pt.y - 30})">
            <rect x="0" y="0" width="44" height="18" rx="6" fill="#3d352e" />
            <text x="22" y="12" fill="#ffffff" font-size="9" font-family="Outfit" font-weight="700" text-anchor="middle">4.2 kg</text>
          </g>
        `;
      }
    });

    svg += `</svg>`;
    container.innerHTML = svg;
  },

  // 看板娘属性和计时器
  petWidgetTimer: null,
  petBubbleTimer: null,
  petPhrases: [],
  currentPhraseIndex: 0,

  // 初始化看板娘
  initPetWidget() {
    const { name, days, weight } = this.state.pet;
    this.petPhrases = [
      `喵呜~ 铲屎官今天给${name}准备了什么好吃的？`,
      `我已经陪伴你 ${days} 天啦，超爱你喵~ 🐾`,
      `听说我的体重现在是 ${weight.toFixed(2)}kg，今天有按时喂我喵？`,
      `摸摸我的耳朵，我会开心一整天喵~ ฅ(•ㅅ•)ฅ`,
      `今天天气这么好，要和${name}一起打个盹吗？☀️`,
      `喵~ 记得常去回忆里看看我们的照片哦！`,
      `你今天看起来有点累，要揉揉我的软肚子吗？`,
      `铲屎官要按时下班，回来给${name}开罐头喵！`
    ];

    this.startPetAutoBubble();

    setTimeout(() => {
      this.showPetBubble("喵哈啰！我是奶盖，今天也要开开心心喵~ 🐾");
    }, 1000);
  },

  // 开启自动气泡提示
  startPetAutoBubble() {
    if (this.petWidgetTimer) clearInterval(this.petWidgetTimer);

    this.petWidgetTimer = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * this.petPhrases.length);
      this.currentPhraseIndex = randomIndex;
      this.showPetBubble(this.petPhrases[randomIndex]);
    }, 12000);
  },

  // 显示气泡
  showPetBubble(text) {
    const bubble = document.getElementById('pet-bubble');
    if (!bubble) return;

    bubble.textContent = text;
    bubble.classList.add('active');

    if (this.petBubbleTimer) clearTimeout(this.petBubbleTimer);
    this.petBubbleTimer = setTimeout(() => {
      bubble.classList.remove('active');
    }, 4500);
  },

  // 点击看板娘互动逻辑
  petWidgetTalk() {
    const widget = document.getElementById('cute-pet-widget');
    if (!widget) return;

    widget.classList.remove('wobble-active');
    void widget.offsetWidth; // 触发 reflow
    widget.classList.add('wobble-active');

    const randomIndex = Math.floor(Math.random() * this.petPhrases.length);
    this.currentPhraseIndex = randomIndex;
    this.showPetBubble(this.petPhrases[randomIndex]);

    this.startPetAutoBubble();
  },

  // 摸摸狗狗爱心溅射及物理跳跃
  playChibiClickEffect() {
    const avatar = document.getElementById('pet-avatar');
    if (avatar) {
      avatar.classList.remove('chibi-jumping-anim');
      void avatar.offsetWidth; // reflow
      avatar.classList.add('chibi-jumping-anim');
      setTimeout(() => avatar.classList.remove('chibi-jumping-anim'), 750);
      
      // 让看板娘也跟着吐泡泡夸奖
      this.showPetBubble("摸摸奶盖，奶盖开心得飞起喵~ 💖");
    }

    const container = document.getElementById('chibi-hearts-container');
    if (container) {
      const particleCount = 7;
      for (let i = 0; i < particleCount; i++) {
        const heart = document.createElement('span');
        heart.className = 'heart-particle';
        heart.textContent = '❤️';

        const x = (Math.random() - 0.5) * 120;
        const y = -70 - Math.random() * 80;
        const scale = 0.6 + Math.random() * 0.7;

        heart.style.setProperty('--x', `${x}px`);
        heart.style.setProperty('--y', `${y}px`);
        heart.style.setProperty('--s', scale);

        container.appendChild(heart);

        setTimeout(() => {
          heart.remove();
        }, 800);
      }
    }
  }
};

// 页面加载就绪后自动启动
window.addEventListener('DOMContentLoaded', () => {
  app.init();
});
