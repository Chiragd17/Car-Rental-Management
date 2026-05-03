import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const token = process.env.SUPABASE_ANON_KEY;
const secret = process.env.SUPABASE_JWT_SECRET;

console.log('Token:', token ? 'Exists' : 'Missing');
console.log('Secret:', secret ? 'Exists' : 'Missing');

if (token && secret) {
    try {
        const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
        console.log('✅ Verification successful!');
        console.log('Decoded Payload:', decoded);
    } catch (err) {
        console.log('❌ Verification failed:', err.message);
        
        // Try decoding secret as base64
        try {
            const decodedSecret = Buffer.from(secret, 'base64');
            const decoded2 = jwt.verify(token, decodedSecret, { algorithms: ['HS256'] });
            console.log('✅ Verification successful with Base64 decoded secret!');
            console.log('Decoded Payload:', decoded2);
        } catch (err2) {
            console.log('❌ Verification also failed with Base64 decoded secret:', err2.message);
        }
    }
}
