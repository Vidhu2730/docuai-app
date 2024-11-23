import { useEffect, useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import { fetchConfluenceContent } from './scripts/confluenceApis';
import { cleanText } from './scripts/textHandlers';

const API_KEY = "";
// "Explain things like you would to a 10 year old learning how to code."
const systemMessage = { //  Explain things like you're talking to a software professional with 5 years of experience.
  "role": "system", "content": "Explain things like you're talking to a software professional with 2 years of experience."
}
const CONFLUENCE_URL = 'https://docuaihackathonpoc.atlassian.net/wiki'

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
        const data = await fetchConfluenceContent();
        console.log('============== from UI ', data);
        // data?.results?.results?.content?.title
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


    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act. 
    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,  // The system message DEFINES the logic of our chatGPT
        ...apiMessages // The messages from our chat with ChatGPT
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
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
      {console.log("------ 1pageContents:", pageContents)} {/* Log the entire pageContents */}
      {console.log("------ 2pageContents:", pageContents?.results)} {/* Log the entire pageContents */}
      {console.log("------ 3pageContents:", pageContents?.results?.results)} {/* Log the entire pageContents */}

        <ul>
         {pageContents.results?.results?.filter(result => result.content.type=='page').map((item, index) => {
          console.log("Mapping item:", item);
          return (<a  target="_blank" href={CONFLUENCE_URL+item.url}> <li key={'k'+index}>{cleanText(item.title)}</li></a>)
         })}
         </ul>
        </div>
    </div>
  )
}

export default App
