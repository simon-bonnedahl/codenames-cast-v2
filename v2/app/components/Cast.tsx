import React from 'react'
import { Button } from 'react-native'
import { CastButton, useCastChannel } from 'react-native-google-cast'

export function Cast() {
  // This will automatically rerender when client is connected to a device
  // (after pressing the button that's rendered below)
  const channel = useCastChannel('urn:x-cast:ch.cimnine.chromecast-cryptowords.text')
  const text = 'init:red:apple:blue:river:sun:mountain:circle:glass:forest:cloud:stone:night:star:shadow:light:wave:earth:fire:wind:sky:tree:flower:bridge:storm:gold:bird'
  if (channel) {
    channel.sendMessage({ hello: 'world' })
  }
  const sendMessage = () => {
    if (channel) {
      channel.sendMessage({ type: "message", text: text })
    }
  }

  if(channel)return(
    <Button title="Send message" onPress={sendMessage} />
  )

  // This will render native Cast button.
  // When a user presses it, a Cast dialog will prompt them to select a Cast device to connect to.
 if(!channel)
  return <CastButton style={{ width: 24, height: 24, tintColor: 'black' }} />

}