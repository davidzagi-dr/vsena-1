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
out.B57=grand;out.MANUFACTURE=n(c.manufacturePrice);out.FINAL=grand+out.MANUFACTURE;out.VAT_RATE=String(c.vatRate)==="9.5"?9.5:22;out.VAT_AMOUNT=out.FINAL*out.VAT_RATE/100;out.WITH_VAT=out.FINAL+out.VAT_AMOUNT;out.H40=(out.H39||0)*100;return out;}
function renderImpala(t){const c=sheet(t),out=compute(t);let html='<section class="measurement-editor impala-original"><h3>NALOG IMPALA</h3><p class="help">Vpis v originalnih celicah; izračuni dolžin, površin in cen se sproti posodabljajo. Vrednosti se shranijo v projekt.</p>';
sections.forEach((s,i)=>{html+='<h4 style="padding:9px;background:#e8eef3;margin-top:15px">'+safe(s.title)+'</h4><div class="tablewrap"><table><thead><tr><th>'+ (i===0?"F – dolžina":"E – dolžina")+'</th><th>'+ (i===0?"G – kosov":"F – širina")+'</th>'+(i===0?"":'<th>G – kosov</th>')+'<th>J – skupaj</th></tr></thead><tbody>';
for(let r=s.start;r<=s.end;r++){const keys=i===0?["F"+r,"G"+r]:["E"+r,"F"+r,"G"+r];html+='<tr>'+keys.map(k=>'<td><input style="width:90px" type="number" step="any" aria-label="'+k+'" value="'+safe(c[k]??"")+'" oninput="impalaChange(\''+k+'\',this.value)"></td>').join("")+'<td><strong data-impala-result="J'+r+'">'+out["J"+r].toFixed(3)+'</strong></td></tr>';}
html+='</tbody></table></div><div style="padding:10px;background:#f4f6f8">Skupaj: <b data-impala-result="J'+s.total+'">'+out["J"+s.total].toFixed(3)+'</b> '+(i===0?"m":"m²")+' · Cena: <input type="number" step="any" style="width:95px" value="'+safe(c[s.price]??s.rate)+'" oninput="impalaChange(\''+s.price+'\',this.value)"> € · Vrednost: <b data-impala-result="'+s.cost+'">'+out[s.cost].toFixed(2)+'</b> €</div>';});
html+='<div style="padding:15px;background:#e5f0e8;margin-top:14px">Material: <strong data-impala-result="B57">'+out.B57.toFixed(2)+'</strong> €</div><div style="padding:15px;background:#f4f6f8;margin-top:10px"><label for="impala-manufacture">Cena izdelave: </label><select id="impala-manufacture" onchange="impalaChange(\'manufacturePrice\',this.value)"><option value="0"'+(!n(c.manufacturePrice)?' selected':'')+'>Izberi ceno</option>'+Array.from({length:19},(_,i)=>100+i*50).map(v=>'<option value="'+v+'"'+(n(c.manufacturePrice)===v?' selected':'')+'>'+v+' €</option>').join('')+'</select></div><div style="padding:15px;background:#e5f0e8;margin-top:10px">Cena brez DDV: <strong data-impala-result="FINAL">'+out.FINAL.toFixed(2)+'</strong> €</div><div style="padding:15px;background:#f4f6f8;margin-top:10px"><label for="impala-vat">DDV: </label><select id="impala-vat" onchange="impalaChange(\'vatRate\',this.value)"><option value="22"'+(out.VAT_RATE===22?' selected':'')+'>22 %</option><option value="9.5"'+(out.VAT_RATE===9.5?' selected':'')+'>9,5 %</option></select><div style="margin-top:8px">Znesek DDV: <strong data-impala-result="VAT_AMOUNT">'+out.VAT_AMOUNT.toFixed(2)+'</strong> €</div></div><div style="padding:15px;background:#e5f0e8;margin-top:10px">Cena z DDV: <strong data-impala-result="WITH_VAT">'+out.WITH_VAT.toFixed(2)+'</strong> €</div></section>';return html;}
function impalaChange(key,value){const t=draftMeasurements.IMPALA;if(!t)return;sheet(t)[key]=value;const out=compute(t);document.querySelectorAll("[data-impala-result]").forEach(el=>{const k=el.getAttribute("data-impala-result");el.textContent=(out[k]||0).toFixed(k==="B57"||k==="FINAL"||k==="VAT_AMOUNT"||k==="WITH_VAT"||k==="MANUFACTURE"||k[0]==="D"||k[0]==="E"?2:3);});if(page==="project-measurements")saveProjectMeasurements(false);}
window.impalaChange=impalaChange;
measurementEditors=function(templates){return Object.entries(templates||{}).map(([name,t])=>name==="IMPALA"?renderImpala(t):originalEditor({[name]:t})).join("");};
const oldSelect=selectMeasurementTemplate;
selectMeasurementTemplate=function(name){oldSelect(name);};
render();
})();