const API_KEY = "AIzaSyDSS1tC9xS_uX2nw-kBqqpuRIYnHkj7y1A";

export interface PlaceResult {
  id: string;
  name: string;
  rating: number;
  userRatingsTotal: number;
  photoUrl: string | null;
  openNow: boolean | null;
  openingHours: string[];
  address: string;
}

function getPhotoUrl(photoReference: string, maxWidth = 400): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${API_KEY}`;
}

export async function searchPlaces(query: string, maxResults = 16): Promise<PlaceResult[]> {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Places API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.status === "ZERO_RESULTS" || !data.results) {
    return [];
  }

  if (data.status !== "OK") {
    throw new Error(`Places API error: ${data.status} - ${data.error_message || ""}`);
  }

  return data.results.slice(0, maxResults).map((place: any) => {
    let photoUrl: string | null = null;
    if (place.photos && place.photos.length > 0) {
      photoUrl = getPhotoUrl(place.photos[0].photo_reference);
    }

    return {
      id: place.place_id || Math.random().toString(36),
      name: place.name || "Unknown",
      rating: place.rating || 0,
      userRatingsTotal: place.user_ratings_total || 0,
      photoUrl,
      openNow: place.opening_hours?.open_now ?? null,
      openingHours: [],
      address: place.formatted_address || "",
    };
  });
}
