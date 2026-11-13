(function(){
"use strict";
const originalEditor=measurementEditors;
const sections=[
{title:"Robniki",start:6,end:9,total:10,price:"D7",cost:"D8",factor:100,rate:65},
{title:"Plošče 3 cm",start:13,end:20,total:21,price:"D14",cost:"D15",factor:10000,rate:145},
{title:"Plošče 5 cm",start:24,end:29,total:30,price:"D25",cost:"D26",factor:10000,rate:260},
{title:"Plošče 6 cm",start:33,end:38,total:39,price:"D34",cost:"D35",factor:10000,rate:300},
{title:"Plošče 8 cm",start:42,end:47,total:48,price:"D43",cost:"D44",factor:10000,rate:400}
];
function safe(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function n(v){return Number(String(v??"").replace(",","."))||0;}
function sheet(t){return t.impalaCells||(t.impalaCells={});}
function compute(t){const c=sheet(t),out={};let grand=0;
sections.forEach((s,i)=>{let total=0;for(let r=s.start;r<=s.end;r++){const x=i===0?n(c["F"+r])*n(c["G"+r])/100:n(c["E"+r])*n(c["F"+r])*n(c["G"+r])/10000;out["J"+r]=x;out["H"+r]=x;total+=x;}out["J"+s.total]=total;out["H"+s.total]=total;const price=c[s.price]===undefined?s.rate:n(c[s.price]);out[s.price]=price;out[s.cost]=price*total;grand+=out[s.cost];});
out.B57=grand;out.MANUFACTURE=c.manufacturePrice===undefined?800:n(c.manufacturePrice);out.FINAL=grand+out.MANUFACTURE;out.VAT_RATE=String(c.vatRate)==="9.5"?9.5:22;out.VAT_AMOUNT=out.FINAL*out.VAT_RATE/100;out.WITH_VAT=out.FINAL+out.VAT_AMOUNT;out.H40=(out.H39||0)*100;return out;}
function renderImpala(t){const c=sheet(t),out=compute(t);let html='<section class="measurement-editor impala-original"><h3>NALOG IMPALA</h3><p class="help">Vpis v originalnih celicah; izračuni dolžin, površin in cen se sproti posodabljajo. Vrednosti se shranijo v projekt.</p>';
sections.forEach((s,i)=>{html+='<h4 style="padding:9px;background:#e8eef3;margin-top:15px">'+safe(s.title)+'</h4><div class="tablewrap impala-measures"><table style="width:auto;table-layout:auto;border-collapse:collapse"><thead><tr><th>'+ ("Dolžina (cm)")+'</th><th>'+ (i===0?"Kosov":"Širina (cm)")+'</th>'+(i===0?"":'<th>Kosov</th>')+'<th>Skupaj '+(i===0?'(m)':'(m²)')+'</th></tr></thead><tbody>';
for(let r=s.start;r<=s.end;r++){const keys=i===0?["F"+r,"G"+r]:["E"+r,"F"+r,"G"+r];html+='<tr>'+keys.map((k,ki)=>'<td><div style="display:flex;align-items:center;gap:4px"><input style="width:72px;min-width:0;max-width:72px;box-sizing:border-box;padding:5px 6px" type="text" inputmode="decimal" autocomplete="off" aria-label="'+k+'" value="'+safe(c[k]??"")+'" oninput="impalaChange(\''+k+'\',this.value)">'+(i===0?(ki===0?'<span>cm</span>':''):(ki<2?'<span>cm</span>':''))+'</div></td>').join("")+'<td><strong data-impala-result="J'+r+'">'+out["J"+r].toFixed(3)+'</strong></td></tr>';}
html+='</tbody></table></div><div style="padding:10px;background:#f4f6f8">Skupaj '+(i===0?'tekočih metrov':'kvadratnih metrov')+': <b data-impala-result="J'+s.total+'">'+out["J"+s.total].toFixed(3)+'</b> '+(i===0?"m":"m²")+' · Cena: <input type="text" inputmode="decimal" style="width:95px" value="'+safe(c[s.price]??s.rate)+'" oninput="impalaChange(\''+s.price+'\',this.value)"> € · Vrednost: <b data-impala-result="'+s.cost+'">'+out[s.cost].toFixed(2)+'</b> €</div>';});
html+='<div style="padding:15px;background:#e5f0e8;margin-top:14px">Material: <strong data-impala-result="B57">'+out.B57.toFixed(2)+'</strong> €</div><div style="padding:15px;background:#f4f6f8;margin-top:10px"><label for="impala-manufacture">Cena izdelave: </label><select id="impala-manufacture" onchange="impalaChange(\'manufacturePrice\',this.value)"><option value="0"'+(c.manufacturePrice!==undefined&&!n(c.manufacturePrice)?' selected':'')+'>0 €</option>'+Array.from({length:19},(_,i)=>100+i*50).map(v=>'<option value="'+v+'"'+((c.manufacturePrice===undefined?800:n(c.manufacturePrice))===v?' selected':'')+'>'+v+' €</option>').join('')+'</select></div><div style="padding:15px;background:#e5f0e8;margin-top:10px">Cena brez DDV: <strong data-impala-result="FINAL">'+out.FINAL.toFixed(2)+'</strong> €</div><div style="padding:15px;background:#f4f6f8;margin-top:10px"><label for="impala-vat">DDV: </label><select id="impala-vat" onchange="impalaChange(\'vatRate\',this.value)"><option value="22"'+(out.VAT_RATE===22?' selected':'')+'>22 %</option><option value="9.5"'+(out.VAT_RATE===9.5?' selected':'')+'>9,5 %</option></select><div style="margin-top:8px">Znesek DDV: <strong data-impala-result="VAT_AMOUNT">'+out.VAT_AMOUNT.toFixed(2)+'</strong> €</div></div><div style="padding:15px;background:#e5f0e8;margin-top:10px">Cena z DDV: <strong data-impala-result="WITH_VAT">'+out.WITH_VAT.toFixed(2)+'</strong> €</div></section>';return html;}
function impalaChange(key,value){const t=draftMeasurements.IMPALA;if(!t)return;sheet(t)[key]=value;const out=compute(t);document.querySelectorAll("[data-impala-result]").forEach(el=>{const k=el.getAttribute("data-impala-result");el.textContent=(out[k]||0).toFixed(k==="B57"||k==="FINAL"||k==="VAT_AMOUNT"||k==="WITH_VAT"||k==="MANUFACTURE"||k[0]==="D"||k[0]==="E"?2:3);});if(page==="project-measurements")saveProjectMeasurements(false);}
window.impalaChange=impalaChange;
// Vsa polja mer in cen so navadna besedilna polja brez številčnih spinnerjev.
function impalaRemoveSpinners(){
 document.querySelectorAll(".impala-original input[type='number']").forEach(input=>{
  input.type="text";
  input.inputMode="decimal";
  input.removeAttribute("step");
 });
}
const impalaSpinnerObserver=new MutationObserver(impalaRemoveSpinners);
impalaSpinnerObserver.observe(document.body,{childList:true,subtree:true});

const impalaCompactStyle=document.createElement("style");
impalaCompactStyle.textContent=".impala-original .impala-measures table{width:max-content!important;min-width:0!important;max-width:none!important}.impala-original .impala-measures th,.impala-original .impala-measures td{padding:3px 4px!important;min-width:0!important;white-space:nowrap}.impala-original .impala-measures input{width:72px!important;min-width:0!important;max-width:72px!important;margin:0!important}.impala-original .impala-measures th{font-size:12px}.impala-original input[type=number]{appearance:textfield;-moz-appearance:textfield}.impala-original input[type=number]::-webkit-inner-spin-button,.impala-original input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}";
document.head.appendChild(impalaCompactStyle);
document.addEventListener("wheel",function(e){if(e.target.matches(".impala-original input[type=number]")&&document.activeElement===e.target)e.target.blur();},{passive:true});
// Premikanje med polji za mere s smernimi tipkami (brez spreminjanja števil).
document.addEventListener("keydown",function(event){
  if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key))return;
  const input=event.target;
  if(!(input instanceof HTMLInputElement)||!input.matches(".impala-original .impala-measures tbody input"))return;
  const table=input.closest("table");
  const row=input.closest("tr");
  if(!table||!row)return;
  const rows=Array.from(table.querySelectorAll("tbody tr"));
  const rowIndex=rows.indexOf(row);
  const inputs=Array.from(row.querySelectorAll("input"));
  const colIndex=inputs.indexOf(input);
  if(rowIndex<0||colIndex<0)return;
  let target;
  if(event.key==="ArrowLeft")target=inputs[colIndex-1];
  else if(event.key==="ArrowRight")target=inputs[colIndex+1];
  else {
    const nextRow=rows[rowIndex+(event.key==="ArrowUp"?-1:1)];
    if(nextRow)target=nextRow.querySelectorAll("input")[colIndex];
  }
  if(!target){event.preventDefault();return;}
  event.preventDefault();
  target.focus();
  if(typeof target.select==="function")target.select();
},true);

measurementEditors=function(templates){return Object.entries(templates||{}).map(([name,t])=>name==="IMPALA"?renderImpala(t):originalEditor({[name]:t})).join("");};
const oldSelect=selectMeasurementTemplate;
selectMeasurementTemplate=function(name){oldSelect(name);};
render();
impalaRemoveSpinners();
})();