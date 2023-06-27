require('dotenv').config();
const gtmetrix = require ('gtmetrix') ({
    email: process.env.EMAIL,
    apikey: process.env.GTMETRIX_API_KEY,
});

const pageSpeedApiKey = process.env.PAGESPEED_API_KEY;
const gtmetrixApiKey = process.env.GTMETRIX_API_KEY;


function printPerformanceScoreWithPageSpeedAPI(url){
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${pageSpeedApiKey}`;
    fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
        console.log(`PageSpeed performance score: ${data.lighthouseResult.categories.performance.score}`);
    })
    .catch((error) => {
        console.error('Error:', error);
        return null;
    });
}

async function getPerformanceScoreWithPageSpeedAPI(url){
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${pageSpeedApiKey}`;
    let response = await fetch(apiUrl);
    let json = await response.json();
    let result = json.lighthouseResult.categories.performance.score;
    return result;
}

function printPerformanceScoreWithGTmetrixAPI(url){// GTmetrix REST API v0.1
    const params = {
        url: url,
        location: 2,
        browser: 3
    };
    gtmetrix.test.create(params, (err,data)=>{

        if(err){
            console.log(err);
            return;
        }
        gtmetrix.test.get (data.test_id, 5000, (err,data)=>{
            if(err){
                console.log(err);
                return;
            }
            if(data.state==='completed'){
                console.log(`GTmetrix performance score: ${data.results.pagespeed_score}`);
                return;
            }
        });
    });
}

async function getTestId(url){ // GTmetrix REST API v2.0

    const apiUrl = 'https://gtmetrix.com/api/2.0/tests';

    const requestOptions = {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${Buffer.from(gtmetrixApiKey).toString('base64')}`,
            'Content-Type': 'application/vnd.api+json',
        },
        body: JSON.stringify({
            data: {
                type: 'test',
                attributes: {
                    url: url,
                    location: '2',
                    browser: '3',
                },
            },
        }),
    };
    
    let response = await fetch(apiUrl, requestOptions);
    let json = await response.json();
    console.error('id:', json.data.id);
    return json.data.id;
}

async function getPerformanceScoreWithGTmetrixAPI(testId) {
    const apiUrl = `https://gtmetrix.com/api/2.0/tests/${testId}`;
    
        const requestOptions = {
        headers: {
            'Authorization': `Basic ${Buffer.from(gtmetrixApiKey).toString('base64')}`,
            'Content-Type': 'application/vnd.api+json',
        },
        };
    
        try {
            while (true) {
                const response = await fetch(apiUrl, requestOptions);
                const data = await response.json();
                console.log(`state: ${data.data.attributes.state}`);

                if (data.data.attributes.performance_score) {
                    return data.data.attributes.performance_score;
                }
        
                if (!data.data.attributes.performance_score) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
}


printPerformanceScoreWithPageSpeedAPI("https://uakino.club");

getPerformanceScoreWithPageSpeedAPI("https://uakino.club")
.then(result=>{
    console.log(`PageSpeed performance score ${result}`);
});

printPerformanceScoreWithGTmetrixAPI("https://uakino.club");

getTestId("https://uakino.club")
.then(testId=>{
    getPerformanceScoreWithGTmetrixAPI(testId)
    .then(result=>{
        console.log(`GTmetrix performance score ${result}`);
    })
});



