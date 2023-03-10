import * as ed from '@noble/ed25519';

async function main(){
    const sk = ed.utils.randomPrivateKey();
    const pk =  await ed.getPublicKey(sk);

    console.log(`Secret key: ${Buffer.from(sk).toString('hex')}`);
    console.log(`Public key: ${Buffer.from(pk).toString('hex')}`);
}

main()

