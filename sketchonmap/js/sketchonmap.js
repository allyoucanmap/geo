//preview at  http://www.stefanobovio.com/archive/sketchonmap/ 
"use strict";

var sketchonmap = function(id, attributes){
	
	this.base = document.getElementById(id);
	this.base.style.position = "relative";
	this.base.style.overflow = "hidden";
	this.base.style.backgroundColor = "#333333";
	this.base.setAttribute("oncontextmenu","return false");
	this.base._somap = this;
	
	this.color = "#333333";
	this.rubber = false;
	this.radius = 4;
	this.earth_circ = 2 * Math.PI * sketchonmap.earth_rad;
	this.center = {lat:0.0, lon:0.0};
	this.center_mercator = wgs84_to_mercator(this.center);
	this.center_tile = { x:0, y: 0};
	this.frame = { sw:{lat:0.0, lon:0.0}, ne:{lat:0.0, lon:0.0} };
	this.frame_mercator = { sw:{x:0.0, y:0.0}, ne:{x:0.0, y:0.0} };
	this.frame_tile = { sw:{x:0, y:0}, ne:{x:0, y:0} };
	this.pixel_unit = 0;
	this.zoom = 2;
	this.zoom_range = {min:0,max:18};
	this.tile_array = {};
	this.tile_canvas = {};
	
	this.cursor_position = {x:0,y:0};
	this.cursor_mercator = {x:0,y:0};
	this.cursor_wgs84 = {lat:0.0,lon:0.0};
	
	this.credits = "";
	
	if(attributes != null){
		if(attributes.tile_src != null){ this.tile_src = attributes.tile_src};
		if(attributes.zoom_range != null){this.zoom_range = attributes.zoom_range};
		if(attributes.zoom != null){this.zoom = attributes.zoom};
		if(attributes.credits != null){this.credits = attributes.credits};
	}
	
	this.sign = document.createElement("div");
	this.sign.style.position= "absolute";
	this.sign.style.backgroundColor = "#FFFFFF";
	this.sign.style.color = "#333333";
	this.sign.style.fontSize = 11 + "px";
	this.sign.style.textAlign = "center";
	this.sign.style.zIndex = 3;
	this.sign.innerHTML = '<a class="credits" target="_blank" style="color :#a234db;text-decoration : none;" href="http://www.stefanobovio.com/"> | stefanobovio.com | </a>'+this.credits;
	this.base.appendChild(this.sign);
	
	if(this.zoom_range.max > 18){
		this.zoom_range.max = 18;
	}

	if(this.zoom_range.min < 0){
		this.zoom_range.min = 0;
	}
	
	if(this.zoom > this.zoom_range.max){
		this.zoom = this.zoom_range.max;
	}
	
	if(this.zoom < this.zoom_range.min){
		this.zoom = this.zoom_range.min;
	}
	
	if(this.zoom_range.min > this.zoom_range.max){
		this.zoom = 2;
		this.zoom_range = {min:0,max:18};
	}
	
	for(var i = this.zoom_range.min; i <= this.zoom_range.max; i++){
		this.tile_canvas[i] = {};
	}
	
	this.resize = function(width,height){
		
		this.base.setAttribute("width", width);
		this.base.setAttribute("height", height);
		this.base.style.width = this.base.getAttribute("width") + "px";
		this.base.style.height = this.base.getAttribute("height") + "px";
		this.width = parseInt(this.base.getAttribute("width"));
		this.height = parseInt(this.base.getAttribute("height"));
		
		if(this.coordinates_box != null){
			
			this.coordinates_box.style.left =  2 + "px";
			this.coordinates_box.style.top = this.height - 12 - 2 + "px";
			this.coordinates_box.style.width = 170 + "px";
		}
		
		this.sign.style.left =  2 + "px";
		this.sign.style.top = 2 + "px";
	}
	
	this.setPenColor = function(color){
		this.color = color;
	}
	
	this.setRubber = function(rubber){
		this.rubber = rubber;
	}
	
	this.addCoordinatesBox = function(){
		
		this.coordinates_box = document.createElement("div");
		this.coordinates_box.style.position = "absolute";
		this.coordinates_box.style.backgroundColor = "#FFFFFF";
		this.coordinates_box.style.fontSize = 11 + "px";
		this.coordinates_box.style.textAlign = "center";
		this.coordinates_box.style.zIndex = 3;
		this.coordinates_box.innerHTML = "lon: " + this.cursor_wgs84.lon.toFixed(6) + " lat: " + this.cursor_wgs84.lat.toFixed(6);
		this.base.appendChild(this.coordinates_box);
		this.resize(this.base.getAttribute("width"),this.base.getAttribute("height"));
	}
	
	this.update_frame = function(){
	
		this.center = mercator_to_wgs84(this.center_mercator);
		this.center_tile = wgs84_to_tile(this.center, this.zoom);
		this.pixel_unit = this.earth_circ / Math.pow(2,(this.zoom + 8));
		this.frame_mercator = { 
		sw:{
			x:this.center_mercator.x - this.width/2 * this.pixel_unit, 
			y:this.center_mercator.y - this.height/2 * this.pixel_unit}, 
		ne:{
			x:this.center_mercator.x + this.width/2 * this.pixel_unit, 
			y:this.center_mercator.y + this.height/2 * this.pixel_unit} 
		};
		
		this.frame = { 
		sw: mercator_to_wgs84(this.frame_mercator.sw), 
		ne: mercator_to_wgs84(this.frame_mercator.ne)
		};
		
		this.frame_tile = { 
		sw: wgs84_to_tile(this.frame.sw, this.zoom), 
		ne: wgs84_to_tile(this.frame.ne, this.zoom)
		};
	}
	
	this.draw = function(paint){
		
		if(paint == null){paint = false}
		
		var current_max_frame = max_frame(this.zoom);
		
		for(var y = this.frame_tile.ne.y; y < this.frame_tile.sw.y+1; y++){
			for(var x = this.frame_tile.sw.x; x < this.frame_tile.ne.x+1; x++){
				if(this.tile_array[x+"_"+y+"_"+this.zoom] == null){
					if(x >= current_max_frame.sw.x
					&& x <= current_max_frame.ne.x
					&& y >= current_max_frame.ne.y
					&& y <= current_max_frame.sw.y){
						this.tile_array[x+"_"+y+"_"+this.zoom] = (new this.tile(x,y,this.zoom,this));
					}
					
				}
			}
		}
		
		for(var t in this.tile_array){
			this.tile_array[t].update();
			if(paint){
				this.tile_array[t].copy_sketch();
			}
			
		}
	}
	
	this.tile = function(x,y,z,parent,img_src){
		
		this.base = document.createElement("div");
		this.base.setAttribute("id","tile_"+x+"_"+y+"_"+z);
		this.base.setAttribute("class","noselect");
		this.base.style.zIndex = 0;
		this.base.style.position = "absolute";
		this.base.style.backgroundColor = "#CCCCCC";
		this.base.style.width = sketchonmap.side + "px";
		this.base.style.height = sketchonmap.side + "px";
		this.bounding_box = {
			nw:tile_to_wgs84({x:x,y:y}, z),
			se:tile_to_wgs84({x:x+1,y:y+1}, z)
		}
		
		this.canvas = document.createElement("canvas"); 
		this.canvas.style.zIndex = 0;
		this.canvas._bounding_box = this.bounding_box;
		this.canvas.setAttribute("width",sketchonmap.side);
		this.canvas.setAttribute("height",sketchonmap.side);
		
		this.canvas.onmousemove = function(event){ 
			if(event.buttons == 1){
				
				if(!parent.rubber){
					
					var ctx = this.getContext("2d");
					var cx = event.pageX-this.getBoundingClientRect().left;
					var cy = event.pageY-this.getBoundingClientRect().top;
				
					ctx.beginPath();
					ctx.arc(cx, cy, parent.radius, 0, 2 * Math.PI, false);
					ctx.fillStyle = parent.color;
					ctx.fill();
					ctx.closePath();
				}
		
				parent.tile_canvas[z][x+"_"+y] = this;
			}
		};
		
		this.base.appendChild(this.canvas);
		
		this.coordinates = tile_to_wgs84({x:x,y:y}, z);
		this.coordinates_mercator = wgs84_to_mercator(this.coordinates);
		this.position = {x:0, y:0};
		
		this.parent = parent;
		if(this.parent.tile_src != null){this.base.style.backgroundImage = "url(" + make_tile_src(this.parent.tile_src,x,y,z) + ")"}
		
		this.visible = true;
		this.visible_status = "hide";
		
		this.update = function(){
			
			if(this.coordinates_mercator.x > this.parent.frame_mercator.sw.x - this.parent.pixel_unit * sketchonmap.side
			&& this.coordinates_mercator.x < this.parent.frame_mercator.ne.x
			&& this.coordinates_mercator.y > this.parent.frame_mercator.sw.y 
			&& this.coordinates_mercator.y < this.parent.frame_mercator.ne.y + this.parent.pixel_unit * sketchonmap.side
			&& z == this.parent.zoom){
				
				this.visible = true;
				
				this.position = {
					x:map(this.coordinates_mercator.x, this.parent.frame_mercator.sw.x, this.parent.frame_mercator.ne.x,0,this.parent.width),
					y:map(this.coordinates_mercator.y, this.parent.frame_mercator.ne.y, this.parent.frame_mercator.sw.y,0,this.parent.height)
				};
				
				this.base.style.left = this.position.x + "px";
				this.base.style.top = this.position.y + "px";
				
			}else{
				
				this.visible = false;
				
			}
			
			this.append();
		}
		
		this.copy_sketch = function(){
			if(this.visible){
				for(var zoom in this.parent.tile_canvas){
					if(zoom != z){
						for(var xy in this.parent.tile_canvas[zoom]){
						
							if(z > zoom){
								
								if(isInside(this.parent.tile_canvas[zoom][xy]._bounding_box, this.bounding_box)){
									
									copyCanvas(this.parent.tile_canvas[zoom][xy], this.canvas.getContext("2d"), x,y,z,zoom,true);
								}
								
							}else{
								if(isInside( this.bounding_box,this.parent.tile_canvas[zoom][xy]._bounding_box)){
									
									copyCanvas(this.parent.tile_canvas[zoom][xy], this.canvas.getContext("2d"), parseInt(xy.split("_")[0]),parseInt(xy.split("_")[1]),z,zoom,false);
								}
							}
						}
					}
				}
			}
		}
		
		function copyCanvas(canvas, context, x,y,z,zoom,dir){
			
			canvas._img = new Image();
			canvas._img._context = context;
			canvas._img._x = x;
			canvas._img._y = y;
			canvas._img._z = z;
			canvas._img._zoom = zoom;
			
			canvas._img.onload = function(){
				if(dir){
					var factor = Math.pow(2,(this._z-this._zoom));
					this._context.drawImage(
						this,
						sketchonmap.side * - (this._x%factor), 
						sketchonmap.side * - (this._y%factor), 
						sketchonmap.side * factor, 
						sketchonmap.side * factor
					);
				}else{
					var factor = Math.pow(2,( this._zoom - this._z ));
					this._context.drawImage(
						this,
						(sketchonmap.side/factor) * (this._x%factor), 
						(sketchonmap.side/factor) * (this._y%factor), 
						sketchonmap.side/factor, 
						sketchonmap.side/factor
					);
					
				}
				
			}

			canvas._img.src = canvas.toDataURL();
		}
		
		function isInside(tileA,tileB){
			
			if(tileB.nw.lon >= tileA.nw.lon
			&& tileB.nw.lat <= tileA.nw.lat
			&& tileB.se.lon <= tileA.se.lon
			&& tileB.se.lat >= tileA.se.lat){
				
				return true;
				
			}
			
			return false;
		}
		
		this.append = function(){
			if(this.visible){
				if(this.visible_status == "hide"){
					this.parent.base.appendChild(this.base);
					this.visible_status = "visible";
				}
				
			}else{
				if(this.visible_status == "visible"){
					this.parent.base.removeChild(this.base);
					this.visible_status = "hide";
				}
			}
		}
	}
	
	function preventDefault(event){if(event.preventDefault()){ event.preventDefault(); event.returnValue = false;} }
	
	this.base.addEventListener('mousedown', drag_start, false);
	this.base.addEventListener('mousemove', drag_move, false);
	this.base.addEventListener('mousemove', get_cursor_position, false);
	this.base.addEventListener('mouseup', drag_end, false);
	this.base.addEventListener('mousewheel', zoom_in_out);
	this.base.addEventListener('DOMMouseScroll', zoom_in_out,false);
	this.base.addEventListener('click', function(event){
		var check = false;
		for(var d in document.getElementsByClassName("credits")){
			if(document.getElementsByClassName("credits")[d] == event.target){
				check = true;
				break;
			}
		}
		if(!check){
			preventDefault(event);
		} 
		},false);
	
	function get_cursor_position(event){
		
		if(event.buttons < 2){
			
			this._somap.cursor_position.x = event.pageX - this.getBoundingClientRect().left;
			this._somap.cursor_position.y = event.pageY - this.getBoundingClientRect().top;
			
			this._somap.cursor_mercator.x = map(this._somap.cursor_position.x,0,this._somap.width,this._somap.frame_mercator.sw.x,this._somap.frame_mercator.ne.x);
			this._somap.cursor_mercator.y = map(this._somap.cursor_position.y,0,this._somap.height,this._somap.frame_mercator.ne.y,this._somap.frame_mercator.sw.y);
			
			this._somap.cursor_wgs84 = mercator_to_wgs84(this._somap.cursor_mercator);
			
			if(this._somap.coordinates_box != null){ this._somap.coordinates_box.innerHTML = "lon: " + this._somap.cursor_wgs84.lon.toFixed(6) + " lat: " + this._somap.cursor_wgs84.lat.toFixed(6); }
		}
	
	}
	
	function drag_start(event){ 
	
		preventDefault(event); 
		if(event.buttons > 1){
			this._somap.pan_position = {x: event.pageX, y: event.pageY}; 
			this._somap.pan_start = true;
		}
		
	}
	
	function drag_move(event){
		preventDefault(event);
		if (this._somap.pan_start && event.buttons > 1){
			var delta = {x: (event.pageX - this._somap.pan_position.x),y: (event.pageY - this._somap.pan_position.y)};
			this._somap.center_mercator = {x:this._somap.center_mercator.x - delta.x * this._somap.pixel_unit, y: this._somap.center_mercator.y + delta.y * this._somap.pixel_unit};
			
			this._somap.control_center_limit();
			this._somap.update_frame();
			this._somap.draw();
			this._somap.pan_position = {x: event.pageX, y: event.pageY};
		}
	}
	
	this.control_center_limit = function(){
		
		var ne_limit = wgs84_to_mercator({lon:180,lat:85.0511});
		var sw_limit = wgs84_to_mercator({lon:-180,lat:-85.0511});
			
		if(this.width * this.pixel_unit > ne_limit.x-sw_limit.x
		&& this.height * this.pixel_unit > ne_limit.y-sw_limit.y){
			
			this.center_mercator = {x:0,y:0};
			
		}else if(this.height * this.pixel_unit > ne_limit.y-sw_limit.y){
			this.center_mercator.y = 0;
			
			if( (this.center_mercator.x + this.width/2 * this.pixel_unit) > ne_limit.x ){
				this.center_mercator.x = ne_limit.x - this.width/2 * this.pixel_unit;
			}
			if( (this.center_mercator.x - this.width/2 * this.pixel_unit) < sw_limit.x ){
				this.center_mercator.x = sw_limit.x + this.width/2 * this.pixel_unit;
			}
		}else if(this.width * this.pixel_unit > ne_limit.x-sw_limit.x){
			
			this.center_mercator.x = 0;
			if( (this.center_mercator.y + this.height/2 * this.pixel_unit) > ne_limit.y ){
				this.center_mercator.y = ne_limit.x - this.height/2 * this.pixel_unit;
			}
			if( (this.center_mercator.y - this.height/2 * this.pixel_unit) < sw_limit.y ){
				this.center_mercator.y = sw_limit.x + this.height/2 * this.pixel_unit;
			}
		}else{
		
			if( (this.center_mercator.x + this.width/2 * this.pixel_unit) > ne_limit.x ){
				this.center_mercator.x = ne_limit.x - this.width/2 * this.pixel_unit;
			}
			if( (this.center_mercator.y + this.height/2 * this.pixel_unit) > ne_limit.y ){
				this.center_mercator.y = ne_limit.x - this.height/2 * this.pixel_unit;
			}
			if( (this.center_mercator.x - this.width/2 * this.pixel_unit) < sw_limit.x ){
				this.center_mercator.x = sw_limit.x + this.width/2 * this.pixel_unit;
			}
			if( (this.center_mercator.y - this.height/2 * this.pixel_unit) < sw_limit.y ){
				this.center_mercator.y = sw_limit.x + this.height/2 * this.pixel_unit;
			}
		}
	}
	
	function drag_end(event){ preventDefault(event); event.returnValue = false; this._somap.pan_start = false; this._somap.draw(true);}
	function zoom_in_out(event){
		preventDefault(event);
		var delta = event.detail < 0 || event.wheelDelta > 0 ? 1 : -1;
		
		var stop_zoom = false;
		
		if(delta < 0){
			this._somap.zoom--;
		}else if(delta > 0){
			this._somap.zoom++;
		}
		if(this._somap.zoom < this._somap.zoom_range.min){
			this._somap.zoom = this._somap.zoom_range.min;
			stop_zoom = true;
		}
		if(this._somap.zoom > this._somap.zoom_range.max){
			this._somap.zoom = this._somap.zoom_range.max;
			stop_zoom = true;
		}
		
		if(!stop_zoom){
			this._somap.pixel_unit = this._somap.earth_circ / Math.pow(2,(this._somap.zoom + 8));
			this._somap.center_mercator.x = this._somap.cursor_mercator.x + (((this._somap.width * this._somap.pixel_unit)/2) - (this._somap.cursor_position.x* this._somap.pixel_unit));
			this._somap.center_mercator.y = this._somap.cursor_mercator.y - (((this._somap.height * this._somap.pixel_unit)/2) - (this._somap.cursor_position.y* this._somap.pixel_unit)); 		
			this._somap.control_center_limit();
			this._somap.update_frame();
			this._somap.draw(true);
		}
	}
	
	this.repaint = function(width, height){
		this.resize(width, height);
		this.update_frame();
		this.draw();
	}
	
	this.repaint(this.base.getAttribute("width"),this.base.getAttribute("height"));

	function make_tile_src(src,x,y,z) { var str = src.replace(/\[x\]/, x); str = str.replace(/\[y\]/, y); str = str.replace(/\[z\]/, z); return str;}
	function tile_to_wgs84(coord, z){ return { lat: ((Math.atan(sinh(Math.PI* (1 - 2 * coord.y / Math.pow( 2 , z))))) * 180.0 / Math.PI),lon: (coord.x / Math.pow( 2 , z) * 360.0 - 180.0) };}
	function wgs84_to_tile (coord,z){ return { x: (Math.floor((coord.lon+180)/360*Math.pow(2,z))), y:(Math.floor((1-Math.log(Math.tan(coord.lat*Math.PI/180) + 1/Math.cos(coord.lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,z)))};}
	function mercator_to_wgs84(coord){ return{ lat: rad_to_deg(2.0 * Math.atan(Math.exp(coord.y / sketchonmap.earth_rad)) - Math.PI/2), lon: rad_to_deg(coord.x / sketchonmap.earth_rad)}}
	function wgs84_to_mercator(coord){ return{x: deg_to_rad(coord.lon) * sketchonmap.earth_rad, y: (Math.log(Math.tan(Math.PI/4 + deg_to_rad(coord.lat) / 2.0)) *  sketchonmap.earth_rad)};}
	function sinh(arg){return (Math.exp(arg) - Math.exp(-arg)) / 2;}
	function deg_to_rad(d){return d*(Math.PI/180.0);}
	function rad_to_deg(r){return r/(Math.PI/180.0);}
	function max_frame(z){return {sw:{x:0, y:(Math.pow(2, z) - 1)},ne:{x:(Math.pow(2, z) - 1),y:0}};}
	function map(value, v1, v2, v3, v4) {return v3 + (v4 - v3) * ((value - v1) / (v2 - v1));}
}

sketchonmap.side = 256;
sketchonmap.earth_rad = 6378137.0;