import React, { useState } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';

function GeminiAssistant() {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const serverUrl = 'http://localhost:8080'; // Change if needed

    const handleSubmit = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }

        setError('');
        setResponse('');
        setLoading(true);

        try {
            const res = await axios.post(`${serverUrl}/prompt`, { prompt });
            setResponse(res.data.content || "No response generated.");
        } catch (err) {
            console.error(err);
            setError('Failed to fetch response.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const renderResponse = (text) => {
        // If it's a code block, display it differently
        if (text.startsWith('```') && text.endsWith('```')) {
            const code = text.slice(3, -3).trim();
            return (
                <div>
                    <div className="code-block">
                        <SyntaxHighlighter language="java" style={coy}>
                            {code}
                        </SyntaxHighlighter>
                    </div>
                    <button onClick={() => handleCopy(code)}>Copy Code</button>
                </div>
            );
        } else {
            // Otherwise, render as normal HTML
            return <div className="response-text" dangerouslySetInnerHTML={{ __html: text }} />;
        }
    };

    const formatResponse = (rawResponse) => {
        // Apply some HTML formatting to bold text and headings
        const formattedResponse = rawResponse
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text using **
            .replace(/`(.*?)`/g, '<code>$1</code>') // Inline code
            .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>'); // Multiline code blocks
        return formattedResponse;
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Gemini AI Assistant</h1>

            {error && <div style={styles.error}>{error}</div>}

            <textarea
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                style={styles.textarea}
            />

            <button onClick={handleSubmit} disabled={loading} style={styles.button}>
                {loading ? 'Processing...' : 'Send to Gemini'}
            </button>

            {response && (
                <div style={styles.response}>
                    <div dangerouslySetInnerHTML={{ __html: formatResponse(response) }} />
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginTop: '20px',
    },
    heading: {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#2c3e50',
    },
    error: {
        color: '#D8000C',
        backgroundColor: '#FFBABA',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '20px',
    },
    textarea: {
        width: '100%',
        minHeight: '120px',
        padding: '12px',
        marginBottom: '20px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px',
        resize: 'vertical',
    },
    button: {
        display: 'block',
        margin: '0 auto',
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '12px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    response: {
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderLeft: '4px solid #4CAF50',
        borderRadius: '4px',
        whiteSpace: 'pre-wrap',
    },
};

export default GeminiAssistant;
