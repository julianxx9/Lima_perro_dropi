// Esta es la función que se ejecuta en el backend de Netlify
// No te preocupes por instalar paquetes, Netlify maneja `node-fetch`.
const fetch = require('node-fetch');

exports.handler = async (event) => {
    // 1. Validar que la petición sea POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Método no permitido' }),
        };
    }

    try {
        // 2. Obtener los datos del formulario que envió el script.js
        const data = JSON.parse(event.body);
        const { fullName, phone, address } = data;

        // 3. Validar que los datos básicos estén presentes
        if (!fullName || !phone || !address) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Faltan datos en el formulario.' }),
            };
        }

        // 4. Obtener el Token de la API de Dropi desde las variables de entorno de Netlify
        // ¡NUNCA PONGAS EL TOKEN DIRECTAMENTE EN EL CÓDIGO!
        const DROPI_API_TOKEN = process.env.DROPI_API_TOKEN;
        if (!DROPI_API_TOKEN) {
            throw new Error('El token de la API de Dropi no está configurado en el servidor.');
        }

        // 5. Definir el ID del producto que nos indicaste
        const PRODUCT_ID = '612976';

        // 6. Construir el cuerpo de la petición para la API de Dropi
        // **IMPORTANTE**: Esta estructura es una suposición. Debes validarla
        // con la documentación oficial de la API de Dropi.
        const dropiPayload = {
            customer: {
                name: fullName,
                phone: phone,
                address: address,
            },
            items: [
                {
                    productId: PRODUCT_ID,
                    quantity: 1,
                },
            ],
            // Aquí podrían ir otros campos que Dropi requiera, como:
            // source: 'Netlify Form',
            // payment_method: 'cash_on_delivery'
        };

        // 7. Realizar la llamada a la API de Dropi
        // **IMPORTANTE**: Se ha actualizado la URL base. La ruta exacta (/api/orders) 
        // debe ser confirmada con la documentación oficial de Dropi.
        const dropiApiUrl = 'https://app.dropi.co/api/orders';

        const response = await fetch(dropiApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Así es como se suelen enviar los tokens de autorización
                'Authorization': `Bearer ${DROPI_API_TOKEN}`,
            },
            body: JSON.stringify(dropiPayload),
        });

        // 8. Manejar la respuesta de Dropi
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error de la API de Dropi:', errorBody);
            throw new Error('El servicio de envío no está disponible en este momento.');
        }

        const responseData = await response.json();

        // 9. Enviar una respuesta de éxito al frontend
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: 'Pedido creado exitosamente', 
                orderId: responseData.id // Suponiendo que Dropi devuelve un ID
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