
  
  initializeCastApi = function() {
    const context = cast.framework.CastContext.getInstance();
    context.setOptions({
      receiverApplicationId: '028EB7E8',
      autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
    });
    
    const options = new cast.framework.CastReceiverOptions();

    options.disableIdleTimeout = true;
    context.start(options);
  };

  window['__onGCastApiAvailable'] = function(isAvailable) {
    if (isAvailable) {
      initializeCastApi();
    }
  };

  function sendData(id, className){
    console.log(id + ":" + className)
    sendText(id + ":" + className);
    document.getElementById(id).style.border = "3px solid rgb(30, 30, 30";
    document.getElementById(id).style.opacity = 0.7;
  }

  function send() {
    var textEl = document.getElementById("text");
    sendText(textEl.value);
  }

  function sendInit(){
    let text = "init"
    let words = randomizeWords();
    for(word of words){
      text+= " " + word;
    }
    sendText(text);
    init(words);
  }
  function sendText(txt) {
    var castSession = cast.framework.CastContext.getInstance().getCurrentSession();
    if (castSession) {
      castSession.sendMessage('urn:x-cast:ch.cimnine.cromecast-test.text', {
        type: "message",
        text: txt
      });
    }
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
  function init(words){
      if(Math.random() > 0.5 ){
        var redButtons = 9;
        var blueButtons = 8;
      }else{
        var redButtons = 8;
        var blueButtons = 9;
      }
      var whiteButtons = 7;
  
      var nRows = 5;
      var nCols = 5;
      let grid = document.querySelector("#testGrid");
      
      grid.innerHTML = "";
      for(let i =0; i<nRows; i++){
        let r = document.createElement("div");
        r.className = "row";
        for(let j =0; j<nCols; j++){       
          let b = document.createElement("button");
          b.id = (nCols*i)+j;
          b.innerHTML = words[(nCols*i)+j];

          
          b.addEventListener("click", ()=> {sendData(b.id, b.className.split(" ")[1])})   
          r.appendChild(b);
        }
        grid.appendChild(r);
      }
    let buttons = document.querySelectorAll("button");
    let buttonList = Array.prototype.slice.call(buttons)
    buttonList.sort(() => Math.random() - 0.5);
    for(button of buttonList){

      if(blueButtons > 0){
        button.className = "webButton blue";
        blueButtons--;
      }else if(redButtons > 0){
        button.className = "webButton red";
        redButtons--;
      }else if(whiteButtons >0){
        button.className = "webButton white";
        whiteButtons--;
      }else{
        button.className = "webButton bomb";
      }
      
    }
    }

  init(randomizeWords());