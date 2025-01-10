import { useCastChannel } from "react-native-google-cast";
import { FlatList, Dimensions } from "react-native";
import React from "react";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { cn } from "@/lib/utils";

export function Grid() {
  const channel = useCastChannel(
    "urn:x-cast:ch.cimnine.chromecast-cryptowords.text"
  );

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

  const defaultCells = [
    { word: "Apple", type: "red", shown: false },
    { word: "Blue", type: "blue", shown: false },
    { word: "River", type: "red", shown: false },
    { word: "Sun", type: "blue", shown: false },
    { word: "Mountain", type: "neutral", shown: false },
    { word: "Circle", type: "blue", shown: false },
    { word: "Glass", type: "red", shown: false },
    { word: "Forest", type: "blue", shown: false },
    { word: "Cloud", type: "red", shown: false },
    { word: "Stone", type: "neutral", shown: false },
    { word: "Night", type: "red", shown: false },
    { word: "Star", type: "blue", shown: false },
    { word: "Shadow", type: "red", shown: false },
    { word: "Light", type: "blue", shown: false },
    { word: "Wave", type: "bomb", shown: false },
    { word: "Earth", type: "neutral", shown: false },
    { word: "Fire", type: "red", shown: false },
    { word: "Wind", type: "blue", shown: false },
    { word: "Sky", type: "red", shown: false },
    { word: "Tree", type: "blue", shown: false },
    { word: "Flower", type: "neutral", shown: false },
    { word: "Bridge", type: "blue", shown: false },
    { word: "Storm", type: "red", shown: false },
    { word: "Gold", type: "neutral", shown: false },
    { word: "Bird", type: "red", shown: false },
  ];

  const [cells, setCells] = React.useState(defaultCells);

  const onPress = (cell: typeof cells[0]) => {
    const newCells = cells.map((c) => {
      if (c === cell) {
        return { ...c, shown: true };
      }
      return c;
    });

    setCells(newCells); // Update local state

    if (!channel) {
      return;
    }

    channel.sendMessage({ type: "update", payload: newCells });
  };

  const screenWidth = Dimensions.get("window").width;

  return (
    <FlatList
      numColumns={5}
      style={{ width: "100%" }} // Ensures it spans the full width of the screen
      data={cells}
      renderItem={({ item, index }) => (
        <Button
          key={index}
          onPress={() => onPress(item)}
          className={cn(
            "rounded-lg aspect-square p-0! relative"  
          )}
          style={{
            padding: 0,
            backgroundColor: getColor(item.type),
            width: screenWidth / 5 - 2 , // Adjust card width for spacing
            margin: 1,
          }}
        >
          <Text className="text-white  text-center " numberOfLines={1} style={{
            width: screenWidth / 5 - 2,
            fontSize: 11,
            fontWeight: "bold",
          }}>{item.word}</Text>
        </Button>
      )}
    />
  );
}
