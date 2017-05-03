/*
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* jshint node: true, devel: true */
'use strict';

const 
  bodyParser = require('body-parser'),
  config = require('config'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),  
  request = require('request');
const util = require('util');

/*******************************************************/
const url = require('url');
const xml2js = require('xml2js');
var parser = new xml2js.Parser();

var d4lkey = '561a36ad7cfd805c6102dcc3bb0f8c8245113234c0c8c8d91e8b9608a21d900b';
var apiUrl = 'http://data4library.kr/api/srchDtlList';
var api = apiUrl + '?authKey=' + d4lkey + '&loaninfoYN=Y&displayInfo=region';
var client_id = '55sgkOGFkaVyyLRjgb4b';
var client_secret = 'VAGamadNN7';
/*******************************************************/

const faceAPI = require('mt-face-api');
const Translate = require('@google-cloud/translate');
 
var msFace = new faceAPI("a709bb7843e344c49fee014ffa178ea7");

var FacePP = require('./lib/facepp-sdk.js');

var fpp = require('face-plus-plus');
fpp.setApiKey('23f2e82cffb05a397b7ef5f5aa5920e8');
fpp.setApiSecret('sRcfHQAP-ijE4aFR71Tc64hl4ZH89MSP');

var Promise = require('promise');

//var colorJS = require('./lib/color-thief-node.js');
//var ColorThief = require('color-thief');

var app = express();
app.set('port', process.env.PORT || 5000);
app.set('view engine', 'ejs');
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('public'));


/**********************************************************/
// [START vision_quickstart]
// Imports the Google Cloud client library
const Vision = require('@google-cloud/vision');
//var gcloud = require('google-cloud');
//var Vision = gcloud.vision();

// Read the file into memory.
var fs = require('fs');
//var imageFile = fs.readFileSync('https://scontent.xx.fbcdn.net/v/t34.0-12/18009221_1472598482812362_1866440958_n.jpg?_nc_ad=z-m&oh=b60b2345dfb525c57f3f48864458ea77&oe=58F6BDED');
/*
const file = fs.createWriteStream("image.jpg");

https.get("https://scontent.xx.fbcdn.net/v/t34.0-12/18009221_1472598482812362_1866440958_n.jpg", response => {
  response.pipe(file);
});

var imageFile = fs.readFileSync('image.jpg');

// Covert the image data to a Buffer and base64 encode it.
var encoded = new Buffer(imageFile).toString('base64');
console.log(encoded);
*/

// Your Google Cloud Platform project ID
const projectId = 'translate-0';

// Instantiates a client
const visionClient = Vision({
  projectId: projectId,
  keyFilename: './config/translate-676b72bc67ed.json'
});

// The name of the image file to annotate
//const fileName = './resources/wakeupcat.jpg';

// Performs label detection on the image file
/*
visionClient.detectLabels(fileName)
  .then((results) => {
    const labels = results[0];

    console.log('Labels:');
    labels.forEach((label) => console.log(label));
  })
  .catch((err) => {
    console.error('ERROR:', err);
  });
*/
// [END vision_quickstart]


/**********************************************************/
// [START translate_quickstart]
// Imports the Google Cloud client library
//const Translate = require('@google-cloud/translate');

// Your Google Cloud Platform project ID
//const projectId = 'translate-0';

// Instantiates a client
const translateClient = Translate({
  projectId: projectId,
  keyFilename: './config/translate-676b72bc67ed.json'
});
// ...you're good to go! See the next section to get started using the APIs.


// The text to translate
const text = 'Hello, world!';
// The target language
var target = 'ko';
var constLang = 1;

console.log(`Welcome, back! 서버가 재시작됐습니다.`);
//sendTextMessage('1152273851499573', "Come back!");

/* Translates some text into Russian
translateClient.translate(text, target)
  .then((results) => {
    const translation = results[0];

    console.log(`Text: ${text}`);
    console.log(`Translation: ${translation}`);
  })
  .catch((err) => {
    console.error('ERROR:', err);
  });
// [END translate_quickstart]*/

function detectLanguage (text, senderID) {
  // [START translate_detect_language]
  // Imports the Google Cloud client library
  //const Translate = require('@google-cloud/translate');

  // Instantiates a client
  const translate = Translate();

  // The text for which to detect language, e.g. "Hello, world!"
  // const text = 'Hello, world!';

  // Detects the language. "text" can be a string for detecting the language of
  // a single piece of text, or an array of strings for detecting the languages
  // of multiple texts.
  translateClient.detect(text)
    .then((results) => {
      let detections = results[0];
      detections = Array.isArray(detections) ? detections : [detections];

      console.log('Detections:');
      detections.forEach((detection) => {
        console.log(`${detection.input} => ${detection.language}`);
      });
      
      //SBPN
      //var target = "ko";
      if(constLang == 1 && detections[0].language == "ko") {
          target = "en";
      }
      translateText(text, target, senderID);
      //SBPN
    })
    .catch((err) => {
      console.error('ERROR:', err);
      sendTextMessage(senderID, text); //SBPN - echo
    });
  // [END translate_detect_language]
}

function translateText (text, target, senderID) {
  // [START translate_translate_text]
  // Imports the Google Cloud client library
  //const Translate = require('@google-cloud/translate');

  // Instantiates a client
  const translate = Translate();

  // The text to translate, e.g. "Hello, world!"
  // const text = 'Hello, world!';

  // The target language, e.g. "ru"
  // const target = 'ru';

  // Translates the text into the target language. "text" can be a string for
  // translating a single piece of text, or an array of strings for translating
  // multiple texts.
  translateClient.translate(text, target)
    .then((results) => {
      let translations = results[0];
      translations = Array.isArray(translations) ? translations : [translations];

      console.log('Translations:');
      translations.forEach((translation, i) => {
        console.log(`${text[i]} => (${target}) ${translation}`);
        sendTextMessage(senderID, translation);
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
      sendTextMessage(senderID, text); //SBPN - echo
    });
  // [END translate_translate_text]
}



/*
 * Be sure to setup your config values before running this code. You can 
 * set them using environment variables or modifying the config file in /config.
 *
 */

// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ? 
  process.env.MESSENGER_APP_SECRET :
  config.get('appSecret');

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
  (process.env.MESSENGER_VALIDATION_TOKEN) :
  config.get('validationToken');

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  config.get('pageAccessToken');

// URL where the app is running (include protocol). Used to point to scripts and 
// assets located at this address. 
const SERVER_URL = (process.env.SERVER_URL) ?
  (process.env.SERVER_URL) :
  config.get('serverURL');

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
  console.error("Missing config values");
  process.exit(1);
}

/*
 * Use your own validation token. Check that the token used in the Webhook 
 * setup is the same token used here.
 *
 */
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});


/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page. 
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else if (messagingEvent.read) {
          receivedMessageRead(messagingEvent);
        } else if (messagingEvent.account_linking) {
          receivedAccountLink(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've 
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }
});

/*
 * This path is used for account linking. The account linking call-to-action
 * (sendAccountLinking) is pointed to this URL. 
 * 
 */
app.get('/authorize', function(req, res) {
  var accountLinkingToken = req.query['account_linking_token'];
  var redirectURI = req.query['redirect_uri'];

  // Authorization Code should be generated per user by the developer. This will 
  // be passed to the Account Linking callback.
  var authCode = "1234567890";

  // Redirect users to this URI on successful login
  var redirectURISuccess = redirectURI + "&authorization_code=" + authCode;

  res.render('authorize', {
    accountLinkingToken: accountLinkingToken,
    redirectURI: redirectURI,
    redirectURISuccess: redirectURISuccess
  });
});

/*
 * Verify that the callback came from Facebook. Using the App Secret from 
 * the App Dashboard, we can verify the signature that is sent with each 
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an 
    // error.
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', APP_SECRET)
                        .update(buf)
                        .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to 
 * Messenger" plugin, it is the 'data-ref' field. Read more at 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
 *
 */
function receivedAuthentication(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfAuth = event.timestamp;

  // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
  // The developer can set this to an arbitrary value to associate the 
  // authentication callback with the 'Send to Messenger' click event. This is
  // a way to do account linking when the user clicks the 'Send to Messenger' 
  // plugin.
  var passThroughParam = event.optin.ref;

  console.log("Received authentication for user %d and page %d with pass " +
    "through param '%s' at %d", senderID, recipientID, passThroughParam, 
    timeOfAuth);

  // When an authentication is received, we'll send a message back to the sender
  // to let them know it was successful.
  sendTextMessage(senderID, "Authentication successful");
}

/*
 * Message Event
 *
 * This event is called when a message is sent to your page. The 'message' 
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
 *
 * For this example, we're going to echo any text that we get. If we get some 
 * special keywords ('button', 'generic', 'receipt'), then we'll send back
 * examples of those bubbles to illustrate the special message bubbles we've 
 * created. If we receive a message with an attachment (image, video, audio), 
 * then we'll simply confirm that we've received the attachment.
 * 
 */

var messageAttachedImages = new Array();
var messageBookImages = new Array();
var facesMS = new Array();

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;

  if (isEcho) {
    // Just logging message echoes to console
    console.log("Received echo for message %s and app %d with metadata %s", 
      messageId, appId, metadata);
    return;
  } else if (quickReply) {
    var quickReplyPayload = quickReply.payload;
    console.log("Quick reply for message %s with payload %s",
      messageId, quickReplyPayload);
    //sendTextMessage(senderID, "Quick reply tapped");
    //sendTextMessage(senderID, quickReplyPayload+"를 선택하셨습니다."); //잠깐 삭제
    if (quickReplyPayload == 'vision') {
      sendVisionMessage(senderID);
    }
    else if (quickReplyPayload == 'web') {
      sendVisionWebMessage(senderID);
    }
    else if (quickReplyPayload == 'color') {
      sendVisionColorMessage(senderID);
    }
    return;
  }

  if (messageText) {
      if (messageText.substr(0, 1) == '$') {
          // $ko
          // language
        target = messageText.substr(1, 2);
        constLang = 0; //flag setting
        if (target=="ko") {
          constLang = 1;
        }
        sendTextMessage(senderID, messageText + " will be changed.");
      }
      if (messageText.substr(0, 1) == '#') {
          // #[Amy] is [my best friend]
          // function(url, method, option, data, cb)
        var faceListId = 'facelist_id1';
        msFace.api('facelists/'+faceListId, 'PUT', {}, {
          name: '#IU',
          userData: 'Singer'
        }, function(error, res, body) {
            console.log("##### BODY " + util.inspect(body, false, null));
            console.log("##### ERR " + util.inspect(error, false, null));
            //console.log("##### RES " + util.inspect(res, false, null));
            /*if(body.statusCode==200) sendTextMessage(senderID, "Good, completed");
            else {
                sendTextMessage(senderID, body.statusCode+", "+body.message);    
                sendTextMessage(senderID, body.error.code+", "+body.error.message);    
            }*/
          return body;
        });          
        //sendTextMessage(senderID, messageText + " is created.");
      }
      if (messageText.substr(0, 1) == '@') {
          var len = messageAttachedImages.length;
          if(len > 0) {
            //face persisted
            var personGroupId = 'test_group1';
            var personId = '2c0681cb-5d2c-4d10-b287-ab7910c26eb7';
            var url = 'persongroups/'+personGroupId+'/persons/'+personId+'/persistedFaces';
            msFace.api(url, 'POST', {}, {
                url: messageAttachedImages[len-1]
            }, function(error, res, body) {
                console.log("##### BODY " + util.inspect(body, false, null));
                //console.log("##### RES " + util.inspect(res, false, null));
                /*if(body.statusCode==200) sendTextMessage(senderID, "Good, [Create a persongroups] completed");
                else {
                }*/
                var keys = Object.keys(body);
                if(keys[0] == 'persistedFaceId') {
                    var persistedFaceId = body.persistedFaceId;
                    
                    sendTextMessage(senderID, "Good, [Create a persistedFace] "+ persistedFaceId);
                    /*
                    msFace.api(url+'/'+persistedFaceId, 'POST', {}, {
                        url: messageAttachedImages[len-1]
                    }, function(error, res, body) {
                        console.log("##### BODY " + util.inspect(body, false, null));
                        console.log("##### ERR " + util.inspect(error, false, null));
                        //console.log("##### RES " + util.inspect(res, false, null));
                      return body;
                    });
                    */
                }
                else if(keys[0] == 'error') {
                    sendTextMessage(senderID, body.error.code+", "+body.error.message);    
                }
                
              return body;
            });          
            sendTextMessage(senderID, messageText + " @ is OK.");
              
            url = 'persongroups/'+personGroupId+'/persons/'+personId;
            msFace.api(url, 'GET', {}, {}, function(error, res, body) {
                console.log("##### BODY " + util.inspect(body, false, null));
                //console.log("##### RES " + util.inspect(res, false, null));
              return body;
            });
              
          }
          else sendTextMessage(senderID, "@ need to send the Face image");

      }
      
    if (~messageText.toLowerCase().indexOf('pick')) {
      sendPickMessage(senderID);
    }
    else if (~messageText.toLowerCase().indexOf('책')) {
        sendBookFind(senderID, messageText);
    }
    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    switch (messageText.toLowerCase()) {
      case 'p': //pick
      case 'pick':
      //case 'pick me':
        sendPickMessage(senderID);
        break;
            
      case 'all':
      case 'show me':
        sendAllMessage(senderID);
        break;
      case 'clear':
      case 'reset':
        sendClearMessage(senderID);
        break;

      case 'f':
      case 'face':
      case 'comp':
      case 'compare':
        sendFaceMessage(senderID);
        break;
            
      case 'hi':
      case 'hey':
        sendTextMessage(senderID, "Hi, may I help you? ;)");
        break;
      case 'hello':
        sendTextMessage(senderID, "Hi, nice to meet you. ;)");
        break;
      case 'bye':
      case 'goodbye':
        sendTextMessage(senderID, "See you ;)");
        break;
      case 'who are you':
      case 'who r u':
        sendSelfImageMessage(senderID);
        break;

      case 'help':
      case 'help me':
      case '?':
        sendHelpMessage(senderID);
        break;
            
      case 'iu':
        sendIUMessage(senderID);
        break;
      case 'how old': //how old am I?
        sendGuessMessage(senderID);
        break;

            
      case 'vision': //Google Vision
      case 'read':
      case 'analysis':
      case 'hashtag':
      case '분석':
      case '👓':
        sendVisionMessage(senderID);
        break;
            
      case 'find': //Google Vision
      case 'web':
      case 'detect':
      case '검색':
      case '🔍':
      case '🔎':
        sendVisionWebMessage(senderID);
        break;

      case 'color':
        sendVisionColorMessage(senderID);
        break;

            
      case '안녕':
      case '똑똑':
        sendTextMessage(senderID, "안녕하세요. 제게 사진을 보여주시면 공유를 도와드리겠습니다.");
        break;
      case '친구':
      case '여자친구':
        sendMessage1(senderID);
        break;
      case '남자친구':
        sendDemo2(senderID);
        break;

      case 'image':
        sendImageMessage(senderID);
        break;

      case 'gif':
        sendGifMessage(senderID);
        break;

      case 'audio':
        sendAudioMessage(senderID);
        break;

      case 'video':
        sendVideoMessage(senderID);
        break;

      case 'file':
        sendFileMessage(senderID);
        break;

      case 'button':
        sendButtonMessage(senderID);
        break;

      case 'generic':
        sendGenericMessage(senderID);
        break;

      case 'receipt':
        sendReceiptMessage(senderID);
        break;

      case 'quick reply':
        sendQuickReply(senderID);
        break;        

      case 'read receipt':
        sendReadReceipt(senderID);
        break;        

      case 'typing on':
        sendTypingOn(senderID);
        break;        

      case 'typing off':
        sendTypingOff(senderID);
        break;        

      case 'account linking':
        sendAccountLinking(senderID);
        break;

      default:
        detectLanguage(messageText, senderID);
        //translateText(messageText, target);
        //sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
      
      var url = "";
      console.log(JSON.stringify(messageAttachments[0]));
      if (messageAttachments[0].payload != null) {
        url = messageAttachments[0].payload.url;
        messageAttachedImages.push(url);
      }
    //sendTextMessage(senderID, "Message with attachment received");
    //sendTextMessage(senderID, url);
    
    //ori
    sendTextMessage(senderID, "I have seen nice picture :D (Queue:"+ messageAttachedImages.length+")");
    //sendTextMessage(senderID, "이 사람은 누구인가요?");
    //sendTextMessage(senderID, "사진에서 1명의 새로운 얼굴을 인식했습니다.");
      console.log("SBPN1 "+messageAttachments);
      console.log("SBPN2 "+url);
      console.log("SBPN3 "+util.inspect(messageAttachments, false, null));
      
      if (url.length > 3) {
        if (url.indexOf('.jpg') || url.indexOf('.jpeg') || url.indexOf('.png') || url.indexOf('.gif')) {
            request(url).pipe(fs.createWriteStream('temp.jpg'));
            console.log("pipe done");
            
    setTimeout(
     function(){
         var messageData = {
    recipient: { id: senderID },
    message: {
      text: "원하시는 정보를 선택해주세요.",
      metadata: "DEVELOPER_DEFINED_METADATA",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Vision",
          "payload":"vision"
        },
        {
          "content_type":"text",
          "title":"Web",
          "payload":"web"
        },
        {
          "content_type":"text",
          "title":"Color",
          "payload":"color"
        }
      ]
    }
  };
  console.log(JSON.stringify(messageData));
  callSendAPI(messageData);
    },2000);
            
            
        }
      }
    /*request(url)
      .pipe(pipeTo)
      .on('finish', function() {
        assert.ok(fs.statSync(pipeTo.path), 'Did not create destination path');
        var source = fs.readFileSync(url).toString();
        var destination = fs.readFileSync(pipeTo.path).toString();
        assert.equal(source, destination);
        console.log("SBPN4 "+pipeTo.path);
      });*/
      
    callFaceAPI('detect', url);
  }
}


function createPerson() {
        //Create a persongroups
        var personGroupId = 'test_group1';
        var url = 'persongroups/'+personGroupId;
        msFace.api(url, 'PUT', {}, {
          name: 'group0',
          userData: 'test group1'
        }, function(error, res, body) {
            console.log("##### BODY " + util.inspect(body, false, null));
            console.log("##### ERR " + util.inspect(error, false, null));
            //console.log("##### RES " + util.inspect(res, false, null));
            /*if(body.statusCode==200) sendTextMessage(senderID, "Good, [Create a persongroups] completed");
            else {
                sendTextMessage(senderID, body.statusCode+", "+body.message);    
                sendTextMessage(senderID, body.error.code+", "+body.error.message);    
            }*/
          return body;
        });
        //Create a person
          //personGroupId = 'test_group1';
        url = 'persongroups/'+personGroupId+'/persons';
        msFace.api(url, 'POST', {}, {
          name: 'person0',
          userData: 'test p1'
        }, function(error, res, body) {
            console.log("##### BODY " + util.inspect(body, false, null));
            console.log("##### ERR " + util.inspect(error, false, null));
            
            body.personId;
            //console.log("##### RES " + util.inspect(res, false, null));
            /*if(body.statusCode==200) sendTextMessage(senderID, "Good, [Create a person] completed");
            else {
                sendTextMessage(senderID, body.statusCode+", "+body.message);    
                sendTextMessage(senderID, body.error.code+", "+body.error.message);    
            }*/
          return body;
        });
          if(facesMS.length > 0) {
              var faceId = facesMS[len-1].faceId;
            url = 'persongroups/'+personGroupId+'/persons';
            msFace.api(url, 'POST', {}, {
              name: 'person0',
              userData: 'test p1'
            }, function(error, res, body) {
                console.log("##### BODY " + util.inspect(body, false, null));
                console.log("##### ERR " + util.inspect(error, false, null));

                body.personId;
                //console.log("##### RES " + util.inspect(res, false, null));
                /*if(body.statusCode==200) sendTextMessage(senderID, "Good, [Create a person] completed");
                else {
                    sendTextMessage(senderID, body.statusCode+", "+body.message);    
                    sendTextMessage(senderID, body.error.code+", "+body.error.message);    
                }*/
              return body;
            });

          }
    
}


/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about 
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
 *
 */
function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
      console.log("Received delivery confirmation for message ID: %s", 
        messageID);
    });
  }

  console.log("All message before %d were delivered.", watermark);
}


/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message. 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 * 
 */
function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  //sendTextMessage(senderID, "Postback called");
  sendTextMessage(senderID, payload + " 공유하겠습니다.");
}

/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 * 
 */
function receivedMessageRead(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  // All messages before watermark (a timestamp) or sequence have been seen.
  var watermark = event.read.watermark;
  var sequenceNumber = event.read.seq;

  console.log("Received message read event for watermark %d and sequence " +
    "number %d", watermark, sequenceNumber);
}

/*
 * Account Link Event
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 * 
 */
function receivedAccountLink(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;

  console.log("Received account link event with for user %d with status %s " +
    "and auth code %s ", senderID, status, authCode);
}

/*
 * Send an image using the Send API.
 *
 */
/* SBPN - add pick */
        function selection(){
            var urls = messageAttachedImages;
            //var res = document.getElementById('result');
            var len = urls.length;
            
            var max = 0;
            var maxImg = "";
            for(var i=0; i<len; i++) {
                var obj = urls[i];
                //obj.style.backgroundColor = colorName;
                //container.innerHTML += "<img src='"+obj.value+"' width='100px'>";
            
                var api = new FacePP('0ef14fa726ce34d820c5a44e57fef470', '4Y9YXOMSDvqu1Ompn9NSpNwWQFHs1hYD');
                api.request('detection/detect', {
                  url: obj.value //'http://cn.faceplusplus.com/static/resources/python_demo/1.jpg'
                }, function(err, result) {
                  if (err) {
                    // TODO handle error
                      console.log('error');
                    return;
                  }
                  // TODO use result
                    var attr = result.face[0].attribute;
                    var age = attr.age.value;
                    var emotion = attr.smiling.value;
                    
                    var score = (100-age) - (emotion>50 ? emotion-50 : 50-emotion); 
                    
                    if(score > max) {
                        max = score;
                        maxImg = obj.value;
                        //document.getElementById('selected').src = maxImg;
                    }
                    //res.innerHTML += "["+score+"] Age: "+age +", Smile: "+ emotion+"<br>";
                });
            }
            //res.innerHTML += max + " = <img src='"+maxImg+"' width='100px'>";

        }


function sendFaceMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };
  callSendAPI(messageData);

    var len = facesMS.length;
    var result = "Sorry? Pandora's box wants over 2 photos ;)"
    if(len > 1 && facesMS[len-2].faceId != null && facesMS[len-1].faceId != null) {
        /*for(var i=0; i<len; i++) {
            facesMS[i].faceId;
        }*/

        msFace.api('verify', 'POST', {}, {
          faceId1: facesMS[len-2].faceId,
          faceId2: facesMS[len-1].faceId
        }, function(error, res, body) {
            console.log(body)
            //facesMS.push(body[0]);
          result = "Similarity between latest photo and previous one, it's "+ body.isIdentical +", I have confidence of "+ body.confidence*100 + "%";
            sendTextMessage(recipientId, result);
        });
    }
    else {
        messageData = {
            recipient: {
              id: recipientId
            },
            message: {
              text: result,
              metadata: "Typing_off"
            }
        };
        callSendAPI(messageData);
    }
}
function sendIUMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };
  callSendAPI(messageData);

    var personGroupId = 'test_group1';
    var personId = '2c0681cb-5d2c-4d10-b287-ab7910c26eb7';
    var len = facesMS.length;
    var result = "FRAS needs new photo for comparison"
    if(len > 0 && !(typeof facesMS[len-1].faceId)) {
        msFace.api('verify', 'POST', {}, {
          faceId: facesMS[len-1].faceId,
          personId: personId,
          personGroupId: personGroupId
        }, function(error, res, body) {
          console.log(body)
          result = "[IU] Similarity between latest photo and 'IU', it seems.. "+ body.isIdentical +", has confidence of "+ body.confidence*100 + "%";
          sendTextMessage(recipientId, result);
        });
    }
    else {
        messageData = {
            recipient: {
              id: recipientId
            },
            message: {
              text: result,
              metadata: "Typing_off"
            }
        };
        callSendAPI(messageData);
    }
}
function sendGuessMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };
  callSendAPI(messageData);
    
    var urls = messageAttachedImages;
    var len = urls.length;
    if(len > 0) {
                var obj = urls[len-1];
                console.log("##### SBPN ##### "+obj); //+FacePP);
                var parameters = {
                    url: obj,
                    attribute: 'gender,age'
                };
                fpp.get('detection/detect', parameters, function(err, res) {
                  if (err) {
                    // TODO handle error
                      console.log('Error from Server response');
                    return;
                  }                    
                    //console.log(res);
                    console.log(util.inspect(res, false, null))
                    // TODO use result
                    var score = 0;
                    if(res.face.length != 0) {
                        var attr = res.face[0].attribute;
                        var age = attr.age.value;
                        var gender = attr.gender.value;
                        var url = res.url;
                      var result = "I guess.. "+ age +" years old and "+ gender + "?";
                      sendTextMessage(recipientId, result);
                    }
                    else sendTextMessage(recipientId, "There is no Face");
                });
    }
    else {
        messageData = {
            recipient: {
              id: recipientId
            },
            message: {
              text: "Show me the face which you want to know how old",
              metadata: "Typing_off"
            }
        };
        callSendAPI(messageData);
    }
}


function sendBookFind(recipientId, text) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };
  callSendAPI(messageData);
    
    console.log(text);
    text = text.replace('책', "");
    console.log(text);
    var book_titles = [];
    var isbn = [];
    var book_elements = [];
    //대출정보
    //var url = "http://data4library.kr/api/srchDtlList?authKey="+d4lkey+"&loaninfoYN=Y&displayInfo=region&isbn13=";
    //도서 키워드
    //var url = "http://data4library.kr/api/keywordList?authKey="+d4lkey+"&additionalYN=Y&isbn13=";
    //동시대출 도서, 추천 도서
    var url = "http://data4library.kr/api/recommandList?authKey="+d4lkey+"&isbn13=";
    
   var api_url = 'https://openapi.naver.com/v1/search/book.xml?query=' + encodeURI(text); // json 결과
   var options = {
       url: api_url,
       headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
   request.get(options, function (error, response, body) {
     if (!error && response.statusCode == 200) {
       //res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
       //res.end(body);

       parser.parseString(body, function(err, result) {
         console.log(result);
         console.error(err);
         //res.json(result);
         //var json = JSON.stringify(result);
         //console.log(json);

         var api_res = result.rss.channel[0];
         console.log(api_res);
         console.log(api_res.total);
         console.log(api_res.item);
                sendTextMessage(recipientId, api_res.total+"권을 찾았습니다.");
           
         if(typeof api_res.item == "undefined") {
            messageData = {
                recipient: {
                  id: recipientId
                },
                message: {
                  text: "Can't find the book. Plz try to find another keyword",
                  metadata: "Typing_off"
                }
            };
            callSendAPI(messageData);
         }
       else {
             var i;
             for (i = 0; i < api_res.item.length; i++) {
               var item = api_res.item[i];
               console.log(item.title);
               console.log(item.author);
               console.log(item.isbn);
                 isbn[i] = item.isbn[0];
                 var title = item.title[0].replace(/<b>/gi,"'");
                 book_titles[i] = title.replace(/<\/b>/gi,"'");
                 
                 messageBookImages.push(item.image[0]);
                 
                 
                 if(i<4) {
                     var newObj = new Object();

                     newObj.title = book_titles[i];
                     newObj.image_url = item.image[0];
                     newObj.subtitle = item.author[0];

                         var defObj = new Object();
                         defObj.type = "web_url";
                         defObj.url = item.link[0];
                         //defObj.messenger_extensions = true;
                         defObj.webview_height_ratio = "tall";
                         //defObj.fallback_url = "http://naver.com";
                     newObj.default_action = defObj;

                     newObj.buttons = new Array();
                         var btnObj = new Object();
                         btnObj.title = "함께 대출한 도서 찾기";
                         btnObj.type = "web_url";
                         btnObj.url = url + item.isbn[0].split(' ')[1];
                         //btnObj.messenger_extensions = true;
                         //btnObj.webview_height_ratio = "tall";
                         //btnObj.fallback_url = "http://naver.com";
                     newObj.buttons.push(btnObj);

                     console.log(JSON.stringify(newObj));
                     book_elements.push(newObj);
                     console.log(JSON.stringify(book_elements));
                 }

             }
       }


       });

     } else {
        messageData = {
            recipient: {
              id: recipientId
            },
            message: {
              text: "Can't use the APIs",
              metadata: "Typing_off"
            }
        };
        callSendAPI(messageData);
     }
   });

    
    
        setTimeout(
            function(){
                //sendBookAllMessage(recipientId);

      messageData = {
            recipient: {
              id: recipientId
            },
            message: {
              attachment: {
                  type: "template",
                  payload: {
                      template_type: "list",
                      top_element_style: "compact",
                      elements: book_elements,
                    buttons: [
                        {
                            title: "View More",
                            type: "postback",
                            payload: "not yet"                        
                        }
                    ]
                }
              }
            }
      };
      console.log("SBPN##################### " + JSON.stringify(messageData));            
      callSendAPI(messageData);
            
            
            },2000);
        setTimeout(
            function(){
                sendTextMessage(recipientId, "※ 10건 이상일 경우 상위 10권만 보여줍니다.");
                console.log(book_titles);
                sendBookButtonMessage(recipientId, "More book info on Data4Lib", book_titles, isbn);
            },7000);
        setTimeout(
            function(){
                messageBookImages = new Array(); //clear
            },10000);
    
}


function sendVisionMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };
  callSendAPI(messageData);
    
    var urls = messageAttachedImages;
    var len = urls.length;
    if(len > 0) {
        var obj = urls[len-1];
        console.log("##### SBPN ##### URL "+obj);
        var result = "I can be seeing";
        var hashtag = "FRAS"
        var labels = new Array();
/***************************************************************/
        //request(obj).pipe(fs.createWriteStream('temp.jpg'));
        // Read the file into memory.
        // Covert the image data to a Buffer and base64 encode it.
        
        setTimeout(
        function(){
        
        //var tmp = fs.readFileSync('temp.jpg');
        //var encoded = new Buffer(tmp).toString('base64');
        //console.log("##### SBPN ##### Base64 "+encoded);
            
//https://vision.googleapis.com/v1/images:annotate?key=            
            
visionClient.detectLabels('temp.jpg')
  .then((results) => {
    labels = results[0];

    console.log('Labels:');
    labels.forEach((label) => {
        console.log(label);
        result += " #"+label.replace(/(\s)/g, "_");
    });
    
    hashtag = labels[0];
    hashtag = hashtag.replace(/(\s*)/g, "");
  })
  .catch((err) => {
    labels[0] = "error";
    console.error('ERROR in Vision :', err);
    console.info(err.errors[0].errors[0]);
    result = JSON.stringify(err.errors[0].errors[0]);
    //result = err;
  });
            
    },100);
/***************************************************************/      
        
        setTimeout(
            function(){
                sendTextMessage(recipientId, result);
                sendTextMessage(recipientId, "http://picbear.com/tag/"+hashtag);
                console.log(result);
                //sendTextMessage(recipientId, "More photos on Insta - https://www.instagram.com/explore/tags/"+hashtag);
                sendButtonMessage2(recipientId, "More photos on Instagram*", labels)
            },3000);
    }
    else {
        messageData = {
            recipient: {
              id: recipientId
            },
            message: {
              text: "Show me any photo which you want to analyze :O",
              metadata: "Typing_off"
            }
        };
        callSendAPI(messageData);
    }
}
function sendVisionWebMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };
  callSendAPI(messageData);
    
    var urls = messageAttachedImages;
    var len = urls.length;
    if(len > 0) {
        var obj = urls[len-1];
        console.log("##### SBPN ##### URL for Vision "+obj);
/***************************************************************/
        //request(obj).pipe(fs.createWriteStream('temp.jpg'));
        // Read the file into memory.
        // Covert the image data to a Buffer and base64 encode it.

    setTimeout(function(){
        //var tmp = fs.readFileSync('temp.jpg');
        //var encoded = new Buffer(tmp).toString('base64');
        //console.log("##### SBPN ##### Base64 "+encoded);
                
// Detect similar images on the web to a local file
visionClient.detectSimilar('temp.jpg')
  .then((data) => {
    var results = data[1].responses[0].webDetection;

    if (results.fullMatchingImages.length > 0) {
      console.log(`Full matches found: ${results.fullMatchingImages.length}`);
      results.fullMatchingImages.forEach((image) => {
        console.log(`  URL: ${image.url}`);
        console.log(`  Score: ${image.score}`);
        //Showing
        var messageData = {
            recipient: { id: recipientId },
            message: {attachment: {type: "image", payload: {
                  url: image.url }}}};
        callSendAPI(messageData);
        sendTextMessage(recipientId, "Full matches "+image.score+"%");
      });
    }

    if (results.partialMatchingImages.length > 0) {
      console.log(`Partial matches found: ${results.partialMatchingImages.length}`);
      results.partialMatchingImages.forEach((image) => {
        console.log(`  URL: ${image.url}`);
        console.log(`  Score: ${image.score}`);
        //Showing
        var messageData = {
            recipient: { id: recipientId },
            message: {attachment: {type: "image", payload: {
                  url: image.url }}}};
        callSendAPI(messageData);
        sendTextMessage(recipientId, "Partial matches "+image.score+"%");
      });
    }
    
    
    setTimeout(function(){
    if (results.webEntities.length > 0) {
      console.log(`Web entities found: ${results.webEntities.length}`);
        
    function compare(a, b) {
        return parseInt(a.score) < parseInt(b.score) ? -1 : parseInt(a.score) > parseInt(b.score) ? 1 : 0;
    }
    results.webEntities.sort(compare);
        
      results.webEntities.forEach((webEntity) => {
        console.log(`  Description: ${webEntity.description}`);
        console.log(`  Score: ${webEntity.score}`);
        sendTextMessage(recipientId, "["+webEntity.score+"] "+webEntity.description);
      });
    }
    },4000);
  });
            },2000);
/***************************************************************/      

    }
    else {
        messageData = {
            recipient: {
              id: recipientId
            },
            message: {
              text: "Show me any photo which you want to analyze :O",
              metadata: "Typing_off"
            }
        };
        callSendAPI(messageData);
    }
}
function sendVisionColorMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };
  callSendAPI(messageData);
    
    var urls = messageAttachedImages;
    var len = urls.length;
    if(len > 0) {
        var obj = urls[len-1];
        console.log("##### SBPN ##### URL for color "+obj);
/***************************************************************/
        //request(obj).pipe(fs.createWriteStream('temp.jpg'));
        // Read the file into memory.
        // Covert the image data to a Buffer and base64 encode it.

    setTimeout(function(){
        /*ColorThief.getColorAsync(obj,function(color, element){
          console.log('async', color, element.src);
          sendTextMessage(recipientId, "["+color+"] "+'rgb('+color[0]+','+color[1]+','+color[2]+')');
        });*/
            },2000);
/***************************************************************/      

    }
    else {
        messageData = {
            recipient: {
              id: recipientId
            },
            message: {
              text: "Show me any photo which you want to analyze :O",
              metadata: "Typing_off"
            }
        };
        callSendAPI(messageData);
    }
}

function sendMessage1(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "총 27장을 전송받았습니다. 어디에 저장할까요?",
      metadata: "DEVELOPER_DEFINED_METADATA",
      quick_replies: [
        {
          "content_type":"text",
          "title":"카메라 앨범",
          "payload":"카메라 앨범"
        },
        {
          "content_type":"text",
          "title":"다운로드 폴더",
          "payload":"다운로드 폴더"
        },
        {
          "content_type":"text",
          "title":"메신저 폴더",
          "payload":"메신저 폴더"
        },
        {
          "content_type":"text",
          "title":"FRAS 폴더",
          "payload":"FRAS 폴더"
        }
      ]
    }
  };
  callSendAPI(messageData);

    setTimeout(
     function(){
 var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "저장을 완료했습니다.",
    }
  };
  callSendAPI(messageData);
         },8000);
}

/* add pick */
function sendPickMessage(recipientId) {
  if(messageAttachedImages.length == 0) {
      sendTextMessage(recipientId, "I have nothing :O please show me your photos");
  }
else {
    
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };
  callSendAPI(messageData);
    
    setTimeout(
     function(){
        var messageData = {
            recipient: {
              id: recipientId
            },
            sender_action: "typing_off"
          };
         callSendAPI(messageData);
   messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "Here you are! Do you like this? :)",
      metadata: "DEVELOPER_DEFINED_METADATA",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Like it!",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
        },
        {
          "content_type":"text",
          "title":"So so",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY"
        },
        {
          "content_type":"text",
          "title":"Retry",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA"
        }
      ]
    }
       /*message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Here you are! Do you like this?",
          buttons:[{
            type: "postback",
            title: "Like it!",
            payload: "DEVELOPED_DEFINED_PAYLOAD"
          }, {
            type: "postback",
            title: "Retry",
            payload: "DEVELOPED_DEFINED_PAYLOAD"
          }, {
            type: "web_url",
            url: "https://www.messenger.com/t/facechatbot/",
            title: "Open Web URL"
          }]
        }
      }
    } */
  };  

  callSendAPI(messageData);         
     },8000);

    var asyncfunction = function(param){
      return new Promise(function(resolved,rejected){
          
          var urls = param;
          var len = urls.length;
          
          /*if(len == 0) {
            var messageData = {
                recipient: {
                  id: recipientId
                },
                sender_action: "typing_off"
              };
             callSendAPI(messageData);

              sendTextMessage(recipientId, "Please send me your photos");
              rejected("Please send me your photos");
          }*/
            
            var max = 0;
            var maxImg = "";
            for(var i=0; i<len; i++) {
                var obj = urls[i];
                //container.innerHTML += "<img src='"+obj.value+"' width='100px'>";
                console.log("##### SBPN ##### "+obj); //+FacePP);
                maxImg = obj;
                
                var parameters = {
                    url: obj
                    //attribute: 'gender,age'
                };
                fpp.get('detection/detect', parameters, function(err, res) {
                  if (err) {
                    // TODO handle error
                      console.log('Error from Server response');
                    return;
                  }                    
                    //console.log(res);
                    console.log(util.inspect(res, false, null))
                    // TODO use result
                    var score = 0;
                    if(res.face.length != 0) {
                        var attr = res.face[0].attribute;
                        var age = attr.age.value;
                        var emotion = attr.smiling.value;
                        var url = res.url;

                        score = (100-age) - (emotion>50 ? emotion-50 : 50-emotion); 
                    }
                    else score = 0;
                    
                    if(score > max) {
                        max = score;
                        maxImg = url;
                        
                        console.log("##### Result ##### ["+i+"] Max score "+max+" Img:"+ maxImg);
                        //document.getElementById('selected').src = maxImg;
                    }

                });
            }
            //res.innerHTML += max + " = <img src='"+maxImg+"' width='100px'>";
            //return maxImg;
          
           setTimeout(
                 function(){
                     console.log("##### PICKED ##### " + maxImg);
                     var messageData = {
                        recipient: {
                          id: recipientId
                        },
                        message: {
                          attachment: {
                            type: "image",
                            payload: {
                              url: maxImg
                            }
                          }
                        }
                      };          
                   console.log(util.inspect(messageData, false, null));
                       resolved(messageData);
                 },5000);
      });

    }

    var promise = asyncfunction(messageAttachedImages);
    promise.then(callSendAPI);

    
        function selection(){
            var urls = messageAttachedImages;
            //var res = document.getElementById('result');
            var len = urls.length;
            
            var max = 0;
            var maxImg = "";
            for(var i=0; i<len; i++) {
                var obj = urls[i];
                //container.innerHTML += "<img src='"+obj.value+"' width='100px'>";
                console.log("##########SBPN - "+obj); //+FacePP);
                //var FacePP = FacePP;
                
                var parameters = {
                    url: obj
                    //attribute: 'gender,age'
                };
                fpp.get('detection/detect', parameters, function(err, res) {
                  if (err) {
                    // TODO handle error
                      console.log('Error from Server response');
                    return;
                  }                    
                    //console.log(res);
                    console.log(util.inspect(res, false, null))
                    // TODO use result
                    var attr = res.face[0].attribute;
                    var age = attr.age.value;
                    var emotion = attr.smiling.value;
                    
                    var score = (100-age) - (emotion>50 ? emotion-50 : 50-emotion); 
                    
                    if(score > max) {
                        max = score;
                        maxImg = obj;
                        //document.getElementById('selected').src = maxImg;
                    }

                });
            }
            //res.innerHTML += max + " = <img src='"+maxImg+"' width='100px'>";
            return maxImg;
        }
    
    }
  /*
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: maxImg
        }
      }
    }
  }; 

  callSendAPI(messageData);
  */
}
function sendAllMessage(recipientId) {
    var len = messageAttachedImages.length;
    if(len>0) {
        sendTextMessage(recipientId, "Let me see..");
        for(var i=0; i<len; i++) {
          var messageData = {
            recipient: {
              id: recipientId
            },
            message: {
              attachment: {
                type: "image",
                payload: {
                  url: messageAttachedImages[i]
                }
              }
            }
          };
          callSendAPI(messageData);
        }
    }
    else sendTextMessage(recipientId, "Nothing");

}
function sendBookAllMessage(recipientId) {
    var len = messageBookImages.length;
    if(len>0) {
        sendTextMessage(recipientId, "Let me see..");
        for(var i=0; i<len; i++) {
          var messageData = {
            recipient: {
              id: recipientId
            },
            message: {
              attachment: {
                type: "image",
                payload: {
                  url: messageBookImages[i]
                }
              }
            }
          };
          callSendAPI(messageData);
        }
    }
    else sendTextMessage(recipientId, "Nothing");
}

function sendSelfImageMessage(recipientId) {
    var arr = ["bot.jpg","b1.gif","b2.gif","b3.gif"]
    var start=1;
    var end=3;
    var rand = Math.floor((Math.random() * (end-start+1)) + start);
    
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: SERVER_URL + "/assets/" + arr[rand]
        }
      }
    }
  };

    arr = ["bot.jpg",
               "I am your secretary for photo management, like alter ego. ;) I am trying to read your needs.",
               "Who am I? :O Let me know-",
               "I'm your intelligent friend :D"]
  callSendAPI(messageData);
    sendTextMessage(recipientId, arr[rand]);
}
function sendClearMessage(recipientId) {
    messageAttachedImages = new Array();
    sendTextMessage(recipientId, "I have forgotten all my memories. T_T Could you resend your photo? :O");
}
function sendHelpMessage(recipientId) {
    sendTextMessage(recipientId, "First of all, send me your photos and next,");
    sendTextMessage(recipientId, "you can say command including 'pick', 'clear/reset', 'all/show me', 'clear/reset', 'face/compare' or 'IU'. Plus, 'how old', 'vision/read/hashtag/analysis/분석', 'find/web/detect/검색', and so on. :D");
    sendTextMessage(recipientId, "'IU' will compare between your photo and the face of IU who is famous Korean singer.");
}
function sendImageMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: SERVER_URL + "/assets/rift.png"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a Gif using the Send API.
 *
 */
function sendGifMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: SERVER_URL + "/assets/instagram_logo.gif"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send audio using the Send API.
 *
 */
function sendAudioMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "audio",
        payload: {
          url: SERVER_URL + "/assets/sample.mp3"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a video using the Send API.
 *
 */
function sendVideoMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "video",
        payload: {
          url: SERVER_URL + "/assets/allofus480.mov"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a video using the Send API.
 *
 */
function sendFileMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "file",
        payload: {
          url: SERVER_URL + "/assets/test.txt"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a text message using the Send API.
 *
 */
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      metadata: "DEVELOPER_DEFINED_METADATA"
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a button message using the Send API.
 *
 */
function sendButtonMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "This is test text",
          buttons:[{
            type: "web_url",
            url: "https://www.oculus.com/en-us/rift/",
            title: "Open Web URL"
          }, {
            type: "postback",
            title: "Trigger Postback",
            payload: "DEVELOPED_DEFINED_PAYLOAD"
          }, {
            type: "phone_number",
            title: "Call Phone Number",
            payload: "+16505551234"
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}



function sendButtonMessage2(recipientId, argText, labels) {
    var result = "";
    var argUrl = new Array();
    var hashtags = new Array();
    
    var url = "https://www.instagram.com/explore/tags/";
    var i=0;
    labels.forEach((label) => {
        console.log(label);
        argUrl[i] = label.replace(/(\s)/g, "_");
        //result += " #"+argUrl[i++];
        
        var hashtag = new Object();
        hashtag.type = "web_url";
        hashtag.url = url + argUrl[i];
        hashtag.title = "#"+argUrl[i];
        hashtag.webview_height_ratio = "tall";
        hashtags.push(hashtag);
        console.log("hashTag " + hashtags);
        i++;

        if(i%3==0) {
            console.log(i);
          var messageData = {
            recipient: {
              id: recipientId
            },
            message: {
              attachment: {
                type: "template",
                payload: {
                  template_type: "button",
                  text: argText,
                  buttons: hashtags
                }
              }
            }
          };
          callSendAPI(messageData);
            
          //reset
          hashtags = new Array();
        }
    });
    console.log("All done Tag " + JSON.stringify(hashtags));
    
      var messageData = {
        recipient: {
          id: recipientId
        },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "button",
              text: argText,
              buttons: hashtags
            }
          }
        }
      };
      callSendAPI(messageData);    

}


function sendBookButtonMessage(recipientId, argText, titles, labels) {
    var result = "";
    var argUrl = new Array();
    var hashtags = new Array();
    
    //대출정보
    //var url = "http://data4library.kr/api/srchDtlList?authKey="+d4lkey+"&loaninfoYN=Y&displayInfo=region&isbn13=";
    var noti = "도서 키워드"
    var url = "http://data4library.kr/api/keywordList?authKey="+d4lkey+"&additionalYN=Y&isbn13=";
    //동시대출 도서, 추천 도서
    //var url = "http://data4library.kr/api/recommandList?authKey="+d4lkey+"&isbn13=";

    setTimeout(
        function(){
        sendTextMessage(recipientId, "선택하면 "+noti+"를 확인할 수 있습니다.");
        },5000);
    
    var i=0;
    labels.forEach((label) => {
        console.log(label);
        argUrl[i] = label.split(' ')[1];
        
        var hashtag = new Object();
        hashtag.type = "web_url";
        hashtag.url = url + argUrl[i];
        hashtag.title = titles[i]+" ISBN"+argUrl[i];
        hashtag.webview_height_ratio = "compact";
        hashtags.push(hashtag);
        console.log("hashTag " + hashtags);
        i++;

        if(i%3==0) {
            console.log(i);
          var messageData = {
            recipient: {
              id: recipientId
            },
            message: {
              attachment: {
                type: "template",
                payload: {
                  template_type: "button",
                  text: argText,
                  buttons: hashtags
                }
              }
            }
          };
          callSendAPI(messageData);
            
          //reset
          hashtags = new Array();
        }
    });
    console.log("All done Tag " + JSON.stringify(hashtags));
    
      var messageData = {
        recipient: {
          id: recipientId
        },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "button",
              text: argText,
              buttons: hashtags
            }
          }
        }
      };
      callSendAPI(messageData);
}



/*
 * Send a Structured Message (Generic Message type) using the Send API.
 *
 */
function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",               
            image_url: SERVER_URL + "/assets/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",               
            image_url: SERVER_URL + "/assets/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

/*
 * Send a receipt message using the Send API.
 *
 */
function sendReceiptMessage(recipientId) {
  // Generate a random receipt ID as the API requires a unique ID
  var receiptId = "order" + Math.floor(Math.random()*1000);

  var messageData = {
    recipient: {
      id: recipientId
    },
    message:{
      attachment: {
        type: "template",
        payload: {
          template_type: "receipt",
          recipient_name: "Peter Chang",
          order_number: receiptId,
          currency: "USD",
          payment_method: "Visa 1234",        
          timestamp: "1428444852", 
          elements: [{
            title: "Oculus Rift",
            subtitle: "Includes: headset, sensor, remote",
            quantity: 1,
            price: 599.00,
            currency: "USD",
            image_url: SERVER_URL + "/assets/riftsq.png"
          }, {
            title: "Samsung Gear VR",
            subtitle: "Frost White",
            quantity: 1,
            price: 99.99,
            currency: "USD",
            image_url: SERVER_URL + "/assets/gearvrsq.png"
          }],
          address: {
            street_1: "1 Hacker Way",
            street_2: "",
            city: "Menlo Park",
            postal_code: "94025",
            state: "CA",
            country: "US"
          },
          summary: {
            subtotal: 698.99,
            shipping_cost: 20.00,
            total_tax: 57.67,
            total_cost: 626.66
          },
          adjustments: [{
            name: "New Customer Discount",
            amount: -50
          }, {
            name: "$100 Off Coupon",
            amount: -100
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a message with Quick Reply buttons.
 *
 */
function sendQuickReply(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "What's your favorite movie genre?",
      metadata: "DEVELOPER_DEFINED_METADATA",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Action",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
        },
        {
          "content_type":"text",
          "title":"Comedy",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY"
        },
        {
          "content_type":"text",
          "title":"Drama",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA"
        }
      ]
    }
  };

  callSendAPI(messageData);
}
function sendDemo2(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "오늘의 사진 중 [남자친구]가 나온 사진을 27장 발견했습니다. 어떻게 공유할까요?",
          buttons:[{
            type: "postback",
            title: "나 빼고",
            payload: "나 빼고"
          }, {
            type: "postback",
            title: "[남자친구]만",
            payload: "[남자친구]만"
          }, {
            type: "postback",
            title: "모두 보냄",
            payload: "모두 보냄"
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);

    setTimeout(
        
    function(){
        
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: SERVER_URL + "/assets/selected.png"
        }
      }
    }
  };
  callSendAPI(messageData);
 sendTextMessage(recipientId, "다음 17장의 사진을 공유합니다.");
    
    
    setTimeout(
     function(){
         var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "전송할까요?",
      metadata: "DEVELOPER_DEFINED_METADATA",
      quick_replies: [
        {
          "content_type":"text",
          "title":"예",
          "payload":"예"
        },
        {
          "content_type":"text",
          "title":"아니요",
          "payload":"아니요"
        }
      ]
    }
  };
    
  callSendAPI(messageData);
    },3000);
    
        
    setTimeout(
     function(){
         sendTextMessage(recipientId, "17장 공유를 완료했습니다.");
         
         setTimeout(
     function(){
         
   var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "앞으로도 [남자친구] 사진이 보이면 자동으로 공유할까요?",
      metadata: "DEVELOPER_DEFINED_METADATA",
      quick_replies: [
        {
          "content_type":"text",
          "title":"예",
          "payload":"예"
        },
        {
          "content_type":"text",
          "title":"아니요",
          "payload":"아니요"
        }
      ]
    }
  };

  callSendAPI(messageData);
                               setTimeout(
                                    function(){
                                         var messageData = {
                                            recipient: {
                                              id: recipientId
                                            },
                                            message: {
                                              text: "[남자친구] 사진은 항상 [남자친구]에게 자동으로 공유되도록 설정했습니다.",
                                            }
                                          };
                                          callSendAPI(messageData);
                                },5000);
         },4000);
         
         
     },10000);
    },5000);
}
function sendDemo3(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "오늘 찍은 사진 중 [남자친구]가 나온 사진을 27장 발견했습니다. 어떻게 공유할까요?",
      metadata: "DEVELOPER_DEFINED_METADATA",
      quick_replies: [
        {
          "content_type":"text",
          "title":"[남자친구]만 나온 사진",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
        },
        {
          "content_type":"text",
          "title":"내가 나온 사진은 제외하고",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY"
        },
        {
          "content_type":"text",
          "title":"나와 [남자친구] 사진 모두",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA"
        }
      ]
    }
  };

  callSendAPI(messageData);
}


/*
 * Send a read receipt to indicate the message has been read
 *
 */
function sendReadReceipt(recipientId) {
  console.log("Sending a read receipt to mark message as seen");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "mark_seen"
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(recipientId) {
  console.log("Turning typing indicator on");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator off
 *
 */
function sendTypingOff(recipientId) {
  console.log("Turning typing indicator off");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
  };

  callSendAPI(messageData);
}

/*
 * Send a message with the account linking call-to-action
 *
 */
function sendAccountLinking(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Welcome. Link your account.",
          buttons:[{
            type: "account_link",
            url: SERVER_URL + "/authorize"
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}


function callFaceAPI(type, faceData) {
    msFace.api(type, 'POST', {}, {
      url: faceData
    }, function(error, res, body) {
        console.log("MS Face - BODY " + body)
        
        //body.length?
        facesMS.push(body[0]);
        
      return body;
    });
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 *
 */
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s", 
          messageId, recipientId);
      } else {
      console.log("Successfully called Send API for recipient %s", 
        recipientId);
      }
    } else {
      console.error(response.error);
    }
  });  
}

// Start server
// Webhooks must be available via SSL with a certificate signed by a valid 
// certificate authority.
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;
