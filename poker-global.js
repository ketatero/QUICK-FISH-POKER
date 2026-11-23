(()=>{
// Poker rules engine. All chip amounts are integer units of $0.05.
const SUITS=['♠','♥','♦','♣'];
const RANKS=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const money=n=>'$'+(n/20).toFixed(2);
const cardText=c=>`${RANKS[c.r-2]}${SUITS[c.s]}`;
const deck=()=>{const d=[];for(let s=0;s<4;s++)for(let r=2;r<=14;r++)d.push({r,s});for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}return d};
const cmp=(a,b)=>{for(let i=0;i<Math.max(a.length,b.length);i++){const x=a[i]||0,y=b[i]||0;if(x!==y)return x-y}return 0};
function fiveRank(cs){const rs=cs.map(c=>c.r).sort((a,b)=>b-a), counts={};rs.forEach(r=>counts[r]=(counts[r]||0)+1);const groups=Object.entries(counts).map(([r,n])=>[+r,n]).sort((a,b)=>b[1]-a[1]||b[0]-a[0]);const flush=cs.every(c=>c.s===cs[0].s);const uniq=[...new Set(rs)];if(uniq[0]===14)uniq.push(1);let straight=0;for(let i=0;i<=uniq.length-5;i++)if(uniq[i]-uniq[i+4]===4){straight=uniq[i];break}
 if(flush&&straight)return [8,straight];if(groups[0][1]===4)return [7,groups[0][0],groups[1][0]];if(groups[0][1]===3&&groups[1][1]===2)return [6,groups[0][0],groups[1][0]];if(flush)return [5,...rs];if(straight)return [4,straight];if(groups[0][1]===3)return [3,groups[0][0],...groups.slice(1).map(x=>x[0]).sort((a,b)=>b-a)];if(groups[0][1]===2&&groups[1][1]===2)return [2,Math.max(groups[0][0],groups[1][0]),Math.min(groups[0][0],groups[1][0]),groups.find(x=>x[1]===1)[0]];if(groups[0][1]===2)return [1,groups[0][0],...groups.slice(1).map(x=>x[0]).sort((a,b)=>b-a)];return [0,...rs]}
const HANDS=['ハイカード','ワンペア','ツーペア','スリーカード','ストレート','フラッシュ','フルハウス','フォーカード','ストレートフラッシュ'];
function evaluate(cards){let best=null;for(let a=0;a<cards.length-4;a++)for(let b=a+1;b<cards.length-3;b++)for(let c=b+1;c<cards.length-2;c++)for(let d=c+1;d<cards.length-1;d++)for(let e=d+1;e<cards.length;e++){const rank=fiveRank([cards[a],cards[b],cards[c],cards[d],cards[e]]);if(!best||cmp(rank,best)>0)best=rank}return best}
const compareHands=(a,b)=>cmp(a,b);
function distributePots(players,button,board=[]){ // players: {id, chips, total, folded, hand}
 const levels=[...new Set(players.map(p=>p.total).filter(n=>n>0))].sort((a,b)=>a-b);let prev=0;const pots=[];
 for(const level of levels){const contributors=players.filter(p=>p.total>=level), amount=(level-prev)*contributors.length, eligible=contributors.filter(p=>!p.folded);if(amount&&eligible.length) pots.push({amount,eligible:eligible.map(p=>p.id)});else if(amount&&pots.length){ // folded-only upper layers are dead money for the last eligible pot
 pots[pots.length-1].amount+=amount;}else if(amount){for(const p of contributors)p.chips+=level-prev;}prev=level}
 for(const pot of pots){const ranked=pot.eligible.map(id=>({id,rank:evaluate([...players.find(p=>p.id===id).hand,...board])})).sort((a,b)=>-cmp(a.rank,b.rank));if(!ranked.length||!ranked[0].rank)throw new Error('Cannot settle a pot without a complete 5-card hand');const winners=ranked.filter(x=>cmp(x.rank,ranked[0].rank)===0).map(x=>x.id);let each=Math.floor(pot.amount/winners.length),rem=pot.amount%winners.length;const order=players.map((p,i)=>({id:p.id,dist:(i-button-1+players.length)%players.length})).sort((a,b)=>a.dist-b.dist).map(x=>x.id);for(const id of order.filter(id=>winners.includes(id))){let won=each+(rem>0?1:0);if(rem)rem--;players.find(p=>p.id===id).chips+=won;}pot.winners=winners;pot.rank=ranked[0].rank;}
 return pots;
}

window.GoldenPoker={deck,evaluate,HANDS,money,cardText,distributePots};
})();
