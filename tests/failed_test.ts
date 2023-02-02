import net from 'net'

const netSocket = new net.Socket();
netSocket.connect(18018, '0.0.0.0');
//netSocket.connect(18018, '45.77.189.227'); //(not local)
netSocket.write('{"agent":"Grader 1","type":"hello","version":"0.9.0"}\n');

//invalid block coinbase
netSocket.write('{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671499512,"miner":"grader","nonce":"400000000000000000000000000000000000000000000000000000003ba510f9","note":"This block has a transaction spending the coinbase","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":["85b72002ffacb4f5e309b772098ba02391df90803c1c814c45cff8053f4e16ff","e2095e1c75a0950c1d699287b15ba976ba39c8d0989c4c6c2457c38a9bb6330c"],"type":"block"},"type":"object"}\n');

//Invalid tx outpoint
//netSocket.write('{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671499512,"miner":"grader","nonce":"400000000000000000000000000000000000000000000000000000003ba510f9","note":"This block has a transaction spending the coinbase","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":["85b72002ffacb4f5e309b772098ba02391df90803c1c814c45cff8053f4e16ff","e2095e1c75a0950c1d699287b15ba976ba39c8d0989c4c6c2457c38a9bb6330c"],"type":"block"},"type":"object"}\n');


//netSocket.on('data',(data: Buffer) => console.log(data.toString()));

netSocket.write('{ "type": "getpeers" }\n');