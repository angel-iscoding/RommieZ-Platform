export default async function useFetch(url, method, data) {
    try {
        const options = {
            method: method,
            headers: {
                "Content-Type": "aplication/json"
            },
        }; 
        
        if (method !== "GET" && data) {            
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new error("Has ocurred an error in the fetch");
        }

        const result = await response.json();

        if (method === "GET") {
            if (!result || result.length === 0) {
                return null;
            }
            
            if (result.length === 1) {
                return result[0];
            }
            
            return result
        }

        return result;
    } catch (error) {
        console.log("Error: " + error);
        return null
    }
}
