
export async function searchConfluence(searchText) {
    console.log(' ============== searchConfluence ');
    const res = await fetch(import.meta.env.VITE_DOCUAI_BACKEND_SERVER_URL + '/search?query='+searchText)
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json()
    return data;
}

export async function getConfluencePageContent() {
    const res = await fetch(import.meta.env.VITE_DOCUAI_BACKEND_SERVER_URL + '/page/622594')
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json()
    console.log('4444 getConfluencePageContent ==============  ', data);
    return data;
}