// IndexedDB — 学习进度存储
var DB = (function(){
  var DB_NAME='PhysicsApp',DB_VERSION=2,db=null;

  function open(){
    return new Promise(function(resolve,reject){
      var req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded=function(e){
        var d=e.target.result;
        if(!d.objectStoreNames.contains('progress')){
          var ps=d.createObjectStore('progress',{keyPath:'id',autoIncrement:true});
          ps.createIndex('day','day',{unique:true});
        }
        if(!d.objectStoreNames.contains('settings')){
          d.createObjectStore('settings',{keyPath:'key'});
        }
        if(!d.objectStoreNames.contains('customQuestions')){
          var cq=d.createObjectStore('customQuestions',{keyPath:'id',autoIncrement:true});
          cq.createIndex('subject','subject',{unique:false});
        }
      };
      req.onsuccess=function(e){db=e.target.result;resolve(db);};
      req.onerror=function(e){reject(e);};
    });
  }

  function getStore(name,mode){return db.transaction(name,mode||'readonly').objectStore(name);}

  // Progress
  function getProgress(day){
    return new Promise(function(resolve){
      var store=getStore('progress');
      var idx=store.index('day');
      var req=idx.get(day);
      req.onsuccess=function(){resolve(req.result||null);};
    });
  }

  function saveProgress(prog){
    return new Promise(function(resolve){
      var store=getStore('progress','readwrite');
      var idx=store.index('day');
      var getReq=idx.getKey(prog.day);
      getReq.onsuccess=function(){
        if(getReq.result){prog.id=getReq.result;}
        store.put(prog).onsuccess=function(){resolve();};
      };
    });
  }

  function getAllProgress(){
    return new Promise(function(resolve){
      var r=[];getStore('progress').openCursor().onsuccess=function(e){
        var c=e.target.result;if(c){r.push(c.value);c.continue();}else resolve(r);
      };
    });
  }

  function getCompletedDays(){
    return new Promise(function(resolve){
      var r=[];getStore('progress').openCursor().onsuccess=function(e){
        var c=e.target.result;
        if(c){if(c.value.completed)r.push(c.value.day);c.continue();}
        else resolve(r);
      };
    });
  }

  function markExerciseDone(day,exIdx){
    return getProgress(day).then(function(p){
      if(!p){p={day:day,completed:false,exercisesDone:[],conceptsRead:[]};}
      if(p.exercisesDone.indexOf(exIdx)===-1)p.exercisesDone.push(exIdx);
      return saveProgress(p);
    });
  }

  function markConceptRead(day,cIdx){
    return getProgress(day).then(function(p){
      if(!p){p={day:day,completed:false,exercisesDone:[],conceptsRead:[]};}
      if(p.conceptsRead.indexOf(cIdx)===-1)p.conceptsRead.push(cIdx);
      return saveProgress(p);
    });
  }

  function markDayComplete(day){
    return getProgress(day).then(function(p){
      if(!p){p={day:day,completed:false,exercisesDone:[],conceptsRead:[]};}
      p.completed=true;p.completedAt=Date.now();
      return saveProgress(p);
    });
  }

  // Settings
  function getSetting(key,defVal){
    return new Promise(function(resolve){
      var req=getStore('settings').get(key);
      req.onsuccess=function(){resolve(req.result?req.result.value:defVal);};
    });
  }

  function saveSetting(key,value){
    return new Promise(function(resolve){
      getStore('settings','readwrite').put({key:key,value:value});
      resolve();
    });
  }

  // Custom Questions
  function addCustomQuestion(q){
    return new Promise(function(resolve){
      var store=getStore('customQuestions','readwrite');
      q.createdAt=Date.now();
      var req=store.add(q);
      req.onsuccess=function(){resolve(req.result);};
    });
  }
  function updateCustomQuestion(q){
    return new Promise(function(resolve){
      getStore('customQuestions','readwrite').put(q).onsuccess=function(){resolve();};
    });
  }
  function deleteCustomQuestion(id){
    return new Promise(function(resolve){
      getStore('customQuestions','readwrite').delete(id).onsuccess=function(){resolve();};
    });
  }
  function getAllCustomQuestions(){
    return new Promise(function(resolve){
      var r=[];getStore('customQuestions').openCursor().onsuccess=function(e){
        var c=e.target.result;if(c){r.push(c.value);c.continue();}else resolve(r);
      };
    });
  }

  function init(){return open();}

  return{
    init:init,getProgress:getProgress,saveProgress:saveProgress,
    getAllProgress:getAllProgress,getCompletedDays:getCompletedDays,
    markExerciseDone:markExerciseDone,markConceptRead:markConceptRead,
    markDayComplete:markDayComplete,getSetting:getSetting,saveSetting:saveSetting,
    addCustomQuestion:addCustomQuestion,updateCustomQuestion:updateCustomQuestion,
    deleteCustomQuestion:deleteCustomQuestion,getAllCustomQuestions:getAllCustomQuestions
  };
})();
