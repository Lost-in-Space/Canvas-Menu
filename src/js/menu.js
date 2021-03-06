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

function lerp(v0, v1, t){
  return v0 + t * (v1 - v0);
}

// shared point of origin object...
var anchor = {
  x: 0,
  y: 0,
  getX: function(){
    return this.x;
  },
  getY: function(){
    return this.y;
  }
}

function MenuItem(obj){
  // only initialize once
  if (this.initialized){
    return null;
  }
  this.extend(obj);

  // configure icon if exists
  if (this.icon){
    this.icon = this.images[this.icon];
    this.iconOffsetX = (this.width - this.icon.width)/2;
    this.iconOffsetY = (this.height - this.icon.height)/2;
  } else {
    this.drawIcon = null;
  }

  // configure label if exists
  if(!this.label){
    this.drawLabel = null;
  } else {
    this.labelOffsetX = this.width/2;
    this.labelOffsetY = this.height/2;
    this.font = this.fontStyle +' '+this.fontSize+'pt '+this.fontFamily;
  }

  // shift icon up and label down if both exist
  if(this.icon && this.label){
    this.iconOffsetY -= this.fontSize/2 + this.padding;
    this.labelOffsetY += this.icon.height/2 + this.padding;
  }


  this.desiredX = this.x;
  this.restX = this.x;
  this.desiredY = this.y;
  this.restY = this.y;

  this.initialized = true;
}

// menu item can draw itself
MenuItem.prototype = {
  padding: 5,
  constructor: MenuItem,
  init_submenu: function(){
    // Configure Sub menu items, made assumptions based on short term goal
    if(this.subitems){
      this.subMenu = [];
      var item = null;
      if(this.subitems.cols === 1){
        // configure single column text only
        var height = this.fontSize*3;
        var y = 0;
        var down = this;
        for (i in this.subitems.items){
          y -= this.padding + height;
          item = this.subitems.items[i];
          item.height = height;
          item.y = y;
          item.anchor = this;
          item.index = this.index;
          item.down = down;
          item.left = this.left;
          item.right = this.right;
          item = new MenuItem(item);
          down.up = item;
          down = item;
          this.subMenu.push(item);
        }
      } else {
        // configure 2 column icon only
        var width = (this.width - this.padding)/2; // make selections square, half the width of parent - padding
        var x = 0;
        var y = 0;
        var down = [this, this];  // continuing contrived case of two columns
        var left = null;
        for (i in this.subitems.items){
          y -= width + this.padding;
          x = 0;
          left = null;
          for (j in this.subitems.items[i]){
            item = this.subitems.items[i][j];
            item.x = x;
            item.y = y;
            item.anchor = this;
            item.width = width;
            item.height = width;
            item.index = this.index;
            item.down = down[j];
            item.right = this.right;
            item.left = this.left;
            item = new MenuItem(item);
            down[j].up = item;
            down[j] = item;
            if(left){
              item.left = left;
              left.right = item;
            }
            left = item;
            this.subMenu.push(item);
            x += width + this.padding;
          }
        }

      }
    }
  },
  extend: extend,
  x: 0,         // offset of current position
  y: 0,
  restX: 0,     // offset when menu shown
  restY: 0,
  hiddenX: 0,   // offset when menu hidden
  hiddenY: 0,
  desiredX: 0,  // offset of desired position
  desiredY: 0,
  label: null,
  icon: null,
  width: 145,
  height: 90,
  fill: '#666666',
  fillSelected: "rgba(90, 180, 135, .75)",
  fontColor: '#ffffff',
  subMenu: null,
  fontSize: 10,
  fontStyle: 'bold',
  fontFamily: 'Arial',
  subitems: null,
  initialized: false,
  left: null,
  right: null,
  up: null,
  down: null,
  index: null,
  anchor: anchor,
  menuScale: 0,
  menuState: 0,
  menuAnimating: false,
  forceLeft: false,
  forceRight: false,
  getX: function(){
    return this.anchor.getX() + this.x;
  },
  getY: function(){
    return this.anchor.getY() + this.y;
  },
  animate: function(x, y, duration, callback){
    this.duration = duration;
    this.startX = this.x;
    this.desiredX = x;
    this.startY = this.y;
    this.desiredY = y;
    this.endTime = new Date().getTime() + this.duration;
    this.animationComplete = callback;
    this.animating = true;
    this.update();
  },
  show: function(duration, delay, callback){
    this.animate(this.restX, this.restY, duration, callback);
    if(this.right && !this.right.animating){
      var right = this.right;
      setTimeout(function(){
        right.show(duration, delay);
      }, delay);
    }
    if(this.left && !this.left.animating){
      var left = this.left;
      setTimeout(function(){
        left.show(duration, delay);
      }, delay);
    }
  },
  move: function(dx, duration){
    if (dx < 0){
      this.forceLeft = true;
    } else {
      this.forceRight = true;
    }
    var self = this;
    this.animate(this.x + dx, this.y, duration, function(){
      this.rest(duration*2);
    });
  },
  rest: function(duration){
    var self = this;
    if(this.x !== this.restX){
      this.animate(this.restX, this.restY, duration, function(){
        self.rest(duration);
      })
    }
    if (this.forceLeft && this.left){
      this.left.forceLeft = true;
      this.left.rest(duration);
    }
    if (this.forceRight && this.right){
      this.right.forceRight = true;
      this.right.rest(duration);
    }
    this.forceLeft = false;
    this.forceRight = false;
  },
  hide: function(duration){
    this.animate(this.hiddenX, this.hiddenY, duration);
  },
  checkCollision: function(){
    if (this.forceLeft){
      this.checkLeftCollision();
    } else if (this.forceRight) {
      this.checkRightCollision();
    }
  },
  checkRightCollision: function(){
    if(this.right){
      var rightEdge = this.x + this.width + this.padding;
      if (rightEdge > this.right.x){
        this.right.x = rightEdge;
        this.right.animating = false;
        this.right.checkRightCollision();
      }
    }
  },
  checkLeftCollision: function(){
    if(this.left){
      var leftRightEdge = this.x - this.left.width - this.padding;
      if (leftRightEdge < this.left.x){
        this.left.x = leftRightEdge;
        this.left.animating = false;
        this.left.checkLeftCollision();
      }
    }
  },
  update: function(){
    var time = new Date().getTime();
    if(time >= this.endTime){
      this.x = this.desiredX;
      this.y = this.desiredY;
      this.checkCollision();
      main.draw();
      this.animating = false;
      if (typeof this.animationComplete === 'function'){
        this.animationComplete();
      }
    } else if(this.animating){
      var t = 1 - (this.endTime - time) / this.duration;
      this.x = lerp(this.startX, this.desiredX, t);
      this.y = lerp(this.startY, this.desiredY, t);
      this.checkCollision();
      main.draw();
      var self = this;
      requestAnimationFrame(function(){
        self.update();
      });
    }
  },
  drawIcon: function(){
    var x = this.getX() + this.iconOffsetX;
    var y = this.getY() + this.iconOffsetY;
    this.ctx.drawImage(this.icon, x, y);
  },

  drawLabel: function(){
    var x = this.getX() + this.labelOffsetX;
    var y = this.getY() + this.labelOffsetY;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.font = this.font;
    this.ctx.fillStyle = this.fontColor;
    this.ctx.fillText(this.label, x, y);
  },

  drawSelected: function(){
    this.ctx.fillStyle = this.fillSelected;
    this.ctx.fillRect(this.getX(), this.getY(), this.width, this.height);
  },

  drawSubMenu: function(){
    if(this.subMenu){
      this.ctx.save();
      var shiftY = this.getY() - (this.getY()*this.menuScale);
      this.ctx.translate(0, shiftY);
      this.ctx.scale(1, this.menuScale);
      for (i in this.subMenu){
        this.subMenu[i].draw();
      }
      this.ctx.restore();
    }
  },

  draw: function(){
    this.ctx.fillStyle = this.fill;
    this.ctx.fillRect(this.getX(), this.getY(), this.width, this.height);
    if (this.drawIcon){
      this.drawIcon();
    }
    if (this.drawLabel){
      this.drawLabel();
    }

    if (this.menuScale !== 0){
      this.drawSubMenu();
    }
  },
  openSubMenu: function(duration, callback){
    if(this.subMenu){
      if (!this.menuAnimating){
        this.menuAnimating = true;
        var time = new Date().getTime() + duration;
        this.animateSubMenu(-1, 1, time, duration, callback);
      } else {
        var self = this;
        setTimeout(function(){
          self.openSubMenu(duration, callback);
        }, 100);
      }
    }
  },
  closeSubMenu: function(duration, callback){
    if (this.subMenu){
      if(!this.menuAnimating){
        this.menuAnimating = true;
        var time = new Date().getTime() + duration;
        this.animateSubMenu(1, 0, time, duration, callback);
      } else {
        var self = this;
        setTimeout(function(){
          self.closeSubMenu(duration, callback);
        }, 100);
      }
    }
  },
  animateSubMenu: function(dir, end, endTime, duration, callback){
    var time = new Date().getTime()
    if (time >= endTime){
      this.menuScale = end;
      this.menuAnimating = false;
      if(typeof callback === 'function'){
        callback();
      }
      main.draw();
    } else {
      this.menuScale = end + (dir * ((endTime - time)/duration));
      main.draw();
      var self = this;
      requestAnimationFrame(function(){
        self.animateSubMenu(dir, end, endTime, duration, callback);
      });
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
    {label: 'SETTINGS', icon: 'settings'},
    {label: 'APPS',
      icon: 'apps', subitems: {
      cols: 2,
      items: [
        [{icon: 'netflix'}, {icon: 'twitter'}],
        [{icon: 'youtube'}, {icon: 'facebook'}]
    ]}},
    {label: 'SEAN', icon: 'home', subitems: {
      cols: 1,
      items: [
        {label: 'FAMILY'},
        {label: 'SOPHIE'},
        {label: 'OPTIONS'}
      ]
    }},
    {label: 'LIVE TV', icon: 'live', subitems: {
      cols:1,
      items: [
        {label:'GUIDE'},
        {label:'WHAT\'S ON'}
      ]
    }},
    {label: 'RECORDINGS', icon: 'rec', subitems: {
      cols: 1,
      items: [
        {label: 'RECENT'},
        {label: 'SETUP'}
      ]
    }},
    {label: 'MOVIES', icon: 'movies', subitems: {
      cols: 1,
      items: [
        {label: 'POPULAR'},
        {label: 'FAVORITES'},
        {label: 'RESUME'}
      ]
    }},
    {label: 'TV SHOWS', icon: 'tv', subitems: {
      cols: 1,
      items: [
        {label: 'POPULAR'},
        {label: 'FAVORITES'}
      ]
    }},
    {label: 'SEARCH', icon: 'search', subitems: {
      cols: 1,
      items: [
        {label: 'IRON MAN'},
        {label: 'SUITS'},
        {label: 'NETFLIX'},
        {label: 'CLEAR RECENT'}
      ]
    }}
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
  this.anchor.x = 45;
  this.anchor.y = 540;
  var x = 0;
  var left = null;
  var item;
  for (var i = 0; i < items.length; i++){
    item = items[i];
    item.x = x;
    item.index = i;
    item = new MenuItem(item);
    if(left){
      item.left = left;
      left.right = item;
    }
    left = item;
    this.items.push(item);
    x += this.padding + this.items[i].width;
  }
  var hiddenOffsets = [  // contrived values
    [-500, 0],
    [-50, 500],
    [-50, 500],
    [0, 500],
    [0, 500],
    [50, 500],
    [50, 500],
    [500, 0]
  ]
  for (var i = 0; i < items.length; i++){
    item = this.items[i];
    item.init_submenu();
    item.hiddenX = hiddenOffsets[i][0] + item.restX;
    item.hiddenY = hiddenOffsets[i][1] + item.restY;
  }
  this.selected = this.items[this.start_index];
  this.selected.menuScale = 1;
  var self = this;
  document.body.addEventListener('keydown', function(e){
    self.dispatch(e);
  });
}

Menu.prototype = {
  constructor: Menu,
  padding: 5,
  anchor: anchor,
  show: function(){
    var first = this.items[this.selected.index];
    var myself = this;
    first.menuScale = 0;
    first.show(400, 100, function(){
      first.openSubMenu(100, function(){
        myself.visible = true;
        console.log(myself);
      });
    });
  },
  hide: function(){
    this.visible = false;
    for (var i = 0; i < this.items.length; i++){
      this.items[i].hide(400);
    }
  },
  clear: function(){
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  moveUD: function(d){
    var new_selection = null;
    if (d > 0){
      new_selection = this.selected.up;
    } else {
      new_selection = this.selected.down;
    }
    this.selected = new_selection || this.selected;
    this.draw();
  },
  moveRL: function(d){
    var new_selection = null;
    if (d < 0){
      new_selection = this.selected.right;
    } else {
      new_selection = this.selected.left;
    }
    if(new_selection && new_selection.index !== this.selected.index){
      this.anchor.x += (d*10);
      this.items[new_selection.index].openSubMenu(100);
      this.items[this.selected.index].closeSubMenu(100);
      this.items[this.selected.index].move(d*100, 500);
    }
    this.selected = new_selection || this.selected;
    this.draw();
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
          this.moveRL(1);
          break;
        case 38:  // Up
          this.moveUD(1);
          break;
        case 39:  // Right
          this.moveRL(-1);
          break;
        case 40:  // Down
          this.moveUD(-1);
          break;
      }
    }
  },
  selected: null,
  draw: function(){
    this.clear();
    for (i in this.items){
      this.items[i].draw();
    }
    if (this.visible){
      this.selected.drawSelected();
    }
  },
  visible: true,
  start_index: 3,

}

var main;
config.init();
MenuItem.prototype.images = config.images;

function draw(){
  var canvas = document.getElementById('canvas');
  if(canvas.getContext){
    var context = canvas.getContext('2d');
    MenuItem.prototype.ctx = context;
    MenuItem.prototype.canvas = canvas;
    Menu.prototype.ctx = context;
    Menu.prototype.canvas = canvas;
    main = new Menu(config.entries);
    main.draw();
  }
}
