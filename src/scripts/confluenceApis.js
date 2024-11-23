//write a js function to get the content body of a page in confluence

export async function fetchConfluenceContent() {
    console.log('--------Fetching content from Confluence');
    const url = 'http://127.0.0.1:5000/confluence/search?query=OpenAI';

    const res = await fetch(url)
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json()
    console.log('3333333-------- Response data:', data);
    return data;

}

