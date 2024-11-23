import { useEffect, useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import { getConfluencePageContent, searchConfluence } from './scripts/confluenceApis';
import { cleanText } from './scripts/textHandlers';

// console.log('**********TEST111111', import.meta.env.VITE_TEST)

const OPENAPI_KEY = import.meta.env.VITE_OPENAPI_KEY;
const DOCUAI_CONFLUENCE_URL = import.meta.env.VITE_DOCUAI_CONFLUENCE_URL;

const systemMessage = { 
  "role": "system", "content": "Explain things like you're talking to a software professional with 2 years of experience."
}


function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT! Ask me anything!",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // --------- DocuAI - Start
  const [pageContents, setPageContents] = useState('')
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await searchConfluence('OpenAI');
        // const pageData = await getConfluencePageContent();
        setPageContents(data);
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };
    fetchContent();
  },[])
  // --------- DocuAI - Stop

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    
    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) { // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}
    });


    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,  
        ...apiMessages
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + OPENAPI_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      setIsTyping(false);
    });
  }

  return (
    <div className="App">
      <div style={{ position:"relative", height: "800px", width: "700px"  }}>
        <MainContainer>
          <ChatContainer>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
            >
              {messages.map((message, i) => {
                console.log(message)
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />        
          </ChatContainer>
        </MainContainer>
       
      </div> 
      <div>
  
        <ul>
         {pageContents.results?.results?.filter(result => result.content.type=='page').map((item, index) => {
          return (<a  target="_blank" href={DOCUAI_CONFLUENCE_URL+item.url}> <li key={'k'+index}>{cleanText(item.title)}</li></a>)
         })}
         </ul>
         {/* <div>
          {getConfluencePageContent()}
         </div> */}
        </div>
    </div>
  )
}

export default App
