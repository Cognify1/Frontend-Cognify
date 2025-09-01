
import { ChatService } from '../services/chatService.js';
import Prism from 'prismjs'
import {marked} from 'marked';
// Importar tema y lenguajes
import 'prismjs/themes/prism-okaidia.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-sql';
// Plugins
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard';
import 'prismjs/plugins/toolbar/prism-toolbar';
import 'prismjs/plugins/toolbar/prism-toolbar.css';

export class ChatPage {
    constructor() {
        this.container = document.getElementById('main-content');
        this.chatService = new ChatService();
        this.chatContainer = null;
        this.userInput = null;
        this.isTyping = false;
    }

    render() {
        this.container.innerHTML = `
            <div class="flex flex-col h-screen bg-gray-50">
                <div class="flex-none p-4 bg-white border-b border-gray-200">
                    <h1 class="text-2xl font-semibold text-gradient-green text-center">Chat con IA</h1>
                </div>
                
                <div id="chat" class="flex-1 overflow-y-auto py-[5%] px-[15%] bg-gray-50 space-y-4"></div>
                
                <div class="flex-none p-4 bg-white border-t border-gray-200">
                    <div class="max-w-4xl mx-auto flex gap-3">
                        <input 
                            id="userInput" 
                            type="text" 
                            placeholder="Escribe tu mensaje..."
                            class="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-[#2cc1a5] focus:ring-2 focus:ring-[#2cc1a5]/20 transition-all"
                        />
                        <button 
                            id="sendButton" 
                            class="px-4 py-2 bg-[#2cc1a5] text-white rounded-lg hover:bg-[#25a891] transition-colors"
                        >
                            <i class="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.setupElements();
        this.setupEventListeners();
    }

    appendUserMessage(message) {
        this.chatContainer.innerHTML += `
            <div class="flex justify-end">
                <div class="bg-[#2cc1a5] text-white rounded-lg px-4 py-2 max-w-[80%] shadow-sm">
                    ${this.escapeHtml(message)}
                </div>
            </div>
        `;
        this.scrollToBottom();
    }

    appendAIMessage(content) {
        // Crear el contenedor del mensaje
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex justify-start';
        messageDiv.innerHTML = `
            <div class="bg-white rounded-lg px-4 py-2 max-w-[80%] shadow-sm ai-message">
                <span class="typing-text"></span>
                <span class="typing-cursor">▋</span>
            </div>
        `;
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();

        // Obtener el elemento donde se escribirá el texto
        const textElement = messageDiv.querySelector('.typing-text');
        const cursorElement = messageDiv.querySelector('.typing-cursor');

        // Procesar el contenido y convertir markdown
        const formattedContent = this.formatMarkdown(content);

        // Iniciar la animación de escritura
        this.typeText(formattedContent, textElement, cursorElement);
    }

    formatMarkdown(content) {
        // Primero escapamos las etiquetas code con una marca temporal
        content = content.replace(/<code class="language-plaintext">(.*?)<\/code>/g, '`$1`');

        // Configuramos marked para usar Prism
        marked.setOptions({
            highlight: function(code, lang) {
                if (Prism.languages[lang]) {
                    return Prism.highlight(code, Prism.languages[lang], lang);
                }
                return code;
            },
            breaks: true,
            gfm: true
        });

        // Convertimos el markdown a HTML
        return marked(content);
    }


    async typeText(text, element, cursor, delay = 10) {
        this.isTyping = true;
        this.disableInput();

        const formattedContent = this.formatMarkdown(text);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = formattedContent;

        element.innerHTML = '';

        // Procesar cada nodo hijo
        for (let node of tempDiv.childNodes) {
            if (!this.isTyping) return;

            if (node.nodeType === Node.TEXT_NODE) {
                // Para texto normal
                for (let char of node.textContent) {
                    if (!this.isTyping) return;
                    element.innerHTML += char;
                    this.scrollToBottom();
                    await this.sleep(delay);
                }
            } else if (node.nodeName === 'PRE') {
                // Para bloques de código
                element.appendChild(node.cloneNode(true));
                const codeBlock = element.querySelector('pre code:last-child');
                if (codeBlock) {
                    Prism.highlightElement(codeBlock);
                }
                await this.sleep(delay * 5);
            } else {
                // Para otros elementos HTML
                element.appendChild(node.cloneNode(true));
                await this.sleep(delay);
            }
        }

        cursor.style.display = 'none';
        this.isTyping = false;
        this.enableInput();
    }


    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    disableInput() {
        this.userInput.disabled = true;
        this.sendButton.disabled = true;
        this.sendButton.classList.add('opacity-50');
    }

    enableInput() {
        this.userInput.disabled = false;
        this.sendButton.disabled = false;
        this.sendButton.classList.remove('opacity-50');
    }

    appendErrorMessage(errorMessage) {
        this.chatContainer.innerHTML += `
            <div class="flex justify-center">
                <div class="bg-red-100 text-red-600 rounded-lg px-4 py-2 text-sm">
                    ${this.escapeHtml(errorMessage)}
                </div>
            </div>
        `;
        this.scrollToBottom();
    }

    setupElements() {
        this.chatContainer = document.getElementById('chat');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
    }

    setupEventListeners() {
        this.userInput.addEventListener('keydown', (event) => this.handleEnterPress(event));
        this.sendButton.addEventListener('click', () => this.handleSendMessage());
    }

    async handleSendMessage() {
        const message = this.userInput.value;
        if (!message.trim()) return;

        this.appendUserMessage(message);
        this.userInput.value = '';

        try {
            const response = await this.chatService.sendMessage(message);
            this.appendAIMessage(response.content);
        } catch (error) {
            this.appendErrorMessage(error.message);
        }
    }

    handleEnterPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.handleSendMessage();
        }
    }

    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}