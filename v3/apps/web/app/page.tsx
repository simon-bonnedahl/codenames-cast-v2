"use client";

import Image, { type ImageProps } from "next/image";
import { Button } from "@repo/ui/button";
import styles from "./page.module.css";
import React, { useEffect } from "react";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};

export default function Home() {
  const [message, setMessage] = React.useState("");
  const [cells, setCells] = React.useState([]);
  const [context , setContext] = React.useState(null);

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
    const checkCast = () => {
      if (window.cast && window.cast.framework) {
        const c = window.cast.framework.CastReceiverContext.getInstance();
        const options = new window.cast.framework.CastReceiverOptions();
        options.disableIdleTimeout = true;
        c.addCustomMessageListener(
          "urn:x-cast:ch.cimnine.chromecast-cryptowords.text",
          (customEvent:any) => {
            console.log("Received message:", customEvent.data);
            const { type, payload } = customEvent.data;
            if (type === "update") {
              setMessage("Update:" + JSON.stringify(payload));
              setCells(payload);
            }
          }
        );
        c.start(options);
        setContext(c);
      } else {
        // Retry after a short delay
        setTimeout(checkCast, 100);
      }
    };
  
    checkCast();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* <p>Message received: {message}</p> */}
      <p>Cells: {JSON.stringify(cells)}</p>

      {/* 5x5 grid */}
      {/* <div className="grid grid-cols-5 gap-4 mt-6">
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
      </div> */}
    </div>
  );
}
