const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const WIDTH = 800, HEIGHT = 600;
const BLACK = "#0f0f19", WHITE = "#f5f5f5", YELLOW = "#f0dc46", BLUE = "#4682e0", GREEN = "#46c864", RED = "#e64646";
const QUESTIONS = [
 {question:"Quanto que e 2F em hexadecimal para decimal?", answer:"47"},
 {question:"Quanto que corresponde 10101001 de binario para decimal?", answer:"169"},
 {question:"100101+101001 em binario?", answer:"1001110"},
 {question:"Qual a funcao do clock da cpu", options:["A) Mudar de estado os registradores","B) Operar o ALU e todo barramento"], answer:"B"},
 {question:"O ALU tem como operacao a soma?(sim/nao)", answer:"sim"},
 {question:"Quantos bits cabem em 8 bytes?", answer:"64"},
 {question:"Qual linguagem usada pela CPU?", answer:"binario"},
 {question:"Funcao de comparacao qual e?", options:["A) XOR","B) AND"], answer:"A"},
 {question:"Pode Passar de o enter", answer:""},
 {question:"Cite as portas mais utilizadas de dois pinos", options:["A) NOT, FLIPFLOP, AND","B) XOR, NOR, AND"], answer:"B"}
];
const BRICK_COLORS = ["#e64646","#f09632","#46c864","#4682e0","#aa50dc"];
let paddle = { x: WIDTH/2-60, y: HEIGHT-50, w:120, h:15, speed:400 };
let ball = { x: WIDTH/2, y: HEIGHT-100, r:7, vx: 280, vy:-280, maxSpeed:650 };
let bricks = [], scores = {1:0,2:0}, lives = {1:3,2:3}, currentPlayer = 1;
let currentQuestion = null, answerText = "", playerChange = false, changeReason = "", gameFinished = false, paused = false, keys = {};

function createBricks(){
  bricks=[]; let bw=85,bh=30,gap=8,cols=8,rows=6,totalW=cols*bw+(cols-1)*gap,startX=(WIDTH-totalW)/2,startY=80,positions=[];
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) positions.push({x:startX+c*(bw+gap), y:startY+r*(bh+gap)});
  positions.sort(()=>Math.random()-0.5);
  for(let i=0;i<Math.min(10,QUESTIONS.length);i++){ if(!positions.length) break; let p=positions.pop(),q=QUESTIONS[i]; bricks.push({x:p.x,y:p.y,w:bw,h:bh,color:YELLOW,type:"question",question:q.question,answer:q.answer,options:q.options,number:i+1}); }
  for(let i=0;i<8;i++){ if(!positions.length) break; let p=positions.pop(); bricks.push({x:p.x,y:p.y,w:bw,h:bh,color:BRICK_COLORS[Math.floor(Math.random()*BRICK_COLORS.length)],type:"normal",points:10}); }
}
function resetBall(){ ball.x=WIDTH/2; ball.y=HEIGHT-100; ball.vx=(Math.random()>0.5?1:-1)*280; ball.vy=-280; }
function resetPaddle(){ paddle.x=WIDTH/2-paddle.w/2; }
let lastTime=0;
function loop(ts){ if(!lastTime) lastTime=ts; let dt=Math.min((ts-lastTime)/1000,0.033); lastTime=ts; update(dt); draw(); requestAnimationFrame(loop); }
function update(dt){
  if(gameFinished||paused||currentQuestion||playerChange) return;
  let dir=0; if(keys['ArrowLeft']||keys['a']) dir--; if(keys['ArrowRight']||keys['d']) dir++; paddle.x+=dir*paddle.speed*dt; paddle.x=Math.max(0,Math.min(WIDTH-paddle.w,paddle.x));
  ball.x+=ball.vx*dt; ball.y+=ball.vy*dt;
  if(ball.x-ball.r<=0){ball.x=ball.r; ball.vx=Math.abs(ball.vx);} if(ball.x+ball.r>=WIDTH){ball.x=WIDTH-ball.r; ball.vx=-Math.abs(ball.vx);} if(ball.y-ball.r<=0){ball.y=ball.r; ball.vy=Math.abs(ball.vy);}
  if(ball.vy>0 && ball.x>paddle.x && ball.x<paddle.x+paddle.w && ball.y+ball.r>paddle.y && ball.y-ball.r<paddle.y+paddle.h){ ball.y=paddle.y-ball.r; let rel=(ball.x-(paddle.x+paddle.w/2))/(paddle.w/2); let angle=rel*70*Math.PI/180; let speed=Math.sqrt(ball.vx*ball.vx+ball.vy*ball.vy); ball.vx=Math.sin(angle)*speed; ball.vy=-Math.cos(angle)*speed; }
  for(let i=0;i<bricks.length;i++){ let b=bricks[i]; if(ball.x+ball.r>b.x && ball.x-ball.r<b.x+b.w && ball.y+ball.r>b.y && ball.y-ball.r<b.y+b.h){ if(Math.abs(ball.x-(b.x+b.w/2))/(b.w/2) > Math.abs(ball.y-(b.y+b.h/2))/(b.h/2)){ ball.vx*=-1; }else{ ball.vy*=-1; } if(b.type==="normal"){ scores[currentPlayer]+=10; bricks.splice(i,1); if(bricks.length===0) gameFinished=true; }else{ currentQuestion=b; answerText=""; } break; } }
  if(ball.y-ball.r>HEIGHT){ lives[currentPlayer]--; if(lives[currentPlayer]<=0){ playerChange=true; changeReason=`Jogador ${currentPlayer} perdeu as 3 vidas!`; }else{ resetBall(); resetPaddle(); } }
}
function draw(){ ctx.fillStyle=BLACK; ctx.fillRect(0,0,WIDTH,HEIGHT); bricks.forEach(b=>{ ctx.fillStyle=b.color; ctx.beginPath(); ctx.roundRect(b.x,b.y,b.w,b.h,6); ctx.fill(); ctx.fillStyle=WHITE; ctx.font="16px Arial"; ctx.textAlign="center"; ctx.fillText(b.type==="question"?b.number:"",b.x+b.w/2,b.y+b.h/2+5); }); ctx.fillStyle=WHITE; ctx.beginPath(); ctx.roundRect(paddle.x,paddle.y,paddle.w,paddle.h,8); ctx.fill(); ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fill(); ctx.font="16px Arial"; ctx.textAlign="left"; ctx.fillStyle=currentPlayer===1?GREEN:WHITE; ctx.fillText(`J1 ${scores[1]} pts Vidas:${lives[1]}`,15,28); ctx.textAlign="right"; ctx.fillStyle=currentPlayer===2?GREEN:WHITE; ctx.fillText(`J2 ${scores[2]} pts Vidas:${lives[2]}`,WIDTH-15,28); ctx.textAlign="center"; ctx.fillStyle=YELLOW; ctx.font="12px Arial"; ctx.fillText(`VEZ DO JOGADOR ${currentPlayer}`,WIDTH/2,32); if(currentQuestion) drawQ(); if(playerChange){ ctx.fillStyle="rgba(0,0,0,0.9)"; ctx.fillRect(0,0,WIDTH,HEIGHT); ctx.fillStyle=RED; ctx.fillText(changeReason,WIDTH/2,120); ctx.fillStyle=YELLOW; ctx.font="bold 30px Arial"; ctx.fillText(`VEZ DO JOGADOR ${currentPlayer===1?2:1}`,WIDTH/2,190); ctx.fillStyle=GREEN; ctx.font="18px Arial"; ctx.fillText("Pressione ENTER",WIDTH/2,430);} if(gameFinished){ ctx.fillStyle="rgba(0,0,0,0.9)"; ctx.fillRect(0,0,WIDTH,HEIGHT); ctx.fillStyle=YELLOW; ctx.font="bold 32px Arial"; ctx.fillText("FIM DE JOGO",WIDTH/2,100); ctx.fillStyle=WHITE; ctx.font="20px Arial"; ctx.fillText(`J1:${scores[1]} J2:${scores[2]}`,WIDTH/2,220); ctx.fillText(scores[1]>scores[2]?"J1 VENCEU":scores[2]>scores[1]?"J2 VENCEU":"EMPATE",WIDTH/2,300); ctx.fillText("ENTER = jogar de novo",WIDTH/2,400);} }
function drawQ(){ ctx.fillStyle="rgba(8,8,18,0.92)"; ctx.fillRect(0,0,WIDTH,HEIGHT); ctx.fillStyle="#191928"; ctx.beginPath(); ctx.roundRect(40,40,WIDTH-80,HEIGHT-80,15); ctx.fill(); ctx.strokeStyle=BLUE; ctx.stroke(); ctx.fillStyle=YELLOW; ctx.font="bold 22px Arial"; ctx.fillText(`PERGUNTA ${currentQuestion.number}`,WIDTH/2,80); ctx.fillStyle=WHITE; ctx.font="18px Arial"; let words=currentQuestion.question.split(" "), lines=[], cur=""; for(let w of words){ let test=cur+" "+w; if(ctx.measureText(test).width<600) cur=test.trim(); else{lines.push(cur); cur=w;} } if(cur) lines.push(cur); let y=120; lines.forEach(l=>{ctx.fillText(l,WIDTH/2,y); y+=24}); if(currentQuestion.options){ y+=10; currentQuestion.options.forEach((opt,i)=>{ ctx.fillStyle=BLUE; ctx.beginPath(); ctx.roundRect(100,y+i*60,WIDTH-200,45,8); ctx.fill(); ctx.fillStyle=WHITE; ctx.textAlign="left"; ctx.fillText(opt,115,y+i*60+28); }); }else{ ctx.fillStyle=WHITE; ctx.beginPath(); ctx.roundRect(WIDTH/2-200,y+10,400,50,8); ctx.fill(); ctx.fillStyle=BLACK; ctx.textAlign="left"; ctx.fillText(answerText,WIDTH/2-185,y+40); ctx.textAlign="center"; ctx.fillStyle="#aaa"; ctx.font="12px Arial"; ctx.fillText("Digite e de ENTER",WIDTH/2,y+80); } }
window.addEventListener('keydown',e=>{ keys[e.key]=true; if(e.key==='p') paused=!paused; if(currentQuestion && currentQuestion.options){ let m={a:0,b:1,c:2,d:3,A:0,B:1,C:2,D:3}; if(m[e.key]!==undefined){ let idx=m[e.key], lette=String.fromCharCode(65+idx); if(lette===currentQuestion.answer){ bricks.splice(bricks.indexOf(currentQuestion),1); scores[currentPlayer]+=100; if(!bricks.length) gameFinished=true; }else{ playerChange=true; changeReason="Errou a pergunta!"; } currentQuestion=null; } }else if(currentQuestion){ if(e.key==='Backspace') answerText=answerText.slice(0,-1); if(e.key==='Enter'){ let norm=s=>s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""); if(norm(answerText)===norm(currentQuestion.answer)||currentQuestion.answer===""){ bricks.splice(bricks.indexOf(currentQuestion),1); scores[currentPlayer]+=100; if(!bricks.length) gameFinished=true; }else{ playerChange=true; changeReason="Errou a pergunta!"; } currentQuestion=null; } if(e.key.length===1 && e.key!=='Enter') answerText+=e.key; } if(playerChange && e.key==='Enter'){ currentPlayer=currentPlayer===1?2:1; lives[currentPlayer]=3; resetBall(); resetPaddle(); playerChange=false; } if(gameFinished && e.key==='Enter'){ scores={1:0,2:0}; lives={1:3,2:3}; currentPlayer=1; createBricks(); resetBall(); resetPaddle(); gameFinished=false; } });
window.addEventListener('keyup',e=>keys[e.key]=false);
canvas.addEventListener('click',e=>{ if(!currentQuestion||!currentQuestion.options) return; let r=canvas.getBoundingClientRect(), mx=(e.clientX-r.left)*(WIDTH/r.width), my=(e.clientY-r.top)*(HEIGHT/r.height); let startY=150; currentQuestion.options.forEach((opt,i)=>{ let ry=startY+i*60; if(mx>100&&mx<WIDTH-100&&my>ry&&my<ry+45){ let l=String.fromCharCode(65+i); if(l===currentQuestion.answer){ bricks.splice(bricks.indexOf(currentQuestion),1); scores[currentPlayer]+=100; if(!bricks.length) gameFinished=true; }else{ playerChange=true; changeReason="Errou a pergunta!"; } currentQuestion=null; } }); });
createBricks(); resetBall(); requestAnimationFrame(loop);
