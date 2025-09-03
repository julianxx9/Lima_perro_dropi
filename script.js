document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('order-form');
    const messageDiv = document.getElementById('form-message');
    const submitButton = document.getElementById('submit-button');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Procesando...';
        messageDiv.textContent = '';
        messageDiv.className = '';

        const formData = {
            name: form.name.value,
            surname: form.surname.value,
            state: form.state.value,
            city: form.city.value,
            address: form.address.value,
            phone: form.phone.value,
        };

        try {
            const response = await fetch('/.netlify/functions/submit-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Hubo un error al enviar el pedido.');
            }

            messageDiv.textContent = '¡Pedido realizado con éxito! Gracias por tu compra.';
            messageDiv.classList.add('success');
            form.reset();

        } catch (error) {
            messageDiv.textContent = error.message;
            messageDiv.classList.add('error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Finalizar Pedido';
        }
    });
});