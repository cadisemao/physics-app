var UI = (function(){
  var currentPage='home',currentDay=1;

  function showPage(name,data){
    currentPage=name;
    var main=document.getElementById('mainContent');
    var hdr=document.getElementById('headerTitle');
    var sub=document.getElementById('headerSub');
    sub.textContent='';
    switch(name){
      case 'home':hdr.textContent='物理50天冲刺';renderHome(main);break;
      case 'study':hdr.textContent='今日学习';renderStudy(main,data);break;
      case 'formulas':hdr.textContent='公式手册';renderFormulas(main);break;
      case 'stats':hdr.textContent='学习统计';renderStats(main);break;
    }
    document.querySelectorAll('.nav-btn').forEach(function(b){
      b.classList.toggle('active',b.dataset.page===name);
    });
  }

  // ===== Home =====
  function renderHome(container){
    Stats.getDashboard().then(function(d){
      var todayDay=d.currentDay;
      currentDay=todayDay;
      var todayInfo='';
      if(typeof CURRICULUM!=='undefined'&&CURRICULUM[todayDay-1]){
        var t=CURRICULUM[todayDay-1];
        todayInfo='<div class="today-card"><h3>Day '+t.day+' · '+t.title+'</h3><div class="meta">'+t.chapter+' | '+t.concepts.length+'个知识点 | '+t.exercises.length+'道练习</div></div>';
      }
      // Buoyancy weak point highlight
      if(todayDay>=25&&todayDay<=35){
        todayInfo=todayInfo.replace('today-card','today-card weak-card');
      }

      container.innerHTML='<div class="page active">'+
        '<div class="hero-stat">'+
          '<div class="hero-item"><div class="hero-value">'+d.completedDays+'</div><div class="hero-label">已完成</div></div>'+
          '<div class="hero-item"><div class="hero-value">'+(d.totalDays-d.completedDays)+'</div><div class="hero-label">剩余天数</div></div>'+
          '<div class="hero-item"><div class="hero-value">'+d.streak+'</div><div class="hero-label">连续天数</div></div>'+
        '</div>'+
        '<div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:'+d.percent+'%"></div></div>'+
        '<div style="text-align:center;font-size:13px;color:var(--text-secondary)">整体进度 '+d.percent+'%</div>'+
        todayInfo+
        '<button class="btn-start" id="btnStartStudy">开始第 '+todayDay+' 天学习</button>'+
      '</div>';

      document.getElementById('btnStartStudy').addEventListener('click',function(){
        showPage('study',{day:todayDay});
      });
    });
  }

  // ===== Study =====
  function renderStudy(container,data){
    var day=data?data.day:currentDay;
    currentDay=day;
    if(typeof CURRICULUM==='undefined'||!CURRICULUM[day-1]){
      container.innerHTML='<div class="page active"><p>课程数据加载中...</p></div>';return;
    }
    var cur=CURRICULUM[day-1];

    // Day navigation
    var navHtml='<div class="study-nav">';
    for(var i=1;i<=50;i++){
      var cls='study-nav-btn';
      if(i===day)cls+=' active';
      navHtml+='<button class="'+cls+'" data-day="'+i+'">D'+i+'</button>';
    }
    navHtml+='</div>';

    // Concepts
    var conceptsHtml='';
    cur.concepts.forEach(function(c,i){
      conceptsHtml+='<div class="concept-card">'+
        '<h3>📌 '+c.title+'</h3>'+
        '<div class="concept-content">'+c.content+'</div>';
      if(c.formula){
        conceptsHtml+='<div class="formula-box"><div class="formula-main">'+c.formula+'</div>'+
          (c.vars?'<div class="formula-vars">'+c.vars+'</div>':'')+'</div>';
      }
      if(c.keyPoints){
        c.keyPoints.forEach(function(kp){conceptsHtml+='<div class="key-point">💡 '+kp+'</div>';});
      }
      if(c.commonMistakes){
        c.commonMistakes.forEach(function(m){conceptsHtml+='<div class="mistake-point">⚠ '+m+'</div>';});
      }
      conceptsHtml+='</div>';
    });

    // Examples
    var examplesHtml='<h3 style="margin:16px 0 8px;color:var(--accent-orange)">📝 例题精讲</h3>';
    cur.examples.forEach(function(ex,i){
      examplesHtml+='<div class="example-block">'+
        '<div class="example-title" onclick="this.nextElementSibling.classList.toggle(\'open\')">'+
          '<span>例'+(i+1)+': '+ex.question.substring(0,40)+'...</span><span>▼</span></div>'+
        '<div class="example-body">';
      ex.steps.forEach(function(s){examplesHtml+='<div class="example-step">'+s+'</div>';});
      examplesHtml+='<div class="example-answer">✅ 答案: '+ex.answer+'</div></div></div>';
    });

    // Exercises
    var exercisesHtml='<h3 style="margin:16px 0 8px;color:var(--accent-green)">✏ 练习题 ('+cur.exercises.length+'题)</h3>';
    cur.exercises.forEach(function(ex,i){
      exercisesHtml+='<div class="exercise-card" id="ex'+i+'">'+
        '<div class="q"><strong>'+(i+1)+'.</strong> '+ex.question+'</div>'+
        '<button class="btn-answer" onclick="var d=document.getElementById(\'ans'+i+'\');d.classList.toggle(\'show\');this.textContent=d.classList.contains(\'show\')?\'隐藏答案\':\'查看答案\'">查看答案</button>'+
        '<button class="btn-done" onclick="UI.markDone('+day+','+i+')">✓ 已掌握</button>'+
        '<div class="answer-reveal" id="ans'+i+'">'+ex.answer+'</div></div>';
    });

    container.innerHTML='<div class="page active">'+
      navHtml+
      '<h2 style="margin:12px 0">Day '+cur.day+' · '+cur.title+'</h2>'+
      '<div style="color:var(--text-secondary);font-size:13px;margin-bottom:8px">'+cur.chapter+'</div>'+
      conceptsHtml+examplesHtml+exercisesHtml+
      '<button class="btn-start" style="background:var(--accent-green);margin-top:20px" id="btnComplete">✅ 完成今日学习</button>'+
    '</div>';

    // Nav buttons
    container.querySelectorAll('.study-nav-btn').forEach(function(b){
      b.addEventListener('click',function(){
        var d=parseInt(this.dataset.day);
        showPage('study',{day:d});
      });
    });

    // Complete button
    document.getElementById('btnComplete').addEventListener('click',function(){
      DB.markDayComplete(day).then(function(){
        alert('🎉 第 '+day+' 天完成！继续加油！');
        showPage('home');
      });
    });
  }

  function markDone(day,exIdx){
    DB.markExerciseDone(day,exIdx).then(function(){
      var btn=document.querySelector('#ex'+exIdx+' .btn-done');
      if(btn){btn.textContent='✓ 已标记';btn.style.opacity='0.5';}
    });
  }

  // ===== Formula Handbook =====
  function renderFormulas(container){
    var allFormulas=[
      {chapter:'八上回顾',formulas:[
        {name:'速度',expr:'v = s / t',detail:'v-速度(m/s)  s-路程(m)  t-时间(s)\n1 m/s = 3.6 km/h'},
        {name:'密度',expr:'ρ = m / V',detail:'ρ-密度(kg/m³)  m-质量(kg)  V-体积(m³)\n1 g/cm³ = 1000 kg/m³'},
        {name:'重力',expr:'G = mg',detail:'G-重力(N)  m-质量(kg)  g-重力加速度\n地面附近 g≈10 N/kg(题目常用)'},
      ]},
      {chapter:'力',formulas:[
        {name:'重力',expr:'G = mg',detail:'G-重力(N)  m-质量(kg)  g≈10 N/kg'},
        {name:'弹簧弹力',expr:'F = kx',detail:'F-弹力(N)  k-劲度系数(N/m)  x-形变量(m)'},
        {name:'滑动摩擦力',expr:'f = μN',detail:'f-摩擦力(N)  μ-动摩擦因数  N-正压力(N)'},
      ]},
      {chapter:'压强',formulas:[
        {name:'固体压强',expr:'p = F / S',detail:'p-压强(Pa)  F-压力(N)  S-受力面积(m²)\n1 Pa = 1 N/m²'},
        {name:'液体压强',expr:'p = ρgh',detail:'p-压强(Pa)  ρ-密度(kg/m³)  h-深度(m)\n注意: h是到液面的竖直距离'},
        {name:'液体压力',expr:'F = pS',detail:'先求压强，再求压力。液体对容器底压力不一定等于液体重力'},
      ]},
      {chapter:'浮力',formulas:[
        {name:'阿基米德原理',expr:'F浮 = G排 = ρ液gV排',detail:'F浮-浮力(N)  ρ液-液体密度(kg/m³)  V排-排开液体体积(m³)\n核心公式！适用于所有浮力问题'},
        {name:'称重法',expr:'F浮 = G - F示',detail:'G-物体重力(N)  F示-弹簧测力计示数(N)\n用于有弹簧测力计的题目'},
        {name:'平衡法(漂浮/悬浮)',expr:'F浮 = G物',detail:'仅当物体漂浮或悬浮时使用'},
        {name:'原因法',expr:'F浮 = F向上 - F向下',detail:'浮力=物体下表面受压力-上表面受压力'},
        {name:'浮沉条件',expr:'ρ物 < ρ液 → 漂浮\nρ物 = ρ液 → 悬浮\nρ物 > ρ液 → 沉底',detail:'比较物体密度和液体密度判断浮沉'},
      ]},
      {chapter:'功和机械能',formulas:[
        {name:'功',expr:'W = Fs',detail:'W-功(J)  F-力(N)  s-力的方向上移动的距离(m)\n注意: s是沿力方向的位移'},
        {name:'功率',expr:'P = W / t',detail:'P-功率(W)  W-功(J)  t-时间(s)\n1 W = 1 J/s'},
        {name:'动能',expr:'Ek = ½mv²',detail:'Ek-动能(J)  m-质量(kg)  v-速度(m/s)\n质量越大、速度越大，动能越大'},
        {name:'重力势能',expr:'Ep = mgh',detail:'Ep-重力势能(J)  m-质量(kg)  h-高度(m)'},
        {name:'机械能',expr:'E = Ek + Ep',detail:'机械能=动能+势能\n只有重力/弹力做功时机械能守恒'},
      ]},
      {chapter:'简单机械',formulas:[
        {name:'杠杆平衡',expr:'F1L1 = F2L2',detail:'F1-动力(N)  L1-动力臂(m)\nF2-阻力(N)  L2-阻力臂(m)'},
        {name:'定滑轮',expr:'F = G(不省力，改方向)',detail:'实质是等臂杠杆'},
        {name:'动滑轮',expr:'F = G/2(省一半力)',detail:'实质是动力臂为阻力臂2倍的杠杆\n注意: 绳子自由端移动距离=2倍物体移动距离'},
        {name:'滑轮组',expr:'F = G/n',detail:'n-承担物重的绳子段数\n看动滑轮上有几段绳子'},
        {name:'斜面',expr:'F·L = G·h',detail:'斜面省力但费距离\n理想情况(无摩擦): FL=Gh'},
        {name:'机械效率',expr:'η = W有用 / W总 × 100%',detail:'η-机械效率  W有用-有用功(J)  W总-总功(J)\nη 总小于1(100%)'},
      ]},
    ];

    var html='<div class="page active">';
    allFormulas.forEach(function(section){
      html+='<div class="formula-section"><h3>'+section.chapter+'</h3>';
      section.formulas.forEach(function(f){
        html+='<div class="formula-item" onclick="var d=this.nextElementSibling;d.classList.toggle(\'show\')">'+
          '<span class="f-name">'+f.name+'</span>'+
          '<span class="f-expr">'+f.expr+'</span></div>'+
          '<div class="formula-detail">'+f.detail.replace(/\n/g,'<br>')+'</div>';
      });
      html+='</div>';
    });
    html+='</div>';
    container.innerHTML=html;
  }

  // ===== Stats =====
  function renderStats(container){
    Stats.getDashboard().then(function(d){
      Stats.getPhaseData().then(function(phases){
        var phaseHtml='<div class="phase-list">';
        phases.forEach(function(p){
          var bg=p.pct>=100?'background:rgba(78,204,163,0.1)':'';
          phaseHtml+='<div class="phase-item" style="'+bg+'">'+
            '<span class="phase-name">'+p.name+'</span>'+
            '<span style="font-size:12px;color:var(--text-secondary);margin-right:8px">'+p.done+'/'+p.total+'天</span>'+
            '<span class="phase-pct">'+p.pct+'%</span></div>';
        });
        phaseHtml+='</div>';

        container.innerHTML='<div class="page active">'+
          '<div class="stats-grid">'+
            '<div class="stat-card"><div class="val">'+d.completedDays+'</div><div class="lbl">已完成天数</div></div>'+
            '<div class="stat-card"><div class="val">'+(d.totalDays-d.completedDays)+'</div><div class="lbl">剩余天数</div></div>'+
            '<div class="stat-card"><div class="val">'+d.streak+'</div><div class="lbl">连续学习</div></div>'+
            '<div class="stat-card"><div class="val">'+d.percent+'%</div><div class="lbl">整体进度</div></div>'+
          '</div>'+
          '<h3 style="margin:16px 0 8px;font-size:15px;color:var(--text-secondary)">各板块进度</h3>'+
          phaseHtml+
        '</div>';
      });
    });
  }

  return {showPage:showPage,markDone:markDone};
})();
