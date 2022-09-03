interface Page {
  pageid: number;
  ns: number;
  title: string;
  exctract: string;
}

interface PageCollection {
  [pageId: number]: Page
}

interface WikiResponse {
  query: PageCollection
}

export function getExtract(name: string, callback: (extract: string) => void): void {
  const encoded = encodeURIComponent(name);
  const url = `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${encoded}`;
  fetch(url)
    .then((res) => {
      if (res.ok) {
        return res.json() as unknown as WikiResponse;
      }
      throw new Error(`Could not load summary for ${name}`);
    })
    .then((data) => {
      Object.values(data).map(({ extract }) => callback(extract));
    })
    .catch((err) => console.warn(err));
}
