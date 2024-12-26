import React from 'react'
import { Button } from 'react-native'
import { CastButton, useCastChannel, useRemoteMediaClient } from 'react-native-google-cast'

export function Cast() {
  // This will automatically rerender when client is connected to a device
  // (after pressing the button that's rendered below)
  const channel = useCastChannel('urn:x-cast:com.example.codenames')

  if (channel) {
    channel.sendMessage({ hello: 'world' })
  }

  if(channel)return(
    <Button title="Send message" onPress={() => channel.sendMessage({ hello: 'world' })} />
  )

  // This will render native Cast button.
  // When a user presses it, a Cast dialog will prompt them to select a Cast device to connect to.
 if(!channel)
  return <CastButton style={{ width: 24, height: 24, tintColor: 'black' }} />
}