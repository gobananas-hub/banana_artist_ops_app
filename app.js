const $ = (q,root=document)=>root.querySelector(q);
const $$ = (q,root=document)=>[...root.querySelectorAll(q)];
const money = n => '฿' + Number(n).toLocaleString('en-US');

const defaultLeads = [
  {name:'Mew',source:'BNI / Referral',status:'Paid',value:60000,owner:'ทีมจุ๊',nextAction:'Brief 14 Sep'},
  {name:'Ploy',source:'Paid Social',status:'Consult',value:60000,owner:'ทีมจุ๊',nextAction:'Parent call'},
  {name:'Nana',source:'Singing School',status:'Qualified',value:60000,owner:'ทีมจุ๊',nextAction:'Book studio tour'},
  {name:'Mild',source:'Parent Network',status:'Paid',value:60000,owner:'ทีมจุ๊',nextAction:'Deposit received'},
  {name:'Keen',source:'Open House',status:'Inquiry',value:60000,owner:'ทีมจุ๊',nextAction:'Send package'},
];

const defaultProjects = [
 {code:'BA-26001',artist:'Tita',stage:'PRODUCE',owner:'ทีมหนึ่ง',due:'14 Sep',progress:58,detail:'Arrangement / production in progress'},
 {code:'BA-26002',artist:'Mew',stage:'DEMO',owner:'ทีมเอส',due:'15 Sep',progress:28,detail:'AI Demo v1 ready for internal review'},
 {code:'BA-26003',artist:'Mild',stage:'BRIEF',owner:'ทีมเอส',due:'16 Sep',progress:15,detail:'Artist brief booked'},
 {code:'BA-26004',artist:'Keen',stage:'SALES',owner:'ทีมจุ๊',due:'17 Sep',progress:6,detail:'Waiting parent consult'},
 {code:'BA-26005',artist:'Punn',stage:'POST',owner:'Post / PM',due:'13 Sep',progress:82,detail:'Mix v2 waiting QC'},
 {code:'BA-26006',artist:'June',stage:'RECORD',owner:'ทีมหนึ่ง',due:'18 Sep',progress:68,detail:'Recording session confirmed'},
 {code:'BA-26007',artist:'Aom',stage:'APPROVE',owner:'ทีมเอส',due:'13 Sep',progress:42,detail:'Client feedback overdue'},
];

let leads = JSON.parse(localStorage.getItem('banana_leads')||'null') || defaultLeads;
let projects = JSON.parse(localStorage.getItem('banana_projects')||'null') || defaultProjects;

function toast(msg){ const el=$('#toast'); el.textContent=msg; el.classList.add('show'); clearTimeout(window.__toast); window.__toast=setTimeout(()=>el.classList.remove('show'),2800); }

// Mode switch
$$('.mode-btn').forEach(btn=>btn.addEventListener('click',()=>{
  $$('.mode-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
  const ops=btn.dataset.mode==='ops'; $('#clientView').classList.toggle('active',!ops); $('#opsView').classList.toggle('active',ops); window.scrollTo({top:0,behavior:'smooth'});
  if(ops) renderAll();
}));

$('#startJourneyBtn').addEventListener('click',()=>$('#intakePanel').scrollIntoView({behavior:'smooth'}));
$('#seePackageBtn').addEventListener('click',()=>$('#packagePanel').scrollIntoView({behavior:'smooth'}));

// Intake wizard
let step=1;
function setStep(n){step=n; $$('.form-step').forEach((el,i)=>el.classList.toggle('active',i===n-1)); $$('.step-indicator span').forEach((el,i)=>el.classList.toggle('active',i===n-1)); $('#prevStepBtn').disabled=n===1; $('#nextStepBtn').classList.toggle('hidden',n===3); $('#submitIntakeBtn').classList.toggle('hidden',n!==3);}
$('#nextStepBtn').addEventListener('click',()=>{
  const current=$(`.form-step[data-step="${step}"]`); const required=$$('input[required],textarea[required],select[required]',current); if(required.some(x=>!x.value.trim())){toast('กรอกข้อมูลในขั้นตอนนี้ให้ครบก่อน');return;} setStep(Math.min(3,step+1));
});
$('#prevStepBtn').addEventListener('click',()=>setStep(Math.max(1,step-1)));
$('#artistIntakeForm').addEventListener('submit',e=>{
  e.preventDefault(); const fd=new FormData(e.target); const artist=fd.get('artistName'); const code='BA-'+String(Date.now()).slice(-5);
  leads.unshift({name:artist,source:'Website Intake',status:'Inquiry',value:60000,owner:'ทีมจุ๊',nextAction:'Contact & qualify'});
  projects.unshift({code,artist,stage:'SALES',owner:'ทีมจุ๊',due:'TBD',progress:4,detail:'New website intake'});
  persist(); e.target.reset(); setStep(1); toast(`รับข้อมูลแล้ว · Project Code ${code}`); $('#trackCode').value=code;
});

// Tracking
$('#trackBtn').addEventListener('click',()=>{
  const code=$('#trackCode').value.trim().toUpperCase(); const p=projects.find(x=>x.code.toUpperCase()===code); const box=$('#trackResult');
  if(!p){box.className='track-result muted';box.textContent='ไม่พบ Project Code นี้ — ลอง BA-26001 ถึง BA-26007';return;}
  const steps=['SALES','BRIEF','DEMO','APPROVE','PRODUCE','RECORD','POST','RELEASE']; const idx=steps.indexOf(p.stage);
  box.className='track-result success'; box.innerHTML=`<strong>${p.artist} · ${p.code}</strong><div style="margin-top:4px;color:#95a199;font-size:12px">สถานะปัจจุบัน: ${p.stage} · Owner: ${p.owner} · Due: ${p.due}</div><div class="track-steps">${steps.map((s,i)=>`<span class="${i<idx?'done':i===idx?'current':''}">${s}</span>`).join('')}</div>`;
});

// Ops navigation
$$('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{
  $$('.nav-item').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); $$('.ops-page').forEach(p=>p.classList.remove('active')); $(`#page-${btn.dataset.page}`).classList.add('active');
}));

const stageColumns=[
 {key:'QUEUE',title:'QUEUE',stages:['SALES','BRIEF']},
 {key:'DOING',title:'DOING',stages:['DEMO','PRODUCE','RECORD']},
 {key:'REVIEW',title:'REVIEW',stages:['APPROVE','POST']},
 {key:'DONE',title:'DONE',stages:['RELEASE']}
];

function renderLeads(){
 const q=($('#leadSearch')?.value||'').toLowerCase(); const f=$('#leadStatusFilter')?.value||'all';
 const rows=leads.filter(l=>(!q||l.name.toLowerCase().includes(q))&&(f==='all'||l.status===f));
 $('#leadTableBody').innerHTML=rows.map(l=>`<tr><td><b>${l.name}</b></td><td>${l.source}</td><td><span class="status ${l.status}">${l.status}</span></td><td>${money(l.value)}</td><td>${l.owner}</td><td>${l.nextAction}</td></tr>`).join('');
}

function renderKanban(){
 const role=$('#roleFilter')?.value||'all'; const source=projects.filter(p=>role==='all'||p.owner===role);
 $('#kanbanBoard').innerHTML=stageColumns.map(col=>{
   const items=source.filter(p=>col.stages.includes(p.stage));
   return `<section class="kanban-col"><div class="kanban-title"><b>${col.title}</b><span>${items.length}</span></div>${items.map(p=>`<article class="project-card" data-code="${p.code}"><div class="project-code">${p.code} · ${p.stage}</div><h3>${p.artist}</h3><p>${p.detail}</p><div class="project-meta"><span>${p.owner}</span><span>${p.due}</span></div><div class="project-progress"><i style="width:${p.progress}%"></i></div></article>`).join('')||'<div class="muted" style="padding:12px">No project</div>'}</section>`;
 }).join('');
 $$('.project-card').forEach(card=>card.addEventListener('click',()=>{const p=projects.find(x=>x.code===card.dataset.code);toast(`${p.code} · ${p.artist} · ${p.stage} · ${p.owner}`)}));
}

function renderDashboard(){
 const paid=projects.length; $('#metricPaid').textContent=paid; $('#metricRevenue').textContent=money(paid*60000); $('#metricApproval').textContent=projects.filter(p=>['APPROVE','POST'].includes(p.stage)).length;
 const lanes=[
  {name:'Creative Lane',owner:'ทีมเอส',stages:['Brief','Demo','Approve'],count:projects.filter(p=>['BRIEF','DEMO','APPROVE'].includes(p.stage)).length},
  {name:'Production Lane A',owner:'ทีมหนึ่ง',stages:['Prep','Track','Vocal'],count:projects.filter(p=>['PRODUCE','RECORD'].includes(p.stage)).length},
  {name:'Post / Release',owner:'Post / PM',stages:['Edit','Mix','Master','DSP'],count:projects.filter(p=>['POST','RELEASE'].includes(p.stage)).length}
 ];
 $('#laneList').innerHTML=lanes.map((l,i)=>`<div class="lane"><div class="lane-title"><b>${l.name}</b><small>${l.owner}</small></div><div class="lane-flow">${l.stages.map((s,j)=>`<span class="${j<=Math.min(i+1,l.stages.length-1)?'active':''}">${s}</span>`).join('')}</div><div class="lane-count">${l.count}</div></div>`).join('');
 const attention=projects.filter(p=>['APPROVE','POST','RECORD'].includes(p.stage)).slice(0,4);
 $('#attentionList').innerHTML=attention.map((p,i)=>`<div class="attention-item ${i===0?'danger':''}"><span class="attention-dot"></span><div><strong>${p.artist} · ${p.stage}</strong><p>${p.detail} · Due ${p.due}</p></div></div>`).join('');
}

function renderFinance(){ updateCalc(); updateBreakeven(); }
function updateCalc(){const n=Number($('#songCountRange').value); $('#songCountLabel').textContent=n; $('#calcRevenue').textContent=money(n*60000);$('#calcJobFee').textContent=money(n*12000);$('#calcGrowth').textContent=money(n*6000);$('#calcCompany').textContent=money(n*36000);}
function updateBreakeven(){const fixed=Number($('#fixedCostInput').value)||0;$('#breakevenSongs').textContent=Math.ceil(fixed/36000)+' เพลง';}
$('#songCountRange').addEventListener('input',updateCalc); $('#fixedCostInput').addEventListener('input',updateBreakeven);
$('#leadSearch').addEventListener('input',renderLeads); $('#leadStatusFilter').addEventListener('change',renderLeads); $('#roleFilter').addEventListener('change',renderKanban);

function persist(){localStorage.setItem('banana_leads',JSON.stringify(leads));localStorage.setItem('banana_projects',JSON.stringify(projects));renderAll();}
function renderAll(){renderDashboard();renderLeads();renderKanban();renderFinance();}

// Modal
function openModal(){ $('#modalBackdrop').classList.add('open'); setTimeout(()=>$('input[name="name"]',$('#newLeadForm')).focus(),50); }
function closeModal(){ $('#modalBackdrop').classList.remove('open'); }
$('#quickAddBtn').addEventListener('click',openModal);$('#pipelineAddBtn').addEventListener('click',openModal);$('#modalClose').addEventListener('click',closeModal);$('#modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop')closeModal()});
$('#newLeadForm').addEventListener('submit',e=>{
 e.preventDefault(); const fd=new FormData(e.target); const lead={name:fd.get('name'),source:fd.get('source'),status:fd.get('status'),value:Number(fd.get('value')),owner:fd.get('owner'),nextAction:fd.get('nextAction')||'-'}; leads.unshift(lead);
 if(lead.status==='Paid'){ const code='BA-'+String(Date.now()).slice(-5);projects.unshift({code,artist:lead.name,stage:'SALES',owner:'ทีมจุ๊',due:'TBD',progress:5,detail:'New paid project'}); }
 persist(); e.target.reset(); closeModal(); toast('บันทึก Lead แล้ว');
});

document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
renderAll();
