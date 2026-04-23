import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Sparkles } from "lucide-react";

function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { role: "user", content: input }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ messages: newMessages }),
            });

            const data = await res.json();

            setMessages([
                ...newMessages,
                { role: "assistant", content: data.reply || "I'm sorry, I couldn't process that. Please try again." },
            ]);
        } catch (err) {
            setMessages([
                ...newMessages,
                { role: "assistant", content: "❌ API Connection Error. Please verify your backend is running and API key is set." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden">
            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar pb-8">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500 animate-pulse">
                           <Sparkles size={32} />
                        </div>
                        <div>
                            <p className="text-slate-900 dark:text-white font-bold text-lg">SmartSpend AI</p>
                            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                                Ask me about your budgets, recent spending, or tips to save money!
                            </p>
                        </div>
                    </div>
                )}

                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"} animate-fadeIn`}
                    >
                        <div className={`flex items-center gap-2 mb-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${m.role === 'user' ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                {m.role === 'user' ? <User size={12} className="text-white" /> : <Bot size={12} className="text-blue-500" />}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {m.role === "user" ? "You" : "Assistant"}
                            </span>
                        </div>
                        
                        <div
                            className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ${
                                m.role === "user"
                                    ? "bg-blue-600 text-white rounded-tr-none"
                                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-white/5"
                            }`}
                        >
                            <p className="whitespace-pre-wrap">{m.content}</p>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex flex-col items-start animate-fadeIn">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                <Bot size={12} className="text-blue-500" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thinking...</span>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-white/5">
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 bg-blue-500/40 rounded-full animate-bounce [animation-duration:0.8s]"></div>
                                <div className="w-2 h-2 bg-blue-500/40 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-blue-500/40 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <div className="p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-slate-100 dark:border-white/5">
                <div className="relative flex items-center">
                    <input
                        className="w-full p-4 pr-14 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-2xl text-sm border border-transparent focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-700 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-inner"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question..."
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="absolute right-2 p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:grayscale rounded-xl text-white transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(148, 163, 184, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(148, 163, 184, 0.4);
                }
            `}</style>
        </div>
    );
}

export default Chatbot;