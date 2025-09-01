
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
    <div class="flex flex-col min-h-screen bg-gray-50">    
      
      <!-- Chat container -->
      <div 
        id="chat" 
        class="flex-1 overflow-y-auto 
               mt-16 
               py-3 sm:py-4 md:py-6 
               px-2 sm:px-6 md:px-[15%] 
               space-y-3 sm:space-y-4 md:space-y-6 
               bg-gray-50"
      ></div>
      
      <!-- Input -->
     <div class="flex-none p-4 sm:p-3 border-t">
  <div class="max-w-4xl mx-auto flex gap-1 sm:gap-2">
    <input 
      id="userInput" 
      type="text" 
      placeholder="Escribe tu mensaje..."
      class="flex-1 px-2 sm:px-3 py-2 sm:py-1.5 rounded-md border focus:outline-none focus:ring-1 text-sm"
    />
    <button 
      id="sendButton" 
      class="bg-cyan-600 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-sm"
      style="color: white;"
    >
      <i class="fa-solid fa-paper-plane"></i>
    </button>
  </div>
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
                <div class="bg-[white] text-black rounded-lg px-4 py-2 my-4 max-w-[80%] shadow-sm">
                    ${this.escapeHtml(message)}
                </div>
            </div>
        `;
        this.scrollToBottom();
    }

    appendAIMessage(content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex justify-start';
        messageDiv.innerHTML = `
        <div class="bg-white rounded-lg px-4 py-2 max-w-[80%] shadow-sm ai">
            <span class="typing-text"></span>
            <span class="typing-cursor">▋</span>
        </div>
    `;
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();

        const textElement = messageDiv.querySelector('.typing-text');
        const cursorElement = messageDiv.querySelector('.typing-cursor');

        // Animamos usando el markdown crudo (sin Prism todavía)
        this.typeText(content, textElement, cursorElement);
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


    async typeText(rawContent, element, cursor, delay = 15) {
        this.isTyping = true;
        this.disableInput();

        element.innerHTML = "";

        for (let char of rawContent) {
            if (!this.isTyping) return;
            element.innerHTML += this.escapeHtml(char);
            this.scrollToBottom();
            await this.sleep(delay);
        }

        // Al terminar: reemplazar texto plano por el HTML procesado
        const formatted = this.formatMarkdown(rawContent);
        element.innerHTML = formatted;

        // Resaltar TODOS los bloques de código
        element.querySelectorAll('pre code').forEach(block => {
            block.classList.add("line-numbers"); // opcional para numeración
            Prism.highlightElement(block);
        });

        cursor.style.display = "none";
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