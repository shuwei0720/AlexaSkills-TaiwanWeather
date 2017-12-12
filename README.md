## Alexa Skills - Taiwan Weather


### Structure

![image](struct.png)

-------------
### [Alexa Skills Kit](https://developer.amazon.com/edw/home.html#/skills)

##### Skill/Interaction Model
> Intent Schema 
> + intents
> + slots
> + AMAZON intent

> Custom Slot Types
> + Type
> + Values

> Sample Utterances
> + intent {Slot-Type} Word 
> + EX: CityIntentWithSlots {whichcity} city

-------------
### [Amazon Lambda](https://console.aws.amazon.com/lambda/home)

##### Labmda
> Add Triggers
> + Alexa Skills Kit

> [index.js](Labmda/index.js)
```
exports.handler = function (event, context) {
  ...
  else if (event.request.type === "IntentRequest") {
    onIntent(event.request, event.session,
      function callback(sessionAttributes, speechletResponse){   
        context.succeed(
          buildResponse(sessionAttributes, speechletResponse));
    });
  }
};
```
```
function onIntent(intentRequest, session, callback) {
...
if (intentName === 'CityIntentWithSlots') {
        CityIntent(intent, session, callback)
    } 
}
```
```
function CityIntent(intent, session, callback) {
...
  var transCity = intent.slots.whichcity.value;
  var https = require('https');
  var req = https.request(getMyApi(transCity), res => {
            res.setEncoding('utf8');
            ...
            res.on('end', () => {
                var queryCount = JSON.parse(returnData).query.count;
                ...
                shouldEndSession = true;
                	speechOutput = 'The temperature in ' + transCity + ' ,is '+ currentTemp + ' degrees' + ' ,high of ' + highTemp + ' degrees ,and low of ' + lowTemp + ' degrees'	+ ' ,Currently is ' + currentCondition + ' , have a nice day.';
				
                callback({}, buildSpeechletResponse(cardTitle, speechOutput,repromptText, shouldEndSession));
                ...
}
```
```
function getMyApi(cityData){
    cityAPI = {
        host: 'query.yahooapis.com',
        port: 443,
        path: '/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22' + cityData + '}%2C%20TW%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys',
        method: 'GET'
    };
    return cityAPI;
}
```


-------------
### [YouTube Demo](https://youtu.be/-lzPmnEEjec)

[<img src="struct.png">](https://youtu.be/-lzPmnEEjec)

