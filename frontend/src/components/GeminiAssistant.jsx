import React, { useState } from 'react';
import axios from 'axios';
// Import SyntaxHighlighter and a style
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Keep using a style for code blocks
// Import necessary icons from lucide-react
import { Copy, Edit, Save, XCircle } from 'lucide-react';

// Import the CSS file
import './GeminiAssistant.css'; // Make sure this path is correct

// Helper function to format text with basic Markdown (bold and inline code)
const formatTextForHtml = (text) => {
    let formattedText = text;
    // Bold
    formattedText = formattedText.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Inline Code
    formattedText = formattedText.replace(/`(.+?)`/g,
        '<code style="background-color: #f0f0f0; padding: 0.1em 0.4em; border-radius: 3px; font-family: monospace; font-size: 0.9em;">$1</code>'
    );
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
    const [editingIndex, setEditingIndex] = useState(null); // Index of the code block being edited
    const [editedCode, setEditedCode] = useState(''); // Content of the code block being edited

    // Backend server URL (update if necessary)
    const serverUrl = 'http://localhost:8080';

    // Function to parse the raw response string into text and code parts
    const parseResponse = (text) => {
        const regex = /```(\w+)?\s*\n?([\s\S]*?)```/g;
        const parts = [];
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                const textContent = text.substring(lastIndex, match.index).trim();
                if (textContent) parts.push({ type: 'text', content: textContent });
            }
            parts.push({
                type: 'code',
                language: match[1] || 'plaintext',
                content: match[2].trim(),
            });
            lastIndex = regex.lastIndex;
        }
        if (lastIndex < text.length) {
            const remainingText = text.substring(lastIndex).trim();
            if (remainingText) parts.push({ type: 'text', content: remainingText });
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
        setEditingIndex(null); // Ensure not in edit mode on new submit

        try {
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

    // --- Edit Handlers ---

    // Start editing a code block
    const handleEdit = (index) => {
        setEditingIndex(index);
        setEditedCode(responseParts[index].content); // Initialize textarea with current code
    };

    // Save the edited code
    const handleSaveEdit = () => {
        if (editingIndex === null) return; // Should not happen, but safeguard

        // Create a new array with the updated content
        const updatedParts = responseParts.map((part, index) => {
            if (index === editingIndex) {
                return { ...part, content: editedCode }; // Update the content
            }
            return part;
        });

        setResponseParts(updatedParts); // Set the new state
        setEditingIndex(null); // Exit edit mode
        setEditedCode(''); // Clear temporary edit state
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingIndex(null); // Exit edit mode
        setEditedCode(''); // Clear temporary edit state
    };

    // Update the temporary edited code state as user types
    const handleCodeChange = (event) => {
        setEditedCode(event.target.value);
    };

    // --- Button Styles (Inline for simplicity, move to CSS if preferred) ---
    const iconButtonStyle = {
        background: 'none',
        border: 'none',
        padding: '3px', // Smaller padding
        marginLeft: '5px', // Space between icons
        cursor: 'pointer',
        color: '#ccc', // Icon color
        display: 'inline-flex', // Align icon properly
        alignItems: 'center',
        justifyContent: 'center',
    };

    const iconButtonHoverStyle = { // Define hover style separately
        color: '#fff', // Brighter color on hover
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
                                // Render text parts
                                <p
                                    style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
                                    dangerouslySetInnerHTML={{ __html: formatTextForHtml(part.content) }}
                                />
                            ) : (
                                // Render code blocks (or edit textarea)
                                <div className="code-block-container" style={{ position: 'relative', backgroundColor: '#2d2d2d', borderRadius: '4px', overflow: 'hidden', margin: '1em 0' }}>
                                    {/* Top bar for language and buttons */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 10px', backgroundColor: '#3a3a3a' /* Slightly different bg for bar */ }}>
                                        <span style={{ fontSize: '0.8em', color: '#ccc', textTransform: 'uppercase' }}>
                                            {part.language}
                                        </span>
                                        <div>
                                            {editingIndex === index ? (
                                                // Show Save/Cancel buttons when editing
                                                <>
                                                    <button
                                                        onClick={handleSaveEdit}
                                                        style={{ ...iconButtonStyle, color: '#4CAF50' }} // Green for Save
                                                        onMouseOver={(e) => e.currentTarget.style.color = '#6fbf73'} // Lighter green hover
                                                        onMouseOut={(e) => e.currentTarget.style.color = '#4CAF50'}
                                                        aria-label="Save edit"
                                                        title="Save" // Tooltip
                                                    >
                                                        <Save size={16} />
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        style={{ ...iconButtonStyle, color: '#f44336' }} // Red for Cancel
                                                        onMouseOver={(e) => e.currentTarget.style.color = '#e57373'} // Lighter red hover
                                                        onMouseOut={(e) => e.currentTarget.style.color = '#f44336'}
                                                        aria-label="Cancel edit"
                                                        title="Cancel" // Tooltip
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                // Show Copy/Edit buttons when not editing
                                                <>
                                                    <button
                                                        onClick={() => handleCopy(part.content, index)}
                                                        style={iconButtonStyle}
                                                        onMouseOver={(e) => Object.assign(e.currentTarget.style, iconButtonHoverStyle)}
                                                        onMouseOut={(e) => Object.assign(e.currentTarget.style, iconButtonStyle)} // Revert to base style
                                                        aria-label="Copy code"
                                                        title="Copy" // Tooltip
                                                    >
                                                        {copiedStates[index] ? <span style={{ fontSize: '0.8em' }}>Copied!</span> : <Copy size={14} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(index)}
                                                        style={iconButtonStyle}
                                                        onMouseOver={(e) => Object.assign(e.currentTarget.style, iconButtonHoverStyle)}
                                                        onMouseOut={(e) => Object.assign(e.currentTarget.style, iconButtonStyle)} // Revert to base style
                                                        aria-label="Edit code"
                                                        title="Edit" // Tooltip
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Area: SyntaxHighlighter or Textarea */}
                                    {editingIndex === index ? (
                                        <textarea
                                            value={editedCode}
                                            onChange={handleCodeChange}
                                            style={{
                                                width: '100%',
                                                minHeight: '150px', // Give it some height
                                                backgroundColor: '#2d2d2d', // Match block background
                                                color: '#f0f0f0', // Light text
                                                border: 'none', // No border
                                                padding: '1rem', // Padding
                                                fontFamily: 'monospace', // Monospace font
                                                fontSize: '0.9rem',
                                                resize: 'vertical', // Allow vertical resize
                                                boxSizing: 'border-box', // Include padding in width
                                                outline: 'none', // Remove focus outline
                                            }}
                                        />
                                    ) : (
                                        <SyntaxHighlighter
                                            language={part.language}
                                            style={materialDark}
                                            customStyle={{
                                                margin: 0,
                                                // Reduced top padding as buttons are now in a separate bar
                                                padding: '1rem 1rem 1rem 1rem',
                                                borderRadius: '0',
                                                fontSize: '0.9rem',
                                                backgroundColor: 'transparent', // Make highlighter bg transparent as container handles it
                                            }}
                                            wrapLongLines={true}
                                            codeTagProps={{ style: { fontFamily: 'monospace' } }}
                                        >
                                            {part.content}
                                        </SyntaxHighlighter>
                                    )}
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
