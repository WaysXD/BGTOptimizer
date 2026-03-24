import { useState, useEffect, useMemo } from "react";

const FACTORY = "0x94Ad6Ac84f6C6FbA8b8CCbD71d9f4f101def52a8";
const WBERA   = "0x6969696969696969696969696969696969696969";
const HONEY   = "0xfcbd14dc51f0a4d49d5e53c2e0950e0bc26d0dce";
const RPC_URL = "/api/rpc";
const SPY     = 31_536_000;

const C = {
  bg0:"#08090c", bg1:"#0f1117", bg2:"#151820", bg3:"#1c2030",
  border:"#22283a", border2:"#2c3450",
  text0:"#eceae5", text1:"#9198a8", text2:"#515869",
  honey:"#f5a623", honeyDim:"#2e1f08", honeyGlow:"#f5a62344",
  green:"#38d98a", greenDim:"#0a2018",
  red:"#f06060",   redDim:"#2a0d0d",
  blue:"#5aade8",  blueDim:"#0c1a2a",
  purple:"#b07cf8",purpleDim:"#1a0d30",
  mono:"'JetBrains Mono','Fira Code','Courier New',monospace",
  sans:"'Inter','SF Pro Display',system-ui,sans-serif",
};

const PMAP = {honey:"Bend",bex:"BEX",berps:"Berps",ibera:"Infrared",ibgt:"Infrared",smilee:"Smilee",kodiak:"Kodiak",beradrome:"Beradrome",nav:"NAV",yeet:"Yeet",re7:"Re7"};
const STAB = new Set([HONEY,"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"]);

function guessProt(n="",s=""){const q=(n+s).toLowerCase();for(const[k,v]of Object.entries(PMAP))if(q.includes(k))return v;return"Unknown";}
function aprC(a){if(a>=500)return C.honey;if(a>=100)return C.green;if(a>=20)return C.text0;return C.text2;}
function aprPill(a){if(a>=500)return{bg:C.honeyDim,c:C.honey};if(a>=100)return{bg:C.greenDim,c:C.green};if(a>=20)return{bg:C.bg3,c:C.text1};return{bg:C.bg2,c:C.text2};}
function fmt(n,d=2){if(n==null||isNaN(n))return"—";if(n>=1e9)return(n/1e9).toFixed(1)+"B";if(n>=1e6)return(n/1e6).toFixed(1)+"M";if(n>=1e3)return(n/1e3).toFixed(1)+"K";return n.toFixed(d);}

const SEL={
  "allVaultsLength()":"0x36deba41","allVaults(uint256)":"0xf01aa5e7",
  "rewardRate()":"0x7b0a47ee","periodFinish()":"0xebe2b12b",
  "totalSupply()":"0x18160ddd","stakingToken()":"0x72f702f3",
  "symbol()":"0x95d89b41","name()":"0x06fdde03",
};
const enc=n=>BigInt(n).toString(16).padStart(64,"0");
const ec=(sig,...a)=>SEL[sig]+a.map(enc).join("");
const dU=h=>BigInt("0x"+h.slice(2,66));
const dA=h=>"0x"+h.slice(2).slice(24,64).toLowerCase();
const dS=h=>{try{const r=h.slice(2);const o=parseInt(r.slice(0,64),16)*2;const l=parseInt(r.slice(o,o+64),16);const b=r.slice(o+64,o+64+l*2);return decodeURIComponent(b.replace(/../g,"%$&"));}catch{return"?";}};

async function rc(to,data){
  const r=await fetch(RPC_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"eth_call",params:[{to,data},"latest"]})});
  const j=await r.json();
  if(j.error)throw new Error(j.error.message);
  return j.result;
}

const MOCK=[
  {id:1,protocol:"BEX",name:"HONEY / WBERA",symbol:"BEX-LP",apr:2847,bgtPerDay:0.89,tvl:18400000,type:"AMM",active:true},
  {id:2,protocol:"BEX",name:"BERA / USDC.e",symbol:"BEX-LP",apr:1203,bgtPerDay:0.51,tvl:11200000,type:"AMM",active:true},
  {id:3,protocol:"BEX",name:"WETH / HONEY",symbol:"BEX-LP",apr:724,bgtPerDay:0.38,tvl:8600000,type:"AMM",active:true},
  {id:4,protocol:"BEX",name:"WBTC / HONEY",symbol:"BEX-LP",apr:612,bgtPerDay:0.29,tvl:6900000,type:"AMM",active:true},
  {id:5,protocol:"Infrared",name:"iBERA Vault",symbol:"iBERA",apr:431,bgtPerDay:0.22,tvl:42000000,type:"LST",active:true},
  {id:6,protocol:"Smilee",name:"SMILEE / HONEY",symbol:"SMILEE-LP",apr:389,bgtPerDay:0.19,tvl:3200000,type:"Options",active:true},
  {id:7,protocol:"Kodiak",name:"BERA / HONEY",symbol:"KDK-LP",apr:298,bgtPerDay:0.15,tvl:7100000,type:"CL-AMM",active:true},
  {id:8,protocol:"Beradrome",name:"BERA / BERO",symbol:"BRO-LP",apr:241,bgtPerDay:0.14,tvl:4400000,type:"ve-AMM",active:true},
  {id:9,protocol:"Berps",name:"HONEY Vault",symbol:"bHONEY",apr:187,bgtPerDay:0.09,tvl:24000000,type:"Perps",active:true},
  {id:10,protocol:"NAV",name:"NAV Vault",symbol:"NAV-LP",apr:143,bgtPerDay:0.07,tvl:2100000,type:"RWA",active:true},
  {id:11,protocol:"Yeet",name:"YEET / BERA",symbol:"YEET-LP",apr:98,bgtPerDay:0.04,tvl:1800000,type:"Meme",active:true},
  {id:12,protocol:"Bend",name:"Re7 HONEY Lend",symbol:"aHONEY",apr:42,bgtPerDay:0.02,tvl:31000000,type:"Lending",active:true},
  {id:13,protocol:"Bend",name:"WBTC Collateral",symbol:"aWBTC",apr:19,bgtPerDay:0.008,tvl:18000000,type:"Lending",active:true},
  {id:14,protocol:"Bend",name:"WETH Supply",symbol:"aWETH",apr:11,bgtPerDay:0.005,tvl:12000000,type:"Lending",active:false},
];

const TPILL={
  "AMM":{bg:C.blueDim,c:C.blue},"CL-AMM":{bg:C.blueDim,c:C.blue},"ve-AMM":{bg:C.blueDim,c:C.blue},
  "LST":{bg:C.greenDim,c:C.green},"Perps":{bg:C.redDim,c:C.red},"Lending":{bg:C.honeyDim,c:C.honey},
  "Options":{bg:C.purpleDim,c:C.purple},"RWA":{bg:C.bg3,c:C.text1},"Meme":{bg:C.redDim,c:C.red},
};

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap');
.br *{box-sizing:border-box;}
.br input[type=text],.br input[type=number]{background:${C.bg3};border:1px solid ${C.border2};border-radius:8px;color:${C.text0};font-size:13px;padding:7px 12px;outline:none;transition:border-color .15s;font-family:inherit;}
.br input[type=text]:focus,.br input[type=number]:focus{border-color:${C.honey}77;}
.br input[type=number]{font-family:${C.mono};}
.br input[type=range]{-webkit-appearance:none;width:100%;height:3px;border-radius:2px;background:${C.border2};outline:none;}
.br input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;background:${C.honey};cursor:pointer;box-shadow:0 0 8px ${C.honey}55;}
.br input[type=checkbox]{accent-color:${C.honey};cursor:pointer;}
.br-row:hover td{background:${C.bg2}!important;}
.br-row{transition:background .1s;}
.pill-btn{font-size:12px;padding:4px 12px;border-radius:20px;border:1px solid ${C.border};background:transparent;color:${C.text1};cursor:pointer;font-family:inherit;transition:all .15s;}
.pill-btn:hover{border-color:${C.border2};color:${C.text0};}
.pill-btn.on{border-color:${C.honey}66;background:${C.honeyDim};color:${C.honey};}
.blink{display:inline-block;width:6px;height:6px;border-radius:50%;}
.blink-green{background:${C.green};box-shadow:0 0 6px ${C.green};animation:bk 2s ease-in-out infinite;}
.blink-honey{background:${C.honey};box-shadow:0 0 6px ${C.honey};}
@keyframes bk{0%,100%{opacity:1}50%{opacity:.3}}
.hov-card{transition:border-color .2s,transform .2s;}
.hov-card:hover{border-color:${C.honey}44!important;transform:translateY(-1px);}
.hov-card.gold{border-color:${C.honey}55!important;}
.sort-th{cursor:pointer;user-select:none;}
.sort-th:hover{color:${C.text0}!important;}
.lnk{color:${C.honey};text-decoration:none;font-size:12px;opacity:.75;transition:opacity .15s;}
.lnk:hover{opacity:1;}
`;

export default function App(){
  const[vaults,setV]=useState([]);
  const[bera,setBera]=useState(null);
  const[status,setSt]=useState("loading");
  const[sk,setSk]=useState("apr");
  const[sd,setSd]=useState("desc");
  const[ft,setFt]=useState("All");
  const[search,setSrch]=useState("");
  const[amt,setAmt]=useState(1000);
  const[ao,setAo]=useState(true);

  useEffect(()=>{
    if(document.getElementById("bgt-css"))return;
    const s=document.createElement("style");s.id="bgt-css";s.textContent=CSS;document.head.appendChild(s);
  },[]);

  useEffect(()=>{
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=berachain-bera&vs_currencies=usd")
      .then(r=>r.json()).then(d=>setBera(d["berachain-bera"]?.usd))
      .catch(()=>fetch("https://coins.llama.fi/prices/current/coingecko:berachain-bera")
        .then(r=>r.json()).then(d=>setBera(d?.coins?.["coingecko:berachain-bera"]?.price))
        .catch(()=>setBera(4.50)));
  },[]);

  useEffect(()=>{
    async function load(){
      try{
        const lh=await rc(FACTORY,SEL["allVaultsLength()"]);
        const cnt=Number(dU(lh));
        if(!cnt)throw new Error("no vaults");
        const MAX=Math.min(cnt,60);
        const addrs=[];
        for(let i=0;i<MAX;i++){const h=await rc(FACTORY,ec("allVaults(uint256)",i));addrs.push(dA(h));}
        const rows=await Promise.all(addrs.map(async(vault,idx)=>{
          try{
            const[rr,pf,ts,st]=await Promise.all([
              rc(vault,SEL["rewardRate()"]),rc(vault,SEL["periodFinish()"]),
              rc(vault,SEL["totalSupply()"]),rc(vault,SEL["stakingToken()"]),
            ]);
            const rewardRate=Number(dU(rr))/1e36;
            const periodFinish=Number(dU(pf));
            const totalSupply=Number(dU(ts))/1e18;
            const stakingToken=dA(st);
            const now=Math.floor(Date.now()/1000);
            const active=periodFinish>now&&rewardRate>0;
            let symbol="LP",name="Unknown Vault";
            try{const[sh,nh]=await Promise.all([rc(stakingToken,SEL["symbol()"]),rc(stakingToken,SEL["name()"])]);symbol=dS(sh);name=dS(nh);}catch{}
            const isStable=STAB.has(stakingToken.toLowerCase());
            const sp=isStable?1.0:(stakingToken.toLowerCase()===WBERA.toLowerCase()?(bera||4.5):null);
            const bpd=rewardRate*86400;
            const bpy=rewardRate*SPY;
            const bp=bera||4.5;
            const tvl=sp?totalSupply*sp:null;
            const apr=tvl&&tvl>0?(bpy*bp/tvl)*100:null;
            return{id:idx+1,vault,symbol,name,protocol:guessProt(name,symbol),apr,bgtPerDay:bpd,tvl,type:"Vault",active};
          }catch{return null;}
        }));
        setV(rows.filter(Boolean));setSt("live");
      }catch{setV(MOCK);setSt("mock");}
    }
    load();
  },[bera]);

  const sorted=useMemo(()=>{
    let v=[...vaults];
    if(ao)v=v.filter(x=>x.active!==false);
    if(ft!=="All")v=v.filter(x=>x.type===ft);
    if(search){const q=search.toLowerCase();v=v.filter(x=>(x.name+x.symbol+x.protocol).toLowerCase().includes(q));}
    v.sort((a,b)=>{const av=a[sk]??-Infinity,bv=b[sk]??-Infinity;return sd==="desc"?bv-av:av-bv;});
    return v;
  },[vaults,sk,sd,ft,search,ao]);

  const stats=useMemo(()=>{
    const a=vaults.filter(v=>v.active!==false);
    const aprs=a.map(v=>v.apr).filter(n=>n!=null&&n>0);
    const tvls=a.map(v=>v.tvl).filter(n=>n!=null&&n>0);
    return{count:a.length,topApr:aprs.length?Math.max(...aprs):null,avgApr:aprs.length?aprs.reduce((a,b)=>a+b,0)/aprs.length:null,totalTvl:tvls.length?tvls.reduce((a,b)=>a+b,0):null};
  },[vaults]);

  const types=useMemo(()=>["All",...new Set(vaults.map(v=>v.type).filter(Boolean))],[vaults]);
  const top3=useMemo(()=>[...vaults].filter(v=>v.active!==false&&v.apr!=null&&v.apr>0).sort((a,b)=>b.apr-a.apr).slice(0,3),[vaults]);

  function ts(k){if(sk===k)setSd(d=>d==="desc"?"asc":"desc");else{setSk(k);setSd("desc");}}
  const Arr=({k})=><span style={{fontSize:10,marginLeft:3,opacity:sk===k?.9:.2}}>{sk===k?(sd==="desc"?"▼":"▲"):"⇅"}</span>;

  const th={padding:"10px 14px",fontSize:11,color:C.text2,textAlign:"left",borderBottom:`1px solid ${C.border}`,letterSpacing:"0.05em",textTransform:"uppercase",fontWeight:500};
  const td={padding:"11px 14px",fontSize:13,borderBottom:`1px solid ${C.border}`,verticalAlign:"middle",background:C.bg1};

  return(
    <div className="br" style={{background:C.bg0,minHeight:"100vh",fontFamily:C.sans,color:C.text0,padding:"1.5rem"}}>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1.75rem"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}>
            <span style={{fontSize:22,fontWeight:600,letterSpacing:"-0.02em"}}>🐻 BGT Yield Optimizer</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,fontSize:12,color:C.text2}}>
            <span>Berachain mainnet · Proof-of-Liquidity vaults</span>
            {status==="live"&&<span><span className="blink blink-green" style={{marginRight:5}}/> live</span>}
            {status==="mock"&&<span><span className="blink blink-honey" style={{marginRight:5}}/> demo data</span>}
            {status==="loading"&&<span>loading…</span>}
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10,color:C.text2,marginBottom:2,letterSpacing:"0.06em",textTransform:"uppercase"}}>BERA / USD</div>
          <div style={{fontFamily:C.mono,fontSize:28,fontWeight:500,color:C.honey,lineHeight:1,textShadow:`0 0 20px ${C.honeyGlow}`}}>
            {bera?`$${bera.toFixed(2)}`:"—"}
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:12,marginBottom:"1.75rem"}}>
        {[
          {label:"Active vaults",value:status==="loading"?"…":stats.count,sub:"accepting deposits"},
          {label:"Top APR",value:stats.topApr!=null?fmt(stats.topApr,0)+"%":"…",sub:"highest single vault",hi:true},
          {label:"Average APR",value:stats.avgApr!=null?fmt(stats.avgApr,0)+"%":"…",sub:"across active vaults"},
          {label:"Trackable TVL",value:stats.totalTvl!=null?"$"+fmt(stats.totalTvl):"…",sub:"priced vaults only"},
        ].map(s=>(
          <div key={s.label} className="hov-card" style={{background:C.bg1,border:`1px solid ${C.border}`,borderRadius:12,padding:"1rem 1.2rem"}}>
            <div style={{fontSize:10,color:C.text2,marginBottom:6,letterSpacing:"0.05em",textTransform:"uppercase"}}>{s.label}</div>
            <div style={{fontFamily:C.mono,fontSize:24,fontWeight:500,lineHeight:1.1,color:s.hi?C.honey:C.text0}}>{s.value}</div>
            <div style={{fontSize:11,color:C.text2,marginTop:5}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {top3.length>0&&(
        <div style={{marginBottom:"1.75rem"}}>
          <div style={{fontSize:10,color:C.text2,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:10}}>Top opportunities</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:12}}>
            {top3.map((v,i)=>{
              const p=aprPill(v.apr||0);
              return(
                <div key={v.id} className={`hov-card${i===0?" gold":""}`}
                  style={{background:C.bg1,border:`1px solid ${i===0?C.honey+"44":C.border}`,borderRadius:14,padding:"1.1rem 1.25rem",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at top left,${C.honey}07 0%,transparent 60%)`,pointerEvents:"none"}}/>
                  {i===0&&<div style={{fontSize:10,background:C.honeyDim,color:C.honey,padding:"2px 10px",borderRadius:20,display:"inline-block",marginBottom:10,letterSpacing:"0.06em",textTransform:"uppercase",fontWeight:500}}>★ Highest yield</div>}
                  <div style={{fontWeight:500,fontSize:14,marginBottom:2}}>{v.protocol}</div>
                  <div style={{fontSize:12,color:C.text2,marginBottom:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.name}</div>
                  <div style={{fontFamily:C.mono,fontSize:26,fontWeight:500,color:p.c,lineHeight:1,marginBottom:2}}>{fmt(v.apr,0)}%</div>
                  <div style={{fontSize:11,color:C.text2,marginBottom:10}}>BGT APR</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    {v.tvl!=null?<span style={{fontSize:12,color:C.text1}}>TVL: <span style={{fontFamily:C.mono}}>${fmt(v.tvl)}</span></span>:<span/>}
                    <a href={`https://hub.berachain.com/earn/${v.vault||""}`} className="lnk">Stake →</a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12,flexWrap:"wrap"}}>
        <input type="text" placeholder="Search vault, protocol…" value={search} onChange={e=>setSrch(e.target.value)} style={{flex:1,minWidth:180,maxWidth:280}}/>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {types.map(t=><button key={t} className={`pill-btn${ft===t?" on":""}`} onClick={()=>setFt(t)}>{t}</button>)}
        </div>
        <label style={{display:"flex",alignItems:"center",gap:7,fontSize:13,color:C.text1,cursor:"pointer"}}>
          <input type="checkbox" checked={ao} onChange={e=>setAo(e.target.checked)}/>
          Active only
        </label>
      </div>

      <div style={{background:C.bg1,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",marginBottom:"1.75rem"}}>
        <table style={{width:"100%",borderCollapse:"collapse",tableLayout:"fixed"}}>
          <colgroup>
            <col style={{width:"14%"}}/><col style={{width:"22%"}}/><col style={{width:"11%"}}/>
            <col style={{width:"13%"}}/><col style={{width:"13%"}}/><col style={{width:"13%"}}/><col style={{width:"14%"}}/>
          </colgroup>
          <thead>
            <tr style={{background:C.bg2}}>
              {[{l:"Protocol",k:"protocol"},{l:"Vault",k:"name"},{l:"Type",k:"type"},{l:"APR",k:"apr"},{l:"TVL",k:"tvl"},{l:"BGT / day",k:"bgtPerDay"},{l:"Action",k:null}].map(h=>(
                <th key={h.l} className={h.k?"sort-th":""} onClick={h.k?()=>ts(h.k):undefined} style={{...th,color:h.k===sk?C.text1:C.text2}}>
                  {h.l}{h.k&&<Arr k={h.k}/>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length===0&&<tr><td colSpan={7} style={{padding:"2rem",textAlign:"center",color:C.text2,fontSize:13}}>No vaults match filters</td></tr>}
            {sorted.map(v=>{
              const tp=TPILL[v.type]||{bg:C.bg3,c:C.text1};
              return(
                <tr key={v.id} className="br-row" style={{opacity:v.active===false?.35:1}}>
                  <td style={td}><span style={{fontWeight:500,color:C.text0}}>{v.protocol}</span></td>
                  <td style={{...td,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    <span title={v.name}>{v.name}</span>
                    {v.symbol&&<span style={{marginLeft:6,fontSize:11,color:C.text2,fontFamily:C.mono}}>{v.symbol}</span>}
                  </td>
                  <td style={td}>
                    <span style={{fontSize:11,padding:"3px 9px",borderRadius:20,background:tp.bg,color:tp.c,fontWeight:500}}>{v.type}</span>
                  </td>
                  <td style={td}>
                    {v.apr!=null?<span style={{fontFamily:C.mono,fontSize:15,fontWeight:500,color:aprC(v.apr)}}>{fmt(v.apr,0)}%</span>:<span style={{color:C.text2}}>—</span>}
                  </td>
                  <td style={{...td,fontFamily:C.mono,color:C.text1}}>{v.tvl!=null?"$"+fmt(v.tvl):<span style={{color:C.text2}}>—</span>}</td>
                  <td style={{...td,fontFamily:C.mono,color:C.text1}}>{v.bgtPerDay>0?fmt(v.bgtPerDay,3):"—"}</td>
                  <td style={td}><a href={`https://hub.berachain.com/earn/${v.vault||""}`} className="lnk">Stake on Hub →</a></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{background:C.bg1,border:`1px solid ${C.border}`,borderRadius:14,padding:"1.25rem 1.4rem",marginBottom:"1.5rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}>
          <h3 style={{margin:0,fontSize:15,fontWeight:500}}>BGT earnings calculator</h3>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <label style={{fontSize:13,color:C.text2}}>Deposit</label>
            <div style={{position:"relative",display:"flex",alignItems:"center"}}>
              <span style={{position:"absolute",left:10,color:C.text2,fontSize:13,pointerEvents:"none"}}>$</span>
              <input type="number" value={amt} onChange={e=>setAmt(Number(e.target.value))} style={{paddingLeft:22,width:130}} min={0}/>
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
          {top3.map(v=>{
            if(v.apr==null)return null;
            const yUsd=amt*(v.apr/100);
            const yBgt=bera?yUsd/bera:null;
            const dBgt=yBgt?yBgt/365:null;
            const p=aprPill(v.apr||0);
            return(
              <div key={v.id} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:"1rem",transition:"border-color .2s"}}>
                <div style={{fontSize:12,fontWeight:500,marginBottom:2}}>{v.protocol}</div>
                <div style={{fontSize:11,color:C.text2,marginBottom:10,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.name}</div>
                <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:10}}>
                  <span style={{fontFamily:C.mono,fontSize:18,fontWeight:500,color:p.c}}>{fmt(v.apr,0)}%</span>
                  <span style={{fontSize:11,color:C.text2}}>APR</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  <div style={{background:C.bg3,borderRadius:8,padding:"8px 10px"}}>
                    <div style={{fontSize:10,color:C.text2,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Daily BGT</div>
                    <div style={{fontFamily:C.mono,fontSize:15,fontWeight:500}}>{dBgt?dBgt.toFixed(3):"—"}</div>
                  </div>
                  <div style={{background:C.bg3,borderRadius:8,padding:"8px 10px"}}>
                    <div style={{fontSize:10,color:C.text2,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Yearly</div>
                    <div style={{fontFamily:C.mono,fontSize:15,fontWeight:500,color:C.honey}}>${fmt(yUsd,0)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{fontSize:11,color:C.text2,lineHeight:1.7}}>
        <code style={{fontFamily:C.mono,background:C.bg2,padding:"1px 6px",borderRadius:4,fontSize:10}}>APR = (rewardRate/1e36) × 31536000 × BGTPrice / TVL</code>
        {" · "}BGT valued at BERA price · LP TVL uses known token prices only · Instantaneous APR, not historical
        {status==="mock"&&" · Demo data — RPC unreachable from this environment"}
      </div>
    </div>
  );
}
