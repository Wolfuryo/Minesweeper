function query(e){
this.f=document.querySelector(e);
if(this.f) return this.f;
else console.log("query error:"+e);
}
function _query(e){
this.f=document.querySelectorAll(e);
if(this.f && this.f.length) return this.f;
else console.log("_query error:"+e);
}
function listen(elem, event, callback){
console.log(elem);
elem.addEventListener(event, function(e){
callback(e);
});
}
function wait(time, cback){
setTimeout(function(){
cback();
}, time);
}

var c=0;

// Restricts input for the given textbox to the given inputFilter.
function setInputFilter(textbox, inputFilter) {
["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
textbox.addEventListener(event, function(){
if(inputFilter(this.value)) {
this.oldValue=this.value;
this.oldSelectionStart=this.selectionStart;
this.oldSelectionEnd=this.selectionEnd;
} else if(this.hasOwnProperty("oldValue")){
this.value=this.oldValue;
this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
}
});
});
}

var time;

var api="http://amicalf.000webhostapp.com/mineapi/";

var camp=-1;

var elems={
recs:query(".ld-items"),
back:query(".back"),
links:_query(".menu"),
screens:_query(".screen"),
nav:query("nav"),
input:_query("input[type='text']"),
form:query("form"),
timer:{
mins:query(".minutes"),
secs:query(".seconds"),
},
_form:query(".form-gray"),
markers:query(".markersn"),
circle:query(".circle"),
right:query(".right-screen"),
presets:_query(".presets>span"),
win:query(".win"),
board:query(".board"),
info:query(".right-info"),
send:query(".rec-send"),
form_error:query(".i-label"),
form_loader:query(".form_loader"),
send_success:query(".send_success"),
send_error:query(".send_error"),
end:query(".end"),
body:query("body"),
};

var won_temp='<span class="win-con"><span class="win-title">You won</span><span class="win-time">Time:{time}</span>'+
'<span class="win-type">{x} by {y}, {b} bombs</span>'+
'<span class="win-send">Save your score online</span>'+
'<span class="win-go">Close</span></span>';

var presets={
beginner:{rows:8, columns:8, bombs:10,},
interm:{rows:16, columns:16, bombs:40,},
expert:{rows:16, columns:30, bombs:60,},
};

//returns a random number between min and max
function rand(min, max){
min=Math.ceil(min);
max=Math.floor(max);
return Math.floor(Math.random()*(max-min+1))+min;
}

function rand_cell(d){
return new pair(rand(1, d.rows), rand(1, d.columns));
}

//returns an array of n random numbers between min and max
function nrand(n, min, max){
var ar=[], r;
for(var i=1;i<=n;i++){
r=rand(min, max);
while(ar.indexOf(r)!=-1) r=rand(min, max);
ar[i]=r;
}
return ar;
}

//restrict input data to numbers-only and clear the values;
(function(){
var inp=elems.input, len=3;
for(var i=0;i<len;i++){
inp[i].value="";
setInputFilter(inp[i], function(value){
return /^\d*$/.test(value);
});
}
query("[name='name']").value="";
})();

//menu
(function(){
var links=elems.links, len=links.length;
for(var i=0;i<len;i++){
(function(i){
listen(links[i], "click", function(){
elems.nav.classList.add("nav-out");
render(i);
})
})(i)
}
})();

//render the screens
var story=0;
function render(i){
elems.screens[i].classList.add("current-screen");
elems.back.classList.add("back-on");
overflow(0);
if(i==2) overflow(1);
}

//switch
function overflow(q){
if(q){
elems.body.classList.add("oflow");
} else {
elems.body.classList.remove("oflow");
}
}

//back button
(function(){
listen(elems.back, "click", function(){
query(".current-screen").classList.remove("current-screen");
overflow(0);
elems.back.classList.remove("back-on");
elems.nav.classList.remove("nav-out");
})
})();

//play screen->form
(function(){
var rows, columns, bombs, data={};
listen(elems.form, "submit", function(e){
e.preventDefault();
rows=parseInt(elems.input[0].value) || 0;
columns=parseInt(elems.input[1].value) || 0;
bombs=parseInt(elems.input[2].value) || 0;
if(rows<8) rc=8;
if(columns<8) columns=8;
if(bombs<10) bombs=10;
if(columns>30) columns=30;
if(rows>30) rows=30;
if(bombs>(rows*columns/2)) bombs=rows*columns/2;
elems._form.classList.add("form-hidden");
data.rows=rows || 8;
data.columns=columns || 8;
data.bombs=bombs || 8;
var ddd=new start(data);
})
for(var i=0;i<3;i++){
(function(i){
listen(elems.presets[i], "click", function(){
var ccc=new start(presets[elems.presets[i].className]);
elems._form.classList.add("form-hidden");
})
})(i);
}
})();

//a pair structure, holds mine positions
function pair(x, y){
this.x=x;
this.y=y;
return this;
}

//returns whether there is a bomb on x, y in board boards
function isb(board, x, y){
return board[x][y]===-1;
}

//calculate the number of mines around every cell
function calculate(d, board){
console.log(board);
var b;
for(var i=1;i<=d.rows;i++){
for(var j=1;j<=d.columns;j++){
if(!isb(board, i, j)){
b=0;
if(exists(d, i-1, j, board)) if(isb(board, i-1, j)) b++;
if(exists(d, i+1, j, board)) if(isb(board, i+1, j)) b++;
if(exists(d, i, j-1, board)) if(isb(board, i, j-1)) b++;
if(exists(d, i, j+1, board)) if(isb(board, i, j+1)) b++;
if(exists(d, i-1, j-1, board)) if(isb(board, i-1, j-1)) b++;
if(exists(d, i+1, j-1, board)) if(isb(board, i+1, j-1)) b++;
if(exists(d, i-1, j+1, board)) if(isb(board, i-1, j+1)) b++;
if(exists(d, i+1, j+1, board)) if(isb(board, i+1, j+1)) b++;
board[i][j]=b;
}
}
}
}

//returns a cell
function cell(x, y){
return elems.lines[x-1].children[y-1];
}

//render the board
function render_board(d, board){
var e="", q="<div class='board'>";
for(var i=1;i<=d.rows;i++){
e="";
for(var j=1;j<=d.columns;j++){
e+="<span class='cell' data-x='"+i+"' data-y='"+j+"'></span>";
}
q+="<div class='line'>"+e+"</div>";
}
elems.board.innerHTML=q+"</div>";
elems.info.classList.add("info-hidden");
elems.cells=_query(".cell");
elems.lines=_query(".line");
}

//Check if a given square has any adjacent square with no bombs
function around_bombs(d, q, w, board){
var b=0, c=0, o, p;
for(var i=0;i<8;i++){
o=q+dir[i].x;
p=w+dir[i].y;
if(exists(d, q, w, board)){
b++;
if(isb(board, q, w)){
c++;
}
}
}
if(b==c){
return 1;
}
return 0;
}

//move a bomb from position x, y
function move(d, x, y, tl, br, board){
var b=0, q=rand(1, d.rows), w=rand(1, d.columns);
while(isb(board, q, w) || around_bombs(d, q, w, board) || (x==q && y==w) || (q>=tl.x && q<=br.x && w>=tl.y && w<=br.y)){
q=rand(1, d.rows);
w=rand(1, d.columns);
}
if(!isb(board, q, w) && !around_bombs(d, q, w, board) && !(x==q && y==w) && !(q>=tl.x && q<=br.x && w>=tl.y && w<=br.y)){
board[q][w]=-1;
board[x][y]=0;
}
}

//moves bombs in the cells between given corners
function mover(tl, br, d, board){
for(var i=tl.x;i<=br.x;i++){
for(var j=tl.y;j<=br.y;j++){
if(isb(board, i, j)) move(d, i, j, tl, br, board);
}
}
}

//first cell clicked
//modifiers for the corners
var corners=new Array(
new pair(-1, -1), //top left
new pair(1, 1), //bottom right
);
//take coordinates and modify them according to mod
function modif(a, b, mode){
a=a+(mode.x);
b=b+(mode.y);
return [a, b]
};
function first(d, x, y, board){
var depth=2;
var q=x, w=y;
var tl, br;
for(var i=0;i<depth;i++){
var p=modif(q, w, corners[0]);
q=p[0];
w=p[1];
}
while(!exists(d, q, w, board)){
q++;
w++;
}
tl=new pair(q, w);

q=x;w=y;
for(var i=0;i<depth;i++){
var p=modif(q, w, corners[1]);
q=p[0];
w=p[1];
}
while(!exists(d, q, w, board)){
q--;
w--;
}
br=new pair(q, w);
mover(tl, br, d, board);
}

//reset everything for a new match
function reset(){
markers=0;
c=0;
elems.markers.innerHTML="0";
elems.timer.minutes="00";
elems.timer.seconds="00";
elems._form.classList.remove("form-hidden");
}

//Victory :)
function finish(d){
elems.board.innerHTML="";
elems.info.classList.remove("info-hidden");
var cc=c;
o=0;
reset();
elems.win.classList.add("won");
var q=won_temp, m, s;
m=parseInt(cc/60);
s=cc-m*60;
q=q.replace("{time}", m+":"+s);
q=q.replace("{x}", d.rows).replace("{y}", d.columns).replace("{b}", d.bombs);
elems.win.innerHTML=q;
stop_timer();
record(d, cc);
}

//set up for saving the score online
function record(d, cc){
var send=query(".win-send"), go=query(".win-go");
listen(send, "click", function(){
elems.win.classList.remove("won");
elems.send.classList.add("getting");
send_form(d, cc);
})
listen(go, "click", function(){
elems.win.classList.remove("won");
})
}

//logic for the form that has to send the record data
var sending=0;
function send_form(d, cc){
var form=query(".rec-send"), name;
listen(form, "submit", function(e){
e.preventDefault();
if(sending) return;
sending=1;
name=query("[name='name']").value;
if(name.length<5 || name.length>100){
send_error();
sending=0;
} else {
elems.form_loader.classList.add("loading");
get(api+"/post.php?name="+encodeURI(name)+"&rows="+d.rows+"&columns="+d.columns+"&bombs="+d.bombs+"&time="+cc, function(data){
sending=0;
elems.form_loader.classList.remove("loading");
elems.send.classList.remove("getting");
if(data==1){
elems.send_success.classList.add("e_s_display");
wait(2000, function(){
elems.send_success.classList.remove("e_s_display");
});
} else {
elems.send_error.classList.add("e_e_display");
wait(2000, function(){
elems.send_error.classList.remove("e_e_display");
})
}
}, function(e){
elems.send.classList.remove("getting");
elems.send_error.classList.add("e_e_display");
wait(2000, function(){
elems.send_error.classList.remove("e_e_display");
})
})
}
})
}

//simple fetch wrapper
function get(url, callback, error){
error=error || {};
fetch(url).then(function(response){
return response.text();
}).then(function(data){
callback(data);
}).catch(function(e){
})
};

//show an error if the record can't be sent
function send_error(){
elems.form_error.classList.add("errored");
wait(400, function(){
elems.form_error.classList.remove("errored");
})
}

function update_markers(markers){
elems.markers.innerHTML=markers;
}

//end the game with a loss
function end(){
o=0;
reset();
stop_timer();
elems.end.classList.add("end_here");
elems.board.innerHTML="";
elems.info.classList.remove("info-hidden");
wait(3000, function(){
elems.end.classList.remove("end_here");
})
}

//logic for clicking a cell
function click(d, x, y, board, markers){
if(isb(board, x, y)){
end();
} else {
if(board[x][y]===0){
c=0;
reveal(d, x, y, board, markers);
} else {
var c=cell(x, y);
c.classList.add("no-rc");
c.innerHTML=board[x][y];
if(!c.classList.contains("revealed")){
c.classList.add("revealed");
g++;
}
}
if(done(d, markers)) finish(d);
}
}

var g=0;
//check if the game is finished(every cell is revealed, except for the mines) and the mines are all marked
function done(d, markers){
return (d.rows*d.columns-d.bombs)==_query(".revealed").length && d.bombs==markers;
}

//checks if the coords x and y exist in board
function exists(d, x, y, board){
return 1<=x && 1<=y && x<=d.rows && y<=d.columns;
}

//checks if coord x exists in board
function existsx(d, x){
return 1<=x && x<=d.rows;
}

//checks if coord y exists in board
function existsy(d, y){
return 1<=y && y<=d.columns;
}

//reveal cells when one has no mines around interval
var dir=new Array(
new pair(-1, 0),
new pair(1, 0),
new pair(0, -1),
new pair(0, 1),
new pair(-1, -1),
new pair(-1, 1),
new pair(1, 1),
new pair(1, -1),
);
function reveal(d, x, y, board, markers){
if(!exists(d, x, y, board)) return;
if(cell(x, y).classList.contains("fr") || board[x][y]!=0) return;
if(c>=100000) return false;
c++;
if(!cell(x, y).classList.contains("revealed")){
cell(x, y).classList.add("revealed");
g++;
}
cell(x, y).classList.add("fr");
var q,w;
for(var i=0;i<8;i++){
q=x+dir[i].x;
w=y+dir[i].y;
if(exists(d, q, w, board) && !isb(board, q, w)){
if(!cell(q, w).classList.contains("revealed")){
cell(q, w).classList.add("revealed");
g++;
}
if(board[q][w]==0){
(function(d, q, w){
wait(1, function(){reveal(d, q, w, board, markers, q)});
})(d, q, w);
} else {
cell(q, w).innerHTML=board[q][w];
}
}
}
if(done(d, markers)) finish(d);
}

//set up playing events
var o=0, x, y;
function play_events(d, board, markers){
var cells, len=d.rows*d.columns;
cells=elems.cells;
for(var i=0;i<len;i++){
(function(i){
listen(cells[i], "click", function(){
if(cells[i].classList.contains("marked")) return false;
if(cells[i].classList.contains("clicked")) return false;
cells[i].classList.add("clicked");
x=parseInt(cells[i].getAttribute("data-x"));
y=parseInt(cells[i].getAttribute("data-y"));
if(o===0){
first(d, x, y, board);
calculate(d, board);
click(d, x, y, board, markers);
o=1;
} else {
click(d, x, y, board, markers);
}
});
listen(cells[i], "mousedown", function(e){
e.preventDefault();
if(!cells[i].classList.contains("no-rc")){
if(e.which==3 && !cells[i].classList.contains("revealed")){
cells[i].classList.toggle("marked");
if(cells[i].classList.contains("marked")){
markers++;
} else {
markers--;
}
update_markers(markers);
if(done(d, markers)) finish(d);
}
}
return false;
});
listen(elems.board, "contextmenu", function(e){
e.preventDefault();
})
listen(cells[i], "contextmenu", function(e){
e.preventDefault();
})
})(i)
}
}

//stop the timer
function stop_timer(){
clearInterval(time);
}

//start the timer
function timer(){
var m, s;
this.p=0;
m=elems.timer.mins;
s=elems.timer.secs;
var mins=0, secs=0;
(function(p){
time=setInterval(function(){
p++;
mins=parseInt(p/60);
secs=p-mins*60;
if(mins<10){
m.innerHTML="0"+mins;
} else {
m.innerHTML=mins;
}
if(secs<10){
s.innerHTML="0"+secs;
} else {
s.innerHTML=secs;
}
}, 1000);
})(this.p);
return this;
}

//start the game
function start(d){
o=0;
timer();
this.markers=0;
this.board=new Array();
var cells=d.rows*d.columns;
this.bombs=nrand(d.bombs, 1, cells);
for(var i=1;i<=d.bombs;i++){
this.bombs[i]=new pair(parseInt(this.bombs[i]/d.columns)===(this.bombs[i]/d.columns)?(this.bombs[i]/d.columns):(parseInt(this.bombs[i]/d.columns)+1), this.bombs[i]%d.columns===0?d.columns:this.bombs[i]%d.columns);
}

for(var i=1;i<=d.rows;i++){
this.board[i]=[];
for(var j=1;j<=d.columns;j++){
this.board[i][j]=0;
}
}

for(var i=1;i<=d.bombs;i++){
this.board[this.bombs[i].x][this.bombs[i].y]=-1;
}

render_board(d, this.board);

play_events(d, this.board, this.markers);
}

//initial load of leaderboards data
(function(){
get(api+"get.php", function(d){
records(JSON.parse(d));
})
})();

//compare 2 objects
function comp(ob1, ob2){
var k1=Object.keys(ob1), k2=Object.keys(ob2), len=k1.length;
if(len!=k2.length) return 0;
for(var i=0;i<len;i++){
if(ob1[k1[i]] !=ob2[k1[i]]){
return 0;
break;
}
}
return 1;
}

//parse the leaderboards data, separate it and add events
function records(d){
var beg=[], int=[], exp=[], oth=[], len=d.length, aux={};
for(var i=0;i<len;i++){
aux.rows=d[i].rws;
aux.columns=d[i].columns;
aux.bombs=d[i].bombs;
if(comp(aux, presets.beginner)){
beg.push(d[i]);
} else {
if(comp(aux, presets.beginner)){
int.push(d[i]);
} else {
if(comp(aux, presets.expert)){
exp.push(d[i]);
} else {
oth.push(d[i]);
}
}
}
}
var menus=_query(".ld-menu>span");
listen(menus[0], "click", function(){
render_rec(beg);
})
listen(menus[1], "click", function(){
render_rec(int);
})
listen(menus[2], "click", function(){
render_rec(exp);
})
listen(menus[3], "click", function(){
render_rec(oth);
})
}

//render game records(array of objects with data about each record)
var rec_temp="<span class='item-name'>{name}</span><span class='item-time'>{time}s</span>";
function render_rec(d){
var len=d.length, q;
elems.recs.innerHTML="";
for(var i=0;i<len;i++){
q=document.createElement("div");
q.classList.add("rec-item");
q.innerHTML=rec_temp.replace("{name}", d[i].user).replace("{time}", d[i].time);
elems.recs.appendChild(q);
}
if(!len) elems.recs.innerHTML="<span>No records in this category</span>";
}
