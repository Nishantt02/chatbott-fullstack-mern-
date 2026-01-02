import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const Chatcontext = createContext();



export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [newRequestLoading, setNewRequestLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [selected, setSelected] = useState(null);
  const [createLod, setCreateLod] = useState(false);
  const [loading, setLoading] = useState(false);

  // const GEMINI_KEY ="AIzaSyAte9gVBd4IftB-KTIY_nWco_OsH3uXv40";
  const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const server = import.meta.env.VITE_SERVER;
  
  const token = localStorage.getItem("token");

  // Track concurrent Gemini requests
  let isRequestInProgress = false;
  let lastCallTime = 0;

  // ✅ Helper to get authorization header safely
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // ✅ Fetch AI Response from Gemini
  async function fetchResponse() {
    if (prompt.trim() === "") return toast.error("Please enter a prompt");
    if (!selected) return toast.error("No chat selected. Please create or select a chat.");

    const now = Date.now();
    if (now - lastCallTime < 5000)
      return toast.error("Please wait a few seconds before sending another prompt.");

    if (isRequestInProgress) return toast.error("Please wait for the current response...");

    isRequestInProgress = true;
    lastCallTime = now;
    setNewRequestLoading(true);

    const userPrompt = prompt;
    setPrompt("");

    try {
      // Call Gemini API
      const { data } = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
        
        { contents: [{ parts: [{ text: userPrompt }] }] },
        { headers: { "Content-Type": "application/json" } }
      );

      const answer =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";

      // Add to chat window
      setMessages((prev) => [...prev, { question: userPrompt, answer }]);

      // Save to backend
      await axios.post(
        `${server}/chat/add/${selected}`,
        { question: userPrompt, answer },
        { headers: authHeader }
      );
    } catch (error) {
      console.error("Gemini API error:", error);
      if (error.response?.status === 429) {
        toast.error("Rate limit reached. Please wait a moment.");
      } else {
        toast.error("Something went wrong while fetching response.");
      }
    } finally {
      isRequestInProgress = false;
      setNewRequestLoading(false);
    }
  }

  // ✅ Fetch all user chats
  async function fetchChats() {
    try {
      const { data } = await axios.get(`${server}/chat/all`, { headers: authHeader });

      const chatList = Array.isArray(data)
        ? data
        : Array.isArray(data.chats)
        ? data.chats
        : [];

      setChats(chatList);
      setSelected(chatList.length > 0 ? chatList[0]._id : null);
    } catch (error) {
      console.error("Error fetching chats:", error);
      setChats([]);
    }
  }

  // ✅ Fetch messages for selected chat
  async function fetchMessages() {
    if (!selected) {
      setMessages([]);
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(`${server}/chat/${selected}`, { headers: authHeader });

      const msgList = Array.isArray(data)
        ? data
        : Array.isArray(data.messages)
        ? data.messages
        : [];

      setMessages(msgList);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Create a new chat
  async function createChat() {
    setCreateLod(true);
    try {
      await axios.post(`${server}/chat/new`, {}, { headers: authHeader });
      toast.success("New chat created!");
      await fetchChats();
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Something went wrong while creating chat");
    } finally {
      setCreateLod(false);
    }
  }

  // ✅ Delete a chat
  async function deleteChat(id) {
    if (!id) return;
    try {
      const { data } = await axios.delete(`${server}/chat/${id}`, { headers: authHeader });
      toast.success(data.message || "Chat deleted");
      await fetchChats();
      if (selected === id) setSelected(null);
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Something went wrong while deleting chat");
    }
  }

  // ✅ Fetch chats on mount
  useEffect(() => {
    if (token) fetchChats();
  }, [token]);

  // ✅ Fetch messages when selected chat changes
  useEffect(() => {
    if (selected && token) fetchMessages();
  }, [selected]);

  return (
    <Chatcontext.Provider
      value={{
        fetchResponse,
        messages,
        prompt,
        setPrompt,
        newRequestLoading,
        chats,
        createChat,
        createLod,
        selected,
        setSelected,
        loading,
        deleteChat,
        fetchChats,
      }}
    >
      {children}
    </Chatcontext.Provider>
  );
};

export const ChatData = () => useContext(Chatcontext);
