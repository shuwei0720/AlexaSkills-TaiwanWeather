
// var request = require("request")
// const Https = require('https');

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
   
    // ========================================
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }  
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    getWelcomeResponse(callback)
}


function CityIntent(intent, session, callback) {
    var cardTitle = 'CityWeather';
    var speechOutput = "you can say city name of taiwan, or say stop to leave taiwan weather";
    var repromptText = speechOutput;
    var shouldEndSession = false;
    
    try {
        var transCity = intent.slots.whichcity.value;
        var https = require('https');
        var req = https.request(getMyApi(transCity), res => {
            res.setEncoding('utf8');
            var returnData = "";
    
            res.on('data', chunk => {
                returnData = returnData + chunk;
            });
            res.on('end', () => {
                var queryCount = JSON.parse(returnData).query.count;
                if (queryCount === 0){
                    speechOutput = 'Currently, taiwan weather only support the city of taiwan, like Taipei, Taichung, Kaohsiung, Yilan, Hualien, Taitung, or you can say stop to leave taiwan weather';
                    callback({},
                        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
                }else{
                    var channelObj = JSON.parse(returnData).query.results.channel;
                    
                    var currentTemp = channelObj.item.condition.temp;
                    currentTemp = Math.round(5/9 * (currentTemp - 32));
                    var currentCondition = channelObj.item.condition.text;
                    var fore = channelObj.item.forecast;
                    var day = fore[0].date;
                    var highTemp = Math.round(5/9 * (fore[0].high - 32));
                    var lowTemp = Math.round(5/9 * (fore[0].low - 32));
                    
                	speechOutput = 'The temperature in ' + transCity + ' ,is '+ currentTemp + ' degree '
                    	+ ' ,highest is ' + highTemp + ' degree ,and lowest is ' + lowTemp + ' degree '
                    	+ ' ,currently is ' + currentCondition;
                    	
                    callback({},
                        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
                    
                }
            });
        });
        req.end();        
    } catch (e) {
        callback({},
            buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
}

// function weekWeatherIntent(intent, session, callback) {
// }


/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {

    var intent = intentRequest.intent
    var intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
     if (intentName === 'CityIntentWithSlots') {
        CityIntent(intent, session, callback)
    } else if (intentName === 'AMAZON.HelpIntent') {
        getHelpResponse(callback);
    } else if (intentName === 'AMAZON.StopIntent') {
        getStopResponse(callback);
    } else if (intentName === 'AMAZON.CancelIntent') {
        getStopResponse(callback);
    } else {
         throw "Invalid intent please check lambda!"
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
}

// ------- Skill specific logic -------

function getWelcomeResponse(callback) {
    var speechOutput = "Welcome! you can say alexa, taipei city to get weather of the taipei"

    var reprompt = speechOutput

    var header = "Welcome Weather"

    var shouldEndSession = false

    var sessionAttributes = {
        "speechOutput" : speechOutput,
        "repromptText" : reprompt
    }

    callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession))
}

function getHelpResponse(callback) {
    var speechOutput = "you can say city name to get message, or say stop to leave taiwan weather"

    var reprompt = speechOutput

    var header = "Help Weather"

    var shouldEndSession = false

    var sessionAttributes = {
        "speechOutput" : speechOutput,
        "repromptText" : reprompt
    }

    callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession))
}

function getStopResponse(callback) {
    var speechOutput = "You will leave taiwan weather, have a nice day."

    var reprompt = speechOutput

    var header = "Stop Weather"

    var shouldEndSession = true

    var sessionAttributes = {
        "speechOutput" : speechOutput,
        "repromptText" : reprompt
    }

    callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession))
}

function getMyApi(cityData){

    cityAPI = {
        host: 'query.yahooapis.com',
        port: 443,
        path: '/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22' + cityData + '}%2C%20TW%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys',
        method: 'GET'
    };

    return cityAPI;
}


// ------- Helper functions to build responses for Alexa -------
function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

function capitalizeFirst(s) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}