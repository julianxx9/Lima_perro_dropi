const fetch = require('node-fetch');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Método no permitido' }) };
    }

    try {
        const data = JSON.parse(event.body);
        const { name, surname, state, city, address, phone } = data;

        if (!name || !surname || !state || !city || !address || !phone) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Faltan datos en el formulario.' }) };
        }

        const DROPI_API_TOKEN = process.env.DROPI_API_TOKEN;
        if (!DROPI_API_TOKEN) {
            throw new Error('El token de la API de Dropi no está configurado en el servidor.');
        }

        // --- VALORES CONFIGURABLES ---
        // ID del producto que se está vendiendo.
        const PRODUCT_ID = 612976;
        // Precio del producto. El total de la orden se basa en este precio.
        const PRODUCT_PRICE = 35000; 
        const TOTAL_ORDER = 35000;
        // Email de placeholder, ya que no lo pedimos en el form.
        const CLIENT_EMAIL = "cliente@example.com";
        // Tipo de cobro. Puede ser "CON RECAUDO" o "SIN RECAUDO".
        const RATE_TYPE = "CON RECAUDO";
        // --------------------------

        const dropiPayload = {
            state: state.toUpperCase(),
            city: city.toUpperCase(),
            client_email: CLIENT_EMAIL,
            name: name,
            surname: surname,
            dir: address,
            notes: "Pedido desde formulario web",
            payment_method_id: 1,
            phone: phone,
            rate_type: RATE_TYPE,
            type: "FINAL_ORDER",
            total_order: TOTAL_ORDER,
            products: [
                {
                    id: PRODUCT_ID,
                    price: PRODUCT_PRICE,
                    variation_id: null,
                    quantity: 1
                }
            ]
        };

        const dropiApiUrl = 'https://api.dropi.co/api/orders/myorders';

        const response = await fetch(dropiApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DROPI_API_TOKEN}`,
            },
            body: JSON.stringify(dropiPayload),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error de la API de Dropi:', errorBody);
            throw new Error('El servicio de envío no está disponible en este momento.');
        }

        const responseData = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: 'Pedido creado exitosamente', 
                orderId: responseData.id
            }),
        };

    } catch (error) {
        console.error('Error en la función serverless:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message || 'Ocurrió un error interno.' }),
        };
    }
};