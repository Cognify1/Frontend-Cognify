
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
        this.inputContainer = null;
        this.isTyping = false;
        this.hasMessages = false;
    }

    render() {
        this.container.innerHTML = `
    <div class="flex flex-col min-h-screen">    
      
      <!-- Chat container -->
      <div 
        id="chat" 
        class="flex-1 overflow-y-auto 
               mt-16 
               py-3 sm:py-4 md:py-6 
               px-2 sm:px-6 md:px-[15%] 
               space-y-3 sm:space-y-4 md:space-y-6 
               flex flex-col justify-center items-center
               min-h-[calc(100vh-200px)]"
      >
        <!-- Centered input for initial state -->
        <div id="centeredInput" class="w-full max-w-4xl">
          <div class="flex flex-col gap-3">
                         <div class="flex gap-2 items-end">
               <textarea 
                 id="userInput" 
                 placeholder="¿En qué puedo ayudarte hoy?"
                 rows="1"
                 class="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-base resize-none transition-all duration-200 min-h-[60px] max-h-[200px]"
                 style="font-family: inherit;"
               ></textarea>
               <button 
                 id="sendButton" 
                 class="bg-cyan-600 hover:bg-cyan-700 px-4 py-3 rounded-xl text-white transition-colors duration-200 flex items-center justify-center min-w-[48px] h-[60px]"
               >
                 <i class="fa-solid fa-paper-plane"></i>
               </button>
             </div>
            <div class="text-xs text-gray-500 text-center">
              Cognify puede cometer errores. Considera verificar información importante.
            </div>
          </div>
        </div>
      </div>
      
      <!-- Input Container - Bottom position -->
      <div id="inputContainer" class="flex-none p-4 sm:p-3 border-t transition-all duration-300 ease-in-out bg-white hidden">
        <div class="max-w-4xl mx-auto flex flex-col gap-3">
                     <div class="flex gap-2 items-end">
             <textarea 
               id="userInputBottom" 
               placeholder="¿En qué puedo ayudarte hoy?"
               rows="1"
               class="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-base resize-none transition-all duration-200 min-h-[60px] max-h-[200px]"
               style="font-family: inherit;"
             ></textarea>
             <button 
               id="sendButtonBottom" 
               class="bg-cyan-600 hover:bg-cyan-700 px-4 py-3 rounded-xl text-white transition-colors duration-200 flex items-center justify-center min-w-[48px] h-[60px]"
             >
               <i class="fa-solid fa-paper-plane"></i>
             </button>
           </div>
          <div class="text-xs text-gray-500 text-center">
            Cognify puede cometer errores. Considera verificar información importante.
          </div>
        </div>
      </div>
      </div>
    </div>
  `;

        this.setupElements();
        this.setupEventListeners();
        this.setupAutoResize();
    }

    setupElements() {
        this.chatContainer = document.getElementById('chat');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.inputContainer = document.getElementById('inputContainer');
        this.userInputBottom = document.getElementById('userInputBottom');
        this.sendButtonBottom = document.getElementById('sendButtonBottom');
        this.centeredInput = document.getElementById('centeredInput');
    }

    setupEventListeners() {
        this.userInput.addEventListener('keydown', (event) => this.handleEnterPress(event));
        this.sendButton.addEventListener('click', () => this.handleSendMessage());
        this.userInputBottom.addEventListener('keydown', (event) => this.handleEnterPress(event));
        this.sendButtonBottom.addEventListener('click', () => this.handleSendMessage());
    }

    setupAutoResize() {
        this.userInput.addEventListener('input', () => {
            // Auto-resize textarea
            this.userInput.style.height = 'auto';
            this.userInput.style.height = Math.min(this.userInput.scrollHeight, 200) + 'px';
        });
        this.userInputBottom.addEventListener('input', () => {
            // Auto-resize textarea
            this.userInputBottom.style.height = 'auto';
            this.userInputBottom.style.height = Math.min(this.userInputBottom.scrollHeight, 200) + 'px';
        });
    }

    moveInputToBottom() {
        if (!this.hasMessages) {
            this.hasMessages = true;
            this.chatContainer.classList.remove('justify-center', 'items-center');
            this.chatContainer.classList.add('justify-start', 'has-messages');
            
            // Animate centered input out
            this.centeredInput.classList.add('hide');
            
            // Show bottom input container
            this.inputContainer.classList.remove('hidden');
            
            // Copy value from centered input to bottom input
            this.userInputBottom.value = this.userInput.value;
            this.userInputBottom.style.height = this.userInput.style.height;
            
            // Animate bottom input in after a small delay
            setTimeout(() => {
                this.inputContainer.classList.add('show');
                this.userInputBottom.focus();
            }, 250);
            
            // Hide centered input completely after animation
            setTimeout(() => {
                this.centeredInput.style.display = 'none';
            }, 500);
        }
    }

    appendUserMessage(message) {
        this.moveInputToBottom();
        this.chatContainer.innerHTML += `
            <div class="flex justify-end w-full">
                <div class="bg-white text-black rounded-lg px-4 py-3 my-2 max-w-[80%] shadow-sm border user-message">
                    ${this.escapeHtml(message)}
                </div>
            </div>
        `;
        this.scrollToBottom();
    }

    appendAIMessage(content) {
        this.moveInputToBottom();
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex justify-start w-full';
        messageDiv.innerHTML = `
        <div class="bg-white rounded-lg px-4 py-3 max-w-[80%] shadow-sm border ai ai-message">
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
        const currentInput = this.hasMessages ? this.userInputBottom : this.userInput;
        const currentButton = this.hasMessages ? this.sendButtonBottom : this.sendButton;
        
        currentInput.disabled = true;
        currentButton.disabled = true;
        currentButton.classList.add('opacity-50');
    }

    enableInput() {
        const currentInput = this.hasMessages ? this.userInputBottom : this.userInput;
        const currentButton = this.hasMessages ? this.sendButtonBottom : this.sendButton;
        
        currentInput.disabled = false;
        currentButton.disabled = false;
        currentButton.classList.remove('opacity-50');
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

    async handleSendMessage() {
        const currentInput = this.hasMessages ? this.userInputBottom : this.userInput;
        const message = currentInput.value;
        if (!message.trim()) return;

        this.appendUserMessage(message);
        currentInput.value = '';
        currentInput.style.height = 'auto'; // Reset height

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