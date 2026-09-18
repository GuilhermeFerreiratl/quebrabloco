const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const WIDTH = 800, HEIGHT = 600;
const YELLOW = "#f0dc46", BLUE = "#4682e0", GREEN = "#46c864", RED = "#e64646", WHITE = "#f5f5f5", BLACK="#0f0f19";

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
const BRICK_COLORS = ["#e64646","#f09632","#46c864","#4682e0"];

let paddle = {x:WIDTH/2-60, y:HEIGHT-50, w:120, h:15, speed:400};
let ball = {x:0, y:0, r:7, vx:0, vy:0, onPaddle:true};
let bricks=[], scores={1:0,2:0}, lives={1:3,2:3}, currentPlayer=1;
let currentQuestion=null, answerText="", gameState="WAITING", message="", messageTimer=0, keys={};

function createBricks(){
  bricks=[]; let bw=85,bh=30,gap=8,cols=8,rows=6,totalW=cols*bw+(cols-1)*gap,startX=(WIDTH-totalW)/2,startY=80,pos=[];
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) pos.push({x:startX+c*(bw+gap), y:startY+r*(bh+gap)});
  pos.sort(()=>Math.random()-0.5);
  for(let i=0;i<10;i++){ if(!pos.length) break; let p=pos.pop(), q=QUESTIONS[i%QUESTIONS.length]; bricks.push({x:p.x,y:p.y,w:bw,h:bh,color:YELLOW,type:"question",question:q.question,answer:q.answer,options:q.options,number:i+1}); }
  for(let i=0;i<8;i++){ if(!pos.length) break; let p=pos.pop(); bricks.push({x:p.x,y:p.y,w:bw,h:bh,color:BRICK_COLORS[i%4],type:"normal"}); }
}
function resetBallOnPaddle(){ ball.onPaddle=true; ball.vx=0; ball.vy=0; ball.x=paddle.x+paddle.w/2; ball.y=paddle.y-ball.r-2; }
function launchBall(){ if(!ball.onPaddle) return; ball.onPaddle=false; ball.vx=(Math.random()>0.5?1:-1)*280; ball.vy=-280; gameState="PLAYING"; }

function loop(ts){ update(ts); draw(); requestAnimationFrame(loop); }
let last=0;
function update(ts){
  if(!last) last=ts; let dt=Math.min((ts-last)/1000,0.033); last=ts;
  if(currentQuestion) return;
  if(gameState==="MESSAGE"){ messageTimer-=dt; if(messageTimer<=0){ gameState="WAITING"; resetBallOnPaddle(); } return; }
  if(gameState==="WAITING"){ let dir=0; if(keys['ArrowLeft']||keys['a']) dir--; if(keys['ArrowRight']||keys['d']) dir++; paddle.x+=dir*paddle.speed*dt; paddle.x=Math.max(0,Math.min(WIDTH-paddle.w,paddle.x)); if(ball.onPaddle){ ball.x=paddle.x+paddle.w/2; ball.y=paddle.y-ball.r-2; } return; }
  // PLAYING
  let dir=0; if(keys['ArrowLeft']||keys['a']) dir--; if(keys['ArrowRight']||keys['d']) dir++; paddle.x+=dir*paddle.speed*dt; paddle.x=Math.max(0,Math.min(WIDTH-paddle.w,paddle.x));
  ball.x+=ball.vx*dt; ball.y+=ball.vy*dt;
  if(ball.x-ball.r<=0){ball.x=ball.r; ball.vx=Math.abs(ball.vx);} if(ball.x+ball.r>=WIDTH){ball.x=WIDTH-ball.r; ball.vx=-Math.abs(ball.vx);} if(ball.y-ball.r<=0){ball.y=ball.r; ball.vy=Math.abs(ball.vy);}
  if(ball.vy>0 && ball.x>paddle.x && ball.x<paddle.x+paddle.w && ball.y+ball.r>paddle.y){ ball.y=paddle.y-ball.r; let rel=(ball.x-(paddle.x+paddle.w/2))/(paddle.w/2); ball.vx=rel*300; ball.vy=-Math.abs(ball.vy); }
  for(let i=0;i<bricks.length;i++){ let b=bricks[i]; if(ball.x+ball.r>b.x && ball.x-ball.r<b.x+b.w && ball.y+ball.r>b.y && ball.y-ball.r<b.y+b.h){ ball.vy*=-1; if(b.type==="normal"){ bricks.splice(i,1); if(bricks.length===0) gameState="GAMEOVER"; }else{ currentQuestion=b; } break; } }
  if(ball.y-ball.r>HEIGHT){ lives[currentPlayer]--; if(lives[currentPlayer]<=0){ // troca jogador
      message=`Jogador ${currentPlayer} ficou sem vidas!`; messageTimer=2;
      currentPlayer=currentPlayer===1?2:1; lives[currentPlayer]=3; // reseta vidas do proximo? Se quiser manter, apaga essa linha
      // Se o outro também não tem vida = fim
      if(lives[1]<=0 && lives[2]<=0) gameState="GAMEOVER"; else { gameState="MESSAGE"; setTimeout(()=>{ gameState="WAITING"; resetBallOnPaddle(); message=`Vez do Jogador ${currentPlayer}`; },2000); }
    }else{ message=`Voce perdeu uma vida! Restam ${lives[currentPlayer]}`; messageTimer=1.5; gameState="MESSAGE"; }
  }
}

function draw(){
  ctx.fillStyle=BLACK; ctx.fillRect(0,0,WIDTH,HEIGHT);
  bricks.forEach(b=>{ ctx.fillStyle=b.color; ctx.beginPath(); ctx.roundRect(b.x,b.y,b.w,b.h,6); ctx.fill(); ctx.fillStyle=b.type==="question"?BLACK:WHITE; ctx.font="bold 14px Arial"; ctx.textAlign="center"; ctx.fillText(b.type==="question"?b.number:"",b.x+b.w/2,b.y+b.h/2+5); });
  ctx.fillStyle=WHITE; ctx.beginPath(); ctx.roundRect(paddle.x,paddle.y,paddle.w,paddle.h,8); ctx.fill();
  ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fill();
  ctx.font="16px Arial"; ctx.textAlign="left"; ctx.fillStyle=currentPlayer===1?GREEN:WHITE; ctx.fillText(`J1 ${scores[1]} pts Vidas:${lives[1]}`,15,28);
  ctx.textAlign="right"; ctx.fillStyle=currentPlayer===2?GREEN:WHITE; ctx.fillText(`J2 ${scores[2]} pts Vidas:${lives[2]}`,WIDTH-15,28);
  ctx.textAlign="center"; ctx.fillStyle=YELLOW; ctx.font="bold 14px Arial"; ctx.fillText(`VEZ DO JOGADOR ${currentPlayer}`,WIDTH/2,32);

  if(gameState==="WAITING"){ ctx.fillStyle="rgba(0,0,0,0.7)"; ctx.fillRect(0,0,WIDTH,HEIGHT); ctx.fillStyle=YELLOW; ctx.font="bold 24px Arial"; ctx.fillText(`Jogador ${currentPlayer} - Aperte ESPACO para INICIAR`,WIDTH/2,HEIGHT/2); ctx.fillStyle=GREEN; ctx.beginPath(); ctx.roundRect(WIDTH/2-80,HEIGHT/2+20,160,45,10); ctx.fill(); ctx.fillStyle=BLACK; ctx.font="bold 18px Arial"; ctx.fillText("INICIAR JOGO",WIDTH/2,HEIGHT/2+48); }
  if(gameState==="MESSAGE"){ ctx.fillStyle=RED; ctx.font="bold 26px Arial"; ctx.fillText(message,WIDTH/2,HEIGHT/2); }
  if(currentQuestion) drawQuestion();
  if(gameState==="GAMEOVER"){ ctx.fillStyle="rgba(0,0,0,0.9)"; ctx.fillRect(0,0,WIDTH,HEIGHT); ctx.fillStyle=YELLOW; ctx.font="bold 32px Arial"; ctx.fillText("FIM DE JOGO",WIDTH/2,120); ctx.fillStyle=WHITE; ctx.font="20px Arial"; ctx.fillText(`J1: ${scores[1]} pontos | J2: ${scores[2]} pontos`,WIDTH/2,200); ctx.fillText(scores[1]>scores[2]?"J1 VENCEU":scores[2]>scores[1]?"J2 VENCEU":"EMPATE",WIDTH/2,280); ctx.fillStyle=GREEN; ctx.fillText("Pressione ENTER para jogar de novo",WIDTH/2,350); }
}
function drawQuestion(){
  ctx.fillStyle="rgba(8,8,18,0.95)"; ctx.fillRect(0,0,WIDTH,HEIGHT); ctx.fillStyle="#191928"; ctx.beginPath(); ctx.roundRect(40,40,WIDTH-80,HEIGHT-80,15); ctx.fill(); ctx.strokeStyle=BLUE; ctx.lineWidth=2; ctx.stroke();
  ctx.fillStyle=YELLOW; ctx.font="bold 22px Arial"; ctx.textAlign="center"; ctx.fillText(`PERGUNTA ${currentQuestion.number}`,WIDTH/2,80);
  ctx.fillStyle=WHITE; ctx.font="18px Arial"; let words=currentQuestion.question.split(" "), lines=[], cur=""; for(let w of words){ let t=cur+" "+w; if(ctx.measureText(t).width<600) cur=t.trim(); else{lines.push(cur); cur=w;} } if(cur) lines.push(cur); let y=120; lines.forEach(l=>{ctx.fillText(l,WIDTH/2,y); y+=24});
  if(currentQuestion.options){ y+=10; currentQuestion.options.forEach((opt,i)=>{ ctx.fillStyle=BLUE; ctx.beginPath(); ctx.roundRect(100,y+i*60,WIDTH-200,45,8); ctx.fill(); ctx.fillStyle=WHITE; ctx.textAlign="left"; ctx.font="16px Arial"; ctx.fillText(opt,115,y+i*60+28); }); }else{ ctx.fillStyle=WHITE; ctx.beginPath(); ctx.roundRect(WIDTH/2-200,y+10,400,50,8); ctx.fill(); ctx.fillStyle=BLACK; ctx.textAlign="left"; ctx.font="18px Arial"; ctx.fillText(answerText,WIDTH/2-185,y+40); }
}
window.addEventListener('keydown',e=>{
  keys[e.key]=true;
  if(e.code==='Space' && gameState==="WAITING") launchBall();
  if(currentQuestion && currentQuestion.options){ let m={a:0,b:1,c:2,d:3,A:0,B:1,C:2,D:3}; if(m[e.key]!==undefined){ let idx=m[e.key], lette=String.fromCharCode(65+idx); if(lette===currentQuestion.answer){ scores[currentPlayer]+=1; bricks.splice(bricks.indexOf(currentQuestion),1); message="Correto! +1 ponto"; }else{ message="Errou! Passa a vez"; currentPlayer=currentPlayer===1?2:1; } currentQuestion=null; messageTimer=1.5; gameState="MESSAGE"; } }
  else if(currentQuestion){ if(e.key==='Backspace') answerText=answerText.slice(0,-1); if(e.key==='Enter'){ let norm=s=>s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""); if(norm(answerText)===norm(currentQuestion.answer)||currentQuestion.answer===""){ scores[currentPlayer]+=1; bricks.splice(bricks.indexOf(currentQuestion),1); message="Correto! +1 ponto"; gameState="MESSAGE"; messageTimer=1.5; }else{ message="Errou! Passa a vez"; currentPlayer=currentPlayer===1?2:1; gameState="MESSAGE"; messageTimer=1.5; } currentQuestion=null; answerText=""; } if(e.key.length===1 && e.key!=='Enter') answerText+=e.key; }
  if(gameState==="GAMEOVER" && e.key==='Enter'){ scores={1:0,2:0}; lives={1:3,2:3}; currentPlayer=1; createBricks(); resetBallOnPaddle(); gameState="WAITING"; }
});
window.addEventListener('keyup',e=>keys[e.key]=false);
canvas.addEventListener('click',e=>{
  if(gameState==="WAITING"){ let r=canvas.getBoundingClientRect(), mx=(e.clientX-r.left)*(WIDTH/r.width), my=(e.clientY-r.top)*(HEIGHT/r.height); if(mx>WIDTH/2-80&&mx<WIDTH/2+80&&my>HEIGHT/2+20&&my<HEIGHT/2+65){ launchBall(); return; } }
  if(!currentQuestion||!currentQuestion.options) return; let r=canvas.getBoundingClientRect(), mx=(e.clientX-r.left)*(WIDTH/r.width), my=(e.clientY-r.top)*(HEIGHT/r.height); let startY=155; currentQuestion.options.forEach((opt,i)=>{ let ry=startY+i*60; if(mx>100&&mx<WIDTH-100&&my>ry&&my<ry+45){ let l=String.fromCharCode(65+i); if(l===currentQuestion.answer){ scores[currentPlayer]+=1; bricks.splice(bricks.indexOf(currentQuestion),1); message="Correto! +1 ponto"; }else{ message="Errou! Passa a vez"; currentPlayer=currentPlayer===1?2:1; } currentQuestion=null; gameState="MESSAGE"; messageTimer=1.5; } });
});
createBricks(); resetBallOnPaddle(); requestAnimationFrame(loop);
