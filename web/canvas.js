var c = document.getElementById("canvas");
var ctx = c.getContext("2d");

function resize() {
    var box = c.getBoundingClientRect();
    c.width = box.width;
    c.height = box.height;
}

var colors = ["#ffffff", "#e6616b", "#5cd3ad"];

CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    this.moveTo(x + radius, y);
    this.arcTo(x + width, y, x + width, y + height, radius);
    this.arcTo(x + width, y + height, x, y + height, radius);
    this.arcTo(x, y + height, x, y, radius);
    this.arcTo(x, y, x + width, y, radius);
    this.closePath();
    return this;
  }

  function drawRotatedRect(x,y,width,height,degrees, color){

    // first save the untranslated/unrotated context
    ctx.save();

    ctx.beginPath();
    // move the rotation point to the center of the rect
    ctx.translate( x+width/2, y+height/2 );
    // rotate the rect
    ctx.rotate(degrees*Math.PI/180);

    // draw the rect on the transformed context
    // Note: after transforming [0,0] is visually [x,y]
    //       so the rect needs to be offset accordingly when drawn
    ctx.roundRect( -width/2, -height/2, width,height, 10);

    ctx.fillStyle=color;
    ctx.fill();

    // restore the context to its untranslated/unrotated state
    ctx.restore();

}

function drawRotatedText(text, x, y, width, height, degrees){
    ctx.save();
    ctx.translate( x+width/2, y+height/2 );
    ctx.rotate(degrees*Math.PI/180);
    ctx.fillStyle = "#482307"
    ctx.fillText(text, 0, 0);
    ctx.restore();
}

function Card() {

    this.width = 160;
    this.height = 100;
    this.x =  -(Math.random() * 2000) - 200;
    this.y = 200 + Math.floor(Math.random() * (c.height-200));
    this.r = Math.random() * Math.PI;
    this.color ="#aba192"
    this.speed = 0.5;
    this.angle = 0;
    ctx.font="20px Georgia";
    ctx.textAlign="center"; 
    ctx.textBaseline = "middle";
    this.text = "Testing"
    this.grd = ctx.createLinearGradient(0, 0, this.width, this.height);
    this.grd.addColorStop(0, "#f6e8d6");
    this.grd.addColorStop(1, "#aba192");
    
    

  
    this.rotate = function() {
        this.angle += 0.2
        this.x += this.speed;
      
    }
    this.draw = function() {
        drawRotatedRect(this.x, this.y, this.width, this.height, this.angle, this.grd)
        drawRotatedText(this.text, this.x, this.y, this.width, this.height, this.angle)
    
        


        if (this.x - this.height > c.width) {
            this.x -= c.width + 300;
        }
    }

}

var cards = [];

function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    

    for (var i = 0; i < cards.length; i++) {
        cards[i].rotate();
        cards[i].draw();
    };
    requestAnimationFrame(draw);
}

resize();
draw();

while (cards.length < 5) {
    cards.push(new Card());
}

window.onresize = resize;
