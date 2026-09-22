const heartbeat = 250
self.setInterval(() => self.postMessage(Date.now()), heartbeat)