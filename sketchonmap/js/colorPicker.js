//preview at  http://www.stefanobovio.com/archive/sketchonmap/ 
"use strict";

var colorPicker = function(id, position, colors){
	
	this.base = document.getElementById(id);
	this.base.style.position = position;
	this.base.style.backgroundColor = "#525252";
	this.shadow_color = "#CCCCCC";
	this.rubber_color = "#FFFFFF";
	this.colors = [];
	this.margin = 10;
	
	this.set = function(){
		
		var c;
		var s;
		
		for(var i = 0; i < colors.length; i++){
			
			c = document.createElement("div");
			c.style.position = "absolute";
			c.style.backgroundColor = colors[i];
			c.style.zIndex = 1;
			c._color = colors[i];
			c._color_picker = this;
			this.base.appendChild(c);
			
			s = document.createElement("div");
			s.style.position = "absolute";
			s.style.backgroundColor = this.shadow_color;
			s.style.zIndex = 0;
			s._color = colors[i];
			s._pressed = false;
			this.base.appendChild(s);
			
			this.colors.push({c:c,s:s});
		}
		
		c = null;
		s = null;
		
		/*this.rubber = document.createElement("div");
		this.rubber.style.position = "absolute";
		this.rubber.style.backgroundColor = this.rubber_color;
		this.rubber.style.zIndex = 1; 
		this.rubber._color_picker = this;
		this.base.appendChild(this.rubber);
		
		this.rubber_shadow = document.createElement("div");
		this.rubber_shadow.style.position = "absolute";
		this.rubber_shadow.style.backgroundColor = this.shadow_color;
		this.rubber_shadow.style.zIndex = 0; 
		this.rubber_shadow._pressed = false;
		this.base.appendChild(this.rubber_shadow);*/
		
	}
	
	this.changeColorEvent = function(doHere){
		
		this.colors[0].c._pressed = true;
		doHere(this.colors[0].c._color,false);
		
		for(var i = 0; i < this.colors.length; i++){
			
			this.colors[i].c.onmouseover = function(){ this.style.opacity = 0.5; };
			this.colors[i].c.onmouseout = function(){ this.style.opacity = 1.0; };
			this.colors[i].c.onclick = function(){
				
				doHere(this._color,false);
				this.style.opacity = 1.0;
				this._color_picker.isPressed(this);
			}
		}
		
		/*this.rubber.onmouseover = function(){ this.style.opacity = 0.5; };
		this.rubber.onmouseout = function(){ this.style.opacity = 1.0; };
		this.rubber.onclick = function(){
			this.style.opacity = 1.0;
			doHere(null,true);
			this._color_picker.isPressed(this);
		}*/
		
	}
	
	this.isPressed = function(element){
		
		for(var i = 0; i < this.colors.length; i++){
			
			if(this.colors[i].c == element){
				this.colors[i].c._pressed = true;
			}else{
				this.colors[i].c._pressed = false;
			}
		}
		
		/*if(this.rubber == element){
			this.rubber._pressed = true;
		}else{
			this.rubber._pressed = false;
		}*/
		
		this.resize(this._x, this._y, this._w, this._h, this._h_v);
	}
	
	this.resize = function(x, y, width, height, h_or_v){
		
		this._x = x;
		this._y = y;
		this._w = width;
		this._h = height;
		this._h_v = h_or_v;
		
		this.base.style.left = x + "px";
		this.base.style.top = y + "px";
		this.base.style.width = width + "px";
		this.base.style.height = height + "px";
		this.margin = 10;
		
		var button_side = 0;
		var min_size = 0;
		var left = "left";
		var top = "top";
		var bar_side = 0;
		var bar_width = 0;
		
		if(h_or_v == "v"){
			button_side = width-this.margin*2;
			left = "left";
			top = "top";
			bar_side = height;
			bar_width = width;
		}else if(h_or_v == "h"){
			button_side = height-this.margin*2;
			left = "top";
			top = "left";
			bar_side = width;
			bar_width = height;
		}
		
		min_size = (this.colors.length + 1) * button_side + (this.colors.length + 2) * this.margin * 1.5;
	
		if( min_size > bar_side){
			this.margin = 7;
			button_side = (bar_side- (this.colors.length + 2) * this.margin * 1.5) / (this.colors.length+1);
		}
		
		for(var i = 0; i < this.colors.length; i++){
			if(this.colors[i].c._pressed){
				
				this.colors[i].c.style[left] = (bar_width-button_side)/2+2 + "px";
				this.colors[i].c.style[top] = this.margin * 1.5+2 + i * (button_side+this.margin) + "px";
				this.colors[i].c.style.width = button_side-4 + "px";
				this.colors[i].c.style.height = button_side-4 + "px";
				this.colors[i].c.style.borderRadius = button_side/2-2 + "px";
				
			}else{
				
				this.colors[i].c.style[left] = (bar_width-button_side)/2 + "px";
				this.colors[i].c.style[top] = this.margin + i * (button_side+this.margin) + "px";
				this.colors[i].c.style.width = button_side + "px";
				this.colors[i].c.style.height = button_side + "px";
				this.colors[i].c.style.borderRadius = button_side/2 + "px";
				
			}
			
			this.colors[i].s.style[left] = (bar_width-button_side)/2 + "px";
			this.colors[i].s.style[top] = this.margin * 1.5 + i * (button_side + this.margin) + "px";
			this.colors[i].s.style.width = button_side + "px";
			this.colors[i].s.style.height = button_side + "px";
			this.colors[i].s.style.borderRadius = button_side/2 + "px";
		}
		
		/*if(this.rubber._pressed){
			this.rubber.style[left] = (bar_width-button_side)/2+2  + "px";
			this.rubber.style[top] = bar_side - this.margin*1.5+2 - button_side + "px";
			this.rubber.style.width = button_side-4 + "px";
			this.rubber.style.height = button_side-4 + "px";
			
		}else{
			
			this.rubber.style[left] = (bar_width-button_side)/2 + "px";
			this.rubber.style[top] = bar_side - this.margin - button_side + "px";
			this.rubber.style.width =  button_side + "px";
			this.rubber.style.height =  button_side + "px";
		}
		
		this.rubber_shadow.style[left] = (bar_width-button_side)/2  + "px";
		this.rubber_shadow.style[top] = bar_side - this.margin*1.5 - button_side + "px";
		this.rubber_shadow.style.width = button_side + "px";
		this.rubber_shadow.style.height = button_side + "px";*/
	}
	
	this.set();
}