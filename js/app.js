(function(){
  DB.init().then(function(){
    UI.showPage('home');
  }).catch(function(err){
    console.error('Init error:',err);
    UI.showPage('home');
  });

  document.getElementById('bottomNav').addEventListener('click',function(e){
    var btn=e.target.closest('.nav-btn');
    if(!btn)return;
    UI.showPage(btn.dataset.page);
  });

  window.addEventListener('popstate',function(){UI.showPage('home');});
})();
