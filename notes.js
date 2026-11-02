/* 笔记:选中正文 → 「记笔记」;顶栏「笔记」打开列表(可随手记、编辑、删除、导出)。只存在本机浏览器 localStorage。 */
(function(){
'use strict';
var KEY='zcmm.notes.v1',notes=[];
try{notes=JSON.parse(localStorage.getItem(KEY)||'[]')||[]}catch(e){notes=[]}
function save(){try{localStorage.setItem(KEY,JSON.stringify(notes))}catch(e){alert('保存失败:浏览器不允许本地存储(可能是无痕模式)。')}}
function el(tag,cls,html,par){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;if(par)par.appendChild(e);return e}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function fmtT(ts){var d=new Date(ts);return (d.getMonth()+1)+'月'+d.getDate()+'日 '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
var main=document.querySelector('main');
function blocks(){return [].slice.call(main.querySelectorAll('p,li,blockquote,figcaption,td,th,h3'))}
function secOf(node){var s=node&&node.closest&&node.closest('section[id],.chapter[id],[id^="ch"]');var a=s&&document.querySelector('nav.rail a[data-id="'+s.id+'"]');
 return {id:s?s.id:'',title:a?a.querySelector('.n').textContent+'　'+a.querySelector('.t').textContent:(document.getElementById('cur')||{}).textContent||''}}
function curSec(){var c=(document.getElementById('cur')||{}).textContent||'',a=[].filter.call(document.querySelectorAll('nav.rail a'),function(x){return x.classList.contains('on')})[0];return {id:a?a.dataset.id:'',title:c}}

/* ---- 顶栏按钮 + 面板 ---- */
var th=document.getElementById('th'),nb=el('button','note-top','笔记');nb.type='button';nb.setAttribute('aria-label','打开笔记');th.parentNode.insertBefore(nb,th);
var cnt=el('span','note-cnt','',nb);
var scrim=el('div','note-scrim',null,document.body),pan=el('aside','note-pan',null,document.body);pan.setAttribute('aria-label','笔记');
pan.innerHTML='<div class="np-hd"><b>我的笔记</b><button type="button" class="np-x" aria-label="关闭">✕</button></div>'+
 '<div class="np-tools"><button type="button" class="demo-btn pri np-new">＋ 随手记</button><button type="button" class="demo-btn np-md">导出 Markdown</button><button type="button" class="demo-btn np-cp">复制全部</button></div>'+
 '<div class="np-list"></div><p class="np-foot">笔记只保存在这台设备的这个浏览器里。换手机或清浏览器数据前,先「导出 Markdown」备份。</p>';
var list=pan.querySelector('.np-list');
function openPan(){render();pan.classList.add('on');scrim.classList.add('on')}
function closePan(){pan.classList.remove('on');scrim.classList.remove('on')}
nb.addEventListener('click',openPan);scrim.addEventListener('click',function(){closePan();closeEd()});pan.querySelector('.np-x').addEventListener('click',closePan);
pan.querySelector('.np-new').addEventListener('click',function(){var s=curSec();openEd({quote:'',sec:s.id,secTitle:s.title,bi:-1})});
pan.querySelector('.np-md').addEventListener('click',function(){var b=new Blob([toMd()],{type:'text/markdown'}),a=el('a',null,null,document.body);a.href=URL.createObjectURL(b);a.download='走出迷茫-笔记.md';a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)});
pan.querySelector('.np-cp').addEventListener('click',function(e){var t=e.target;(navigator.clipboard?navigator.clipboard.writeText(toMd()):Promise.reject()).then(function(){t.textContent='已复制 ✓';setTimeout(function(){t.textContent='复制全部'},1500)},function(){alert('复制失败,请用「导出 Markdown」。')})});
function toMd(){var out=['# 《走出迷茫》读书笔记',''],last=null;sorted().forEach(function(n){if(n.secTitle!==last){out.push('## '+(n.secTitle||'未分章'),'');last=n.secTitle}if(n.quote)out.push('> '+n.quote.replace(/\n/g,'\n> '),'');if(n.text)out.push(n.text,'');out.push('<small>'+fmtT(n.ts)+'</small>','')});return out.join('\n')}
function order(id){var a=[].map.call(document.querySelectorAll('nav.rail a'),function(x){return x.dataset.id});var i=a.indexOf(id);return i<0?999:i}
function sorted(){return notes.slice().sort(function(a,b){return order(a.sec)-order(b.sec)||(a.bi-b.bi)||(a.ts-b.ts)})}
function render(){list.innerHTML='';if(!notes.length){list.innerHTML='<p class="np-empty">还没有笔记。<br>在正文里<b>选中一段文字</b>,点弹出的「✎ 记笔记」;<br>或者点上面的「＋ 随手记」。</p>';return}
 var last=null;sorted().forEach(function(n){if(n.secTitle!==last){el('h5',null,esc(n.secTitle||'未分章'),list);last=n.secTitle}
  var it=el('div','np-item',null,list);if(n.quote)el('blockquote',null,esc(n.quote),it).addEventListener('click',function(){jump(n)});
  if(n.text)el('div','np-text',esc(n.text).replace(/\n/g,'<br>'),it);
  var ft=el('div','np-meta',fmtT(n.ts),it);
  var ed=el('button',null,'编辑',ft);ed.type='button';ed.addEventListener('click',function(){openEd(n)});
  if(n.bi>=0||n.quote){var jb=el('button',null,'回到原文',ft);jb.type='button';jb.addEventListener('click',function(){jump(n)})}
  var dl=el('button','np-del','删除',ft);dl.type='button';dl.addEventListener('click',function(){if(confirm('删除这条笔记?')){notes=notes.filter(function(x){return x!==n});save();render();marks()}})})}
function find(n){var bs=blocks(),b=bs[n.bi];var q=(n.quote||'').slice(0,24);if(b&&(!q||b.textContent.indexOf(q)>=0))return b;if(q)for(var i=0;i<bs.length;i++)if(bs[i].textContent.indexOf(q)>=0)return bs[i];return b||null}
function jump(n){var b=find(n);if(!b){closePan();return}closePan();b.scrollIntoView({behavior:'smooth',block:'center'});b.classList.remove('note-flash');void b.offsetWidth;b.classList.add('note-flash')}

/* ---- 编辑框 ---- */
var ed=el('div','note-ed',null,document.body);ed.innerHTML='<div class="ne-q"></div><textarea rows="5" placeholder="写下你的感想……"></textarea><div class="ne-bt"><button type="button" class="demo-btn ne-cancel">取消</button><button type="button" class="demo-btn pri ne-ok">保存</button></div>';
var edQ=ed.querySelector('.ne-q'),ta=ed.querySelector('textarea'),editing=null;
function openEd(n){editing=n;edQ.innerHTML=(n.secTitle?'<span>'+esc(n.secTitle)+'</span>':'')+(n.quote?'<blockquote>'+esc(n.quote)+'</blockquote>':'');ta.value=n.text||'';ed.classList.add('on');scrim.classList.add('on');setTimeout(function(){ta.focus()},50)}
function closeEd(){ed.classList.remove('on');editing=null;if(!pan.classList.contains('on'))scrim.classList.remove('on')}
ed.querySelector('.ne-cancel').addEventListener('click',closeEd);
ed.querySelector('.ne-ok').addEventListener('click',function(){var n=editing;if(!n)return;var t=ta.value.trim();if(!t&&!n.quote){closeEd();return}
 n.text=t;if(notes.indexOf(n)<0){n.id=Date.now().toString(36);n.ts=Date.now();notes.push(n)}save();closeEd();marks();if(pan.classList.contains('on'))render();else toast('笔记已保存')});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeEd();closePan()}});

/* ---- 选中文字 → 浮动按钮 ---- */
var fl=el('button','note-fl','✎ 记笔记',document.body);fl.type='button';var selInfo=null,st;
function hideFl(){fl.classList.remove('on')}
document.addEventListener('selectionchange',function(){clearTimeout(st);st=setTimeout(checkSel,250)});
function checkSel(){var s=window.getSelection();if(!s||s.isCollapsed||!s.rangeCount){hideFl();return}
 var r=s.getRangeAt(0),txt=s.toString().replace(/\s+/g,' ').trim(),n=r.commonAncestorContainer;n=n.nodeType===1?n:n.parentNode;
 if(!txt||!main.contains(n)||n.closest('.demo,.note-ed,.note-pan')){hideFl();return}
 var bs=blocks(),start=r.startContainer.nodeType===1?r.startContainer:r.startContainer.parentNode,blk=start.closest('p,li,blockquote,figcaption,td,th,h3'),sec=secOf(start);
 selInfo={quote:txt.slice(0,600),sec:sec.id,secTitle:sec.title,bi:bs.indexOf(blk)};
 var rc=r.getBoundingClientRect(),y=rc.bottom+10;if(y>innerHeight-56)y=Math.max(60,rc.top-46);
 fl.style.top=y+'px';fl.style.left=Math.max(8,Math.min(innerWidth-120,rc.left+rc.width/2-50))+'px';fl.classList.add('on')}
fl.addEventListener('mousedown',function(e){e.preventDefault()});
fl.addEventListener('click',function(){if(!selInfo)return;var n=selInfo;selInfo=null;hideFl();try{window.getSelection().removeAllRanges()}catch(e){}openEd(n)});
window.addEventListener('scroll',function(){if(fl.classList.contains('on'))checkSel()},{passive:true});

/* ---- 正文里有笔记的段落标记 ---- */
function marks(){[].forEach.call(main.querySelectorAll('.has-note'),function(b){b.classList.remove('has-note');var x=b.querySelector(':scope>.note-pin');if(x)x.remove()});
 notes.forEach(function(n){if(n.bi<0&&!n.quote)return;var b=find(n);if(!b||b.classList.contains('has-note'))return;b.classList.add('has-note');var pin=el('button','note-pin','✎',b);pin.type='button';pin.title='看笔记';pin.addEventListener('click',function(e){e.stopPropagation();openPan();var its=list.querySelectorAll('.np-item'),idx=sorted().indexOf(n);if(its[idx]){its[idx].scrollIntoView({block:'center'});its[idx].classList.add('note-flash')}})});
 cnt.textContent=notes.length?notes.length:''}
var tt;function toast(s){var t=el('div','note-toast',s,document.body);clearTimeout(tt);requestAnimationFrame(function(){t.classList.add('on')});tt=setTimeout(function(){t.remove()},1800)}
marks();
})();
