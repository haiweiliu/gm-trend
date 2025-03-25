const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mc = require('minecraft-protocol');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3001;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Store Minecraft server connections
const mcServers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected');

    // Handle server start request
    socket.on('startServer', async (config) => {
        try {
            const { serverName, port, version } = config;
            
            if (mcServers.has(serverName)) {
                socket.emit('error', { message: 'Server already running' });
                return;
            }

            const server = mc.createServer({
                'online-mode': false,
                port: port,
                version: version
            });

            mcServers.set(serverName, server);

            server.on('login', (client) => {
                console.log(`Player ${client.username} joined ${serverName}`);
                socket.emit('playerJoin', { 
                    server: serverName, 
                    player: client.username 
                });
            });

            socket.emit('serverStarted', { 
                serverName, 
                port, 
                version 
            });

        } catch (error) {
            console.error('Error starting server:', error);
            socket.emit('error', { 
                message: 'Failed to start server', 
                error: error.message 
            });
        }
    });

    // Handle server stop request
    socket.on('stopServer', (serverName) => {
        try {
            const server = mcServers.get(serverName);
            if (server) {
                server.close();
                mcServers.delete(serverName);
                socket.emit('serverStopped', { serverName });
            } else {
                socket.emit('error', { message: 'Server not found' });
            }
        } catch (error) {
            socket.emit('error', { 
                message: 'Failed to stop server', 
                error: error.message 
            });
        }
    });

    // Handle command execution
    socket.on('executeCommand', (data) => {
        try {
            const { serverName, command } = data;
            const server = mcServers.get(serverName);
            
            if (!server) {
                socket.emit('error', { message: 'Server not found' });
                return;
            }

            // Broadcast command to all players
            server.broadcast(command);
            socket.emit('commandExecuted', { 
                serverName, 
                command 
            });

        } catch (error) {
            socket.emit('error', { 
                message: 'Failed to execute command', 
                error: error.message 
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Create the frontend interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
server.listen(PORT, () => {
    console.log(`MCP Server running on port ${PORT}`);
}); 