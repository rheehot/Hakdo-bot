const cluster = require('cluster');
const fs = require('fs');
const botToken = require('./token').token;
const weatherApiKey = require('./token').weather;
const apiaiKey = require('./token').apiai;

if (cluster.isMaster) {
	var worker = cluster.fork();
	worker.send(botToken);
	String.prototype.replaceAll = function(target, replacement) {
		return this.split(target).join(replacement);
	};
	
	worker.on('message', function (message) {
		if(message == 'start'){
			worker.kill();
			worker = cluster.fork();
			worker.send(botToken);
		}else if(message == 'kill'){
			worker.kill();
			process.exit(0);
		}else if(message.type == "token"){
			var work = cluster.fork();
			work.send(message.token);
		}
		message = null;
	});
	
	
	cluster.on('online', function(worker, code, signal) {
		console.log('worker restart : ' + worker.process.pid);
	});
	
	cluster.on('exit', function(worker, code, signal) {
		console.log('worker is dead : ' + worker.process.pid);
		if(code != 0){
			worker = cluster.fork();
			worker.send(botToken);
			worker.send('Worker is dead, auto restart start');
		}
	});
	
}

if (cluster.isWorker) {
	const Discord = require('discord.js');
	const client = new Discord.Client();
	const botId = require('./token').botId;
	
	process.on('message', function(message) {			
		client.login(message);
		message = null;
		// client.on('ready', () => {	
			// console.log(message);
			// const channel = client.channels.find('name', 'general');
			// channel.sendMessage(message);
		// });
	});	
	

	client.on('ready', () => {
		console.log('I am ready!');
		if(client.user.bot){
			console.log("I'm bot");
			if(client.user.id == botId){
				console.log("My name is Hakdo bot");
				
	const uuidFunction = require('uuid-v4');
	const mainduuid = uuidFunction();
	var admins = [require('./token').adminId];
	const exec = require('child_process').exec;
	
	
	client.on('message', message => {
		if(message.content.indexOf('h!help') == 0){
			
		}
	});
	client.on('message', message => {
		if(message.content.indexOf('h!help') == 0){
			message.reply('<관리자 전용>\n```\nh!exec <COMMAND> : Command Run\nh!kill : Suicide\nh!restart : Restart Hakdo bot\n' +
			'h!python <Code> : Python Execute\n' +
			'```\n\n<일반 사용자용>```' +
			'h!ssh -url <URL> -p <PORT> -user <USER> ' +
			': SSH connect\nh!macro <Value> <Count> ' + 
			': Sent the specified number of times\n' +
			'h!pid : View Hakdo bot pid!\n' +
			'h!weather <city name in eng> : <BETA> get weather```');
		}
	});
	
	
	client.on('message', message => {
		if(message.content.indexOf('h!login') == 0){
			const token = message.content.substring(message.content.lastIndexOf(' ')).trim();
			process.send({type:"token", token:token});
		}
		message = null;
	});
	
	client.on('message', message => {
		if(message.content.indexOf('h!rm') == 0 & admins.indexOf(message.author.id) != -1){
			const count = Number(message.content.substring(message.content.lastIndexOf(' ')));
			message.channel.fetchMessages({limit: count}).then(messages => message.channel.bulkDelete(messages));
		}
	});	
	
	client.on('message', message => {
		if(message.content.indexOf('h!지진') == 0){
			const urlencode = require('urlencode');
			const request = require('request');
			const url = "http://m.kma.go.kr/m/risk/risk_03.jsp";
			request(url, function(error, response, body) {
				if (error) throw error;

				const cheerio = require('cheerio');  
				const $ = cheerio.load(body);
				
				const postTitle = $("#div_0 > div > table > tbody > tr");
				var embed = new Discord.RichEmbed()
					.setTitle("지진 정보")
					.setColor(0x76FF03)
					.setThumbnail("http://m.kma.go.kr" + $("#div_0 > p > a > img").attr("src"))
					.setTimestamp()
					.setFooter("Hakdo bot | Developed by GyungDal", client.user.avatarURL);
				postTitle.each(function() {
					const title = $(this).find("td:nth-child(1)").text().trim();
					const desc = $(this).find("td:nth-child(2)").text().trim();
					console.log("title : " + title);
					console.log("desc : " + desc);
					embed.addField(title, desc)
				});
				message.channel.send({embed});
					
			});
		}			
	});
	
	client.on('message', message => {
		const uuid = message.content.substring(message.content.lastIndexOf('<@') + 2, message.content.lastIndexOf('>'));
		if(message.content.indexOf('h!admin ') == 0 & admins.indexOf(message.author.id) == 0){
			if(admins.indexOf(uuid) == -1){
				admins.push(uuid);
				message.reply("NEW ADMIN : <@" + uuid + '>');
			}
		}
	});
	
	function namuSearch(message, str){
		const urlencode = require('urlencode');
		const request = require('request');
		request.get({url:'https://namu.wiki/search/' + urlencode(str.trim())}, function (error, res, body){
			const cheerio = require('cheerio');  
			const $ = cheerio.load(body);		
			console.log(body);
			var temp = 0;
			const postElements = $("body > div.content-wrapper > article > section > div");
			postElements.each(function() {
				if(temp > 2)
					return;
				temp = temp + 1;
				const post_title = $(this).find("h4 a").text().trim();
				const post_url = $(this).find("h4 a").attr('href');
				const post_thumb = $(this).find("div").text();
				console.log('title : ' + post_title);
				console.log('url : ' + post_url);
				console.log('thumb : ' + post_thumb);
				if(post_title == '' | post_url == '' | post_thumb == '')
					return;
				const embed = new Discord.RichEmbed()
					.setTitle("Search result")
					.setColor(0x76FF03)
					.setTimestamp()
					.setURL("https://namu.wiki" + post_url)
					.addField("Title", post_title)
					.addField("Thumb", post_thumb)
					.setFooter("Hakdo bot | Developed by GyungDal", client.user.avatarURL);
				message.channel.send({embed});
				
				// message.channel.send(`==== TITLE : ${post_title} ====\n\n` + '```\n' +
						// `${post_thumb}...` + '```\n' + `\n\nhttps://namu.wiki${post_url}\n`);
			});
		});
		temp = undefined;
	}
	
	client.on('message', message => {
		const userlist = message.mentions.users;
		console.log(userlist);
		userlist.forEach(function(user){
			if(user.id == botId){
				var str = message.content.substring(message.content.lastIndexOf('>') + 1);
				
				if(message.content.indexOf('-n') != -1){
					str = str.replace('-n', '').replace(' ', '');
					namuSearch(message, str);
					return;
				}	
				console.log(str);
				const request = require('request');   
				const storyId = require('./token').mind;
				const url = "http://mindmap.ai:8000/v1/" + storyId;
				const inputJsonObjectDataInit = {
					"story_id": storyId,
					"context": {
						"conversation_id": mainduuid,
						"information": {
							"conversation_stack": [
								{
									"conversation_node": 'root',
									"conversation_node_name": '루트노드'
								}
							],
							"conversation_counter": 0,
							"user_request_counter": 0,
						},
						"visit_counter": 0,
						"reprompt": false,
						"retrieve_field": false,
						"message": null,
						"keyboard": null,
						"random": false,
						"input_field": false,
						"variables": null
					},
					"input": {
						"text": str
					}
				};
				 
				// request 보내기
				const json = '';
				request({
						url: url,
						method: 'POST',
						json: inputJsonObjectDataInit
				 
					},
					// response 받기
					function(error, response, body){
						console.log("--------- response 시작 ----------");
						console.log(body);
						console.log("--------- response 끝 ----------");
						json = body;
				 
						// 받은 텍스트보기
						const outputTextArray = json["output"]["visit_nodes_text"];
						console.log("outputTextArray: " + outputTextArray.toString());
						for(var i=0 ; i < outputTextArray.length ; i++){
							//실행된 모든 노드의 대답을 표시한다
							console.log(outputTextArray[i]);
						}
				 
				 
						// ** 다시 보낼 payload 재가공하기
						console.log("");
						console.log("--------- 보낼 new_inputJsonObjectData 재가공 시작 ----------");
						const new_inputtxt = str;  // 이부분만 재가공하여 처리하여 다시 메시지를 보내면 된다.
						const new_context = json['context'];
						const new_inputJsonObjectData = {
							"story_id": storyId,
							"context": new_context,
							"input": {
								"text": new_inputtxt
							}
				 
						}
						console.log("받은 context 지만 다시 보낼 context: " + JSON.stringify(new_context));  // 그대로 보내야지 변수들이 유지되어 mindmap이 잘 작동한다.
						console.log("가공후 새롭게 보낼 new_inputtxt: " + new_inputtxt);
						console.log("재가공된  'new_inputJsonObjectData' 이걸 다시 request를 만들어 보내면 된다. : " + JSON.stringify(new_inputJsonObjectData));
						console.log("------------ 보낼 new_inputJsonObjectData 재가공하기 끝 ----------");
						var json = '';
						request({
							url: url,
							method: 'POST',
							json: new_inputJsonObjectData

						},
							// response 받기
							function(error, response, body){;
								if(body["output"]["visit_nodes_name"][0] == '.mr'){
									const urlencode = require('urlencode');
									const request = require('request');
									const naver_client_id = require('./token').naver_client_id;
									const naver_client_secret = require('./token').naver_client_secret;
									const searchURI = ("https://openapi.naver.com/v1/search/encyc.json?query=" + urlencode(str.trim())).trim();
									console.log(searchURI);
									const options = {
										url: searchURI,
										headers: { 
													'X-Naver-Client-Id':naver_client_id, 
													'X-Naver-Client-Secret': naver_client_secret,
													"Content-Type" : "application/json; charset=utf-8"
												}
									};
									request.get(options, function (error, res, body) {
										if (!error) {
											try{
											const json = JSON.parse(body);
												console.log(body);

	                                                	                        const embed = new Discord.RichEmbed()
												.setTitle(`Search <${json['items'][0]['title'].replace(/<(?:.|\n)*?>/gm, '')}>`)
												.setURL(json['items'][0]['link'])
        	                                                	                        .setColor(0xd50000)
               	        	                                        	                .setTimestamp()
               	 	                                                        	        .addField("Description", json["items"][0]['description'].replace(/<(?:.|\n)*?>/gm, ''))
                                	                                               		.setFooter("Hakdo bot | Developed by GyungDal", client.user.avatarURL);
                                        		                                message.channel.send({embed});
											}catch(e){
												if(namuSearch(message, str) == null)
													message.channel.send("NOT FOUND...");
											}
										}
										console.log(error);
									});
								}else{
									console.log(body);
									json = body;
									const outputTextArray = json["output"]["visit_nodes_text"];
									console.log("outputTextArray: " + outputTextArray.toString());
									for(var i=0 ; i < outputTextArray.length ; i++){
										//실행된 모든 노드의 대답을 표시한다
										console.log(outputTextArray[i]);
									}
									const embed = new Discord.RichEmbed()
										.setColor(0x76FF03)
										.setTimestamp()
										.addField("Result", json["output"]["text"][0])
										.setFooter("Hakdo bot | Developed by GyungDal", client.user.avatarURL);
									message.channel.send({embed});
								
										
								}
						});
					});
					 
				//var request = app.textRequest(str, {
				//	sessionId: '1'
				//});
                //
				//request.on('response', function(response) {
				//	console.log(response);
				//	message.reply(response.result.fulfillment.speech);
				//});
                //
				//request.on('error', function(error) {
				//	console.log(error);
				//	message.reply(error);
				//});
                //
				//request.end();
			}
		});
	});
	
	//개복치사 확인용
	process.on('uncaughtException', function (err) {
		const channel = client.channels.find('name', 'general');
		const embed = new Discord.RichEmbed()
			.setTitle("Exception")
			.setColor(0xD50000)
			.setTimestamp()
			.addField("Info", err)
			.setFooter("Hakdo bot | Developed by GyungDal", client.user.avatarURL);
		channel.sendMessage({embed});
	});

	
	client.on('message', message => {
		if(message.content.indexOf('h!adminList') == 0 & admins.indexOf(message.author.id) == 0){
			var temp = "";
			admins.forEach(function(value){
				temp = temp + "<@" + value + '> ';
			});
			const embed = new Discord.RichEmbed()
				.setTitle("ADMIN LIST")
				.setColor(0x2979FF)
				.setTimestamp()
				.addField("List", temp)
				.setFooter("Hakdo bot | Developed by GyungDal", client.user.avatarURL);
			message.channel.send({embed});
		} 
		temp = undefined;
	});
	
	client.on('message', message => {
		if(message.content.indexOf('h!pid') == 0){
			console.log(process.pid);
			message.channel.send("\nPID : " + process.pid);
		} 
	});
	
	
	client.on('message', message => {
		if(message.content.indexOf('h!logoutAll') == 0 & admins.indexOf(message.author.id) == 0){
			for(var i in admins){
				if(i == 0)
					continue;
				delete admins[i];
			}
			message.channel.send("DELETE ALL CUSTOM ADMIN\n");
		}
	});
	
	client.on('message', message => {
		const uuid = message.content.substring(message.content.lastIndexOf('<@') + 2, message.content.lastIndexOf('>'));
		if(message.content.indexOf('h!logout ') == 0 & admins.indexOf(message.author.id) == 0){
			if(admins.indexOf(uuid) > 0){
				delete admins[admins.indexOf(uuid)];
				message.channel.send("DELETE ADMIN : <@" + uuid + '>');
			}
		}
	});
	
	client.on('message', message => {
		//console.log(message);
		if(message.content.indexOf('h!macro') == 0){
			
			const value = message.content.substring(message.content.indexOf(" "), message.content.lastIndexOf(" ")).trim();
			console.log(value);
			if(value.indexOf("h!") != -1){
				message.channel.send("NOP!");
				return;
			}
			if(value.indexOf(admins[0]) != -1){
				message.channel.send("NOP!!!!!!!!!!!!!!!!!!!!!!!!!!!");
				return;
			}
			const time = message.content.substring(message.content.lastIndexOf(' ') + 1).trim();
			if(time < 0)
				return;
			for(var i = 1;i<=time;i++){
				message.channel.send(value);
			}
		}
	});
	
	
	client.on('message', message => {
		if(admins.indexOf(message.author.id) != -1 & 
			message.content.indexOf('h!kill') == 0){
			process.send('kill');
			process.exit(0);
		}
	});
	
	client.on('message', message => {
		if(admins.indexOf(message.author.id) != -1 & 
			message.content.indexOf('h!restart') == 0){
			process.send('start');
			process.exit(0);
		}
	});
	
	
	client.on('message', message => {
		if(admins.indexOf(message.author.id) != -1 &
		message.content.indexOf('h!python') == 0){
			const command = message.content.replace('h!python', '').trim();
			console.log(command);
			fs.writeFile('./temp.py', command, function(err) {
				if(err) throw err;
				console.log('File write completed');
			});
			exec("python './temp.py'", (error, stdout, stderr) =>{
				if(error){
					const embed = new Discord.RichEmbed()
						.setTitle("Error")
						.setColor(0xD50000)
						.setTimestamp()
						.addField("Description", error)
						.setFooter("Hakdo bot | Developed by GyungDal", client.user.avatarURL);
					message.channel.send({embed});		
					return;
				}
				console.log(stdout);				
				const embed = new Discord.RichEmbed()
					.setTitle("Success")
					.setColor(0x76FF03)
					.setTimestamp()
					.addField("Output", stdout)
					.setFooter("Hakdo bot | Developed by GyungDal", client.user.avatarURL);
				message.channel.send({embed});		
			});
			
		}
	});
	
	
	client.on('message', message => {
		if(admins.indexOf(message.author.id) != -1 &
		message.content.indexOf('h!exec') == 0){
			console.log(message.content.replace('h!exec', '').trim());
			exec(message.content.replace('h!exec', '').trim(), (error, stdout, stderr) =>{
				if(error){
					const embed = new Discord.RichEmbed()
						.setTitle("Error")
						.setColor(0xD50000)
						.setTimestamp()
						.addField("Description", error)
						.setFooter("Hakdo bot | Developed by GyungDal", client.user.avatarURL);
					message.channel.send({embed});	
					return;
				}
				console.log(stdout);	
				const embed = new Discord.RichEmbed()
					.setTitle("Success")
					.setColor(0x76FF03)
					.setTimestamp()
					.addField("Output", stdout)
					.setFooter("Hakdo bot | Developed by GyungDal", client.user.avatarURL);
				message.channel.send({embed});	
			});
		}
	});
	
	client.on('message', message => {
		if(admins.indexOf(message.author.id) != -1 & 
			message.content.indexOf('h!sshList') == 0){	
			const embed = new Discord.RichEmbed()
				.setColor(0x76FF03)
				.setTimestamp()
				.addField("Output", sshConnect)
				.setFooter("Hakdo bot | Developed by GyungDal", client.user.avatarURL);
			message.channel.send({embed});	
		}
	});
	
	var sshConnect = {};
	var seq = {};
	
	client.on('message', message => {
		var url, user, port;
		if(message.content.indexOf('h!ssh ') == 0){
			console.log('SSH');
			const argv = message.content.split(' ');
			console.log(argv);
			var before = '';
			for(var value in argv){
				value = argv[value];
				switch(before){
					case '-url' : 
						url = value; 
						console.log('URL : ' + url);
						break;
					case '-p' : 
						port = value; 
						console.log('PORT : ' + url);
						break;
					case '-user' : 
						user = value; 
						console.log('USER : ' + url);
						break;
				}
			
				console.log(value);
				before = value;
			}
			if(url.indexOf("@") != -1){
				user = url.split("@")[0];
				url = url.split("@")[1];
			}
			//h!ssh -url gyungdal.iptime.org -p 24 -user gyungdal -pw aa1003
			// const channel = client.channels.find('name', 'general');
			// channel.sendMessage(require('util').format('%s:%d -u %s -p %s', url, port, user, pw));
			if(typeof url != 'undefined' & typeof user != 'undefined'){
				if(typeof port == 'undefined'){
					port = 22;
				}
				const spawn = require("child_process").spawn;
				seq[message.author.id] = spawn("ssh", [user + "@" + url, "-p", port, "-t", "-t"], {stdio:['pipe','pipe','pipe']});
				seq[message.author.id].stdin.write('\r\n');
				seq[message.author.id].stderr.on("data", function(data) {	
					console.log(data);
					const embed = new Discord.RichEmbed()
						.setTitle("Error")
						.setColor(0xD50000)
						.setTimestamp()
						.addField("Description", data)
						.setFooter("Hakdo bot | Developed by GyungDal", client.user.avatarURL);
					message.channel.send({embed});	
					return;
				});
				seq[message.author.id].stdout.on("data", function(data) {
					console.log(data);
					const embed = new Discord.RichEmbed()
						.setTitle("Success")
						.setColor(0x76FF03)
						.setTimestamp()
						.addField("Output", data)
						.setFooter("Hakdo bot | Developed by GyungDal", client.user.avatarURL);
					});
					sshConnect[message.author.id] = true;
				}
			url = user = port = before = null;
		}
		if(message.content.indexOf('!') == 0 & sshConnect[message.author.id] == true){
			if(message.content.indexOf('!exit') == 0){
				seq[message.author.id].stdin.write('exit\r\n');
				seq[message.author.id].stdin.end();
				delete sshConnect[message.author.id];
				message.reply("ssh close");
				delete seq[message.author.id];
			}else{
				seq[message.author.id].stdin.write(message.content.substring(1) + '\r\n');
			}
		}
	});
			}
		}else{
			console.log("I'm user!");	
			var rep = '';
			var interval;
			var autoLevelup = false, interval, before;
			
			client.on('message', message => {
				if(message.author.id == client.user.id){
					const uuid = require('uuid-v4');
					if(!uuid.isUUID(message.content)){
						before = message.createdTimestamp; 
						console.log("현재 TIMESTAMP : " + before);
					}
					var a = message.content.indexOf(' ') != -1 ? message.content.indexOf(' ') : message.content.length;
					switch(message.content.substring(message.content.indexOf('!') + 1, a)){
						case "parming" :{
								message.channel.send('t!daily');
								if(rep != '')
									message.channel.send('t!rep ' + rep);
								interval = setInterval(() => {
									message.channel.send('t!daily');
									if(rep != '')
										message.channel.send('t!rep ' + rep);
								}, (1000 * 3600 * 24) + 1000);						
						}
						case "stop":{
							clearInterval(interval);
							message.channel.send("stop parming");
						}
						case "enable" :{
							console.log("레벨업 활성화!");
							autoLevelup = true;
							interval = setInterval(function(){
								console.log("현재 시간 : " + (new Date().getTime()));
								if((before + (10 * 1000)) < (new Date().getTime())){	
								
									console.log("10초 지남!, 레벨업 시작!");
									if(autoLevelup){
										const uuid = require('uuid-v4');
										message.channel.send(uuid());
									}
								}
							}, 1200);
							break;
						}
						case "disable" : {
							console.log("레벨업 비활성화...");
							autoLevelup = false;
							clearInterval(interval);
							message.channel.send("Level up Done");
							break;
						}
						default : break;
					}
				}
			});
				
			client.on('message', message => {
				if(message.author.id == client.user.id){
					
					var a = message.content.indexOf(' ') != -1 ? message.content.indexOf(' ') : message.content.length;
					switch(message.content.substring(message.content.indexOf('!') + 1, a)){
						case 'setRep' : {
							rep = message.content.substring(message.content.indexOf(' <'), message.content.indexOf('>') + 1).trim();
							message.channel.send("rep : " + rep);
							console.log("req : " + rep);	
							break;
						}
						case 'clearRep' : {								
							rep = '';
							console.log("repClear");
							message.channel.send("repClear");
						}
						default : break;
					}
				}
			});
		}
	});
	


}
