import React, { useEffect } from 'react';

const App: React.FC = () => {
  useEffect(() => {
    if (window.cast && cast.framework) {
      const context = cast.framework.CastReceiverContext.getInstance();
      console.log('Cast Receiver Context initialized:', context);

      // Listen for custom messages
      context.addCustomMessageListener('urn:x-cast:com.example.codenames', (event) => {
        console.log('Received message:', event.data);
        const { action, payload } = event.data;
        if (action === 'reveal_word') {
          console.log(`Reveal word at index ${payload.index} with color ${payload.color}`);
        }
      });

      // Start the Cast Receiver
      context.start();
    } else {
      console.error('Cast SDK not loaded');
    }
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Cast Receiver App</h1>
      <p>This is your receiver app, running on Chromecast!</p>
    </div>
  );
};

export default App;
