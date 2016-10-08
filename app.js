var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//托管静态资源
app.use(express.static('public'));
app.get('/', function(req, res){
	res.send('<h1>欢迎来到我的聊天室<h1>');
});
app.get('/index', function(req, res){
	res.sendFile(__dirname + '/public/index.html');
});

//在线用户
var onlineUsers = {};
//当前在线人数
var onlineCount = 0;

io.on('connection', function(socket){
	console.log('新的用户连接了');

	//监听新用户加入
	socket.on('login', function(obj){
		//将新加入用户的唯一标识符当作socket的名称，后面退出的时候会用到
		socket.name = obj.userid;
		//检查在线列表，如果不再里面就加入
		if(!onlineUsers.hasOwnProperty(obj.userid)){
			onlineUsers[obj.userid] = obj.username;
			//在线人数+1
			onlineCount++;
		}
		//向所有客户端广播用户加入
		io.emit('login', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj})
		console.log(obj.username+'加入了聊天室');
	});

	//监听用户退出
	socket.on('disconnect', function(){
		//将退出用户从列表里面删除
		if(onlineUsers.hasOwnProperty(socket.name)){
			//退出用户信息
			var obj = {userid:socket.name,username:onlineUsers[socket.name]};
			//删除
			delete onlineUsers[socket.name];
			// 在线人数-1
			onlineCount--;
			io.emit('logout',{onlineUsers:onlineUsers,onlineCount:onlineCount,user:obj});
			console.log(obj.username + '退出了聊天室');
		}
	});

	//监听用户发布聊天内容
	socket.on('message', function(obj){
		//向所有客户端广播发布的消息
		io.emit('message', obj);
		console.log(obj.username +'说：'+obj.content);
	});
});

http.listen(3000, function(){
	console.log('lisndiadn');
})
