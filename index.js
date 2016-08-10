
var express = require('express');
var app = express();
var fs = require("fs");
var path = require('path');
var bodyParser = require('body-parser');

var lastDate = new Date("8/25/2016");
var todayDate;
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/donate'));
app.use(bodyParser.urlencoded({ extended: true })); 
// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index')
});

app.get('/donate', function(request, response) {
	intializeLeftDays();
	response.sendFile(path.join(__dirname + '/donate/index.html'));
	
});

app.get('/donate_money' ,function(request, response) {

	var m = JSON.parse(fs.readFileSync('donate/json/database.json').toString());
	console.log(m.no_donation + parseInt(request.query.money));
	if(m.no_donation >= 1000) response.end('done');
	else if((m.no_donation + parseInt(request.query.money)) > 1000) response.end('Only $'+(1000 - m.no_donation)+' needed');
	else{ 
		m.no_donation += parseInt(request.query.money);
		m.no_donor ++;
		m.no_duraion_left = getDifDays();
		
		fs.writeFile('donate/json/database.json', JSON.stringify(m));
		if(m.no_donation === 1000) response.end("complete");
		else response.end("done");
	}
});

function intializeLeftDays(){
	
	var m = JSON.parse(fs.readFileSync('donate/json/database.json').toString());
	if(m.no_donation < 1000){
		m.no_duraion_left = getDifDays();
		fs.writeFile('donate/json/database.json', JSON.stringify(m));
	}
	
};
function getDifDays(){
	todayDate = new Date();
	var timeDiff = Math.abs(todayDate.getTime() - lastDate.getTime());
	var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
	return diffDays;
}



app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});