/* 图解:大脑地图、神经元/突触/模型/图鉴、化学信使、各章环路图,以及正文名词点开的图卡。依赖 demos.js 导出的 window.DZ。 */
(function(){
'use strict';
var Z=window.DZ;if(!Z)return;
var P=Z.P,el=Z.el,rgba=Z.rgba,clamp=Z.clamp,randn=Z.randn;
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

/* ================= 大脑底图 ================= */
// 形状:e=椭圆 c=圆 p=填充路径 s=粗描边路径;d=在内侧/深处(虚线)
var G={
 pfc:{f:[['p','M70 165C52 120 78 70 130 52C148 46 160 44 172 43C166 80 156 112 140 150C120 160 98 170 70 165Z']],a:[108,104]},
 cb:{f:[['p','M262 204C300 208 335 206 342 222C346 240 318 256 290 254C268 252 252 238 254 222Z']],a:[300,232]},
 bs:{f:[['p','M236 200C240 225 244 255 250 290L274 290C270 260 266 232 262 206Z']],a:[256,262]},
 sm:{f:[['s','M214 40C206 70 202 100 194 132',9]],a:[206,70]},
 vc:{f:[['e',340,152,13,24]],a:[340,152]},
 ppc:{f:[['e',280,72,20,13]],a:[280,72]},
 ang:{f:[['e',314,118,12,10]],a:[314,118]},
 dlpfc:{f:[['e',122,82,22,13]],a:[122,82]},
 ofc:{f:[['e',112,173,26,8]],a:[112,173]},
 vmpfc:{f:[['e',90,146,13,15]],a:[90,146],d:1},
 acc:{f:[['s','M118 132C130 98 180 82 228 92',8]],a:[156,98],d:1},
 pcc:{f:[['e',282,104,14,10]],a:[282,104],d:1},
 insula:{f:[['e',198,156,30,11]],a:[198,156],d:1},
 str:{f:[['s','M172 128C182 100 224 92 254 110C264 118 267 130 262 140',8],['e',196,138,15,10]],a:[204,112],d:1},
 thal:{f:[['e',236,136,19,12]],a:[236,136],d:1},
 hyp:{f:[['e',208,168,9,7]],a:[208,168],d:1},
 pit:{f:[['c',214,183,4]],a:[214,183],d:1},
 nacc:{f:[['c',176,157,6]],a:[176,157],d:1},
 bf:{f:[['c',164,170,5]],a:[164,170],d:1},
 amy:{f:[['e',182,191,10,7]],a:[182,191],d:1},
 hip:{f:[['s','M190 197C212 201 236 191 252 174C258 166 261 158 258 151',7]],a:[226,196],d:1},
 vta:{f:[['c',236,192,5],['c',226,198,4]],a:[232,195],d:1},
 lc:{f:[['c',258,224,4]],a:[258,224],d:1},
 raphe:{f:[['e',250,242,3,11]],a:[250,242],d:1}
};
// 只有坐标、没有形状的点(环路里用)
var PT={eye:[30,150],ear:[30,200],heart:[300,352],gut:[230,378],adrenal:[130,372],lung:[330,330],nts:[262,256],pb:[252,212],pag:[244,204],dms:[184,104],dls:[256,118],
 body:[260,330],sens:[30,175]};
function anc(id){return G[id]?G[id].a:PT[id]}
function shape(s,cls,id){var a=' class="'+cls+(s[0]==='s'?' rgs':'')+'" data-r="'+id+'"';
 if(s[0]==='e')return '<ellipse cx="'+s[1]+'" cy="'+s[2]+'" rx="'+s[3]+'" ry="'+s[4]+'"'+a+'/>';
 if(s[0]==='c')return '<circle cx="'+s[1]+'" cy="'+s[2]+'" r="'+s[3]+'"'+a+'/>';
 if(s[0]==='p')return '<path d="'+s[1]+'"'+a+'/>';
 return '<path d="'+s[1]+'" style="stroke-width:'+s[2]+'"'+a+'/>'}
var ORDER=['pfc','cb','bs','sm','vc','ppc','ang','dlpfc','ofc','vmpfc','acc','pcc','insula','str','thal','hyp','pit','nacc','bf','amy','hip','vta','lc','raphe'];
var ICON={
 eye:'<g class="ico"><ellipse cx="30" cy="150" rx="14" ry="8"/><circle cx="30" cy="150" r="4" class="pu"/></g>',
 heart:'<g class="ico"><path d="M300 366C280 352 284 336 294 338C298 338 300 342 300 344C300 342 302 338 306 338C316 336 320 352 300 366Z"/></g>',
 gut:'<g class="ico"><path d="M212 372C206 384 222 392 232 386C242 380 228 372 238 368C250 364 256 380 248 392" style="fill:none;stroke-width:5"/></g>',
 adrenal:'<g class="ico"><ellipse cx="130" cy="382" rx="10" ry="14"/><path d="M122 370L130 358L138 370Z" class="pu"/></g>',
 lung:'<g class="ico"><path d="M322 316C312 330 312 346 322 348C328 348 330 340 330 330Z M338 316C348 330 348 346 338 348C332 348 330 340 330 330Z"/></g>'};
var ICONTXT={eye:'眼睛',heart:'心脏',gut:'肠胃',adrenal:'肾上腺',lung:'肺',ear:'耳朵',sens:'感官'};
function brainSVG(o){o=o||{};var H=o.body?400:300,s='<svg class="bsvg" viewBox="0 0 400 '+H+'" role="img" aria-label="大脑示意图">';
 s+='<path class="b-out" d="M70 165C52 120 78 70 130 52C175 36 240 34 290 52C335 68 360 105 358 150C357 178 345 198 322 205C300 210 280 206 262 204C248 214 232 226 212 230C182 236 150 228 135 210C128 200 122 192 112 190C92 190 76 182 70 165Z"/>';
 s+='<g class="b-sul"><path d="M218 37C210 70 205 100 196 135"/><path d="M128 182C165 170 210 160 262 150"/><path d="M300 56C305 90 315 120 320 150"/><path d="M110 80C130 70 150 72 165 62"/><path d="M95 125C115 118 135 125 150 112"/><path d="M240 60C255 75 270 70 285 85"/><path d="M250 100C265 110 290 105 305 120"/><path d="M160 200C180 196 200 205 225 200"/><path d="M88 150C100 140 112 146 124 136"/><path d="M140 80C150 95 168 92 178 104"/><path d="M226 50C232 66 246 72 252 88"/><path d="M262 120C276 128 288 124 300 136"/><path d="M318 80C326 96 340 100 346 118"/><path d="M276 170C290 176 306 172 318 182"/><path d="M180 214C196 212 214 218 236 212"/><path d="M104 104C112 116 128 116 136 126"/></g><g class="b-fol"><path d="M262 214C290 214 320 214 338 224"/><path d="M258 224C288 224 318 226 340 234"/><path d="M260 234C286 236 312 238 334 244"/><path d="M266 244C288 246 306 248 322 251"/></g>';
 if(o.lobes)s+='<g class="b-lobe"><text x="104" y="70">额叶</text><text x="262" y="60">顶叶</text><text x="326" y="186">枕叶</text><text x="170" y="222">颞叶</text><text x="298" y="270">小脑</text><text x="228" y="284">脑干</text></g>';
 if(o.body)s+='<path class="b-cord" d="M262 290L262 318"/><text class="b-bt" x="262" y="330" text-anchor="middle">↓ 身体</text>';
 ORDER.forEach(function(id){G[id].f.forEach(function(f){s+=shape(f,'rg'+(G[id].d?' dash':''),id)})});
 if(o.hits)ORDER.forEach(function(id){var a=G[id].a;s+='<circle class="hit" data-r="'+id+'" cx="'+a[0]+'" cy="'+a[1]+'" r="'+(['pfc','cb','bs'].indexOf(id)>=0?22:12)+'"/>'});
 (o.icons||[]).forEach(function(k){if(ICON[k])s+=ICON[k]});
 s+='<g class="bfl"></g><g class="blb"></g></svg>';return s}
function hl(svg,ids,cls){cls=cls||'on';[].forEach.call(svg.querySelectorAll('.rg'),function(e){e.classList.toggle(cls,ids.indexOf(e.dataset.r)>=0)})}
function label(svg,id,txt,col){var a=anc(id);if(!a)return;var g=svg.querySelector('.blb'),W=+svg.getAttribute('viewBox').split(' ')[2];
 var w=txt.length*11+10,x=a[0]+(a[0]>W-80?-w-6:8),y=a[1]-14;x=clamp(x,2,W-w-2);y=Math.max(12,y);
 g.insertAdjacentHTML('beforeend','<g class="tag'+(col?' '+col:'')+'"><line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+(x+(x<a[0]?w:0))+'" y2="'+(y+8)+'"/><rect x="'+x+'" y="'+y+'" width="'+w+'" height="17" rx="8"/><text x="'+(x+w/2)+'" y="'+(y+12.5)+'" text-anchor="middle">'+esc(txt)+'</text></g>')}
// 流:A→B 的弧线 + 箭头 + 沿路径跑的小点(SMIL)
function flow(svg,A,B,o){o=o||{};var a=anc(A),b=anc(B);if(!a||!b)return;var g=svg.querySelector('.bfl'),mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1],L=Math.sqrt(dx*dx+dy*dy)||1,k=o.bend==null?.18:o.bend;
 var cx=mx-dy/L*L*k,cy=my+dx/L*L*k,d='M'+a[0]+' '+a[1]+'Q'+cx+' '+cy+' '+b[0]+' '+b[1],col=o.c||'hot',inh=o.inh;
 var tx=b[0]-cx,ty=b[1]-cy,tl=Math.sqrt(tx*tx+ty*ty)||1;tx/=tl;ty/=tl;var ex=b[0]-tx*7,ey=b[1]-ty*7;
 var head=inh?'<line class="fh c-'+col+'" x1="'+(ex-ty*7)+'" y1="'+(ey+tx*7)+'" x2="'+(ex+ty*7)+'" y2="'+(ey-tx*7)+'"/>'
  :'<path class="fa c-'+col+'" d="M'+(ex+tx*6)+' '+(ey+ty*6)+'L'+(ex-tx*4-ty*5)+' '+(ey-ty*4+tx*5)+'L'+(ex-tx*4+ty*5)+' '+(ey-ty*4-tx*5)+'Z"/>';
 var dur=(o.dur||Math.max(1.1,L/90))+'s',n=o.n||3,dots='';
 for(var i=0;i<n;i++)dots+='<circle r="'+(o.r||3.2)+'" class="fd c-'+col+'"><animateMotion dur="'+dur+'" begin="'+(i*(parseFloat(dur)/n)).toFixed(2)+'s" repeatCount="indefinite" path="'+d+'"/></circle>';
 g.insertAdjacentHTML('beforeend','<g class="f"><path class="fp c-'+col+(inh?' inh':'')+(o.w?' w':'')+'" d="'+d+'"/>'+head+dots+'</g>')}
function clearFx(svg){svg.querySelector('.bfl').innerHTML='';svg.querySelector('.blb').innerHTML=''}

/* ================= 名词卡数据 ================= */
var CH={basics:'基础篇',ch1:'第 1 章',ch2:'第 2 章',ch3:'第 3 章',ch4:'第 4 章',ch5:'第 5 章',ch6:'第 6 章',ch7:'第 7 章',ch8:'第 8 章',ch9:'第 9 章',ch10:'第 10 章',ch11:'第 11 章',ch12:'第 12 章',ch13:'第 13 章',ch14:'第 14 章',ch15:'第 15 章',ch16:'第 16 章',ch17:'第 17 章'};
var R={
 pfc:{n:'前额叶皮层',look:'额头正后方,大脑最前面的一大块皮层,约占整个皮层的三分之一。人类的前额叶比例是所有动物里最大的。',does:'大脑的“调度台”:记住目标、制订计划、压住冲动、在几个想法之间切换。',you:'你忍住不刷手机、记得出门要带钥匙,靠的都是它。压力一大,它最先“掉线”。',ch:['basics','ch4','ch9']},
 dlpfc:{n:'背外侧前额叶',look:'前额叶的上外侧,大约在太阳穴往上一点。',does:'工作记忆和认知控制:把几条信息“挂”在脑子里并操作它们。',you:'心算、边听边记要点,都在用它。它靠神经元的持续放电维持信息,压力会打断这种放电。',ch:['ch4','ch9']},
 vmpfc:{n:'腹内侧前额叶',look:'前额叶靠中线、靠下的部分,在两眼之间偏上的深处。',does:'给选项算价值;给杏仁核“踩刹车”,让学会的“现在安全了”压过旧的恐惧。',you:'克服害怕、重新看待一件事(重评)时,它负责把新的解释接到杏仁核上。',ch:['ch2','ch9','ch11']},
 ofc:{n:'眶额皮层',look:'眼眶正上方,前额叶的底面,贴着眼眶骨。',does:'给眼前的东西“标价”,并在价值改变时迅速更新。',you:'吃饱以后蛋糕不再诱人——这个“价值下调”很大程度发生在这里。',ch:['ch10','ch11']},
 acc:{n:'前扣带皮层',look:'大脑内侧面,像衣领一样环绕在连接左右脑的胼胝体前方。从外面看不到。',does:'发现冲突和出错,衡量“这件事值不值得费劲”;膝下部(sgACC)与情绪低落密切相关。',you:'做错题时那一下“咯噔”,很大程度来自这里。',ch:['ch3','ch8','ch12']},
 pcc:{n:'后扣带皮层',look:'大脑内侧面靠后的位置,在头顶偏后的深处。',does:'默认模式网络的核心枢纽,把信息和“我”联系起来;全脑代谢最旺盛的区域之一。',you:'发呆时想到“我是不是做得不够好”,它通常很活跃。',ch:['ch3']},
 insula:{n:'岛叶(脑岛)',look:'藏在大脑侧面那条深沟(外侧裂)里面,要把颞叶扒开才看得见,像一座被包起来的“岛”。',does:'汇总心跳、呼吸、胃肠的信号,形成“我现在感觉怎样”;前岛叶还是突显网络的枢纽。',you:'紧张时“胃里一沉”,那种感觉就在这里被拼出来。',ch:['ch1','ch3','ch12']},
 str:{n:'纹状体',look:'大脑深处一对弯成 C 形的结构,切开后能看到灰白相间的条纹,因此得名。',does:'学习“做什么会有好结果”,并把重复的动作打包成习惯。背侧偏动作和习惯,腹侧(伏隔核)偏“想要”。',you:'不用想就伸手去拿手机——这是背外侧纹状体在接管。',ch:['ch7','ch8']},
 nacc:{n:'伏隔核',look:'纹状体腹侧的前端,左右各一,约一颗花生米大小。',does:'“想要”的枢纽,多巴胺最重要的目的地之一;决定你愿不愿意为一样东西付出努力。',you:'明知没意思还是想点开下一条短视频,伏隔核在出力。',ch:['ch7']},
 thal:{n:'丘脑',look:'大脑正中央,两个鸡蛋大小的灰质团,左右各一。',does:'信息中转站:除了嗅觉,几乎所有感觉信号都先到这里,再分发到皮层。',you:'看到草丛里的“蛇”时,信号先经丘脑抄近路直达杏仁核,再绕远路去皮层看清楚。',ch:['ch2','ch6']},
 hyp:{n:'下丘脑',look:'丘脑正下方,只有一颗杏仁大小,约 4 克。',does:'管体温、饥饿、口渴、睡眠,并通过垂体启动全身的应激激素(HPA 轴)。',you:'压力大时皮质醇升高,开关就在这里。',ch:['ch2','ch4','ch12']},
 pit:{n:'垂体',look:'挂在下丘脑下面的一颗豌豆大小的腺体。',does:'接到下丘脑的指令后,向血液释放激素,指挥肾上腺等器官。',you:'HPA 轴中间那个“P”就是它。',ch:['ch4']},
 amy:{n:'杏仁核',look:'颞叶深处,左右各一,形状和大小都像一颗杏仁(约 1.5 厘米)。',does:'快速给东西打上“这对我重要”的标签——危险的、诱人的都算,不只管恐惧。',you:'走夜路时被一个影子吓一跳,先跳开、后看清,先动的是它。',ch:['ch2','ch9']},
 hip:{n:'海马',look:'颞叶内侧,弯弯的一条,形状像海马(长约 4–5 厘米),左右各一。',does:'把经历快速写成新记忆,记住“在哪里”(位置细胞);睡觉时把白天的记忆回放给皮层。',you:'记住今天把钥匙放在哪儿,需要它。伦敦出租车司机的海马后部比常人大。',ch:['ch3','ch5','ch6']},
 vta:{n:'腹侧被盖区与黑质',look:'中脑里的两小团细胞,加起来只有几十万个神经元。黑质含黑色素,切片上是一条黑带。',does:'全脑多巴胺的来源:腹侧被盖区主要发往伏隔核和前额叶,黑质主要发往背侧纹状体。',you:'“比预期好”的那一下,就是这里的神经元在爆发。',ch:['ch7','ch8']},
 lc:{n:'蓝斑',look:'脑干里一小撮细胞,每侧只有约 1.5 万个神经元,天生带蓝色素。',does:'向几乎全脑喷洒去甲肾上腺素,像一个警觉度的“音量旋钮”。瞳孔大小会跟着它变。',you:'突然听到自己的名字,一下子清醒——蓝斑在放电。',ch:['basics','ch4','ch10']},
 raphe:{n:'中缝核',look:'沿着脑干中线排成一串的细胞群。',does:'全脑血清素(5-羟色胺)的来源,与耐心、等待和抑制冲动有关。',you:'愿意为更大的回报多等一会儿,和血清素系统有关(机制仍在研究中)。',ch:['basics']},
 bf:{n:'基底前脑',look:'大脑底部、前额叶和下丘脑之间的一小片区域。',does:'向皮层和海马发送乙酰胆碱,提示“这是新东西,注意并记下来”。',you:'进入陌生环境时那种格外清醒的状态,与它有关。',ch:['basics']},
 cb:{n:'小脑',look:'后脑勺下方,像一个折叠得极细的小花椰菜。体积只占大脑一成,神经元却占全脑约八成。',does:'精细动作和时机的“校准器”,也参与预测与学习。',you:'骑车、打字不用想,很多靠小脑。',ch:['basics']},
 bs:{n:'脑干',look:'连接大脑和脊髓的一根“茎”,在最下面。',does:'呼吸、心跳、觉醒的生命中枢;蓝斑、中缝核、孤束核都住在这里。',you:'身体传上来的心跳、胃肠信号,先在这里的孤束核落脚。',ch:['ch1','ch12']},
 sm:{n:'感觉运动皮层',look:'头顶从左耳到右耳的一条带,中央沟两侧:前面管运动,后面管触觉。',does:'控制身体的动作、接收身体的触觉;向背外侧纹状体输入,支持习惯。',you:'',ch:['ch8']},
 vc:{n:'视觉皮层',look:'后脑勺最后面(枕叶)。',does:'处理视觉;但它收到的“自上而下的预测”比来自眼睛的信号还多。',you:'',ch:['ch1']},
 ppc:{n:'后顶叶皮层',look:'头顶靠后。',does:'空间注意和动作规划,执行控制网络的一部分。',you:'',ch:['ch3']},
 ang:{n:'角回',look:'顶叶和颞叶交界处,耳朵后上方。',does:'默认模式网络的一部分,参与语言理解与概念整合。',you:'',ch:['ch3']}
};
var NET={
 dmn:{n:'默认模式网络(DMN)',ids:['vmpfc','pcc','ang','hip'],look:'不是一个部位,而是一组同时活跃的区域:内侧前额叶、后扣带、角回、海马等。',does:'发呆、回想过去、设想未来、揣测别人怎么看自己时一起活跃。',you:'洗澡时突然冒出的念头、睡前停不下来的反刍,都离不开它。',ch:['ch3']},
 sal:{n:'突显网络',ids:['insula','acc'],look:'以前岛叶和背侧前扣带为核心。',does:'判断“什么重要”,在走神(DMN)和专注(执行网络)之间扳开关。',you:'正发呆时被人喊名字,一下子回过神,是它在切换。',ch:['ch1','ch3']},
 ecn:{n:'执行控制网络',ids:['dlpfc','ppc'],look:'以背外侧前额叶和后顶叶为核心。',does:'专注于外部任务、保持目标、按规则操作。',you:'做题、写代码时主要靠它。',ch:['ch3']}
};
var CHEM={
 c_da:{n:'多巴胺',src:'vta',to:['nacc','pfc','str'],from2:null,look:'由中脑的腹侧被盖区和黑质产生。',does:'不是“快乐物质”,而是“比预期好多少”的教学信号;也决定你愿意付出多少努力。',you:'刷到一条意外好看的视频,多巴胺爆发;同样的视频看第十遍,就几乎没有了。',ch:['basics','ch7','ch8']},
 c_ne:{n:'去甲肾上腺素',src:'lc',to:['pfc','ppc','vc','hip','thal','cb','dlpfc'],look:'由脑干的蓝斑产生,洒向几乎全脑。',does:'提示“情况可能变了”,提高警觉和反应增益;太少犯困,太多慌乱(倒 U 曲线)。',you:'考试前心跳加速、注意力异常集中,它在起作用。',ch:['basics','ch4','ch10']},
 c_5ht:{n:'血清素(5-羟色胺)',src:'raphe',to:['pfc','str','amy','hip','vc','thal'],look:'由脑干的中缝核产生,同样广泛投射。',does:'与等待、耐心、抑制冲动和对坏结果的预期有关;它的作用远比“快乐激素”复杂。',you:'',ch:['basics']},
 c_ach:{n:'乙酰胆碱',src:'bf',to:['pfc','ppc','vc','hip','dlpfc'],look:'在大脑里主要由基底前脑发出。',does:'提示“这里有已知的不确定性”,让大脑多听外界、少依赖旧预期,有利于记新东西。',you:'',ch:['basics']},
 c_cort:{n:'皮质醇',src:'hyp',body:1,look:'由肾上腺(在肾脏上方)分泌的激素,下丘脑—垂体—肾上腺(HPA)轴控制。',does:'应激时动员能量;长期偏高会让前额叶和海马的树突回缩、杏仁核树突增生。',you:'连续几周高压后更容易焦虑、难专注,部分与它有关。',ch:['ch4','ch12']},
 c_glu:{n:'谷氨酸',src:null,look:'大脑里最主要的兴奋性神经递质,约八成神经元用它。',does:'大脑的“油门”:让下一个神经元更容易放电;学习时 NMDA 受体靠它打开。',you:'',ch:['basics','ch5']},
 c_gaba:{n:'GABA',src:null,look:'大脑里最主要的抑制性神经递质,中间神经元用它。',does:'大脑的“刹车”:让下一个神经元更难放电,维持兴奋与抑制的平衡。',you:'很多助眠、抗焦虑药物就是增强 GABA 的作用。',ch:['basics']}
};
var NEU={
 n_neuron:{n:'神经元',t:'大脑的基本细胞,约 860 亿个。树突收信、胞体汇总、轴突送信,末端通过突触连到下一个神经元。',go:'viz-neuron'},
 n_dend:{n:'树突',t:'神经元上像树枝一样的分支,负责接收其他神经元的信号;一个皮层神经元的树突上有几千个突触。树突自己也会做非线性计算。',go:'viz-neuron'},
 n_axon:{n:'轴突',t:'神经元伸出的一根长“电线”,把放电信号送出去,最长可达 1 米(从脊髓到脚趾)。',go:'viz-neuron'},
 n_myelin:{n:'髓鞘',t:'包在轴突外面的脂肪“绝缘层”,一节一节的。信号在节与节之间跳着走,快了约 100 倍。',go:'viz-neuron'},
 n_ap:{n:'动作电位',t:'神经元的“一次放电”:约 1 毫秒的电压尖峰,全有或全无,沿轴突一路传下去。',go:'viz-lif'},
 n_syn:{n:'突触',t:'两个神经元之间约 20 纳米的缝。电信号到这里变成化学信号(递质),再在对面变回电信号。学习主要就是改变突触的强弱。',go:'viz-synapse'},
 t_pyr:{n:'锥体神经元',t:'皮层里最多的兴奋性神经元,胞体像金字塔,有一根伸向皮层表面的长“顶端树突”。',go:'viz-types'},
 t_int:{n:'中间神经元',t:'局部的抑制性神经元,用 GABA 给附近的神经元“踩刹车”、定节拍,种类繁多(PV、SST、VIP……)。',go:'viz-types'},
 t_place:{n:'位置细胞',t:'海马里的神经元,只在你处于某个特定地点时放电。很多个位置细胞拼起来,就是脑内的一张地图(2014 年诺贝尔奖)。',go:'viz-place'}
};
var TERMS=[['前额叶皮层','pfc'],['前额叶','pfc'],['腹内侧前额叶','vmpfc'],['内侧前额叶','vmpfc'],['背外侧前额叶','dlpfc'],['眶额皮层','ofc'],['眶额','ofc'],['前扣带皮层','acc'],['前扣带','acc'],['后扣带皮层','pcc'],['后扣带','pcc'],['前脑岛','insula'],['后脑岛','insula'],['岛叶','insula'],['脑岛','insula'],['纹状体','str'],['伏隔核','nacc'],['下丘脑','hyp'],['丘脑','thal'],['垂体','pit'],['杏仁核','amy'],['海马','hip'],['腹侧被盖区','vta'],['黑质','vta'],['蓝斑','lc'],['中缝核','raphe'],['基底前脑','bf'],['小脑','cb'],['脑干','bs'],['孤束核','bs'],
 ['默认模式网络','dmn'],['DMN','dmn'],['突显网络','sal'],['执行控制网络','ecn'],
 ['多巴胺','c_da'],['去甲肾上腺素','c_ne'],['5-羟色胺','c_5ht'],['血清素','c_5ht'],['乙酰胆碱','c_ach'],['皮质醇','c_cort'],['谷氨酸','c_glu'],['GABA','c_gaba'],
 ['锥体神经元','t_pyr'],['中间神经元','t_int'],['位置细胞','t_place'],['动作电位','n_ap'],['髓鞘','n_myelin'],['树突','n_dend'],['轴突','n_axon'],['突触','n_syn'],['神经元','n_neuron']];
function card(k){return R[k]||NET[k]||CHEM[k]||NEU[k]}
function chLinks(ch){return (ch||[]).filter(function(c){return document.getElementById(c)}).map(function(c){return '<a href="#'+c+'">'+CH[c]+'</a>'}).join(' · ')}
function mapFor(k,svg){clearFx(svg);if(R[k]){hl(svg,[k]);label(svg,k,R[k].n)}
 else if(NET[k]){hl(svg,NET[k].ids);NET[k].ids.forEach(function(i){label(svg,i,R[i].n.replace(/(.+?)[((].*/,'$1'))})}
 else if(CHEM[k]){var c=CHEM[k];if(c.src){hl(svg,[c.src]);label(svg,c.src,R[c.src].n.replace('与黑质',''));
   if(k==='c_cort'){flow(svg,'hyp','pit',{c:'hot',bend:.3});flow(svg,'pit','adrenal',{c:'hot',bend:.25,dur:2.2});flow(svg,'adrenal','hip',{c:'warn',bend:-.25,dur:2.6});flow(svg,'adrenal','pfc',{c:'warn',bend:-.3,dur:2.8})}
   else c.to.forEach(function(t){flow(svg,c.src,t,{c:'hot',n:2})})}else{hl(svg,['pfc','sm','ppc','vc','dlpfc','ang']);}}}
function cardHTML(k){var c=card(k);if(!c)return '';var h='<h4>'+esc(c.n)+'</h4>';
 if(c.t)return h+'<p>'+c.t+'</p>';
 h+='<dl><dt>长什么样</dt><dd>'+c.look+'</dd><dt>主要干什么</dt><dd>'+c.does+'</dd>'+(c.you?'<dt>和你有关</dt><dd>'+c.you+'</dd>':'')+'</dl>';
 var l=chLinks(c.ch);if(l)h+='<p class="cl">书里出现在:'+l+'</p>';return h}

/* ================= 名词弹卡 ================= */
var pop=el('div','tpop',null,document.body),pscr=el('div','tpop-scrim',null,document.body);
pop.innerHTML='<button type="button" class="tpop-x" aria-label="关闭">✕</button><div class="tpop-map"></div><div class="tpop-txt"></div><div class="tpop-go"></div>';
function closePop(){pop.classList.remove('on');pscr.classList.remove('on')}
pscr.addEventListener('click',closePop);pop.querySelector('.tpop-x').addEventListener('click',closePop);
pop.addEventListener('click',function(e){if(e.target.closest('a'))closePop()});
function openPop(k){var c=card(k),m=pop.querySelector('.tpop-map'),go=pop.querySelector('.tpop-go');
 if(c.go||!(R[k]||NET[k]||CHEM[k])){m.innerHTML='';m.style.display='none'}else{m.style.display='';m.innerHTML=brainSVG({body:!!(CHEM[k]&&CHEM[k].body)});mapFor(k,m.firstChild)}
 pop.querySelector('.tpop-txt').innerHTML=cardHTML(k);
 go.innerHTML=c.go?'<a href="#'+c.go+'">去入门篇看动画 →</a>':(R[k]||NET[k]?'<a href="#viz-atlas" data-pick="'+k+'">在大脑地图里看 →</a>':'<a href="#viz-chem" data-pick="'+k+'">去看化学信使 →</a>');
 var a=go.querySelector('a');a.addEventListener('click',function(){var p=a.dataset.pick;if(p)setTimeout(function(){document.dispatchEvent(new CustomEvent('atlas-pick',{detail:p}))},50)});
 pop.classList.add('on');pscr.classList.add('on')}
function linkTerms(){var keys=TERMS.map(function(t){return t[0]}).sort(function(a,b){return b.length-a.length}),map={};TERMS.forEach(function(t){map[t[0]]=t[1]});
 var re=new RegExp(keys.map(function(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}).join('|'),'g');
 [].forEach.call(document.querySelectorAll('section.chapter'),function(sec){if(sec.id==='primer'||sec.id==='refs')return;var seen={};
  var tw=document.createTreeWalker(sec,NodeFilter.SHOW_TEXT,{acceptNode:function(n){var p=n.parentNode;if(!p||p.closest('h2,h3,h4,.demo,.viz,figure,.katex,.formula,a,button,.term,header,table'))return 2;return /[一-龥A-Z]/.test(n.nodeValue)?1:2}}),nodes=[];
  while(tw.nextNode())nodes.push(tw.currentNode);
  nodes.forEach(function(n){var s=n.nodeValue,m,last=0,frag=null;re.lastIndex=0;
   while((m=re.exec(s))){var k=map[m[0]];if(seen[k])continue;seen[k]=1;frag=frag||document.createDocumentFragment();frag.appendChild(document.createTextNode(s.slice(last,m.index)));
    var b=document.createElement('span');b.className='term';b.tabIndex=0;b.setAttribute('role','button');b.dataset.k=k;b.textContent=m[0];frag.appendChild(b);last=m.index+m[0].length}
   if(frag){frag.appendChild(document.createTextNode(s.slice(last)));n.parentNode.replaceChild(frag,n)}})});
 document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('.term');if(t&&t.dataset.k&&!window.getSelection().toString()){openPop(t.dataset.k)}});
 document.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.classList&&e.target.classList.contains('term'))openPop(e.target.dataset.k);if(e.key==='Escape')closePop()})}

/* ================= 各个图解 ================= */
var V={};
function cap(box,h){return el('div','viz-cap',h,box)}

V.atlas=function(box){box.id='viz-atlas';box.insertAdjacentHTML('beforeend','<div class="viz-svg">'+brainSVG({hits:1,lobes:1})+'</div>');var svg=box.querySelector('svg');
 var chips=el('div','viz-chips',null,box),info=el('div','viz-card',null,box),cur=null;
 var groups=[['皮层',['pfc','dlpfc','vmpfc','ofc','acc','pcc','insula','sm','ppc','vc']],['深处',['thal','hyp','pit','amy','hip','str','nacc','bf']],['脑干与小脑',['vta','lc','raphe','bs','cb']],['网络',['dmn','sal','ecn']]];
 groups.forEach(function(g){var r=el('div','chip-row',null,chips);el('span','chip-h',g[0],r);g[1].forEach(function(k){var b=el('button','chip',card(k).n.replace(/(.+?)[((].*/,'$1'),r);b.type='button';b.dataset.k=k;b.addEventListener('click',function(){pick(k)})})});
 function pick(k){cur=k;mapFor(k,svg);info.innerHTML=cardHTML(k);[].forEach.call(chips.querySelectorAll('.chip'),function(c){c.classList.toggle('on',c.dataset.k===k)})}
 svg.addEventListener('click',function(e){var t=e.target.closest('[data-r]');if(t)pick(t.dataset.r)});
 document.addEventListener('atlas-pick',function(e){if(card(e.detail)&&(R[e.detail]||NET[e.detail])){pick(e.detail);box.scrollIntoView({behavior:'smooth',block:'start'})}});
 pick('amy')};

V.chem=function(box){box.id='viz-chem';var ks=['c_da','c_ne','c_5ht','c_ach','c_cort','c_glu','c_gaba'];var chips=el('div','viz-chips one',null,box),wrap=el('div','viz-svg',null,box),info=el('div','viz-card',null,box);
 var r=el('div','chip-row',null,chips);ks.forEach(function(k){var b=el('button','chip',CHEM[k].n.replace(/(.+?)[((].*/,'$1'),r);b.type='button';b.dataset.k=k;b.addEventListener('click',function(){pick(k)})});
 function pick(k){wrap.innerHTML=brainSVG({body:!!CHEM[k].body,icons:CHEM[k].body?['adrenal']:[]});mapFor(k,wrap.firstChild);info.innerHTML=cardHTML(k)+(CHEM[k].src?'':'<p class="cl">它不是从某个核团“广播”出去的,而是全脑各处的神经元在突触上点对点使用。</p>');
  [].forEach.call(r.querySelectorAll('.chip'),function(c){c.classList.toggle('on',c.dataset.k===k)})}
 document.addEventListener('atlas-pick',function(e){if(CHEM[e.detail]){pick(e.detail);box.scrollIntoView({behavior:'smooth',block:'start'})}});
 pick('c_da')};

/* --- 神经元:收信、汇总、放电、跳跃传导 --- */
V.neuron=function(box){box.id='viz-neuron';
 var dend=['M112 92C90 80 70 60 40 42','M70 62C62 50 55 40 52 22','M112 92C88 92 60 96 22 92','M60 94C48 84 36 80 16 72','M112 96C92 110 70 128 44 150','M76 118C70 134 60 146 58 164','M108 100C96 126 92 148 96 172'];
 var s='<svg class="nsvg" viewBox="0 0 400 190" role="img" aria-label="神经元示意图">';
 dend.forEach(function(d,i){s+='<path class="nd" id="nd'+i+'" d="'+d+'"/>'});
 s+='<path class="ns" d="M104 72L136 94L104 116Q96 94 104 72Z"/>';
 s+='<path class="nx" d="M136 94L352 94"/>';
 for(var i=0;i<6;i++)s+='<rect class="nm" x="'+(150+i*32)+'" y="88" width="27" height="12" rx="6"/>';
 var term=['M352 94C362 80 372 74 388 70','M352 94L390 94','M352 94C362 108 372 114 388 120','M370 76L380 60','M372 112L382 132'];
 term.forEach(function(d){s+='<path class="nt" d="'+d+'"/>'});[[388,70],[390,94],[388,120],[380,60],[382,132]].forEach(function(p){s+='<circle class="nb" cx="'+p[0]+'" cy="'+p[1]+'" r="4"/>'});
 s+='<g class="nl"><text x="30" y="17">树突:收信</text><text x="100" y="140">胞体:汇总</text><text x="210" y="76">轴突 + 髓鞘:送信</text><text x="396" y="160" text-anchor="end">末梢:交给下一位</text></g>';
 s+='<g class="nfx"></g></svg>';
 box.insertAdjacentHTML('beforeend','<div class="viz-svg">'+s+'</div>');var svg=box.querySelector('svg'),fx=svg.querySelector('.nfx'),soma=svg.querySelector('.ns');
 var R1=Z.Row(box),my=true;Z.Btn(R1,'⚡ 给它一点刺激',function(){fire(3)},1);Z.Btn(R1,'太弱了:只给一下',function(){fire(1)});var bm=Z.Btn(R1,'去掉髓鞘',function(){my=!my;bm.textContent=my?'去掉髓鞘':'装回髓鞘';[].forEach.call(svg.querySelectorAll('.nm'),function(m){m.style.opacity=my?1:.08})});
 var rd=cap(box,'点「给它一点刺激」:几个输入沿树突跑向胞体,加起来超过门槛,神经元就放电,信号沿轴突一路传到末梢。'),pend=0,ev=[],V0=0,busy=false;
 var paths=[].map.call(svg.querySelectorAll('.nd'),function(p){return p});
 function fire(n){for(var i=0;i<n;i++){var p=paths[Math.floor(Math.random()*paths.length)];ev.push({k:'in',p:p,L:p.getTotalLength(),t:-i*.18})}}
 var inst={tick:function(dt){V0=Math.max(0,V0-dt*.9);ev.forEach(function(e){e.t+=dt});
   ev=ev.filter(function(e){if(e.k==='in'&&e.t>=.8){V0+=.4;if(V0>=1&&!busy){busy=true;V0=0;ev.push({k:'ap',t:0});rd.innerHTML='<b>放电!</b>动作电位沿轴突'+(my?'在髓鞘之间“跳着走”(约 100 米/秒,和高铁差不多快)':'一点点爬过去(无髓鞘约 1 米/秒,步行速度)')+'。'}else if(V0<1&&!busy&&e.t<.85)rd.innerHTML='电位升到 '+Math.round(V0*100)+'%:不够门槛,慢慢漏掉了。单个输入通常不足以让神经元放电。';return false}
    if(e.k==='ap'&&e.t>(my?1.3:4.2)+.6){busy=false;return false}return true})},
  draw:function(){var h='';soma.style.fill=rgba(Z.P.hot,clamp(V0,0,1)*.8+.08);
   ev.forEach(function(e){if(e.k==='in'&&e.t>0){var q=1-Math.min(1,e.t/.8),pt=e.p.getPointAtLength(e.L*q);h+='<circle class="np" cx="'+pt.x+'" cy="'+pt.y+'" r="4"/>'}
    if(e.k==='ap'){var T=my?1.3:4.2,f=Math.min(1,e.t/T),x;if(my){var nodes=[136,177,209,241,273,305,337,352],j=Math.min(nodes.length-1,Math.floor(f*nodes.length));x=nodes[j]}else x=136+216*f;
     if(e.t<.25)soma.style.fill=Z.P.hot;h+='<circle class="nap" cx="'+x+'" cy="94" r="7"/>';if(f>=1)h+='<g class="nflash"><circle cx="388" cy="70" r="7"/><circle cx="390" cy="94" r="7"/><circle cx="388" cy="120" r="7"/><circle cx="380" cy="60" r="6"/><circle cx="382" cy="132" r="6"/></g>'}});
   fx.innerHTML=h}};
 Z.mount(box,inst)};

/* --- 突触:小泡释放、扩散、结合、回收 --- */
V.synapse=function(box){box.id='viz-synapse';var st=Z.Stage(box,250),R1=Z.Row(box),ves=[],mol=[],rec=[],glow=0,pre=0,t=0,ndrug=false;
 Z.Btn(R1,'⚡ 来一个动作电位',spike,1);var bd=Z.Btn(R1,'加一点“再摄取抑制剂”',function(){ndrug=!ndrug;bd.textContent=ndrug?'撤掉抑制剂':'加一点“再摄取抑制剂”'});
 var rd=cap(box,'上面是发信的末梢,下面是收信的树突棘,中间那道缝就是突触间隙。');
 function reset(){ves=[];for(var i=0;i<14;i++)ves.push({x:.2+Math.random()*.6,y:.12+Math.random()*.2,f:0})}reset();
 for(var i=0;i<7;i++)rec.push({x:.2+i*.1,on:0});
 function spike(){pre=1;var n=0;ves.forEach(function(v){if(!v.f&&n<4&&Math.random()<.6){v.f=1;v.t=0;n++}});rd.innerHTML='电信号到达末梢 → 钙离子涌入 → 几个小泡贴到膜上“开口”,把递质倒进间隙。'}
 var inst={tick:function(dt){t+=dt;pre=Math.max(0,pre-dt*1.5);glow=Math.max(0,glow-dt*.8);
   ves.forEach(function(v){if(v.f===1){v.t+=dt;v.y+=(0.38-v.y)*Math.min(1,dt*6);if(v.t>.35){v.f=2;for(var k=0;k<14;k++)mol.push({x:v.x+(Math.random()-.5)*.04,y:.4,vx:(Math.random()-.5)*.25,vy:.15+Math.random()*.25,b:0,a:1})}}});
   ves=ves.filter(function(v){return v.f!==2});if(ves.length<14&&Math.random()<dt*1.2)ves.push({x:.2+Math.random()*.6,y:.12+Math.random()*.15,f:0});
   rec.forEach(function(r){r.on=Math.max(0,r.on-dt*(ndrug?.35:.9))});
   mol.forEach(function(m){if(m.b){m.b-=dt;if(m.b<=0){m.vy=-.2;m.b=0;m.done=1}return}m.x+=m.vx*dt+Z.randn()*.012;m.y+=m.vy*dt+Z.randn()*.01;
    if(m.y>.58&&!m.done){var r=rec.filter(function(r){return Math.abs(r.x-m.x)<.045})[0];if(r){r.on=1;glow=Math.min(1,glow+.12);m.b=.25+Math.random()*.3;m.y=.58}else{m.vy=-Math.abs(m.vy)*.6}}
    if(m.y<.42&&m.vy<0){if(!ndrug&&m.x>.15&&m.x<.85)m.a-=dt*2.5;else m.vy=Math.abs(m.vy)*.5+.05}
    m.x=clamp(m.x,.08,.92);if(ndrug)m.a-=dt*.18});
   mol=mol.filter(function(m){return m.a>0})},
  draw:function(){var c=st.ctx,w=st.w,h=st.h,X=function(x){return x*w},Y=function(y){return y*h},P=Z.P;st.clear();
   c.fillStyle=rgba(P.ink,.10+pre*.25);c.beginPath();c.moveTo(X(.08),0);c.lineTo(X(.92),0);c.bezierCurveTo(X(.96),Y(.3),X(.9),Y(.42),X(.5),Y(.42));c.bezierCurveTo(X(.1),Y(.42),X(.04),Y(.3),X(.08),0);c.fill();c.strokeStyle=P.ink;c.lineWidth=1.5;c.stroke();
   c.fillStyle=rgba(P.info,.10+glow*.35);c.beginPath();c.moveTo(X(.1),h);c.bezierCurveTo(X(.08),Y(.62),X(.2),Y(.58),X(.5),Y(.58));c.bezierCurveTo(X(.8),Y(.58),X(.92),Y(.62),X(.9),h);c.fill();c.strokeStyle=P.info;c.stroke();
   ves.forEach(function(v){c.beginPath();c.arc(X(v.x),Y(v.y),9,0,7);c.fillStyle=rgba(P.hot,.15);c.fill();c.strokeStyle=P.hot;c.lineWidth=1.2;c.stroke();for(var k=0;k<4;k++)Z.dot(c,X(v.x)+Math.cos(k*1.6)*4,Y(v.y)+Math.sin(k*1.6)*4,1.6,P.hot)});
   rec.forEach(function(r){var x=X(r.x),y=Y(.58);c.fillStyle=r.on>0?P.ok:P.mute;c.fillRect(x-7,y,4,9);c.fillRect(x+3,y,4,9);if(r.on>0){c.fillStyle=rgba(P.ok,.5*r.on);c.fillRect(x-2,y+2,4,22*r.on)}});
   [.12,.88].forEach(function(x){c.fillStyle=P.warn;c.fillRect(X(x)-5,Y(.36),10,8)});
   mol.forEach(function(m){Z.dot(c,X(m.x),Y(m.y),2.6,rgba(P.hot,Math.max(0,m.a)))});
   Z.T(c,'发信的轴突末梢',8,14,{c:P.ink,s:12,b:1});Z.T(c,'突触间隙(约 20 纳米)',X(.5),Y(.5),{a:'center',s:11});Z.T(c,'收信的树突棘',8,h-12,{c:P.info,s:12,b:1});Z.T(c,'受体',X(.92),Y(.63),{a:'right',s:11,c:P.ok});Z.T(c,'回收泵',X(.12)+8,Y(.33),{s:10,c:P.warn});
   if(glow>.3)Z.T(c,'⚡ 下一个神经元的电位上升',X(.5),h-14,{a:'center',c:P.ok,b:1,s:12})}};
 setInterval(function(){if(!mol.length&&!pre)rd.innerHTML=ndrug?'加了再摄取抑制剂:回收泵被堵住,递质在间隙里停留更久,受体被反复激活。很多抗抑郁药(SSRI)就是这样作用于血清素的。':'递质结合受体后很快被回收泵吸回末梢,准备下一次使用。点按钮再发一次;连发几次,看受体多亮。'},2500);
 Z.mount(box,inst)};

/* --- 漏积分放电:漏水的桶 --- */
V.lif=function(box){box.id='viz-lif';var st=Z.Stage(box,220),R1=Z.Row(box),si=Z.Slider(R1,'输入强度(倒水)',0,2.2,.01,1.25,Z.f2),stau=Z.Slider(R1,'漏得慢(时间常数)',5,60,1,20,function(v){return v+' 毫秒'});
 var R2=Z.Row(box),noise=false;var bn=Z.Btn(R2,'加噪声:真实的输入是忽大忽小的',function(){noise=!noise;bn.textContent=noise?'去掉噪声':'加噪声:真实的输入是忽大忽小的'});Z.Btn(R2,'⚡ 泼一大杯',function(){kick+=.6},1);
 var rd=cap(box,''),V0=0,hist=[],sp=[],tt=0,ref=0,kick=0,count=[];
 var inst={tick:function(dt){var h=.0005,n=Math.round(dt*.25/h);for(var i=0;i<n;i++){tt+=h;var I=si.v+(noise?Z.randn()*1.6*Math.sqrt(.001/h)*.25:0);
    if(ref>0){ref-=h;V0=0}else{V0+=h*1000*(-V0+I)/stau.v+kick;kick=0;if(V0>=1){V0=0;ref=.002;sp.push(tt);count.push(tt)}}
    if(i%8===0){hist.push([tt,V0]);}}
   while(hist.length&&hist[0][0]<tt-.25)hist.shift();while(sp.length&&sp[0]<tt-.25)sp.shift();while(count.length&&count[0]<tt-1)count.shift()},
  draw:function(){var c=st.ctx,w=st.w,h=st.h,P=Z.P;st.clear();
   var bx=10,bw=Math.min(80,w*.2),by=40,bh=140;
   c.strokeStyle=P.fg;c.lineWidth=2;c.beginPath();c.moveTo(bx,by);c.lineTo(bx,by+bh);c.lineTo(bx+bw,by+bh);c.lineTo(bx+bw,by);c.stroke();
   var lv=clamp(V0,0,1);c.fillStyle=rgba(P.info,.45);c.fillRect(bx+2,by+bh-lv*(bh-4)-2,bw-4,lv*(bh-4));
   L(c,bx-4,by+4,bx+bw+4,by+4,P.hot,1.5,[4,3]);Z.T(c,'门槛',bx+bw+6,by+4,{c:P.hot,s:10});
   var fw=clamp(si.v/2.2,0,1)*6+1;c.strokeStyle=rgba(P.info,.8);c.lineWidth=fw;c.beginPath();c.moveTo(bx+bw/2,8);c.lineTo(bx+bw/2,by+bh-lv*(bh-4));c.stroke();Z.T(c,'输入',bx+bw/2+8,16,{s:10});
   var dr=(tt*7)%1;Z.dot(c,bx+bw*.7,by+bh+6+dr*14,2.5,rgba(P.info,1-dr));Z.T(c,'漏',bx+bw*.7+6,by+bh+10,{s:10});
   if(sp.length&&tt-sp[sp.length-1]<.01){c.fillStyle=rgba(P.hot,.25);c.fillRect(bx,by,bw,bh);Z.T(c,'⚡',bx+bw/2,by+bh/2,{a:'center',s:26})}
   var l=bx+bw+40,r=w-6,X=function(s){return l+(r-l)*(1-(tt-s)/.25)},Y=function(v){return by+bh-v*(bh-20)};
   Z.grid(c,l,r,[Y(.25),Y(.5),Y(.75)]);L(c,l,Y(1),r,Y(1),P.hot,1,[4,3]);L(c,l,Y(0),r,Y(0),P.axis);
   c.beginPath();hist.forEach(function(p,i){i?c.lineTo(X(p[0]),Y(p[1])):c.moveTo(X(p[0]),Y(p[1]))});c.strokeStyle=P.ink;c.lineWidth=2;c.stroke();
   sp.forEach(function(s){L(c,X(s),Y(1),X(s),by-8,P.hot,2)});Z.T(c,'电位(水位)随时间',l,by-24,{s:11,c:P.fg});Z.T(c,'← 0.25 秒前',l,by+bh+14,{s:10});Z.T(c,'现在',r,by+bh+14,{a:'right',s:10});
   var hz=count.length;rd.innerHTML='放电频率约 <b>'+hz+' 次/秒</b>。'+(si.v<1&&!noise?'输入太弱:水位在门槛下面达到平衡,一次也不放电——这就是“阈下”。加点噪声试试,偶尔会被推过门槛。':'输入越强,水位越快涨到门槛,放电越密;桶漏得越慢(时间常数越大),越容易把零散的输入攒起来。')+' 公式:τ·dV/dt = −V + I,V 到门槛就放电并清零。'}};
 var L=Z.L;Z.mount(box,inst)};

/* --- 神经元图鉴 --- */
function rng(seed){return function(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646}}
function tree(x,y,ang,len,dep,rnd,spread,out,shrink){if(dep<=0||len<2)return;var x2=x+Math.cos(ang)*len,y2=y+Math.sin(ang)*len;out.push('M'+x.toFixed(1)+' '+y.toFixed(1)+'L'+x2.toFixed(1)+' '+y2.toFixed(1));
 var k=rnd()<.7?2:3;for(var i=0;i<k;i++)tree(x2,y2,ang+(rnd()-.5)*spread,len*(shrink||.72),dep-1,rnd,spread,out,shrink)}
function drawType(t){var o=[],r=rng(t.seed),s='';
 if(t.k==='pyr'){tree(60,90,-Math.PI/2,26,6,r,.7,o,.78);[2.4,2.8,0.4,0.8].forEach(function(a){tree(60,98,a,12,4,r,1,o)});s+='<path class="ty-d" d="'+o.join('')+'"/><path class="ty-s" d="M52 102L60 84L68 102Z"/><path class="ty-a" d="M60 102L60 140"/>'}
 if(t.k==='pv'){for(var i=0;i<7;i++)tree(60,70,i*0.9,10,3,r,1.1,o);s+='<path class="ty-d" d="'+o.join('')+'"/><circle class="ty-s" cx="60" cy="70" r="7"/>';[[30,118],[60,124],[90,118]].forEach(function(p){s+='<circle class="ty-o" cx="'+p[0]+'" cy="'+p[1]+'" r="8"/><path class="ty-a" d="M'+(p[0]-9)+' '+p[1]+'A9 9 0 0 1 '+(p[0]+9)+' '+p[1]+'"/>'});s+='<path class="ty-a" d="M60 77L60 100M60 100L30 108M60 100L90 108M60 100L60 114"/>'}
 if(t.k==='pk'){for(var j=0;j<3;j++)tree(60,112,-Math.PI/2+(j-1)*.5,20,7,r,.9,o,.72);s+='<path class="ty-d" d="'+o.join('')+'"/><circle class="ty-s" cx="60" cy="116" r="7"/><path class="ty-a" d="M60 123L60 145"/>'}
 if(t.k==='da'){[2.6,3.4,.2].forEach(function(a){tree(18,120,a-1.2,8,3,r,1,o)});var ax='M18 120C40 110 60 60 80 40';tree(80,40,-.6,10,6,r,1.4,o,.85);tree(80,40,.6,10,6,r,1.4,o,.85);s+='<path class="ty-d" d="'+o.join('')+'"/><path class="ty-a" d="'+ax+'"/><circle class="ty-s" cx="18" cy="120" r="6"/>'}
 if(t.k==='msn'){for(var q=0;q<6;q++)tree(60,80,q*1.05,14,3,r,.9,o);s+='<path class="ty-d" d="'+o.join('')+'"/>';var sp='';o.forEach(function(d){var m=d.match(/M([\d.]+) ([\d.]+)L([\d.]+) ([\d.]+)/);for(var u=.3;u<1;u+=.25){var x=+m[1]+(+m[3]-m[1])*u,y=+m[2]+(+m[4]-m[2])*u;sp+='M'+x.toFixed(1)+' '+y.toFixed(1)+'l2 -2'}});s+='<path class="ty-sp" d="'+sp+'"/><circle class="ty-s" cx="60" cy="80" r="8"/><path class="ty-a" d="M60 88L66 145"/>'}
 return '<svg viewBox="0 0 120 150" class="tysvg">'+s+'</svg>'}
var TYPES=[{k:'pyr',seed:7,n:'锥体神经元',w:'大脑皮层、海马',d:'皮层的主力,约占皮层神经元的八成。胞体像金字塔,一根长长的顶端树突伸向皮层表面,能在不同树突段上做不同的计算。用谷氨酸“踩油门”。',ch:'基础篇 · 第 4 章'},
 {k:'pv',seed:3,n:'篮状细胞(PV 中间神经元)',w:'皮层、海马',d:'抑制性的“节拍器”。轴突像篮子一样包住邻居锥体细胞的胞体,用 GABA 精确控制它们什么时候能放电,产生 γ 振荡。',ch:'基础篇'},
 {k:'pk',seed:11,n:'浦肯野细胞',w:'小脑',d:'树突是一把巨大的扁平扇子,单个细胞可接收约 20 万个突触输入,是全脑“最会收信”的神经元之一。负责校准动作的时机。',ch:'基础篇'},
 {k:'da',seed:5,n:'多巴胺神经元',w:'中脑(腹侧被盖区、黑质)',d:'胞体在中脑,轴突却远远伸到纹状体,在那里分出惊人数量的分支——人类一个黑质多巴胺神经元估计有上百万个突触。少数细胞,广播全脑。',ch:'第 7 章'},
 {k:'msn',seed:9,n:'中型多棘神经元',w:'纹状体',d:'纹状体里约 95% 都是它,树突上长满“刺”(树突棘)。分两类:D1 型推动“去做”,D2 型推动“先别做”。',ch:'第 7、8 章'}];
V.types=function(box){box.id='viz-types';var g=el('div','ty-grid',null,box);TYPES.forEach(function(t){var c=el('div','ty-card',null,g);c.innerHTML=drawType(t)+'<div><b>'+t.n+'</b><span class="ty-w">'+t.w+'</span><p>'+t.d+'</p><span class="ty-c">'+t.ch+'</span></div>'})};

/* --- 位置细胞 --- */
V.place=function(box){box.id='viz-place';var st=Z.Stage(box,260),R1=Z.Row(box),show=false;
 Z.Btn(R1,'换一个位置细胞',reset,1);var bs=Z.Btn(R1,'显示它的“放电野”',function(){show=!show;bs.textContent=show?'隐藏放电野':'显示它的“放电野”'});
 var rd=cap(box,'一只老鼠在方形场地里随便跑(蓝线)。我们记录它海马里的一个神经元:每次放电,就在老鼠当时的位置点一个红点。'),rat,fc,sp,tr,vx,vy;
 function reset(){rat=[.5,.5];vx=.1;vy=.05;fc=[.2+Math.random()*.6,.2+Math.random()*.6];sp=[];tr=[]}reset();
 var inst={tick:function(dt){var a=Math.atan2(vy,vx)+Z.randn()*2.2*dt,v=.28;vx=Math.cos(a)*v;vy=Math.sin(a)*v;rat[0]+=vx*dt;rat[1]+=vy*dt;
   if(rat[0]<.03||rat[0]>.97){vx=-vx;rat[0]=clamp(rat[0],.03,.97)}if(rat[1]<.03||rat[1]>.97){vy=-vy;rat[1]=clamp(rat[1],.03,.97)}
   tr.push(rat.slice());if(tr.length>1500)tr.shift();var d2=Math.pow(rat[0]-fc[0],2)+Math.pow(rat[1]-fc[1],2),rate=30*Math.exp(-d2/(2*.09*.09));
   if(Math.random()<rate*dt)sp.push(rat.slice());if(sp.length>400)sp.shift()},
  draw:function(){var c=st.ctx,w=st.w,h=st.h,P=Z.P,S=Math.min(w-20,h-20),ox=(w-S)/2,oy=10,X=function(x){return ox+x*S},Y=function(y){return oy+y*S};st.clear();
   c.strokeStyle=P.fg;c.lineWidth=2;c.strokeRect(ox,oy,S,S);
   if(show){var g=c.createRadialGradient(X(fc[0]),Y(fc[1]),0,X(fc[0]),Y(fc[1]),S*.2);g.addColorStop(0,rgba(P.hot,.35));g.addColorStop(1,rgba(P.hot,0));c.fillStyle=g;c.fillRect(ox,oy,S,S)}
   c.beginPath();tr.forEach(function(p,i){i?c.lineTo(X(p[0]),Y(p[1])):c.moveTo(X(p[0]),Y(p[1]))});c.strokeStyle=rgba(P.info,.25);c.lineWidth=1;c.stroke();
   sp.forEach(function(p){Z.dot(c,X(p[0]),Y(p[1]),2.6,P.hot)});
   c.font='18px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('🐭',X(rat[0]),Y(rat[1]));
   rd.innerHTML='已经放电 '+sp.length+' 次。红点只聚集在场地的一小块区域——这个神经元只在老鼠到达那里时才放电。海马里成千上万个位置细胞各管一块,合起来就是一张脑内地图(O’Keefe,2014 年诺贝尔奖)。'}};
 Z.mount(box,inst)};

/* --- 呼吸节拍器与心率 --- */
V.breath=function(box){box.id='viz-breath';var st=Z.Stage(box,230),R1=Z.Row(box),mode=1,t=0,hr=[],ph=0;
 var M=[['平常呼吸(约 15 次/分)',1.6,2.4,0,3],['慢呼吸(约 6 次/分)',4,6,0,8],['循环叹息',2,6,1,9]];var bb=[];
 M.forEach(function(m,i){bb.push(Z.Btn(R1,m[0],function(){mode=i;t=0;bb.forEach(function(b,j){b.className='demo-btn'+(j===i?' pri':'')})},i===1))});
 var rd=cap(box,'');
 var inst={tick:function(dt){t+=dt;var m=M[mode],cyc=m[1]+m[2]+(m[3]?.8:0),u=t%cyc,inh=m[3]?(u<m[1]?u/m[1]*.8:u<m[1]+.8?.8+(u-m[1])/.8*.2:1-(u-m[1]-.8)/m[2]):(u<m[1]?u/m[1]:1-(u-m[1])/m[2]);ph=inh;
   var target=66+(inh-.5)*m[4]+Z.randn()*.3;hr.push(target);if(hr.length>600)hr.shift()},
  draw:function(){var c=st.ctx,w=st.w,h=st.h,P=Z.P;st.clear();var m=M[mode],cyc=m[1]+m[2]+(m[3]?.8:0),u=t%cyc;
   var cx=70,cy=h/2-10,r=24+ph*40;c.beginPath();c.arc(cx,cy,r,0,7);c.fillStyle=rgba(P.ink,.18);c.fill();c.strokeStyle=P.ink;c.lineWidth=2;c.stroke();
   var lab=m[3]?(u<m[1]?'吸气':u<m[1]+.8?'再补吸一小口':'用嘴慢慢呼——'):(u<m[1]?'吸气':'呼气');Z.T(c,lab,cx,cy,{a:'center',c:P.fg,b:1,s:13});
   var l=150,rr=w-8,top=30,bot=h-30,Y=function(v){return bot-(v-58)/(78-58)*(bot-top)};
   Z.L(c,l,bot,rr,bot,P.rule);[60,66,72].forEach(function(v){Z.T(c,v+'',l-4,Y(v),{a:'right',s:10});Z.L(c,l,Y(v),rr,Y(v),rgba(P.rule,.5))});
   c.beginPath();hr.forEach(function(v,i){var x=rr-(hr.length-1-i)*(rr-l)/600;i?c.lineTo(x,Y(v)):c.moveTo(x,Y(v))});c.strokeStyle=P.hot;c.lineWidth=2;c.stroke();
   Z.T(c,'心率(次/分)',l,14,{c:P.fg,s:11});Z.T(c,'← 约 10 秒',l,h-12,{s:10});
   rd.innerHTML='吸气时心率略升,呼气时回落(呼吸性窦性心律不齐)。'+(mode===0?'呼吸快时这个起伏很小。':'慢下来、把呼气拉长,起伏明显变大——这是迷走神经“刹车”在更积极地工作。')+' 跟着圆圈呼吸几轮试试:吸 4 秒、呼 6 秒,约每分钟 6 次。(心率曲线为示意。)'}};
 Z.mount(box,inst)};

/* ================= 环路图(各章) ================= */
var CIR={
 fear:{t:'恐惧的两条路',body:0,ic:['eye'],steps:[
  {x:'草丛里有一个弯弯的东西。光信号从眼睛出发,先到达<b>丘脑</b>这个中转站。',h:['thal'],f:[['eye','thal']]},
  {x:'<b>快通道</b>:丘脑直接把粗糙的信号抄近路送到<b>杏仁核</b>,只要十几毫秒——还没看清,就已经报警。',h:['thal','amy'],f:[['thal','amy',{c:'bad',w:1}]]},
  {x:'杏仁核的输出端拉响警报:让<b>下丘脑</b>启动应激激素,让脑干的导水管周围灰质引起“僵住”,让<b>蓝斑</b>提高警觉、心跳加速。',h:['amy','hyp','lc','bs'],f:[['amy','hyp',{c:'bad'}],['amy','pag',{c:'bad'}],['amy','lc',{c:'bad'}]],lb:[['pag','导水管周围灰质']]},
  {x:'<b>慢通道</b>:同一份信号绕远路经视觉皮层仔细分析,几百毫秒后才送到杏仁核——“哦,是一根绳子。”',h:['thal','vc','amy'],f:[['thal','vc',{c:'info'}],['vc','amy',{c:'info',bend:-.25}]]},
  {x:'<b>腹内侧前额叶</b>给杏仁核踩刹车(⊣),警报解除。第 9 章的“重评”用的也是这条路。',h:['vmpfc','amy'],f:[['vmpfc','amy',{c:'ok',inh:1,w:1}]]}]},
 intero:{t:'身体信号怎样上行到岛叶',body:1,ic:['heart','gut'],steps:[
  {x:'心跳、血压、胃肠的状态,通过<b>迷走神经</b>和脊髓的小纤维往上报告。',h:['bs'],f:[['heart','nts',{c:'info'}],['gut','nts',{c:'info',bend:-.2}]],lb:[['nts','孤束核']]},
  {x:'在<b>脑干</b>的孤束核、臂旁核做初步整合,再经<b>丘脑</b>中继。',h:['bs','thal'],f:[['nts','pb',{c:'info'}],['pb','thal',{c:'info'}]],lb:[['pb','臂旁核']]},
  {x:'到达<b>后岛叶</b>,形成一张“身体状态地图”;再往前到前岛叶,和情境、情绪拼在一起,变成“我感觉怎样”。',h:['insula'],f:[['thal','insula',{c:'info'}]]},
  {x:'前岛叶与<b>前扣带</b>组成突显网络,决定哪些身体信号值得注意;同时向下发出预测,提前调节心率和血压。',h:['insula','acc'],f:[['insula','acc',{c:'ok'}],['acc','bs',{c:'hot',bend:-.3}],['nts','heart',{c:'hot',bend:.3}]]}]},
 dopa:{t:'多巴胺的三条主要通路',body:0,steps:[
  {x:'<b>中脑边缘通路</b>:腹侧被盖区 → 伏隔核。编码“比预期好多少”,驱动“想要”。',h:['vta','nacc'],f:[['vta','nacc']]},
  {x:'<b>中脑皮层通路</b>:腹侧被盖区 → 前额叶。影响工作记忆和认知控制,同样遵循倒 U 曲线。',h:['vta','pfc'],f:[['vta','pfc',{bend:-.15}]]},
  {x:'<b>黑质纹状体通路</b>:黑质 → 背侧纹状体。与动作启动和习惯有关;帕金森病就是这里的多巴胺神经元退化。',h:['vta','str'],f:[['vta','dls',{bend:-.3}],['vta','dms',{bend:-.2}]]},
  {x:'三条一起看:源头只有几十万个神经元,却影响学习、动机、动作三件大事。',h:['vta','nacc','pfc','str'],f:[['vta','nacc'],['vta','pfc',{bend:-.15}],['vta','dls',{bend:-.3}]]}]},
 net:{t:'三大网络怎样切换',body:0,steps:[
  {x:'<b>走神</b>:默认模式网络(内侧前额叶、后扣带、角回、海马)活跃,你在想过去、想未来、想自己。',h:['vmpfc','pcc','ang','hip'],f:[['vmpfc','pcc',{c:'info'}],['pcc','ang',{c:'info'}],['hip','pcc',{c:'info'}]]},
  {x:'<b>突显网络</b>(前岛叶 + 背侧前扣带)察觉到一件重要的事——比如有人叫你。',h:['insula','acc'],f:[['insula','acc',{c:'hot'}]]},
  {x:'突显网络扳动开关:压低默认模式网络(⊣),打开<b>执行控制网络</b>(背外侧前额叶 + 后顶叶),注意力转向外部任务。',h:['insula','acc','dlpfc','ppc'],f:[['acc','pcc',{c:'bad',inh:1}],['insula','dlpfc',{c:'ok'}],['dlpfc','ppc',{c:'ok'}]]},
  {x:'<b>反刍</b>:如果突显网络对内心的负面念头过度敏感,或者切换能力变弱,就会一次次把注意力拉回默认模式网络,卡在“想自己”的循环里。',h:['insula','acc','vmpfc','pcc'],f:[['acc','vmpfc',{c:'bad'}],['vmpfc','pcc',{c:'bad'}],['pcc','insula',{c:'bad',bend:.3}]]}]},
 hpa:{t:'压力的两条路:HPA 轴与蓝斑',body:1,ic:['adrenal'],steps:[
  {x:'快的一条:<b>蓝斑</b>在几秒内向全脑喷洒去甲肾上腺素,人立刻紧张起来。',h:['lc'],f:[['lc','pfc',{n:2}],['lc','amy',{n:2}],['lc','hip',{n:2}]]},
  {x:'慢的一条:<b>下丘脑</b>发出信号 → <b>垂体</b>向血液释放激素 → <b>肾上腺</b>分泌<b>皮质醇</b>,几十分钟内升高。',h:['hyp','pit'],f:[['hyp','pit'],['pit','adrenal',{dur:2.4}]]},
  {x:'皮质醇随血液回到大脑,作用于<b>海马、前额叶、杏仁核</b>上的受体,同时向下丘脑反馈,让压力反应收尾。',h:['hip','pfc','amy','hyp'],f:[['adrenal','hip',{c:'warn',bend:-.25,dur:2.6}],['adrenal','pfc',{c:'warn',bend:-.35,dur:2.8}],['adrenal','amy',{c:'warn',bend:-.2,dur:2.4}],['hip','hyp',{c:'ok',inh:1}]]},
  {x:'<b>长期高压</b>:前额叶、海马的树突回缩,杏仁核的树突反而增生——调节变弱、警报变强。好消息是,压力解除后前额叶大体可以恢复。',h:['pfc','hip','amy'],f:[['amy','pfc',{c:'bad'}]]}]},
 sleep:{t:'睡眠中,海马把记忆“教”给皮层',body:0,steps:[
  {x:'<b>白天</b>:经历先被海马快速记下,海马像一个临时记事本,把来自皮层各处的碎片绑在一起。',h:['hip'],f:[['vc','hip',{c:'info'}],['sm','hip',{c:'info'}],['pfc','hip',{c:'info',bend:-.2}]]},
  {x:'<b>深睡眠</b>:皮层慢振荡、丘脑纺锤波、海马尖波涟漪精确嵌套。在这个时间窗里,海马一遍遍快速回放白天的经历。',h:['hip','thal'],f:[['hip','vc',{c:'hot',dur:.8}],['hip','pfc',{c:'hot',dur:.8,bend:.2}],['thal','pfc',{c:'warn'}],['thal','vc',{c:'warn'}]]},
  {x:'<b>几天到几周后</b>:皮层各区之间直接建立起连接,记忆越来越不依赖海马,变成长期知识。',h:['pfc','vc','sm'],f:[['vc','pfc',{c:'ok',bend:-.15}],['sm','pfc',{c:'ok'}],['vc','sm',{c:'ok'}]]}]},
 habit:{t:'从目标导向到习惯',body:0,steps:[
  {x:'<b>刚开始</b>:前额叶 → 背内侧纹状体(尾状核)。你会想“这样做能得到什么”,结果的价值一变,行为就跟着变。',h:['pfc','str'],f:[['pfc','dms',{c:'info'}]],lb:[['dms','背内侧纹状体']]},
  {x:'<b>重复很多次后</b>:感觉运动皮层 → 背外侧纹状体(壳核)。线索一出现,动作就自动跑出来,不再考虑结果。',h:['sm','str'],f:[['sm','dls',{c:'hot'}]],lb:[['dls','背外侧纹状体']]},
  {x:'<b>控制权转移</b>:两套系统同时存在,谁说了算取决于练了多少、压力多大——压力大时,习惯系统更容易接管。',h:['pfc','sm','str'],f:[['pfc','dms',{c:'info',n:1}],['sm','dls',{c:'hot',n:4}]]}]},
 reap:{t:'认知重评的间接通路',body:0,steps:[
  {x:'看到一个让你难受的场景,<b>杏仁核</b>先给它标上“威胁”。',h:['amy'],f:[['thal','amy',{c:'bad'}]]},
  {x:'你换一种解释去看它:<b>背外侧前额叶</b>负责把新解释“挂”在脑子里。',h:['dlpfc'],f:[]},
  {x:'但前额叶外侧和杏仁核之间直接连接很少。新解释要经过<b>腹内侧前额叶</b>中转,再去抑制杏仁核(⊣)。',h:['dlpfc','vmpfc','amy'],f:[['dlpfc','vmpfc',{c:'ok'}],['vmpfc','amy',{c:'ok',inh:1,w:1}]]},
  {x:'这和恐惧消退走的是同一条路:旧解释没被删掉,只是被新解释压过。练得越多,新的那条路越粗。',h:['vmpfc','amy'],f:[['vmpfc','amy',{c:'ok',inh:1,w:1,n:5}]]}]},
 lc:{t:'蓝斑:全脑的增益旋钮',body:0,steps:[
  {x:'<b>相位模式</b>(专注):蓝斑平时安静,遇到和任务相关的事件就短暂爆发,把相关信号“调大”。',h:['lc'],f:[['lc','pfc',{n:1,dur:1.2}],['lc','ppc',{n:1,dur:1.2}]]},
  {x:'<b>紧张模式</b>(探索):基础放电整体升高,各种输入都被放大,注意力四处游走,更容易被新东西吸引。',h:['lc'],f:[['lc','pfc',{n:4,c:'warn'}],['lc','ppc',{n:4,c:'warn'}],['lc','vc',{n:4,c:'warn'}],['lc','hip',{n:4,c:'warn'}],['lc','cb',{n:3,c:'warn'}],['lc','thal',{n:3,c:'warn'}]]},
  {x:'谁来切换?<b>眶额皮层</b>和<b>前扣带</b>持续评估“这件事的回报还好吗”:回报下降,就推蓝斑转向紧张模式——该换个地方看看了。',h:['ofc','acc','lc'],f:[['ofc','lc',{c:'info',bend:.3}],['acc','lc',{c:'info',bend:.3}]]}]},
 vagus:{t:'心与脑的双向通路',body:1,ic:['heart','lung'],steps:[
  {x:'<b>上行</b>:每次心跳,血管上的压力感受器经迷走神经把信号传到脑干孤束核,再经丘脑到达岛叶和前扣带。',h:['bs','thal','insula','acc'],f:[['heart','nts',{c:'info'}],['nts','thal',{c:'info'}],['thal','insula',{c:'info'}],['insula','acc',{c:'info'}]],lb:[['nts','孤束核']]},
  {x:'所以在心脏收缩的那一瞬,同一张恐惧面孔会显得更可怕,杏仁核反应也更大。',h:['amy','insula'],f:[['insula','amy',{c:'bad'}]]},
  {x:'<b>下行</b>:前额叶抑制杏仁核(⊣),间接让迷走神经维持对心脏的“刹车”——心率变异性就是这个刹车灵活程度的外在指标。',h:['pfc','amy','bs'],f:[['pfc','amy',{c:'ok',inh:1}],['bs','heart',{c:'ok',bend:.25}]]},
  {x:'<b>呼吸是入口</b>:呼吸既自动、又能主动控制。放慢、拉长呼气,就能从下往上影响这整个系统。',h:['bs'],f:[['lung','bs',{c:'hot',bend:-.2}],['bs','heart',{c:'ok',bend:.25}]]}]}
};
V.circuit=function(box){var c=CIR[box.dataset.c];if(!c)return;var k=0,auto=null;
 el('div','viz-t',c.t,box);var wrap=el('div','viz-svg',null,box);wrap.innerHTML=brainSVG({body:c.body,icons:c.ic||[]});var svg=wrap.firstChild;
 var capx=cap(box,''),nav=el('div','viz-nav',null,box),pv=Z.Btn(nav,'◀',function(){go(k-1)}),dots=el('span','viz-dots',null,nav),nx=Z.Btn(nav,'下一步 ▶',function(){go(k+1)},1);
 var ap=Z.Btn(nav,'自动播放',function(){if(auto){clearInterval(auto);auto=null;ap.textContent='自动播放'}else{ap.textContent='停止';auto=setInterval(function(){go((k+1)%c.steps.length)},5000)}});
 c.steps.forEach(function(_,i){var d=el('button','vd',String(i+1),dots);d.type='button';d.addEventListener('click',function(){go(i)})});
 function go(i){k=clamp(i,0,c.steps.length-1);var s=c.steps[k];clearFx(svg);hl(svg,s.h||[]);(s.f||[]).forEach(function(f){flow(svg,f[0],f[1],f[2])});
  var seen={};(s.h||[]).forEach(function(id){if(R[id]&&!seen[id]){seen[id]=1;label(svg,id,R[id].n.replace(/(.+?)[((].*/,'$1').replace('与黑质','/黑质'))}});
  (s.lb||[]).forEach(function(l){label(svg,l[0],l[1],'alt')});(s.f||[]).forEach(function(f){[f[0],f[1]].forEach(function(p){if(ICONTXT[p]&&!seen[p]){seen[p]=1;label(svg,p,ICONTXT[p],'alt')}})});
  capx.innerHTML='<span class="viz-n">'+(k+1)+'/'+c.steps.length+'</span> '+s.x;pv.disabled=k===0;nx.disabled=k===c.steps.length-1;
  [].forEach.call(dots.children,function(d,j){d.classList.toggle('on',j===k)})}
 go(0)};

/* ================= 新章节的互动 ================= */
function tabs(box,names,on){var r=el('div','viz-chips one',null,box),row=el('div','chip-row',null,r),bs=[];names.forEach(function(n,i){var b=el('button','chip',n,row);b.type='button';b.addEventListener('click',function(){bs.forEach(function(x,j){x.classList.toggle('on',i===j)});on(i)});bs.push(b)});bs[0].classList.add('on');return r}

/* 第 13 章:四个错觉 */
V.illusions=function(box){var tb=tabs(box,['同一种灰','不存在的三角形','你的盲点','运动后效'],function(i){mode=i;flag=false;cd=0;upd()});
 var st=Z.Stage(box,260),R1=Z.Row(box),mode=0,flag=false,t=0,spin=0,cd=0,b1=Z.Btn(R1,'',function(){flag=!flag;if(mode===3){cd=flag?20:0}upd()},1),rd=cap(box,'');
 var TX=[['看左右两个小方块:哪个更亮?','把背景换成均匀的灰','恢复背景'],['你看到一个白色的三角形了吗?它的边其实一笔都没画。','把三个小圆转过去','转回来'],['手机离眼睛约 25–35 厘米。<b>闭上左眼</b>,用右眼盯住左边的「+」,慢慢把屏幕拉近或推远。到某个距离,右边的红点会消失,而条纹却是连着的——那一块其实什么都没看到,是大脑按周围的样子“补”上的。','换成没有条纹的背景','换回条纹'],['点按钮后<b>盯住旋转中心 20 秒</b>,别移开视线。停下来时继续盯着看。','开始(盯住中心)','停止']];
 function upd(){b1.textContent=TX[mode][flag?2:1];rd.innerHTML=TX[mode][0]+(mode===0&&flag?' <b>两个方块其实一模一样</b>,是同一个灰度值。大脑不是在测亮度,而是在推断“这块表面本身是什么颜色”,并自动扣除了周围的光线。':'')+(mode===1&&flag?' 三角形消失了。你的视觉系统看到三个缺口恰好对齐,判断“前面一定挡着一个东西”——视觉皮层 V2 区的神经元甚至会对这条“虚幻的边”放电。':'')+(mode===3&&!flag&&t>1?' 停下后,静止的螺旋看起来在<b>反方向</b>扩张或收缩。负责这个运动方向的神经元“累了”,相反方向暂时占了上风。':'')}
 upd();
 var inst={tick:function(dt){t+=dt;if(mode===3&&flag){spin+=dt*2.2;cd-=dt;if(cd<=0){flag=false;upd()}}},draw:function(){var c=st.ctx,w=st.w,h=st.h,P=Z.P;st.clear();
   if(mode===0){if(flag){c.fillStyle='rgb(128,128,128)';c.fillRect(0,0,w,h)}else{var g=c.createLinearGradient(0,0,w,0);g.addColorStop(0,'#111');g.addColorStop(1,'#eee');c.fillStyle=g;c.fillRect(0,0,w,h)}
    c.fillStyle='rgb(128,128,128)';c.fillRect(w*.22-24,h/2-24,48,48);c.fillRect(w*.78-24,h/2-24,48,48)}
   if(mode===1){c.fillStyle=P.panel;c.fillRect(0,0,w,h);var cx=w/2,cy=h/2+12,R=Math.min(w,h)*.36,pts=[[cx,cy-R],[cx-R*.87,cy+R*.5],[cx+R*.87,cy+R*.5]];
    pts.forEach(function(p){var a=Math.atan2(cy-p[1],cx-p[0]),rot=flag?Math.PI:0;c.beginPath();c.moveTo(p[0],p[1]);c.arc(p[0],p[1],26,a+.52+rot,a-.52+rot+Math.PI*2);c.closePath();c.fillStyle=P.fg;c.fill()});
    var q=[[cx,cy+R*1.0],[cx-R*.87,cy-R*.5],[cx+R*.87,cy-R*.5]];c.strokeStyle=P.fg;c.lineWidth=2;q.forEach(function(p,i){var a=q[(i+1)%3],b=q[(i+2)%3];[a,b].forEach(function(o){c.beginPath();c.moveTo(p[0]+(o[0]-p[0])*.18,p[1]+(o[1]-p[1])*.18);c.lineTo(p[0],p[1]);c.stroke()})})}
   if(mode===2){c.fillStyle='#fff';c.fillRect(0,0,w,h);if(!flag)for(var y=0;y<h;y+=14){c.fillStyle='#3a6ea5';c.fillRect(0,y,w,7)}
    c.fillStyle='#000';c.font='bold 34px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('+',w*.12,h/2);c.beginPath();c.arc(Math.min(w*.88,w*.12+300),h/2,11,0,7);c.fillStyle='#d33';c.fill()}
   if(mode===3){c.fillStyle=P.panel;c.fillRect(0,0,w,h);var cx3=w/2,cy3=h/2,Rm=Math.min(w,h)*.46;c.save();c.translate(cx3,cy3);c.rotate(-spin);c.strokeStyle=P.fg;c.lineWidth=6;
    for(var k=0;k<4;k++){c.beginPath();for(var s=0;s<=1;s+=.01){var a2=s*Math.PI*6+k*Math.PI/2,r2=s*Rm;s?c.lineTo(Math.cos(a2)*r2,Math.sin(a2)*r2):c.moveTo(0,0)}c.stroke()}c.restore();Z.dot(c,cx3,cy3,4,P.hot);
    if(flag)Z.T(c,Math.ceil(cd)+'',w-14,16,{a:'right',c:P.hot,b:1,s:16})}}};
 Z.mount(box,inst)};

/* 第 14 章:可变奖励与固定奖励 */
V.slot=function(box){var mode=0,V2=[0,0,0],n=0,hist=[],auto=0,acc=0;tabs(box,['不定时奖励(像信息流)','固定奖励(每第 3 次必有)'],function(i){mode=i;V2=[0,0,0];n=0;hist=[];upd()});
 var st=Z.Stage(box,190),R1=Z.Row(box);Z.Btn(R1,'↓ 下拉刷新',pull,1);Z.Btn(R1,'自动刷 40 次',function(){auto=40});var rd=cap(box,'');
 function pull(){n++;var s=mode===1?n%3:0,r=mode===1?(s===0?1:0):(Math.random()<.33?1:0),d=r-V2[s];V2[s]+=.25*d;hist.push({r:r,d:d});if(hist.length>24)hist.shift();upd()}
 function upd(){var m=hist.slice(-12),avg=m.length?m.reduce(function(a,x){return a+Math.max(0,x.d)},0)/m.length:0;
  rd.innerHTML='已刷 '+n+' 次。最近 12 次的“惊喜”(正的预测误差)平均 <b>'+avg.toFixed(2)+'</b>。'+(mode===0?' 不定时的奖励永远猜不准:每次中奖都是一个大惊喜,没中也只是小失望——于是总想“再刷一下”。':' 规律被学会以后,奖励来时已在预料之中,惊喜趋近于零——反而容易停下来。')}
 upd();
 var inst={tick:function(dt){if(auto>0){acc+=dt;if(acc>.12){acc=0;auto--;pull()}}},draw:function(){var c=st.ctx,w=st.w,P=Z.P;st.clear();var cw=(w-10)/24,b0=140;
   Z.T(c,'每次刷新的结果',6,12,{c:P.fg,s:11,b:1});Z.T(c,'预测误差 δ(多巴胺信号)',6,66,{c:P.fg,s:11,b:1});Z.L(c,6,b0,w-4,b0,P.rule);
   hist.forEach(function(x,i){var px=6+i*cw;c.font='15px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle=P.mute;c.fillText(x.r?'🎁':'·',px+cw/2,36);var hh=x.d*50;Z.bar(c,px+cw/2,b0,cw-4,Math.abs(hh)<1?1:hh,hh>=0?P.ok:P.bad)})}};
 Z.mount(box,inst)};

/* 第 15 章:挑战—技能 */
V.flow=function(box){var st=Z.Stage(box,250),R1=Z.Row(box),sk=Z.Slider(R1,'你的技能',0,10,.1,4,Z.f1),ch=Z.Slider(R1,'任务难度',0,10,.1,7,Z.f1),rd=cap(box,'');
 function zone(s,c){if(s<3&&c<3)return['冷漠','没挑战、也没机会施展:最容易去刷手机。'];if(c-s>1.6)return['焦虑','太难了:误差大到学不到东西,只剩压力。'];if(s-c>1.6)return['无聊','太简单了:一切都在预料之中,几乎没有新信息。'];return['心流','难度刚好够不着一点:每一步都有可学的误差,又不至于失控。']}
 var inst={tick:function(){},draw:function(){var c=st.ctx,w=st.w,h=st.h,P=Z.P;st.clear();var S=Math.min(h-40,w*.55),ox=34,oy=8,X=function(v){return ox+v/10*S},Y=function(v){return oy+S-v/10*S};
   c.fillStyle=rgba(P.bad,.10);c.beginPath();c.moveTo(X(0),Y(1.6));c.lineTo(X(8.4),Y(10));c.lineTo(X(0),Y(10));c.fill();
   c.fillStyle=rgba(P.info,.10);c.beginPath();c.moveTo(X(1.6),Y(0));c.lineTo(X(10),Y(8.4));c.lineTo(X(10),Y(0));c.fill();
   c.fillStyle=rgba(P.ok,.18);c.beginPath();c.moveTo(X(0),Y(1.6));c.lineTo(X(8.4),Y(10));c.lineTo(X(10),Y(10));c.lineTo(X(10),Y(8.4));c.lineTo(X(1.6),Y(0));c.lineTo(X(0),Y(0));c.fill();
   c.strokeStyle=P.rule;c.strokeRect(X(0),Y(10),S,S);Z.T(c,'焦虑',X(1.2),Y(8.6),{c:P.bad,b:1});Z.T(c,'无聊',X(7.4),Y(1.2),{c:P.info,b:1});Z.T(c,'心流',X(5.6),Y(6.4),{c:P.ok,b:1});Z.T(c,'冷漠',X(.3),Y(.6),{s:11});
   Z.T(c,'技能 →',X(10),Y(0)+14,{a:'right',s:10});c.save();c.translate(14,Y(5));c.rotate(-Math.PI/2);Z.T(c,'难度 →',0,0,{a:'center',s:10});c.restore();
   Z.dot(c,X(sk.v),Y(ch.v),8,P.hot);
   var p=1/(1+Math.exp(-(sk.v-ch.v)*.9)),gx=ox+S+24,gw=w-gx-8;if(gw>90){var gy=oy+S,gh=S*.6;Z.T(c,'学习速度(示意)',gx,gy-gh-14,{s:11,c:P.fg});
    Z.curve(c,function(a){return Math.exp(-Math.pow((a-.85)/.16,2))},.3,1,function(a){return gx+(a-.3)/.7*gw},function(v){return gy-v*gh},P.ink,2);Z.L(c,gx,gy,gx+gw,gy,P.rule);
    Z.T(c,'30%',gx,gy+12,{s:10});Z.T(c,'85%',gx+(.55/.7)*gw,gy+12,{a:'center',s:10,c:P.ok});Z.T(c,'100%',gx+gw,gy+12,{a:'right',s:10});var pp=clamp(p,.3,1);Z.dot(c,gx+(pp-.3)/.7*gw,gy-Math.exp(-Math.pow((pp-.85)/.16,2))*gh,5,P.hot);Z.T(c,'正确率',gx+gw/2,gy+26,{a:'center',s:10})}
   var z=zone(sk.v,ch.v);rd.innerHTML='你在<b>'+z[0]+'</b>区:'+z[1]+' 估计成功率约 '+Math.round(p*100)+'%。'}};
 Z.mount(box,inst)};

/* 第 16 章:远距离联想小游戏 */
V.rat=function(box){var Q=[['电','汽','火','车','交通工具'],['冰','雪','山','峰','山的最高处'],['烟','灯','篝','火','会燃烧'],['书','雨','风','声','耳朵听到的'],['海','心','眼','底','最下面'],['春','晚','微','风','空气在流动'],['阳','目','灯','光','能照亮东西'],['铁','水','马','路','用脚走的']];
 var k=0,t0=Date.now(),tally={i:0,a:0},w=el('div','rat',null,box);
 function show(){var q=Q[k];w.innerHTML='<div class="rat-q">'+q.slice(0,3).map(function(x){return '<span>'+x+'</span>'}).join('')+'</div><p class="rat-h">找一个字,能和上面三个字分别组成常用词。('+(k+1)+'/'+Q.length+')</p><div class="demo-row"><input class="rat-in" maxlength="2" placeholder="?" aria-label="答案"><button type="button" class="demo-btn pri rat-ok">确定</button><button type="button" class="demo-btn rat-hint">提示</button><button type="button" class="demo-btn rat-skip">看答案</button></div><p class="rat-msg"></p>';
  t0=Date.now();var inp=w.querySelector('.rat-in'),msg=w.querySelector('.rat-msg');
  w.querySelector('.rat-ok').onclick=function(){var v=inp.value.trim();if(v===q[3])solved(true);else msg.innerHTML='不对哦,再想想。卡住的时候先别硬想,看看别处再回来。'};
  inp.onkeydown=function(e){if(e.key==='Enter')w.querySelector('.rat-ok').click()};
  w.querySelector('.rat-hint').onclick=function(){msg.innerHTML='提示:'+q[4]};w.querySelector('.rat-skip').onclick=function(){solved(false)}}
 function solved(ok){var q=Q[k],s=((Date.now()-t0)/1000).toFixed(0),msg=w.querySelector('.rat-msg');
  msg.innerHTML=(ok?'答对了!用时 '+s+' 秒。':'答案是「'+q[3]+'」:'+q.slice(0,3).map(function(x){return x+q[3]}).join('、')+'。')+(ok?'<br>这个答案是怎么来的? <button type="button" class="demo-btn rat-i">一下子冒出来的</button> <button type="button" class="demo-btn rat-a">一个个试出来的</button>':'<br><button type="button" class="demo-btn pri rat-n">下一题</button>');
  var bi=msg.querySelector('.rat-i'),ba=msg.querySelector('.rat-a'),bn=msg.querySelector('.rat-n');if(bi){bi.onclick=function(){tally.i++;next()};ba.onclick=function(){tally.a++;next()}}if(bn)bn.onclick=next}
 function next(){k++;if(k>=Q.length){w.innerHTML='<p class="rat-h">做完了!你有 <b>'+tally.i+'</b> 题是“一下子冒出来”的,<b>'+tally.a+'</b> 题是“试出来”的。研究发现,用顿悟方式得出的答案往往更准——那种“就是它!”的感觉,常常意味着大脑已经在后台完成了搜索。</p><button type="button" class="demo-btn pri">再来一遍</button>';w.querySelector('button').onclick=function(){k=0;tally={i:0,a:0};show()};return}show()}
 show()};

/* 第 17 章:实践—认识的螺旋 */
V.spiral=function(box){var st=Z.Stage(box,250),R1=Z.Row(box),b,pts,n;
 Z.Btn(R1,'去实践一次',function(){step(true)},1);Z.Btn(R1,'只在脑子里想一次',function(){step(false)});Z.Btn(R1,'重来',reset);var rd=cap(box,'');
 function reset(){b=[-.8,.75];pts=[b.slice()];n={p:0,t:0}}reset();
 function step(prac){if(prac){n.p++;var e=[-b[0]+Z.randn()*.06,-b[1]+Z.randn()*.06],rot=.7,ex=e[0]*Math.cos(rot)-e[1]*Math.sin(rot),ey=e[0]*Math.sin(rot)+e[1]*Math.cos(rot);b=[b[0]+.45*ex,b[1]+.45*ey]}else{n.t++;b=[b[0]+Z.randn()*.08,b[1]+Z.randn()*.08]}pts.push(b.slice());if(pts.length>60)pts.shift()}
 var inst={tick:function(){},draw:function(){var c=st.ctx,w=st.w,h=st.h,P=Z.P;st.clear();var cx=w/2,cy=h/2,S=Math.min(w,h)*.42,X=function(x){return cx+x*S},Y=function(y){return cy+y*S};
   [1,.66,.33].forEach(function(r){c.beginPath();c.arc(cx,cy,r*S,0,7);c.strokeStyle=rgba(P.rule,.8);c.lineWidth=1;c.stroke()});Z.dot(c,cx,cy,7,P.ok);Z.T(c,'客观规律',cx,cy+18,{a:'center',c:P.ok,s:11,b:1});
   c.beginPath();pts.forEach(function(p,i){i?c.lineTo(X(p[0]),Y(p[1])):c.moveTo(X(p[0]),Y(p[1]))});c.strokeStyle=rgba(P.ink,.6);c.lineWidth=1.5;c.stroke();
   pts.forEach(function(p){Z.dot(c,X(p[0]),Y(p[1]),2,P.ink)});Z.dot(c,X(b[0]),Y(b[1]),7,P.hot);Z.T(c,'你的认识',X(b[0])+10,Y(b[1])-10,{c:P.hot,s:11,b:1});
   var err=Math.sqrt(b[0]*b[0]+b[1]*b[1]);rd.innerHTML='实践 '+n.p+' 次,空想 '+n.t+' 次,认识与规律的距离 <b>'+err.toFixed(2)+'</b>。'+(n.t>n.p?' 只在脑子里想,没有误差信号,认识只会原地打转——这正是回避的代价(第 2 章)。':' 每次实践带回一个误差,认识沿着螺旋一圈圈逼近规律:“实践、认识、再实践、再认识”。')}};
 Z.mount(box,inst)};

/* 第 17 章:量变与质变(双稳态) */
V.bistable=function(box){var st=Z.Stage(box,220),R1=Z.Row(box),sh=Z.Slider(R1,'一点点积累的变化',-.7,.7,.01,-.3,Z.f2),R2=Z.Row(box),x=-1,run=0;
 Z.Btn(R2,'每天进步一点',function(){run=1},1);Z.Btn(R2,'每天退一点',function(){run=-1});Z.Btn(R2,'停',function(){run=0});var rd=cap(box,'');
 function U(v,hh){return v*v*v*v/4-v*v/2-hh*v}
 var inst={tick:function(dt){if(run){sh.set(clamp(sh.v+run*dt*.12,-.7,.7));if(Math.abs(sh.v)>=.7)run=0}var hh=sh.v;for(var i=0;i<20;i++)x-=(x*x*x-x-hh)*dt*.15+Z.randn()*.002},
  draw:function(){var c=st.ctx,w=st.w,h=st.h,P=Z.P,hh=sh.v;st.clear();var X=function(v){return w/2+v*w*.28},Y=function(u){return h-30-(u+.4)*((h-60)/1.25)};
   Z.curve(c,function(v){return U(v,hh)},-1.75,1.75,X,Y,P.ink,2.5);Z.dot(c,X(x),Y(U(x,hh))-9,9,P.hot);
   Z.T(c,'旧状态',X(-1.1),h-12,{a:'center',c:P.mute,s:11});Z.T(c,'新状态',X(1.1),h-12,{a:'center',c:P.ok,s:11,b:1});
   var crit=.385;rd.innerHTML='小球现在在<b>'+(x>0?'新':'旧')+'状态</b>。'+(Math.abs(hh)<crit?' 积累的变化还没越过临界点:表面看“没变化”,其实地形一直在倾斜——这是量变。':' 越过临界点,原来那个低谷消失,系统一下子跳到另一边——这是质变。')+' 再试着往回拉:要退到比原来更远的地方才会跳回去(滞后)。好习惯和坏习惯都是这样:形成难,形成后也不容易掉回去。'}};
 Z.mount(box,inst)};

/* ================= 真实标本照片 + 编号定位 ================= */
var BEAL='John A. Beal, PhD(美国路易斯安那州立大学健康科学中心),<a href="https://creativecommons.org/licenses/by/2.5/" target="_blank" rel="noopener">CC BY 2.5</a>,来自维基共享资源';
var PH=[
 {t:'外侧面',src:'figs/real/brain-lateral.webp',w:701,h:487,note:'左半球,脸朝左。蓝线是两条最重要的沟,绿线是顶叶与枕叶的大致分界。',
  pins:[[1,'额叶',[[182,263]],'pfc','约占皮层三分之一。最前面那部分就是前额叶:计划、控制冲动、工作记忆。'],[2,'顶叶',[[418,172]],'ppc','整合身体感觉与空间信息,参与注意的分配。'],[3,'颞叶',[[445,312]],'','听觉与语言理解;它的内侧深处藏着海马和杏仁核。'],[4,'枕叶',[[632,247]],'vc','视觉皮层所在。'],[5,'外侧裂',[[241,323]],'insula','大脑侧面最深的一道沟。把它扒开,里面藏着岛叶。'],[6,'中央沟',[[334,141]],'sm','前面一条是运动皮层,后面一条是触觉皮层。'],[7,'顶枕沟',[[617,113]],'','顶叶与枕叶的分界。'],[9,'额极',[[20,233]],'','额叶的最前端。'],[11,'颞极',[[187,404]],'','颞叶的最前端,杏仁核就在它后上方的深处。']],credit:BEAL,url:'https://commons.wikimedia.org/wiki/File:Human_brain_lateral_view_description.JPG'},
 {t:'正中切面',src:'figs/real/brain-midsagittal.webp',w:701,h:488,note:'左半脑从正中剖开,<b>脸朝右</b>。穹窿和透明隔已被切除,露出脑室内部和它周围的深部核团。',
  pins:[[1,'尾状核头部',[[480,250]],'str','纹状体的一部分,在脑室外侧壁鼓起一大块。'],[2,'尾状核体部',[[352,173],[230,195]],'str','尾状核向后延伸,弯成 C 形。'],[3,'侧脑室前角',[[558,241]],'','充满脑脊液的腔室(标本中已流空)。'],[4,'侧脑室体部',[[300,157],[133,225]],'',''],[5,'丘脑',[[245,237],[283,291]],'thal','感觉信息的中转站。'],[6,'丘脑间黏合',[[322,315]],'','连接左右丘脑的一小块组织,有些人没有。'],[7,'下丘脑 / 第三脑室',[[345,353]],'hyp','体温、饥饿、应激激素的总开关就在这一小块。']],credit:BEAL,url:'https://commons.wikimedia.org/wiki/File:Human_brain_left_dissected_midsagittal_view_description.JPG'},
 {t:'冠状切面',src:'figs/real/brain-coronal.webp',w:702,h:487,note:'像切面包一样从耳朵前后的位置竖着切下一片(左下角小图里的蓝线),正对着你的是切面。这一刀恰好切过本书最常出场的几个深部结构。',
  pins:[[20,'扣带回',[[375,143]],'acc','它的前部就是前扣带皮层:发现冲突与出错。'],[19,'胼胝体',[[354,177]],'','连接左右半球的最大纤维束,约 2 亿根轴突。'],[14,'尾状核',[[413,186]],'str','纹状体的一部分。'],[10,'丘脑',[[377,241]],'thal','几乎所有感觉信号的中转站。'],[11,'内囊',[[431,254]],'','大脑与脊髓之间上下行纤维的必经通道,这里一个小中风就可能导致半身不遂。'],[12,'壳核',[[452,254]],'str','纹状体的另一部分,与习惯和动作有关。'],[23,'岛叶',[[485,219]],'insula','藏在外侧裂深处的“岛”,汇总身体内部的感觉。'],[26,'海马',[[462,297]],'hip','卷在颞叶内侧,负责写入新记忆。'],[29,'黑质',[[386,298]],'vta','肉眼就能看到的一条深色带,富含多巴胺神经元。帕金森病就是这里的细胞退化。'],[9,'第三脑室',[[347,266]],'',''],[5,'脑桥',[[358,363]],'bs','脑干的一部分。'],[1,'脊髓',[[357,470]],'','']],credit:BEAL,url:'https://commons.wikimedia.org/wiki/File:Human_brain_frontal_(coronal)_section_description_2.JPG'}];
V.photo=function(box){box.id='viz-photo';var cur=0,sel=null;
 tabs(box,PH.map(function(p){return p.t}),function(i){cur=i;sel=null;draw()});
 var wrap=el('div','ph-wrap',null,box),img=el('img',null,null,wrap),pins=el('div',null,null,wrap),note=el('div','viz-cap',null,box),leg=el('div','ph-legend',null,box),info=el('div','ph-info',null,box),cr=el('span','credit',null,box);
 img.alt='真实人脑标本照片';img.loading='lazy';
 function draw(){var p=PH[cur];img.src=p.src;img.width=p.w;img.height=p.h;note.innerHTML=p.note;cr.innerHTML='照片:'+p.credit+' · <a href="'+p.url+'" target="_blank" rel="noopener">原图与编号说明</a>';
  leg.innerHTML='';p.pins.forEach(function(q,i){var b=el('button','chip'+(sel===i?' on':''),'<b>'+q[0]+'</b>'+q[1],leg);b.type='button';b.addEventListener('click',function(){sel=i;draw()})});
  pins.innerHTML='';if(sel!=null){var q=p.pins[sel];q[2].forEach(function(xy){var d=el('div','ph-pin',null,pins);d.style.left=(xy[0]/p.w*100)+'%';d.style.top=(xy[1]/p.h*100)+'%'});
   info.innerHTML='<b>'+q[0]+' · '+q[1]+'</b>　'+(q[4]||'')+(q[3]&&card(q[3])?'<a href="#" data-k="'+q[3]+'">看它的图卡 →</a>':'');var a=info.querySelector('a');if(a)a.addEventListener('click',function(e){e.preventDefault();openPop(a.dataset.k)})}
  else info.innerHTML='点下面的名字,或直接点照片上的数字,看它是什么。'}
 img.addEventListener('click',function(e){var p=PH[cur],r=img.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*p.w,y=(e.clientY-r.top)/r.height*p.h,best=-1,bd=60;
  p.pins.forEach(function(q,i){q[2].forEach(function(xy){var d=Math.hypot(xy[0]-x,xy[1]-y);if(d<bd){bd=d;best=i}})});if(best>=0){sel=best;draw()}});
 draw()};

/* ================= 启动 ================= */
[].forEach.call(document.querySelectorAll('.viz[data-viz]'),function(b){var f=V[b.dataset.viz];if(f)try{f(b)}catch(e){console.error(b.dataset.viz,e)}});
linkTerms();
})();
