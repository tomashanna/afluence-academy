/* Afluence · Nivel 1 — motor compartido de pestañas + quiz (idéntico en los 11 módulos).
   Cada módulo define su propio `var Q = [...]` ANTES de cargar este archivo.
   Las opciones de cada pregunta se BARAJAN en cada render: `q.c` apunta siempre al
   array original `q.o`; `qPerm[idx]` guarda la permutación visible de esa pregunta. */
function showTab(id,el){
  document.querySelectorAll('.panel-view').forEach(function(p){p.classList.remove('active');});
  document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');});
  document.getElementById(id).classList.add('active');el.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}

var qSel={},qSubmitted=false,qPerm=[],qOrder=[];
var host=document.getElementById('qhost');

/* ---- progreso persistente del alumno (localStorage; lo lee también index.html) ---- */
var PKEY='afl-n1-progress';
var modId=(location.pathname.match(/modulo-(\d+)(?:\.html)?\/?$/)||[])[1]||null; /* acepta /modulo-01.html y /modulo-01 (cleanUrls) */
function aflGet(){try{return JSON.parse(localStorage.getItem(PKEY)||'{}');}catch(e){return {};}}
function aflSet(st){try{localStorage.setItem(PKEY,JSON.stringify(st));}catch(e){}}
function shuffleIdx(n){
  var a=[],i,j,t;for(i=0;i<n;i++)a.push(i);
  for(i=n-1;i>0;i--){j=Math.floor(Math.random()*(i+1));t=a[i];a[i]=a[j];a[j]=t;}
  return a;
}
/* ---- links a los casos: si la pregunta menciona un personaje ficticio o un "Caso N"
   de la lección, se pinta un chip-link bajo el enunciado (los personajes abren su ficha
   en index.html#caso-X en pestaña nueva para no perder el quiz; los Caso N saltan a la Lección) ---- */
var CASOS=[['Sofía','caso-sofia','El caso de Sofía'],['Marco','caso-marco','El caso de Marco'],['Renata','caso-renata','El caso de Renata'],['Diego','caso-diego','El caso de Diego'],['Lanza','caso-lanza','La agencia Lanza']];
function casoLinks(q){
  var txt=(q.q+' '+(q.case||'')).replace(/<[^>]+>/g,' ');
  var out=[];
  CASOS.forEach(function(c){
    if(new RegExp('(^|[^A-Za-zÁ-ú])'+c[0]+'($|[^A-Za-zÁ-ú])').test(txt))
      out.push('<a class="qcaso" href="index.html#'+c[1]+'" target="_blank" rel="noopener">↗ '+c[2]+'</a>');
  });
  var m=txt.match(/Caso ([123])\b/g)||[];
  m.filter(function(v,i){return m.indexOf(v)===i;}).forEach(function(cs){
    var n=cs.replace('Caso ','');
    if(document.getElementById('caso-'+n))
      out.push('<a class="qcaso" href="javascript:void(0)" onclick="goCaso(\'caso-'+n+'\')">↗ Repasa el Caso '+n+' en la Lección</a>');
  });
  return out.length?'<div class="qcasos">'+out.join('')+'</div>':'';
}
function goCaso(anchor){
  var tab=document.querySelector('.tab');
  if(tab)showTab('lesson',tab);
  setTimeout(function(){var el=document.getElementById(anchor);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});},150);
}
function renderQuiz(){
  host.innerHTML='';
  qPerm=Q.map(function(q){return shuffleIdx(q.o.length);});
  qOrder=[];
  var groups=[['recall','Recall','reconoces el término'],['comp','Comprensión','entiendes el concepto'],['app','Aplicación','lo usas en un caso']];
  var gi=0;
  groups.forEach(function(g){
    var key=g[0],label=g[1];
    var qs=Q.map(function(q,idx){return {q:q,idx:idx};}).filter(function(x){return x.q.t===key;});
    var lab=document.createElement('div');lab.className='section-label';
    lab.innerHTML='<span class="dot"></span>'+label+' <span class="cnt">· '+qs.length+'</span>';host.appendChild(lab);
    qs.forEach(function(o){
      var q=o.q,idx=o.idx;qOrder.push(idx);
      var pre=key==='recall'?'R':key==='comp'?'C':'A';gi++;
      var d=document.createElement('div');d.className='q';d.id='q-'+idx;var L=['A','B','C','D'];
      d.innerHTML='<div class="qtext"><span class="qn">'+pre+gi+'.</span>'+q.q+'</div>'+
        (q.case?'<div class="qcase">'+q.case+'</div>':'')+
        casoLinks(q)+
        '<div class="opts" id="o-'+idx+'">'+qPerm[idx].map(function(orig,oi){return '<div class="opt" onclick="pickQ('+idx+','+orig+')" id="o-'+idx+'-'+orig+'"><div class="mk">'+L[oi]+'</div><div><span class="lbl">'+L[oi]+'.</span> '+q.o[orig]+'</div></div>';}).join('')+'</div>'+
        '<div class="explain" id="e-'+idx+'"><b>Por qué:</b> '+q.e+'</div>';
      host.appendChild(d);
    });
  });
  buildProgress();
}
/* barra segmentada: un segmento por pregunta (en orden visible), clicable para saltar a ella */
function buildProgress(){
  var bar=document.querySelector('.qpbar');if(!bar)return;
  bar.innerHTML='';
  qOrder.forEach(function(idx,pos){
    var s=document.createElement('div');s.className='qseg';s.id='seg-'+idx;
    s.title='Pregunta '+(pos+1)+' de '+Q.length;
    s.onclick=function(){var el=document.getElementById('q-'+idx);if(el)el.scrollIntoView({behavior:'smooth',block:'center'});};
    bar.appendChild(s);
  });
}
function pickQ(i,o){
  if(qSubmitted)return;qSel[i]=o;
  document.querySelectorAll('#o-'+i+' .opt').forEach(function(e,j){e.classList.toggle('sel',qPerm[i][j]===o);});
  var seg=document.getElementById('seg-'+i);if(seg)seg.classList.add('done');
  var done=Object.keys(qSel).length;
  document.getElementById('qpmeta').textContent=done+' / '+Q.length;
  document.getElementById('qbtn').disabled=done<Q.length;
  document.getElementById('qmsg').textContent=done<Q.length?done+' / '+Q.length+' respondidas':'Listo ('+Q.length+'/'+Q.length+')';
}
function checkQuiz(){
  qSubmitted=true;var ok=0;
  Q.forEach(function(q,i){
    document.querySelectorAll('#o-'+i+' .opt').forEach(function(e,j){var orig=qPerm[i][j];e.classList.add('locked');if(orig===q.c)e.classList.add('correct');else if(orig===qSel[i])e.classList.add('wrong');});
    document.getElementById('e-'+i).classList.add('show');
    var seg=document.getElementById('seg-'+i);
    if(qSel[i]===q.c){ok++;if(seg)seg.className='qseg ok';}
    else if(seg)seg.className='qseg bad';
  });
  var pct=Math.round(ok/Q.length*100),pass=ok/Q.length>=0.7;
  if(modId){
    var st=aflGet(),prev=st[modId]||{};
    st[modId]={pct:Math.max(prev.pct||0,pct),passed:!!(prev.passed||pass)};
    aflSet(st);
  }
  /* el último <a> del modnav apunta al siguiente módulo (o al índice en el último módulo) */
  var nextA=document.querySelector('.modnav a:last-child');
  var nextHref=nextA?nextA.getAttribute('href'):null;
  var hasNext=!!(nextHref&&/modulo-/.test(nextHref));
  var r=document.getElementById('qresult');r.className='result show '+(pass?'pass':'fail');
  r.innerHTML='<div class="big">'+pct+'%</div><div class="rmsg"><strong>'+(pass?'Módulo aprobado':'A reforzar')+'</strong>'+ok+' de '+Q.length+' correctas. '+(pass?(hasNext?'¡Bien! Avanza al siguiente módulo.':'¡Completaste el último módulo del Nivel 1!'):'Repasa la lección y el podcast, y reintenta: necesitas 70%.')+'</div>'+
    (pass?'<a class="btn btn-primary rnext" href="'+(hasNext?nextHref:'resumen.html')+'">'+(hasNext?'Siguiente módulo →':'Cerrar el Nivel 1 →')+'</a>':'');
  document.getElementById('qbtn').style.display='none';
  document.getElementById('qreset').style.display='inline-block';
  document.getElementById('qmsg').textContent=ok+'/'+Q.length+' correctas';
  r.scrollIntoView({behavior:'smooth'});
}
function resetQuiz(){
  qSel={};qSubmitted=false;renderQuiz();
  document.getElementById('qresult').className='result';
  document.getElementById('qpmeta').textContent='0 / '+Q.length;
  document.getElementById('qbtn').style.display='inline-block';document.getElementById('qbtn').disabled=true;
  document.getElementById('qreset').style.display='none';
  document.getElementById('qmsg').textContent='Responde las '+Q.length+' preguntas';
  window.scrollTo({top:0,behavior:'smooth'});
}
/* enlazar el botón de descarga al mismo mp3 del <source> */
(function(){var s=document.querySelector('#pcAudio source');var d=document.getElementById('pcDownload');if(s&&d)d.href=s.src;})();
/* chip "ya aprobado" en la intro del quiz si hay nota previa guardada */
(function(){
  if(!modId)return;var m=aflGet()[modId];
  if(m&&m.passed){var qi=document.querySelector('.quiz-intro');
    if(qi){var d=document.createElement('div');d.className='qdone';d.textContent='✓ Ya aprobaste este módulo · mejor nota: '+m.pct+'%';qi.appendChild(d);}}
})();
renderQuiz();
