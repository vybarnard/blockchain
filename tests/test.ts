import net from 'net'

const netSocket = new net.Socket();
netSocket.connect(18018, '0.0.0.0');
//netSocket.connect(18018, '45.77.189.227'); //(not local)
netSocket.write('{ "type": "hello","version": "0.9.0","agent": "Marabu-Core Client 0.9"}\n');
netSocket.on('data',(data: Buffer) => console.log(data.toString()));

netSocket.write('{ "type": "getpeers" }\n');