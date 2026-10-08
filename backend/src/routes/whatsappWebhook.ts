import express from 'express';
import whatsappService from '../services/whatsappService';
import whatsappWebhookHandler from '../services/whatsappWebhookHandler';

const router = express.Router();

/**
 * @route   GET /api/whatsapp/webhook
 * @desc    Webhook verification (Meta handshake)
 * @access  Public
 */
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('✅ Webhook verified successfully');
      res.status(200).send(challenge);
    } else {
      console.error('❌ Webhook verification failed - token mismatch');
      res.sendStatus(403);
    }
  } else {
    console.error('❌ Webhook verification failed - missing parameters');
    res.sendStatus(400);
  }
});

/**
 * @route   POST /api/whatsapp/webhook
 * @desc    Receive WhatsApp webhook events
 * @access  Public (but verified via signature)
 */
router.post('/', async (req, res) => {
  try {
    // Immediately respond 200 to Meta (required by WhatsApp API)
    res.sendStatus(200);

    const signature = req.headers['x-hub-signature-256'] as string;
    const rawBody = JSON.stringify(req.body);

    // Verify signature
    if (process.env.WHATSAPP_MODE !== 'mock') {
      if (!signature) {
        console.error('Missing X-Hub-Signature-256 header');
        return;
      }

      const isValid = whatsappService.verifyWebhookSignature(signature, rawBody);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return;
      }
    }

    console.log('📥 Received WhatsApp webhook event');

    // Process webhook asynchronously
    setImmediate(async () => {
      try {
        await whatsappWebhookHandler.processWebhookEvent(req.body);
      } catch (error) {
        console.error('Webhook processing error:', error);
      }
    });

  } catch (error: any) {
    console.error('Webhook endpoint error:', error);
    // Don't send error response - already sent 200
  }
});

export default router;
