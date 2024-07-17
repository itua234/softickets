const crypto = require('crypto');

module.exports = {
    verifyPaystackSignature: (req, res, next) => {
        if (!req.headers['x-paystack-signature']) {
            return res.status(403).send('Missing x-paystack-signature header');
        }
    
        const input = JSON.stringify(req.body);
        const secret = process.env.PAYSTACK_SECRET || '';
        const hash = crypto.createHmac('sha512', secret).update(input).digest('hex');
    
        if (req.headers['x-paystack-signature'] !== hash) {
            return res.status(403).send('Invalid x-paystack-signature header');
        }
        
        next();
    }
}