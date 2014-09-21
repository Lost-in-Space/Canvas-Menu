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
  this.items[this.index].selected = true;
  var self = this;
  document.body.addEventListener('keydown', function(e){
    self.dispatch(e);
  });
}

Menu.prototype = {
  constructor: Menu,
  padding: 5,
  x: 45,
  y: 540,
  show: function(){
    this.visible = true;
    this.draw();
  },
  hide: function(){
    this.visible = false;
    this.clear();
  },
  clear: function(){
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  moveUD: function(d){
    console.log('Up down');
  },
  moveRL: function(d){
    var new_index = this.index + d;
    if (-1 < new_index  && new_index < this.items.length){
      this.set_selected(new_index);
      this.draw();
    }
  },
  push: function(index, dir){

  },
  dispatch: function(e){
    if(e.keyCode === 77){  // M
      if (this.visible){
        this.hide();
      } else {
        this.show();
      }
    } else if (this.visible){
      switch(e.keyCode){
        case 37:  // Left
          this.moveRL(-1);
          break;
        case 38:  // Up
          this.moveUD(1);
          break;
        case 39:  // Right
          this.moveRL(1);
          break;
        case 40:  // Down
          this.moveUD(-1);
          break;
      }
    }
  },
  set_selected: function(index){
    this.get_selected().selected = false;
    this.index = index;
    this.get_selected().selected = true;
  },
  get_selected: function(){
    return this.items[this.index];
  },
  draw: function(){
    this.clear();
    for (i in this.items){
      this.items[i].draw();
    }
  },
  visible: true,
  index: 3,
  sub_index: -1,

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
