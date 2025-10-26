let ws = null;
let currentScene = null;

export const WebSocketService = {
    connect: (url) => {
        if (ws) return; // Already connected

        ws = new WebSocket(url);

        ws.onopen = () => console.log("Connected to AI Agent Server.");
        
        // Messages to the current active scene
        ws.onmessage = (event) => {
            if (currentScene && currentScene.handleAgentResponse) {
                const data = JSON.parse(event.data);
                currentScene.handleAgentResponse(data);
            }
        };

        ws.onclose = (e) => console.log("WebSocket connection closed.", e.reason);
        ws.onerror = (error) => console.error("WebSocket error:", error);
    },

    // Method for the active scene to register itself
    registerScene: (sceneInstance) => {
        currentScene = sceneInstance;
    },

    // Send method that any scene can call
    sendGameData: (gameData) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(gameData));
        } else {
            // Connect logic or buffering data
            console.warn("WebSocket not open. Skipping data send.");
        }
    }
};