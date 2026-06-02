/* Afluence · Nivel 1 — motor compartido de pestañas + quiz (idéntico en los 11 módulos).
   Cada módulo define su propio `var Q = [...]` ANTES de cargar este archivo. */
function showTab(id,el){
  document.querySelectorAll('.panel-view').forEach(function(p){p.classList.remove('active');});
  document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');});
  document.getElementById(id).classList.add('active');el.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}

var qSel={},qSubmitted=false;
var host=document.getElementById('qhost');
function renderQuiz(){
  host.innerHTML='';
  var groups=[['recall','Recall','reconoces el término'],['comp','Comprensión','entiendes el concepto'],['app','Aplicación','lo usas en un caso']];
  var gi=0;
  groups.forEach(function(g){
    var key=g[0],label=g[1];
    var qs=Q.map(function(q,idx){return {q:q,idx:idx};}).filter(function(x){return x.q.t===key;});
    var lab=document.createElement('div');lab.className='section-label';
    lab.innerHTML='<span class="dot"></span>'+label+' <span class="cnt">· '+qs.length+'</span>';host.appendChild(lab);
    qs.forEach(function(o){
      var q=o.q,idx=o.idx;
      var pre=key==='recall'?'R':key==='comp'?'C':'A';gi++;
      var d=document.createElement('div');d.className='q';var L=['A','B','C','D'];
      d.innerHTML='<div class="qtext"><span class="qn">'+pre+gi+'.</span>'+q.q+'</div>'+
        (q.case?'<div class="qcase">'+q.case+'</div>':'')+
        '<div class="opts" id="o-'+idx+'">'+q.o.map(function(op,oi){return '<div class="opt" onclick="pickQ('+idx+','+oi+')" id="o-'+idx+'-'+oi+'"><div class="mk">'+L[oi]+'</div><div><span class="lbl">'+L[oi]+'.</span> '+op+'</div></div>';}).join('')+'</div>'+
        '<div class="explain" id="e-'+idx+'"><b>Por qué:</b> '+q.e+'</div>';
      host.appendChild(d);
    });
  });
}
function pickQ(i,o){
  if(qSubmitted)return;qSel[i]=o;
  document.querySelectorAll('#o-'+i+' .opt').forEach(function(e,j){e.classList.toggle('sel',j===o);});
  var done=Object.keys(qSel).length;
  document.getElementById('qpfill').style.width=(done/Q.length*100)+'%';
  document.getElementById('qpmeta').textContent=done+' / '+Q.length;
  document.getElementById('qbtn').disabled=done<Q.length;
  document.getElementById('qmsg').textContent=done<Q.length?done+' / '+Q.length+' respondidas':'Listo ('+Q.length+'/'+Q.length+')';
}
function checkQuiz(){
  qSubmitted=true;var ok=0;
  Q.forEach(function(q,i){
    document.querySelectorAll('#o-'+i+' .opt').forEach(function(e,j){e.classList.add('locked');if(j===q.c)e.classList.add('correct');else if(j===qSel[i])e.classList.add('wrong');});
    document.getElementById('e-'+i).classList.add('show');
    if(qSel[i]===q.c)ok++;
  });
  var pct=Math.round(ok/Q.length*100),pass=ok/Q.length>=0.7;
  var r=document.getElementById('qresult');r.className='result show '+(pass?'pass':'fail');
  r.innerHTML='<div class="big">'+pct+'%</div><div class="rmsg"><strong>'+(pass?'Módulo aprobado':'A reforzar')+'</strong>'+ok+' de '+Q.length+' correctas. '+(pass?'¡Bien! Avanza al siguiente módulo.':'Repasa la lección y el podcast, y reintenta — necesitas 70%.')+'</div>';
  document.getElementById('qbtn').style.display='none';
  document.getElementById('qreset').style.display='inline-block';
  document.getElementById('qmsg').textContent=ok+'/'+Q.length+' correctas';
  r.scrollIntoView({behavior:'smooth'});
}
function resetQuiz(){
  qSel={};qSubmitted=false;renderQuiz();
  document.getElementById('qresult').className='result';
  document.getElementById('qpfill').style.width='0';document.getElementById('qpmeta').textContent='0 / '+Q.length;
  document.getElementById('qbtn').style.display='inline-block';document.getElementById('qbtn').disabled=true;
  document.getElementById('qreset').style.display='none';
  document.getElementById('qmsg').textContent='Responde las '+Q.length+' preguntas';
}
/* enlazar el botón de descarga al mismo mp3 del <source> */
(function(){var s=document.querySelector('#pcAudio source');var d=document.getElementById('pcDownload');if(s&&d)d.href=s.src;})();
renderQuiz();
