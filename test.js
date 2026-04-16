const fs = require('fs');
async function run() {
    try {
        const res = await fetch('http://localhost:5000/api/interview/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({topic: 'JavaScript', difficulty: 'intermediate', count: 1})
        });
        const data = await res.json();
        fs.writeFileSync('err.json', JSON.stringify(data, null, 2));
        console.log('done');
    } catch (err) {
        console.error('Fetch error:', err);
    }
}
run();
