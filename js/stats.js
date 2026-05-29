// Statistics module
var Stats = (function(){
  function getDashboard(){
    return DB.getCompletedDays().then(function(completed){
      var totalDays = (typeof CURRICULUM !== 'undefined') ? CURRICULUM.length : 50;
      var done = completed.length;
      var pct = Math.round((done / totalDays) * 100);
      var currentDay = done + 1;
      if (currentDay > totalDays) currentDay = totalDays;

      // Phase progress
      var phases = [
        {name:'八上回顾',start:1,end:5},
        {name:'力',start:6,end:12},
        {name:'运动和力',start:13,end:19},
        {name:'压强',start:20,end:24},
        {name:'浮力 ⚠重点',start:25,end:35},
        {name:'功和机械能',start:36,end:42},
        {name:'简单机械',start:43,end:48},
        {name:'综合冲刺',start:49,end:50}
      ];
      phases.forEach(function(p){
        var phaseDone = completed.filter(function(d){return d>=p.start&&d<=p.end;}).length;
        var phaseTotal = p.end - p.start + 1;
        p.pct = Math.round((phaseDone/phaseTotal)*100);
        p.done = phaseDone;
        p.total = phaseTotal;
      });

      return {
        totalDays:totalDays, completedDays:done, percent:pct,
        currentDay:currentDay, phases:phases,
        streak: calcStreak(completed)
      };
    });
  }

  function calcStreak(completed){
    if(completed.length===0)return 0;
    var sorted=completed.slice().sort(function(a,b){return b-a;});
    var streak=0, expected=sorted[0];
    for(var i=0;i<sorted.length;i++){
      if(sorted[i]===expected){streak++;expected--;}
      else break;
    }
    return streak;
  }

  function getPhaseData(){
    return DB.getAllProgress().then(function(all){
      return DB.getCompletedDays().then(function(completed){
        var phases=[
          {id:'review',name:'八上回顾',start:1,end:5},
          {id:'force',name:'力',start:6,end:12},
          {id:'motion',name:'运动和力',start:13,end:19},
          {id:'pressure',name:'压强',start:20,end:24},
          {id:'buoyancy',name:'浮力',start:25,end:35},
          {id:'energy',name:'功和机械能',start:36,end:42},
          {id:'machine',name:'简单机械',start:43,end:48},
          {id:'final',name:'综合冲刺',start:49,end:50}
        ];
        var cmap={};completed.forEach(function(d){cmap[d]=true;});
        phases.forEach(function(p){
          var cd=0;for(var d=p.start;d<=p.end;d++){if(cmap[d])cd++;}
          p.done=cd;p.total=p.end-p.start+1;p.pct=Math.round((cd/p.total)*100);
        });
        return phases;
      });
    });
  }

  return {getDashboard:getDashboard,getPhaseData:getPhaseData};
})();
