const chatBox = document.getElementById('chat-box');
const inputForm = document.getElementById('input-form');
const inputBox = document.getElementById('input-box');
let chatHistory = [{ role: 'system', content: "You are a helpful assistant. Format answers using Markdown. For code, use triple backticks and specify the language, like ```python." }];

inputForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userInput = inputBox.value.trim();
    if (!userInput) return;

    addUserMessage(userInput);
    chatHistory.push({ role: 'user', content: userInput });
    inputBox.value = '';

    await getAssistantResponse();
});

function addUserMessage(text) {
    const messageWrapper = document.createElement('div');
    messageWrapper.className = 'message-wrapper user-message';
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = 'You';
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = text;
    messageWrapper.appendChild(messageContent);
    messageWrapper.appendChild(avatar);
    chatBox.appendChild(messageWrapper);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function getAssistantResponse() {
    const sendButton = document.getElementById('send-button');
    sendButton.disabled = true;

    const { assistantWrapperDiv, typingIndicator } = createMessageContainer('assistant');
    const contentDiv = assistantWrapperDiv.querySelector('.message-content');

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: chatHistory })
        });

        typingIndicator.remove();
        contentDiv.style.display = 'block';

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    fullResponse += line.substring(6);
                }
            }

            contentDiv.innerHTML = marked.parse(fullResponse);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        chatHistory.push({ role: 'assistant', content: fullResponse });
        addCopyButtonsAndHighlight(assistantWrapperDiv);

    } catch (error) {
        typingIndicator.remove();
        contentDiv.textContent = "Error: Could not connect to the server.";
        console.error("Fetch Error:", error);
    } finally {
        sendButton.disabled = false;
    }
}

function addCopyButtonsAndHighlight(container) {
    container.querySelectorAll('pre code').forEach((codeBlock) => {
        const pre = codeBlock.parentElement;
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copy';
        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                copyButton.textContent = 'Copied!';
                copyButton.classList.add('copied');
                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                    copyButton.classList.remove('copied');
                }, 2000);
            });
        });
        pre.insertBefore(copyButton, codeBlock);
        hljs.highlightElement(codeBlock);
    });
}

function createMessageContainer(role) {
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${role}-message`;
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = role === 'user' ? 'You' : 'AI';
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    wrapper.appendChild(avatar);
    wrapper.appendChild(messageContent);
    chatBox.appendChild(wrapper);
    chatBox.scrollTop = chatBox.scrollHeight;
    let typingIndicator = null;
    if (role === 'assistant') {
        messageContent.style.display = 'none';
        typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        wrapper.appendChild(typingIndicator);
    }
    return { assistantWrapperDiv: wrapper, typingIndicator: typingIndicator };
}

