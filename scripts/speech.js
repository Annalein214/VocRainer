var SYNTH = window.speechSynthesis;
var VOICE_DE;
var VOICE_JP;
var VOICE_EN;

function voiceList() {
  voices = SYNTH.getVoices().sort(function (a, b) {
      const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
      if ( aname < bname ) return -1;
      else if ( aname == bname ) return 0;
      else return +1;
  });
  for(i = 0; i < voices.length ; i++) {
    if (voices[i].lang.includes("DE")){
        console.log("SPEECH: Voices: ",voices[i].name,  voices[i].lang);
        // "Anna" – "de-DE"
        VOICE_DE=voices[i];
    }
        // "Kyoko" – "ja-JP"
    else if (voices[i].lang.includes("JP")){
        console.log("SPEECH: Voices: ",voices[i].name,  voices[i].lang);
        // "Anna" – "de-DE"
        VOICE_JP=voices[i];
    }
    else if (voices[i].lang.includes("en-GB")){
        console.log("SPEECH: Voices: ",voices[i].name,  voices[i].lang);
        // "Anna" – "de-DE"
        VOICE_EN=voices[i];
    }
    // else console.log("SPEECH: Voices: ",voices[i].name,  voices[i].lang);

  }
}

voiceList();


function speak(text, language){
    /* seems not to be an issue
    if (SYNTH.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }*/
    if (text !== '') {
      var utterThis = new SpeechSynthesisUtterance(text);
      utterThis.onend = function (event) {
          console.log('SPEECH: SpeechSynthesisUtterance.onend');
      }
      utterThis.onerror = function (event) {
          console.error('SPEECH: SpeechSynthesisUtterance.onerror', event);
      }
      switch (language){
        case "de":
            utterThis.voice = VOICE_DE;
            break;
        case "jp":
            utterThis.voice = VOICE_JP;
            break;
        case "en":
        default:
            utterThis.voice = VOICE_EN;
            break;
      }
      utterThis.pitch = 1; // tonhoehe
      utterThis.rate = 1; // geschwindigkeit
      SYNTH.speak(utterThis);
    }
}

//speak("Dies ist ein Test.", "de");
//speak("おげんきですか。いい、げんきです", "jp");
