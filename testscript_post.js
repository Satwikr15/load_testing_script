import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

export let options = {
    vus: 5, 
    duration: '120s',	
};

//connection of csv file
const csvData = new SharedArray('Queries', function() {
  return open('./queries_Text.csv').split('\n').map(row => row.split(','));
});

export default function () {
    let loginUrl = 'https://sit.flipnow.cloud/api/login'; // Login API
    let payload = JSON.stringify({
        username: 'load_test_user169@kanerika.com', 
        password: 'ec6d853d41bf4f1'
    });

    let params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Step 1: Login Request
    let loginResponse = http.post(loginUrl, payload, params);

    // extracting Auth Token
    let authToken = loginResponse.json('accessToken');

    check(loginResponse, {
        'Login successful (200)': (r) => r.status === 200,
        'Token received': () => authToken !== undefined,
    });
	
	//console.log('Parsed JSON:', JSON.stringify(loginResponse.timings));  


    // If login fails, exit
    if (!authToken) {
        console.log('Login failed! No token received.');
        return;
    }

    // Set Headers for Authenticated Requests
    let authHeaders = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ${authToken}', // Send token in headers
        },
		timeout: '180s',
    };

    // Step 2: Hit AI Models API
    let aiModelsResponse = http.get('https://sit.flipnow.cloud/api/aiWorkbench/getAIModels', authHeaders);

    check(aiModelsResponse, {
        'AI Models API success (200)': (r) => r.status === 200,
    });
	
	//console.log('aiModelsResponse JSON:', JSON.stringify(aiModelsResponse.timings));  


    // Step 3: Hit Document Copilot API
	
	let randomIndex=Math.floor(Math.random()*csvData.length);
	let queryText=csvData[randomIndex][0];
	//or
	//for(int i=0;i<csvData.length;i++){
	//	let queryText=csvData[i][0];
	//	console.log(Query ${i + 1}: ${queryText});
	//}
	
	
	let queryload = JSON.stringify({
        conMod: "High",
	llm: "OpenAI GPT4",
	query: queryText,
    });
	
    const docCopilotResponse = http.post('https://sit-ai-workbench.flipnow.cloud/document-copilot/api/getResponse', queryload, authHeaders);

    check(docCopilotResponse, {
        'Document Copilot API success (200)': (r) => r.status === 200,
    });

    console.log(`Document Copilot Response Time: ${JSON.stringify(docCopilotResponse.timings)} ms`);

    sleep(1); 
}