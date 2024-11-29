import { useEffect, useState } from 'react';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import axios from 'axios';

const systemMessage = { 
  "role": "system", "content": "Explain things like you're talking to a software professional with 2 years of experience."
};

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm DocuAI! Ask me anything from Confuence!",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [query, setQuery] = useState('');

  const handleSend = async (message) => {
    console.log('Sending message:', message); // Debugging log
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setQuery(message); // Update the query state with the user's message
   
    setIsTyping(true);

    try {
      const response = await axios.post('http://127.0.0.1:5000/interact', { query: message });
      console.log('Response from backend:', response.data); // Debugging log
      const chatGPTMessage = {
        message: response.data.choices[0].message.content,
        sentTime: "just now",
        sender: "ChatGPT"
      };
      setMessages([...newMessages, chatGPTMessage]);
    } catch (error) {
      console.error('There was an error sending the query!', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="App">
      <div style={{ position: "relative", height: "800px", width: "750px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="DocuAI is typing" /> : null}
            >
              {messages.map((message, i) => (
                <Message key={i} model={message} />
              ))}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;