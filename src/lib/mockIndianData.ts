export interface ServiceProvider {
  id: string;
  name: string;
  phone: string;
  rating: number;
  reviewCount: number;
  address: string;
  imageUrl: string;
  openNow: boolean;
}

const indianFirstNames = [
  "Rajesh", "Amit", "Sunil", "Priya", "Deepak", "Anita", "Vikram", "Pooja",
  "Manoj", "Kavita", "Ravi", "Sunita", "Arun", "Meena", "Sanjay", "Neha",
  "Prakash", "Rekha", "Ashok", "Swati", "Mukesh", "Geeta", "Dinesh", "Asha",
  "Ramesh", "Seema", "Vijay", "Anjali", "Suresh", "Nisha", "Harish", "Komal",
];

const indianLastNames = [
  "Sharma", "Verma", "Gupta", "Singh", "Patel", "Kumar", "Joshi", "Mishra",
  "Yadav", "Chauhan", "Agarwal", "Reddy", "Nair", "Iyer", "Mehta", "Shah",
  "Das", "Bose", "Sen", "Pillai", "Rao", "Kulkarni", "Deshmukh", "Pandey",
];

const bhilaiDurgAreas = [
  "Nehru Nagar, Bhilai", "Supela, Bhilai", "Junwani, Bhilai", "Civic Centre, Bhilai",
  "Sector 1, Bhilai", "Sector 2, Bhilai", "Sector 4, Bhilai", "Sector 6, Bhilai",
  "Sector 7, Bhilai", "Sector 9, Bhilai", "Sector 10, Bhilai", "Khursipar, Bhilai",
  "Risali, Bhilai", "Charoda, Bhilai", "Kumhari, Durg", "Padmanabhpur, Durg",
  "Station Road, Durg", "Malviya Nagar, Durg", "Pulgaon, Durg", "Power House, Durg",
  "Smriti Nagar, Bhilai", "Ruabandha, Bhilai", "Kohka, Bhilai", "Maroda, Bhilai",
  "Housing Board Colony, Durg", "Camp 1, Bhilai", "Camp 2, Bhilai", "Vaishali Nagar, Durg",
  "Shastri Nagar, Durg", "Rajendra Nagar, Durg", "Indira Place, Bhilai", "Old Bhilai",
];

const serviceImageMap: Record<string, string[]> = {
  "Home Services": [
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop",
  ],
  "Vehicle Services": [
    "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop",
  ],
  "Health Services": [
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=300&fit=crop",
  ],
  "Spa & Wellness": [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=400&h=300&fit=crop",
  ],
  "Appointments": [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
  ],
  "Finance Services": [
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1553729459-afe8f2e2ed65?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=400&h=300&fit=crop",
  ],
  "Travel & Emergency": [
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
  ],
};

const defaultImages = [
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhone(): string {
  const prefixes = ["98", "97", "96", "95", "94", "93", "91", "90", "88", "87", "86", "85", "70", "73", "74", "75", "76", "77", "78", "79"];
  const prefix = randomFrom(prefixes);
  const rest = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join("");
  return `+91 ${prefix}${rest.slice(0, 4)} ${rest.slice(4)}`;
}

function generateRating(): { rating: number; reviewCount: number } {
  const rating = Math.round((3 + Math.random() * 2) * 10) / 10; // 3.0 - 5.0
  const reviewCount = Math.floor(50 + Math.random() * 950); // 50-999
  return { rating, reviewCount };
}

export function generateProviders(serviceLabel: string, categoryTitle: string, count = 16): ServiceProvider[] {
  const images = serviceImageMap[categoryTitle] || defaultImages;

  const usedNames = new Set<string>();
  const providers: ServiceProvider[] = [];

  for (let i = 0; i < count; i++) {
    let name: string;
    do {
      const first = randomFrom(indianFirstNames);
      const last = randomFrom(indianLastNames);
      name = `${first} ${last} ${serviceLabel}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    const area = randomFrom(bhilaiDurgAreas);
    const { rating, reviewCount } = generateRating();

    providers.push({
      id: `mock_${i}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      phone: generatePhone(),
      rating,
      reviewCount,
      address: `${Math.floor(1 + Math.random() * 200)}, ${area}`,
      imageUrl: images[i % images.length],
      openNow: Math.random() > 0.3,
    });
  }

  return providers;
}
