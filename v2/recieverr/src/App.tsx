import React, { useEffect } from "react";

const App: React.FC = () => {
  const [message, setMessage] = React.useState("");
  const [cells, setCells] = React.useState([]);

  const getColor = (type: string) => {
    switch (type) {
      case "red":
        return "#e96057";
      case "blue":
        return "#63bdee";
      case "neutral":
        return "#ccc1b1";
      case "bomb":
        return "#363532";
      default:
        return "white";
    }
  };

  useEffect(() => {
    try {
      const context = cast.framework.CastReceiverContext.getInstance();
      const options = new cast.framework.CastReceiverOptions();
      options.disableIdleTimeout = true;
      context.addCustomMessageListener(
        "urn:x-cast:ch.cimnine.chromecast-cryptowords.text",
        function (customEvent: any) {
          console.log("Received message:", customEvent.data);
          // setMessage(JSON.stringify(customEvent.data));
          const { type, payload } = customEvent.data;
          if (type === "update") {
            // setPrevious(message);
            setMessage("Update:" + JSON.stringify(payload));
            setCells(payload);
           

          }
        }
      );
      context.start(options);
    } catch (error: any) {
      console.error("Cast SDK not loaded");
      console.error(error);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* <p>Message received: {message}</p> */}
      {/* <p>Cells: {cells.toString()}</p> */}

      {/* 5x5 grid */}
      <div className="grid grid-cols-5 gap-4 mt-6">
        {cells?.map((cell, index) => {
       
          return (
            <div
              key={index}
              className={`flex items-center justify-center w-20 h-20 border border-gray-400 rounded shadow text-black `}
              style={{ backgroundColor: cell.shown  ? getColor(cell.typecd)  : "white"}}
              
            >
              {cell.word}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
