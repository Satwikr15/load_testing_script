import http from 'k6/http';
import {check} from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { SharedArray } from 'k6/data';

const queries = new SharedArray('queries', function () {
    return open('./Queries_Karl.csv')
        .split('\n');
        //.slice(1) // Remove header
        //.map(line => line.replace(/"/g, '')); // Remove quotes
});

export let options={
	vus:20,
	duration: '5m',
};

export default function(){
	let sessionPayload = JSON.stringify({
        "DB_USER": "di_import_repo",
        "DB_PASSWORD": "di_import_repo",
        "DB_HOST": "flip-docker.czqedzsxbtog.ap-south-2.rds.amazonaws.com",
        "DB_PORT": "5432",
        "DB_NAME": "di-import-repo",
        "SCHEMAS": ["report_ai"],
        "DB_TYPE": "Postgres"
    });
	
	let params={
		headers: {'content-type':'application/json'},
	};
	
	let sessionRes=http.post('https://sit-reportai.flipnow.cloud/reportai/api/startSession', sessionPayload, params);
	
	check(sessionRes, {
        'Session API response is 200': (res) => res.status === 200,
        //'Session ID received': (res) => res.json().SESSION_ID !== undefined,
    });
	
	let sessionId=sessionRes.json().SESSION_ID;
	
	let extractionPayload=JSON.stringify({
		"DB_USER": "di_import_repo",
        "DB_PASSWORD": "di_import_repo",
        "DB_HOST": "flip-docker.czqedzsxbtog.ap-south-2.rds.amazonaws.com",
        "DB_PORT": "5432",
        "DB_NAME": "di-import-repo",
        "SCHEMAS": ["report_ai"],
        "DB_TYPE": "Postgres",
        "QUERY": "Extract the details of all shipments shipped in 2014 to 2016",
        "SESSION_ID": sessionId
	});
	
	let extractionRes=http.post('https://sit-reportai.flipnow.cloud/reportai/api/getExtraction', extractionPayload, params);
	
	check(extractionRes, {
        'Extraction API response is 200': (res) => res.status === 200,
    });

	const query = queries[Math.floor(Math.random() * queries.length)];

	let queryPayload = JSON.stringify({
        "SESSION_ID": sessionId,
        "QUERY": query
    });

	let queryRes=http.post('https://sit-reportai.flipnow.cloud/reportai/api/getResponse', queryPayload, params);
	check(queryRes, {
        'Query API response is 200': (res) => res.status === 200,
    });
}


export function handleSummary(data) {
    return {
        "summary_karl20.html": htmlReport(data),
    };
}
