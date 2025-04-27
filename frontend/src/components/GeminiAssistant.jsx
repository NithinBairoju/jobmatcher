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

    const handleSave = () => {
        const blob = new Blob(
            [`<html><body><h2>Prompt:</h2><p>${prompt}</p><h2>Response:</h2><div>${response}</div></body></html>`],
            { type: 'text/html' }
        );
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'prompt_response.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderResponse = (text) => {
        // Check if it's a code block
        if (text.startsWith('```') && text.endsWith('```')) {
            const code = text.slice(3, -3).trim();
            return (
                <div>
                    <SyntaxHighlighter language="javascript" style={coy}>
                        {code}
                    </SyntaxHighlighter>
                    <button onClick={() => handleCopy(code)} style={{ marginTop: '10px' }}>Copy Code</button>
                </div>
            );
        } else {
            // Otherwise render as HTML text
            return (
                <div
                    style={{ fontSize: '16px', lineHeight: '1.6' }}
                    dangerouslySetInnerHTML={{ __html: text }}
                />
            );
        }
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
                    {renderResponse(response)}
                    <button onClick={handleSave} style={{ marginTop: '15px', backgroundColor: '#3498db' }}>Save as HTML</button>
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
