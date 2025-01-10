// import { channel } from "@/constants/Cast";
// import { Button } from "react-native";
// import { useCastChannel } from "react-native-google-cast";

// export function Start() {
//   const channel = useCastChannel("urn:x-cast:ch.cimnine.chromecast-cryptowords.text");

//   const payload = {
//     red: 9,
//     blue: 8,
//     grid: [
//       { word: "hello", color: "red" },
//       { word: "world", color: "blue" },
//       { word: "apple", color: "red" },
//       { word: "banana", color: "blue" },
//       { word: "cherry", color: "red" },
//       { word: "date", color: "blue" },
//       { word: "fig", color: "red" },
//       { word: "grape", color: "bomb" },
//       { word: "kiwi", color: "red" },
//       { word: "lemon", color: "white" },
//       { word: "mango", color: "red" },
//       { word: "nectarine", color: "blue" },
//       { word: "orange", color: "red" },
//       { word: "papaya", color: "unknown" },
//       { word: "quince", color: "red" },
//       { word: "raspberry", color: "blue" },
//       { word: "strawberry", color: "red" },
//       { word: "tangerine", color: "blue" },
//       { word: "ugli", color: "red" },
//       { word: "vanilla", color: "blue" },
//       { word: "watermelon", color: "red" },
//       { word: "xigua", color: "blue" },
//       { word: "yellow", color: "red" },
//       { word: "zucchini", color: "blue" },
//       { word: "green", color: "red" },
//       { word: "corn", color: "blue" },
//     ],
//   };

//   const onStart = () => {
//     if (!channel) {
//       return;
//     }
//     channel.sendMessage({ type: "update", payload: payload});
//   };

//   return <Button title="Start" onPress={onStart} />;
// }
