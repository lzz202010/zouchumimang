/* 公式推导与动画演示:每个 .demo[data-demo] 第一次展开时才搭建,只在展开且可见时逐帧绘制。 */
(function(){
'use strict';
var root=document.documentElement,P={},FONT='sans-serif';
function cv(n){return getComputedStyle(root).getPropertyValue('--'+n).trim()}
function pal(){['fg','mute','rule','ink','hot','ok','bad','warn','info','panel','bg','ink-soft'].forEach(function(n){P[n]=cv(n)||'#888'});FONT=cv('sans')||'sans-serif'}
function rgba(c,a){if(c[0]!=='#')return c;var h=c.slice(1);if(h.length===3)h=h.replace(/./g,'$&$&');var n=parseInt(h,16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')'}
function el(tag,cls,html,par){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;if(par)par.appendChild(e);return e}
function randn(){var u=1-Math.random(),v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function clamp(x,a,b){return x<a?a:x>b?b:x}

/* ---- 画布与控件 ---- */
function Stage(par,h){var wrap=el('div','demo-cv',null,par),c=el('canvas',null,null,wrap),ctx=c.getContext('2d'),st={ctx:ctx,w:300,h:h};
 st.fit=function(){var w=wrap.clientWidth||300,d=window.devicePixelRatio||1;c.width=Math.round(w*d);c.height=Math.round(h*d);c.style.height=h+'px';ctx.setTransform(d,0,0,d,0,0);st.w=w};
 st.clear=function(){ctx.clearRect(0,0,st.w,st.h)};st.fit();stages.push(st);return st}
function Row(par){return el('div','demo-row',null,par)}
function Slider(par,label,min,max,step,val,fmt,on){var r=el('label','demo-sl',null,par);el('span','l',label,r);var i=el('input',null,null,r);i.type='range';i.min=min;i.max=max;i.step=step;i.value=val;var o=el('output',null,fmt(+val),r);
 i.addEventListener('input',function(){o.textContent=fmt(+i.value);if(on)on(+i.value)});
 return {get v(){return +i.value},set:function(x){i.value=x;o.textContent=fmt(+i.value)}}}
function Btn(par,label,on,pri){var b=el('button','demo-btn'+(pri?' pri':''),label,par);b.type='button';b.addEventListener('click',on);return b}
function Read(par){return el('div','demo-read',null,par)}
function f1(v){return v.toFixed(1)}function f2(v){return v.toFixed(2)}
function T(c,s,x,y,o){o=o||{};c.font=(o.b?'700 ':'')+(o.s||12)+'px '+FONT;c.fillStyle=o.c||P.mute;c.textAlign=o.a||'left';c.textBaseline=o.bl||'middle';c.fillText(s,x,y)}
function L(c,x1,y1,x2,y2,col,lw,dash){c.beginPath();c.setLineDash(dash||[]);c.strokeStyle=col;c.lineWidth=lw||1;c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.setLineDash([])}
function curve(c,f,x0,x1,X,Y,col,lw,dash,fill,base){c.beginPath();c.setLineDash(dash||[]);var n=120,first=true;for(var i=0;i<=n;i++){var s=x0+(x1-x0)*i/n,y=f(s);if(!isFinite(y))continue;if(first){c.moveTo(X(s),Y(y));first=false}else c.lineTo(X(s),Y(y))}
 if(fill){c.lineTo(X(x1),base);c.lineTo(X(x0),base);c.closePath();c.fillStyle=fill;c.fill()}else{c.strokeStyle=col;c.lineWidth=lw||1.5;c.stroke()}c.setLineDash([])}
function dot(c,x,y,r,col){c.beginPath();c.arc(x,y,r,0,7);c.fillStyle=col;c.fill()}
function gauss(x,m,s){return Math.exp(-.5*((x-m)/s)*((x-m)/s))/(s*2.5066283)}

var D={};

/* 1 三因子学习规则 */
D.three={title:'三因子规则',steps:[
 '赫布规则只看“一起放电”:<span class="eq">Δ<i>w</i> = <i>η</i> · pre · post</span>可奖励往往几秒后才到,那时突触前后早就不放电了,这条规则不知道该奖励谁。',
 '于是让共同活动先留下一个会慢慢消退的标记——资格迹 <i>e</i>:<span class="eq">d<i>e</i>/d<i>t</i> = −<i>e</i>/<i>τ</i><sub>e</sub> + <i>f</i>(pre)·<i>g</i>(post)</span>第一项让它按时间常数 <i>τ</i><sub>e</sub> 衰减,第二项在前后同时活动时把它“充上电”。',
 '一次共同放电之后第二项为零,方程的解就是指数衰减:<span class="eq"><i>e</i>(<i>t</i>) = <i>e</i><sub>0</sub> · exp(−<i>t</i> / <i>τ</i><sub>e</sub>)</span>',
 '第三个因素——神经调质 <i>M</i>(如多巴胺)——在 <i>t</i> 时刻到达,只改写标记还没消失的突触:<span class="eq">Δ<i>w</i> = <i>η</i> · <i>e</i>(<i>t</i>) · <i>M</i>(<i>t</i>) = <i>η M e</i><sub>0</sub> · exp(−<i>t</i> / <i>τ</i><sub>e</sub>)</span>奖励来得越晚,能改写的越少;晚过几个 <i>τ</i><sub>e</sub>,就几乎学不到了。'],
 init:function(b){
  var st=Stage(b,196),R=Row(b),sd=Slider(R,'多巴胺延迟',.2,6,.1,1.5,function(v){return f1(v)+' 秒'},reset),stau=Slider(R,'资格迹 <i>τ</i><sub>e</sub>',.4,4,.1,1.5,function(v){return f1(v)+' 秒'},reset),rd=Read(b);
  var t=0,T0=.5,TT=8;function reset(){t=0}
  return {tick:function(dt){t+=dt*1.25;if(t>TT+1.2)t=0},draw:function(){
   var c=st.ctx,w=st.w,l=52,r=w-60,X=function(s){return l+(r-l)*s/TT};st.clear();
   var d=sd.v,tau=stau.v,tm=T0+d,ew=Math.exp(-d/tau),now=Math.min(t,TT);
   var e=function(s){return s<T0?0:Math.exp(-(s-T0)/tau)},M=function(s){return Math.exp(-Math.pow((s-tm)/.13,2))};
   T(c,'共同放电',4,20);L(c,X(T0),10,X(T0),30,P.ink,2);L(c,X(T0)+4,10,X(T0)+4,30,P.info,2);
   var y0=110,Y=function(v){return y0-v*58};T(c,'资格迹 e',4,80);
   curve(c,e,0,TT,X,Y,P.rule,1.5,[4,4]);
   if(now>0){curve(c,e,0,now,X,Y,null,0,null,rgba(P.ink,.18),y0);curve(c,e,0,now,X,Y,P.ink,2)}
   L(c,l,y0,r,y0,P.rule);
   var y3=170,Y3=function(v){return y3-v*36};T(c,'多巴胺 M',4,150);
   curve(c,M,0,TT,X,Y3,rgba(P.hot,.35),1.5,[4,4]);if(now>0)curve(c,M,0,now,X,Y3,P.hot,2);L(c,l,y3,r,y3,P.rule);
   L(c,X(tm),40,X(tm),y3,rgba(P.hot,.5),1,[3,3]);
   if(t>=tm){dot(c,X(tm),Y(ew),4,P.hot);T(c,'e = '+f2(ew),X(tm)+6,Y(ew)-10,{c:P.hot,b:1})}
   L(c,X(now),36,X(now),y3,P.mute,1);
   for(var k=0;k<=TT;k+=2)T(c,k+(k===TT?' 秒':''),X(k),186,{a:'center',s:11});
   var bx=r+22,bw=24,bt=50,bb=y3,fr=t>=tm?Math.min(1,(t-tm)/.5):0;
   c.strokeStyle=P.rule;c.strokeRect(bx,bt,bw,bb-bt);c.fillStyle=P.ok;var hh=(bb-bt)*ew*fr;c.fillRect(bx,bb-hh,bw,hh);T(c,'Δw',bx+bw/2,bt-12,{a:'center',b:1,c:P.fg});
   rd.innerHTML='多巴胺在共同放电后 '+f1(d)+' 秒到达,资格迹还剩 '+Math.round(ew*100)+'% → <b>Δw = η·e·M ≈ '+f2(ew)+'</b>(取 η = M = 1)。把延迟拉长,或把 τ<sub>e</sub> 调短,看 Δw 怎么缩水。';
  }}}};

/* 2 自由能 */
D.fe={title:'自由能',steps:[
 '感知要做的,是由观测 <i>o</i> 反推它的原因 <i>s</i>,也就是求后验:<span class="eq"><i>p</i>(<i>s</i>|<i>o</i>) = <i>p</i>(<i>o</i>|<i>s</i>) <i>p</i>(<i>s</i>) / <i>p</i>(<i>o</i>)</span>麻烦在分母:<i>p</i>(<i>o</i>) = ∫ <i>p</i>(<i>o</i>|<i>s</i>) <i>p</i>(<i>s</i>) d<i>s</i>,要把所有可能的原因都加一遍,大脑算不动。',
 '换个思路:拿一个简单的分布 <i>q</i>(<i>s</i>) 去逼近后验,用 KL 散度量两者差多远(KL ≥ 0,完全相同时为 0)。把贝叶斯公式代进去:<span class="eq">KL[<i>q</i>‖<i>p</i>(<i>s</i>|<i>o</i>)] = E<sub><i>q</i></sub>[ln <i>q</i>(<i>s</i>) − ln <i>p</i>(<i>o</i>|<i>s</i>) − ln <i>p</i>(<i>s</i>)] + ln <i>p</i>(<i>o</i>)</span>',
 '把不含 ln <i>p</i>(<i>o</i>) 的部分记作 <i>F</i>,再把 ln <i>q</i> − ln <i>p</i>(<i>s</i>) 合并成一个 KL:<span class="eq"><i>F</i> = KL[<i>q</i>(<i>s</i>)‖<i>p</i>(<i>s</i>)] − E<sub><i>q</i></sub>[ln <i>p</i>(<i>o</i>|<i>s</i>)]</span>第一项是“复杂度”(信念偏离先验多少),第二项是“准确度”(信念多能解释观测)。这就是正文的公式。',
 '代回上一步:<span class="eq"><i>F</i> = KL[<i>q</i>‖<i>p</i>(<i>s</i>|<i>o</i>)] − ln <i>p</i>(<i>o</i>) ≥ −ln <i>p</i>(<i>o</i>)</span>−ln <i>p</i>(<i>o</i>) 就是“意外”。所以 <i>F</i> 是意外的上界;把 <i>F</i> 压到最低时,<i>q</i> 恰好等于真正的后验——不用算 <i>p</i>(<i>o</i>) 也完成了贝叶斯推断。'],
 init:function(b){
  var st=Stage(b,236),R1=Row(b),run=false;
  var go=Btn(R1,'▶ 最小化 F',function(){run=!run;go.textContent=run?'❚❚ 暂停':'▶ 最小化 F'},1);
  Btn(R1,'打乱 q',function(){sm.set(Math.random()*6-3);ss.set(.3+Math.random()*1.8)});
  var R2=Row(b),so=Slider(R2,'观测 <i>o</i>',-3,3,.1,2,f1),sl=Slider(R2,'证据精度',.2,5,.1,1.5,f1);
  var R3=Row(b),sm=Slider(R3,'<i>q</i> 的均值',-3.5,3.5,.01,-1.5,f2),ss=Slider(R3,'<i>q</i> 的宽度',.15,2.5,.01,1.6,f2),rd=Read(b),scale=8;
  return {tick:function(dt){if(!run)return;var o=so.v,lam=sl.v,Pi=1+lam,m=sm.v,s=ss.v;var gm=Pi*m-lam*o,gs=Pi*s-1/s,k=Math.min(.2,dt*2.5)/Pi;
    sm.set(m-k*gm);ss.set(clamp(s-k*gs,.15,2.5));if(Math.abs(gm)<2e-3&&Math.abs(gs)<2e-3){run=false;go.textContent='▶ 最小化 F'}},
   draw:function(){var c=st.ctx,w=st.w;st.clear();var o=so.v,lam=sl.v,so2=1/lam,m=sm.v,s=ss.v,Pi=1+lam,pm=lam*o/Pi,ps=Math.sqrt(1/Pi);
    var l=8,r=w-8,X=function(x){return l+(r-l)*(x+4)/8},base=150,Y=function(v){return base-Math.min(v,1.05)*125};
    L(c,l,base,r,base,P.rule);
    curve(c,function(x){return gauss(x,m,s)},-4,4,X,Y,null,0,null,rgba(P.ink,.2),base);
    curve(c,function(x){return gauss(x,0,1)},-4,4,X,Y,P.mute,1.5,[5,4]);
    curve(c,function(x){return gauss(x,o,Math.sqrt(so2))},-4,4,X,Y,P.info,1.5);
    curve(c,function(x){return gauss(x,pm,ps)},-4,4,X,Y,P.ok,2,[2,3]);
    curve(c,function(x){return gauss(x,m,s)},-4,4,X,Y,P.ink,2.2);
    L(c,X(o),base,X(o),base+6,P.info,2);T(c,'o',X(o),base+12,{a:'center',c:P.info,b:1});
    var lg=[['先验 p(s)',P.mute],['似然 p(o|s)',P.info],['真后验',P.ok],['信念 q(s)',P.ink]],lx=l;
    lg.forEach(function(g){dot(c,lx+4,10,4,g[1]);T(c,g[0],lx+11,10,{c:P.fg,s:11});lx+=c.measureText(g[0]).width+24});
    var KL=.5*(s*s+m*m-1-Math.log(s*s)),nacc=.5*Math.log(2*Math.PI*so2)+((o-m)*(o-m)+s*s)/(2*so2),F=KL+nacc,sur=.5*Math.log(2*Math.PI*(1+so2))+o*o/(2*(1+so2));
    scale+=(Math.max(6,F*1.15)-scale)*.08;var bx=l+56,bw=r-bx,BX=function(v){return bx+bw*v/scale},by=186,bh=16;
    T(c,'F',l,by+bh/2,{c:P.fg,b:1,s:13});c.fillStyle=P.info;c.fillRect(bx,by,BX(KL)-bx,bh);c.fillStyle=P.hot;c.fillRect(BX(KL),by,BX(F)-BX(KL),bh);
    L(c,BX(sur),by-6,BX(sur),by+bh+6,P.fg,2);T(c,'意外 −ln p(o)',BX(sur),by+bh+14,{a:BX(sur)>w-80?'right':'center',c:P.fg,s:11});
    T(c,'复杂度',bx,by-9,{c:P.info,s:11});T(c,'−准确度',Math.min(Math.max(BX(KL)+4,bx+52),w-60),by-9,{c:P.hot,s:11});
    rd.innerHTML='<b>F = '+f2(F)+'</b> = 复杂度 '+f2(KL)+' + (−准确度) '+f2(nacc)+'。意外 = '+f2(sur)+',差距 '+f2(F-sur)+' 正是 KL[q‖后验]。点「最小化 F」,看蓝绿曲线 q 滑向虚线的真后验,F 落到意外那条线上。';
   }}}};

/* 3 精度加权 */
D.prec={title:'精度加权更新',steps:[
 '把信念和感觉都看成高斯分布,宽窄用“精度”(方差的倒数)表示:<span class="eq">先验 <i>s</i> ~ N(<i>μ</i><sub>旧</sub>, 1/<i>π</i><sub>p</sub>),  观测 <i>o</i> ~ N(<i>s</i>, 1/<i>π</i>)</span>',
 '两个高斯相乘还是高斯,后验的均值是两者按精度加权的平均:<span class="eq"><i>μ</i><sub>新</sub> = (<i>π</i><sub>p</sub> <i>μ</i><sub>旧</sub> + <i>π o</i>) / (<i>π</i><sub>p</sub> + <i>π</i>)</span>谁更精确,谁的话更算数。',
 '分子里拆出一个 <i>μ</i><sub>旧</sub>:<span class="eq"><i>μ</i><sub>新</sub> = <i>μ</i><sub>旧</sub> + <i>π</i> / (<i>π</i><sub>p</sub> + <i>π</i>) · (<i>o</i> − <i>μ</i><sub>旧</sub>)</span>',
 '记 <i>ε</i> = <i>o</i> − <i>μ</i><sub>旧</sub>(预测误差),<i>κ</i> = 1/(<i>π</i><sub>p</sub> + <i>π</i>):<span class="eq"><i>μ</i><sub>新</sub> = <i>μ</i><sub>旧</sub> + <i>κ</i> · <i>π</i> · <i>ε</i></span>同样大的误差,乘上的精度越高,信念被推得越远。精度就是误差的“音量旋钮”。'],
 init:function(b){
  var st=Stage(b,206),R=Row(b),sp=Slider(R,'证据精度 <i>π</i>',.1,8,.1,.5,f1);
  var R2=Row(b);Btn(R2,'嘈杂餐厅 π=0.3',function(){sp.set(.3)});Btn(R2,'安静图书馆 π=6',function(){sp.set(6)});Btn(R2,'世界变了',function(){truth=clamp(truth+(Math.random()<.5?-1:1)*(1.5+Math.random()*2),-4,4)},1);
  var rd=Read(b),truth=2,mu=-2,md=-2,old=-2,obs=null,timer=0,hist=[];
  return {tick:function(dt){timer+=dt;md+=(mu-md)*Math.min(1,dt*10);if(timer>.45){timer=0;var p=sp.v,o=truth+randn()/Math.sqrt(p);old=mu;mu+=p/(1+p)*(o-mu);obs={o:o,a:1};hist.push([truth,mu,o]);if(hist.length>90)hist.shift()}if(obs)obs.a=Math.max(0,obs.a-dt*1.6)},
   draw:function(){var c=st.ctx,w=st.w,l=10,r=w-10,X=function(x){return l+(r-l)*(clamp(x,-5,5)+5)/10};st.clear();
    var y=46;L(c,l,y,r,y,P.rule);for(var k=-4;k<=4;k+=2)T(c,String(k),X(k),y+14,{a:'center',s:10});
    c.beginPath();c.moveTo(X(truth),y-4);c.lineTo(X(truth)-6,y-15);c.lineTo(X(truth)+6,y-15);c.fillStyle=P.hot;c.fill();T(c,'真实',X(truth),y-24,{a:'center',c:P.hot,s:11});
    if(obs){dot(c,X(obs.o),y,5,rgba(P.info,obs.a));L(c,X(old),y+24,X(mu),y+24,rgba(P.ink,obs.a),2);dot(c,X(mu),y+24,3,rgba(P.ink,obs.a))}
    dot(c,X(md),y,7,P.ink);T(c,'信念 μ',X(md),y-24+(Math.abs(X(md)-X(truth))<40?-14:0),{a:'center',c:P.ink,s:11,b:1});
    var t0=96,t1=200,Yh=function(v){return t0+(t1-t0)*(5-clamp(v,-5,5))/10},n=hist.length,dx=(r-l)/89;
    L(c,l,t1,r,t1,P.rule);T(c,'时间 →',r,t1-8,{a:'right',s:10});
    for(var i=0;i<n;i++)dot(c,l+i*dx,Yh(hist[i][2]),1.8,rgba(P.info,.5));
    [[0,P.hot,[4,3]],[1,P.ink,null]].forEach(function(q){c.beginPath();for(var i=0;i<n;i++){var px=l+i*dx,py=Yh(hist[i][q[0]]);i?c.lineTo(px,py):c.moveTo(px,py)}c.setLineDash(q[2]||[]);c.strokeStyle=q[1];c.lineWidth=2;c.stroke();c.setLineDash([])});
    var p=sp.v;rd.innerHTML='精度 π = '+f1(p)+':每次只修正误差的 <b>'+Math.round(p/(1+p)*100)+'%</b>(κπ = π/(π<sub>p</sub>+π),取 π<sub>p</sub> = 1)。紫点是观测,精度低时它们又散又被打折,信念慢慢挪;精度高时一次就跟上。按「世界变了」看两种情况的差别。';
   }}}};

/* 4 回放价值 */
D.replay={title:'回放价值',steps:[
 '回放一段经历,相当于离线做一次价值更新。值不值得回放,看这次更新能让未来多拿多少回报。',
 '未来会经过许多状态。对每个状态,把“未来会多频繁地到达它”(Need)和“在它这里因为这次更新多得的回报”(Gain)相乘,再全部加起来:<span class="eq">回放价值 = Σ<sub><i>s</i></sub> Need(<i>s</i>) × Gain(<i>s</i>)</span>',
 '一次回放只改动一个状态 <i>s</i><sub>k</sub> 的决策,其余状态的 Gain 都是 0,求和只剩一项:<span class="eq">回放价值 = Need(<i>s</i><sub>k</sub>) × Gain(<i>s</i><sub>k</sub>)</span>',
 '两项是乘法关系:离现在的处境再近(Need 大),如果回放已经改不了任何决策(Gain = 0),价值仍然是 0——这就是反刍。'],
 init:function(b){
  var N=8,g=.8,st=Stage(b,190),R=Row(b),V,Rw,pos,order,run,timer,flash,done;
  function reset(rw){V=V&&rw>1?V:new Array(N).fill(0);Rw=rw;order=[];run=true;timer=.4;flash=null;done=false}
  Btn(R,'▶ 发现奖励,开始回放',function(){reset(1)},1);Btn(R,'奖励翻倍',function(){reset(2)});
  var sp=Slider(Row(b),'智能体位置',0,8,1,8,function(v){return v===8?'奖励处':'第 '+(v+1)+' 格'}),rd=Read(b);
  function tgt(s){return s===N-1?Rw:g*V[s+1]}
  function gain(s){return Math.max(0,tgt(s)-V[s])}function need(s){return Math.pow(g,Math.abs(s-sp.v))}
  reset(1);
  return {tick:function(dt){if(flash)flash.a=Math.max(0,flash.a-dt*1.2);if(!run)return;timer-=dt;if(timer>0)return;timer=.8;
    var best=-1,bv=1e-3;for(var s=0;s<N;s++){var v=need(s)*gain(s);if(v>bv){bv=v;best=s}}
    if(best<0){run=false;done=true;return}V[best]=tgt(best);order.push(best+1);flash={s:best,a:1}},
   draw:function(){var c=st.ctx,w=st.w,l=6,cw=(w-12)/(N+1);st.clear();var top=34,ch=40,mx=Math.max(Rw,1);
    [['Need',P.info],['Gain',P.ok],['乘积 = 回放价值',P.hot]].reduce(function(x,q){dot(c,x+4,10,4,q[1]);T(c,q[0],x+11,10,{c:P.fg,s:11});return x+c.measureText(q[0]).width+26},l);
    for(var s=0;s<=N;s++){var x=l+s*cw+2,ww=cw-4;c.strokeStyle=P.rule;c.lineWidth=1;c.strokeRect(x,top,ww,ch);
     if(s<N){var hv=ch*V[s]/mx;c.fillStyle=rgba(P.ink,.5);c.fillRect(x,top+ch-hv,ww,hv);T(c,String(s+1),x+ww/2,top+ch+10,{a:'center',s:10});
      var nd=need(s),gn=gain(s),bw=Math.max(2,ww/3-2),bb=176,bh=52;
      [[nd,P.info],[gn/mx,P.ok],[nd*gn/mx,P.hot]].forEach(function(q,i){var hh=bh*q[0];c.fillStyle=q[1];c.fillRect(x+i*(bw+2)+1,bb-hh,bw,hh)});L(c,x,bb,x+ww,bb,P.rule)}
     else{T(c,'★',x+ww/2,top+ch/2,{a:'center',s:20,c:P.warn});T(c,'奖励',x+ww/2,top+ch+10,{a:'center',s:10,c:P.warn})}}
    var ax=l+Math.min(sp.v,N)*cw+cw/2;dot(c,ax,top-6,5,P.hot);
    if(flash&&flash.a>0){var fx=l+flash.s*cw+2;c.strokeStyle=rgba(P.hot,flash.a);c.lineWidth=3;c.strokeRect(fx,top,cw-4,ch);
     c.beginPath();c.moveTo(fx+cw*1.5,top+ch+2);c.quadraticCurveTo(fx+cw,top+ch+24,fx+cw/2,top+ch+2);c.strokeStyle=rgba(P.hot,flash.a);c.lineWidth=2;c.stroke()}
    rd.innerHTML=(order.length?'回放顺序:<b>'+order.join(' → ')+'</b>。':'')+(done?' 价值已经传回起点,每格 Gain ≈ 0:再回放也不会产生新信息——反刍就像在这里一遍遍重放。':' 每一步回放乘积(橙)最高的那一格。刚拿到奖励时,只有奖励旁边那格 Gain 不为 0,于是回放从终点倒着往回走——这正是大鼠得到奖励后的「反向回放」。');
   }}}};

/* 5 TD 误差 */
D.td={title:'时序差分误差',steps:[
 '状态的价值,是从现在起所有未来奖励(越远打折越多)的期望:<span class="eq"><i>V</i>(<i>s<sub>t</sub></i>) = E[<i>r<sub>t</sub></i> + <i>γ r</i><sub><i>t</i>+1</sub> + <i>γ</i>² <i>r</i><sub><i>t</i>+2</sub> + …]</span>',
 '把第一项以外的部分提出一个 <i>γ</i>,括号里剩下的恰好是下一个状态的价值(贝尔曼方程):<span class="eq"><i>V</i>(<i>s<sub>t</sub></i>) = E[<i>r<sub>t</sub></i> + <i>γ V</i>(<i>s</i><sub><i>t</i>+1</sub>)]</span>',
 '估计准确时,左右两边应当相等。不相等的部分就是“意外”:<span class="eq"><i>δ<sub>t</sub></i> = <i>r<sub>t</sub></i> + <i>γ V</i>(<i>s</i><sub><i>t</i>+1</sub>) − <i>V</i>(<i>s<sub>t</sub></i>)</span>',
 '用它来纠正估计:<span class="eq"><i>V</i>(<i>s<sub>t</sub></i>) ← <i>V</i>(<i>s<sub>t</sub></i>) + <i>α δ<sub>t</sub></i></span>δ > 0 就上调,δ < 0 就下调。多巴胺神经元的放电,画出来正是 δ。'],
 init:function(b){
  var N=16,C=4,RW=11,g=.97,st=Stage(b,214),R=Row(b),V,trial,step,del,first,pause,run=true,omitNext=false,omit=false;
  var bp=Btn(R,'❚❚ 暂停',function(){run=!run;bp.textContent=run?'❚❚ 暂停':'▶ 继续'},1);Btn(R,'下一次不给奖励',function(){omitNext=true});Btn(R,'重新学',reset);
  var sa=Slider(Row(b),'学习率 <i>α</i>',.05,.8,.01,.45,f2),rd=Read(b);
  function reset(){V=new Array(N+1).fill(0);trial=1;step=C-1;del=[];first=null;pause=0;omit=false}
  reset();var acc=0;
  return {tick:function(dt){if(!run)return;if(pause>0){pause-=dt;if(pause<=0){trial++;step=C-1;del=[];omit=omitNext;omitNext=false}return}
    acc+=dt;while(acc>.035&&step<N){acc-=.035;var r=(step===RW&&!omit)?1:0,d=r+g*V[step+1]-V[step];if(step>=C)V[step]+=sa.v*d;del[step]=d;step++}
    if(step>=N){if(!first)first=del.slice();pause=.45;acc=0}},
   draw:function(){var c=st.ctx,w=st.w,l=8,r=w-8,cw=(r-l)/N;st.clear();
    T(c,'价值 V',l,10,{c:P.ink,b:1,s:11});var vb=70;for(var s=0;s<N;s++){var h=Math.max(0,V[s])*48;c.fillStyle=rgba(P.ink,.55);c.fillRect(l+s*cw+1,vb-h,cw-2,h)}L(c,l,vb,r,vb,P.rule);
    var mk=function(s,t,col){var x=l+s*cw+cw/2;L(c,x,vb+4,x,206,rgba(col,.4),1,[3,3]);T(c,t,x,vb+12,{a:'center',c:col,s:11,b:1})};mk(C,'线索 💡',P.info);mk(RW,omit?'奖励(没给)':'奖励 🍬',P.warn);
    var b0=148,S=40;T(c,'δ(多巴胺)',l,96,{c:P.fg,b:1,s:11});L(c,l,b0,r,b0,P.rule);
    if(first&&trial>1)for(s=0;s<N;s++)if(first[s]!=null){var hf=first[s]*S;c.strokeStyle=rgba(P.mute,.6);c.setLineDash([2,2]);c.strokeRect(l+s*cw+2,hf>0?b0-hf:b0,cw-4,Math.abs(hf));c.setLineDash([])}
    for(s=0;s<N;s++)if(del[s]!=null){var hd=clamp(del[s],-1.3,1.3)*S;c.fillStyle=hd>=0?P.ok:P.bad;c.fillRect(l+s*cw+3,hd>0?b0-hd:b0,cw-6,Math.abs(hd)||1)}
    if(step<N){var cx=l+step*cw;L(c,cx,90,cx,206,P.mute,1)}
    T(c,'第 '+trial+' 次',r,10,{a:'right',c:P.fg,s:11});
    var dc=del[C-1]||0,dr=del[RW]||0,msg;
    if(omit)msg='预期中的奖励没来:奖励时刻 δ <b>为负</b>(多巴胺低于基线)。';else if(dr>.5)msg='一开始奖励出乎意料:δ 在<b>奖励</b>时爆发。';else if(dc>.5)msg='奖励已被线索预测:爆发前移到<b>线索</b>,奖励来时几乎没有 δ。';else msg='价值正一步步从奖励往线索方向传。';
    rd.innerHTML=msg+' 虚线框是第 1 次的 δ,对照看。';
   }}}};

/* 6 双曲折扣 */
D.hyp={title:'双曲折扣与偏好逆转',steps:[
 '指数折扣:每多等一天,价值都乘上同一个系数。<span class="eq"><i>V</i> = <i>A</i> · e<sup>−<i>rD</i></sup></span>两个选项的价值比 = (<i>A</i><sub>1</sub>/<i>A</i><sub>2</sub>) · e<sup><i>r</i>(<i>D</i><sub>2</sub> − <i>D</i><sub>1</sub>)</sup>,只取决于两者相隔多久,和离现在多远无关——偏好不会变。',
 '双曲折扣:<span class="eq"><i>V</i> = <i>A</i> / (1 + <i>kD</i>)</span>价值比 = (<i>A</i><sub>1</sub>/<i>A</i><sub>2</sub>) · (1 + <i>kD</i><sub>2</sub>) / (1 + <i>kD</i><sub>1</sub>)。离得远时 <i>D</i><sub>1</sub>、<i>D</i><sub>2</sub> 都很大,多等 30 天几乎不影响比值;离得近时,(1 + 30<i>k</i>)/1 这个倍数就很可观了。',
 '偏好翻转发生在两者相等的那一刻。设 100 元在 <i>D</i> 天后、110 元在 <i>D</i> + 30 天后:<span class="eq">100 · [1 + <i>k</i>(<i>D</i> + 30)] = 110 · (1 + <i>kD</i>)  ⇒  <i>D</i>* = 300 − 1/<i>k</i></span>离 100 元还有 <i>D</i>* 天以上时选 110 元,一进入 <i>D</i>* 天之内,就改选 100 元。'],
 init:function(b){
  var st=Stage(b,214),R=Row(b),hyp=true,run=true,t=0,hold=0,T1=365,T2=395,re=.002;
  var bh=Btn(R,'双曲',function(){hyp=true;bh.className='demo-btn pri';be.className='demo-btn'},1),be=Btn(R,'指数',function(){hyp=false;be.className='demo-btn pri';bh.className='demo-btn'});
  var bp=Btn(R,'❚❚',function(){run=!run;bp.textContent=run?'❚❚':'▶'});
  var sk=Slider(Row(b),'折扣率 <i>k</i>',.005,.1,.001,.02,function(v){return v.toFixed(3)}),rd=Read(b);
  function val(A,T,x){var D=Math.max(0,T-x);return hyp?A/(1+sk.v*D):A*Math.exp(-re*D)}
  return {tick:function(dt){if(!run)return;if(hold>0){hold-=dt;if(hold<=0)t=0;return}t+=dt*48;if(t>=T1){t=T1;hold=1.6}},
   draw:function(){var c=st.ctx,w=st.w,l=34,r=w-10,X=function(x){return l+(r-l)*x/T2},y0=176,Y=function(v){return y0-v/115*160};st.clear();
    L(c,l,y0,r,y0,P.rule);L(c,l,y0,l,10,P.rule);[0,50,100].forEach(function(v){T(c,String(v),l-4,Y(v),{a:'right',s:10})});
    T(c,'现在',l,y0+12,{s:10});T(c,'100 元到手',X(T1),y0+12,{a:'right',s:10,c:P.ink});T(c,'110',X(T2),y0+12,{a:'right',s:10,c:P.hot});T(c,'(+30 天)',X(T2),y0+24,{a:'right',s:10,c:P.hot});
    curve(c,function(x){return val(100,T1,x)},0,T1,X,Y,P.ink,2.2);curve(c,function(x){return val(110,T2,x)},0,T2,X,Y,P.hot,2.2);
    var Ds=300-1/sk.v,xc=T1-Ds;if(hyp&&xc>0&&xc<T1){dot(c,X(xc),Y(val(100,T1,xc)),5,P.fg);T(c,'偏好逆转',X(xc),Y(val(100,T1,xc))-14,{a:'center',c:P.fg,b:1,s:11})}
    L(c,X(t),10,X(t),y0,P.mute,1,[3,3]);var a=val(100,T1,t),bb=val(110,T2,t);dot(c,X(t),Y(a),4,P.ink);dot(c,X(t),Y(bb),4,P.hot);
    rd.innerHTML='离 100 元还有 <b>'+Math.round(T1-t)+' 天</b>:100 元此刻值 '+a.toFixed(1)+',110 元值 '+bb.toFixed(1)+' → 你会选 <b>'+(a>bb?'早点拿 100 元':'多等 30 天拿 110 元')+'</b>。'+(hyp?(xc>0?' 翻转点:还剩 D* = 300 − 1/k = '+Math.round(Ds)+' 天。':' k 太小,翻转点在一年以前。'):' 指数折扣下两条曲线永不相交,偏好始终如一。');
   }}}};

/* 7 拖延 */
D.proc={title:'拖延的计算',steps:[
 '回报 <i>A</i> 要等 <i>D</i> 天后才到,要按双曲折扣打折;做事的辛苦 <i>C</i> 却是现在就要付,不打折:<span class="eq">主观价值(<i>D</i>) = <i>A</i> / (1 + <i>kD</i>) − <i>C</i></span>',
 '只有主观价值高过启动门槛 <i>θ</i>,才会动手:<span class="eq"><i>A</i> / (1 + <i>kD</i>) − <i>C</i> > <i>θ</i></span>',
 '解出 <i>D</i>:<span class="eq">1 + <i>kD</i> < <i>A</i> / (<i>C</i> + <i>θ</i>)  ⇒  <i>D</i> < <i>D</i>* = [<i>A</i> / (<i>C</i> + <i>θ</i>) − 1] / <i>k</i></span><i>D</i>* 就是“离截止还剩几天才会开始”。',
 '<i>k</i> 越大(越看重眼前)、<i>C</i> 越大(任务越难受),<i>D</i>* 越小——越拖到最后。若 <i>C</i> + <i>θ</i> ≥ <i>A</i>,<i>D</i>* ≤ 0:不到截止都不会开始。'],
 init:function(b){
  var A=100,TH=10,DL=30,st=Stage(b,200),R=Row(b),sk=Slider(R,'看重眼前 <i>k</i>',.02,1,.01,.25,f2),sc=Slider(R,'努力成本 <i>C</i>',0,90,1,40,function(v){return String(v)}),rd=Read(b),x=0,hold=0;
  function sv(day){return A/(1+sk.v*(DL-day))-sc.v}
  return {tick:function(dt){if(hold>0){hold-=dt;if(hold<=0)x=0;return}x+=dt*4.5;if(x>=DL){x=DL;hold=1.5}},
   draw:function(){var c=st.ctx,w=st.w,l=34,r=w-12,X=function(d){return l+(r-l)*d/DL},lo=-90,hi=100,Y=function(v){return 12+(hi-clamp(v,lo,hi))/(hi-lo)*160};st.clear();
    L(c,l,Y(0),r,Y(0),P.rule);L(c,l,Y(TH),r,Y(TH),P.hot,1.5,[5,4]);T(c,'启动门槛 θ',r,Y(TH)-9,{a:'right',c:P.hot,s:11});
    [-50,0,50,100].forEach(function(v){T(c,String(v),l-4,Y(v),{a:'right',s:10})});
    for(var d=0;d<=DL;d+=10)T(c,d===DL?'截止':'第 '+d+' 天',X(d),186,{a:d===DL?'right':'center',s:10});
    var Ds=(A/(sc.v+TH)-1)/sk.v,start=DL-Ds;
    if(Ds>0&&start<DL){var sx=Math.max(0,start);c.fillStyle=rgba(P.ok,.12);c.fillRect(X(sx),12,X(DL)-X(sx),160)}
    curve(c,sv,0,DL,X,Y,P.ink,2.4);dot(c,X(x),Y(sv(x)),5,sv(x)>TH?P.ok:P.ink);
    if(Ds>0&&start<DL&&x>=start){var fx=X(Math.max(0,start));L(c,fx,12,fx,172,P.ok,2);T(c,'开始动手',fx+4,22,{c:P.ok,b:1,s:11})}
    rd.innerHTML='主观价值 = 100/(1+k·D) − C。'+(Ds<=0?'<b>C + θ ≥ A:截止前都不会开始</b>。':Ds>=DL?'D* = '+f1(Ds)+' 天 ≥ 30:<b>一拿到任务就开始</b>。':'D* = '+f1(Ds)+':你会在<b>截止前 '+f1(Ds)+' 天</b>才开始。')+' 拖动两个滑块,看「开始动手」那条线怎么移动。';
   }}}};

/* 8 UCB */
D.ucb={title:'UCB 乐观探索',steps:[
 '每台老虎机的真实平均回报 <i>μ<sub>a</sub></i> 未知,我们只有试了 <i>N</i>(<i>a</i>) 次后的平均值 <i>Q̂</i>(<i>a</i>)。试得越少,这个估计越不可靠。',
 '霍夫丁不等式给出“低估了多少”的概率上限:<span class="eq">P(<i>μ<sub>a</sub></i> > <i>Q̂</i>(<i>a</i>) + <i>u</i>) ≤ exp(−2 <i>N</i>(<i>a</i>) <i>u</i>²)</span>',
 '要求这个概率随总次数 <i>t</i> 越来越小,例如令它等于 <i>t</i><sup>−4</sup>,解出 <i>u</i>:<span class="eq"><i>u</i> = √( 2 ln <i>t</i> / <i>N</i>(<i>a</i>) )</span><i>Q̂</i> + <i>u</i> 就是这台机器回报的“乐观上界”。',
 '每次都选上界最高的那台(常数并入 <i>c</i>):<span class="eq"><i>a<sub>t</sub></i> = argmax<sub><i>a</i></sub> [ <i>Q̂<sub>t</sub></i>(<i>a</i>) + <i>c</i> √( ln <i>t</i> / <i>N<sub>t</sub></i>(<i>a</i>) ) ]</span>没怎么试过的机器奖励项大,会被优先尝试;试多了奖励项收缩,自然转去“利用”最好的那台。'],
 init:function(b){
  var K=4,st=Stage(b,200),R=Row(b),run=true,show=false,p,Q,N,t,last,acc=0,best;
  var bp=Btn(R,'❚❚ 暂停',function(){run=!run;bp.textContent=run?'❚❚ 暂停':'▶ 继续'},1);Btn(R,'重来',reset);var bs=Btn(R,'显示真值',function(){show=!show;bs.textContent=show?'隐藏真值':'显示真值'});
  var sc=Slider(Row(b),'探索强度 <i>c</i>',0,2.5,.05,1,f2,reset),rd=Read(b);
  function reset(){p=[.25,.45,.55,.75].sort(function(){return Math.random()-.5});Q=[0,0,0,0];N=[0,0,0,0];t=0;last=-1;best=p.indexOf(.75)}
  function bonus(a){return N[a]?sc.v*Math.sqrt(Math.log(Math.max(t,1))/N[a]):Infinity}
  reset();
  return {tick:function(dt){if(!run||t>=800)return;acc+=dt;while(acc>.08&&t<800){acc-=.08;t++;var bi=0,bv=-1;for(var a=0;a<K;a++){var u=Q[a]+bonus(a);if(u>bv){bv=u;bi=a}}var rw=Math.random()<p[bi]?1:0;N[bi]++;Q[bi]+=(rw-Q[bi])/N[bi];last=bi}},
   draw:function(){var c=st.ctx,w=st.w,l=30,r=w-8,cw=(r-l)/K,y0=160,S=y0-14,Y=function(v){return y0-S*Math.min(v,1.6)/1.6};st.clear();
    L(c,l,y0,r,y0,P.rule);[0,.5,1,1.5].forEach(function(v){T(c,String(v),l-4,Y(v),{a:'right',s:10});L(c,l,Y(v),r,Y(v),rgba(P.rule,.5))});
    for(var a=0;a<K;a++){var x=l+a*cw+cw*.22,bw=cw*.56,bo=bonus(a),q=Q[a];
     if(a===last){c.fillStyle=rgba(P.hot,.08);c.fillRect(l+a*cw+2,8,cw-4,y0-8)}
     c.fillStyle=P.ink;c.fillRect(x,Y(q),bw,y0-Y(q));
     if(isFinite(bo)){c.fillStyle=rgba(P.hot,.35);c.fillRect(x,Y(q+bo),bw,Y(q)-Y(q+bo))}else T(c,'?',x+bw/2,Y(1.2),{a:'center',s:18,c:P.hot,b:1});
     if(show)L(c,x-6,Y(p[a]),x+bw+6,Y(p[a]),P.ok,2,[4,3]);
     T(c,'机器 '+'ABCD'[a],x+bw/2,y0+13,{a:'center',c:P.fg,s:11,b:1});T(c,N[a]+' 次',x+bw/2,y0+28,{a:'center',s:10})}
    dot(c,l+4,8,4,P.ink);T(c,'Q̂ 估计',l+11,8,{s:11,c:P.fg});dot(c,l+80,8,4,rgba(P.hot,.6));T(c,'探索奖励',l+87,8,{s:11,c:P.fg});
    var pct=t?Math.round(N[best]/t*100):0;rd.innerHTML='已拉 '+t+' 次,最好的那台(机器 '+'ABCD'[best]+')被选中 <b>'+pct+'%</b>。'+(sc.v===0?' c = 0 时不探索,常常守着一台并不最好的机器不放——多点几次「重来」看看。':' 橙色是不确定性带来的加分:试得越少越高。把 c 调成 0 对比一下。');
   }}}};

/* 9 漂移扩散 */
D.ddm={title:'漂移扩散模型',steps:[
 '把时间切成很小的步长 Δ<i>t</i>。每一步,决策变量 <i>x</i> 都受两股力:稳定的漂移 <i>v</i>Δ<i>t</i>,和随机的噪声。',
 '噪声是许多独立小扰动的总和,近似高斯;独立噪声的方差随时间线性累积,所以一步噪声的标准差是 <i>σ</i>√Δ<i>t</i>:<span class="eq"><i>x</i><sub><i>t</i>+Δ<i>t</i></sub> = <i>x<sub>t</sub></i> + <i>v</i>Δ<i>t</i> + <i>σ</i>√Δ<i>t</i> · <i>ξ</i>,  <i>ξ</i> ~ N(0, 1)</span>',
 '让 Δ<i>t</i> → 0,一串 √Δ<i>t</i>·<i>ξ</i> 累加起来就是布朗运动的增量 d<i>W</i>:<span class="eq">d<i>x</i> = <i>v</i> d<i>t</i> + <i>σ</i> d<i>W</i></span>',
 '<i>x</i> 先碰到 +<i>a</i> 就选对,先碰到 −<i>a</i> 就选错。解这个“首次到达”问题可得:<span class="eq">正确率 = 1 / (1 + e<sup>−2<i>va</i> / <i>σ</i>²</sup>)</span>漂移越大、边界越宽就越准;但边界越宽,等待也越久——谨慎的代价是慢。'],
 init:function(b){
  var st=Stage(b,236),R=Row(b),sv=Slider(R,'漂移 <i>v</i>',0,2,.05,.6,f2,reset),ss=Slider(R,'噪声 <i>σ</i>',.3,2,.05,1,f2,reset),sa=Slider(Row(b),'边界 <i>a</i>',.3,2.5,.05,1.2,f2,reset),rd=Read(b);
  var TM=4,NB=40,cur,old,hu,hd,n,ok,sum;
  function reset(){cur={pts:[[0,0]],x:0,t:0};old=[];hu=new Array(NB).fill(0);hd=new Array(NB).fill(0);n=0;ok=0;sum=0}
  reset();
  return {tick:function(dt){var h=.004,steps=Math.round(dt*1.4/h),a=sa.v;for(var i=0;i<steps;i++){cur.x+=sv.v*h+ss.v*Math.sqrt(h)*randn();cur.t+=h;if(i%3===0)cur.pts.push([cur.t,cur.x]);
     if(cur.x>=a||cur.x<=-a||cur.t>8){var up=cur.x>=a;if(cur.t<=8){n++;sum+=cur.t;if(up)ok++;var bi=Math.min(NB-1,Math.floor(cur.t/TM*NB));(up?hu:hd)[bi]++}cur.pts.push([cur.t,clamp(cur.x,-a,a)]);old.push({pts:cur.pts,up:up});if(old.length>14)old.shift();cur={pts:[[0,0]],x:0,t:0};break}}},
   draw:function(){var c=st.ctx,w=st.w,l=8,r=w-8,a=sa.v,X=function(t){return l+(r-l)*t/TM},m=(48+188)/2,Y=function(x){return m-x/2.6*70};st.clear();
    L(c,l,Y(a),r,Y(a),P.ok,1.5);L(c,l,Y(-a),r,Y(-a),P.bad,1.5);L(c,l,m,r,m,rgba(P.rule,.8),1,[3,3]);
    T(c,'+a 选对',r,Y(a)-8,{a:'right',c:P.ok,s:11,b:1});T(c,'−a 选错',r,Y(-a)+9,{a:'right',c:P.bad,s:11,b:1});
    function pl(pts,col,lw){c.beginPath();for(var i=0;i<pts.length;i++){var px=X(Math.min(pts[i][0],TM)),py=Y(pts[i][1]);i?c.lineTo(px,py):c.moveTo(px,py)}c.strokeStyle=col;c.lineWidth=lw;c.stroke()}
    old.forEach(function(o,i){pl(o.pts,rgba(o.up?P.ok:P.bad,.12+.02*i),1)});pl(cur.pts,P.ink,2);
    var mx=Math.max(4,Math.max.apply(null,hu),Math.max.apply(null,hd)),bw=(r-l)/NB;
    for(var i=0;i<NB;i++){var hh=hu[i]/mx*40;c.fillStyle=rgba(P.ok,.6);c.fillRect(l+i*bw,Math.min(Y(a),m-12)-2-hh,bw-1,hh);var hb=hd[i]/mx*40;c.fillStyle=rgba(P.bad,.6);c.fillRect(l+i*bw,Math.max(Y(-a),m+12)+2,bw-1,hb)}
    T(c,'0',l,230,{s:10});T(c,TM+' 秒',r,230,{a:'right',s:10});
    var th=1/(1+Math.exp(-2*sv.v*a/(ss.v*ss.v)));
    rd.innerHTML='已做 '+n+' 次决定 · 正确率 <b>'+(n?Math.round(ok/n*100):'–')+'%</b>(理论 '+Math.round(th*100)+'%) · 平均用时 '+(n?(sum/n).toFixed(2):'–')+' 秒。上下的柱子是决定时间的分布。把边界 a 抬高:更准,但更慢。';
   }}}};

/* ---- 搭建与调度 ---- */
var stages=[],live=[];
function build(box){var d=D[box.dataset.demo];if(!d)return;
 var btn=el('button','demo-open','推导与动画演示 · '+d.title,box);btn.type='button';var body=el('div','demo-body',null,box),inst=null;
 btn.addEventListener('click',function(){var on=box.classList.toggle('on');btn.setAttribute('aria-expanded',on);
  if(on&&!inst){
   el('h4',null,'一步步推导',body);var ss=el('div','demo-steps',null,body),items=d.steps.map(function(h){return el('div','demo-step',h,ss)}),k=0;
   var nav=Row(body),nx=Btn(nav,'下一步 ▸',function(){show(k+1)},1),all=Btn(nav,'全部展开',function(){show(items.length)});
   function show(n){for(;k<n&&k<items.length;k++)items[k].classList.add('in');if(k>=items.length){nx.style.display=all.style.display='none'}}
   show(1);el('h4',null,'动画演示',body);pal();inst=d.init(body);inst.box=box;inst.vis=true;live.push(inst);
   if('IntersectionObserver' in window)new IntersectionObserver(function(es){inst.vis=es[0].isIntersecting}).observe(body)}
  if(inst)inst.open=on});
 btn.setAttribute('aria-expanded','false')}
var lt=0;function loop(ts){var dt=Math.min(.05,(ts-lt)/1000||0);lt=ts;var any=false;live.forEach(function(d){if(d.open&&d.vis){if(!any){pal();any=true}d.tick(dt);d.draw()}});requestAnimationFrame(loop)}
var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){stages.forEach(function(s){s.fit()})},120)});
[].forEach.call(document.querySelectorAll('.demo[data-demo]'),build);
requestAnimationFrame(loop);
})();
