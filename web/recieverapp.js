devMode = false;
var blueScore;
var redScore;
function init(words){
  var nRows = 5;
  var nCols = 5;
  let grid = document.querySelector("#chromeGrid")
  grid.innerHTML="";
  document.querySelector("#bounceTxt").innerHTML="";
  document.querySelector("#startInfo").innerHTML="";
  var types =["default", "red", "blue", "bomb", "default"]
  for(let i =0; i<nRows; i++){
    let r = document.createElement("div");
    r.className = "row";
    for(let j =0; j<nCols; j++){   
      type = "default"
      if(devMode){
      let index = Math.floor(Math.random()*types.length)
      type = types[index]  
      } 
      let b = document.createElement("div");  
      b.innerHTML = words[(nCols*j)+i];
      b.className = "chromeButton " + type;
      b.id = (nCols*j)+i;
      r.appendChild(b);
      }
      grid.appendChild(r);
    }
    
  } 
  const context = cast.framework.CastReceiverContext.getInstance();
  options = new cast.framework.CastReceiverOptions();
  options.disableIdleTimeout = true;
  context.addCustomMessageListener('urn:x-cast:ch.cimnine.chromecast-cryptowords.text', function (customEvent) {
    console.log(customEvent.data)
    if (customEvent.data.type == "message") {
      if(customEvent.data.text.split(":")[0]=="init"){
        words =customEvent.data.text.split(":");
        if(words[1] == "blue"){
          redScore = 8
          blueScore = 9
        }else if(words[1] == "red"){
          redScore = 9
          blueScore = 8
        }
        document.querySelector("#scorePanel").className = ""
        updateScore();    
        words.splice(0, 2);
        console.log(words);
        if(words.length >= 24){
          init(words);
        }else{
          init(randomizeWords())
        }
        
      }else if(customEvent.data.text.split(":")[0]=="score"){
        if(customEvent.data.text.split(":")[1]=="blue"){
          blueScore--;
        }else if(customEvent.data.text.split(":")[1]=="red"){
          redScore--;
        }
        updateScore();

      }else{
        let data = customEvent.data.text.split(":");
        let b = document.getElementById(data[0]);
        b.className = "chromeButton " + data[1];
        if(data[1] == "white"){
        b.style.opacity = 0.5
        }

      }
    }
  });
  context.start(options);

  if(devMode){
    init(randomizeWords());
    document.querySelector("#scorePanel").className = ""
  }

  function updateScore(){
    document.querySelector("#redScore").innerHTML = redScore;
    document.querySelector("#blueScore").innerHTML = blueScore;
  }
  function randomizeWords(){
  const words = ["Apa", "Stjärna", "Banan", "Lejon", "Tavla", 
                 "Dator", "Gran", "Ek", "Ljus", "Fågel", "Dag",
                 "Tid", "Pengar", "Grön","Slant", "Moln", "Tall",
                 "Röd", "Spöke", "Död", "Gris", "Bommull","Fjällen",
                 "Rasta", "Vulkan", "Mammut", "Vinter", "Fläkt", "Soffa",
                 "Fåtölj", "Ström", "Snöre", "Ring", "Troll", "Sverige",
                 "Norden", "Europa", "Afrika", "USA", "Asien", "Sydamerika",
                 "Australien", "Italien", "Frankrike", "Spanien", "Tyskland",
                 "Tiger", "Örn", "Mås", "Dräkt", "Hjälte", "Yxa", "Lampa",
                 "Mus", "Knapp", "Skål", "Klubba", "Kula", "Boll", "Ren",
                 "Blad", "Brun", "Brasa", "Ved", "Snö", "Alperna", "Vas",
                 "Kruka", "Träd", "Matta", "Får", "Kor", "Häst", "Säng",
                 "Film", "Skor", "Kung", "Huvud", "Vagn", "Jul", "Katt",
                 "Hund", "Vatten", "Is", "Kudde", "Klot", "Bord", "Gren",
                 "Hus", "Telefon", "Spel", "Sjukdom", "Läkare", "Honung",
                 "Mjölk", "Kaffe", "Te", "Choklad", "Godis", "Päron", "Äpple",
                 "Apelsin", "Rymd", "Planet", "Mars", "Saturnus", "Jupiter",
                 "Bil", "Tåg", "Flygplan", "Båt", "Fisk", "Mål", "Lov",
                 "Get", "Ost", "Pall", "Stol", "Sol", "Etikett", "Pluto",
                 "Neptunus", "Utomjording", "Berg", "Hav", "Öken", "Dal",
                 "Golv", "Sten", "Fönster", "Pool", "Rom", "Stockholm",
                 "Kina", "Äng", "Skog", "Gräs", "Djungel", "Sand", "Orm",
                 "Spindel", "Piska", "Kniv", "Svärd", "Gubbe", "Häxa",
                 "Magi", "Arm", "Ben", "Finger", "Mage", "Fot", "Hand",
                 "Bagare", "Ask", "Låda", "Kista", "Bär", "Blåbär", "Jordgubbe",
                 "Fika", "Blomma", "Bok", "Buss", "Butik", "Chaufför", "Cigarett",
                 "Citron", "Lime", "Dörr", "Dusch", "Duk", "Elev", "Fabrik",
                 "Far", "Flaska", "Fluga", "Frukost", "Lunch", "Middag",
                 "Frys" , "Kylskåp", "Gaffel", "Glass", "Grönsak", "Gurka",
                 "Hamn", "Hatt", "Högtalare", "Hylla", "Kaka", "Bulle", "Kamera",
                 "Karta", "Källare", "Klocka", "Skiva", "Blixt", "Kran",
                 "Krona", "Kopp", "Lägenhet", "Lärare", "Läxa", "Lök",
                 "Lucka", "Madrass", "Maskin", "Mössa", "Vantar", "Möbel",
                 "Medicin"];

               
  const randomWords = [];
  for(let i=0; i<25; i++){
    while(true){
      let randomIndex = Math.floor(Math.random()*words.length);
      let word = words[randomIndex];
      if(randomWords.includes(word)){
        continue;
      }
      randomWords.push(word)
      break;
    } 
  }
  return randomWords;
}
var myText = document.getElementById("bounceTxt").innerHTML,
  wrapText = "";

for (var i=0; i<myText.length; i++) {
   wrapText += "<em>" + myText.charAt(i) + "</em>";
}
document.getElementById("bounceTxt").innerHTML = wrapText;

var myLetters = document.getElementsByTagName("em"),
  j = 0;

function applyBounce() {
   setTimeout(function() {
        myLetters[j].className = "bounce-me";
        j++;
        
        if (j < myLetters.length) {
             applyBounce();
        }
   }, 250);
}

applyBounce();