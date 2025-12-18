// Test script to verify URL scanner endpoint
const testURL = async () => {
    try {
        const response = await fetch('http://localhost:3001/api/scanner/url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: 'https://www.google.com',
                fullAnalysis: true
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
};

testURL();
