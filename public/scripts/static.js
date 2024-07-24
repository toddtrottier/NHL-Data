document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded");
    document.querySelectorAll('.grid-item a img').forEach(image => {
        image.addEventListener('click', async (event) => {
            event.preventDefault();
            const abv = image.getAttribute('data-id');
            console.log("Team abv from event listener: " + abv);
    
            try {
                const response = await fetch('/schedule', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({abv})
                });
    
                const result = await response.json();
                console.log(result.message);
            } catch (error) {
                console.error('Error: ', error);
            }
        });
    });
})
