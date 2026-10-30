/*
 * ESPAÑA ATLAS / script.js
 * JavaScriptはクリック、検索、データ切替、地図の描画などの「動き」を担当します。
 *
 * 読むおすすめ順：
 *  1. REGIONS / TOPICS / TOPIC_DATA （データ）
 *  2. setTopic(), selectRegion(), showDetails() （UIの切替）
 *  3. CITIES / LOCAL と updateIntercity(), updateLocal() （交通検索）
 *  4. loadAccurateMap() （少し発展的な非同期処理）
 *
 * DOMContentLoadedはHTMLの読み込み後に処理を開始するイベントです。
 * addEventListener('click', ...) は、クリック時に実行する処理を登録します。
 */


document.addEventListener("DOMContentLoaded", () => {
'use strict';
// 各地域の説明を変えると、地図・検索結果・右側の紹介パネルにも反映されます。
/* 【STEP 1】地域の基本データ。ここに名前や検索キーワードを登録しています。 */
const REGIONS = [
  {id:'galicia',name:'ガリシア州',english:'GALICIA',spots:['サンティアゴ・デ・コンポステーラ','ビーゴ','リアス式海岸'],description:'巡礼路の終着地と大西洋の海岸が広がる、緑豊かな北西部。魚介料理も人気です。',theme:'巡礼・海岸・グルメ',category:'NATURE & HISTORY',icon:'✦',color:'#688a89',search:'ガリシア サンティアゴ ビーゴ'},
  {id:'asturias',name:'アストゥリアス州',english:'ASTURIAS',spots:['オビエド','ピコス・デ・エウロパ','ヒホン'],description:'緑の山々と海岸線、伝統的な街並みを楽しめる北スペインの自然豊かな地域です。',theme:'山・自然・街歩き',category:'MOUNTAIN & NATURE',icon:'⛰',color:'#70918c',search:'オビエド ヒホン'},
  {id:'cantabria',name:'カンタブリア州',english:'CANTABRIA',spots:['サンタンデール','サンティリャーナ・デル・マル','アルタミラ'],description:'海辺の街と緑の丘陵、先史時代の洞窟文化などが魅力の北部地域です。',theme:'海岸・歴史・自然',category:'COAST & HISTORY',icon:'≈',color:'#679c9a',search:'サンタンデール'},
  {id:'paisvasco',name:'バスク州',english:'BASQUE COUNTRY',spots:['ビルバオ','サン・セバスティアン','ゲルニカ'],description:'独自の文化と美食、モダンな建築に出会える大西洋沿岸の地域です。',theme:'美食・建築・海辺',category:'FOOD & CULTURE',icon:'✳',color:'#648c8a',search:'バスク ビルバオ サンセバスティアン'},
  {id:'navarra',name:'ナバラ州',english:'NAVARRE',spots:['パンプローナ','バルデナス・レアレス','オリテ城'],description:'ピレネーの自然から半砂漠まで、多様な景観が広がる地域です。',theme:'山・城・絶景',category:'LANDSCAPE & HISTORY',icon:'◇',color:'#af8b77',search:'ナバラ パンプローナ'},
  {id:'larioja',name:'ラ・リオハ州',english:'LA RIOJA',spots:['ログローニョ','アロ','サン・ミジャン'],description:'ぶどう畑の丘陵と歴史ある街並みで知られる、のどかな内陸地域です。',theme:'田園・歴史・街歩き',category:'COUNTRYSIDE',icon:'❋',color:'#ae8174',search:'リオハ ログローニョ'},
  {id:'castillayleon',name:'カスティーリャ・イ・レオン州',english:'CASTILE AND LEÓN',spots:['セゴビア','サラマンカ','ブルゴス'],description:'ローマ水道橋や壮麗な大聖堂、歴史的な大学都市など見どころが豊富です。',theme:'建築・旧市街・歴史',category:'HERITAGE & HISTORY',icon:'⌂',color:'#c0947b',search:'カスティーリャ レオン セゴビア サラマンカ'},
  {id:'aragon',name:'アラゴン州',english:'ARAGÓN',spots:['サラゴサ','オルデサ国立公園','テルエル'],description:'荘厳な歴史建築とピレネーの山々が共存する、魅力あふれる内陸地域です。',theme:'山岳・自然・歴史',category:'NATURE & HERITAGE',icon:'⛰',color:'#cc9a75',search:'アラゴン サラゴサ'},
  {id:'cataluna',name:'カタルーニャ州',english:'CATALONIA',spots:['バルセロナ','サグラダ・ファミリア','ジローナ'],description:'ガウディ建築、活気ある街並み、地中海沿いのビーチを一度に楽しめる地域です。',theme:'街歩き・建築・ビーチ',category:'CULTURE & CITY',icon:'✺',color:'#d88464',search:'カタルーニャ バルセロナ ジローナ カタルニア'},
  {id:'comunitatvalenciana',name:'バレンシア州',english:'VALENCIAN COMMUNITY',spots:['バレンシア','芸術科学都市','アリカンテ'],description:'明るい地中海のビーチと現代建築、パエリアなどの食文化を楽しめます。',theme:'ビーチ・建築・食',category:'SEA & DESIGN',icon:'☼',color:'#4b9db1',search:'バレンシア アリカンテ'},
  {id:'madrid',name:'マドリード州',english:'COMMUNITY OF MADRID',spots:['プラド美術館','マドリード王宮','レティーロ公園'],description:'世界的な美術館と広場、カフェが集まるスペインの首都圏。都市散策にぴったりです。',theme:'美術館・街歩き',category:'ART & CAPITAL',icon:'✷',color:'#637a9c',search:'マドリード'},
  {id:'castillalamancha',name:'カスティーリャ＝ラ・マンチャ州',english:'CASTILE-LA MANCHA',spots:['トレド','クエンカ','風車の丘'],description:'歴史都市トレドや断崖に建つ家々、風車が並ぶ景色で知られる内陸地方です。',theme:'古都・景観・文化',category:'OLD TOWNS',icon:'⌘',color:'#b9967c',search:'ラマンチャ トレド クエンカ'},
  {id:'extremadura',name:'エストレマドゥーラ州',english:'EXTREMADURA',spots:['カセレス','メリダ','トルヒーリョ'],description:'ローマ時代の遺構や中世の街並みをゆったり巡れる、西部の歴史的な地域です。',theme:'歴史遺産・旧市街',category:'ANCIENT CITIES',icon:'✦',color:'#9d8b71',search:'エストレマドゥーラ メリダ'},
  {id:'andalucia',name:'アンダルシア州',english:'ANDALUSIA',spots:['セビリア','グラナダ','アルハンブラ宮殿'],description:'イスラム文化の面影を残す宮殿、白い村、フラメンコなどを楽しめる南スペイン。',theme:'宮殿・文化・白い村',category:'SUN & HERITAGE',icon:'☀',color:'#d08360',search:'アンダルシア セビリア グラナダ マラガ コルドバ'},
  {id:'murcia',name:'ムルシア州',english:'REGION OF MURCIA',spots:['カルタヘナ','ムルシア','マール・メノール'],description:'穏やかな気候と海岸沿いの風景、ローマ時代から続く港町などが魅力です。',theme:'海辺・歴史・街歩き',category:'MEDITERRANEAN COAST',icon:'≈',color:'#b9947d',search:'ムルシア カルタヘナ'},
  {id:'baleares',name:'バレアレス諸島',english:'BALEARIC ISLANDS',spots:['マヨルカ島','イビサ島','メノルカ島'],description:'透明度の高い海と美しい入り江、島ごとに異なる景色に出会える地中海の楽園です。',theme:'ビーチ・島・リゾート',category:'ISLAND & BEACH',icon:'☼',color:'#3c9bad',search:'バレアレス マヨルカ イビサ メノルカ'},
  {id:'canarias',name:'カナリア諸島',english:'CANARY ISLANDS',spots:['テネリフェ島','ランサローテ島','グラン・カナリア島'],description:'大西洋に浮かぶ火山の島々。ユニークな地形と温暖な気候を楽しめます。',theme:'火山・島・自然',category:'VOLCANO & ISLAND',icon:'◈',color:'#a57f66',search:'カナリア テネリフェ ランサローテ'},
  {id:'ceuta',name:'セウタ',english:'CEUTA',spots:['王立城壁','旧市街','地中海沿岸'],description:'アフリカ大陸の北岸に位置するスペインの自治都市。要塞や港の景色が特徴です。',theme:'歴史・港町',category:'HISTORY & PORT',icon:'⚑',color:'#9a8b81',search:'セウタ'},
  {id:'melilla',name:'メリリャ',english:'MELILLA',spots:['メリリャ・ラ・ビエハ','モダニズム建築','港湾地区'],description:'北アフリカの地中海沿岸にある自治都市で、歴史的要塞や建築が見どころです。',theme:'建築・歴史・海辺',category:'ARCHITECTURE & SEA',icon:'✧',color:'#9f8e83',search:'メリリャ'}
];
const TOPIC_DATA={"galicia":{"spots":{"nature":["シエス諸島","リアス・バイシャス"],"culture":["サンティアゴ大聖堂","ルーゴのローマ城壁"],"football":["セルタ・デ・ビーゴ","デポルティーボ・ラ・コルーニャ"],"food":["プルポ・ア・ラ・ガジェガ","エンパナーダ"]}},"asturias":{"spots":{"nature":["ピコス・デ・エウロパ","コバドンガ湖"],"culture":["オビエド旧市街","サンタ・マリア・デル・ナランコ"],"football":["レアル・オビエド","スポルティング・ヒホン"],"food":["ファバーダ","アストゥリアスのシードラ"]}},"cantabria":{"spots":{"nature":["カバルセノ自然公園","サルディネーロ海岸"],"culture":["アルタミラ洞窟","サンティリャーナ・デル・マル"],"football":["ラシン・サンタンデール","エル・サルディネーロ"],"food":["コシード・モンタニェス","ソバオ"]}},"paisvasco":{"spots":{"nature":["ラ・コンチャ海岸","ウルダイバイ生物圏保護区"],"culture":["グッゲンハイム美術館","ビルバオ旧市街"],"football":["アスレティック・ビルバオ","レアル・ソシエダ"],"food":["ピンチョス","バスクチーズケーキ"]}},"navarra":{"spots":{"nature":["バルデナス・レアレス","イラティの森"],"culture":["オリテ城","パンプローナ旧市街"],"football":["CAオサスナ","エル・サダール"],"food":["チストラ","ポチャス豆の煮込み"]}},"larioja":{"spots":{"nature":["エブロ川沿いの風景","ぶどう畑の丘陵"],"culture":["サン・ミジャンの修道院","ログローニョ旧市街"],"football":["UDログロニェス","ラス・ガウナス"],"food":["パタタス・ア・ラ・リオハナ","ピンチョス"]}},"castillayleon":{"spots":{"nature":["ラス・メドゥラス","グレドス山脈"],"culture":["セゴビア水道橋","ブルゴス大聖堂"],"football":["レアル・バリャドリード","ブルゴスCF"],"food":["レチャソ・アサード","モルシージャ"]}},"aragon":{"spots":{"nature":["オルデサ国立公園","ピレネー山脈"],"culture":["ピラール聖母大聖堂","アルハフェリア宮殿"],"football":["レアル・サラゴサ","SDウエスカ"],"food":["テルナスコ・デ・アラゴン","ミガス"]}},"cataluna":{"spots":{"nature":["コスタ・ブラバ","モンセラート山"],"culture":["サグラダ・ファミリア","カサ・バトリョ"],"football":["FCバルセロナ","RCDエスパニョール"],"food":["パン・コン・トマテ","クレマ・カタラーナ"]}},"comunitatvalenciana":{"spots":{"nature":["ペニスコラ海岸","アルブフェラ自然公園"],"culture":["芸術科学都市","バレンシア大聖堂"],"football":["バレンシアCF","ビジャレアルCF"],"food":["パエリア・バレンシアーナ","オルチャータ"]}},"madrid":{"spots":{"nature":["シエラ・デ・グアダラマ","レティーロ公園"],"culture":["マドリード王宮","プラド美術館"],"football":["レアル・マドリード","アトレティコ・マドリード"],"food":["ボカディージョ・デ・カラマレス","コシード・マドリレーニョ"]}},"castillalamancha":{"spots":{"nature":["ルイデラ湖群","タブラス・デ・ダイミエル国立公園"],"culture":["トレド旧市街","クエンカの宙吊りの家"],"football":["アルバセテ・バロンピエ","CDトレド"],"food":["マンチェゴチーズ","ピスト・マンチェゴ"]}},"extremadura":{"spots":{"nature":["モンフラグエ国立公園","ヘルテ渓谷"],"culture":["メリダのローマ劇場","カセレス旧市街"],"football":["CPカセレーニョ","CDバダホス"],"food":["イベリコ豚の生ハム","ミガス・エストレメーニャス"]}},"andalucia":{"spots":{"nature":["カボ・デ・ガタ","ドニャーナ国立公園"],"culture":["アルハンブラ宮殿","セビリア大聖堂"],"football":["レアル・ベティス","セビージャFC"],"food":["ガスパチョ","サルモレホ"]}},"murcia":{"spots":{"nature":["カラスパラの山景","カルブランケ自然公園"],"culture":["カルタヘナのローマ劇場","ムルシア大聖堂"],"football":["レアル・ムルシア","FCカルタヘナ"],"food":["カルデロ","パパラホテ"]}},"baleares":{"spots":{"nature":["カロ・デス・モロ","トラムンタナ山脈"],"culture":["パルマ大聖堂","ベルベル城"],"football":["RCDマジョルカ","エスタディ・ソン・モイシュ"],"food":["エンサイマーダ","ソブラサーダ"]}},"canarias":{"spots":{"nature":["テイデ国立公園","ティマンファヤ国立公園"],"culture":["ラ・ラグーナ歴史地区","セサル・マンリケの建築"],"football":["UDラス・パルマス","CDテネリフェ"],"food":["パパス・アルガダス","モホソース"]}},"ceuta":{"spots":{"nature":["モンテ・アチョ","地中海沿岸"],"culture":["王立城壁","ドラゴンの家"],"football":["ADセウタFC","アルフォンソ・ムルベ競技場"],"food":["魚介のタパス","クスクス"]}},"melilla":{"spots":{"nature":["アグアドゥ海岸","地中海の入江"],"culture":["メリリャ・ラ・ビエハ","モダニズム建築群"],"football":["UDメリリャ","アルバレス・クラロ競技場"],"food":["魚介料理","モロッコ風菓子"]}}};
const TOPICS={"nature":{"icon":"🌿","label":"自然","english":"NATURE","color":"#248974","action":"海や山、自然の景色を巡る"},"culture":{"icon":"🏛️","label":"文化・建築","english":"CULTURE & ARCHITECTURE","color":"#ab7b37","action":"街並みや建築、歴史に触れる"},"football":{"icon":"⚽","label":"サッカー","english":"FOOTBALL","color":"#b95053","action":"クラブやスタジアムを巡る"},"food":{"icon":"🍽️","label":"グルメ","english":"LOCAL FOOD","color":"#b8783e","action":"地域の名物料理を味わう"}};
let currentTopic="nature";
/* 配列を id からすぐ探せる辞書（オブジェクト）に変換します。 */
const byId = Object.fromEntries(REGIONS.map((r,i)=>[r.id,{...r,index:i}]));
const stage=document.querySelector('#map-stage');
const tooltip=document.querySelector('#map-tooltip');
const svg=document.querySelector('.spain-map');
let svgRegions=[...document.querySelectorAll('.fallback-geography [data-id]')];
const searchInput=document.querySelector('#region-search');
const list=document.querySelector('#region-list');
const empty=document.querySelector('#search-empty');
let selected='cataluna';
let hovered=null;
const normalize=s=>String(s).normalize('NFKC').toLowerCase().replace(/\s|[・=＝\-ー]/g,'');
/* 右側の説明を更新。textContent はHTMLタグとして解釈しない安全な文字の挿入方法です。 */
function showDetails(id){
  const r=byId[id];if(!r)return;
  const topic=TOPICS[currentTopic],spots=TOPIC_DATA[id].spots[currentTopic];
  document.querySelector('#region-count').textContent=`${String(r.index+1).padStart(2,'0')} / 19`;
  document.querySelector('#detail-icon').textContent=topic.icon;
  document.querySelector('#detail-category').textContent=topic.english;
  document.querySelector('#detail-english').textContent=r.english+' / ESPAÑA';
  document.querySelector('#details-title').textContent=r.name;
  document.querySelector('#detail-description').textContent=`${r.name}で${topic.action}。おすすめは「${spots[0]}」と「${spots[1]}」です。地図のピンをタップして地域を選択できます。`;
  document.querySelector('#detail-theme').textContent=topic.label+' / '+r.name;
  document.querySelector('#detail-visual').style.background=`linear-gradient(140deg, ${topic.color} 0%, ${topic.color}bb 52%, #eec7a4 140%)`;
  const spotList=document.querySelector('#detail-spots');spotList.replaceChildren();
  spots.forEach(name=>{const item=document.createElement('span');item.className='spot';item.textContent=name;spotList.append(item);});
}

/* 選択済みの地域に active クラスを付け、CSSの見た目を変えます。 */
function paint(){
 svgRegions.forEach(el=>{el.classList.toggle('is-selected',el.dataset.id===selected);el.classList.toggle('is-hovered',el.dataset.id===hovered);});
 document.querySelectorAll('.region-btn').forEach(btn=>{const on=btn.dataset.region===selected;btn.classList.toggle('active',on);btn.setAttribute('aria-pressed',String(on));});
}
/* 地図・一覧・説明パネルを同じ地域に揃える中心的な関数。 */
function selectRegion(id,scroll=false){
 if(!byId[id])return;selected=id;showDetails(id);paint();renderTopicPins();if(scroll)document.querySelector('#explore').scrollIntoView({behavior:'smooth',block:'start'});
}
/* マウスの位置から、情報ポップアップを置く座標を計算します。 */
function tooltipAt(evt){
 const rect=stage.getBoundingClientRect();
 const x=evt.clientX-rect.left,y=evt.clientY-rect.top;
 tooltip.style.left=`${Math.max(8,Math.min(x,rect.width-225))}px`;
 tooltip.style.top=`${Math.max(75,y)}px`;
}
function showTooltip(id,evt){
 const r=byId[id];if(!r)return;
 hovered=id;tooltip.replaceChildren();
 const title=document.createElement('strong');title.textContent=r.name;
 const text=document.createElement('span');text.textContent=TOPIC_DATA[id].spots[currentTopic].join(' / ');
 tooltip.append(title,text);tooltip.hidden=false;
 if(evt&&'clientX'in evt)tooltipAt(evt);else{tooltip.style.left='25px';tooltip.style.top='85px';}
 paint();
}
function hideTooltip(){hovered=null;tooltip.hidden=true;paint();}
/* 各地域のSVGパーツにクリック・ホバー用イベントを登録します。 */
function bindRegionElement(el){
 const id=el.dataset.id,r=byId[id];
 if(!r)return;
 el.setAttribute('role','button');el.setAttribute('tabindex','0');el.setAttribute('aria-label',r.name+'の観光情報を表示');
 el.addEventListener('pointerenter',evt=>showTooltip(id,evt));
 el.addEventListener('pointermove',evt=>{if(!tooltip.hidden)tooltipAt(evt);});
 el.addEventListener('pointerleave',hideTooltip);
 el.addEventListener('focus',()=>showTooltip(id));
 el.addEventListener('blur',hideTooltip);
 el.addEventListener('click',()=>selectRegion(id));
 el.addEventListener('keydown',evt=>{if(evt.key==='Enter'||evt.key===' '){evt.preventDefault();selectRegion(id);}});
}
svgRegions.forEach(bindRegionElement);
/* 入力された検索文字で地域リストを絞り込みます。 */
function drawList(term=''){
 list.replaceChildren();const q=normalize(term);
 const filtered=REGIONS.filter(r=>normalize([r.name,r.english,r.search,...TOPIC_DATA[r.id].spots[currentTopic]].join(' ')).includes(q));
 filtered.forEach(r=>{const btn=document.createElement('button');btn.className='region-btn';btn.type='button';btn.dataset.region=r.id;btn.textContent=r.name;btn.addEventListener('click',()=>selectRegion(r.id));list.append(btn);});
 empty.hidden=filtered.length!==0;paint();
}
searchInput.addEventListener('input',()=>drawList(searchInput.value));
document.querySelectorAll('[data-goto]').forEach(btn=>btn.addEventListener('click',()=>selectRegion(btn.dataset.goto,true)));
const toggle=document.querySelector('#theme-toggle');
/* CSSの body.dark-theme と連動するダークモード。 */
function setTheme(dark){
 document.body.classList.toggle('dark-theme',dark);
 document.querySelector('#theme-label').textContent=dark?'ライトモード':'ダークモード';
 document.querySelector('#theme-icon').textContent=dark?'☀':'☾';
 toggle.setAttribute('aria-pressed',String(dark));
 try{localStorage.setItem('espana-atlas-theme',dark?'dark':'light');}catch(e){}
}
let storedTheme='light';try{storedTheme=localStorage.getItem('espana-atlas-theme')||'light';}catch(e){}
setTheme(storedTheme==='dark');
toggle.addEventListener('click',()=>setTheme(!document.body.classList.contains('dark-theme')));
/* 【STEP 2】自然・建築・サッカー・グルメのボタンが押されたときの切替処理。 */
function setTopic(key){
 if(!TOPICS[key])return;
 currentTopic=key;
 const topic=TOPICS[key];
 document.documentElement.style.setProperty('--topic-color',topic.color);
 document.querySelectorAll('.topic-btn').forEach(btn=>{
  const on=btn.dataset.topic===key;btn.classList.toggle('active',on);btn.setAttribute('aria-pressed',String(on));
 });
 document.querySelector('#topic-summary').textContent=topic.action+'：地図から地域を選択してください。';
 document.querySelector('#topic-legend').textContent=topic.icon+' '+topic.label+'のおすすめ地点';
 showDetails(selected);drawList(searchInput.value);renderTopicPins();hideTooltip();
}
document.querySelectorAll('.topic-btn').forEach(b=>b.addEventListener('click',()=>setTopic(b.dataset.topic)));
// 正確な自治州境界 (オンライン時)。読み込みに失敗しても概略図は常に使えます。
/* ネット接続中だけ利用する地図境界データのURL。失敗時は内蔵の簡易地図を使用します。 */
const GEOJSON_URL='https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/spain-communities.geojson';
const MAP_NS='http://www.w3.org/2000/svg';
const realNames={
  andalucia:'andalucia',aragon:'aragon',asturias:'asturias',baleares:'baleares',
  canarias:'canarias',cantabria:'cantabria',castillalamancha:'castillalamancha',
  castillaleon:'castillayleon',castillayleon:'castillayleon',cataluna:'cataluna',
  ceuta:'ceuta',comunidadvalenciana:'comunitatvalenciana',valencia:'comunitatvalenciana',
  extremadura:'extremadura',galicia:'galicia',larioja:'larioja',madrid:'madrid',
  melilla:'melilla',murcia:'murcia',navarra:'navarra',paisvasco:'paisvasco'
};
function latinKey(input){return String(input||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z]/g,'');}
/* 緯度・経度をSVG内のx,y座標に変換。カナリア諸島は見やすい位置に移しています。 */
function mapPoint(point,key){
 const [lon,lat]=point;
 if(key==='canarias')return [114+(lon+18.2)*35.5,517+(29.6-lat)*23.5];
 return [101+(lon+9.6)*48.6,97+(44-lat)*45];
}
/* GeoJSONの輪郭をSVG <path> の d 属性で使える文字列に変換します。 */
function toSvgPath(feature,key){
 const polygons=feature.geometry.type==='MultiPolygon'?feature.geometry.coordinates:[feature.geometry.coordinates];
 let result='';
 polygons.forEach(polygon=>polygon.forEach(ring=>{
  if(ring.length<3)return;
  let points=ring.map(pt=>mapPoint(pt,key));
  if(points.length>4){
   // 視覚上変化のない至近点を省き、表示を軽くします。
   const filtered=[points[0]];let last=points[0];
   for(let i=1;i<points.length-1;i++){
    const p=points[i],dx=p[0]-last[0],dy=p[1]-last[1];
    if(dx*dx+dy*dy>.64){filtered.push(p);last=p;}
   }
   filtered.push(points[points.length-1]);
   if(filtered.length>=3)points=filtered;
  }
  result+='M'+points.map(([x,y])=>x.toFixed(1)+' '+y.toFixed(1)).join('L')+'Z';
 }));
 return result;
}
const labelCoordinates={
 galicia:[-8.4,42.4],asturias:[-5.8,43.3],cantabria:[-4.0,43.2],paisvasco:[-2.64,43.06],
 navarra:[-1.47,42.68],larioja:[-2.48,42.35],castillayleon:[-4.55,41.72],aragon:[-.78,41.48],
 cataluna:[1.30,41.86],comunitatvalenciana:[-.32,39.5],madrid:[-3.7,40.37],
 castillalamancha:[-3.25,39.1],extremadura:[-6.1,39.15],andalucia:[-4.75,37.6],
 murcia:[-1.28,37.96],baleares:[2.74,39.65],canarias:[-16.3,28.6]
};
const shortLabels={
 galicia:'GALICIA',asturias:'ASTURIAS',cantabria:'CANTABRIA',paisvasco:'BASQUE',
 navarra:'NAVARRA',larioja:'RIOJA',castillayleon:'CASTILLA Y LEÓN',aragon:'ARAGÓN',
 cataluna:'CATALUÑA',comunitatvalenciana:'VALENCIA',madrid:'MADRID',
 castillalamancha:'CASTILLA-LA MANCHA',extremadura:'EXTREMADURA',andalucia:'ANDALUCÍA',
 murcia:'MURCIA',baleares:'BALEARES',canarias:'CANARIAS'
};

const fallbackPinLocations={galicia:[163,170],asturias:[278,139],cantabria:[371,144],paisvasco:[453,149],navarra:[516,174],larioja:[447,191],castillayleon:[320,231],aragon:[559,240],cataluna:[657,203],comunitatvalenciana:[685,327],madrid:[425,305],castillalamancha:[522,363],extremadura:[310,356],andalucia:[445,465],murcia:[642,435],baleares:[790,313],canarias:[190,539],ceuta:[439,531],melilla:[584,535]};
const featuredPins={
 nature:['galicia','asturias','navarra','aragon','cataluna','andalucia','baleares','canarias'],
 culture:['galicia','castillayleon','aragon','cataluna','madrid','castillalamancha','andalucia','baleares'],
 football:['paisvasco','navarra','cataluna','comunitatvalenciana','madrid','andalucia','baleares','canarias'],
 food:['galicia','paisvasco','larioja','cataluna','comunitatvalenciana','madrid','andalucia','baleares']
};
/* 地図の上にカテゴリに合わせた観光ピンを描画します。 */
function renderTopicPins(){
 const layer=document.querySelector('#topic-pins');if(!layer)return;
 layer.replaceChildren();
 const exact=svg.classList.contains('accurate');
 featuredPins[currentTopic].forEach((id,i)=>{
  const fallback=fallbackPinLocations[id];
  const point=exact&&labelCoordinates[id]?mapPoint(labelCoordinates[id],id):fallback;
  if(!point)return;
  const [x,y]=point;
  const g=document.createElementNS(MAP_NS,'g');g.setAttribute('class','topic-marker');g.setAttribute('transform',`translate(${x} ${y})`);
  g.setAttribute('role','button');g.setAttribute('tabindex','0');g.setAttribute('aria-label',`${byId[id].name}：${TOPIC_DATA[id].spots[currentTopic][0]}`);
  const halo=document.createElementNS(MAP_NS,'circle');halo.setAttribute('r',selected===id?'18':'15');halo.setAttribute('fill','#fff');halo.setAttribute('fill-opacity','.85');
  const dot=document.createElementNS(MAP_NS,'circle');dot.setAttribute('r',selected===id?'12':'10');dot.setAttribute('fill',TOPICS[currentTopic].color);dot.setAttribute('stroke','#fff');dot.setAttribute('stroke-width','2');
  const number=document.createElementNS(MAP_NS,'text');number.textContent=String(i+1);number.setAttribute('text-anchor','middle');number.setAttribute('dominant-baseline','central');number.setAttribute('font-size','11');number.setAttribute('font-weight','800');number.setAttribute('fill','#fff');number.style.pointerEvents='none';
  g.append(halo,dot,number);
  g.addEventListener('click',()=>selectRegion(id));
  g.addEventListener('pointerenter',e=>showTooltip(id,e));g.addEventListener('pointerleave',hideTooltip);
  g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectRegion(id);}});
  layer.append(g);
 });
}

const toggleMap=document.querySelector('#map-mode-toggle');
const mapStatus=document.querySelector('#map-mode-status');
const mapDisclaimer=document.querySelector('#map-disclaimer');
let exactLoaded=false;
/* オンライン精密地図とオフライン概略地図を切り替えます。 */
function setAccurate(on){
 if(!exactLoaded)return;
 svg.classList.toggle('accurate',on);
 toggleMap.textContent=on?'概略図に切替':'詳細地図に切替';
 toggleMap.setAttribute('aria-pressed',String(on));
 mapStatus.textContent=on?'自治州の詳細な境界':'オフライン対応の概略地図';
 mapDisclaimer.textContent=on?'自治州境界のデータ：codeforgermany / click_that_hood':'※ 地域の形と境界は簡略化した概略図です';
 svgRegions=[...document.querySelectorAll(on?'.accurate-geography [data-id]':'.fallback-geography [data-id]')];
 hideTooltip();paint();renderTopicPins();
}
toggleMap.addEventListener('click',()=>setAccurate(!svg.classList.contains('accurate')));
/* fetch() で外部GeoJSONを非同期取得。通信に失敗してもページ本体は使えます。 */
async function loadAccurateMap(){
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),14000);
 try{
  const response=await fetch(GEOJSON_URL,{signal:controller.signal});
  if(!response.ok)throw new Error('HTTP '+response.status);
  const data=await response.json();
  if(!Array.isArray(data.features))throw new Error('Invalid GeoJSON');
  const regionGroup=document.createElementNS(MAP_NS,'g');regionGroup.classList.add('map-geography','accurate-geography');
  regionGroup.setAttribute('aria-label','実際の地理データによる自治州境界');
  const matched=new Set();
  for(const feature of data.features){
   const key=realNames[latinKey(feature.properties?.name)];
   if(!key||!byId[key])continue;
   const d=toSvgPath(feature,key);
   if(!d)continue;
   const path=document.createElementNS(MAP_NS,'path');path.setAttribute('d',d);path.dataset.id=key;
   path.setAttribute('fill-rule','evenodd');bindRegionElement(path);regionGroup.append(path);matched.add(key);
  }
  // Extremely small autonomous cities remain easy to click on phones.
  for(const [key,pt] of [['ceuta',[-5.32,35.89]],['melilla',[-2.95,35.29]]]){
   const [x,y]=mapPoint(pt,key),circle=document.createElementNS(MAP_NS,'circle');
   circle.setAttribute('cx',x.toFixed(1));circle.setAttribute('cy',y.toFixed(1));circle.setAttribute('r','7');
   circle.setAttribute('class','small-city');circle.dataset.id=key;bindRegionElement(circle);regionGroup.append(circle);matched.add(key);
  }
  if(matched.size!==19)throw new Error('一部の地域データが不足: '+matched.size+'/19');
  const labels=document.createElementNS(MAP_NS,'g');labels.classList.add('map-labels','accurate-labels');
  labels.setAttribute('aria-hidden','true');
  Object.entries(labelCoordinates).forEach(([key,pos])=>{
   const [x,y]=mapPoint(pos,key);const el=document.createElementNS(MAP_NS,'text');
   el.textContent=shortLabels[key];el.setAttribute('x',x.toFixed(1));el.setAttribute('y',y.toFixed(1));
   if(['asturias','cantabria','paisvasco','navarra','larioja','murcia','madrid'].includes(key))el.classList.add('tiny-label');
   if(key==='canarias')el.setAttribute('y','582');
   labels.append(el);
  });
  svg.insertBefore(regionGroup,svg.querySelector('.fallback-labels'));
  svg.insertBefore(labels,svg.querySelector('.sea-label'));
  exactLoaded=true;toggleMap.hidden=false;setAccurate(true);
 }catch(err){
  console.info('オンライン境界を読み込めないため概略図を使います。',err);
  mapStatus.textContent='オフライン対応の概略地図';
  mapDisclaimer.textContent='※ 地域の形と境界は簡略化した概略図です';
 }finally{clearTimeout(timeout);}
}
loadAccurateMap();
setTopic("nature");

});



document.addEventListener('DOMContentLoaded',()=>{
/* 【STEP 3】都市間交通：検索対象の都市と地図上のおおよその位置。 */
 const CITIES={
 barcelona:{name:'バルセロナ',en:'Barcelona, Spain',xy:[657,203],island:false},madrid:{name:'マドリード',en:'Madrid, Spain',xy:[425,305]},valencia:{name:'バレンシア',en:'Valencia, Spain',xy:[677,327]},sevilla:{name:'セビリア',en:'Seville, Spain',xy:[365,462]},malaga:{name:'マラガ',en:'Malaga, Spain',xy:[455,482]},granada:{name:'グラナダ',en:'Granada, Spain',xy:[527,463]},bilbao:{name:'ビルバオ',en:'Bilbao, Spain',xy:[450,149]},zaragoza:{name:'サラゴサ',en:'Zaragoza, Spain',xy:[547,240]},palma:{name:'パルマ（マヨルカ島）',en:'Palma de Mallorca, Spain',xy:[790,313],island:true},tenerife:{name:'サンタ・クルス（テネリフェ）',en:'Santa Cruz de Tenerife, Spain',xy:[190,539],island:true}};
/* 都市内交通：都市ごとに選べる観光地・駅などを定義。 */
 const LOCAL={
 barcelona:{starts:['カタルーニャ広場','Barcelona Sants 駅','バルセロナ空港'],spots:['サグラダ・ファミリア','カンプ・ノウ','グエル公園','カサ・バトリョ','バルセロネータ海岸'],official:[['TMB（地下鉄・バス）','https://www.tmb.cat/en/home/']]},
 madrid:{starts:['プエルタ・デル・ソル','Madrid Atocha 駅','マドリード空港'],spots:['サンティアゴ・ベルナベウ','プラド美術館','マドリード王宮','レティーロ公園','メトロポリターノ'],official:[['EMT Madrid（市バス）','https://www.emtmadrid.es/Home']]},
 valencia:{starts:['バレンシア北駅','市庁舎広場','バレンシア空港'],spots:['芸術科学都市','中央市場','マルバロサ海岸','メスタージャ'],official:[]},
 sevilla:{starts:['セビリア大聖堂','Santa Justa 駅','セビリア空港'],spots:['スペイン広場','セビリア大聖堂','アルカサル','ベニート・ビジャマリン'],official:[]},
 malaga:{starts:['Málaga María Zambrano 駅','マラガ空港','マラガ中心部'],spots:['アルカサバ','マラゲータ海岸','ピカソ美術館'],official:[]},
 granada:{starts:['グラナダ駅','グラナダ大聖堂','グラナダ・バスターミナル'],spots:['アルハンブラ宮殿','アルバイシン地区','グラナダ大聖堂'],official:[]},
 bilbao:{starts:['Bilbao-Abando 駅','ビルバオ空港','モジュア広場'],spots:['グッゲンハイム美術館','サン・マメス','旧市街'],official:[]},
 zaragoza:{starts:['Zaragoza Delicias 駅','ピラール広場'],spots:['ピラール聖母大聖堂','アルハフェリア宮殿','ラ・ロマレーダ'],official:[]},
 palma:{starts:['パルマ大聖堂','パルマ空港','パルマ・インターモーダル駅'],spots:['パルマ大聖堂','ベルベル城','カラ・マヨール','エスタディ・ソン・モイシュ'],official:[]},
 tenerife:{starts:['サンタ・クルス中心部','テネリフェ北空港'],spots:['テイデ国立公園','ラ・ラグーナ旧市街','ラス・テレシタス海岸'],official:[]}
 };
/* $() は document.getElementById() を短く書くための自作関数です。 */
 const $=id=>document.getElementById(id);
 const addOptions=(sel,values,initial)=>{sel.replaceChildren();values.forEach(([value,label])=>{const opt=document.createElement('option');opt.value=value;opt.textContent=label;sel.append(opt)});sel.value=initial??values[0][0]};
 const cityOptions=Object.entries(CITIES).map(([k,c])=>[k,c.name]);
 addOptions($('trip-from'),cityOptions,'barcelona');addOptions($('trip-to'),cityOptions,'madrid');addOptions($('local-city'),cityOptions,'barcelona');
/* Googleマップに出発地・目的地・移動手段を渡すURLを組み立てます。 */
 const mapsUrl=(origin,destination,mode)=>'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(origin)+'&destination='+encodeURIComponent(destination)+(mode?'&travelmode='+mode:'');
 const ext=(text,url)=>{const a=document.createElement('a');a.textContent=text;a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a};
 function option(icon,title,desc,url){const art=document.createElement('article');art.className='transport-option';const sym=document.createElement('span');sym.className='transport-symbol';sym.textContent=icon;const body=document.createElement('div');const b=document.createElement('b');b.textContent=title;const p=document.createElement('p');p.textContent=desc;body.append(b,p);art.append(sym,body,ext('経路を見る ↗',url));return art}
/* SVG要素は通常のHTMLと違い createElementNS を使用します。 */
 const NS='http://www.w3.org/2000/svg';
 function drawRoute(){const l=$('transport-lines');l.replaceChildren();if(!document.body.classList.contains('transport-active'))return;const a=CITIES[$('trip-from').value],b=CITIES[$('trip-to').value];if(a===b)return;let [x1,y1]=a.xy,[x2,y2]=b.xy;const d=document.createElementNS(NS,'path');d.setAttribute('d',`M${x1} ${y1} Q${(x1+x2)/2} ${Math.min(y1,y2)-35} ${x2} ${y2}`);d.setAttribute('class','transport-line');l.append(d);[[x1,y1,a.name,false],[x2,y2,b.name,true]].forEach(([x,y,t,last])=>{const circle=document.createElementNS(NS,'circle');circle.setAttribute('cx',x);circle.setAttribute('cy',y);circle.setAttribute('r',11);circle.setAttribute('class',last?'transport-point transport-point-end':'transport-point');const label=document.createElementNS(NS,'text');label.setAttribute('x',x);label.setAttribute('y',y-24);label.setAttribute('class','transport-route-label');label.textContent=t;l.append(circle,label)});}
 function updateIntercity(){let a=CITIES[$('trip-from').value],b=CITIES[$('trip-to').value];$('trip-heading').textContent=`${a.name} → ${b.name}`;const list=$('trip-options');list.replaceChildren();if(a===b){const msg=document.createElement('p');msg.textContent='出発地と目的地が同じです。異なる都市を選択してください。';list.append(msg);$('intercity-maps-link').href=mapsUrl(a.en,b.en);drawRoute();return}
 const island=Boolean(a.island||b.island);
 if(!island)list.append(option('🚄','鉄道','鉄道路線・乗継・所要時間を確認',mapsUrl(a.en,b.en,'transit')));
 list.append(option('✈️','飛行機','就航便の有無や空港アクセスを確認（直行便とは限りません）',`https://www.google.com/travel/flights?hl=ja`));
 if(!island)list.append(option('🚌','長距離バス','路線の有無・乗換・所要時間を確認',mapsUrl(a.en,b.en,'transit')));
 if(island)list.append(option('⛴️','船・フェリー','島への航路の有無を確認。出発港まで別途移動が必要な場合があります','https://www.spain.info/en/discover-spain/main-sea-connections-spain/'));
 if(!island)list.append(option('🚗','車','高速道路などの経路と所要時間を確認',mapsUrl(a.en,b.en,'driving')));
 $('intercity-maps-link').href=mapsUrl(a.en,b.en,island?'':'transit');drawRoute()}
 function updateLocal(){let city=$('local-city').value,data=LOCAL[city];addOptions($('local-from'),data.starts.map(x=>[x,x]),data.starts[0]);addOptions($('local-to'),data.spots.map(x=>[x,x]),data.spots[0]);updateLocalRoute();const links=$('local-official-links');links.replaceChildren();data.official.forEach(([text,url])=>links.append(ext(text+' ↗',url)))}
 function updateLocalRoute(){let city=CITIES[$('local-city').value];let from=$('local-from').value+', '+city.en,to=$('local-to').value+', '+city.en;$('local-heading').textContent=$('local-from').value+' → '+$('local-to').value;$('local-transit-link').href=mapsUrl(from,to,'transit');$('local-walk-link').href=mapsUrl(from,to,'walking');$('local-drive-link').href=mapsUrl(from,to,'driving')}
 $('trip-from').addEventListener('change',updateIntercity);$('trip-to').addEventListener('change',updateIntercity);$('trip-swap').addEventListener('click',()=>{const a=$('trip-from').value;$('trip-from').value=$('trip-to').value;$('trip-to').value=a;updateIntercity()});$('local-city').addEventListener('change',updateLocal);$('local-from').addEventListener('change',updateLocalRoute);$('local-to').addEventListener('change',updateLocalRoute);
 function switchMode(local){$('transport-intercity-tab').classList.toggle('active',!local);$('transport-local-tab').classList.toggle('active',local);$('transport-intercity-tab').setAttribute('aria-pressed',String(!local));$('transport-local-tab').setAttribute('aria-pressed',String(local));$('intercity-panel').hidden=local;$('local-panel').hidden=!local;drawRoute()}
 $('transport-intercity-tab').addEventListener('click',()=>switchMode(false));$('transport-local-tab').addEventListener('click',()=>switchMode(true));
 function enableTransport(){document.body.classList.add('transport-active');$('transport-tab').classList.add('active','transport-selected');$('transport-tab').setAttribute('aria-pressed','true');document.querySelectorAll('.topic-btn[data-topic]').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-pressed','false')});$('topic-summary').textContent='🚆 都市間の参考ルートを地図上に表示します。下の交通パネルから検索できます。';$('topic-legend').textContent='🚆 ルート線（模式図）';$('topic-pins').style.display='none';drawRoute();$('transport').scrollIntoView({behavior:'smooth',block:'start'})}
 $('transport-tab').addEventListener('click',enableTransport);document.querySelectorAll('.topic-btn[data-topic]').forEach(b=>b.addEventListener('click',()=>{document.body.classList.remove('transport-active');$('transport-lines').replaceChildren();$('topic-pins').style.display='';$('transport-tab').classList.remove('active','transport-selected');$('transport-tab').setAttribute('aria-pressed','false')}));
 updateIntercity();updateLocal();switchMode(false);
});
