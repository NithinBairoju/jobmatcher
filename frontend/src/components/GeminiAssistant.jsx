import React, { useState } from 'react';
import axios from 'axios';
// Import SyntaxHighlighter and a style
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Keep using a style for code blocks
import { Copy } from 'lucide-react'; // Still using lucide-react for icons

// Import the CSS file
import './GeminiAssistant.css'; // Make sure this path is correct

// Helper function to format text with basic Markdown (bold and inline code)
const formatTextForHtml = (text) => {
    let formattedText = text;

    // Replace **bold text** with <strong>bold text</strong>
    // Use a non-greedy match (.+?) to handle multiple instances correctly
    formattedText = formattedText.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Replace `inline code` with <code style="...">inline code</code>
    // Use a non-greedy match (.+?)
    // Added inline styles for background, padding, font, and border-radius
    formattedText = formattedText.replace(/`(.+?)`/g,
        '<code style="background-color: #f0f0f0; padding: 0.1em 0.4em; border-radius: 3px; font-family: monospace; font-size: 0.9em;">$1</code>'
    );

    // You could add more rules here, e.g., for italics:
    // formattedText = formattedText.replace(/\*(.+?)\*/g, '<em>$1</em>');

    return formattedText;
};


// Main component for the Gemini Assistant interface
function App() {
    // State variables
    const [prompt, setPrompt] = useState(''); // Input prompt
    const [responseParts, setResponseParts] = useState([]); // Parsed response (text/code parts)
    const [loading, setLoading] = useState(false); // Loading state
    const [error, setError] = useState(''); // Error message
    const [copiedStates, setCopiedStates] = useState({}); // Track copied state for each code block

    // Backend server URL (update if necessary)
    const serverUrl = 'http://localhost:8080';

    // Function to parse the raw response string into text and code parts
    const parseResponse = (text) => {
        // Regex to find code blocks (```lang\ncode``` or ```\ncode```)
        const regex = /```(\w+)?\s*\n?([\s\S]*?)```/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        // Iterate through matches
        while ((match = regex.exec(text)) !== null) {
            // Add text part before the code block
            if (match.index > lastIndex) {
                const textContent = text.substring(lastIndex, match.index).trim();
                if (textContent) {
                    parts.push({ type: 'text', content: textContent });
                }
            }
            // Add the code block part
            parts.push({
                type: 'code',
                language: match[1] || 'plaintext', // Default to plaintext if no language specified
                content: match[2].trim(), // The actual code
            });
            lastIndex = regex.lastIndex; // Update the index for the next search
        }

        // Add any remaining text after the last code block
        if (lastIndex < text.length) {
            const remainingText = text.substring(lastIndex).trim();
            if (remainingText) {
                parts.push({ type: 'text', content: remainingText });
            }
        }
        return parts;
    };


    // Handle form submission
    const handleSubmit = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }
        setError('');
        setResponseParts([]);
        setLoading(true);
        setCopiedStates({});

        try {
            // Simulate a response for testing formatting
            // const rawResponse = "This is **bold text** and this is `inline code like int i = 0;`. Here is a code block:\n```javascript\nconsole.log('Hello');\n```\nAnd some more text with `another snippet`.";
            // setResponseParts(parseResponse(rawResponse)); // Use this line for testing

            // Actual API call (uncomment when ready)
            const res = await axios.post(`${serverUrl}/prompt`, { prompt });
            const rawResponse = res.data.content || "No response generated.";
            setResponseParts(parseResponse(rawResponse));

        } catch (err) {
            console.error(err);
            setError('Failed to fetch response. Please ensure the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    // Handle copying code to clipboard
    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedStates(prev => ({ ...prev, [index]: true }));
            setTimeout(() => {
                setCopiedStates(prev => ({ ...prev, [index]: false }));
            }, 1500);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    // --- Rendering ---
    return (
        <div className="container">
            <h1>Gemini AI Assistant</h1>

            {error && <div className="error">{error}</div>}

            <textarea
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
            />

            <button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Processing...' : 'Send to Gemini'}
            </button>

            {loading && (
                <div className="loading">
                    <div className="spinner"></div>
                </div>
            )}

            {!loading && responseParts.length > 0 && (
                <div className="response">
                    {responseParts.map((part, index) => (
                        <div key={index} style={{ marginBottom: '1rem' }}>
                            {part.type === 'text' ? (
                                // Render text parts using dangerouslySetInnerHTML after formatting
                                <p
                                    style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }} // Added line-height for better spacing with inline code
                                    dangerouslySetInnerHTML={{ __html: formatTextForHtml(part.content) }}
                                />
                            ) : (
                                // Render code blocks
                                <div className="code-block-container" style={{ position: 'relative', backgroundColor: '#2d2d2d', borderRadius: '4px', overflow: 'hidden', margin: '1em 0' }}>
                                    <span style={{ position: 'absolute', top: '5px', left: '10px', fontSize: '0.8em', color: '#ccc', textTransform: 'uppercase' }}>
                                        {part.language}
                                    </span>
                                    <button
                                        onClick={() => handleCopy(part.content, index)}
                                        style={{
                                            position: 'absolute',
                                            top: '5px',
                                            right: '5px',
                                            padding: '3px 8px',
                                            backgroundColor: '#555',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '3px',
                                            cursor: 'pointer',
                                            fontSize: '0.8em',
                                            zIndex: 1,
                                            lineHeight: '1.2'
                                        }}
                                        aria-label="Copy code"
                                    >
                                        {copiedStates[index] ? 'Copied!' : <Copy size={14} />}
                                    </button>
                                    <SyntaxHighlighter
                                        language={part.language}
                                        style={materialDark}
                                        customStyle={{
                                            margin: 0,
                                            padding: '2rem 1rem 1rem 1rem',
                                            borderRadius: '0',
                                            fontSize: '0.9rem',
                                        }}
                                        wrapLongLines={true}
                                        codeTagProps={{ style: { fontFamily: 'monospace' } }}
                                    >
                                        {part.content}
                                    </SyntaxHighlighter>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default App;
