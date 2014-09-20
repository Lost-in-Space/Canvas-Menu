// Setup
var requestAnimationFrame =
  window.requestAnimationFrame ||
  window.requestAnimationFrame ||
  window.requestAnimationFrame ||
  window.requestAnimationFrame ||
  window.requestAnimationFrame ||
function(callback){
  return setTimeout(callback, 1);
};



function extend(obj){
  for (x in obj)
    this[x] = obj[x];
}


function MenuItem(obj){
  this.extend(obj);
  if (this.icon){
    this.iconOffsetX = (this.width - this.icon.width)/2;
    this.iconOffsetY = (this.height - this.icon.height)/2;
  } else {
    this.drawIcon = null;
  }

  if(!this.label){
    this.drawLabel = null;
  } else {
    this.labelOffsetX = this.width/2;
    this.labelOffsetY = this.height/2;
    this.font = this.fontStyle +' '+this.fontSize+'pt '+this.fontFamily;
  }

  if(this.icon && this.label){
    this.iconOffsetY -= this.fontSize/2 + this.padding;
    this.labelOffsetY += this.icon.height/2 + this.padding;
  }

  this.desiredX = this.x;
  this.desiredY = this.y;

}

// menu item can draw itself
MenuItem.prototype = {
  padding: 5,
  constructor: MenuItem,
  extend: extend,
  x: 0,
  y: 0,
  desiredX: 0,
  desiredY: 0,
  label: null,
  icon: null,
  width: 145,
  height: 90,
  fill: '#666666',
  fillSelected: "rgba(90, 180, 135, .75)",
  fontColor: '#ffffff',
  selected: false,
  subMenu: null,
  fontSize: 10,
  fontStyle: 'bold',
  fontFamily: 'Arial',

  drawIcon: function(){
    var x = this.x + this.iconOffsetX;
    var y = this.y + this.iconOffsetY;
    this.ctx.drawImage(this.icon, x, y);
  },

  drawLabel: function(){
    var x = this.x + this.labelOffsetX;
    var y = this.y + this.labelOffsetY;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.font = this.font;
    this.ctx.fillStyle = this.fontColor;
    this.ctx.fillText(this.label, x, y);
  },

  drawSelected: function(){
    this.ctx.fillStyle = this.fillSelected;
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
  },

  draw: function(){
    this.ctx.fillStyle = this.fill;
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
    if (this.drawIcon){
      this.drawIcon();
    }
    if (this.drawLabel){
      this.drawLabel();
    }
    if (this.selected){
      this.drawSelected();
    }
  }
}

var config = {
  baseImgDir: 'src/img/',
  images: {
    settings: 'settings.png',
    apps: 'apps.png',
    home: 'Home.png',
    live: 'Live_TV.png',
    rec: 'recorded.png',
    movies: 'movies.png',
    tv: 'on_demand.png',
    search: 'search.png',
    netflix: 'netflix.png',
    twitter: 'twitter.png',
    youtube: 'youtube.png',
    facebook: 'facebook.png'
  },
  entries: [
    ['SETTINGS', 'settings', []],
    ['APPS', 'apps', [
      ['', 'netflix'],
      ['', 'twitter'],
      ['', 'youtube'],
      ['', 'facebook']]],
    ['SEAN', 'home', [
      ['OPTIONS', ''],
      ['SOPHIE', ''],
      ['FAMILY', '']]],
    ['LIVE TV', 'live', [
      ['WHAT\'S ON', ''],
      ['GUIDE', '']]],
    ['RECORDINGS', 'rec', [
        ['SETUP', ''],
        ['RECENT', '']]],
    ['MOVIES', 'movies', [
        ['RESUME', ''],
        ['FAVORITES', ''],
        ['POPULAR', '']]],
    ['TV SHOWS', 'tv', [
        ['FAVORITES', ''],
        ['POPULAR', '']]],
    ['SEARCH', 'search', [
        ['CLEAR RECENT', ''],
        ['NETFLIX', ''],
        ['SUITS', ''],
        ['IRON MAN', '']]]
  ],
  items: {},
  init: function(){
    if (this.initialized){
      return null;
    }
    for (x in this.images){
      i = new Image();
      i.src = this.baseImgDir + this.images[x];
      this.images[x] = i;
    }
    this.initialized = true;
  }
}



function Menu(items){
  this.items = [];
  var x = this.x;
  var y = this.y;
  for (i in items){
    item = {
      x: x,
      y: y,
      icon: config.images[items[i][1]],
      label: items[i][0]
    }
    this.items.push(new MenuItem(item));
    x += this.padding + this.items[i].width;
  }
  this.items[this.selected].selected = true;
}

Menu.prototype = {
  constructor: Menu,
  padding: 5,
  x: 45,
  y: 540,
  show: function(){
    this.draw();
  },
  hide: function(){
    this.clear();
  },
  clear: function(){
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  push: function(index, dir){

  },
  draw: function(){
    this.clear();
    for (i in this.items){
      this.items[i].draw();
    }
  },
  show: true,
  selected: 3,
  sub_index: 0,

}

config.init();

function draw(){
  var canvas = document.getElementById('canvas');
  if(canvas.getContext){
    var context = canvas.getContext('2d');
    MenuItem.prototype.ctx = context;
    Menu.prototype.ctx = context;
    Menu.prototype.canvas = canvas;
    var main = new Menu(config.entries);
    main.draw();
  }
}
