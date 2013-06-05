(function(WGo, undefined){

var prepare_dom = function() {
	this.box = document.createElement("div");
	this.box.className = "wgo-box-wrapper wgo-comments-wrapper";
	this.element.appendChild(this.box);
	
	var title = document.createElement("div");
	title.className = "wgo-box-title";
	title.innerHTML = WGo.t("comments");
	
	var name_color;
	name_color = document.createElement("div");
	name_color.className = "wgo-comment-img wgo-box-img";
	name_color.innerHTML = "<div></div>";
	
	this.box.appendChild(name_color);
	this.box.appendChild(title);
	
	this.comments = document.createElement("div");
	this.comments.className = "wgo-comments-content";
	this.box.appendChild(this.comments);		 
}

var mark = function(move) {
	var x,y;
	
	x = move.charCodeAt(0)-'a'.charCodeAt(0);
	if(x < 0) x += 'a'.charCodeAt(0)-'A'.charCodeAt(0);
	if(x > 7) x--;
	y = (move.charCodeAt(1)-'0'.charCodeAt(0));
	if(move.length > 2) y = y*10+(move.charCodeAt(2)-'0'.charCodeAt(0));
	y = this.kifuReader.game.size-y;

	this._tmp_mark = {type:'MA', x:x, y:y};
	this.board.addObject(this._tmp_mark);
}
var unmark = function() {
	this.board.removeObject(this._tmp_mark);
	delete this._tmp_mark;
}

var search_nodes = function(nodes, player) {
	for(var i in nodes) {
		if(nodes[i].className && nodes[i].className == "wgo-move-link") {
			nodes[i].addEventListener("mouseover", mark.bind(player, nodes[i].innerHTML));
			nodes[i].addEventListener("mouseout", unmark.bind(player));
		}
		else if(nodes[i].childNodes && nodes[i].childNodes.length) search_nodes(nodes[i].childNodes, player);
	}
}	

var CommentBox = function(player, region) {
	this.player = player;
	this.element = document.createElement("div");
	//this.element.style.backgroundColor = "#4d9";
	this.element.className = "wgo-commentbox";
	
	prepare_dom.call(this);
	
	player.addEventListener("update", function(e) {
		this.setComments(e);
	}.bind(this));
}

CommentBox.prototype = {
	constructor: CommentBox,
	
	appendTo: function(target) {
		target.appendChild(this.element);
	},

	setComments: function(e) {
		this.comments.innerHTML = (e.msg || "")+this.getCommentText(e);
		
		if(e.target.config.formatMoves) {
			if(this.comments.childNodes && this.comments.childNodes.length) search_nodes(this.comments.childNodes, e.target);
		}
	},
	
	getCommentText: function(e) {
		// to avoid XSS we must transform < and > to entities, it is highly recomanded not to change it
		//.replace(/</g,"&lt;").replace(/>/g,"&gt;") : "";
		if(e.node.comment) {
			var comm =  "<p>"+e.node.comment.replace(/\n/g, "</p><p>")+"</p>";
			if(e.target.config.formatNicks) comm = comm.replace(/(<p>)([^:]{3,}:)\s/g, '<p><span class="wgo-comments-nick">$2</span> ');
			if(e.target.config.formatMoves) comm = comm.replace(/\b[a-zA-Z]1?\d\b/g, '<a href="javascript:void(0)" class="wgo-move-link">$&</a>');
			return comm;
		}
		return "";
	},
	
	updateDimensions: function() {
		//this.element.style.height = this.element.style.maxHeight = this.element.clientHeight+"px";
	}
}

//CommentBox.comment_transform = CommentBox.addAround("getCommentText", comment_transform, CommentBox.prototype.getCommentText);
WGo.Player.widgets.commentbox = CommentBox;
WGo.Player.layouts["right_top"].right.push("commentbox");
WGo.Player.layouts["one_column"].bottom.push("commentbox");

WGo.Player.CommentBox = CommentBox

})(WGo);
