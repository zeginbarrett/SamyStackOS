(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const esc = (value) => String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  const nameOf = { overview:"Overview",nodes:"Cluster & nodes",vms:"Virtual machines",containers:"Containers",storage:"Storage",network:"Networking",backup:"Backups",apps:"App catalog",hardware:"Hardware fleet" };

  // Illustrative data: this site does not connect to or control any device.
  const devices = [
    {id:"mini-01",name:"Control node",model:"x86 mini PC",type:"server",role:"CLUSTER MANAGER",link:"Ethernet",addr:"10.0.0.11",status:"online",firmware:"Debian · KVM",battery:"Mains",metrics:"CPU 36% · RAM 41%",detail:"Cluster coordinator, VM and container management"},
    {id:"mini-02",name:"Compute node A",model:"x86 mini PC",type:"server",role:"VIRTUALIZATION",link:"Ethernet",addr:"10.0.0.12",status:"online",firmware:"Debian · KVM",battery:"Mains",metrics:"CPU 58% · RAM 52%",detail:"Host for application VMs and containers"},
    {id:"mini-03",name:"Compute node B",model:"x86 mini PC",type:"server",role:"VIRTUALIZATION",link:"Ethernet",addr:"10.0.0.13",status:"online",firmware:"Debian · KVM",battery:"Mains",metrics:"CPU 26% · RAM 36%",detail:"Additional compute capacity for the cluster"},
    {id:"nas-01",name:"Storage server",model:"x86 home server",type:"server",role:"STORAGE",link:"Ethernet",addr:"10.0.0.21",status:"online",firmware:"Debian · SMB",battery:"Mains",metrics:"7.4 TB used · disks healthy",detail:"Shared files, media and backup targets"},
    {id:"pi4-radio",name:"Radio & media bridge",model:"Raspberry Pi 4",type:"pi",role:"MEDIA / RADIO",link:"Ethernet",addr:"10.0.0.31",status:"online",firmware:"Linux · radio service",battery:"Mains",metrics:"CPU 18% · 51°C",detail:"Streams internet radio and powers remote audio clients"},
    {id:"pi5-vision",name:"Camera gateway",model:"Raspberry Pi 5",type:"pi",role:"CAMERA HUB",link:"Ethernet",addr:"10.0.0.32",status:"online",firmware:"Linux · video bridge",battery:"Mains",metrics:"2 streams · 39°C",detail:"Camera ingest and edge video processing"},
    {id:"pi-zero-screen",name:"Wall dashboard",model:"Raspberry Pi Zero",type:"pi",role:"DISPLAY",link:"USB / bridge",addr:"USB serial",status:"idle",firmware:"Linux · kiosk",battery:"Mains",metrics:"Display standby",detail:"Low-power status screen for the homelab"},
    {id:"waveshare-audio",name:"Voice speaker",model:"Waveshare ESP32-S3 Audio",type:"esp32",role:"AUDIO / VOICE",link:"Wi-Fi",addr:"10.0.0.41",status:"online",firmware:"ESP-IDF · audio endpoint",battery:"Mains",metrics:"Wi-Fi -55 dBm · mic ready",detail:"Voice and audio endpoint with microphone, speaker and LED ring"},
    {id:"esp32-a1s",name:"FLAC music player",model:"ESP32-A1S Audio Kit",type:"esp32",role:"AUDIO PLAYER",link:"Wi-Fi",addr:"10.0.0.42",status:"online",firmware:"Arduino · music client",battery:"Battery",metrics:"Audio playing · 84% charge",detail:"Music playback, remote controls and streaming"},
    {id:"lilygo-embed",name:"Pocket radio remote",model:"LILYGO T-Embed CC1101",type:"radio",role:"RADIO / HANDHELD",link:"Wi-Fi / sub-GHz",addr:"10.0.0.43",status:"online",firmware:"ESP32-S3 · radio client",battery:"Battery",metrics:"RSSI -62 dBm",detail:"Portable radio control and status endpoint"},
    {id:"heltec-lora",name:"LoRa field node",model:"Heltec ESP32-S3 LoRa V4",type:"radio",role:"LORA / MESH",link:"LoRa / Wi-Fi",addr:"10.0.0.44",status:"online",firmware:"ESP32-S3 · LoRa",battery:"USB",metrics:"915 MHz · link healthy",detail:"LoRa telemetry, mesh and sensor bridging"},
    {id:"cyd-remote",name:"Touch remote",model:"ESP32-2432S028R CYD",type:"esp32",role:"TOUCH DISPLAY",link:"Wi-Fi",addr:"10.0.0.45",status:"online",firmware:"Arduino · UI remote",battery:"USB",metrics:"240×320 display",detail:"Dedicated touch panel for audio, dashboards and services"},
    {id:"esp32-cam",name:"Doorway camera",model:"ESP32-CAM",type:"camera",role:"CAMERA",link:"Wi-Fi",addr:"10.0.0.46",status:"online",firmware:"ESP32-CAM · video",battery:"USB",metrics:"Stream available · 24 fps",detail:"Low-cost network camera with motion alerts"},
    {id:"esp32-climate",name:"Climate sensor",model:"ESP32-C3 sensor node",type:"esp32",role:"SENSOR",link:"Wi-Fi / MQTT",addr:"10.0.0.47",status:"online",firmware:"ESPHome · sensor",battery:"Battery",metrics:"23°C · 46% humidity",detail:"Environmental monitoring and automation triggers"},
    {id:"esp32-relay",name:"Automation relay",model:"ESP32-S3 relay controller",type:"esp32",role:"AUTOMATION",link:"Wi-Fi / MQTT",addr:"10.0.0.48",status:"offline",firmware:"ESPHome · relay",battery:"Mains",metrics:"Last seen 3h ago",detail:"Local switches and programmable automation outputs"}
  ];
  const typeName = {all:"All devices",server:"Servers",pi:"Raspberry Pi",esp32:"ESP32",radio:"Radio",camera:"Cameras"};
  let selectedDevice = "waveshare-audio";
  let selectedFilter = "all";
  let currentView = "overview";

  const menu = $(".nav-toggle"), nav = $("#nav");
  const closeMenu = () => {nav?.classList.remove("open");menu?.setAttribute("aria-expanded","false");menu?.setAttribute("aria-label","Open menu");};
  menu?.addEventListener("click",()=>{const active=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(active));menu.setAttribute("aria-label",active?"Close menu":"Open menu");});
  $$("#nav a").forEach(link=>link.addEventListener("click",closeMenu));
  document.addEventListener("keydown",event=>{if(event.key==="Escape")closeMenu();});
  const clock=()=>{const el=$("#console-clock");if(el)el.textContent=new Intl.DateTimeFormat(undefined,{hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date());};
  clock();window.setInterval(clock,30000);
  const year=$("#year");if(year)year.textContent=String(new Date().getFullYear());

  const panelHeading=(title,desc,control="")=>`<div class="view-heading"><div><div class="view-subtitle">SAMYSTACK / DEMONSTRATION</div><h3>${esc(title)}</h3><p>${esc(desc)}</p></div>${control||'<span class="view-badge"><span></span> SAMPLE DATA</span>'}</div>`;
  const stats=(items)=>`<div class="stat-grid">${items.map(item=>`<div class="stat"><span>${esc(item[0])}</span><strong>${esc(item[1])}</strong><span class="stat-foot"><i></i>${esc(item[2])}</span></div>`).join("")}</div>`;
  const genericTable=(headers,rows)=>`<div class="panel-table"><div class="panel-table-head">${headers.map(x=>`<span>${esc(x)}</span>`).join("")}</div>${rows.map((row,i)=>`<div class="panel-table-row"><strong class="table-name"><i class="${row[3]==="STOPPED"?"stopped":""}"></i>${esc(row[0])}</strong><span>${esc(row[1])}</span><span>${esc(row[2])}</span><em class="${row[3]==="STOPPED"?"stopped":""}">${esc(row[3])}</em></div>`).join("")}</div>`;
  const buttons=(items)=>`<div class="preview-tools">${items.map(s=>`<button class="demo-action dark" data-demo-action="${esc(s)}" type="button">${esc(s)} ↗</button>`).join("")}<span>PREVIEW ONLY</span></div>`;
  const resourceBars=(data)=>`<div class="ui-panel panel-meter"><div class="ui-panel-head"><strong>RESOURCE POOL</strong><span>SIMULATED</span></div>${data.map((x,i)=>`<div class="resource-line"><span>${esc(x[0])}</span><b>${esc(x[1])}%</b></div><div class="resource-track"><span style="width:${Math.min(100,Math.max(0,x[1]))}%;background:${["var(--lime)","var(--violet)","var(--cyan)"][i%3]}"></span></div>`).join("")}<div class="resource-meta">THESE VALUES ARE EXAMPLE DATA</div></div>`;
  const renderOverview=()=>panelHeading("Good to see you again.","Everything your cluster needs, all in one place.")+
    stats([["ONLINE NODES","04 / 04","All connected"],["RUNNING VMs","12","Across 3 hosts"],["CONTAINERS","26","24 healthy"],["STORAGE USED","62%","7.4 TB of 12 TB"]])+
    `<div class="view-columns"><div class="ui-panel"><div class="ui-panel-head"><strong>CLUSTER NODES</strong><span>STATUS / LOAD</span></div>${devices.slice(0,4).map((d,i)=>`<div class="ui-row"><span class="device-name"><i></i>${esc(d.id)}</span><span class="mini-bar"><b style="width:${[36,58,26,43][i]}%"></b></span><span class="healthy">ONLINE</span></div>`).join("")}</div>${resourceBars([["PROCESSOR",38],["MEMORY",54],["STORAGE",62]])}</div>`;
  const dataViews={
    nodes:{title:"Cluster & nodes",desc:"Every compute and storage host in one connected workspace.",kpis:[["CLUSTER HOSTS","04","Illustrative"],["TOTAL CPU CORES","26","Across all hosts"],["AVAILABLE MEMORY","92 GB","Example capacity"],["HOST UPTIME","99.9%","Sample value"]],headers:["NODE","ROLE","CPU","STATUS"],rows:[["mini-01","Manager","8 cores","ONLINE"],["mini-02","Compute","6 cores","ONLINE"],["mini-03","Compute","8 cores","ONLINE"],["nas-01","Storage","4 cores","ONLINE"]],tools:["Discover nodes","Join a node"]},
    vms:{title:"Virtual machines",desc:"Provision and inspect virtualized environments.",kpis:[["RUNNING VMs","12","Sample cluster"],["CPU ASSIGNED","38 vCPU","Example allocation"],["RAM ALLOCATED","64 GB","Across guests"],["TEMPLATES","08","Proposed catalog"]],headers:["VIRTUAL MACHINE","HOST","CONFIG","STATE"],rows:[["ubuntu-dev","mini-01","4 CPU · 8 GB","RUNNING"],["windows-lab","mini-02","6 CPU · 16 GB","RUNNING"],["home-lab","mini-03","2 CPU · 4 GB","RUNNING"],["test-vm","mini-02","2 CPU · 2 GB","STOPPED"]],tools:["New VM","Templates"]},
    containers:{title:"Containers & services",desc:"Deploy self-hosted services without juggling every machine.",kpis:[["CONTAINERS","26","Example workload"],["HEALTHY","24","Sample status"],["IMAGES","18","Cached locally"],["NETWORKS","06","Virtual networks"]],headers:["SERVICE","HOST","PORT","STATE"],rows:[["Jellyfin","mini-01","8096","RUNNING"],["Home Assistant","mini-02","8123","RUNNING"],["Pi-hole","mini-03","53","RUNNING"],["Nextcloud","mini-01","443","RUNNING"]],tools:["Deploy container","View logs"]},
    storage:{title:"Storage pools",desc:"Disks, shares, snapshots and capacity in one place.",kpis:[["STORAGE POOLS","03","Example configuration"],["TOTAL CAPACITY","12 TB","Raw capacity"],["FREE SPACE","4.6 TB","Illustrative"],["DISKS HEALTHY","08","Sample inventory"]],headers:["STORAGE","DEVICE","CAPACITY","STATE"],rows:[["main-pool","nas-01","8 TB","ONLINE"],["vm-pool","mini-01","2 TB","ONLINE"],["backup-pool","nas-01","2 TB","ONLINE"],["media-share","SMB / NFS","5.1 TB","ONLINE"]],tools:["New pool","Snapshots"]},
    network:{title:"Networking",desc:"See interfaces, bridges, addresses and service routes.",kpis:[["NETWORKS","06","Example topology"],["INTERFACES","11","Managed links"],["UPLINK","1 GbE","Simulated"],["LINKS ACTIVE","10","Sample state"]],headers:["NETWORK","TYPE","SUBNET","STATE"],rows:[["br0","Bridge","10.0.0.0/24","ONLINE"],["vm-net","Virtual bridge","10.10.0.0/24","ONLINE"],["iot-vlan","VLAN 40","10.40.0.0/24","ONLINE"],["edge-mqtt","MQTT bridge","TCP 1883","ONLINE"]],tools:["View topology","Add network"]},
    backup:{title:"Backup & recovery",desc:"Protect workload data and plan for the unexpected.",kpis:[["BACKUP JOBS","06","Sample schedules"],["RECENT RUNS","05","Completed"],["RESTORE POINTS","32","Example total"],["OFFSITE COPY","01","Future goal"]],headers:["BACKUP JOB","DESTINATION","SCHEDULE","STATE"],rows:[["ubuntu-dev","backup-pool","Daily","ONLINE"],["media-data","nas-01","Weekly","ONLINE"],["home-automation","backup-pool","Hourly","ONLINE"],["windows-lab","backup-pool","Manual","STOPPED"]],tools:["Schedule backup","Restore"]},
    apps:{title:"Application catalog",desc:"Explore the kinds of services SamyStackOS is being designed to deploy.",kpis:[["APP RECIPES","40+","Future library goal"],["CATEGORIES","08","Planned"],["DEPLOYED APPS","09","Sample environment"],["UPDATE CHECK","AUTO","Planned"]],headers:["APPLICATION","CATEGORY","RESOURCE","STATE"],rows:[["Jellyfin","Media","2 CPU / 4 GB","RUNNING"],["Home Assistant","Automation","2 CPU / 2 GB","RUNNING"],["Immich","Photos","4 CPU / 8 GB","RUNNING"],["Nextcloud","Files","2 CPU / 4 GB","RUNNING"]],tools:["Browse catalog","Deploy app"]}
  };
  const renderGeneric=(key)=>{
    const d=dataViews[key];
    return panelHeading(d.title,d.desc, '<button class="demo-action" type="button" data-demo-action="'+esc(d.tools[0])+'">'+esc(d.tools[0])+' +</button>')+stats(d.kpis)+genericTable(d.headers,d.rows)+buttons(d.tools.slice(1));
  };
  const statusBadge=s=>'<span class="fleet-state '+(s==="online"?"online":s==="idle"?"idle":"offline")+'"><i></i>'+esc(s.toUpperCase())+'</span>';
  const filtered=()=>devices.filter(d=>selectedFilter==="all"||d.type===selectedFilter);
  const renderHardware=()=>{
    const count=filtered().length;
    const active=devices.find(d=>d.id===selectedDevice)||devices[0];
    return panelHeading("Hardware & edge fleet","Mini PCs, Raspberry Pi, ESP32, radios, cameras and more — under one roof.",
      '<span class="view-badge"><span></span> 15 DEMO DEVICES</span>')+
      '<div class="fleet-metrics">'+[
       ["15","DEVICES"],["13","ONLINE"],["01","IDLE"],["01","OFFLINE"]
      ].map(([n,l])=>'<div><strong>'+n+'</strong><span>'+l+'</span></div>').join("")+'</div>'+
      '<div class="fleet-filter" role="group" aria-label="Hardware type filter">'+Object.entries(typeName).map(([key,label])=>
       '<button type="button" data-fleet-filter="'+esc(key)+'" aria-pressed="'+String(selectedFilter===key)+'" class="'+(selectedFilter===key?'active':'')+'">'+esc(label)+'</button>').join("")+'</div>'+
      '<div class="fleet-layout"><div class="fleet-table"><div class="fleet-table-head"><span>DEVICE / MODEL</span><span>ROLE</span><span>LINK</span><span>STATUS</span></div>'+
       '<div class="fleet-scroll" aria-label="'+count+' devices">'+filtered().map(d=>'<button type="button" class="fleet-row '+(d.id===selectedDevice?'selected':'')+'" data-select-device="'+esc(d.id)+'" aria-pressed="'+String(d.id===selectedDevice)+'"><span class="fleet-name"><b>'+esc(d.id)+'</b><small>'+esc(d.model)+'</small></span><span class="fleet-role">'+esc(d.role)+'</span><span class="fleet-link">'+esc(d.link)+'</span>'+statusBadge(d.status)+'</button>').join("")+'</div></div>'+
       '<aside class="fleet-inspector"><div class="inspector-heading"><span>DEVICE INSPECTOR</span><span>DEMO</span></div><span class="inspector-avatar">'+(active.type==="pi"?"◈":active.type==="server"?"▤":active.type==="radio"?"⌁":active.type==="camera"?"◉":"⌘")+'</span><h4>'+esc(active.name)+'</h4><div class="inspector-model">'+esc(active.model)+'</div>'+statusBadge(active.status)+
        '<div class="inspector-fields">'+[
          ["DEVICE ID",active.id],["ASSIGNED ROLE",active.role],["CONNECTION",active.link],["ADDRESS",active.addr],["FIRMWARE / OS",active.firmware],["POWER",active.battery],["TELEMETRY",active.metrics]
        ].map(([label,val])=>'<div><span>'+esc(label)+'</span><b>'+esc(val)+'</b></div>').join("")+'</div>'+
        '<p class="inspector-description">'+esc(active.detail)+'</p><div class="inspector-actions"><button type="button" data-demo-action="Check connectivity">CHECK LINK</button><button type="button" data-demo-action="Manage firmware">FIRMWARE</button></div><p class="inspector-disclaimer">Preview only — no live hardware access.</p></aside></div>';
  };
  const root=$("#console-view");
  function setView(key,{scroll=false}={}){
    if(!root||(!dataViews[key]&&key!=="overview"&&key!=="hardware"))return;
    currentView=key;
    $$(".console-nav-item").forEach(button=>{
      const on=button.dataset.view===key;button.classList.toggle("is-active",on);button.setAttribute("aria-pressed",String(on));
    });
    const crumb=$("#console-path");if(crumb)crumb.textContent=(nameOf[key]||key).toUpperCase();
    root.innerHTML=key==="overview"?renderOverview():key==="hardware"?renderHardware():renderGeneric(key);
    if(scroll){const el=$("#experience");if(el)el.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});}
  }
  function renderFleet(){if(currentView==="hardware")setView("hardware");}
  let toastTimeout;
  function toast(message){
    const box=$("#demo-toast");if(!box)return;
    box.textContent=message;box.hidden=false;
    clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>{box.hidden=true;},3200);
  }
  document.addEventListener("click",event=>{
    const open=event.target.closest("[data-open-view]");
    if(open){setView(open.dataset.openView,{scroll:true});return;}
    const tab=event.target.closest(".console-nav-item[data-view]");
    if(tab){setView(tab.dataset.view);return;}
    const filter=event.target.closest("[data-fleet-filter]");
    if(filter){selectedFilter=filter.dataset.fleetFilter;const list=filtered();if(!list.some(d=>d.id===selectedDevice)&&list.length)selectedDevice=list[0].id;renderFleet();return;}
    const device=event.target.closest("[data-select-device]");
    if(device){selectedDevice=device.dataset.selectDevice;renderFleet();return;}
    const action=event.target.closest("[data-demo-action]");
    if(action){toast(action.dataset.demoAction+' is part of the product concept. No real action was performed.');}
  });
  setView("overview");
})();