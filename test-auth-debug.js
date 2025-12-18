// Script de diagnóstico para probar la autenticación
const testData = {
    name: "Juan Peres",
    email: "juan2@gmail.com",
    password: "password123"
};

console.log('Probando registro con datos:', {
    name: testData.name,
    email: testData.email,
    password: '********'
});

// Test registro
fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testData)
})
    .then(res => {
        console.log('Status del registro:', res.status);
        return res.json();
    })
    .then(data => {
        console.log('Respuesta del registro:', data);
        if (data.error) {
            console.error('ERROR DE REGISTRO:', data.error);
        } else {
            console.log('✓ Registro exitoso');

            // Test login
            console.log('\nProbando login...');
            return fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testData.email,
                    password: testData.password
                })
            });
        }
    })
    .then(res => {
        if (res) {
            console.log('Status del login:', res.status);
            return res.json();
        }
    })
    .then(data => {
        if (data) {
            console.log('Respuesta del login:', data);
            if (data.error) {
                console.error('ERROR DE LOGIN:', data.error);
            } else {
                console.log('✓ Login exitoso');
                console.log('Token:', data.token);
            }
        }
    })
    .catch(err => {
        console.error('ERROR DE CONEXIÓN:', err);
    });
