// Aqui está o código completo e funcional para um sistema de pagamento com cartão de crédito/débito (Stripe) e Pix (Mercado Pago).

// passo 1 Crie um arquivo chamado server.js e cole o código abaixo:


require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const mercadopago = require("mercadopago");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configurar Mercado Pago
mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN
});

// Pagamento com cartão via Stripe
app.post("/pagar-cartao", async (req, res) => {
    try {
        const { amount, token } = req.body;

        const charge = await stripe.charges.create({
            amount: amount * 100, // Stripe usa centavos
            currency: "brl",
            source: token,
            description: "Pagamento no seu site",
        });

        res.json({ success: true, charge });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Pagamento via Pix com Mercado Pago
app.post("/pagar-pix", async (req, res) => {
    try {
        const { amount, email } = req.body;

        const payment_data = {
            transaction_amount: amount,
            payment_method_id: "pix",
            payer: { email: email }
        };

        const response = await mercadopago.payment.create(payment_data);

        res.json({
            success: true,
            qr_code_base64: response.body.point_of_interaction.transaction_data.qr_code_base64,
            status: response.body.status
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Webhook para confirmar pagamento Pix
app.post("/webhook", async (req, res) => {
    console.log("Recebido webhook: ", req.body);
    res.sendStatus(200); // Apenas confirma que recebeu
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));