class Websocket {
    connections = [];

    constructor() {
        this.addConnection = this.addConnection.bind(this);
        this.onMessage = this.onMessage.bind(this)
    }


    addConnection(ws){
        if(!this.connections.includes(ws)){
            this.connections.push(ws)
        }
    }

    onMessage(ws){
        return function(msg) {
            this.connections.forEach(arrWs => {
                if (arrWs === ws) return;
                arrWs.send(msg)
            })
        }.bind(this)
    }
}
module.exports = new Websocket()