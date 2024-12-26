var c = document.getElementById("canvas");
console.log(c)
var ctx = c.getContext("2d");

function resize() {
    var box = c.getBoundingClientRect();
    c.width = box.width;
    c.height = box.height;
}

var colors = ["#ffffff", "#e6616b", "#5cd3ad"];


function Box() {
    this.half_size = Math.floor((Math.random() * 40) + 10);
    this.x = Math.floor((Math.random() * c.width) + 1);
    this.y = Math.floor((Math.random() * c.height) + 1);
    this.r = Math.random() * Math.PI;
    this.color = colors[Math.floor((Math.random() * colors.length))];
    this.speed = (60 - this.half_size) / 20;
  
    this.getDots = function() {

        var full = (Math.PI * 2) / 4;

        var p1 = {
            x: this.x + this.half_size * Math.sin(this.r),
            y: this.y + this.half_size * Math.cos(this.r)
        };
        var p2 = {
            x: this.x + this.half_size * Math.sin(this.r + full),
            y: this.y + this.half_size * Math.cos(this.r + full)
        };
        var p3 = {
            x: this.x + this.half_size * Math.sin(this.r + full * 2),
            y: this.y + this.half_size * Math.cos(this.r + full * 2)
        };
        var p4 = {
            x: this.x + this.half_size * Math.sin(this.r + full * 3),
            y: this.y + this.half_size * Math.cos(this.r + full * 3)
        };

        return {
            p1: p1,
            p2: p2,
            p3: p3,
            p4: p4
        };
    }
    this.rotate = function() {
        this.r += this.speed * 0.002;
        this.x += this.speed;
        this.y += this.speed;
    }
    this.draw = function() {
        var dots = this.getDots();
        ctx.beginPath();
        ctx.moveTo(dots.p1.x, dots.p1.y);
        ctx.lineTo(dots.p2.x, dots.p2.y);
        ctx.lineTo(dots.p3.x, dots.p3.y);
        ctx.lineTo(dots.p4.x, dots.p4.y);
        ctx.fillStyle = this.color;
        ctx.fill();


        if (this.y - this.half_size > c.height) {
            this.y -= c.height + 100;
        }
        if (this.x - this.half_size > c.width) {
            this.x -= c.width + 100;
        }
    }

}

var boxes = [];

function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    

    for (var i = 0; i < boxes.length; i++) {
        boxes[i].rotate();
    };
    for (var i = 0; i < boxes.length; i++) {
        collisionDetection(i)
        boxes[i].draw();
    };
    requestAnimationFrame(draw);
}

resize();
draw();

while (boxes.length < 16) {
    boxes.push(new Box());
}

window.onresize = resize;

c.onmousemove = function(e){  
    for(box of boxes){  
        let distance = Math.hypot(Math.abs(e.screenX - box.x), Math.abs(e.screenY - box.y))     
        if(distance < 80){  
            box.speed = Math.max((box.speed - 0.05), (60 - box.half_size)/ 40)
            //box.speed = box.speed/2
        }else{
            box.speed = Math.min((box.speed +0.03), (60 - box.half_size) / 20);  
        }
    }
}


function collisionDetection(b){
	for (var i = boxes.length - 1; i >= 0; i--) {
		if(i != b){	
			var dx = (boxes[b].x + boxes[b].half_size) - (boxes[i].x + boxes[i].half_size);
			var dy = (boxes[b].y + boxes[b].half_size) - (boxes[i].y + boxes[i].half_size);
			var d = Math.sqrt(dx * dx + dy * dy);
			if (d < boxes[b].half_size + boxes[i].half_size) {
			    boxes[b].half_size = boxes[b].half_size > 1 ? boxes[b].half_size-=1 : 1;
			    boxes[i].half_size = boxes[i].half_size > 1 ? boxes[i].half_size-=1 : 1;
                speed = (60 - this.half_size) / 20;
			}
		}
	}
}