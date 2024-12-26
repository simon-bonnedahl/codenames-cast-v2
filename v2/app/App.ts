import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { CastButton, GoogleCast } from 'react-native-google-cast';

const App = () => {
  const [grid, setGrid] = useState([
    { word: 'Tree', color: null },
    { word: 'River', color: null },
    { word: 'Mountain', color: null },
    { word: 'Ocean', color: null },
    { word: 'Sun', color: null },
    { word: 'Moon', color: null },
    { word: 'Star', color: null },
    { word: 'Sky', color: null },
    { word: 'Earth', color: null },
    { word: 'Cloud', color: null },
  ]);

  const revealWordColor = (index, color) => {
    // Update local state
    setGrid((prevGrid) => {
      const updatedGrid = [...prevGrid];
      updatedGrid[index].color = color;
      return updatedGrid;
    });

    // Send the reveal action to the receiver
    GoogleCast.sendMessage('urn:x-cast:com.example.codenames', {
      action: 'reveal_word',
      payload: { index, color },
    });
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.wordBox,
        { backgroundColor: item.color ? item.color : 'white' },
      ]}
      onPress={() => revealWordColor(index, getRandomColor())}
    >
      <Text style={styles.wordText}>{item.word}</Text>
    </TouchableOpacity>
  );

  const getRandomColor = () => {
    const colors = ['red', 'blue', 'green', 'yellow'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    GoogleCast.onConnected(() => {
      console.log('Connected to Cast device');
    });

    GoogleCast.onDisconnected(() => {
      console.log('Disconnected from Cast device');
    });

    return () => {
      GoogleCast.removeListeners();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.castButtonContainer}>
        <CastButton style={styles.castButton} />
      </View>
      <FlatList
        data={grid}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  castButtonContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  castButton: {
    width: 24,
    height: 24,
  },
  grid: {
    justifyContent: 'space-around',
  },
  wordBox: {
    flex: 1,
    margin: 5,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  wordText: {
    fontSize: 18,
    color: 'black',
  },
});

export default App;
